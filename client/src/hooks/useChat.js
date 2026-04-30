/**
 * useChat — Chat state management with streaming support.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { streamChat } from '../utils/api';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('normal'); // 'normal' | 'nervous'
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const sendMessage = useCallback(async (text, lang = 'en') => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages([...updatedMessages, { role: 'assistant', content: '', isStreaming: true }]);
    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      let fullResponse = '';
      const stream = streamChat(updatedMessages, mode, abortControllerRef.current.signal, lang);

      for await (const chunk of stream) {
        // We don't need abortRef check here because fetch throws AbortError
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
      if (error.name === 'AbortError') return; // Ignore abort errors

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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
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
