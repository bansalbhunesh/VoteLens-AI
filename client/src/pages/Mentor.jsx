import { useEffect, useRef, useState } from 'react';
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
  const [lang, setLang] = useState('en');

  useEffect(() => {
    if (searchParams.get('mode') === 'nervous' && chat.mode !== 'nervous') {
      chat.toggleMode();
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-light tracking-tight mb-1">Mentor</h1>
          <p className="text-sm text-surface-200/60 font-light">
            {chat.mode === 'nervous' ? 'Supportive mode — patient, step-by-step guidance' : 'Ask anything about the Indian election process'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language toggle */}
          <button
            onClick={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-elegant ${lang === 'hi' ? 'bg-accent-500/10 text-accent-400 border border-accent-500/30' : 'bg-white/5 text-surface-400 hover:bg-white/10'}`}
            title="Toggle language"
          >
            {lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
          </button>

          {/* Live search toggle */}
          <button
            onClick={chat.toggleGrounding}
            title={chat.useGrounding ? 'Switch to conversational mode' : 'Enable live Google Search for current events'}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-elegant flex items-center gap-1.5 ${
              chat.useGrounding
                ? 'bg-success-500/10 text-success-400 border border-success-500/30'
                : 'bg-white/5 text-surface-400 hover:bg-white/10'
            }`}
          >
            <span>{chat.useGrounding ? '🔍' : '🔍'}</span>
            {chat.useGrounding ? 'Live Search On' : 'Live Search'}
          </button>

          {/* Mode toggle */}
          <button
            onClick={chat.toggleMode}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-elegant ${
              chat.mode === 'nervous'
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                : 'bg-white/5 text-surface-400 hover:bg-white/10'
            }`}
          >
            {chat.mode === 'nervous' ? '🫂 Supportive' : '😊 Default'}
          </button>

          {chat.messages.length > 0 && (
            <button
              onClick={chat.clearChat}
              className="px-3 py-1.5 text-xs text-surface-600 hover:text-surface-300 transition-colors rounded-full hover:bg-white/5"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grounding notice */}
      {chat.useGrounding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 px-4 py-2.5 glass rounded-xl border border-success-500/20 text-xs text-success-400 flex items-center gap-2"
        >
          <span>🌐</span>
          <span>Live Search enabled — answers are grounded with real-time Google Search results and include source links.</span>
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-hide" role="list" aria-label="Conversation">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h2 className="text-2xl font-light mb-8 text-surface-50/90">How can I help you today?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {QUICK_PROMPTS.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => chat.sendMessage(qp.text, lang)}
                    className="text-left glass rounded-2xl p-5 text-sm text-surface-200/70 hover:text-surface-50 hover:bg-white/5 transition-elegant group"
                  >
                    <span className="block text-2xl mb-2 opacity-60 group-hover:opacity-100 transition-opacity">{qp.icon}</span>
                    {qp.text}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {chat.messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} index={i} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-6 pt-5 border-t border-white/5">
        <ChatInput
          onSend={(text) => chat.sendMessage(text, lang)}
          isLoading={chat.isLoading}
          voice={voice}
          lang={lang}
        />
      </div>
    </div>
  );
}
