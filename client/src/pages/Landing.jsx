import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Experience',
    desc: 'Walk through a virtual polling booth with step-by-step guidance.',
    path: '/simulate',
    icon: '🗳️'
  },
  {
    title: 'Verify',
    desc: 'Verify election information and rumors with real-time AI fact-checking.',
    path: '/verify',
    icon: '🔍'
  },
  {
    title: 'Guide',
    desc: 'Connect with an AI Mentor for personalized, empathetic voting support.',
    path: '/mentor',
    icon: '💬'
  },
];

export default function Landing() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center">
      {/* Hero */}
      <section className="relative px-6 text-center max-w-5xl mx-auto py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-6xl md:text-8xl font-light tracking-tight mb-8">
            <span className="gradient-text font-medium">VoteLens</span>
            <span className="text-surface-50/90"> AI</span>
          </h1>

          <p className="text-xl md:text-2xl text-surface-200/80 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
            A thoughtful election companion designed to help you navigate the voting process with confidence and clarity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/simulate">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 bg-surface-50 text-surface-950 font-medium rounded-full text-lg transition-elegant hover:shadow-2xl hover:shadow-surface-50/10"
              >
                Begin Simulation
              </motion.button>
            </Link>
            <Link to="/mentor">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 glass text-surface-50 font-medium rounded-full text-lg hover:bg-white/5 transition-elegant"
              >
                Talk to Mentor
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Subtle Features */}
      <section className="px-6 pb-24 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
            >
              <Link to={f.path} className="group block">
                <div className="glass rounded-3xl p-8 h-full transition-elegant group-hover:scale-[1.02]">
                  <div className="text-3xl mb-6 opacity-80 group-hover:opacity-100 transition-opacity">{f.icon}</div>
                  <h3 className="text-xl font-medium text-surface-50 mb-3">{f.title}</h3>
                  <p className="text-surface-200/70 leading-relaxed font-light">{f.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
