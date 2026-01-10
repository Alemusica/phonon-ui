/**
 * Phonon UI - useVideoBackground Hook
 *
 * Manages fullscreen video background with DNA-based audio hierarchy.
 *
 * DNA Audio Principle (Last Audio Wins):
 * In nature, when multiple signals compete (bird calls, wind, rain), the one with
 * highest priority dominates perception. Other sounds are "ducked" (volume reduced).
 * This hook implements the same principle: register audio sources with priority levels,
 * and the system automatically manages volume ducking based on hierarchy.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Audio source with priority and volume tracking
 */
export interface AudioSource {
  id: string;
  priority: number;
  volume: number;
  element?: HTMLAudioElement;
}

/**
 * Video background state
 */
export interface VideoBackgroundState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isMuted: boolean;
}

/**
 * Return type for useVideoBackground hook
 */
export interface UseVideoBackgroundReturn {
  // State
  state: VideoBackgroundState;
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;

  // Video controls
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;

  // Audio hierarchy (DNA principle)
  audioSources: Map<string, AudioSource>;
  registerAudio: (id: string, priority: number, element?: HTMLAudioElement) => void;
  unregisterAudio: (id: string) => void;
  updateAudioPriority: (id: string, priority: number) => void;

  // Utilities
  setCurrentTime: (time: number) => void;
  getHighestPriorityAudio: () => AudioSource | null;
  getDuckedVolume: (audioId: string) => number;
}

/**
 * Constants for audio ducking
 */
const AUDIO_DUCK_RATIO = 0.3; // Non-dominant audio gets 30% volume
// Future: const AUDIO_TRANSITION_DURATION = 200; // ms to transition volume changes

/**
 * Hook for managing fullscreen video background with DNA-based audio hierarchy
 *
 * @param videoSrc - URL of the video file
 * @param initialVolume - Initial volume (0-1), default 0.7
 * @param initiallyMuted - Whether to start muted, default false
 * @returns Object with state, controls, and audio hierarchy management
 *
 * @example
 * ```tsx
 * const { state, play, pause, registerAudio, getDuckedVolume } = useVideoBackground(
 *   'https://example.com/bg.mp4',
 *   0.8
 * );
 *
 * // Register a chat audio source with high priority
 * registerAudio('chat-voice', 100, audioElement);
 *
 * // Get volume for ambient sound (will be ducked if chat is speaking)
 * const ambientVolume = getDuckedVolume('ambient');
 * ```
 */
export function useVideoBackground(
  videoSrc: string,
  initialVolume: number = 0.7,
  initiallyMuted: boolean = false
): UseVideoBackgroundReturn {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Audio hierarchy (DNA: last audio wins)
  const audioSourcesRef = useRef<Map<string, AudioSource>>(new Map());

  // State
  const [state, setState] = useState<VideoBackgroundState>({
    isPlaying: false,
    volume: Math.max(0, Math.min(1, initialVolume)), // Clamp 0-1
    currentTime: 0,
    duration: 0,
    isMuted: initiallyMuted,
  });

  /**
   * Update video element volume based on state and audio hierarchy
   */
  const updateVideoVolume = useCallback(() => {
    if (!videoRef.current) return;

    const baseVolume = state.isMuted ? 0 : state.volume;

    // Check if any high-priority audio is playing
    const highestPriority = Array.from(audioSourcesRef.current.values())
      .reduce((max, audio) => (audio.priority > max.priority ? audio : max),
        { priority: -1 } as AudioSource);

    // If there's high-priority audio, duck the video
    if (highestPriority.priority > 0) {
      videoRef.current.volume = baseVolume * AUDIO_DUCK_RATIO;
    } else {
      videoRef.current.volume = baseVolume;
    }
  }, [state.isMuted, state.volume]);

  /**
   * Play video
   */
  const play = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.play().catch(() => {
      // Autoplay may be blocked by browser
    });
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  /**
   * Pause video
   */
  const pause = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  /**
   * Set volume (0-1)
   */
  const setVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    setState(prev => ({ ...prev, volume: clamped, isMuted: clamped === 0 }));
  }, []);

  /**
   * Mute
   */
  const mute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: true }));
  }, []);

  /**
   * Unmute
   */
  const unmute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: false }));
  }, []);

  /**
   * Set current playback time
   */
  const setCurrentTime = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  }, []);

  /**
   * Register an audio source with priority
   * Higher priority = dominates the mix
   *
   * DNA Principle: The highest priority audio source gets full volume,
   * all others are ducked to AUDIO_DUCK_RATIO of their normal volume.
   */
  const registerAudio = useCallback((
    id: string,
    priority: number,
    element?: HTMLAudioElement
  ) => {
    audioSourcesRef.current.set(id, {
      id,
      priority,
      volume: 1,
      element,
    });
    updateVideoVolume();
  }, [updateVideoVolume]);

  /**
   * Unregister an audio source
   */
  const unregisterAudio = useCallback((id: string) => {
    audioSourcesRef.current.delete(id);
    updateVideoVolume();
  }, [updateVideoVolume]);

  /**
   * Update priority of existing audio source
   */
  const updateAudioPriority = useCallback((id: string, priority: number) => {
    const audio = audioSourcesRef.current.get(id);
    if (audio) {
      audio.priority = priority;
      updateVideoVolume();
    }
  }, [updateVideoVolume]);

  /**
   * Get the highest priority audio source
   */
  const getHighestPriorityAudio = useCallback((): AudioSource | null => {
    if (audioSourcesRef.current.size === 0) return null;

    return Array.from(audioSourcesRef.current.values())
      .reduce((max, audio) => (audio.priority > max.priority ? audio : max));
  }, []);

  /**
   * Get the ducked volume for a specific audio source
   * DNA Principle: If this audio is the highest priority, return 1.0 (full volume).
   * Otherwise return AUDIO_DUCK_RATIO.
   */
  const getDuckedVolume = useCallback((audioId: string): number => {
    const highest = getHighestPriorityAudio();
    if (!highest) return 1; // No priority audio, use normal volume

    return audioId === highest.id ? 1 : AUDIO_DUCK_RATIO;
  }, [getHighestPriorityAudio]);

  /**
   * Update video volume whenever state changes
   */
  useEffect(() => {
    updateVideoVolume();
  }, [state.isMuted, state.volume, updateVideoVolume]);

  /**
   * Setup video event listeners
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setState(prev => ({
        ...prev,
        currentTime: video.currentTime,
      }));
    };

    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: video.duration,
      }));
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  /**
   * Set video source
   */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = videoSrc;
    }
  }, [videoSrc]);

  return {
    state,
    videoRef,
    containerRef,
    play,
    pause,
    setVolume,
    mute,
    unmute,
    audioSources: audioSourcesRef.current,
    registerAudio,
    unregisterAudio,
    updateAudioPriority,
    setCurrentTime,
    getHighestPriorityAudio,
    getDuckedVolume,
  };
}
