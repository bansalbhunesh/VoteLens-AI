import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../hooks/useChat';
import { useVoice } from '../hooks/useVoice';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { QUICK_PROMPTS } from '../utils/constants';

// Contextual follow-up suggestions derived from keywords in the last AI response.
const FOLLOW_UPS = {
  register: [
    'How do I check my registration status online?',
    "What's the cut-off date to register before an election?",
    'Can I register online from home?',
  ],
  id: [
    'What if I forget my ID on poll day?',
    'Is Aadhaar accepted without a Voter ID card?',
    'Which of the 12 IDs is most commonly used?',
  ],
  evm: [
    'Can the EVM be hacked or tampered with?',
    'What happens if I press the wrong button?',
    'How does the EVM seal prevent fraud?',
  ],
  nota: [
    'Does NOTA affect who wins the election?',
    'When was NOTA introduced in India?',
    'How many votes did NOTA receive in the last election?',
  ],
  vvpat: [
    'Is the VVPAT paper slip counted manually after the election?',
    'What if the VVPAT shows the wrong candidate?',
    'How long does the paper slip remain visible?',
  ],
  booth: [
    'What if someone is intimidating voters at the booth?',
    'Can I take a photo inside the polling booth?',
    'What assistance is available for elderly voters?',
  ],
  default: [
    'Can you explain this in simpler terms?',
    'What should a first-time voter know about this?',
    'Are there common myths I should be aware of?',
  ],
};

function getFollowUps(content) {
  if (!content) return FOLLOW_UPS.default;
  const t = content.toLowerCase();
  if (t.includes('register') || t.includes('enrollment') || t.includes('form 6') || t.includes('electoral roll')) return FOLLOW_UPS.register;
  if (t.includes('aadhaar') || t.includes('voter id') || t.includes('document') || t.includes('identity') || t.includes('pan card') || t.includes('driving licence')) return FOLLOW_UPS.id;
  if (t.includes('evm') || t.includes('electronic voting') || t.includes('tamper') || t.includes('ballot unit')) return FOLLOW_UPS.evm;
  if (t.includes('nota') || t.includes('none of the above')) return FOLLOW_UPS.nota;
  if (t.includes('vvpat') || t.includes('paper slip') || t.includes('paper trail') || t.includes('audit trail')) return FOLLOW_UPS.vvpat;
  if (t.includes('booth') || t.includes('polling station') || t.includes('queue') || t.includes('polling officer')) return FOLLOW_UPS.booth;
  return FOLLOW_UPS.default;
}

export default function Mentor() {
  const chat = useChat();
  const voice = useVoice();
  const messagesEndRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [lang, setLang] = useState('en');
  const didAutoSendRef = useRef(false);

  // Wire ?mode=nervous from URL
  useEffect(() => {
    if (searchParams.get('mode') === 'nervous' && chat.mode !== 'nervous') {
      chat.toggleMode();
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-send ?q= from landing page search input (only on fresh sessions)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !didAutoSendRef.current && chat.messages.length === 0) {
      didAutoSendRef.current = true;
      chat.sendMessage(q, 'en');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  const lastAI = chat.messages.filter((m) => m.role === 'assistant' && !m.isStreaming && !m.isError).at(-1);
  const followUps = getFollowUps(lastAI?.content);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-light tracking-tight mb-1">Mentor</h1>
          <p className="text-sm text-surface-200/60 font-light">
            {chat.mode === 'nervous'
              ? 'Supportive mode — patient, step-by-step guidance'
              : 'Ask anything about the Indian election process'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-elegant ${
              lang === 'hi'
                ? 'bg-accent-500/10 text-accent-400 border border-accent-500/30'
                : 'bg-white/5 text-surface-400 hover:bg-white/10'
            }`}
            title="Toggle language"
          >
            {lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
          </button>

          <button
            onClick={chat.toggleGrounding}
            title={chat.useGrounding ? 'Switch to conversational mode' : 'Enable live Google Search'}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-elegant flex items-center gap-1.5 ${
              chat.useGrounding
                ? 'bg-success-500/10 text-success-400 border border-success-500/30'
                : 'bg-white/5 text-surface-400 hover:bg-white/10'
            }`}
          >
            <span>🔍</span>
            {chat.useGrounding ? 'Live Search On' : 'Live Search'}
          </button>

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
      <AnimatePresence>
        {chat.useGrounding && (
          <motion.div
            key="grounding-notice"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 px-4 py-2.5 glass rounded-xl border border-success-500/20 text-xs text-success-400 flex items-center gap-2"
          >
            <span>🌐</span>
            <span>Live Search enabled — answers grounded with real-time Google Search and source links.</span>
          </motion.div>
        )}
      </AnimatePresence>

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
              <ChatBubble key={`${msg.role}-${i}`} message={msg} index={i} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Contextual follow-up chips — appear after AI responds */}
      <AnimatePresence>
        {chat.messages.length > 0 && !chat.isLoading && (
          <motion.div
            key="follow-ups"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-3 pb-1 flex gap-2 overflow-x-auto scrollbar-hide"
          >
            {followUps.map((prompt, i) => (
              <button
                key={i}
                onClick={() => chat.sendMessage(prompt, lang)}
                className="shrink-0 text-[11px] text-surface-500 hover:text-surface-200 px-3 py-1.5 rounded-full border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04] transition-all whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="mt-2 pt-4 border-t border-white/5">
        <ChatInput
          onSend={(text) => chat.sendMessage(text, lang)}
          onCancel={chat.cancelMessage}
          isLoading={chat.isLoading}
          voice={voice}
          lang={lang}
          autoFocus
        />
      </div>
    </div>
  );
}
