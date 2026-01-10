/**
 * Phonon UI - Video Vignette Component
 *
 * Video component for newspaper "talking vignettes" - small video clips
 * that appear in newspaper layouts with Swiss Typography styling.
 * Includes play/pause overlay and optional caption.
 */

import { useState, useRef } from 'react';
import { cn } from '../core/utils';

export interface VideoVignetteProps {
  /** Video source URL */
  src: string;
  /** Optional poster/thumbnail image URL */
  poster?: string;
  /** Optional caption text below video (Swiss style: "Fig. 1 — Description") */
  caption?: string;
  /** Aspect ratio for container sizing */
  aspectRatio?: '1/1' | '4/3' | '16/9' | '9/16';
  /** Auto-play on mount */
  autoPlay?: boolean;
  /** Mute audio (default true) */
  muted?: boolean;
  /** Loop video playback */
  loop?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * VideoVignette - Minimal video component for newspaper layouts
 *
 * @example
 * ```tsx
 * <VideoVignette
 *   src="/video.mp4"
 *   poster="/thumbnail.jpg"
 *   caption="Fig. 1 — Interview segment"
 *   aspectRatio="16/9"
 *   autoPlay={false}
 *   loop={true}
 * />
 * ```
 */
export function VideoVignette({
  src,
  poster,
  caption,
  aspectRatio = '16/9',
  autoPlay = false,
  muted = true,
  loop = true,
  className,
}: VideoVignetteProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Aspect ratio classes
  const aspectRatioMap: Record<string, string> = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '9/16': 'aspect-[9/16]',
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const containerClasses = cn(
    'phonon-video-vignette',
    'overflow-hidden rounded-md',
    'relative group',
    'border border-border',
    aspectRatioMap[aspectRatio]
  );

  const videoClasses = cn(
    'w-full h-full object-cover',
    'transition-opacity duration-500'
  );

  const overlayClasses = cn(
    'absolute inset-0',
    'bg-black/0 group-hover:bg-black/20',
    'transition-colors duration-300',
    'flex items-center justify-center',
    'cursor-pointer'
  );

  const playButtonClasses = cn(
    'phonon-play-button',
    'w-12 h-12 rounded-full',
    'bg-white/90 hover:bg-white',
    'flex items-center justify-center',
    'transition-all duration-300',
    'shadow-lg',
    isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
  );

  const captionClasses = cn(
    'phonon-font-mono',
    'text-xs leading-relaxed',
    'text-muted-foreground',
    'mt-[var(--phonon-space-sm)]',
    'border-t border-border pt-[var(--phonon-space-sm)]'
  );

  return (
    <figure className={cn('phonon-video-figure', className)}>
      <div className={containerClasses} onClick={handlePlayPause}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className={videoClasses}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
        />
        <div className={overlayClasses}>
          <div className={playButtonClasses}>
            {!isPlaying ? (
              <svg
                className="w-5 h-5 text-gray-900 ml-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-900"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 011 1v12a1 1 0 11-2 0V3a1 1 0 011-1zm8 0a1 1 0 011 1v12a1 1 0 11-2 0V3a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
      {caption && (
        <figcaption className={captionClasses}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
