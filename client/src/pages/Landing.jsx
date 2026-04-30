import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function Landing() {
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
            className="text-base text-surface-400/60 max-w-xl mx-auto mb-12 leading-relaxed"
          >
            Simulate the polling booth. Verify rumours. Ask anything — in English or Hindi.
            Know your vote. Own your democracy.
          </motion.p>

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
            <Link to="/mentor">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 glass text-surface-50 font-medium rounded-full text-lg hover:bg-white/5 transition-elegant"
              >
                Talk to Mentor
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
