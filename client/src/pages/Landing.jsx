import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { classifyIntent } from '../utils/api';

const features = [
  {
    title: 'Simulate',
    desc: 'Walk through all 7 steps of the voting process in a virtual polling booth with live AI narration.',
    path: '/simulate',
    icon: '🗳️',
    tag: 'Interactive',
    tagColor: 'text-primary-400 bg-primary-500/10',
  },
  {
    title: 'Verify',
    desc: 'Fact-check WhatsApp rumours and analyse voter documents using Gemini + real-time Google Search.',
    path: '/verify',
    icon: '🔍',
    tag: 'Grounded AI',
    tagColor: 'text-accent-400 bg-accent-500/10',
  },
  {
    title: 'Mentor',
    desc: 'Ask anything. Your AI election mentor answers in English or Hindi with voice support.',
    path: '/mentor',
    icon: '💬',
    tag: 'Streaming',
    tagColor: 'text-success-400 bg-success-500/10',
  },
  {
    title: 'Quiz',
    desc: 'Test your civic knowledge. Gemini generates fresh questions every time — 6 topics to master.',
    path: '/quiz',
    icon: '🧠',
    tag: 'JSON Mode',
    tagColor: 'text-danger-400 bg-danger-500/10',
  },
];

const stats = [
  { value: '968M+', label: 'Eligible Voters' },
  { value: '7', label: 'Steps to Cast a Vote' },
  { value: '100%', label: 'Paper Trail via VVPAT' },
  { value: '12', label: 'Valid ID Documents' },
];

const PLACEHOLDER_EXAMPLES = [
  'I saw a WhatsApp forward saying EVMs can be hacked with Bluetooth…',
  'How do I register to vote for the first time?',
  'I\'m nervous about voting — walk me through it',
  'Test my knowledge about voter rights',
  'What happens if I press the wrong button on the EVM?',
  'Can someone else vote on my behalf?',
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const TOOL_ROUTES = {
  verify: '/verify',
  simulate: '/simulate',
  mentor: '/mentor',
  quiz: '/quiz',
};

const TOOL_LABELS = {
  verify: { icon: '🔍', label: 'Fact-Check Engine' },
  simulate: { icon: '🗳️', label: 'Polling Simulation' },
  mentor: { icon: '💬', label: 'AI Mentor' },
  quiz: { icon: '🧠', label: 'Civic Quiz' },
};

export default function Landing() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [isRouting, setIsRouting] = useState(false);
  const [routeResult, setRouteResult] = useState(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef(null);

  // Cycle through placeholder examples
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleOmniSubmit = async (e) => {
    e?.preventDefault();
    const q = question.trim();
    if (!q || isRouting) return;

    setIsRouting(true);
    setRouteResult(null);

    try {
      const intent = await classifyIntent(q);
      setRouteResult(intent);

      // Brief display of the routing result, then navigate
      setTimeout(() => {
        const route = TOOL_ROUTES[intent.tool] || '/mentor';
        const params = new URLSearchParams();

        if (intent.tool === 'verify') {
          params.set('claim', intent.extractedContext || q);
        } else if (intent.tool === 'mentor') {
          params.set('q', intent.extractedContext || q);
          if (intent.suggestedMode === 'nervous') params.set('mode', 'nervous');
        } else if (intent.tool === 'simulate') {
          // Just navigate to simulation start
        } else if (intent.tool === 'quiz') {
          // Navigate to quiz
        }

        const queryString = params.toString();
        navigate(queryString ? `${route}?${queryString}` : route);
      }, 1200);
    } catch {
      // Fallback: direct to mentor
      navigate(`/mentor?q=${encodeURIComponent(q)}`);
    } finally {
      setTimeout(() => setIsRouting(false), 1500);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">

      {/* ── Hero ── */}
      <section className="relative px-6 text-center max-w-5xl mx-auto pt-20 pb-16">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/6 rounded-full blur-[120px]" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-surface-300 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse" />
              Powered by Gemini 2.5 Flash
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-light tracking-tight mb-6"
          >
            <span className="gradient-text font-semibold">VoteLens</span>
            <span className="text-surface-50/80"> AI</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-surface-200/70 font-light max-w-2xl mx-auto mb-4 leading-relaxed"
          >
            India's first AI-powered election mentor.
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-base text-surface-400/60 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Simulate the polling booth. Verify rumours. Ask anything — in English or Hindi.
            Know your vote. Own your democracy.
          </motion.p>

          {/* ── Omni-Intent Input ── */}
          <motion.div variants={itemVariants} className="w-full max-w-2xl mx-auto mb-6">
            <form onSubmit={handleOmniSubmit} className="relative">
              <div className={`omni-input-glow glass rounded-[32px] p-2 flex items-center gap-2 border transition-all duration-500 ${isRouting ? 'border-primary-500/40 shadow-lg shadow-primary-500/10' : 'border-white/5 focus-within:border-white/12'}`}>
                <div className="pl-4 text-xl opacity-60">✨</div>
                <input
                  ref={inputRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={PLACEHOLDER_EXAMPLES[placeholderIdx]}
                  disabled={isRouting}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-base text-surface-50 placeholder-surface-500 py-3 px-2 min-w-0"
                  aria-label="Ask anything about Indian elections"
                />
                <button
                  type="submit"
                  disabled={!question.trim() || isRouting}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all text-base font-bold shrink-0 disabled:bg-surface-800/50 disabled:text-surface-700 bg-primary-500 text-white hover:bg-primary-400 enabled:shadow-lg enabled:shadow-primary-500/20"
                >
                  {isRouting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    '→'
                  )}
                </button>
              </div>
            </form>

            {/* Routing result display */}
            <div className="h-12 mt-4 flex items-center justify-center">
              {routeResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass border border-primary-500/25"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                    <span className="text-surface-400">Routing to</span>
                    <span className="text-xl">{TOOL_LABELS[routeResult.tool]?.icon}</span>
                    <span className="text-primary-400 font-semibold">{TOOL_LABELS[routeResult.tool]?.label}</span>
                  </div>
                  <span className="text-[10px] text-surface-500 tabular-nums">
                    {Math.round(routeResult.confidence * 100)}% confident
                  </span>
                </motion.div>
              )}
              {!routeResult && !isRouting && (
                <p className="text-[11px] text-surface-600">
                  Type anything — the AI will figure out the best tool for you
                </p>
              )}
            </div>
          </motion.div>

          {/* Quick action buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/simulate">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-full text-lg shadow-2xl shadow-primary-500/30 pulse-primary transition-all"
              >
                Begin Simulation →
              </motion.button>
            </Link>
            <Link to="/verify">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 glass text-surface-50 font-medium rounded-full text-lg hover:bg-white/5 transition-elegant"
              >
                Verify a Rumour
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="px-6 pb-16 max-w-4xl mx-auto w-full">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={itemVariants}
              className="glass rounded-2xl p-5 text-center border border-white/5"
            >
              <div className="text-2xl md:text-3xl font-black text-surface-50 mb-1 tracking-tight">
                {s.value}
              </div>
              <div className="text-xs text-surface-400 font-medium leading-snug">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 pb-24 max-w-6xl mx-auto w-full">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={itemVariants}>
              <Link to={f.path} className="group block h-full">
                <div className="glass rounded-3xl p-7 h-full flex flex-col transition-elegant group-hover:scale-[1.03] group-hover:shadow-2xl">
                  <div className="text-4xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                    {f.icon}
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full self-start mb-3 ${f.tagColor}`}>
                    {f.tag}
                  </div>
                  <h3 className="text-lg font-semibold text-surface-50 mb-2">{f.title}</h3>
                  <p className="text-surface-400/80 text-sm leading-relaxed font-light flex-1">{f.desc}</p>
                  <div className="mt-4 text-xs text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Open →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── India Tricolor Strip ── */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #ffffff22 33%, #ffffff22 66%, #138808 66%, #138808 100%)' }} />
    </div>
  );
}
