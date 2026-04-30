/**
 * useChat — Chat state management with streaming support.
 */

import { useState, useCallback, useRef } from 'react';
import { streamChat } from '../utils/api';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('normal'); // 'normal' | 'nervous'
  const abortRef = useRef(false);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages([...updatedMessages, { role: 'assistant', content: '', isStreaming: true }]);
    setIsLoading(true);
    abortRef.current = false;

    try {
      let fullResponse = '';
      const stream = streamChat(updatedMessages, mode);

      for await (const chunk of stream) {
        if (abortRef.current) break;
        fullResponse += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: fullResponse,
            isStreaming: true,
          };
          return updated;
        });
      }

      // Finalize the message
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: fullResponse,
          isStreaming: false,
        };
        return updated;
      });
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
          isStreaming: false,
          isError: true,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, mode]);

  const clearChat = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setIsLoading(false);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'normal' ? 'nervous' : 'normal'));
  }, []);

  return {
    messages,
    isLoading,
    mode,
    sendMessage,
    clearChat,
    toggleMode,
  };
}
