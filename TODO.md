# Phonon UI - TODO & Integration Status

## Conceptual Framework (by Alessio Cazzaniga)

### GPUAudio-Inspired Architecture
Il sistema è ispirato all'architettura GPUAudio SDK:
- **Host Scheduler (CPU)** → LLM content generation
- **Device Scheduler (GPU)** → Layouter/Typography renderer
- **Buffer Negotiation** → Cooperative Refinement feedback loop

### Bidirectional Pattern (Stigmergy)
Pattern biologico ispirato alle formiche (stigmergy):
1. **LLM** genera contenuto iniziale
2. **Layouter** analizza e fornisce feedback (constraint violations)
3. **LLM** raffina basandosi sui suggerimenti
4. Iterare fino a convergenza

Questo pattern è analogo a:
- Blackboard Architecture (AI classica)
- Actor Model con feedback
- Control Theory (closed-loop system)

---

## Status Moduli

### ✅ COLLEGATI E FUNZIONANTI

| Modulo | File | Integrato in | Note |
|--------|------|--------------|------|
| Concrete Pour | `concrete-pour.ts` | `phonon-scheduler.ts` | Layout-first rendering |
| Phonon Scheduler | `phonon-scheduler.ts` | `use-phonon-pipeline.ts` | GPUAudio-style batching |
| Phonon Pipeline | `use-phonon-pipeline.ts` | `ConcreteMarkdownRenderer.tsx` | Hook principale |
| Musical Orchestration | `musical-orchestration.ts` | `concrete-pour.ts` | PHI-based timing |
| Visual Debugger | `visual-debugger.ts` | `DebugPanel.tsx` | Debug UI component |
| Cooperative Refinement | `cooperative-refinement.ts` | `use-phonon-pipeline.ts` | **PARZIALE** - vedi sotto |

### ⚠️ PARZIALMENTE COLLEGATI

#### Cooperative Refinement
- **Stato**: Analisi integrata, loop LLM non chiuso
- **Problema**: Il `RefinementLoop.refine()` genera prompt ma non chiama LLM
- **Prossimo passo**: Collegare a `useGroq` per chiudere il feedback loop
- **File**: `src/core/cooperative-refinement.ts:426-431`

```typescript
// ATTUALE: Loop interrotto
break; // ← Nessuna chiamata LLM

// TARGET: Loop completo
const refinedContent = await groqChat(refinementPrompt);
currentContent = refinedContent;
// Continua iterazione...
```

### ❌ NON COLLEGATI (solo test)

| Modulo | File | Usato in | Da collegare a |
|--------|------|----------|----------------|
| Visual QA | `visual-qa.ts` | Solo test | Pipeline principale |
| Orchestrator | `orchestrator.ts` | Solo test | DevApp o Production |

---

## Fix Applicati in Questa Sessione

### 1. Bug Timing Animation (RISOLTO)
- **Sintomo**: Tutto il testo appariva istantaneamente invece di carattere per carattere
- **Causa**: `cumulativeDelay` resettato a 0 sulle righe vuote (paragrafi)
- **Fix**: Tracciare delay come variabile persistente
- **File**: `src/core/concrete-pour.ts:141-163`

### 2. TypeScript Errors DevApp (RISOLTO)
- **Problema**: `clearMessages` non esisteva
- **Fix**: Cambiato in `clearHistory`
- **File**: `src/dev/DevApp.tsx`

### 3. Debug Logging (AGGIUNTO)
- `PhononScheduler.finalize()` - log timing info
- `ConcreteMarkdownRenderer` - log reveal progress
- Attivabile con `window.__PHONON_DEBUG__ = true`

---

## Benchmark Results

### Forward vs Iterative Pipeline

| Metrica | Forward | Iterative |
|---------|---------|-----------|
| Tempo medio | 21.4ms | 18.3ms |
| Qualità media | 97.2% | 96.0% |
| Fix applicati | SI | NO |

**Vincitore attuale**: Forward (perché iterative non ha LLM collegato)
**Potenziale**: Iterative (con LLM può convergere a qualità superiore)

---

## Prossimi Passi

### Alta Priorità
1. [ ] **Collegare Cooperative Refinement a Groq**
   - Creare `useCooperativeRefinement` hook
   - Chiamare Groq con prompt di refinement
   - Iterare fino a `feedback.fits === true`

2. [ ] **Integrare Visual QA nella pipeline**
   - Chiamare `runVisualQA()` dopo rendering
   - Mostrare issues nel DebugPanel

### Media Priorità
3. [ ] **Integrare Orchestrator**
   - Usare per validazione pre-render
   - Log production issues

4. [ ] **Test E2E con LLM reale**
   - Benchmark con Groq
   - Misurare convergenza refinement

### Bassa Priorità
5. [ ] **Ottimizzare batching**
   - Studiare dimensione ottimale batch
   - Adattare a viewport size

---

## Test Coverage

```
Vitest (Unit):
  ✓ design-dna.test.ts (38 tests)
  ✓ newspaper-layout.test.tsx (9 tests)
  ✓ orchestrator.test.ts (23 tests)
  ✓ cooperative-refinement.test.ts (20 tests)

Playwright (E2E):
  ✓ reflow-test.spec.ts (2 tests) - 0 reflows
  ✓ timing-debug.spec.ts (1 test) - ~100 chars/sec
  ✓ cooperative-refinement.spec.ts (3 tests) - integration OK
```

---

*Ultimo aggiornamento: 2026-01-11*
*Autore concetti: Alessio Cazzaniga*
*Implementazione: Claude Code*
