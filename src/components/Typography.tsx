/**
 * Phonon UI - Swiss Typography Components
 * 
 * Pre-styled typography components following Swiss design principles.
 */

import React from 'react';
import { cn } from '../core/utils';

// Common props for typography components
interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Hero text - largest display size (4-12rem responsive)
 */
export function SwissHero({ 
  children, 
  className,
  as: Tag = 'h1' 
}: TypographyProps) {
  return (
    <Tag className={cn('phonon-text-hero font-display', className)}>
      {children}
    </Tag>
  );
}

/**
 * Display text - large headings (3-6rem responsive)
 */
export function SwissDisplay({ 
  children, 
  className,
  as: Tag = 'h1' 
}: TypographyProps) {
  return (
    <Tag className={cn('phonon-text-display font-display', className)}>
      {children}
    </Tag>
  );
}

/**
 * Heading text - section headings
 */
interface HeadingProps extends TypographyProps {
  level?: 1 | 2 | 3 | 4;
}

export function SwissHeading({ 
  children, 
  className,
  level = 2,
}: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={cn('phonon-text-heading font-display', className)}>
      {children}
    </Tag>
  );
}

/**
 * Subheading text
 */
export function SwissSubheading({ 
  children, 
  className,
  as: Tag = 'h3' 
}: TypographyProps) {
  return (
    <Tag className={cn('phonon-text-subheading', className)}>
      {children}
    </Tag>
  );
}

/**
 * Body text with phi line-height
 */
export function SwissBody({ 
  children, 
  className,
  as: Tag = 'p' 
}: TypographyProps) {
  return (
    <Tag className={cn('phonon-leading-phi', className)}>
      {children}
    </Tag>
  );
}

/**
 * Caption text - small annotations
 */
export function SwissCaption({ 
  children, 
  className,
  as: Tag = 'span' 
}: TypographyProps) {
  return (
    <Tag className={cn('text-xs text-muted-foreground', className)}>
      {children}
    </Tag>
  );
}

/**
 * Monospace label - uppercase tracking
 */
export function SwissLabel({ 
  children, 
  className,
  as: Tag = 'span' 
}: TypographyProps) {
  return (
    <Tag className={cn('phonon-label', className)}>
      {children}
    </Tag>
  );
}

/**
 * Giant index numbers (6-16rem responsive)
 */
export function SwissIndex({ 
  children, 
  className,
  as: Tag = 'span' 
}: TypographyProps) {
  return (
    <Tag className={cn('phonon-text-index font-display text-muted-foreground/20', className)}>
      {children}
    </Tag>
  );
}
