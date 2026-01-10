/**
 * Phonon UI - useGroq Hook
 *
 * Integration with Groq API for cloud-based LLM streaming.
 * Supports multiple models with configurable parameters.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Groq API configuration
 */
export interface GroqConfig {
  apiKey: string;
  model: GroqModel;
  temperature?: number;
  maxTokens?: number;
}

export type GroqModel = 'llama-3.3-70b-versatile' | 'mixtral-8x7b-32768';

/**
 * Groq message format
 */
export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Return type for useGroq hook
 */
export interface UseGroqReturn {
  chat: (messages: GroqMessage[]) => AsyncGenerator<string>;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  isConfigured: boolean;
}

/**
 * Groq API streaming response chunk format
 */
interface GroqStreamChunk {
  choices: Array<{
    delta?: {
      content?: string;
    };
    finish_reason?: string;
  }>;
}

/**
 * Hook for Groq API integration with streaming support
 */
export function useGroq(config?: GroqConfig): UseGroqReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configRef = useRef<GroqConfig | null>(config || null);

  // Update config when prop changes
  useEffect(() => {
    configRef.current = config || null;
  }, [config]);

  /**
   * Chat completion with streaming
   */
  const chat = useCallback(async function* (
    messages: GroqMessage[]
  ): AsyncGenerator<string> {
    if (!configRef.current) {
      throw new Error('Groq not configured. Please provide GroqConfig.');
    }

    if (!configRef.current.apiKey || configRef.current.apiKey.trim() === '') {
      throw new Error('Groq API key is missing or empty.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${configRef.current.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: configRef.current.model,
          messages,
          stream: true,
          temperature: configRef.current.temperature ?? 0.7,
          max_tokens: configRef.current.maxTokens ?? 1024,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `Groq API error: ${response.status}`;
        throw new Error(errorMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response stream reader');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Keep the last incomplete line in the buffer
          buffer = lines[lines.length - 1];

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();

            if (!line || line === '') continue;
            if (line === '[DONE]') break;

            if (line.startsWith('data: ')) {
              const data = line.slice(6); // Remove 'data: ' prefix

              try {
                const chunk: GroqStreamChunk = JSON.parse(data);
                const content = chunk.choices[0]?.delta?.content;

                if (content) {
                  yield content;
                }
              } catch (parseError) {
                // Skip invalid JSON lines
                console.warn('Failed to parse Groq stream chunk', parseError);
              }
            }
          }
        }

        // Process any remaining buffer content
        if (buffer.trim() && buffer.trim() !== '[DONE]') {
          if (buffer.trim().startsWith('data: ')) {
            const data = buffer.trim().slice(6);
            try {
              const chunk: GroqStreamChunk = JSON.parse(data);
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (parseError) {
              console.warn('Failed to parse final Groq stream chunk', parseError);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    chat,
    isLoading,
    error,
    setError,
    isConfigured: !!config?.apiKey,
  };
}
