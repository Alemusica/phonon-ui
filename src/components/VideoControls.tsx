/**
 * Phonon UI - Video Controls Component
 * Minimal video control panel for background videos (DJ control deck style)
 */

import { cn } from '../core/utils';

export interface VideoControlsProps {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

export function VideoControls({
  isPlaying,
  volume,
  isMuted,
  onPlayPause,
  onVolumeChange,
  onMuteToggle,
  position = 'bottom-right',
  className,
}: VideoControlsProps) {
  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
  };

  return (
    <div
      className={cn(
        'fixed z-50 flex items-center gap-3 p-3 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/50 transition-colors duration-200',
        positionClasses[position],
        className
      )}
    >
      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        className="flex items-center justify-center w-8 h-8 rounded bg-white/10 hover:bg-white/20 transition-colors duration-150 text-white"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <span className="text-sm font-bold">❚❚</span>
        ) : (
          <span className="text-sm font-bold">▶</span>
        )}
      </button>

      {/* Volume Slider */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.currentTarget.value))}
          className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
          aria-label="Volume"
        />
      </div>

      {/* Mute/Unmute Button */}
      <button
        onClick={onMuteToggle}
        className="flex items-center justify-center w-8 h-8 rounded bg-white/10 hover:bg-white/20 transition-colors duration-150 text-white"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <span className="text-sm">{isMuted ? '🔇' : '🔊'}</span>
      </button>

      {/* Volume Display */}
      <span className="text-xs text-white/60 font-mono w-8 text-right">
        {Math.round(isMuted ? 0 : volume * 100)}%
      </span>
    </div>
  );
}
