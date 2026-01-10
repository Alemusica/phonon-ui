/**
 * MUSICAL ORCHESTRATION DEPARTMENT
 * =================================
 * DNA System Module by Alessio Cazzaniga
 *
 * Like a conductor coordinating an orchestra:
 * - Typography has RHYTHM (syllable-based timing)
 * - Layout has TEMPO (pour speed)
 * - Elements have DYNAMICS (emphasis, accents)
 *
 * Inspired by:
 * - Operatic recitative (speech-like singing)
 * - Hemiola rhythm (3:2 ratio)
 * - Endecasillabi poetry timing
 */

// ════════════════════════════════════════════════════════════════
// MUSICAL CONSTANTS (PHI-based)
// ════════════════════════════════════════════════════════════════

export const PHI = 1.618;
export const HEMIOLA = 3 / 2; // 1.5 - musical 3:2 ratio

/** Tempo markings (like music) */
export const TEMPO = {
  PRESTISSIMO: 15,   // Very fast (instant feel)
  PRESTO: 25,        // Fast
  ALLEGRO: 40,       // Normal/lively
  MODERATO: 65,      // Moderate
  ANDANTE: 105,      // Walking pace
  ADAGIO: 170,       // Slow, expressive
  LARGO: 275,        // Very slow, broad
} as const;

export type TempoMarking = keyof typeof TEMPO;

/** Dynamic markings (emphasis levels) */
export const DYNAMICS = {
  PPP: 0.3,    // Pianississimo - whisper
  PP: 0.5,     // Pianissimo - very soft
  P: 0.7,      // Piano - soft
  MP: 0.85,    // Mezzo-piano - moderately soft
  MF: 1.0,     // Mezzo-forte - moderate (default)
  F: 1.2,      // Forte - loud/emphasized
  FF: 1.5,     // Fortissimo - very loud
  FFF: 2.0,   // Fortississimo - maximum emphasis
} as const;

export type DynamicMarking = keyof typeof DYNAMICS;

// ════════════════════════════════════════════════════════════════
// RHYTHM PATTERNS
// ════════════════════════════════════════════════════════════════

/** Rhythm pattern for text elements */
export interface RhythmPattern {
  name: string;
  /** Base delay multipliers for each beat position */
  beats: number[];
  /** Accent positions (emphasized) */
  accents: number[];
}

/** Pre-defined rhythm patterns */
export const RHYTHM_PATTERNS: Record<string, RhythmPattern> = {
  /** Standard 4/4 - even timing */
  COMMON: {
    name: 'Common Time',
    beats: [1, 1, 1, 1],
    accents: [0, 2], // 1st and 3rd beats
  },
  /** Waltz 3/4 - flowing */
  WALTZ: {
    name: 'Waltz',
    beats: [1.2, 0.9, 0.9],
    accents: [0],
  },
  /** Hemiola 3:2 - cross-rhythm */
  HEMIOLA: {
    name: 'Hemiola',
    beats: [1.5, 1.5, 1, 1, 1],
    accents: [0, 2],
  },
  /** Endecasillabo - Italian poetry (11 syllables) */
  ENDECASILLABO: {
    name: 'Endecasillabo',
    beats: [1, 0.9, 1, 0.9, 1.1, 0.9, 1, 0.9, 1.1, 0.9, 1.3],
    accents: [3, 6, 9], // Traditional stress positions
  },
  /** Recitative - speech-like, flexible */
  RECITATIVE: {
    name: 'Recitative',
    beats: [1], // Single beat, modified by syllable count
    accents: [],
  },
};

// ════════════════════════════════════════════════════════════════
// ORCHESTRATION SCORE
// ════════════════════════════════════════════════════════════════

/** Musical score for a content piece */
export interface OrchestrationScore {
  /** Overall tempo */
  tempo: TempoMarking;
  /** Base dynamic level */
  dynamic: DynamicMarking;
  /** Rhythm pattern to use */
  rhythm: RhythmPattern;
  /** Section-specific markings */
  sections: SectionMarking[];
}

/** Marking for a specific section */
export interface SectionMarking {
  type: 'headline' | 'subheadline' | 'body' | 'citation' | 'section-header';
  tempo?: TempoMarking;
  dynamic?: DynamicMarking;
  rhythm?: RhythmPattern;
  /** Fermata - pause/hold */
  fermata?: boolean;
  /** Crescendo - gradual increase */
  crescendo?: boolean;
  /** Decrescendo - gradual decrease */
  decrescendo?: boolean;
}

// ════════════════════════════════════════════════════════════════
// ORCHESTRATOR CLASS
// ════════════════════════════════════════════════════════════════

/**
 * Musical Orchestrator
 * Coordinates timing across all elements like a conductor
 */
export class MusicalOrchestrator {
  private score: OrchestrationScore;
  private globalMultiplier: number = 1.0;

  constructor(score?: Partial<OrchestrationScore>) {
    this.score = {
      tempo: 'ALLEGRO',
      dynamic: 'MF',
      rhythm: RHYTHM_PATTERNS.RECITATIVE,
      sections: [],
      ...score,
    };
  }

  /**
   * Set global speed multiplier (from UI slider)
   */
  setGlobalMultiplier(multiplier: number): void {
    this.globalMultiplier = Math.max(0.1, Math.min(5.0, multiplier));
  }

  /**
   * Get delay for a character based on musical context
   */
  getCharacterDelay(
    char: string,
    prevChar: string,
    wordSyllables: number,
    sectionType: SectionMarking['type'],
    beatPosition: number
  ): number {
    // Get section-specific or default markings
    const section = this.score.sections.find(s => s.type === sectionType);
    const tempo = section?.tempo || this.score.tempo;
    const dynamic = section?.dynamic || this.score.dynamic;
    const rhythm = section?.rhythm || this.score.rhythm;

    // Base delay from tempo
    let delay = TEMPO[tempo];

    // Apply rhythm pattern
    const beatIndex = beatPosition % rhythm.beats.length;
    delay *= rhythm.beats[beatIndex];

    // Apply accent if on accent beat
    if (rhythm.accents.includes(beatIndex)) {
      delay *= 1.15; // Slight emphasis on accented beats
    }

    // Apply dynamics (affects perceived speed)
    delay *= DYNAMICS[dynamic];

    // Syllable-based modification (recitative style)
    if (char === ' ') {
      // Word boundary - pause proportional to syllables
      const syllableMultiplier = Math.pow(PHI, Math.max(0, wordSyllables - 1) * 0.5);
      delay *= syllableMultiplier;
    }

    // Punctuation pauses (like breath marks)
    if ('.!?'.includes(prevChar)) {
      delay *= HEMIOLA * 2; // Sentence end - long breath
    } else if (',;:'.includes(prevChar)) {
      delay *= HEMIOLA; // Mid-sentence - short breath
    } else if (prevChar === '\n') {
      delay *= PHI; // Paragraph break
    }

    // Humanization jitter (±15%)
    delay *= 0.85 + Math.random() * 0.3;

    // Apply global multiplier
    delay *= this.globalMultiplier;

    return delay;
  }

  /**
   * Generate a score for content based on structure
   */
  static generateScore(structure: {
    type: 'newspaper' | 'chat' | 'plain';
    hasCitations: boolean;
    hasSections: boolean;
  }): OrchestrationScore {
    const sections: SectionMarking[] = [];

    // Headline - dramatic, forte
    sections.push({
      type: 'headline',
      tempo: 'MODERATO',
      dynamic: 'F',
      rhythm: RHYTHM_PATTERNS.HEMIOLA,
      fermata: true, // Pause after headline
    });

    // Subheadline - slightly softer
    sections.push({
      type: 'subheadline',
      tempo: 'ALLEGRO',
      dynamic: 'MF',
      rhythm: RHYTHM_PATTERNS.WALTZ,
    });

    // Body - normal flow
    sections.push({
      type: 'body',
      tempo: 'ALLEGRO',
      dynamic: 'MP',
      rhythm: RHYTHM_PATTERNS.RECITATIVE,
    });

    // Citations - expressive, slower
    if (structure.hasCitations) {
      sections.push({
        type: 'citation',
        tempo: 'ANDANTE',
        dynamic: 'F',
        rhythm: RHYTHM_PATTERNS.ENDECASILLABO,
        crescendo: true,
      });
    }

    // Section headers - clear articulation
    if (structure.hasSections) {
      sections.push({
        type: 'section-header',
        tempo: 'MODERATO',
        dynamic: 'F',
        fermata: true,
      });
    }

    return {
      tempo: structure.type === 'newspaper' ? 'ALLEGRO' : 'PRESTO',
      dynamic: 'MF',
      rhythm: RHYTHM_PATTERNS.RECITATIVE,
      sections,
    };
  }

  /**
   * Get the current score
   */
  getScore(): OrchestrationScore {
    return this.score;
  }

  /**
   * Update score
   */
  updateScore(updates: Partial<OrchestrationScore>): void {
    this.score = { ...this.score, ...updates };
  }
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

export const orchestrator = new MusicalOrchestrator();
