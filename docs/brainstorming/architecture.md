# Phonon UI Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      PHONON UI                               │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 PhononProvider                       │    │
│  │  - Theme context                                     │    │
│  │  - LLM configuration                                 │    │
│  │  - Command registry                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│           ┌───────────────┼───────────────┐                 │
│           ▼               ▼               ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Core     │  │ Components  │  │   Themes    │         │
│  │   Hooks     │  │             │  │             │         │
│  │             │  │ ChatWidget  │  │   swiss     │         │
│  │  useChat    │  │ Typewriter  │  │ swissLight  │         │
│  │  useWebLLM  │  │ Markdown    │  │  minimal    │         │
│  │  useTypew.  │  │ Typography  │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│           │               │               │                  │
│           └───────────────┼───────────────┘                 │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Streaming Parser                        │    │
│  │  - Parse [RENDER:] commands                         │    │
│  │  - Parse [ACTION:] commands                         │    │
│  │  - Humanized typing queue                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│           ┌───────────────┼───────────────┐                 │
│           ▼               ▼               ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Remote    │  │   WebLLM    │  │   Custom    │         │
│  │  Providers  │  │   (Local)   │  │  Provider   │         │
│  │             │  │             │  │             │         │
│  │ Groq/OpenAI │  │ WebGPU      │  │ Your API    │         │
│  │ Anthropic   │  │ Llama/Phi   │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Message Flow
```
User Input
    │
    ▼
┌───────────────┐
│   useChat()   │ ─── manages message state
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   Provider    │ ─── Groq/OpenAI/WebLLM
└───────┬───────┘
        │ (streaming response)
        ▼
┌───────────────┐
│StreamingParser│ ─── extracts commands, text
└───────┬───────┘
        │
    ┌───┴───┐
    │       │
    ▼       ▼
[TEXT]   [COMMAND]
    │       │
    ▼       ▼
Typewriter  CommandHandler
Queue       (renders/actions)
```

### Command Protocol
```
LLM Response: "Here's a chart [RENDER:{"type":"chart","data":[1,2,3]}] and more text"

Parsed:
1. text: "Here's a chart "
2. command: {type: "chart", data: [1,2,3]}
3. text: " and more text"

Rendered:
1. Typewriter effect for text
2. Instant render for chart component
3. Continue typewriter
```

## Module Responsibilities

### Core Hooks

#### useChat
- Message state management
- Provider abstraction
- Streaming handling
- Command extraction

#### useWebLLM
- WebGPU detection
- Model loading/caching
- Local inference
- Progress tracking

#### useTypewriter
- Character queue
- Natural timing (pause on punctuation)
- Speed control

### Components

#### ChatWidget
- Complete chat UI
- Input handling
- Message list
- Loading states

#### MarkdownRenderer
- GFM support
- Code highlighting
- Optional typewriter

#### Typography
- Swiss design system
- PHI spacing
- Semantic components

## Extension Points

### Custom Commands
```typescript
useCommandHandler({
  'my-command': (data) => <MyComponent {...data} />
});
```

### Custom Providers
```typescript
const myProvider: LLMProvider = {
  name: 'my-llm',
  stream: async function* (messages) {
    // yield chunks
  }
};
```

### Custom Themes
```typescript
const myTheme: PhononTheme = {
  colors: {...},
  typography: {...},
  spacing: 'phi' | 'linear'
};
```

## Performance Considerations

1. **Streaming**: Never buffer full response
2. **WebLLM**: Load model once, keep in memory
3. **Typewriter**: Use requestAnimationFrame
4. **Components**: Memoize expensive renders
5. **Themes**: CSS variables for instant switching

## Future Considerations

- [ ] Multi-turn context management
- [ ] Tool calling support
- [ ] Voice input (Whisper)
- [ ] Image generation commands
- [ ] Collaborative features
