/**
 * Phonon UI - Development App
 *
 * Visual testing playground for all components.
 */

import { useState, useEffect } from 'react';
import {
  ChatWidget,
  useChat,
  useProactiveChat,
  MarkdownRenderer,
  Typewriter,
  SwissHero,
  SwissDisplay,
  SwissHeading,
  SwissSubheading,
  SwissBody,
  SwissLabel,
  SwissIndex,
  SwissImage,
  CTAButton,
  ConfirmButton,
  QuickReplyButton,
  QuickReplyGroup,
  Button,
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

function ButtonsDemo() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <SwissLabel>CTA Buttons</SwissLabel>
        <div className="flex gap-4 mt-4">
          <CTAButton onClick={() => alert('CTA clicked!')}>
            Book Now
          </CTAButton>
          <CTAButton disabled>Disabled</CTAButton>
        </div>
      </div>

      <div>
        <SwissLabel>Confirm Buttons</SwissLabel>
        <div className="flex gap-4 mt-4">
          <ConfirmButton onClick={() => alert('Confirmed!')}>
            Confirm
          </ConfirmButton>
          <ConfirmButton onClick={() => alert('Cancelled!')}>
            Cancel
          </ConfirmButton>
        </div>
      </div>

      <div>
        <SwissLabel>Quick Reply Buttons</SwissLabel>
        <QuickReplyGroup className="mt-4">
          {['DJ', 'Venue Owner', 'PR', 'Artist', 'Therapist'].map(role => (
            <QuickReplyButton
              key={role}
              isActive={selected === role}
              onClick={() => setSelected(role)}
            >
              {role}
            </QuickReplyButton>
          ))}
        </QuickReplyGroup>
        {selected && (
          <p className="mt-4 text-muted-foreground">Selected: {selected}</p>
        )}
      </div>

      <div>
        <SwissLabel>Button Variants</SwissLabel>
        <div className="flex gap-4 mt-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>
    </div>
  );
}

function ImageDemo() {
  return (
    <div className="space-y-8">
      <SwissLabel>Swiss Image Component</SwissLabel>

      <div className="grid grid-cols-2 gap-6">
        <SwissImage
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600"
          alt="DJ Performance"
          caption="Fig. 1 — Live DJ performance at venue"
          aspectRatio="16/9"
          rounded="md"
        />
        <SwissImage
          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600"
          alt="Music Studio"
          caption="Fig. 2 — Professional recording studio"
          aspectRatio="16/9"
          rounded="md"
        />
      </div>

      <SwissImage
        src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200"
        alt="Concert crowd"
        caption="Fig. 3 — Crowd at electronic music festival"
        aspectRatio="21/9"
        rounded="lg"
      />
    </div>
  );
}

function ProactiveChatDemo() {
  const {
    messages,
    addMessage,
    updateLastMessage,
    isStreaming,
    setIsStreaming,
  } = useChat();

  const {
    visitorRole,
    setVisitorRole,
    shouldEngage,
    engagementSuggestion,
    resetEngagement,
  } = useProactiveChat({
    proactivityLevel: 'engaging',
    visitorRoles: ['dj', 'venue_owner', 'pr', 'artist', 'therapist', 'yoga_teacher'],
    initialQuestion: 'Ciao! Cosa ti porta qui oggi?',
    engagementDelayMs: 2000,
  });

  // Show engagement suggestion
  useEffect(() => {
    if (shouldEngage && engagementSuggestion && messages.length === 0) {
      addMessage('assistant', engagementSuggestion);
      resetEngagement();
    }
  }, [shouldEngage, engagementSuggestion, messages.length, addMessage, resetEngagement]);

  const handleRoleSelect = async (role: string) => {
    setVisitorRole(role);
    addMessage('user', `Sono un ${role}`);
    setIsStreaming(true);
    addMessage('assistant', '');

    const responses: Record<string, string> = {
      dj: 'Fantastico! Stai cercando nuove venue per i tuoi set? Posso aiutarti a trovare locali che cercano DJ del tuo genere.',
      venue_owner: 'Perfetto! Gestisci un locale? Posso aiutarti a trovare artisti, organizzare eventi o promuovere le tue serate.',
      pr: 'Ottimo! Come PR, posso aiutarti a promuovere eventi, trovare collaborazioni o espandere il tuo network.',
      artist: 'Bellissimo! Che tipo di artista sei? Posso aiutarti a trovare opportunità di performance o collaborazioni.',
      therapist: 'Interessante! Stai cercando spazi per sessioni o vuoi promuovere i tuoi servizi?',
      yoga_teacher: 'Namaste! Cerchi location per le tue classi o vuoi connetterti con la community wellness?',
    };

    const response = responses[role] || 'Come posso aiutarti?';

    for (const char of response) {
      await new Promise(r => setTimeout(r, 20));
      updateLastMessage(response.slice(0, response.indexOf(char) + 1));
    }
    updateLastMessage(response);
    setIsStreaming(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <SwissLabel>Proactive Chat — Select Your Role</SwissLabel>
        <QuickReplyGroup className="mt-4">
          {[
            { id: 'dj', label: 'DJ' },
            { id: 'venue_owner', label: 'Venue Owner' },
            { id: 'pr', label: 'PR' },
            { id: 'artist', label: 'Artist' },
            { id: 'therapist', label: 'Therapist' },
            { id: 'yoga_teacher', label: 'Yoga Teacher' },
          ].map(role => (
            <QuickReplyButton
              key={role.id}
              isActive={visitorRole === role.id}
              onClick={() => handleRoleSelect(role.id)}
            >
              {role.label}
            </QuickReplyButton>
          ))}
        </QuickReplyGroup>
      </div>

      <div className="h-[400px] border border-border rounded-lg overflow-hidden">
        <ChatWidget
          messages={messages}
          onSend={(content) => {
            addMessage('user', content);
          }}
          isStreaming={isStreaming}
          typingSpeed="fast"
          placeholder="Scrivi un messaggio..."
        />
      </div>
    </div>
  );
}

export function DevApp() {
  const [activeTab, setActiveTab] = useState<'chat' | 'typography' | 'typewriter' | 'markdown' | 'buttons' | 'images' | 'proactive'>('proactive');

  const tabs = [
    { id: 'proactive', label: 'Proactive Chat' },
    { id: 'chat', label: 'Chat' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'images', label: 'Images' },
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
        {activeTab === 'proactive' && <ProactiveChatDemo />}
        {activeTab === 'chat' && <ChatDemo />}
        {activeTab === 'buttons' && <ButtonsDemo />}
        {activeTab === 'images' && <ImageDemo />}
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
