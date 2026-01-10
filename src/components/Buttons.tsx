/**
 * Phonon UI - Button Components
 *
 * Specialized button components for chat and UI interactions
 * with Swiss Typography styling and PHI-based spacing
 */

import React from 'react';
import { cn } from '../core/utils';

/* ===== BASE BUTTON STYLES ===== */

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
}

/**
 * Base button styling helper
 */
function getBaseButtonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md'
): string {
  const baseClasses = 'inline-flex items-center justify-center gap-phi-sm font-medium transition-all duration-200 ease-out rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-sage text-background hover:bg-lake active:scale-95',
    secondary: 'bg-muted text-foreground border border-border hover:bg-muted/80 active:scale-95',
    ghost: 'text-foreground hover:bg-muted/50 active:scale-95',
  };

  const sizeClasses = {
    sm: 'px-phi-sm py-phi-xs text-sm',
    md: 'px-phi-md py-phi-sm text-base',
    lg: 'px-phi-lg py-phi-md text-lg',
  };

  return cn(baseClasses, variantClasses[variant], sizeClasses[size]);
}

/* ===== CTA BUTTON ===== */

interface CTAButtonProps extends BaseButtonProps {
  /**
   * Call to action button for prominent actions
   * Uses sage background with hover effects
   */
  ariaLabel?: string;
}

export function CTAButton({
  children,
  onClick,
  disabled = false,
  className,
  ariaLabel,
}: CTAButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'phonon-btn-cta',
        'bg-sage text-background font-display font-semibold tracking-swiss',
        'hover:bg-lake hover:shadow-lg transition-all duration-300 ease-swiss',
        'active:scale-95 shadow-md',
        'px-phi-lg py-phi-md text-lg',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        'rounded-lg',
        className
      )}
    >
      <span className="phonon-label">{children}</span>
    </button>
  );
}

/* ===== CONFIRM BUTTON ===== */

interface ConfirmButtonProps extends BaseButtonProps {
  /**
   * Outline-style button for confirmations in chat
   * Subtle styling that pairs well with CTAButton
   */
  confirmText?: string;
}

export function ConfirmButton({
  children,
  onClick,
  disabled = false,
  className,
  confirmText,
}: ConfirmButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={confirmText}
      className={cn(
        'phonon-btn-confirm',
        'border border-sage text-sage',
        'hover:bg-sage/10 hover:border-lake hover:text-lake',
        'active:bg-sage/20 active:scale-95',
        'transition-all duration-200 ease-out',
        'px-phi-md py-phi-sm text-base',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
        'rounded-lg',
        className
      )}
    >
      {children}
    </button>
  );
}

/* ===== QUICK REPLY BUTTON ===== */

interface QuickReplyButtonProps extends Omit<BaseButtonProps, 'variant'> {
  /**
   * Pill-style button for quick replies
   * Designed to work in horizontal groups
   */
  isActive?: boolean;
}

export function QuickReplyButton({
  children,
  onClick,
  disabled = false,
  className,
  isActive = false,
}: QuickReplyButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'phonon-btn-quick-reply',
        'px-phi-lg py-phi-sm text-sm',
        'font-medium tracking-swiss rounded-full',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Active state
        isActive ? [
          'bg-sage text-background shadow-md',
          'hover:bg-lake hover:shadow-lg',
          'active:scale-95',
        ] : [
          'bg-muted text-foreground border border-border',
          'hover:border-sage hover:text-sage hover:bg-muted/80',
          'active:scale-95',
        ],
        className
      )}
    >
      {children}
    </button>
  );
}

/* ===== QUICK REPLY GROUP ===== */

interface QuickReplyGroupProps {
  /**
   * Container for horizontal group of quick reply buttons
   */
  children: React.ReactNode;
  className?: string;
}

export function QuickReplyGroup({ children, className }: QuickReplyGroupProps) {
  return (
    <div
      className={cn(
        'phonon-quick-reply-group',
        'flex flex-wrap gap-phi-sm items-center',
        className
      )}
      role="group"
    >
      {children}
    </div>
  );
}

/* ===== GENERIC BUTTON COMPONENT ===== */

interface GenericButtonProps extends BaseButtonProps {
  /**
   * Generic button component with variant support
   */
  asChild?: boolean;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
}: GenericButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        getBaseButtonClasses(variant, size),
        className
      )}
    >
      {children}
    </button>
  );
}
