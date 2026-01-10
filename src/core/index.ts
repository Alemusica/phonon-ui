/**
 * Phonon UI - Core Hooks & Utilities
 */

// Streaming Parser
export {
  parseStreamingContent,
  parseMarkdownContent,
  getYouTubeEmbedUrl,
  isValidVideoUrl,
  type ParsedCommand,
  type StreamingParserState,
  type ContentPart,
} from './streaming-parser';

// Chat Hook
export {
  useChat,
  useCommandTracker,
  generateMessageId,
  type Message,
  type UseChatOptions,
  type UseChatReturn,
} from './use-chat';

// WebLLM Hook
export {
  useWebLLM,
  type WebLLMState,
  type ModelSize,
  type UseWebLLMReturn,
} from './use-webllm';

// Typewriter Hook
export {
  useTypewriter,
  type TypingSpeed,
  type UseTypewriterOptions,
  type UseTypewriterReturn,
} from './use-typewriter';

// Proactive Chat Hook
export {
  useProactiveChat,
  type ProactiveChatConfig,
  type UseProactiveChatReturn,
} from './use-proactive-chat';

// Groq Hook
export {
  useGroq,
  type GroqConfig,
  type GroqMessage,
  type GroqModel,
  type UseGroqReturn,
} from './use-groq';

// Visual QA System
export {
  runVisualQA,
  checkOverflow,
  checkWordCohesion,
  autoFixIssue,
  NEWSPAPER_CONSTRAINTS,
  type QAIssue,
  type LayoutConstraint,
} from './visual-qa';

// Orchestrator System
export {
  Orchestrator,
  orchestrator,
  checkProduction,
  type Department,
  type Severity,
  type ProductionIssue,
  type DepartmentReport,
  type ProductionResult,
  type OrchestratorConfig,
} from './orchestrator';

// DNA System
export {
  // Types
  type CollisionBounds,
  type PhysicalForces,
  type OverflowBehavior,
  type ElementType,
  type Axis,
  type ElementDNA,
  type ColorCoupling,
  type AssemblyRules,
  type QualityGate,
  type QualityCheck,
  type RenderingInstructions,
  type Theme,
  type PresetName,
  // DNA Library
  DNA_LIBRARY,
  DNA_TERRAIN,
  DNA_WALL,
  DNA_STEM_VERTICAL,
  DNA_STEM_HORIZONTAL,
  DNA_PETAL_HEADLINE,
  DNA_PETAL_BODY,
  DNA_PETAL_CITATION,
  DNA_PETAL_WORD,
  DNA_POLLEN_BORDER,
  // Optics
  OPTICS_LIGHT,
  OPTICS_DARK,
  // Linguistics
  LINGUISTICS,
  // Manufacturing
  ASSEMBLY,
  // Presets
  RENDERING_PRESETS,
  // Functions
  dnaToCSS,
  generateCSSVariables,
  generateLLMSystemPrompt,
  generateLLMPrompt,
  // Legacy exports
  COLORS_LIGHT,
  COLORS_DARK,
  TYPOGRAPHY,
  ELEMENTS,
} from './design-dna';

// Utilities
export { cn } from './utils';
