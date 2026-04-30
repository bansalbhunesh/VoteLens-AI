import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useChat } from '../hooks/useChat';
import { useVoice } from '../hooks/useVoice';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { QUICK_PROMPTS } from '../utils/constants';

export default function Mentor() {
  const chat = useChat();
  const voice = useVoice();
  const messagesEndRef = useRef(null);
  const [searchParams] = useSearchParams();

  // Auto-enable nervous mode from URL
  useEffect(() => {
    if (searchParams.get('mode') === 'nervous' && chat.mode !== 'nervous') {
      chat.toggleMode();
    }
  }, [searchParams]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // Auto-speak AI responses
  const lastMessageRef = useRef(null);
  useEffect(() => {
    const lastMsg = chat.messages[chat.messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.isStreaming && lastMsg.content !== lastMessageRef.current) {
      lastMessageRef.current = lastMsg.content;
      // Optionally speak — disabled by default for UX
    }
  }, [chat.messages]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">AI Election Mentor</h1>
          <p className="text-xs text-surface-200">
            {chat.mode === 'nervous' ? '🫂 Nervous Voter Mode — Extra calm & supportive' : 'Ask anything about the election process'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice toggle */}
          {voice.isSupported && (
            <button onClick={() => voice.isSpeaking ? voice.stopSpeaking() : null} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${voice.isSpeaking ? 'bg-accent-500/20 text-accent-400' : 'bg-white/5 text-surface-200'}`} aria-label="Voice output status" id="voice-status">
              {voice.isSpeaking ? '🔊 Speaking...' : '🔇 Voice Off'}
            </button>
          )}
          {/* Mode toggle */}
          <button onClick={chat.toggleMode} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${chat.mode === 'nervous' ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30' : 'glass text-surface-200 hover:text-white'}`} id="mode-toggle">
            {chat.mode === 'nervous' ? '🫂 Nervous Mode ON' : '😊 Normal Mode'}
          </button>
          {/* Clear */}
          {chat.messages.length > 0 && (
            <button onClick={chat.clearChat} className="px-3 py-1.5 rounded-lg text-xs glass text-surface-200 hover:text-danger-400 transition-colors" id="clear-chat">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2" role="list" aria-label="Chat messages">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="text-5xl mb-4">🗳️</div>
              <h2 className="text-lg font-bold mb-2">Hello! I'm your AI Election Mentor.</h2>
              <p className="text-sm text-surface-200 mb-8 max-w-md">
                {chat.mode === 'nervous'
                  ? "I'm here to help you feel confident about voting. There are no silly questions — ask me anything! 💛"
                  : "Ask me anything about the Indian election process, voter registration, or how to vote."}
              </p>

              {/* Quick Prompts */}
              <div className="grid grid-cols-2 gap-2 max-w-md">
                {QUICK_PROMPTS.map((qp, i) => (
                  <motion.button key={i} onClick={() => chat.sendMessage(qp.text)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="text-left glass rounded-xl p-3 text-xs text-surface-200 hover:text-white hover:bg-white/[0.04] transition-all group" id={`quick-prompt-${i}`}>
                    <span className="mr-2">{qp.icon}</span>
                    {qp.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {chat.messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} index={i} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="mt-4">
        <ChatInput onSend={chat.sendMessage} isLoading={chat.isLoading} voice={voice} />
        {voice.isListening && voice.transcript && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-primary-400 mt-2 text-center">
            🎤 "{voice.transcript}"
          </motion.p>
        )}
      </div>
    </div>
  );
}
