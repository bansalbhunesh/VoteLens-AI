/**
 * Orchestrator — Persistent floating UI for cross-screen intelligence.
 * Shows contextual suggestions and idle nudges based on session memory.
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalContext } from '../hooks/useGlobalContext';

const TOOL_MAP = {
  '/simulate': 'simulate',
  '/verify': 'verify',
  '/mentor': 'mentor',
  '/quiz': 'quiz',
};

export default function Orchestrator() {
  const location = useLocation();
  const navigate = useNavigate();
  const ctx = useGlobalContext();

  const currentTool = TOOL_MAP[location.pathname] || null;

  // Record tool visit and generate suggestions on navigation
  useEffect(() => {
    if (currentTool) {
      ctx.recordToolVisit(currentTool);
      ctx.generateSuggestion(currentTool);
    }
    return () => {
      ctx.resetIdleTimer();
    };
  }, [currentTool]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSuggestionAction = () => {
    const action = ctx.orchestratorSuggestion?.action;
    if (!action) return;

    ctx.dismissSuggestion();

    switch (action.type) {
      case 'jump_simulation':
        navigate(`/simulate?jumpTo=${action.step}`);
        break;
      case 'ask_mentor':
        navigate(`/mentor?q=${encodeURIComponent(action.query)}`);
        break;
      case 'suggest_quiz':
        navigate(`/quiz?topic=${action.topic}`);
        break;
      default:
        break;
    }
  };

  const suggestion = ctx.orchestratorSuggestion;
  const nudge = ctx.idleNudge;

  // Don't show on landing page
  if (location.pathname === '/') return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none max-w-sm">
      {/* Cross-screen suggestion */}
      <AnimatePresence>
        {suggestion && (
          <motion.div
            key="suggestion"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto orchestrator-card glass rounded-2xl p-5 border border-primary-500/20 shadow-2xl shadow-primary-500/10"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center text-xl shrink-0">
                {suggestion.icon || '✨'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                  Lens Intelligence
                </div>
                <p className="text-sm text-surface-200 leading-snug mb-3">
                  {suggestion.text}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSuggestionAction}
                    className="px-4 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-full hover:bg-primary-400 transition-all shadow-lg shadow-primary-500/20"
                  >
                    Yes, let's go →
                  </button>
                  <button
                    onClick={ctx.dismissSuggestion}
                    className="px-3 py-1.5 text-xs text-surface-500 hover:text-surface-300 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle nudge */}
      <AnimatePresence>
        {nudge && !suggestion && (
          <motion.div
            key="nudge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto glass rounded-2xl px-4 py-3 border border-accent-500/20 shadow-xl max-w-xs"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg shrink-0">{nudge.icon || '💡'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-surface-300 leading-snug">{nudge.text}</p>
              </div>
              <button
                onClick={ctx.dismissIdleNudge}
                className="text-surface-600 hover:text-surface-400 text-xs shrink-0 transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
