# LLMS.md - Agent-Ingestable Documentation

> For AI/LLM consumption. Structured for automated site generation.

## IDENTITY

**Phonon UI** = React framework for LLM-driven rendering with Swiss Typography.

- **Type**: Metasite framework (interactive AI-controlled sites)
- **Stack**: React 18, TypeScript, TailwindCSS
- **Design**: Swiss Typography, PHI spacing (1.618 golden ratio)

## ARCHITECTURE

```
METASITE = Site + LLM + RAG + Commands

User ←→ ChatWidget ←→ LLM Provider ←→ Streaming Parser
                                            ↓
                                    [RENDER:] → Components
                                    [ACTION:] → Navigation/State
```

### Layer Hierarchy (DNA System)
```
Layer 0: TERRAIN  → Viewport (the world)
Layer 1: WALLS    → Containers (collision boxes)
Layer 2: STEMS    → Columns, dividers (support)
Layer 3: PETALS   → Content (text, images)
Layer 4: POLLEN   → Decorations (shadows)
```

## QUICK START

### 1. Install
```bash
npm install phonon-ui
```

### 2. Import CSS
```tsx
import 'phonon-ui/styles/globals.css';
```

### 3. Wrap App
```tsx
import { PhononProvider } from 'phonon-ui';

function App() {
  return (
    <PhononProvider>
      <YourSite />
    </PhononProvider>
  );
}
```

## COMPONENTS API

### Typography Components

| Component | Props | Use |
|-----------|-------|-----|
| `SwissHero` | `children` | Giant display (4-12rem) |
| `SwissDisplay` | `children` | Large heading (3-6rem) |
| `SwissHeading` | `level: 1-6`, `children` | Section headings |
| `SwissBody` | `children` | Body text |
| `SwissCaption` | `children` | Small captions |
| `SwissLabel` | `children` | Monospace labels |
| `SwissIndex` | `n: number` | Giant index "01" |

### Chat Components

```tsx
import { ChatWidget, useChat } from 'phonon-ui';

function Chat() {
  const { messages, sendMessage, isStreaming } = useChat();

  return (
    <ChatWidget
      messages={messages}
      onSend={sendMessage}
      isLoading={isStreaming}
    />
  );
}
```

### Markdown Renderer

```tsx
import { MarkdownRenderer } from 'phonon-ui';

<MarkdownRenderer
  content={markdown}
  typewriter={true}      // Enable typing effect
  typingSpeed="fast"     // instant|fast|normal|slow
/>
```

## Typewriter Speed Control

PHI-based rhythmic timing derived from reading research (Brysbaert 2019).

### Speed Presets

| Preset | Delay | WPM | Use Case |
|--------|-------|-----|----------|
| `instant` | 0ms | ∞ | No animation |
| `fast` | 25ms | ~400 | Notifications, quick scan |
| `normal` | 40ms | ~300 | Comfortable reading |
| `slow` | 65ms | ~185 | Relaxed, enjoyable |
| `study` | 105ms | ~115 | Learning, memorization |

### Runtime Speed Control (LLM API)

```tsx
import { setTypingSpeedMultiplier, getTypingSpeedMultiplier } from 'phonon-ui';

// LLM command: [ACTION:{"type":"setTypingSpeed","value":0.5}]
setTypingSpeedMultiplier(0.5);  // 2x faster
setTypingSpeedMultiplier(1.0);  // Normal
setTypingSpeedMultiplier(2.0);  // 2x slower

// Check current value
const current = getTypingSpeedMultiplier();
```

### Typewriter Component

```tsx
<Typewriter
  text="Hello world"
  speed="normal"      // Preset: instant|fast|normal|slow|study
  fadeIn={true}       // Smooth fade-in (ChatGPT style)
  fadeInChars={2}     // Characters that fade in
  showCursor={true}   // Blinking cursor
/>
```

### Video Components

```tsx
// Background video with DNA audio hierarchy
import { useVideoBackground, VideoControls } from 'phonon-ui';

const { state, play, pause, setVolume, mute, unmute } = useVideoBackground(
  'https://example.com/bg.mp4',
  0.7,  // Initial volume
  false // Start muted
);

<VideoControls
  isPlaying={state.isPlaying}
  volume={state.volume}
  isMuted={state.isMuted}
  onPlayPause={state.isPlaying ? pause : play}
  onVolumeChange={setVolume}
  onMuteToggle={state.isMuted ? unmute : mute}
  position="bottom-right"
/>
```

```tsx
// Newspaper video vignette
import { VideoVignette } from 'phonon-ui';

<VideoVignette
  src="/video.mp4"
  poster="/thumbnail.jpg"
  caption="Fig. 1 — Interview segment"
  aspectRatio="16/9"
  autoPlay={false}
  loop={true}
  muted={true}
/>
```

### Media Context (DNA Audio Hierarchy)

```tsx
import { MediaProvider, useMedia } from 'phonon-ui';

// Wrap app
<MediaProvider>
  <App />
</MediaProvider>

// Use anywhere
const {
  // State
  videoUrl, videoPlaying, videoMuted,
  musicTrack, musicPlaying, musicVolume,
  voicePlaying, voiceVolume,
  audioPriority, // 'video' | 'music' | 'voice' | null

  // Actions
  setVideoBackground,
  clearVideoBackground,
  toggleVideoAudio,
  setMusicTrack,
  stopMusic,
  setVoicePlaying,
  setMusicVolume,
  setVoiceVolume,
} = useMedia();

// DNA Pattern: Last audio wins
// Voice > Music > Video (priority order)
// When voice activates: music stops, video mutes
// When music activates: video mutes
```

## CSS VARIABLES

```css
/* Apply theme */
:root {
  /* Colors */
  --phonon-bg: hsl(220 12% 10%);
  --phonon-fg: hsl(40 15% 88%);
  --phonon-primary: hsl(40 18% 82%);
  --phonon-accent-sage: hsl(150 22% 42%);
  --phonon-accent-lake: hsl(200 25% 45%);

  /* Typography */
  --phonon-font-display: 'Space Grotesk', sans-serif;
  --phonon-font-body: 'Inter', sans-serif;
  --phonon-font-mono: 'IBM Plex Mono', monospace;

  /* PHI Spacing (Golden Ratio) */
  --phonon-space-xs: 0.382rem;  /* 1/φ² */
  --phonon-space-sm: 0.618rem;  /* 1/φ */
  --phonon-space-md: 1rem;      /* base */
  --phonon-space-lg: 1.618rem;  /* φ */
  --phonon-space-xl: 2.618rem;  /* φ² */
  --phonon-space-xxl: 4.236rem; /* φ³ */
}
```

## LLM COMMAND PROTOCOL

### RENDER Command
LLM outputs special tags to render components:

```
[RENDER:{"type":"chart","props":{"data":[1,2,3]}}]
```

### ACTION Command
LLM outputs actions for navigation/state:

```
[ACTION:{"type":"navigate","to":"/about"}]
[ACTION:{"type":"theme","value":"dark"}]
```

### Custom Command Handler

```tsx
import { useCommandHandler } from 'phonon-ui';

useCommandHandler({
  'my-chart': (data) => <Chart {...data} />,
  'my-action': (data) => console.log(data),
});
```

## BUILDING A SITE

### Step 1: Create Layout

```tsx
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--phonon-bg)]">
      <nav className="p-[var(--phonon-space-lg)]">
        <SwissLabel>My Site</SwissLabel>
      </nav>
      <main className="max-w-4xl mx-auto p-[var(--phonon-space-xl)]">
        {children}
      </main>
    </div>
  );
}
```

### Step 2: Create Pages

```tsx
function HomePage() {
  return (
    <>
      <SwissHero>WELCOME</SwissHero>
      <SwissBody>
        Site content here.
      </SwissBody>
    </>
  );
}
```

### Step 3: Add Chat

```tsx
function ChatPage() {
  const { messages, sendMessage, isStreaming } = useChat({
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
  });

  return (
    <ChatWidget
      messages={messages}
      onSend={sendMessage}
      isLoading={isStreaming}
    />
  );
}
```

### Step 4: Add Video Background

```tsx
function VideoPage() {
  const video = useVideoBackground('/bg.mp4');

  return (
    <div ref={video.containerRef} className="relative min-h-screen">
      <video
        ref={video.videoRef}
        className="fixed inset-0 w-full h-full object-cover -z-10"
        autoPlay
        loop
        muted={video.state.isMuted}
      />
      <VideoControls
        isPlaying={video.state.isPlaying}
        volume={video.state.volume}
        isMuted={video.state.isMuted}
        onPlayPause={video.state.isPlaying ? video.pause : video.play}
        onVolumeChange={video.setVolume}
        onMuteToggle={video.state.isMuted ? video.unmute : video.mute}
      />
      <div className="relative z-10">
        <SwissHero>CONTENT OVER VIDEO</SwissHero>
      </div>
    </div>
  );
}
```

## DNA DESIGN PRINCIPLES

### Physics Rules
1. **No horizontal overflow** - Content blocked at viewport edge
2. **Words are atomic** - Never break mid-word
3. **Elastic compression** - Elements can shrink under pressure

### Biology Rules
1. **Growth hierarchy** - Terrain → Walls → Stems → Petals → Pollen
2. **Containment** - Petals in stems, stems in walls, walls in terrain
3. **Importance** - Lower importance removed first under pressure

### Optics Rules
1. **Contrast minimum** - 4.5:1 ratio (WCAG AA)
2. **Safe pairs** - Black on cream, white on dark
3. **Color coupling** - Complementary accents

### Linguistics Rules
1. **PHI scale** - Typography sizes follow golden ratio
2. **Line length** - 65-70 characters optimal
3. **Leading** - 1.5 for body, 1.1 for headlines

## METASITE CONCEPT

A **metasite** is an interactive installation where:

1. **LLM is the guide** - Chat controls navigation and content
2. **Commands render UI** - `[RENDER:]` and `[ACTION:]` tags
3. **RAG provides context** - Site content as vector database
4. **Voice synthesis** - Optional TTS for narration

### Metasite Architecture

```
┌─────────────────────────────────────────────────────┐
│                    METASITE                          │
│                                                     │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   RAG DB      │  │  LLM Core    │  │   TTS    │ │
│  │  (site docs)  │→ │  (Groq/Local)│→ │ (Voice)  │ │
│  └───────────────┘  └──────────────┘  └──────────┘ │
│           ↓                ↓               ↓        │
│  ┌─────────────────────────────────────────────────┐│
│  │              Streaming Parser                    ││
│  │         [RENDER:] → [ACTION:] → Text            ││
│  └─────────────────────────────────────────────────┘│
│           ↓                ↓               ↓        │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │  Components  │ │    Router    │ │  Typewriter │ │
│  └──────────────┘ └──────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Example Metasite Prompt

```
You are the guide for this portfolio site. Available commands:

[RENDER:{"type":"project","id":"project-1"}] - Show project card
[ACTION:{"type":"navigate","to":"/about"}] - Navigate to page
[ACTION:{"type":"audio","track":"ambient-1"}] - Play background music

Site sections: home, about, projects, contact

User is on: {current_page}
RAG context: {relevant_docs}
```

## FILE STRUCTURE

```
src/
├── index.ts              # Main exports
├── components/
│   ├── index.ts          # Component exports
│   ├── ChatWidget.tsx    # Chat UI
│   ├── MarkdownRenderer.tsx
│   ├── SwissTypography.tsx
│   ├── VideoControls.tsx
│   └── VideoVignette.tsx
├── core/
│   ├── index.ts          # Hook exports
│   ├── use-chat.ts       # Chat hook
│   ├── use-typewriter.ts
│   ├── use-video-background.ts
│   ├── design-dna.ts     # DNA system
│   └── utils.ts          # Utilities (cn, etc.)
├── contexts/
│   └── MediaContext.tsx  # Audio/video state
├── themes/
│   └── swiss.ts          # Theme configs
└── styles/
    └── globals.css       # Global styles
```

## EXPORT MAP

```typescript
// Components
export { ChatWidget } from './components';
export { MarkdownRenderer } from './components';
export { SwissHero, SwissDisplay, SwissHeading } from './components';
export { SwissBody, SwissCaption, SwissLabel } from './components';
export { VideoControls, VideoVignette } from './components';

// Hooks
export { useChat } from './core';
export { useTypewriter } from './core';
export { useVideoBackground } from './core';
export { useWebLLM } from './core';

// Context
export { MediaProvider, useMedia } from './contexts/MediaContext';

// DNA System
export { DNA_LIBRARY, LINGUISTICS, OPTICS_LIGHT, OPTICS_DARK } from './core/design-dna';
export { generateLLMPrompt, generateLLMSystemPrompt } from './core/design-dna';

// Utils
export { cn } from './core/utils';
```

## COMMON PATTERNS

### Pattern 1: Landing Page

```tsx
<div className="min-h-screen flex flex-col items-center justify-center">
  <SwissIndex n={1} />
  <SwissHero>SITE NAME</SwissHero>
  <SwissCaption>Tagline here</SwissCaption>
</div>
```

### Pattern 2: Article Layout

```tsx
<article className="max-w-2xl mx-auto">
  <SwissLabel>01 — Category</SwissLabel>
  <SwissHeading level={1}>Article Title</SwissHeading>
  <SwissBody>
    <MarkdownRenderer content={markdown} typewriter />
  </SwissBody>
</article>
```

### Pattern 3: Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--phonon-space-lg)]">
  {items.map(item => (
    <div key={item.id} className="border border-[var(--phonon-border)]">
      <SwissLabel>{item.label}</SwissLabel>
      <SwissHeading level={3}>{item.title}</SwissHeading>
    </div>
  ))}
</div>
```

### Pattern 4: Chat Interface

```tsx
<div className="h-screen flex flex-col">
  <header className="p-4 border-b">
    <SwissLabel>Chat</SwissLabel>
  </header>
  <main className="flex-1 overflow-auto p-4">
    {messages.map(m => (
      <MarkdownRenderer key={m.id} content={m.content} />
    ))}
  </main>
  <footer className="p-4 border-t">
    <ChatInput onSend={sendMessage} />
  </footer>
</div>
```

## TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Styles not loading | Import `phonon-ui/styles/globals.css` |
| Chat not streaming | Check LLM provider API key |
| Typewriter too fast | Set `typingSpeed="slow"` |
| Video not playing | Check browser autoplay policy |
| Audio hierarchy wrong | Verify MediaProvider wraps app |

## VERSION

- Package: `phonon-ui@0.1.0`
- React: `^18.3.0`
- TypeScript: `^5.8.0`

---

*Generated for LLM consumption. Keep concise.*
