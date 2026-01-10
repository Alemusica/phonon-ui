# Phonon UI Roadmap

## Phase 1: Core Foundation (Current)

### Streaming Parser
- [x] Basic text streaming
- [ ] Command extraction `[RENDER:]`
- [ ] Action extraction `[ACTION:]`
- [ ] Error recovery (malformed commands)

### Typewriter Effect
- [x] Character-by-character rendering
- [x] Speed control (instant/fast/normal/slow)
- [ ] Natural pauses on punctuation
- [ ] Cursor animation

### Basic Components
- [x] ChatWidget structure
- [ ] Message bubbles
- [ ] Input with submit
- [ ] Loading states

---

## Phase 2: LLM Integration

### Remote Providers
- [ ] Groq (priority - fast)
- [ ] OpenAI compatible
- [ ] Anthropic
- [ ] Generic fetch adapter

### WebLLM Local
- [ ] WebGPU detection
- [ ] Model download with progress
- [ ] Inference integration
- [ ] Fallback chain (remote → local)

### Streaming Protocol
- [ ] Define command schema
- [ ] Render command handler
- [ ] Action command handler
- [ ] Custom command registry

---

## Phase 3: Swiss Design System

### Typography
- [ ] Font loading (Space Grotesk, Inter, IBM Plex)
- [ ] SwissHero component
- [ ] SwissDisplay component
- [ ] SwissHeading (h1-h6)
- [ ] SwissBody, Caption, Label

### Spacing
- [ ] PHI ratio calculator
- [ ] Tailwind plugin for phi-spacing
- [ ] CSS variable system

### Theming
- [ ] Swiss Dark theme
- [ ] Swiss Light theme
- [ ] Minimal theme
- [ ] Theme switcher hook

---

## Phase 4: Markdown & Rich Content

### Markdown Renderer
- [ ] GFM parsing (remark)
- [ ] Syntax highlighting (shiki)
- [ ] Math support (optional)
- [ ] Custom components

### Typewriter + Markdown
- [ ] Stream markdown parsing
- [ ] Progressive rendering
- [ ] Code block handling

---

## Phase 5: Polish & Publish

### Build System
- [ ] ESM + CJS dual output
- [ ] Type declarations
- [ ] Tree-shaking verification
- [ ] Bundle size optimization

### Documentation
- [ ] API reference
- [ ] Examples
- [ ] Storybook or similar

### Testing
- [ ] Unit tests (hooks)
- [ ] Component tests
- [ ] E2E streaming tests

### Publish
- [ ] npm package
- [ ] GitHub releases
- [ ] Demo site

---

## Future Ideas

### Voice Integration
- Whisper for speech-to-text
- ElevenLabs/OpenAI TTS for responses

### Visual Commands
- Chart rendering
- Image generation triggers
- Canvas/animation commands

### Collaboration
- Shared chat sessions
- Real-time sync

### IDE Integration
- VS Code extension
- Monaco editor embed
