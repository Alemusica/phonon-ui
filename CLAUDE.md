# Phonon UI - LLM-Driven Rendering Framework

## Project Overview
Framework React/TypeScript per rendering LLM-driven con Swiss Typography.
- **Stack**: React 18, TypeScript 5.8, TailwindCSS, Vite
- **Target**: npm package pubblicabile

## Architecture
See [docs/brainstorming/architecture.md](docs/brainstorming/architecture.md)

## Key Patterns
- PHI-based spacing (Golden Ratio: 1.618)
- Swiss Typography (Space Grotesk, Inter, IBM Plex Mono)
- Streaming parser per comandi `[RENDER:]` e `[ACTION:]`
- WebLLM fallback per esecuzione locale

## Knowledge Base Integration
Use MCP tool `search()` to query the KB for:
- LLM streaming patterns
- React hooks best practices
- WebGPU/WebLLM implementations
- TypeScript library design

Use `research()` to fetch new knowledge when needed.

## Commands
```bash
bun install          # Install dependencies
bun run dev          # Dev server with HMR
bun run build        # Build library
bun run test         # Run tests
bun run lint         # ESLint
```

## File Structure
```
src/
├── components/      # React components (ChatWidget, Typewriter, etc.)
├── core/           # Hooks (useChat, useWebLLM, useTypewriter)
├── themes/         # Theme configurations
└── styles/         # CSS/Tailwind
```

## Current Focus
- [ ] Complete streaming parser
- [ ] WebLLM integration
- [ ] Component library packaging

## Decision Log
See [.claude/rules/decisions.md](.claude/rules/decisions.md)

## Style Guide
See [.claude/rules/style.md](.claude/rules/style.md)
