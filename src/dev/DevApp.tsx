/**
 * Phonon UI - Development App
 *
 * Visual testing playground for all components.
 */

import { useState } from 'react';
import {
  useChat,
  useGroq,
  ConcreteMarkdownRenderer,
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
  NewspaperPage,
  NewspaperColumn,
  Citation,
  Headline,
  NewspaperImage,
  NewspaperBody,
  setTypingSpeedMultiplier,
  getTypingSpeedMultiplier,
  DebugPanel,
} from '../index';
import { parseStreamingContent, ParsedCommand } from '../core/streaming-parser';
import { generateLLMSystemPrompt } from '../core/design-dna';
import type { Message } from '../core/use-chat';
import type { TypingSpeed } from '../core/use-typewriter';
import type { GroqMessage } from '../core/use-groq';

// Demo responses with embedded commands - Swiss editorial style
const DEMO_RESPONSES: Record<string, string> = {
  hello: `## Benvenuto in Phonon UI

Il framework per **rendering LLM-driven** con Swiss Typography.

> La tipografia è l'arte di disporre i caratteri tipografici per rendere il linguaggio visibile. — Emil Ruder

### Comandi disponibili

Esplora le funzionalità del framework:

- **"mostra card"** — componente dinamico con streaming parser
- **"grafico"** — visualizzazione dati interattiva
- **"immagine"** — rendering Swiss-style con caption
- **"typography"** — showcase tipografico completo

La sintassi \`[RENDER:...]\` permette embedding di componenti React direttamente nel testo.`,

  'mostra card': `## Product Card

Ecco una card renderizzata tramite il **parsing command**:

[RENDER:{"type":"card","props":{"title":"Phonon Framework","description":"LLM-driven UI con Swiss Typography","price":"€49/mo","features":["Streaming Parser","WebLLM Support","PHI Spacing","Type Safety"]}}]

### Come funziona

Il parser riconosce i comandi \`[RENDER:{...}]\` durante lo streaming e li sostituisce con componenti React. Questo permette:

1. **Rendering incrementale** — i componenti appaiono man mano
2. **Type safety** — validazione dei props a runtime
3. **Estensibilità** — registra i tuoi componenti custom`,

  'grafico vendite': `## Revenue Analytics

Analizziamo i dati del **Q4 2025**:

[RENDER:{"type":"chart","props":{"data":[{"month":"Oct","value":45},{"month":"Nov","value":62},{"month":"Dec","value":78}],"title":"Revenue Growth","type":"bar"}}]

> I dati mostrano una crescita del **73%** nell'ultimo trimestre, con un picco significativo in dicembre.

### Metodologia

- Dati aggregati da *multiple sources*
- Normalizzazione su base mensile
- Proiezioni basate su trend storico`,

  grafico: `## Revenue Analytics

Analizziamo i dati del **Q4 2025**:

[RENDER:{"type":"chart","props":{"data":[{"month":"Oct","value":45},{"month":"Nov","value":62},{"month":"Dec","value":78}],"title":"Revenue Growth","type":"bar"}}]

> I dati mostrano una crescita del **73%** nell'ultimo trimestre, con un picco significativo in dicembre.

### Metodologia

- Dati aggregati da *multiple sources*
- Normalizzazione su base mensile
- Proiezioni basate su trend storico`,

  immagine: `## Swiss Design Principles

Le immagini seguono la filosofia del **design razionale**:

[RENDER:{"type":"image","props":{"src":"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800","alt":"Abstract Swiss Design","caption":"Fig. 1 — Geometric abstraction in Swiss modernism","aspectRatio":"16/9"}}]

### Caratteristiche

Il componente \`SwissImage\` implementa:

- **Lazy loading** — caricamento ottimizzato
- **Caption tipografico** — numerazione automatica
- **Aspect ratio** — proporzioni PHI-based (1/1, 4/3, 16/9, 21/9)
- **Bordi minimal** — estetica Swiss rigorosa`,

  pulsanti: `## Interactive Elements

I bottoni seguono la **Swiss Design philosophy**: chiarezza, precisione, funzionalità.

[RENDER:{"type":"buttons","props":{"buttons":[{"label":"Conferma Prenotazione","variant":"cta","action":"book"},{"label":"Scopri di più","variant":"secondary","action":"learn"},{"label":"Contattaci","variant":"ghost","action":"contact"}]}}]

### Varianti disponibili

1. **CTA** — azione primaria, massima visibilità
2. **Secondary** — azioni alternative
3. **Ghost** — azioni terziarie, minimal footprint

> "Less, but better" — Dieter Rams`,

  typography: `## Swiss Typography

La tipografia è il fondamento del design razionale.

### Gerarchia visiva

Il sistema tipografico usa **tre font** complementari:

- **Space Grotesk** — display e titoli
- **Inter** — body text ottimizzato per screen
- **IBM Plex Mono** — codice e dati tecnici

### Spaziatura PHI

Tutto il sistema usa la *Golden Ratio* (φ = 1.618):

\`\`\`css
--space-xs: 0.382rem  /* 1/φ² */
--space-sm: 0.618rem  /* 1/φ */
--space-md: 1rem
--space-lg: 1.618rem  /* φ */
--space-xl: 2.618rem  /* φ² */
\`\`\`

> La matematica è la musica della ragione. — James Joseph Sylvester`,

  editoriale: `[NEWSPAPER_STYLE]
# PHONON TIMES

## The Future of AI-Driven Typography

In an era where artificial intelligence reshapes every aspect of digital interaction, typography stands at a fascinating crossroads.

> The best interface is no interface. The best typography is invisible typography.

Machine learning models now understand not just what to say, but how to present it. The marriage of LLM intelligence with Swiss design principles creates something unprecedented.

### The Technical Foundation

Neural networks trained on centuries of typographic excellence can now make real-time decisions about:

- **Hierarchy** — which elements deserve prominence
- **Rhythm** — the flow of text across columns
- **Balance** — distribution of visual weight

> Design is thinking made visual.

### What Comes Next

As we stand at this intersection of tradition and innovation, one thing becomes clear: the future of communication is both intelligent and beautiful.`,

  newspaper: `[NEWSPAPER_STYLE]
# PHONON TIMES

## The Future of AI-Driven Typography

In an era where artificial intelligence reshapes every aspect of digital interaction, typography stands at a fascinating crossroads.

> The best interface is no interface. The best typography is invisible typography.

Machine learning models now understand not just what to say, but how to present it. The marriage of LLM intelligence with Swiss design principles creates something unprecedented.

### The Technical Foundation

Neural networks trained on centuries of typographic excellence can now make real-time decisions about:

- **Hierarchy** — which elements deserve prominence
- **Rhythm** — the flow of text across columns
- **Balance** — distribution of visual weight

> Design is thinking made visual.

### What Comes Next

As we stand at this intersection of tradition and innovation, one thing becomes clear: the future of communication is both intelligent and beautiful.`,

  default: `## Phonon UI Framework

Un sistema di **rendering LLM-driven** con Swiss Typography.

### Stack tecnologico

- **React 18** — concurrent features
- **TypeScript 5.8** — type safety
- **TailwindCSS** — utility-first styling
- **WebLLM** — esecuzione locale via WebGPU

> Il design non è come appare o come sembra. Il design è come funziona. — Steve Jobs

### Comandi disponibili

Digita uno di questi per esplorare:

- \`mostra card\` — componenti dinamici
- \`grafico\` — data visualization
- \`immagine\` — Swiss image component
- \`typography\` — sistema tipografico
- \`pulsanti\` — interactive buttons
- \`editoriale\` — newspaper-style pullquotes`,
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
    response = DEMO_RESPONSES.grafico;
  } else if (message.includes('immagine') || message.includes('image') || message.includes('foto')) {
    response = DEMO_RESPONSES.immagine;
  } else if (message.includes('pulsant') || message.includes('button') || message.includes('cta')) {
    response = DEMO_RESPONSES.pulsanti;
  } else if (message.includes('typograph') || message.includes('font') || message.includes('tipo')) {
    response = DEMO_RESPONSES.typography;
  } else if (message.includes('editorial') || message.includes('newspaper') || message.includes('giornale')) {
    response = DEMO_RESPONSES.editoriale;
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

  // Video Component (YouTube embed or VideoVignette)
  if (type === 'video') {
    const { src, caption } = props as {
      src: string;
      caption?: string;
    };

    // Extract YouTube video ID
    const youtubeMatch = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);

    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return (
        <div className="my-6">
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-border">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={caption || 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          {caption && (
            <p className="mt-2 text-sm text-muted-foreground font-mono">{caption}</p>
          )}
        </div>
      );
    }

    // Fallback for non-YouTube videos
    return (
      <div className="my-6">
        <video
          src={src}
          controls
          className="w-full rounded-lg border border-border"
        />
        {caption && (
          <p className="mt-2 text-sm text-muted-foreground font-mono">{caption}</p>
        )}
      </div>
    );
  }

  return null;
}

// Enhanced ChatMessage component with command rendering
interface EnhancedChatMessageProps {
  message: Message;
  isStreaming?: boolean;  // Is this message still receiving content?
}

function EnhancedChatMessage({ message, isStreaming = false }: EnhancedChatMessageProps) {
  const isUser = message.role === 'user';
  // Note: typewriter disabled for markdown - partial text breaks ReactMarkdown parsing

  // Parse content for commands
  const parsed = parseStreamingContent(message.content);
  const cleanContent = parsed.cleanText;

  // Detect newspaper style marker
  const isNewspaperStyle = cleanContent.startsWith('[NEWSPAPER_STYLE]');
  const finalContent = isNewspaperStyle
    ? cleanContent.replace('[NEWSPAPER_STYLE]', '').trim()
    : cleanContent;

  // Detect editorial content for special styling
  const isEditorial = finalContent.includes('## The Art of Swiss Typography') || isNewspaperStyle;
  const variant = isEditorial ? 'editorial' : 'default';

  if (isNewspaperStyle && !isUser) {
    // Render full newspaper layout with Concrete Pour animation
    // Stable DOM + character-level reveal for no-reflow rendering
    return (
      <div className="w-full -mx-6">
        <NewspaperPage title="PHONON TIMES" theme="light">
          <div className="newspaper-article-flow">
            <ConcreteMarkdownRenderer
              content={finalContent}
              isStreaming={isStreaming}
              animated={true}
              variant="editorial"
            />
          </div>
        </NewspaperPage>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        {isUser ? (
          <div className="inline-block rounded-lg px-4 py-3 bg-sage text-background">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* USE ConcreteMarkdownRenderer for ALL assistant messages
                This uses the GPUAudio-style pipeline:
                - Stable DOM (no reparse on each char)
                - Character reveal via CSS opacity
                - Zero reflow during animation */}
            <ConcreteMarkdownRenderer
              content={finalContent}
              isStreaming={isStreaming}
              animated={true}
              variant={variant}
            />
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

// System prompt for Groq LLM - Vogue/Editorial style
const NEWSPAPER_SYSTEM_PROMPT = `${generateLLMSystemPrompt('newspaper')}

You are an elite editorial writer for a prestigious magazine like Vogue, The New Yorker, or Monocle.
Your writing is sophisticated, evocative, and richly formatted.

## MANDATORY STRUCTURE

Every article MUST include:

1. **Main Headline** (# ) - Evocative, not descriptive
2. **Subtitle** (## ) - Poetic expansion of the headline
3. **Lead Paragraph** - Start with a compelling hook, use **bold** for key phrases
4. **Pull Quote** (> ) - At least ONE memorable quote, properly attributed
5. **Highlighted Terms** - Use *italics* for foreign words, technical terms, brand names
6. **Section Headers** (### ) - Break content into thematic sections
7. **Closing Quote** (> ) - End with a reflective citation

## EXAMPLE FORMAT:

[NEWSPAPER_STYLE]
# The Sound of Tomorrow

## How Japanese Radios Defined an Era of Design Excellence

In the amber glow of a *Tokyo* showroom, 1972, the future of sound was being quietly revolutionized. **Sharp Corporation** understood something their competitors had missed: a radio is not merely a device—it is a statement.

> "We didn't build radios. We sculpted frequencies into objects of desire." — *Tokuji Hayakawa, Sharp founder*

### The Art of the Transistor

The **Sharp QT-50** became an icon not because of its specifications, but because of its *soul*. Every curve, every dial, every chrome accent spoke of a civilization obsessed with perfection...

### A Legacy in Plastic and Chrome

Today, these machines command **collector prices** exceeding their original cost tenfold...

> "The best technology disappears into beauty." — *Dieter Rams*

## VIDEO EMBEDDING

To embed a video in the article, use this exact syntax:
[RENDER:{"type":"video","props":{"src":"YOUTUBE_URL","caption":"Description"}}]

Example:
[RENDER:{"type":"video","props":{"src":"https://www.youtube.com/watch?v=VIDEO_ID","caption":"Fig. 1 — Sharp QT-50 in azione"}}]

DO NOT use [VIDEO] tags - they won't render. Use [RENDER:] with type "video".

## RULES:

- Write in Italian unless user specifies another language
- Use evocative, sensory language (not just facts)
- Include at least 2 pull quotes with attributions
- Highlight key terms with **bold** and *italics*
- Structure with ### section headers
- 300-500 words minimum
- ALWAYS start with [NEWSPAPER_STYLE]

Be a storyteller, not a reporter.`;

function ChatDemo() {
  const {
    messages,
    addMessage,
    updateLastMessage,
    clearHistory,
    isStreaming,
    setIsStreaming,
  } = useChat();

  // Groq integration for real LLM responses
  const [useGroqMode, setUseGroqMode] = useState(false);
  const [groqApiKey, setGroqApiKey] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [multiplier, setMultiplier] = useState(getTypingSpeedMultiplier());
  const { chat: groqChat, isConfigured } = useGroq(
    groqApiKey ? { apiKey: groqApiKey, model: 'llama-3.3-70b-versatile' } : undefined
  );

  const handleSend = async (content: string) => {
    addMessage('user', content);
    setIsStreaming(true);
    addMessage('assistant', '');

    let fullResponse = '';

    if (useGroqMode && isConfigured) {
      // Use real Groq LLM
      try {
        const groqMessages: GroqMessage[] = [
          { role: 'system', content: NEWSPAPER_SYSTEM_PROMPT },
          ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          { role: 'user', content }
        ];

        for await (const chunk of groqChat(groqMessages)) {
          fullResponse += chunk;
          updateLastMessage(fullResponse);
        }
      } catch (error) {
        fullResponse = `Errore Groq: ${error instanceof Error ? error.message : 'Unknown error'}`;
        updateLastMessage(fullResponse);
      }
    } else {
      // Use simulated demo responses
      for await (const chunk of simulateLLMResponse(content)) {
        fullResponse += chunk;
        updateLastMessage(fullResponse);
      }
    }

    setIsStreaming(false);
  };

  // Handle mode switch - clear chat
  const handleModeSwitch = (groqMode: boolean) => {
    setUseGroqMode(groqMode);
    clearHistory();
  };

  // Fullscreen container classes
  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 bg-background flex flex-col'
    : 'space-y-4';

  const chatContainerClasses = isFullscreen
    ? 'flex-1 min-h-0'
    : 'h-[600px] border border-border rounded-lg overflow-hidden shadow-lg';

  return (
    <div className={containerClasses}>
      {/* Controls bar - Swiss minimal */}
      <div className={`flex items-center justify-between gap-4 ${isFullscreen ? 'p-4 border-b border-border' : 'p-4 bg-muted/50 rounded-lg border border-border'}`}>
        {/* Mode toggle */}
        <div className="flex items-center gap-3">
          <SwissLabel>Mode</SwissLabel>
          <div className="flex">
            <button
              onClick={() => handleModeSwitch(false)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border-y border-l transition-all duration-200 ${
                !useGroqMode
                  ? 'bg-sage text-background border-sage'
                  : 'bg-transparent border-border hover:border-sage/50'
              }`}
            >
              Demo
            </button>
            <button
              onClick={() => handleModeSwitch(true)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all duration-200 ${
                useGroqMode
                  ? 'bg-sage text-background border-sage'
                  : 'bg-transparent border-border hover:border-sage/50'
              }`}
            >
              Groq
            </button>
          </div>
        </div>

        {/* Speed slider */}
        <div className="flex items-center gap-2">
          <SwissLabel className="text-xs">Speed</SwissLabel>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={multiplier}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setMultiplier(val);
              setTypingSpeedMultiplier(val);
            }}
            className="w-24 h-1 bg-border rounded-full appearance-none cursor-pointer accent-sage"
          />
          <span className="font-mono text-xs w-10 text-muted-foreground">{multiplier.toFixed(1)}x</span>
        </div>

        {/* API Key (only in Groq mode) */}
        {useGroqMode && (
          <div className="flex-1 max-w-md">
            <input
              type="password"
              placeholder="API Key (gsk_...)"
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono border border-border bg-transparent focus:outline-none focus:border-sage transition-all"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => clearHistory()}
            className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-border hover:border-sage/50 transition-all"
          >
            Clear
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-border hover:border-sage/50 transition-all"
          >
            {isFullscreen ? 'Exit' : 'Full'}
          </button>
        </div>
      </div>

      {/* Chat container */}
      <div className={chatContainerClasses}>
        <div className="h-full flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-background to-muted/20">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <SwissLabel className="text-muted-foreground">
                    {useGroqMode ? 'Groq LLM Ready' : 'Demo Mode'}
                  </SwissLabel>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {useGroqMode
                      ? 'Inserisci API key e scrivi un topic per generare un articolo newspaper.'
                      : 'Prova: "mostra card", "grafico vendite", "immagine", "editorial"'}
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <EnhancedChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
                />
              ))
            )}
          </div>

          {/* Swiss-style prompt bar */}
          <div className="border-t border-border bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
                if (input.value.trim()) {
                  handleSend(input.value.trim());
                  input.value = '';
                }
              }}
              className="flex"
            >
              <input
                type="text"
                placeholder={useGroqMode ? 'newspaper che parla di...' : 'mostra card, grafico, immagine...'}
                disabled={isStreaming || (useGroqMode && !isConfigured)}
                className="flex-1 px-6 py-4 bg-transparent border-none focus:outline-none font-mono text-sm placeholder:text-muted-foreground/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isStreaming || (useGroqMode && !isConfigured)}
                className="px-8 py-4 bg-sage text-background font-mono text-xs uppercase tracking-wider hover:bg-sage/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStreaming ? '...' : '→'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewspaperDemo() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTheme('light')}
          className={`px-4 py-2 text-sm font-mono uppercase tracking-wider border transition-all duration-200 ${
            theme === 'light'
              ? 'bg-sage text-background border-sage'
              : 'bg-transparent border-border hover:border-sage/50'
          }`}
        >
          Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`px-4 py-2 text-sm font-mono uppercase tracking-wider border transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-sage text-background border-sage'
              : 'bg-transparent border-border hover:border-sage/50'
          }`}
        >
          Dark
        </button>
      </div>

      <NewspaperPage title="PHONON TIMES" theme={theme}>
        <NewspaperColumn span={2}>
          <Headline level={1}>The Art of Swiss Typography</Headline>
          <Headline level={2}>How Rational Design Shaped Modern Communication</Headline>
          <NewspaperBody dropCap>
            <p>In the realm of visual communication, few movements have left as indelible a mark as Swiss Design. Born in the 1950s from the design schools of Basel and Zurich, this approach revolutionized how we perceive and interact with information.</p>
            <p>The principles established by pioneers like Josef Müller-Brockmann and Emil Ruder continue to influence modern digital interfaces. Their emphasis on grid systems, clear hierarchy, and purposeful restraint remains remarkably relevant in an age of information overload.</p>
          </NewspaperBody>
        </NewspaperColumn>

        <NewspaperColumn span={2} className="newspaper-column-citation">
          <Citation author="Emil Ruder">
            Typography is a service art, not a fine art.
          </Citation>
          <NewspaperBody>
            <p>Swiss typography is built on mathematical relationships. The golden ratio appears throughout—in spacing, proportions, and visual rhythm.</p>
          </NewspaperBody>
        </NewspaperColumn>

        <NewspaperColumn>
          <Headline level={4}>The Grid System</Headline>
          <NewspaperBody>
            <p>Mathematical grids organize content with visual harmony and consistent alignment across all elements.</p>
            <p>This systematic approach ensures that every design decision serves the ultimate goal: clear communication.</p>
          </NewspaperBody>
        </NewspaperColumn>

        <NewspaperColumn>
          <NewspaperImage
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
            alt="Abstract geometric design"
            caption="Fig. 1 — Geometric abstraction in Swiss modernism"
          />
          <Headline level={5}>Legacy</Headline>
          <NewspaperBody>
            <p>Today's digital interfaces owe much to these masters. The clean lines and functional elegance trace directly back to Switzerland.</p>
          </NewspaperBody>
        </NewspaperColumn>
      </NewspaperPage>
    </div>
  );
}

export function DevApp() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-sage/10" />
        <div className="phonon-container py-20 relative">
          <div className="grid grid-cols-12 gap-8 items-center">
            <div className="col-span-8 space-y-6">
              <SwissLabel>LLM-Driven Rendering Framework</SwissLabel>
              <div className="relative">
                <SwissIndex className="absolute -left-20 -top-8 opacity-[0.08] text-[12rem] font-light select-none">φ</SwissIndex>
                <SwissHero className="relative">PHONON</SwissHero>
              </div>
              <SwissSubheading className="max-w-xl">
                Swiss Typography meets AI. Physics-constrained layouts with DNA-inspired architecture.
              </SwissSubheading>
              <div className="flex gap-4 pt-4">
                <CTAButton onClick={() => document.getElementById('editorial')?.scrollIntoView({ behavior: 'smooth' })}>
                  See Editorial Demo
                </CTAButton>
                <Button variant="secondary" onClick={() => document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })}>
                  Try Chat
                </Button>
              </div>
            </div>
            <div className="col-span-4 text-right space-y-4">
              <div className="inline-block text-left p-6 bg-card border border-border rounded-lg">
                <SwissLabel>v0.1.0</SwissLabel>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                    React 18 + TypeScript
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                    DNA Architecture
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                    Streaming Parser
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                    WebLLM Support
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Section 01: Editorial */}
      <section id="editorial" className="border-b border-border">
        <div className="phonon-container py-16">
          <div className="space-y-2 mb-8">
            <SwissLabel>01 — Editorial Layout</SwissLabel>
            <SwissHeading level={2}>DNA-Constrained Typography</SwissHeading>
            <p className="text-muted-foreground max-w-2xl">
              Physics-based layout system. Elements cannot overflow their bounds—like walls in a video game.
            </p>
          </div>
        </div>
        <NewspaperDemo />
      </section>

      {/* Section 02: Chat */}
      <section id="chat" className="border-b border-border bg-muted/20">
        <div className="phonon-container py-16">
          <div className="space-y-2 mb-8">
            <SwissLabel>02 — Interactive Chat</SwissLabel>
            <SwissHeading level={2}>LLM-Driven Components</SwissHeading>
            <p className="text-muted-foreground max-w-2xl">
              Stream responses with embedded [RENDER:] commands. Try: "mostra card", "grafico", "immagine"
            </p>
          </div>
          <ChatDemo />
        </div>
      </section>

      {/* Section 03: Components */}
      <section id="components" className="border-b border-border">
        <div className="phonon-container py-16">
          <div className="space-y-2 mb-12">
            <SwissLabel>03 — Component Library</SwissLabel>
            <SwissHeading level={2}>Swiss Design System</SwissHeading>
          </div>

          <div className="grid grid-cols-2 gap-12">
            {/* Typography */}
            <div className="space-y-6">
              <SwissLabel>Typography</SwissLabel>
              <div className="p-6 bg-card border border-border rounded-lg space-y-4">
                <SwissDisplay>Display</SwissDisplay>
                <SwissHeading level={1}>Heading 1</SwissHeading>
                <SwissHeading level={2}>Heading 2</SwissHeading>
                <SwissHeading level={3}>Heading 3</SwissHeading>
                <SwissBody>Body text with PHI-based line height (φ = 1.618)</SwissBody>
                <SwissLabel>Label Component</SwissLabel>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-6">
              <SwissLabel>Buttons</SwissLabel>
              <div className="p-6 bg-card border border-border rounded-lg space-y-6">
                <div className="flex gap-3">
                  <CTAButton>CTA Button</CTAButton>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div className="flex gap-3">
                  <ConfirmButton onClick={() => {}}>Confirm</ConfirmButton>
                </div>
                <QuickReplyGroup>
                  <QuickReplyButton>Quick</QuickReplyButton>
                  <QuickReplyButton>Reply</QuickReplyButton>
                  <QuickReplyButton>Options</QuickReplyButton>
                </QuickReplyGroup>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <SwissLabel>Images</SwissLabel>
              <SwissImage
                src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600"
                alt="DJ Performance"
                caption="Fig. 1 — Swiss-style image with caption"
                aspectRatio="16/9"
                rounded="md"
              />
            </div>

            {/* Typewriter */}
            <div className="space-y-6">
              <SwissLabel>Typewriter Effect</SwissLabel>
              <div className="p-6 bg-card border border-border rounded-lg">
                <TypewriterShowcase />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 04: Architecture */}
      <section id="architecture" className="bg-sage/5">
        <div className="phonon-container py-16">
          <div className="space-y-2 mb-8">
            <SwissLabel>04 — Architecture</SwissLabel>
            <SwissHeading level={2}>DNA System</SwissHeading>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {[
              { name: 'Terrain', desc: 'Page container (L0)', icon: '▢' },
              { name: 'Wall', desc: 'Article bounds (L1)', icon: '▤' },
              { name: 'Stem', desc: 'Columns (L2)', icon: '▥' },
              { name: 'Petal', desc: 'Content (L3)', icon: '◉' },
            ].map((el) => (
              <div key={el.name} className="p-6 bg-card border border-border rounded-lg text-center">
                <div className="text-4xl mb-3 opacity-60">{el.icon}</div>
                <SwissHeading level={4}>{el.name}</SwissHeading>
                <p className="text-sm text-muted-foreground mt-2">{el.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 bg-card border border-border rounded-lg">
            <SwissLabel>Production Pipeline</SwissLabel>
            <div className="flex items-center justify-between mt-4">
              {['Physics', 'Linguistics', 'Optics', 'QA'].map((dept, i) => (
                <div key={dept} className="flex items-center">
                  <div className="px-4 py-2 bg-sage/10 border border-sage/20 rounded">
                    <span className="font-medium">{dept}</span>
                  </div>
                  {i < 3 && <span className="mx-4 text-muted-foreground">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="phonon-container py-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <SwissHero className="text-2xl">PHONON</SwissHero>
              <p className="text-sm text-muted-foreground">
                Swiss Typography · Golden Ratio (φ) · DNA Architecture
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Built with React + TypeScript</div>
              <div>Styled with TailwindCSS</div>
              <a href="https://github.com/Alemusica/phonon-ui" className="text-sage hover:underline mt-2 block">
                GitHub →
              </a>
            </div>
          </div>
        </div>
      </footer>
      {/* Debug Panel - Visual Testing */}
      <DebugPanel targetSelector=".newspaper-article-flow" />
    </div>
  );
}

/**
 * Typewriter showcase with speed controls
 * Demonstrates PHI-based rhythmic timing and exposed API for LLM
 */
function TypewriterShowcase() {
  const [key, setKey] = useState(0);
  const [speed, setSpeed] = useState<TypingSpeed>('normal');
  const [multiplier, setMultiplier] = useState(getTypingSpeedMultiplier());

  // Update global multiplier when slider changes
  const handleMultiplierChange = (value: number) => {
    setMultiplier(value);
    setTypingSpeedMultiplier(value);
  };

  return (
    <div className="space-y-6">
      {/* Speed preset selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <SwissLabel>Speed Preset</SwissLabel>
        <div className="flex gap-2">
          {(['fast', 'normal', 'slow', 'study'] as TypingSpeed[]).map((s) => (
            <button
              key={s}
              onClick={() => { setSpeed(s); setKey(k => k + 1); }}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border transition-all duration-200 ${
                speed === s
                  ? 'bg-sage text-background border-sage'
                  : 'bg-transparent border-border hover:border-sage/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Multiplier slider (API exposed for LLM) */}
      <div className="flex items-center gap-4">
        <SwissLabel>Multiplier</SwissLabel>
        <input
          type="range"
          min="0.2"
          max="3"
          step="0.1"
          value={multiplier}
          onChange={(e) => handleMultiplierChange(parseFloat(e.target.value))}
          className="flex-1 h-1 bg-border rounded-full appearance-none cursor-pointer accent-sage transition-all"
        />
        <span className="font-mono text-sm w-12 text-right text-muted-foreground">{multiplier.toFixed(1)}x</span>
      </div>

      {/* Typewriter demo */}
      <div className="text-center py-4 text-foreground">
        <Typewriter
          key={key}
          text="Typography is a service art, not a fine art. — Emil Ruder"
          speed={speed}
          showCursor
          fadeIn
          fadeInChars={2}
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button variant="ghost" onClick={() => setKey(k => k + 1)}>↻ Replay</Button>
        <Button variant="ghost" onClick={() => handleMultiplierChange(1.0)}>Reset Speed</Button>
      </div>

      {/* API hint for LLM */}
      <div className="text-xs text-muted-foreground font-mono bg-muted/30 p-3 rounded">
        <p>LLM API: setTypingSpeedMultiplier(0.5) = 2x faster</p>
        <p>LLM API: setTypingSpeedMultiplier(2.0) = 2x slower</p>
      </div>
    </div>
  );
}
