/**
 * Phonon UI - ChatWidget Component
 * 
 * Complete chat interface with streaming support and typewriter effect.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../core/utils';
import { TypingSpeed } from '../core/use-typewriter';
import { parseStreamingContent } from '../core/streaming-parser';
import { Message } from '../core/use-chat';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface ChatWidgetProps {
  /** Chat messages */
  messages: Message[];
  /** Handler for sending messages */
  onSend: (content: string) => void;
  /** Whether the AI is currently streaming */
  isStreaming?: boolean;
  /** Typing speed for assistant messages */
  typingSpeed?: TypingSpeed;
  /** Input placeholder text */
  placeholder?: string;
  /** Additional class name */
  className?: string;
  /** Show user avatars */
  showAvatars?: boolean;
  /** Custom user avatar */
  userAvatar?: React.ReactNode;
  /** Custom assistant avatar */
  assistantAvatar?: React.ReactNode;
}

/**
 * Chat input component
 */
function ChatInput({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
}: {
  onSend: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  }, [input, disabled, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <form onSubmit={handleSubmit} className="phonon-chat-input">
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          'w-full resize-none bg-transparent px-4 py-3',
          'border border-border rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-sage/50',
          'placeholder:text-muted-foreground',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      />
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2',
          'px-3 py-1.5 rounded-md',
          'bg-sage text-background',
          'hover:bg-sage/90 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        Send
      </button>
    </form>
  );
}

/**
 * Single chat message component
 */
function ChatMessage({
  message,
  isLast,
  isStreaming,
  typingSpeed,
}: {
  message: Message;
  isLast: boolean;
  isStreaming: boolean;
  typingSpeed: TypingSpeed;
}) {
  const isUser = message.role === 'user';
  const shouldType = !isUser && isLast && isStreaming;
  
  // Parse content for commands
  const parsed = parseStreamingContent(message.content);
  const cleanContent = parsed.cleanText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'phonon-chat-message',
        isUser ? 'phonon-chat-message--user' : 'phonon-chat-message--assistant'
      )}
    >
      <div
        className={cn(
          'rounded-lg px-4 py-3',
          isUser 
            ? 'bg-sage text-background' 
            : 'bg-muted'
        )}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <MarkdownRenderer
            content={cleanContent}
            typewriter={shouldType}
            typingSpeed={typingSpeed}
          />
        )}
      </div>
    </motion.div>
  );
}

/**
 * Complete chat widget with messages and input
 */
export function ChatWidget({
  messages,
  onSend,
  isStreaming = false,
  typingSpeed = 'fast',
  placeholder = 'Type a message...',
  className,
}: ChatWidgetProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={cn('phonon-chat-widget flex flex-col h-full', className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
              isStreaming={isStreaming}
              typingSpeed={typingSpeed}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 relative">
        <ChatInput
          onSend={onSend}
          placeholder={placeholder}
          disabled={isStreaming}
        />
      </div>
    </div>
  );
}
