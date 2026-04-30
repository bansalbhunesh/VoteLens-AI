/**
 * ChatInput — Text and voice input bar.
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import VoiceButton from './VoiceButton';

export default function ChatInput({ onSend, isLoading, voice }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="relative group max-w-3xl mx-auto">
      <div className="glass rounded-[32px] p-2 flex items-end gap-2 border border-white/5 group-focus-within:border-white/10 transition-colors">
        <div className="p-2">
          <VoiceButton voice={voice} onTranscript={(t) => setText((prev) => prev + t)} />
        </div>
        
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] text-surface-50 placeholder-surface-500 resize-none py-3 px-2 max-h-32 min-h-[44px] scrollbar-hide"
          rows={1}
        />

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className={`p-2.5 rounded-xl transition-all duration-300 ${
            text.trim() && !isLoading 
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
              : 'bg-transparent text-surface-600'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      
      {voice.isListening && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-surface-900 px-4 py-2 rounded-full border border-primary-500/20 shadow-xl">
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
          </span>
          <span className="text-[11px] text-primary-400 font-medium tracking-wider uppercase">Listening</span>
        </div>
      )}
    </div>
  );
}
