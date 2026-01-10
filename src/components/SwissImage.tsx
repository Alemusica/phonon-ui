/**
 * Phonon UI - Swiss Image Component
 *
 * Minimalist image component following Swiss Typography principles.
 * Features thin borders, monospace captions, and lazy loading support.
 */

import { useState } from 'react';
import { cn } from '../core/utils';

export interface SwissImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Optional caption text below image */
  caption?: string;
  /** Aspect ratio for container sizing */
  aspectRatio?: '1/1' | '4/3' | '16/9' | '21/9' | 'auto';
  /** Border radius: none, sm, md, lg */
  rounded?: 'none' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * SwissImage - Minimal image component with optional caption
 *
 * @example
 * ```tsx
 * <SwissImage
 *   src="/image.jpg"
 *   alt="Description"
 *   caption="Fig. 1 - Image caption in monospace"
 *   aspectRatio="16/9"
 *   rounded="md"
 * />
 * ```
 */
export function SwissImage({
  src,
  alt,
  caption,
  aspectRatio = 'auto',
  rounded = 'md',
  className,
}: SwissImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Aspect ratio classes
  const aspectRatioMap: Record<string, string> = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '21/9': 'aspect-[21/9]',
    'auto': '',
  };

  // Border radius classes
  const roundedMap: Record<string, string> = {
    'none': 'rounded-none',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
  };

  const containerClasses = cn(
    'phonon-swiss-image',
    'overflow-hidden',
    roundedMap[rounded],
    aspectRatioMap[aspectRatio]
  );

  const imageClasses = cn(
    'w-full h-full object-cover',
    'transition-opacity duration-500', // 500ms matches --phonon-duration-medium
    isLoaded ? 'opacity-100' : 'opacity-0'
  );

  const captionClasses = cn(
    'phonon-font-mono',
    'text-xs leading-relaxed',
    'text-muted-foreground',
    'mt-[var(--phonon-space-sm)]',
    'border-t border-border pt-[var(--phonon-space-sm)]'
  );

  return (
    <figure className={cn('phonon-image-figure', className)}>
      <div className={containerClasses}>
        <img
          src={src}
          alt={alt}
          className={imageClasses}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          decoding="async"
        />
      </div>
      {caption && (
        <figcaption className={captionClasses}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
