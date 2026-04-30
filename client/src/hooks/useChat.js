import { useState, useCallback, useRef, useEffect } from 'react';
import { streamChat, getElectionInfo } from '../utils/api';

const SESSION_KEY = 'votelens_chat_history';
const MAX_STORED_MESSAGES = 60;

function loadHistory() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages) {
  try {
    const storable = messages
      .filter((m) => !m.isStreaming && !m.isError)
      .slice(-MAX_STORED_MESSAGES);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(storable));
  } catch {
    // sessionStorage quota exceeded — silently ignore
  }
}

export function useChat() {
  const [messages, setMessages] = useState(() => loadHistory());
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('normal');
  const [useGrounding, setUseGrounding] = useState(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const stable = messages.filter((m) => !m.isStreaming);
    if (stable.length > 0) saveHistory(stable);
  }, [messages]);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const sendMessage = useCallback(
    async (text, lang = 'en') => {
      if (!text.trim() || isLoading) return;

      const userMessage = { role: 'user', content: text.trim(), ts: Date.now() };
      const history = [...messages, userMessage];

      setMessages([...history, { role: 'assistant', content: '', isStreaming: true, isGrounded: useGrounding }]);
      setIsLoading(true);

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        if (useGrounding) {
          const { text: answer, sources } = await getElectionInfo(text.trim());
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              role: 'assistant',
              content: answer,
              isStreaming: false,
              sources: sources || [],
              ts: Date.now(),
            };
            return next;
          });
        } else {
          let fullResponse = '';
          const stream = streamChat(history, mode, abortControllerRef.current.signal, lang);

          for await (const chunk of stream) {
            fullResponse += chunk;
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = { role: 'assistant', content: fullResponse, isStreaming: true };
              return next;
            });
          }

          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: 'assistant', content: fullResponse, isStreaming: false, ts: Date.now() };
            return next;
          });
        }
      } catch (err) {
        if (err.name === 'AbortError') return;

        console.error('[useChat]', err);
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'assistant',
            content: 'Something went wrong. Please try again.',
            isStreaming: false,
            isError: true,
          };
          return next;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, mode, useGrounding]
  );

  const cancelMessage = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setMessages((prev) => prev.filter((m) => !m.isStreaming));
  }, []);

  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'normal' ? 'nervous' : 'normal'));
  }, []);

  const toggleGrounding = useCallback(() => {
    setUseGrounding((prev) => !prev);
  }, []);

  return { messages, isLoading, mode, useGrounding, sendMessage, cancelMessage, clearChat, toggleMode, toggleGrounding };
}
