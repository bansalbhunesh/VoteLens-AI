/**
 * ChatInput — Text and voice input bar.
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import VoiceButton from './VoiceButton';

export default function ChatInput({ onSend, isLoading, voice }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleVoiceResult = (transcript) => {
    if (transcript) {
      onSend(transcript);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="glass-strong rounded-2xl p-2 flex items-end gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          voice?.isListening
            ? 'Listening...'
            : 'Ask me anything about voting...'
        }
        className="flex-1 bg-transparent resize-none text-sm text-surface-50 placeholder-surface-200 px-3 py-2.5 max-h-32 min-h-[40px] focus:outline-none"
        rows={1}
        disabled={isLoading || voice?.isListening}
        aria-label="Type your message"
        id="chat-input"
      />

      <div className="flex items-center gap-1.5 pb-0.5">
        {/* Voice Button */}
        {voice?.isSupported && (
          <VoiceButton
            isListening={voice.isListening}
            onStart={() => voice.startListening(handleVoiceResult)}
            onStop={voice.stopListening}
            disabled={isLoading}
          />
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-95"
          aria-label="Send message"
          id="send-button"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          )}
        </button>
      </div>
    </motion.form>
  );
}
