import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  FC,
} from 'react';

/**
 * Audio priority hierarchy - last activated source wins.
 * DNA pattern: each activation updates the priority stack
 */
type AudioPriority = 'video' | 'music' | 'voice' | null;

/**
 * Current media playback state
 */
interface MediaState {
  // Video background
  videoUrl: string | null;
  videoPlaying: boolean;
  videoMuted: boolean;

  // Music/ambient
  musicTrack: string | null;
  musicPlaying: boolean;
  musicVolume: number;

  // Voice (LLM speech - highest priority)
  voicePlaying: boolean;
  voiceVolume: number;

  // Which audio source has priority (DNA: last wins)
  audioPriority: AudioPriority;
}

/**
 * Available media control actions
 */
interface MediaActions {
  /**
   * Set video background with optional audio track
   * Activates video audio priority if withAudio=true
   */
  setVideoBackground: (url: string, withAudio?: boolean) => void;

  /**
   * Clear video background and stop playback
   */
  clearVideoBackground: () => void;

  /**
   * Toggle video audio on/off
   * Updates priority if enabled
   */
  toggleVideoAudio: () => void;

  /**
   * Set music track for ambient playback
   * Activates music priority (ducks video audio)
   */
  setMusicTrack: (track: string) => void;

  /**
   * Stop music playback
   */
  stopMusic: () => void;

  /**
   * Control voice playback (LLM speech)
   * Highest priority - ducks all other audio
   */
  setVoicePlaying: (playing: boolean) => void;

  /**
   * Set volume for music (0-1)
   */
  setMusicVolume: (volume: number) => void;

  /**
   * Set volume for voice (0-1)
   */
  setVoiceVolume: (volume: number) => void;
}

type MediaContextType = MediaState & MediaActions;

const MediaContext = createContext<MediaContextType | null>(null);

/**
 * MediaProvider component
 * Manages global media state with DNA-based audio priority
 * Pattern: last audio source activated wins, others are ducked
 */
export const MediaProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Media state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  const [musicTrack, setMusicTrackState] = useState<string | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);

  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(1);

  const [audioPriority, setAudioPriority] = useState<AudioPriority>(null);

  /**
   * DNA Priority Logic: Update audio priority and duck lower-priority sources
   * Pattern: when a new source activates, it becomes priority
   * All other sources are muted/ducked
   */
  const updateAudioPriority = useCallback((newPriority: AudioPriority) => {
    setAudioPriority(newPriority);

    // DNA Audio Hierarchy: last audio wins
    // Music muting is derived from audioPriority state, not a separate flag
    if (newPriority === 'voice') {
      // Voice is highest priority - mute video (music stops playing)
      setVideoMuted(true);
      setMusicPlaying(false);
    } else if (newPriority === 'music') {
      // Music ducks video audio
      setVideoMuted(true);
    } else if (newPriority === 'video') {
      // Video plays normally, music stops
      setMusicPlaying(false);
      setVideoMuted(false);
    } else {
      // No priority - video unmuted
      setVideoMuted(false);
    }
  }, []);

  // Note: Music muting is controlled via audioPriority, not a separate state

  /**
   * Set video background with optional audio
   */
  const setVideoBackground = useCallback(
    (url: string, withAudio: boolean = false) => {
      setVideoUrl(url);
      setVideoPlaying(true);

      if (withAudio) {
        updateAudioPriority('video');
      } else {
        setVideoMuted(true);
      }
    },
    [updateAudioPriority]
  );

  /**
   * Clear video background
   */
  const clearVideoBackground = useCallback(() => {
    setVideoUrl(null);
    setVideoPlaying(false);
    setVideoMuted(false);

    // If video was priority, clear it
    if (audioPriority === 'video') {
      setAudioPriority(null);
    }
  }, [audioPriority]);

  /**
   * Toggle video audio - updates priority
   */
  const toggleVideoAudio = useCallback(() => {
    const newMutedState = !videoMuted;
    setVideoMuted(newMutedState);

    if (!newMutedState) {
      // Video audio unmuted - make it priority
      updateAudioPriority('video');
    } else if (audioPriority === 'video') {
      // Video audio muted - clear priority
      setAudioPriority(null);
    }
  }, [videoMuted, audioPriority, updateAudioPriority]);

  /**
   * Set music track - activates music priority
   * DNA pattern: music activation ducks video audio
   */
  const setMusicTrack = useCallback(
    (track: string) => {
      setMusicTrackState(track);
      setMusicPlaying(true);
      updateAudioPriority('music');
    },
    [updateAudioPriority]
  );

  /**
   * Stop music playback
   */
  const stopMusic = useCallback(() => {
    setMusicTrackState(null);
    setMusicPlaying(false);

    if (audioPriority === 'music') {
      setAudioPriority(null);
    }
  }, [audioPriority]);

  /**
   * Set voice playback state
   * DNA pattern: voice is highest priority, ducks all other audio
   */
  const setVoicePlayingCallback = useCallback(
    (playing: boolean) => {
      setVoicePlaying(playing);

      if (playing) {
        // Voice starts - highest priority
        updateAudioPriority('voice');
      } else if (audioPriority === 'voice') {
        // Voice stopped - check what else is playing
        if (musicPlaying) {
          updateAudioPriority('music');
        } else if (videoPlaying && !videoMuted) {
          updateAudioPriority('video');
        } else {
          setAudioPriority(null);
        }
      }
    },
    [audioPriority, musicPlaying, videoPlaying, videoMuted, updateAudioPriority]
  );

  /**
   * Set music volume (0-1)
   */
  const setMusicVolumeCallback = useCallback((volume: number) => {
    setMusicVolume(Math.max(0, Math.min(1, volume)));
  }, []);

  /**
   * Set voice volume (0-1)
   */
  const setVoiceVolumeCallback = useCallback((volume: number) => {
    setVoiceVolume(Math.max(0, Math.min(1, volume)));
  }, []);

  const value: MediaContextType = {
    // State
    videoUrl,
    videoPlaying,
    videoMuted,
    musicTrack,
    musicPlaying,
    musicVolume,
    voicePlaying,
    voiceVolume,
    audioPriority,

    // Actions
    setVideoBackground,
    clearVideoBackground,
    toggleVideoAudio,
    setMusicTrack,
    stopMusic,
    setVoicePlaying: setVoicePlayingCallback,
    setMusicVolume: setMusicVolumeCallback,
    setVoiceVolume: setVoiceVolumeCallback,
  };

  return (
    <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
  );
};

/**
 * Hook to access media context
 * Must be used within MediaProvider
 * @throws Error if used outside MediaProvider
 * @returns Media state and actions
 */
export function useMedia(): MediaContextType {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within MediaProvider');
  }
  return context;
}
