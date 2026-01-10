/**
 * Phonon UI - useChat Hook
 * 
 * Core hook for managing chat state with LLM streaming support.
 */

import { useState, useCallback, useRef } from 'react';
import { parseStreamingContent, ParsedCommand } from './streaming-parser';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface UseChatOptions {
  initialMessages?: Message[];
  systemPrompt?: string;
  onCommand?: (command: ParsedCommand, messageId: string) => void;
}

export interface UseChatReturn {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (role: Message['role'], content: string) => string;
  updateLastMessage: (content: string) => void;
  clearHistory: () => void;
  historyMessages: Message[];
  currentMessage: Message | null;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Hook for managing chat messages with streaming support
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { initialMessages = [], onCommand } = options;
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const executedCommandsRef = useRef<Set<string>>(new Set());

  // Add a new message
  const addMessage = useCallback((role: Message['role'], content: string): string => {
    const id = generateMessageId();
    const newMessage: Message = {
      id,
      role,
      content,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return id;
  }, []);

  // Update the last message (for streaming)
  const updateLastMessage = useCallback((content: string) => {
    setMessages(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const lastMsg = updated[updated.length - 1];
      
      // Parse for commands
      if (onCommand) {
        const parsed = parseStreamingContent(content);
        for (const cmd of parsed.commands) {
          const cmdKey = `${lastMsg.id}-${cmd.type}-${JSON.stringify(cmd.data)}`;
          if (!executedCommandsRef.current.has(cmdKey)) {
            executedCommandsRef.current.add(cmdKey);
            onCommand(cmd, lastMsg.id);
          }
        }
      }
      
      updated[updated.length - 1] = { ...lastMsg, content };
      return updated;
    });
  }, [onCommand]);

  // Clear all messages
  const clearHistory = useCallback(() => {
    setMessages([]);
    executedCommandsRef.current.clear();
  }, []);

  // Get history (all messages except current streaming one)
  const historyMessages = isStreaming ? messages.slice(0, -1) : messages;
  
  // Get current streaming message
  const currentMessage = isStreaming && messages.length > 0 
    ? messages[messages.length - 1] 
    : null;

  return {
    messages,
    setMessages,
    addMessage,
    updateLastMessage,
    clearHistory,
    historyMessages,
    currentMessage,
    isStreaming,
    setIsStreaming,
  };
}

/**
 * Hook for tracking executed commands (idempotency)
 */
export function useCommandTracker() {
  const executedCommandsRef = useRef<Set<string>>(new Set());

  const hasExecuted = useCallback((messageId: string, cmd: ParsedCommand): boolean => {
    const cmdKey = `${messageId}-${cmd.type}-${JSON.stringify(cmd.data)}`;
    return executedCommandsRef.current.has(cmdKey);
  }, []);

  const markExecuted = useCallback((messageId: string, cmd: ParsedCommand): void => {
    const cmdKey = `${messageId}-${cmd.type}-${JSON.stringify(cmd.data)}`;
    executedCommandsRef.current.add(cmdKey);
  }, []);

  const reset = useCallback(() => {
    executedCommandsRef.current.clear();
  }, []);

  return { hasExecuted, markExecuted, reset };
}
