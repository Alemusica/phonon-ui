# Rhythmic Typography System

> A unique approach to text animation created by Alessio Cazzaniga.
> This system applies PHI ratios to TIME, creating musical rhythm in typography.

## Core Concept: Text as Music

Traditional typewriter effects display characters at fixed intervals—mechanical and lifeless.
The Phonon Rhythmic Typography System treats text like music: every word has rhythm,
every pause has meaning.

## The Innovation

### 1. PHI-Based Timing (Golden Ratio in Time)

Just as Swiss Typography uses the Golden Ratio (φ = 1.618) for spatial relationships,
this system applies PHI to temporal relationships:

| Speed | Delay | Derivation | Use Case |
|-------|-------|------------|----------|
| Fast | 25ms | 40ms ÷ φ | Quick scanning |
| Normal | 40ms | Base (300 WPM) | Comfortable reading |
| Slow | 65ms | 40ms × φ | Relaxed pace |
| Study | 105ms | 40ms × φ² | Learning/memorization |

### 2. Syllable-Based Word Pauses (Recitative Rhythm)

Inspired by operatic recitative and Italian endecasillabi poetry, the pause
after each word is proportional to its syllable count:

```
"AI" (1 syllable)      → base pause × 1
"neural" (2 syllables) → base pause × φ^0.5
"cognitive" (4 syl)    → base pause × φ^1.5
"revolutionary" (6)    → base pause × φ^2.5
```

This creates natural breathing rhythm—longer words earn longer pauses,
like a singer taking breath proportional to the phrase just sung.

### 3. Hemiola Punctuation (3:2 Musical Ratio)

Punctuation pauses follow the musical hemiola ratio (3:2 = 1.5):

- **Sentence end** (.!?) → 3× base delay (like breath between stanzas)
- **Mid-sentence** (,;:) → 1.5× base delay (like caesura in poetry)
- **Paragraph break** (\n) → φ × base delay

### 4. Character Flow (Vocal Rhythm)

Each character appears with ±15% timing variation, creating human-like
flow that avoids mechanical regularity. This mimics natural speech patterns.

## Scientific Foundation

Based on Brysbaert 2019 meta-analysis of reading speeds:
- 238 WPM: Average silent reading
- 300 WPM: Optimal comprehension (our base)
- 200 WPM: Learning rate
- 138 WPM: Memorization rate

## API

```typescript
import {
  setTypingSpeedMultiplier,
  getTypingSpeedMultiplier,
  countSyllables
} from 'phonon-ui';

// Runtime speed control
setTypingSpeedMultiplier(0.5);  // 2× faster
setTypingSpeedMultiplier(2.0);  // 2× slower

// LLM command integration
// [ACTION:{"type":"setTypingSpeed","value":0.5}]
```

## Why This Matters

This system creates **harmony and wellbeing** in text consumption.
Not "optimal" in the cold, efficiency sense—but harmonious, like music.

The result: text that breathes, that has soul, that respects the natural
rhythm of human cognition and the musical traditions of language.

---

## Concrete Pour Pattern (Layout-First Rendering)

A revolutionary rendering approach: calculate layout BEFORE animation, like a newspaper printing press.

### The Problem with Traditional Typewriters

Standard typewriter effects cause **reflow** as text appears:
- Layout shifts as new characters arrive
- Reader's eye must constantly readjust
- Feels unstable, like wet concrete still moving

### The Solution: Pour into Forms

Like concrete construction:
1. **FORMWORK PHASE** → Buffer content, detect structure, calculate exact positions
2. **POUR PHASE** → Render characters into pre-calculated positions (no reflow)
3. **CURE PHASE** → Content is stable, immovable

```typescript
import { useConcretePour, analyzeStructure, calculateLayout } from 'phonon-ui';

// Hook usage
const { visibleText, phase, progress, isComplete } = useConcretePour({
  content: "# Headline\n\nBody text here...",
  enabled: true,
  autoStart: true,
});

// Manual control
const structure = analyzeStructure(content);  // Detects headlines, citations, etc.
const layout = calculateLayout(content, structure);  // Exact char positions
```

### Content Structure Detection

Automatically detects:
- Headlines (`#`, `##`)
- Citations (`>`)
- Sections (`###`)
- Estimates optimal column count
- Counts words, paragraphs, characters

---

## Musical Orchestration Department (DNA)

A conductor for typography timing, coordinating all elements like an orchestra.

### Tempo Markings (Speed)

```typescript
TEMPO = {
  PRESTISSIMO: 15ms,   // Very fast
  PRESTO: 25ms,        // Fast
  ALLEGRO: 40ms,       // Normal/lively
  MODERATO: 65ms,      // Moderate
  ANDANTE: 105ms,      // Walking pace
  ADAGIO: 170ms,       // Slow, expressive
  LARGO: 275ms,        // Very slow
}
```

### Dynamics (Emphasis)

```typescript
DYNAMICS = {
  PPP: 0.3,   // Pianississimo - whisper
  PP: 0.5,    // Pianissimo - very soft
  P: 0.7,     // Piano - soft
  MP: 0.85,   // Mezzo-piano
  MF: 1.0,    // Mezzo-forte (default)
  F: 1.2,     // Forte - emphasized
  FF: 1.5,    // Fortissimo
  FFF: 2.0,   // Maximum emphasis
}
```

### Rhythm Patterns

- **COMMON** → Standard 4/4 timing
- **WALTZ** → Flowing 3/4
- **HEMIOLA** → Cross-rhythm 3:2
- **ENDECASILLABO** → Italian poetry (11 syllables)
- **RECITATIVE** → Speech-like, flexible

### Usage

```typescript
import { MusicalOrchestrator, RHYTHM_PATTERNS } from 'phonon-ui';

const conductor = new MusicalOrchestrator({
  tempo: 'ALLEGRO',
  dynamic: 'MF',
  rhythm: RHYTHM_PATTERNS.RECITATIVE,
  sections: [
    { type: 'headline', tempo: 'MODERATO', dynamic: 'F', fermata: true },
    { type: 'citation', tempo: 'ANDANTE', dynamic: 'F', crescendo: true },
  ],
});

const delay = conductor.getCharacterDelay(char, prevChar, syllables, sectionType, beatPos);
```

---

*Created by Alessio Cazzaniga as part of Phonon UI*
*A unique system for monetizable, differentiated text experiences*
