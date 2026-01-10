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

*Created by Alessio Cazzaniga as part of Phonon UI*
*A unique system for monetizable, differentiated text experiences*
