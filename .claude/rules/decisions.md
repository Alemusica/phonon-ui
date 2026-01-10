# Architecture Decisions

## 2026-01-10: Framework Structure

### Decision: Monolithic package vs Monorepo
**Choice**: Monolithic single package
**Reasoning**:
- Simpler publishing to npm
- Easier dependency management
- Tree-shaking handles unused code
- Can split later if needed

### Decision: Build tool
**Choice**: tsup + Vite
**Reasoning**:
- tsup for library build (ESM + CJS)
- Vite for dev/examples
- Fast builds, good DX

### Decision: Styling approach
**Choice**: TailwindCSS + CSS Variables
**Reasoning**:
- Tailwind for rapid development
- CSS vars for runtime theming
- No CSS-in-JS runtime overhead

---

## Pending Decisions

### WebLLM Model Selection
Options:
1. Llama 3.2 3B (fast, smaller)
2. Phi-3 Mini (good quality/size)
3. Qwen 2.5 3B (multilingual)

Waiting for: Performance benchmarks on target devices

### Streaming Protocol
Options:
1. Custom `[RENDER:]` protocol
2. Tool calling format
3. JSON streaming

Current: Custom protocol, may revisit for standard compatibility
