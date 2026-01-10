import { ReactNode } from 'react';
import { cn } from '../core/utils';

interface NewspaperPageProps {
  children: ReactNode;
  title?: string;
  date?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

export function NewspaperPage({
  children,
  title = 'PHONON TIMES',
  date,
  theme = 'light',
  className
}: NewspaperPageProps) {
  const currentDate = date || new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={cn(
      'newspaper-page',
      theme === 'dark' && 'newspaper-dark',
      className
    )}>
      <header className="newspaper-header">
        <h1 className="newspaper-masthead">{title}</h1>
        <div className="newspaper-date">{currentDate}</div>
      </header>
      <div className="newspaper-grid">
        {children}
      </div>
    </div>
  );
}

interface NewspaperColumnProps {
  children: ReactNode;
  span?: 1 | 2 | 3 | 4 | 5;
  className?: string;
}

export function NewspaperColumn({ children, span = 1, className }: NewspaperColumnProps) {
  return (
    <div className={cn(
      'newspaper-column',
      span > 1 && `span-${span}`,
      className
    )}>
      {children}
    </div>
  );
}

interface CitationProps {
  children: ReactNode;
  author?: string;
  className?: string;
}

export function Citation({ children, author, className }: CitationProps) {
  return (
    <blockquote className={cn('newspaper-citation', className)}>
      <p>{children}</p>
      {author && <cite>— {author}</cite>}
    </blockquote>
  );
}

interface HeadlineProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function Headline({ children, level = 1, className }: HeadlineProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={cn(`newspaper-hl${level}`, className)}>
      {children}
    </Tag>
  );
}

interface NewspaperImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}

export function NewspaperImage({ src, alt, caption, className }: NewspaperImageProps) {
  return (
    <figure className={cn('newspaper-figure', className)}>
      <img src={src} alt={alt} className="newspaper-image" />
      {caption && <figcaption className="newspaper-caption">{caption}</figcaption>}
    </figure>
  );
}

interface NewspaperBodyProps {
  children: ReactNode;
  dropCap?: boolean;
  className?: string;
}

export function NewspaperBody({ children, dropCap = false, className }: NewspaperBodyProps) {
  return (
    <div className={cn(
      'newspaper-body',
      dropCap && 'has-dropcap',
      className
    )}>
      {children}
    </div>
  );
}
