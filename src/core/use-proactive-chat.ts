/**
 * Phonon UI - useProactiveChat Hook
 *
 * Hook for managing proactive chat behavior with role-based engagement.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface ProactiveChatConfig {
  proactivityLevel: 'passive' | 'balanced' | 'engaging';
  visitorRoles: string[]; // e.g., ['dj', 'venue_owner', 'pr', 'artist', 'therapist', 'yoga_teacher']
  initialQuestion?: string; // Initial question like "Ciao! Cosa ti porta qui?"
  engagementDelayMs?: number; // Delay before proposing something
  contextHints?: Record<string, string[]>; // Suggestions per role
}

export interface UseProactiveChatReturn {
  visitorRole: string | null;
  setVisitorRole: (role: string) => void;
  shouldEngage: boolean;
  engagementSuggestion: string | null;
  triggerEngagement: () => void;
  resetEngagement: () => void;
}

const DEFAULT_ENGAGEMENT_DELAY = 5000; // 5 seconds
const ENGAGING_MODE_DELAY = 1000; // 1 second for engaging mode

/**
 * Default context hints for common visitor roles
 */
const DEFAULT_CONTEXT_HINTS: Record<string, string[]> = {
  dj: [
    'Vuoi scoprire nuove venue per i tuoi set?',
    'Cerchi eventi dove suonare?',
    'Ti interessa connetterti con altri DJ?',
  ],
  venue_owner: [
    'Stai cercando artisti per il tuo locale?',
    'Vuoi promuovere i tuoi eventi?',
    'Ti serve supporto per la gestione eventi?',
  ],
  pr: [
    'Cerchi eventi da promuovere?',
    'Vuoi espandere la tua rete di contatti?',
    'Ti interessa collaborare con venue e artisti?',
  ],
  artist: [
    'Vuoi trovare opportunità per esibirti?',
    'Cerchi collaborazioni con altri artisti?',
    'Ti serve visibilità per i tuoi progetti?',
  ],
  therapist: [
    'Offri sessioni individuali o di gruppo?',
    'Cerchi spazi per i tuoi trattamenti?',
    'Vuoi far conoscere i tuoi servizi?',
  ],
  yoga_teacher: [
    'Offri classi online o in presenza?',
    'Cerchi location per le tue sessioni?',
    'Vuoi ampliare la tua community?',
  ],
};

/**
 * Hook for managing proactive chat with role-based engagement
 */
export function useProactiveChat(config: ProactiveChatConfig): UseProactiveChatReturn {
  const {
    proactivityLevel,
    visitorRoles,
    initialQuestion,
    engagementDelayMs,
    contextHints = DEFAULT_CONTEXT_HINTS,
  } = config;

  const [visitorRole, setVisitorRole] = useState<string | null>(null);
  const [shouldEngage, setShouldEngage] = useState(false);
  const [engagementSuggestion, setEngagementSuggestion] = useState<string | null>(null);

  const engagementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  /**
   * Get engagement delay based on proactivity level
   */
  const getEngagementDelay = useCallback((): number => {
    if (engagementDelayMs !== undefined) {
      return engagementDelayMs;
    }

    switch (proactivityLevel) {
      case 'passive':
        return Infinity; // Never auto-engage
      case 'engaging':
        return ENGAGING_MODE_DELAY;
      case 'balanced':
      default:
        return DEFAULT_ENGAGEMENT_DELAY;
    }
  }, [proactivityLevel, engagementDelayMs]);

  /**
   * Get a random suggestion based on visitor role
   */
  const getSuggestionForRole = useCallback((role: string): string | null => {
    const hints = contextHints[role];
    if (!hints || hints.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * hints.length);
    return hints[randomIndex];
  }, [contextHints]);

  /**
   * Get initial question or role-based suggestion
   */
  const getEngagementMessage = useCallback((): string | null => {
    // Use initial question if provided and no role is set
    if (!visitorRole && initialQuestion) {
      return initialQuestion;
    }

    // Get role-based suggestion
    if (visitorRole) {
      return getSuggestionForRole(visitorRole);
    }

    // Default fallback
    return initialQuestion || 'Posso aiutarti con qualcosa?';
  }, [visitorRole, initialQuestion, getSuggestionForRole]);

  /**
   * Trigger engagement manually
   */
  const triggerEngagement = useCallback(() => {
    const message = getEngagementMessage();
    setEngagementSuggestion(message);
    setShouldEngage(true);
  }, [getEngagementMessage]);

  /**
   * Reset engagement state
   */
  const resetEngagement = useCallback(() => {
    setShouldEngage(false);
    setEngagementSuggestion(null);
    lastInteractionRef.current = Date.now();

    // Clear existing timer
    if (engagementTimerRef.current) {
      clearTimeout(engagementTimerRef.current);
      engagementTimerRef.current = null;
    }
  }, []);

  /**
   * Setup engagement timer based on proactivity level
   */
  useEffect(() => {
    // Passive mode: never auto-engage
    if (proactivityLevel === 'passive') {
      return;
    }

    // Clear existing timer
    if (engagementTimerRef.current) {
      clearTimeout(engagementTimerRef.current);
    }

    const delay = getEngagementDelay();

    // Don't set timer for infinite delay
    if (delay === Infinity) {
      return;
    }

    // Set new engagement timer
    engagementTimerRef.current = setTimeout(() => {
      const message = getEngagementMessage();
      setEngagementSuggestion(message);
      setShouldEngage(true);
    }, delay);

    // Cleanup on unmount or dependency change
    return () => {
      if (engagementTimerRef.current) {
        clearTimeout(engagementTimerRef.current);
        engagementTimerRef.current = null;
      }
    };
  }, [proactivityLevel, visitorRole, getEngagementDelay, getEngagementMessage]);

  /**
   * Trigger immediate engagement in engaging mode when role is set
   */
  useEffect(() => {
    if (proactivityLevel === 'engaging' && visitorRole) {
      triggerEngagement();
    }
  }, [proactivityLevel, visitorRole, triggerEngagement]);

  /**
   * Handle visitor role change
   */
  const handleSetVisitorRole = useCallback((role: string) => {
    if (visitorRoles.includes(role)) {
      setVisitorRole(role);
      resetEngagement();
    } else {
      console.warn(`[useProactiveChat] Role "${role}" not in configured visitorRoles`);
    }
  }, [visitorRoles, resetEngagement]);

  return {
    visitorRole,
    setVisitorRole: handleSetVisitorRole,
    shouldEngage,
    engagementSuggestion,
    triggerEngagement,
    resetEngagement,
  };
}
