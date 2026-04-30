import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="text-7xl mb-6">🗺️</div>
        <h1 className="text-3xl font-semibold text-surface-50 mb-3">Page not found</h1>
        <p className="text-surface-400 text-sm mb-10 leading-relaxed">
          This route doesn't exist. Head back to start your civic education journey.
        </p>
        <Link to="/">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-full transition-all shadow-lg shadow-primary-500/20"
          >
            Back to Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
