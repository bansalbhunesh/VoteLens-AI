import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  {
    icon: '🗳️', title: 'Interactive Simulation', desc: 'Walk through a virtual polling booth. Experience every step of voting — from ID check to VVPAT verification.',
    path: '/simulate', color: 'from-primary-500 to-primary-700', glow: 'glow-primary',
  },
  {
    icon: '🔍', title: 'Verify & Fact-Check', desc: 'Upload WhatsApp rumors or election screenshots. AI verifies them against official sources in real-time.',
    path: '/verify', color: 'from-accent-500 to-accent-600', glow: 'glow-accent',
  },
  {
    icon: '💬', title: 'AI Election Mentor', desc: 'Ask anything about voting. Get personalized, empathetic guidance with voice support.',
    path: '/mentor', color: 'from-success-500 to-success-400', glow: 'glow-success',
  },
];

export default function Landing() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <section className="relative py-20 sm:py-32 px-4 text-center overflow-hidden" aria-labelledby="hero-title">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute top-20 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 25, repeat: Infinity }} className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-primary-300 mb-8">
              <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
              Powered by Google Gemini AI
            </div>

            <h1 id="hero-title" className="text-5xl sm:text-7xl font-black tracking-tight leading-tight mb-6">
              <span className="gradient-text">VoteLens</span>
              <span className="text-surface-50"> AI</span>
            </h1>

            <p className="text-xl sm:text-2xl text-surface-200 max-w-2xl mx-auto mb-4 leading-relaxed font-light">
              Your AI election companion that helps you
              <span className="text-primary-400 font-medium"> understand</span>,
              <span className="text-accent-400 font-medium"> experience</span>, and
              <span className="text-success-400 font-medium"> verify</span> the election process.
            </p>

            <p className="text-sm text-surface-200 mb-10">
              Not a chatbot. An interactive learning experience for every citizen.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/simulate">
                <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99,102,241,0.4)' }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-2xl text-lg shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow" id="cta-simulate">
                  🗳️ Start Voting Simulation
                </motion.button>
              </Link>
              <Link to="/mentor">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-4 glass text-surface-50 font-semibold rounded-2xl text-lg hover:bg-white/10 transition-colors" id="cta-mentor">
                  💬 Talk to AI Mentor
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4" aria-labelledby="features-heading">
        <div className="max-w-5xl mx-auto">
          <h2 id="features-heading" className="sr-only">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.15 }}>
                <Link to={f.path} className="block group" id={`feature-card-${i}`}>
                  <div className="glass rounded-2xl p-6 h-full hover:bg-white/[0.04] transition-all duration-300 group-hover:border-primary-500/30 group-hover:scale-[1.02]">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-bold text-surface-50 mb-2">{f.title}</h3>
                    <p className="text-sm text-surface-200 leading-relaxed">{f.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nervous Voter Banner */}
      <section className="py-12 px-4" aria-labelledby="nervous-heading">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="max-w-3xl mx-auto">
          <Link to="/mentor?mode=nervous" id="nervous-voter-cta">
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/[0.04] transition-all cursor-pointer group gradient-border">
              <p className="text-3xl mb-3">🫂</p>
              <h3 id="nervous-heading" className="text-xl font-bold text-surface-50 mb-2">Feeling nervous about voting?</h3>
              <p className="text-surface-200 text-sm mb-4">That is completely normal. Our Nervous First-Time Voter mode gives you extra calm, step-by-step guidance with emotional support.</p>
              <span className="inline-flex items-center gap-2 text-primary-400 text-sm font-medium group-hover:gap-3 transition-all">
                Try it now <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
