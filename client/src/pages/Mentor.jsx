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

  useEffect(() => {
    if (searchParams.get('mode') === 'nervous' && chat.mode !== 'nervous') {
      chat.toggleMode();
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-light tracking-tight mb-2">Mentor</h1>
          <p className="text-sm text-surface-200/60 font-light">
            {chat.mode === 'nervous' ? 'Supportive Mode' : 'Conversational Guide'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={chat.toggleMode} 
            className={`px-4 py-2 rounded-full text-xs font-medium transition-elegant ${chat.mode === 'nervous' ? 'bg-primary-500/10 text-primary-400' : 'bg-white/5 text-surface-200 hover:bg-white/10'}`}
          >
            {chat.mode === 'nervous' ? '🫂 Gentle' : '😊 Default'}
          </button>
          {chat.messages.length > 0 && (
            <button onClick={chat.clearChat} className="text-xs text-surface-200/40 hover:text-surface-200 transition-colors">
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-4 -mr-4 scrollbar-hide" role="list">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h2 className="text-2xl font-light mb-8 text-surface-50/90">How can I help you today?</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {QUICK_PROMPTS.map((qp, i) => (
                  <button 
                    key={i} 
                    onClick={() => chat.sendMessage(qp.text)}
                    className="text-left glass rounded-2xl p-6 text-sm text-surface-200/70 hover:text-surface-50 hover:bg-white/5 transition-elegant group"
                  >
                    <span className="block text-2xl mb-3 opacity-60 group-hover:opacity-100 transition-opacity">{qp.icon}</span>
                    {qp.text}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-8">
            {chat.messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} index={i} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-8 pt-6 border-t border-white/5">
        <ChatInput onSend={chat.sendMessage} isLoading={chat.isLoading} voice={voice} />
      </div>
    </div>
  );
}
