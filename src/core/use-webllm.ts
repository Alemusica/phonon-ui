/**
 * Phonon UI - useWebLLM Hook
 * 
 * Browser-based LLM for offline/privacy mode using MLC WebLLM.
 * Falls back gracefully on unsupported devices.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Model options sorted by resource requirements
const MODELS = {
  tiny: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
  small: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
  medium: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
  quality: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
} as const;

export type ModelSize = keyof typeof MODELS;

export interface WebLLMState {
  isSupported: boolean;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  progress: number;
  progressText: string;
  modelId: string | null;
}

interface WebLLMEngine {
  reload: (modelId: string) => Promise<void>;
  chat: {
    completions: {
      create: (params: {
        messages: Array<{ role: string; content: string }>;
        stream?: boolean;
        temperature?: number;
        max_tokens?: number;
      }) => Promise<AsyncIterable<{ choices: Array<{ delta: { content?: string } }> }> | { choices: Array<{ message: { content: string } }> }>;
    };
  };
  unload: () => Promise<void>;
}

interface GPUAdapter {
  requestDevice: () => Promise<GPUDevice>;
}

interface GPUDevice {
  limits: {
    maxBufferSize?: number;
  };
  destroy: () => void;
}

interface NavigatorGPU {
  gpu?: {
    requestAdapter: () => Promise<GPUAdapter | null>;
  };
}

/**
 * Check WebGPU support
 */
async function checkWebGPUSupport(): Promise<{ supported: boolean; reason?: string }> {
  if (typeof window === 'undefined') {
    return { supported: false, reason: 'Not in browser' };
  }

  const nav = navigator as NavigatorGPU;
  if (!nav.gpu) {
    return { supported: false, reason: 'WebGPU not available' };
  }

  try {
    const adapter = await nav.gpu.requestAdapter();
    if (!adapter) {
      return { supported: false, reason: 'No GPU adapter found' };
    }

    const device = await adapter.requestDevice();
    const limits = device.limits;
    
    const maxBuffer = limits.maxBufferSize || 0;
    const minRequired = 256 * 1024 * 1024; // 256MB minimum
    
    if (maxBuffer < minRequired) {
      return { supported: false, reason: 'Insufficient GPU memory' };
    }

    device.destroy();
    return { supported: true };
  } catch (e) {
    return { supported: false, reason: `WebGPU error: ${e}` };
  }
}

/**
 * Detect best model based on device capabilities
 */
async function detectBestModel(): Promise<ModelSize> {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory || 4;
  
  if (isMobile || memory < 4) {
    return 'tiny';
  }
  
  if (memory < 8) {
    return 'small';
  }
  
  return 'medium';
}

export interface UseWebLLMReturn extends WebLLMState {
  initialize: (preferredSize?: ModelSize) => Promise<boolean>;
  chat: (
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options?: { temperature?: number; maxTokens?: number }
  ) => AsyncGenerator<string>;
  unload: () => Promise<void>;
  availableModels: typeof MODELS;
}

/**
 * Hook for WebLLM browser-based inference
 */
export function useWebLLM(): UseWebLLMReturn {
  const [state, setState] = useState<WebLLMState>({
    isSupported: false,
    isLoading: false,
    isReady: false,
    error: null,
    progress: 0,
    progressText: '',
    modelId: null,
  });

  const engineRef = useRef<WebLLMEngine | null>(null);

  // Check support on mount
  useEffect(() => {
    checkWebGPUSupport().then(({ supported, reason }) => {
      setState(prev => ({
        ...prev,
        isSupported: supported,
        error: supported ? null : reason || 'WebGPU not supported',
      }));
    });
  }, []);

  // Initialize engine
  const initialize = useCallback(async (preferredSize?: ModelSize): Promise<boolean> => {
    if (!state.isSupported) {
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, progress: 0 }));

    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

      const modelSize = preferredSize || await detectBestModel();
      const modelId = MODELS[modelSize];

      setState(prev => ({ 
        ...prev, 
        progressText: `Loading ${modelSize} model...`,
        modelId 
      }));

      const engine = await CreateMLCEngine(modelId, {
        initProgressCallback: (progress: { progress: number; text: string }) => {
          setState(prev => ({
            ...prev,
            progress: progress.progress,
            progressText: progress.text,
          }));
        },
      });

      engineRef.current = engine as WebLLMEngine;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isReady: true,
        progress: 1,
        progressText: 'Ready',
      }));

      return true;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to initialize WebLLM';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
      return false;
    }
  }, [state.isSupported]);

  // Chat completion (streaming)
  const chat = useCallback(async function* (
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options?: { temperature?: number; maxTokens?: number }
  ): AsyncGenerator<string> {
    if (!engineRef.current || !state.isReady) {
      throw new Error('WebLLM not initialized');
    }

    const response = await engineRef.current.chat.completions.create({
      messages,
      stream: true,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
    });

    for await (const chunk of response as AsyncIterable<{ choices: Array<{ delta: { content?: string } }> }>) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }, [state.isReady]);

  // Cleanup
  const unload = useCallback(async () => {
    if (engineRef.current) {
      await engineRef.current.unload();
      engineRef.current = null;
      setState(prev => ({
        ...prev,
        isReady: false,
        modelId: null,
      }));
    }
  }, []);

  return {
    ...state,
    initialize,
    chat,
    unload,
    availableModels: MODELS,
  };
}
