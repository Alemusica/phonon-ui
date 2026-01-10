/**
 * Phonon UI - Development App
 *
 * Visual testing playground for all components.
 */

import { useState } from 'react';
import {
  ChatWidget,
  useChat,
  MarkdownRenderer,
  Typewriter,
  SwissHero,
  SwissDisplay,
  SwissHeading,
  SwissSubheading,
  SwissBody,
  SwissLabel,
  SwissIndex,
} from '../index';

// Simulated LLM streaming response
async function* simulateLLMResponse(): AsyncGenerator<string> {
  const response = `Questa è una **demo** di Phonon UI!

Le features includono:
- Streaming parser per comandi LLM
- Typewriter effect umanizzato
- Swiss typography design system
- Supporto WebLLM per esecuzione locale

\`\`\`typescript
const { messages, sendMessage } = useChat();
\`\`\`

> "La tipografia svizzera è pura eleganza."

---

Prova a scrivere qualcosa!`;

  for (const char of response) {
    yield char;
    await new Promise(r => setTimeout(r, 15));
  }
}

function ChatDemo() {
  const {
    messages,
    addMessage,
    updateLastMessage,
    isStreaming,
    setIsStreaming,
  } = useChat();

  const handleSend = async (content: string) => {
    addMessage('user', content);
    setIsStreaming(true);
    addMessage('assistant', '');

    let fullResponse = '';
    for await (const chunk of simulateLLMResponse()) {
      fullResponse += chunk;
      updateLastMessage(fullResponse);
    }

    setIsStreaming(false);
  };

  return (
    <div className="h-[500px] border border-border rounded-lg overflow-hidden">
      <ChatWidget
        messages={messages}
        onSend={handleSend}
        isStreaming={isStreaming}
        typingSpeed="fast"
        placeholder="Scrivi un messaggio..."
      />
    </div>
  );
}

function TypographyDemo() {
  return (
    <div className="space-y-8">
      <div className="relative">
        <SwissIndex className="absolute -left-4 -top-8 opacity-20">01</SwissIndex>
        <SwissHero>PHONON</SwissHero>
      </div>

      <SwissDisplay>Swiss Typography</SwissDisplay>

      <SwissHeading level={1}>Heading Level 1</SwissHeading>
      <SwissHeading level={2}>Heading Level 2</SwissHeading>
      <SwissHeading level={3}>Heading Level 3</SwissHeading>

      <SwissSubheading>Subheading with elegant spacing</SwissSubheading>

      <SwissBody>
        Body text with PHI-based line height (1.618).
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </SwissBody>

      <SwissLabel>01 — Label Component</SwissLabel>
    </div>
  );
}

function TypewriterDemo() {
  const [key, setKey] = useState(0);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <Typewriter
          key={key}
          text="Questo testo appare con effetto typewriter umanizzato..."
          speed="normal"
          showCursor={true}
        />
      </div>
      <button
        onClick={() => setKey(k => k + 1)}
        className="px-4 py-2 bg-sage text-background rounded hover:bg-sage/90 transition-colors"
      >
        Replay
      </button>
    </div>
  );
}

function MarkdownDemo() {
  const markdown = `
# Markdown Renderer

Questo componente supporta **GFM** (GitHub Flavored Markdown).

## Features

- Liste puntate
- **Bold** e *italic*
- [Links](https://example.com)
- \`inline code\`

### Code Blocks

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

> Blockquotes con stile Swiss

---

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;

  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <MarkdownRenderer content={markdown} />
    </div>
  );
}

export function DevApp() {
  const [activeTab, setActiveTab] = useState<'chat' | 'typography' | 'typewriter' | 'markdown'>('chat');

  const tabs = [
    { id: 'chat', label: 'Chat' },
    { id: 'typography', label: 'Typography' },
    { id: 'typewriter', label: 'Typewriter' },
    { id: 'markdown', label: 'Markdown' },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="phonon-container py-6">
          <SwissLabel>Phonon UI</SwissLabel>
          <SwissHeading level={1} className="mt-2">Development Playground</SwissHeading>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-border">
        <div className="phonon-container flex gap-1 py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-sage text-background'
                  : 'hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="phonon-container py-8">
        {activeTab === 'chat' && <ChatDemo />}
        {activeTab === 'typography' && <TypographyDemo />}
        {activeTab === 'typewriter' && <TypewriterDemo />}
        {activeTab === 'markdown' && <MarkdownDemo />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="phonon-container py-4 text-muted-foreground text-sm">
          Phonon UI v0.1.0 — Swiss Typography + LLM-Driven Rendering
        </div>
      </footer>
    </div>
  );
}
