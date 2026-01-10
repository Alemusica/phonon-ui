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
import { parseStreamingContent, ParsedCommand } from '../core/streaming-parser';
import type { Message } from '../core/use-chat';

// Demo responses with embedded commands
const DEMO_RESPONSES: Record<string, string> = {
  hello: `Ciao! Benvenuto in **Phonon UI** — il framework per rendering LLM-driven con Swiss Typography.

Prova questi comandi:
- "mostra card" — esempio di componente dinamico
- "grafico vendite" — rendering di un chart
- "immagine" — inserisci un'immagine Swiss-style
- "pulsanti" — bottoni interattivi`,

  'mostra card': `Ecco una **Product Card** renderizzata dinamicamente:

[RENDER:{"type":"card","props":{"title":"Phonon Framework","description":"LLM-driven UI con Swiss Typography","price":"€49/mo","features":["Streaming Parser","WebLLM Support","PHI Spacing","Type Safety"]}}]

Questo componente è stato generato dal comando \`[RENDER:...]\` parsato in streaming!`,

  'grafico vendite': `Analizziamo i dati di **vendita Q4 2025**:

[RENDER:{"type":"chart","props":{"data":[{"month":"Oct","value":45},{"month":"Nov","value":62},{"month":"Dec","value":78}],"title":"Revenue Growth","type":"bar"}}]

Il parser estrae i comandi anche durante lo streaming, permettendo rendering incrementale.`,

  immagine: `Le immagini in Phonon UI seguono i **principi Swiss**:

[RENDER:{"type":"image","props":{"src":"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800","alt":"Abstract Swiss Design","caption":"Fig. 1 — Geometric abstraction in Swiss modernism","aspectRatio":"16/9"}}]

Nota il caption numerato e l'aspect ratio PHI-based.`,

  pulsanti: `Ecco alcuni **CTA buttons** interattivi:

[RENDER:{"type":"buttons","props":{"buttons":[{"label":"Conferma Prenotazione","variant":"cta","action":"book"},{"label":"Scopri di più","variant":"secondary","action":"learn"},{"label":"Contattaci","variant":"ghost","action":"contact"}]}}]

I bottoni seguono la **Swiss Design** philosophy: chiarezza, precisione, funzionalità.`,

  default: `Interessante domanda!

Phonon UI combina:
- **Streaming Parser** per comandi embedded
- **Golden Ratio** (φ = 1.618) per spacing
- **Swiss Typography** (Space Grotesk, Inter, IBM Plex Mono)
- **WebLLM** per esecuzione locale

Vuoi vedere altri esempi? Prova "mostra card" o "grafico vendite"!`,
};

// Simulated LLM streaming response with command support
async function* simulateLLMResponse(userMessage: string): AsyncGenerator<string> {
  const message = userMessage.toLowerCase().trim();
  let response = DEMO_RESPONSES.default;

  // Match user input to demo responses
  if (message.includes('ciao') || message.includes('hello') || message.includes('hi')) {
    response = DEMO_RESPONSES.hello;
  } else if (message.includes('card')) {
    response = DEMO_RESPONSES['mostra card'];
  } else if (message.includes('grafico') || message.includes('vendite') || message.includes('chart')) {
    response = DEMO_RESPONSES['grafico vendite'];
  } else if (message.includes('immagine') || message.includes('image') || message.includes('foto')) {
    response = DEMO_RESPONSES.immagine;
  } else if (message.includes('pulsant') || message.includes('button') || message.includes('cta')) {
    response = DEMO_RESPONSES.pulsanti;
  }

  // Stream character by character
  for (const char of response) {
    yield char;
    await new Promise(r => setTimeout(r, 12));
  }
}

// Dynamic component renderer for [RENDER:...] commands
interface DynamicComponentProps {
  command: ParsedCommand;
}

function DynamicComponent({ command }: DynamicComponentProps) {
  const { type, props } = command.data as { type: string; props: Record<string, unknown> };

  // Product Card Component
  if (type === 'card') {
    const { title, description, price, features } = props as {
      title: string;
      description: string;
      price: string;
      features: string[];
    };
    return (
      <div className="my-4 p-6 border border-border rounded-lg bg-card space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <SwissHeading level={3}>{title}</SwissHeading>
            <SwissBody className="mt-2 text-muted-foreground">{description}</SwissBody>
          </div>
          <SwissHeading level={2} className="text-sage">{price}</SwissHeading>
        </div>
        <div className="space-y-2">
          {features.map((feature: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-sage" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <CTAButton className="w-full">Get Started</CTAButton>
      </div>
    );
  }

  // Chart Component
  if (type === 'chart') {
    const { data, title } = props as {
      data: Array<{ month: string; value: number }>;
      title: string;
    };
    const maxValue = Math.max(...data.map(d => d.value));
    return (
      <div className="my-4 p-6 border border-border rounded-lg bg-card space-y-4">
        <SwissLabel>{title}</SwissLabel>
        <div className="flex items-end justify-between gap-4 h-32">
          {data.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-muted rounded-t flex items-end overflow-hidden">
                <div
                  className="w-full bg-sage transition-all duration-500"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.month}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Image Component
  if (type === 'image') {
    const { src, alt, caption, aspectRatio } = props as {
      src: string;
      alt: string;
      caption: string;
      aspectRatio: '1/1' | '4/3' | '16/9' | '21/9' | 'auto';
    };
    return (
      <div className="my-4">
        <SwissImage
          src={src}
          alt={alt}
          caption={caption}
          aspectRatio={aspectRatio || '16/9'}
          rounded="md"
        />
      </div>
    );
  }

  // Buttons Component
  if (type === 'buttons') {
    const { buttons } = props as {
      buttons: Array<{ label: string; variant: string; action: string }>;
    };
    return (
      <div className="my-4 flex flex-wrap gap-3">
        {buttons.map((btn, i) => {
          if (btn.variant === 'cta') {
            return <CTAButton key={i} onClick={() => alert(`Action: ${btn.action}`)}>{btn.label}</CTAButton>;
          }
          if (btn.variant === 'secondary') {
            return <Button key={i} variant="secondary" onClick={() => alert(`Action: ${btn.action}`)}>{btn.label}</Button>;
          }
          return <Button key={i} variant="ghost" onClick={() => alert(`Action: ${btn.action}`)}>{btn.label}</Button>;
        })}
      </div>
    );
  }

  return null;
}

// Enhanced ChatMessage component with command rendering
interface EnhancedChatMessageProps {
  message: Message;
  isLast: boolean;
  isStreaming: boolean;
}

function EnhancedChatMessage({ message, isLast, isStreaming }: EnhancedChatMessageProps) {
  const isUser = message.role === 'user';
  const shouldType = !isUser && isLast && isStreaming;

  // Parse content for commands
  const parsed = parseStreamingContent(message.content);
  const cleanContent = parsed.cleanText;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        {isUser ? (
          <div className="inline-block rounded-lg px-4 py-3 bg-sage text-background">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="prose prose-sm max-w-none">
              <MarkdownRenderer
                content={cleanContent}
                typewriter={shouldType}
                typingSpeed="fast"
              />
            </div>
            {/* Render dynamic components from commands */}
            {parsed.commands.map((cmd, i) => (
              <DynamicComponent key={i} command={cmd} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
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
    for await (const chunk of simulateLLMResponse(content)) {
      fullResponse += chunk;
      updateLastMessage(fullResponse);
    }

    setIsStreaming(false);
  };

  // Auto-send welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => handleSend('ciao'), 500);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <SwissLabel>💡 Interactive Demo</SwissLabel>
        <p className="text-sm text-muted-foreground mt-2">
          Try: "mostra card", "grafico vendite", "immagine", "pulsanti"
        </p>
      </div>
      <div className="h-[600px] border border-border rounded-lg overflow-hidden shadow-lg">
        <div className="h-full flex flex-col">
          {/* Custom messages list with enhanced rendering */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-background to-muted/20">
            {messages.map((message, index) => (
              <EnhancedChatMessage
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
                isStreaming={isStreaming}
              />
            ))}
          </div>
          {/* Input */}
          <div className="border-t border-border p-4 bg-background">
            <form onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
              if (input.value.trim()) {
                handleSend(input.value.trim());
                input.value = '';
              }
            }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Scrivi un messaggio... (es: 'mostra card')"
                  disabled={isStreaming}
                  className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/50 disabled:opacity-50 disabled:cursor-not-allowed bg-background"
                />
                <button
                  type="submit"
                  disabled={isStreaming}
                  className="px-6 py-3 bg-sage text-background rounded-lg hover:bg-sage/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Invia
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
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
  const [activeTab, setActiveTab] = useState<'chat' | 'typography' | 'typewriter' | 'markdown' | 'buttons' | 'images' | 'proactive'>('chat');

  const tabs = [
    { id: 'chat', label: 'Interactive Chat', description: 'LLM-driven with commands' },
    { id: 'proactive', label: 'Proactive Chat', description: 'Role-based engagement' },
    { id: 'buttons', label: 'Buttons', description: 'CTA & Quick Replies' },
    { id: 'images', label: 'Images', description: 'Swiss-style captions' },
    { id: 'typography', label: 'Typography', description: 'PHI-based spacing' },
    { id: 'typewriter', label: 'Typewriter', description: 'Humanized effect' },
    { id: 'markdown', label: 'Markdown', description: 'GFM rendering' },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="phonon-container py-12">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <SwissLabel>01 — Framework</SwissLabel>
              <div className="relative">
                <SwissIndex className="absolute -left-16 -top-4 opacity-10 text-8xl">φ</SwissIndex>
                <SwissHero className="relative">PHONON UI</SwissHero>
              </div>
              <SwissSubheading className="max-w-2xl">
                LLM-Driven Rendering Framework with Swiss Typography & Golden Ratio Spacing
              </SwissSubheading>
            </div>
            <div className="text-right space-y-2">
              <SwissLabel>v0.1.0</SwissLabel>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>React 18 + TypeScript 5.8</div>
                <div>Streaming Parser + WebLLM</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-border bg-background sticky top-0 z-10 backdrop-blur-sm">
        <div className="phonon-container flex gap-2 py-3 overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group px-5 py-3 rounded-lg transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-sage text-background shadow-md'
                  : 'hover:bg-muted border border-transparent hover:border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono opacity-60">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className={`text-xs ${activeTab === tab.id ? 'opacity-80' : 'text-muted-foreground'}`}>
                    {tab.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="phonon-container py-12">
        <div className="space-y-6">
          {/* Section Header */}
          <div className="space-y-2">
            <SwissLabel>
              {tabs.findIndex(t => t.id === activeTab) + 1 < 10 ? '0' : ''}
              {tabs.findIndex(t => t.id === activeTab) + 1} — {tabs.find(t => t.id === activeTab)?.label}
            </SwissLabel>
            <SwissHeading level={2}>
              {tabs.find(t => t.id === activeTab)?.description}
            </SwissHeading>
          </div>

          {/* Content Area */}
          {activeTab === 'chat' && <ChatDemo />}
          {activeTab === 'proactive' && <ProactiveChatDemo />}
          {activeTab === 'buttons' && <ButtonsDemo />}
          {activeTab === 'images' && <ImageDemo />}
          {activeTab === 'typography' && <TypographyDemo />}
          {activeTab === 'typewriter' && <TypewriterDemo />}
          {activeTab === 'markdown' && <MarkdownDemo />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 bg-muted/30">
        <div className="phonon-container py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <SwissLabel>Phonon UI Framework</SwissLabel>
              <p className="text-sm text-muted-foreground">
                Swiss Typography · Golden Ratio (φ = 1.618) · LLM-Driven Components
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Built with React + TypeScript</div>
              <div>Styled with TailwindCSS</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
