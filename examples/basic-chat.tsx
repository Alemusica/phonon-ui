/**
 * Example: Basic Chat App with Phonon UI
 */

import React from 'react';
import {
  ChatWidget,
  useChat,
  SwissHeading,
  swissTheme,
} from 'phonon-ui';
import 'phonon-ui/styles';

// Simulated LLM response for demo
async function* simulateLLMResponse(prompt: string) {
  const responses: Record<string, string> = {
    default: `Grazie per il tuo messaggio! Questa è una demo di **Phonon UI**.

Le features principali includono:
- Streaming parser per comandi LLM
- Typewriter effect umanizzato
- Swiss typography design system
- Supporto WebLLM per offline

[RENDER:{"type":"demo","message":"Hello from AI!"}]`,
  };

  const response = responses.default;
  
  // Simulate streaming
  for (let i = 0; i < response.length; i++) {
    yield response[i];
    await new Promise(r => setTimeout(r, 20));
  }
}

export function BasicChatExample() {
  const {
    messages,
    addMessage,
    updateLastMessage,
    isStreaming,
    setIsStreaming,
  } = useChat();

  const handleSend = async (content: string) => {
    // Add user message
    addMessage('user', content);
    
    // Start streaming
    setIsStreaming(true);
    addMessage('assistant', '');
    
    // Simulate LLM response
    let fullResponse = '';
    for await (const chunk of simulateLLMResponse(content)) {
      fullResponse += chunk;
      updateLastMessage(fullResponse);
    }
    
    setIsStreaming(false);
  };

  return (
    <div className="phonon-container min-h-screen py-8">
      <SwissHeading level={1} className="mb-8">
        Phonon UI Chat
      </SwissHeading>
      
      <div className="h-[600px] border border-border rounded-lg overflow-hidden">
        <ChatWidget
          messages={messages}
          onSend={handleSend}
          isStreaming={isStreaming}
          typingSpeed="fast"
          placeholder="Scrivi un messaggio..."
        />
      </div>
    </div>
  );
}

export default BasicChatExample;
