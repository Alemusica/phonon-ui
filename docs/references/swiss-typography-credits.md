# Swiss Typography References & Credits

Design inspiration and code references for Phonon UI's Swiss Typography system.

---

## PRIMARY REFERENCE - Newspaper Editorial Style

### Silke V (PRO) — Newspaper Style Design Experiment

**THIS IS THE TARGET STYLE FOR PHONON UI AI-RENDERED MARKDOWN**

| Feature | Implementation |
|---------|---------------|
| **Fonts** | Playfair Display (headlines) + Droid Serif (body) |
| **Layout** | Multi-column newspaper (17.5% width columns) |
| **Headlines** | 6+ hierarchy levels (hl1-hl6) with decorative borders |
| **Pull Quotes** | Large serif text with border decorations |
| **Images** | Sepia filter + grayscale + mix-blend-mode: multiply |
| **Responsive** | Columns collapse: 5 → 3 → 2 → 1 |

**Key CSS Patterns:**
```css
/* Headline with decorative borders */
.citation:before, .citation:after {
  border-top: 1px solid #2f2f2f;
  content: '';
  width: 100px;
  display: block;
  margin: 0 auto;
}

/* Vintage photo effect */
.media {
  filter: sepia(80%) grayscale(1) contrast(1) opacity(0.8);
  mix-blend-mode: multiply;
}

/* Column dividers */
.collumn + .collumn {
  border-left: 1px solid #2f2f2f;
}
```

---

## CodePen Authors

### Henry Desroches (PRO) — Swiss Poster Collection
Henry has recreated numerous classic Swiss posters using pure CSS Grid. These are exceptional references for Phonon UI.

| Poster | Original Designer | Technique |
|--------|-------------------|-----------|
| Mediums of Language | Jacqueline Casey (MIT) | Staggered grid text, gradient background |
| Stadttheater Zürich 1959 | Unknown | Red/black split layout, program listing |
| Musica Viva (composers) | Josef Müller-Brockmann | Diagonal stripes, name hierarchy |
| Musica Viva (rotated) | Josef Müller-Brockmann | 45° rotated text, color blocks |
| Végh-quartett | Josef Müller-Brockmann | Geometric colored squares, cyan/green |
| Aus der Sammlung Kunsthaus Zürich | Max Bill style | Minimal geometric, L-shape |

**Stats:** 61+ likes, 1,725+ views on featured pen

### Other Authors

| Author | Pen | Technique |
|--------|-----|-----------|
| **Jon MacCaull** | Spotlight Dot Grid | CSS mask spotlight effect with mouse tracking |
| **Gina Svensson** | Vertigo: Animated Swiss Poster | Concentric circles animation, Saul Bass style |
| **Danil Deev** | Swiss typography (швейцарская типографика) | Cyrillic Swiss typography |
| **PLB** | Swiss Humanist Reading Typography | Readable Swiss layout with proper hierarchy |
| **John Blazek** (@johnblazek) | 3D Carousel TweenMax.js | 3D rotating carousel, mouse interaction, GSAP |

## Design Inspirations

### Historical References
- **Josef Müller-Brockmann** — Grid systems, Musica Viva posters
- **Helmut Schmid** — "Typography needs to be audible, felt, experienced"
- **Emil Ruder** — "Typography is a service art, not a fine art"
- **Jacqueline Casey** — MIT poster designs, Mediums of Language
- **Saul Bass** — Vertigo movie poster, geometric animation

### Typography Principles Applied
- **PHI Spacing** — Golden ratio (1.618) for all spacing
- **Tight Leading** — Line-height 1.1-1.45 for Swiss feel
- **Letter Spacing** — Negative tracking for display text (-0.02em to -0.04em)
- **Font Stack** — Space Grotesk, Inter, IBM Plex Mono
- **Grid System** — 48px base grid, asymmetric layouts

## License Note

All CodePen examples are used for reference and learning purposes.
Original authors retain copyright of their work.
Phonon UI's implementation is original code inspired by these techniques.

---

*Last updated: 2026-01-10*
