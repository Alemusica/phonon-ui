/**
 * Phonon UI - BackgroundPlayer Component
 *
 * Audio/video player with minimalist Swiss-style controls.
 * Features floating controls, volume adjustment, and optional visual effects.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../core/utils';

export interface BackgroundPlayerProps {
  /** URL to audio or video file */
  src: string;
  /** Media type */
  type: 'audio' | 'video';
  /** Autoplay on mount */
  autoplay?: boolean;
  /** Loop the media */
  loop?: boolean;
  /** Start muted */
  muted?: boolean;
  /** Callback when playback starts */
  onPlay?: () => void;
  /** Callback when playback pauses */
  onPause?: () => void;
  /** Video overlay opacity (0-1), only for video type */
  overlayOpacity?: number;
  /** Apply blur effect to video background */
  blur?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * BackgroundPlayer - LLM-friendly media player with Swiss design
 */
export function BackgroundPlayer({
  src,
  type,
  autoplay = false,
  loop = false,
  muted = false,
  onPlay,
  onPause,
  overlayOpacity = 0.4,
  blur = false,
  className,
}: BackgroundPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(muted ? 0 : 1);
  const [showControls, setShowControls] = useState(type === 'audio');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Handle play/pause
  const togglePlayback = useCallback(() => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        mediaRef.current.play().catch(() => {
          // Handle autoplay restrictions
          setIsPlaying(false);
        });
        setIsPlaying(true);
        onPlay?.();
      }
    }
  }, [isPlaying, onPlay, onPause]);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
    }
  }, []);

  // Handle media events
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleLoadedMetadata = () => {
      setDuration(media.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
    };

    media.addEventListener('play', handlePlay);
    media.addEventListener('pause', handlePause);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      media.removeEventListener('play', handlePlay);
      media.removeEventListener('pause', handlePause);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onPlay, onPause]);

  // Show/hide controls on mouse movement (for video)
  const handleMouseMove = useCallback(() => {
    if (type === 'video') {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, type]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Format time display
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio player rendering
  if (type === 'audio') {
    return (
      <div
        className={cn(
          'phonon-bg-player-audio',
          'w-full bg-card rounded-lg border border-border p-4',
          'flex items-center gap-4',
          className
        )}
      >
        <audio
          ref={mediaRef as React.Ref<HTMLAudioElement>}
          src={src}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          crossOrigin="anonymous"
        />

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayback}
          className={cn(
            'phonon-player-btn-play',
            'flex-shrink-0 w-10 h-10 rounded-full',
            'flex items-center justify-center',
            'bg-primary text-primary-foreground',
            'hover:opacity-80 transition-opacity duration-200',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
          )}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h2zm8 0a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              const time = parseFloat(e.target.value);
              if (mediaRef.current) {
                mediaRef.current.currentTime = time;
              }
            }}
            className={cn(
              'phonon-player-progress',
              'flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer',
              'accent-sage'
            )}
            aria-label="Seek"
          />
          <span className="text-xs text-muted-foreground phonon-font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.383 3.076A1 1 0 0110 4.5v11a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.172a1 1 0 011.414 0A6.972 6.972 0 0119 10a6.972 6.972 0 01-2.929 5.656 1 1 0 01-1.414-1.414A4.972 4.972 0 0017 10a4.972 4.972 0 00-2.343-4.172 1 1 0 010-1.414z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className={cn(
              'phonon-player-volume',
              'w-16 h-1 bg-muted rounded-full appearance-none cursor-pointer',
              'accent-sage'
            )}
            aria-label="Volume"
          />
        </div>
      </div>
    );
  }

  // Video player rendering
  return (
    <div
      className={cn(
        'phonon-bg-player-video',
        'relative w-full h-full overflow-hidden rounded-lg',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
    >
      {/* Video Element */}
      <video
        ref={mediaRef as React.Ref<HTMLVideoElement>}
        src={src}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        crossOrigin="anonymous"
        className={cn('w-full h-full object-cover', blur && 'blur-sm')}
      />

      {/* Dark Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        style={{ opacity: overlayOpacity }}
      />

      {/* Floating Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'phonon-player-controls',
              'absolute bottom-0 left-0 right-0',
              'bg-gradient-to-t from-black/60 via-black/30 to-transparent',
              'p-6 flex items-end gap-4'
            )}
          >
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayback}
              className={cn(
                'phonon-player-btn-play-video',
                'flex-shrink-0 w-12 h-12 rounded-full',
                'flex items-center justify-center',
                'bg-white/20 text-white backdrop-blur-sm',
                'hover:bg-white/30 transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-white'
              )}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h2zm8 0a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              )}
            </button>

            {/* Progress Bar */}
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => {
                  const time = parseFloat(e.target.value);
                  if (mediaRef.current) {
                    mediaRef.current.currentTime = time;
                  }
                }}
                className={cn(
                  'phonon-player-progress-video',
                  'flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer',
                  'accent-white'
                )}
                aria-label="Seek"
              />
              <span className="text-xs text-white phonon-font-mono whitespace-nowrap">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.383 3.076A1 1 0 0110 4.5v11a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.172a1 1 0 011.414 0A6.972 6.972 0 0119 10a6.972 6.972 0 01-2.929 5.656 1 1 0 01-1.414-1.414A4.972 4.972 0 0017 10a4.972 4.972 0 00-2.343-4.172 1 1 0 010-1.414z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className={cn(
                  'phonon-player-volume-video',
                  'w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer',
                  'accent-white'
                )}
                aria-label="Volume"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Play Button (when paused) */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={togglePlayback}
            className={cn(
              'phonon-player-btn-center',
              'absolute inset-0 m-auto w-16 h-16 rounded-full',
              'flex items-center justify-center',
              'bg-white/20 text-white backdrop-blur-sm',
              'hover:bg-white/30 transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-white'
            )}
            aria-label="Play"
          >
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
