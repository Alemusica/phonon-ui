# 🔮 Phonon UI

> **LLM-Driven Rendering Framework with Swiss Typography**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

**Phonon UI** è un framework/libreria che unisce:
- 🤖 **LLM Integration** — Streaming parser, comandi AI, WebLLM locale
- 🎨 **Swiss Typography** — Design system minimalista ispirato alla tipografia svizzera
- ✍️ **Markdown Rendering** — Stile Medium/ChatGPT con typewriter effect
- 📐 **PHI-Based Spacing** — Sistema di spacing basato sul rapporto aureo

---

## ✨ Features

### LLM Core
- **Multi-Provider Support** — Groq, OpenAI, Gemini, Anthropic
- **WebLLM Fallback** — Esecuzione locale via WebGPU per privacy/offline
- **Streaming Parser** — Parse incrementale di comandi `[RENDER:]` e `[ACTION:]`
- **Humanized Typing** — Effetto typewriter con pause naturali su punteggiatura

### Swiss Design System
- **Font Stack** — Space Grotesk (display), Inter (body), IBM Plex Mono (code)
- **Color Palette** — Soft contrast con accenti natura (sage, lake, warm)
- **PHI Spacing** — Sistema di spacing basato su φ (1.618)
- **Swiss Grid** — Background grid opzionale

### Components
- **ChatWidget** — Chat completa con streaming e comandi
- **Typewriter** — Effetto typing configurabile
- **MarkdownRenderer** — Rendering MD stile Medium
- **SwissTypography** — Componenti tipografici pre-stilizzati

---

## 📦 Installation

```bash
# npm
npm install phonon-ui

# bun
bun add phonon-ui

# pnpm
pnpm add phonon-ui
```

---

## 🚀 Quick Start

### 1. Setup Provider

```tsx
import { PhononProvider, PhononTheme } from 'phonon-ui';

function App() {
  return (
    <PhononProvider 
      theme={PhononTheme.swiss}
      llmConfig={{
        provider: 'groq',
        apiKey: process.env.GROQ_API_KEY,
        model: 'llama-3.3-70b-versatile'
      }}
    >
      <YourApp />
    </PhononProvider>
  );
}
```

### 2. Use Components

```tsx
import { 
  ChatWidget, 
  MarkdownRenderer, 
  SwissHeading,
  useChat 
} from 'phonon-ui';

function ChatPage() {
  const { messages, sendMessage, isStreaming } = useChat();
  
  return (
    <div className="phonon-container">
      <SwissHeading level={1}>Chat</SwissHeading>
      
      <ChatWidget
        messages={messages}
        onSend={sendMessage}
        isLoading={isStreaming}
        typingSpeed="fast"
      />
    </div>
  );
}
```

### 3. Markdown with Typewriter

```tsx
import { MarkdownRenderer, Typewriter } from 'phonon-ui';

function Article() {
  return (
    <MarkdownRenderer 
      content={markdownContent}
      typewriter={true}
      typingSpeed="normal"
    />
  );
}
```

---

## 🎨 Theming

### Built-in Themes

```tsx
import { PhononTheme } from 'phonon-ui';

// Swiss Dark (default)
PhononTheme.swiss

// Swiss Light  
PhononTheme.swissLight

// Minimal (black/white)
PhononTheme.minimal

// Custom
const customTheme = {
  colors: {
    background: 'hsl(220 12% 10%)',
    foreground: 'hsl(40 15% 88%)',
    primary: 'hsl(40 18% 82%)',
    accent: {
      sage: 'hsl(150 22% 42%)',
      lake: 'hsl(200 25% 45%)',
      warm: 'hsl(35 35% 65%)',
    },
  },
  typography: {
    fontDisplay: 'Space Grotesk',
    fontBody: 'Inter',
    fontMono: 'IBM Plex Mono',
  },
  spacing: 'phi', // or 'linear'
};
```

### CSS Variables

```css
/* Override in your CSS */
:root {
  --phonon-bg: hsl(220 12% 10%);
  --phonon-fg: hsl(40 15% 88%);
  --phonon-primary: hsl(40 18% 82%);
  --phonon-accent-1: hsl(150 22% 42%);
  
  /* Typography */
  --phonon-font-display: 'Space Grotesk', sans-serif;
  --phonon-font-body: 'Inter', sans-serif;
  
  /* PHI Spacing */
  --phonon-space-xs: 0.382rem;
  --phonon-space-sm: 0.618rem;
  --phonon-space-md: 1rem;
  --phonon-space-lg: 1.618rem;
  --phonon-space-xl: 2.618rem;
}
```

---

## 🤖 LLM Integration

### Command Protocol

Phonon UI supporta comandi inline che l'AI può usare per controllare l'UI:

```
[RENDER:{"type":"component","props":{...}}]
[ACTION:{"type":"navigate","to":"/page"}]
```

### Custom Commands

```tsx
import { useCommandHandler } from 'phonon-ui';

function App() {
  useCommandHandler({
    'custom-action': (data) => {
      console.log('Custom action:', data);
    },
    'render-widget': (data) => {
      return <MyWidget {...data} />;
    }
  });
}
```

### WebLLM (Local)

```tsx
import { useWebLLM } from 'phonon-ui';

function OfflineChat() {
  const { 
    isSupported, 
    initialize, 
    chat, 
    progress 
  } = useWebLLM();
  
  if (!isSupported) {
    return <p>WebGPU not supported</p>;
  }
  
  return (
    <button onClick={() => initialize('small')}>
      Load Local Model ({progress}%)
    </button>
  );
}
```

---

## 📐 Typography Components

```tsx
import { 
  SwissHero,      // Huge display text (4-12rem)
  SwissDisplay,   // Large headings (3-6rem)
  SwissHeading,   // Section headings
  SwissBody,      // Body text with phi line-height
  SwissCaption,   // Small captions
  SwissLabel,     // Monospace uppercase labels
  SwissIndex,     // Giant index numbers
} from 'phonon-ui';

// Examples
<SwissHero>INNESTI</SwissHero>
<SwissDisplay>Welcome</SwissDisplay>
<SwissHeading level={2}>About</SwissHeading>
<SwissLabel>01 — Introduction</SwissLabel>
```

---

## 🔧 API Reference

### PhononProvider

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `PhononTheme \| object` | `swiss` | Theme configuration |
| `llmConfig` | `LLMConfig` | - | LLM provider settings |
| `children` | `ReactNode` | - | App content |

### ChatWidget

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `messages` | `Message[]` | `[]` | Chat messages |
| `onSend` | `(msg: string) => void` | - | Send handler |
| `typingSpeed` | `'instant' \| 'fast' \| 'normal' \| 'slow'` | `'fast'` | Typewriter speed |
| `placeholder` | `string` | `'Type...'` | Input placeholder |

### useChat

```tsx
const {
  messages,           // Message[]
  sendMessage,        // (content: string) => void
  isStreaming,        // boolean
  clearHistory,       // () => void
  executeCommand,     // (cmd: ParsedCommand) => void
} = useChat(options);
```

### useWebLLM

```tsx
const {
  isSupported,    // boolean - WebGPU available
  isLoading,      // boolean - Model loading
  isReady,        // boolean - Ready to chat
  progress,       // number - Download progress 0-1
  initialize,     // (size: ModelSize) => Promise<boolean>
  chat,           // AsyncGenerator for streaming
  unload,         // () => Promise<void>
} = useWebLLM();
```

---

## 📁 Project Structure

```
phonon-ui/
├── packages/
│   ├── core/               # Core hooks & utilities
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   ├── useWebLLM.ts
│   │   │   ├── useStreamingParser.ts
│   │   │   └── useCommandHandler.ts
│   │   └── utils/
│   ├── components/         # React components
│   │   ├── chat/
│   │   ├── typography/
│   │   └── markdown/
│   ├── themes/             # Theme presets
│   └── styles/             # CSS & Tailwind
├── apps/
│   └── docs/               # Documentation site
└── examples/
    ├── basic/
    └── full-app/
```

---

## 🧪 Development

```bash
# Clone
git clone https://github.com/Alemusica/phonon-ui.git
cd phonon-ui

# Install
bun install

# Dev (with hot reload)
bun run dev

# Build
bun run build

# Test
bun run test

# Lint
bun run lint
```

---

## 📄 License

MIT © Alessio Cazzaniga

---

## 🙏 Credits

Inspired by:
- [Golden Helix Studio](https://8i8.art) — Conversational portfolio concept
- [Innesti](https://innesti.art) — Swiss typography design system
- [shadcn/ui](https://ui.shadcn.com) — Component architecture
- [Vercel AI SDK](https://sdk.vercel.ai) — Streaming patterns

---

<p align="center">
  Built with 🦋 by <a href="https://8i8.art">Flutur</a>
</p>
