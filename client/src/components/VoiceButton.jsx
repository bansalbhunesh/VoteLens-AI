/**
 * VoiceButton — Animated microphone button.
 */

import { motion } from 'framer-motion';

export default function VoiceButton({ isListening, onStart, onStop, disabled }) {
  return (
    <motion.button
      type="button"
      onClick={isListening ? onStop : onStart}
      disabled={disabled}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
        isListening
          ? 'bg-danger-500 text-white shadow-lg shadow-danger-500/30'
          : 'bg-white/5 text-surface-200 hover:bg-white/10 hover:text-white'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
      whileTap={{ scale: 0.9 }}
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      aria-pressed={isListening}
      id="voice-button"
    >
      {/* Pulse rings when listening */}
      {isListening && (
        <>
          <motion.span
            className="absolute inset-0 rounded-xl bg-danger-500/30"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.span
            className="absolute inset-0 rounded-xl bg-danger-500/20"
            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}

      {/* Mic icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 relative z-10"
      >
        {isListening ? (
          <path d="M8 4a4 4 0 1 1 8 0v6a4 4 0 0 1-8 0V4zm-2 6a6 6 0 1 0 12 0h2a8 8 0 0 1-7 7.93V22h-2v-4.07A8 8 0 0 1 4 10h2z" />
        ) : (
          <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM7 10a5 5 0 0 0 10 0h2a7 7 0 0 1-6 6.93V20h3v2H8v-2h3v-3.07A7 7 0 0 1 5 10h2z" />
        )}
      </svg>
    </motion.button>
  );
}
