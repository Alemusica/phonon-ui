/**
 * Design DNA System Tests
 * Tests for the unified physics/biology/optics/linguistics system
 */

import { describe, it, expect } from 'vitest';
import {
  DNA_LIBRARY,
  DNA_TERRAIN,
  DNA_WALL,
  DNA_STEM_VERTICAL,
  DNA_PETAL_HEADLINE,
  DNA_PETAL_BODY,
  DNA_PETAL_CITATION,
  DNA_PETAL_WORD,
  DNA_POLLEN_BORDER,
  OPTICS_LIGHT,
  OPTICS_DARK,
  LINGUISTICS,
  RENDERING_PRESETS,
  dnaToCSS,
  generateLLMSystemPrompt,
  generateLLMPrompt,
  generateCSSVariables,
} from '../core/design-dna';

describe('DNA Library', () => {
  describe('Structure', () => {
    it('should have all element types in DNA_LIBRARY', () => {
      expect(DNA_LIBRARY.terrain).toBeDefined();
      expect(DNA_LIBRARY.wall).toBeDefined();
      expect(DNA_LIBRARY.stemVertical).toBeDefined();
      expect(DNA_LIBRARY.stemHorizontal).toBeDefined();
      expect(DNA_LIBRARY.petalHeadline).toBeDefined();
      expect(DNA_LIBRARY.petalBody).toBeDefined();
      expect(DNA_LIBRARY.petalCitation).toBeDefined();
      expect(DNA_LIBRARY.petalWord).toBeDefined();
      expect(DNA_LIBRARY.pollenBorder).toBeDefined();
    });

    it('should have correct element types', () => {
      expect(DNA_TERRAIN.type).toBe('terrain');
      expect(DNA_WALL.type).toBe('wall');
      expect(DNA_STEM_VERTICAL.type).toBe('stem');
      expect(DNA_PETAL_HEADLINE.type).toBe('petal');
      expect(DNA_POLLEN_BORDER.type).toBe('pollen');
    });
  });

  describe('Growth Hierarchy', () => {
    it('should have correct growth order (terrain first, pollen last)', () => {
      expect(DNA_TERRAIN.growthOrder).toBe(0);
      expect(DNA_WALL.growthOrder).toBe(1);
      expect(DNA_STEM_VERTICAL.growthOrder).toBe(2);
      expect(DNA_PETAL_HEADLINE.growthOrder).toBe(3);
      expect(DNA_PETAL_BODY.growthOrder).toBe(3);
      expect(DNA_POLLEN_BORDER.growthOrder).toBe(5);
    });

    it('should enforce containment rules', () => {
      expect(DNA_TERRAIN.canContain).toContain('wall');
      expect(DNA_TERRAIN.canContain).toContain('stem');
      expect(DNA_WALL.canContain).toContain('stem');
      expect(DNA_WALL.canContain).toContain('petal');
      expect(DNA_STEM_VERTICAL.canContain).toContain('petal');
    });
  });

  describe('Physics Bounds', () => {
    it('should have correct min-width for columns (stem)', () => {
      expect(DNA_STEM_VERTICAL.bounds.width.min).toBe(140);
    });

    it('should have correct min-width for citations', () => {
      expect(DNA_PETAL_CITATION.bounds.width.min).toBe(200);
    });

    it('should have elastic property for flexible elements', () => {
      expect(DNA_STEM_VERTICAL.bounds.width.elastic).toBe(true);
      expect(DNA_PETAL_WORD.bounds.width.elastic).toBe(false);
    });

    it('should have correct overflow behavior', () => {
      expect(DNA_TERRAIN.overflow.x).toBe('block'); // No horizontal scroll
      expect(DNA_TERRAIN.overflow.y).toBe('scroll'); // Vertical OK
      expect(DNA_STEM_VERTICAL.overflow.x).toBe('hyphenate');
      expect(DNA_PETAL_WORD.overflow.x).toBe('block'); // Words don't break
    });
  });

  describe('Word Integrity', () => {
    it('should mark words as unbreakable', () => {
      expect(DNA_PETAL_WORD.breakable).toBe(false);
    });

    it('should have break rules for headlines', () => {
      expect(DNA_PETAL_HEADLINE.breakable).toBe(true);
      expect(DNA_PETAL_HEADLINE.breakRules?.breakPoints).toContain('word');
      expect(DNA_PETAL_HEADLINE.breakRules?.breakPoints).toContain('never');
    });

    it('should allow hyphenation for body text', () => {
      expect(DNA_PETAL_BODY.breakRules?.breakPoints).toContain('syllable');
    });
  });

  describe('Importance Hierarchy', () => {
    it('should have critical elements with importance 5', () => {
      expect(DNA_TERRAIN.importance).toBe(5);
      expect(DNA_WALL.importance).toBe(5);
      expect(DNA_PETAL_HEADLINE.importance).toBe(5);
      expect(DNA_PETAL_WORD.importance).toBe(5);
    });

    it('should have decorations with lowest importance', () => {
      expect(DNA_POLLEN_BORDER.importance).toBe(1);
    });
  });
});

describe('Optics System', () => {
  describe('Light Theme', () => {
    it('should have correct text colors', () => {
      expect(OPTICS_LIGHT.text.primary).toBe('#0a0a0a');
      expect(OPTICS_LIGHT.text.secondary).toBe('#1a1a1a');
    });

    it('should have newspaper cream background', () => {
      expect(OPTICS_LIGHT.bg.paper).toBe('#f4f1ea');
    });

    it('should have WCAG AA contrast requirement', () => {
      expect(OPTICS_LIGHT.coupling.minContrast).toBe(4.5);
    });

    it('should have safe color pairs', () => {
      expect(OPTICS_LIGHT.coupling.safePairs.length).toBeGreaterThan(0);
      expect(OPTICS_LIGHT.coupling.safePairs[0]).toContain('#0a0a0a');
    });
  });

  describe('Dark Theme', () => {
    it('should have inverted text colors', () => {
      expect(OPTICS_DARK.text.primary).toBe('#fafafa');
    });

    it('should have dark background', () => {
      expect(OPTICS_DARK.bg.paper).toBe('#0f0f0f');
    });
  });
});

describe('Linguistics System', () => {
  it('should have correct font families', () => {
    expect(LINGUISTICS.family.display).toContain('Playfair Display');
    expect(LINGUISTICS.family.body).toContain('Droid Serif');
    expect(LINGUISTICS.family.mono).toContain('IBM Plex Mono');
  });

  it('should have PHI-based scale', () => {
    expect(LINGUISTICS.scale.h1).toBeCloseTo(2.618, 2); // φ²
    expect(LINGUISTICS.scale.h2).toBeCloseTo(1.618, 2); // φ
  });

  it('should have hyphenation rules per language', () => {
    expect(LINGUISTICS.hyphenation.en.minWordLength).toBe(6);
    expect(LINGUISTICS.hyphenation.de.minWordLength).toBe(4); // German compounds
  });
});

describe('dnaToCSS', () => {
  it('should generate min-width from bounds', () => {
    const css = dnaToCSS(DNA_STEM_VERTICAL);
    expect(css['min-width']).toBe('140px');
  });

  it('should generate max-width for container', () => {
    const css = dnaToCSS(DNA_STEM_VERTICAL);
    expect(css['max-width']).toBe('100%');
  });

  it('should generate overflow properties', () => {
    const css = dnaToCSS(DNA_STEM_VERTICAL);
    expect(css['hyphens']).toBe('auto');
    expect(css['overflow-wrap']).toBe('break-word');
  });

  it('should generate container-type for elastic elements', () => {
    const css = dnaToCSS(DNA_STEM_VERTICAL);
    expect(css['container-type']).toBe('inline-size');
  });

  it('should prevent word breaking for unbreakable elements', () => {
    const css = dnaToCSS(DNA_PETAL_WORD);
    expect(css['word-break']).toBe('keep-all');
  });
});

describe('generateCSSVariables', () => {
  it('should generate light theme variables', () => {
    const vars = generateCSSVariables('light');
    expect(vars).toContain('--dna-text-primary: #0a0a0a');
    expect(vars).toContain('--dna-bg-paper: #f4f1ea');
  });

  it('should generate dark theme variables', () => {
    const vars = generateCSSVariables('dark');
    expect(vars).toContain('--dna-text-primary: #fafafa');
    expect(vars).toContain('--dna-bg-paper: #0f0f0f');
  });
});

describe('Rendering Presets', () => {
  it('should have newspaper preset', () => {
    expect(RENDERING_PRESETS.newspaper).toBeDefined();
    expect(RENDERING_PRESETS.newspaper.headlines.maxWordsPerLine).toBe(3);
  });

  it('should have magazine preset with different values', () => {
    expect(RENDERING_PRESETS.magazine).toBeDefined();
    expect(RENDERING_PRESETS.magazine.headlines.maxWordsPerLine).toBe(4);
  });

  it('should have book preset', () => {
    expect(RENDERING_PRESETS.book).toBeDefined();
    expect(RENDERING_PRESETS.book.body.targetLineLength).toBe(70);
  });
});

describe('generateLLMSystemPrompt', () => {
  it('should include physics constraints', () => {
    const prompt = generateLLMSystemPrompt('newspaper');
    expect(prompt).toContain('physics_constraints');
    expect(prompt).toContain('CANNOT overflow');
  });

  it('should include preset-specific values', () => {
    const prompt = generateLLMSystemPrompt('newspaper');
    expect(prompt).toContain('3 words max per line'); // newspaper headline rule
  });

  it('should include topic when provided', () => {
    const prompt = generateLLMSystemPrompt('newspaper', 'Japanese Sharp radios');
    expect(prompt).toContain('topic_constraint');
    expect(prompt).toContain('Japanese Sharp radios');
    expect(prompt).toContain('EXCLUSIVELY');
  });

  it('should not include topic section when not provided', () => {
    const prompt = generateLLMSystemPrompt('newspaper');
    expect(prompt).not.toContain('topic_constraint');
  });
});

describe('generateLLMPrompt', () => {
  it('should return system and user prompts', () => {
    const { system, user } = generateLLMPrompt('Sony Walkman history', 'newspaper');
    expect(system).toContain('physics_constraints');
    expect(system).toContain('Sony Walkman history');
    expect(user).toContain('Sony Walkman history');
    expect(user).toContain('newspaper-style');
  });

  it('should use default preset when not specified', () => {
    const { system } = generateLLMPrompt('Test topic');
    expect(system).toContain('3 words max'); // newspaper default
  });
});
