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

// Utilities
export { cn } from './utils';
