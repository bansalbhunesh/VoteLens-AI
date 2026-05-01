/* eslint-disable react-refresh/only-export-components */
/**
 * GlobalContext — Cross-screen session memory for orchestration.
 * Tracks user actions across tools to enable contextual suggestions.
 */

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { auth, db } from '../firebase.js';
import { doc, setDoc } from 'firebase/firestore';

const GlobalContext = createContext(null);

const MAX_EVENTS = 50;

export function GlobalContextProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [lastVerifiedClaim, setLastVerifiedClaim] = useState(null);
  const [lastVerdict, setLastVerdict] = useState(null);
  const [quizWeakTopics, setQuizWeakTopics] = useState([]);
  const [visitedTools, setVisitedTools] = useState(new Set());
  const [sessionStartTime] = useState(() => Date.now());
  const idleTimerRef = useRef(null);
  const [idleNudge, setIdleNudge] = useState(null);
  const [orchestratorSuggestion, setOrchestratorSuggestion] = useState(null);

  const logEvent = useCallback((type, data) => {
    const event = { type, data, ts: Date.now() };
    setEvents((prev) => [...prev.slice(-(MAX_EVENTS - 1)), event]);

    // Firestore Persistence Integration
    if (db) {
      try {
        const docId = `session_${Date.now()}`;
        setDoc(doc(db, 'session_events', docId), {
          type,
          data,
          ts: Date.now(),
          uid: auth?.currentUser?.uid || 'anonymous_user'
        });
      } catch {
        // Silent fallback
      }
    }
  }, []);

  const recordToolVisit = useCallback((tool) => {
    setVisitedTools((prev) => new Set([...prev, tool]));
  }, []);

  const recordVerification = useCallback((claim, verdict) => {
    setLastVerifiedClaim(claim);
    setLastVerdict(verdict);
    logEvent('verify', { claim, verdict });
  }, [logEvent]);

  const recordQuizResult = useCallback((topic, score, total) => {
    logEvent('quiz', { topic, score, total });
    if (score < 3) {
      setQuizWeakTopics((prev) => {
        const next = prev.filter((t) => t !== topic);
        return [...next, topic];
      });
    }
  }, [logEvent]);

  const recordSimulationStep = useCallback((step, stepName) => {
    logEvent('simulation', { step, stepName });
  }, [logEvent]);

  // Generate contextual suggestion based on session state
  const generateSuggestion = useCallback((currentTool) => {
    // If user verified an EVM claim and goes to simulation
    if (currentTool === 'simulate' && lastVerifiedClaim) {
      const claimLower = lastVerifiedClaim.toLowerCase();
      if (claimLower.includes('evm') || claimLower.includes('machine') || claimLower.includes('hack') || claimLower.includes('tamper')) {
        setOrchestratorSuggestion({
          text: `You just verified an EVM claim. Want to skip ahead to the EVM voting step to see how it actually works?`,
          action: { type: 'jump_simulation', step: 5 },
          icon: '🗳️',
        });
        return;
      }
      if (claimLower.includes('vvpat') || claimLower.includes('paper') || claimLower.includes('slip')) {
        setOrchestratorSuggestion({
          text: `Curious about VVPAT after that verification? Jump to the paper trail verification step.`,
          action: { type: 'jump_simulation', step: 6 },
          icon: '📄',
        });
        return;
      }
      if (claimLower.includes('ink') || claimLower.includes('indelible')) {
        setOrchestratorSuggestion({
          text: `Want to see how indelible inking works in practice? Jump to the inking step.`,
          action: { type: 'jump_simulation', step: 4 },
          icon: '✍️',
        });
        return;
      }
    }

    // If user did poorly in a quiz, suggest mentor
    if (currentTool === 'mentor' && quizWeakTopics.length > 0) {
      const weakTopic = quizWeakTopics[quizWeakTopics.length - 1];
      setOrchestratorSuggestion({
        text: `You scored low on "${weakTopic}" in the quiz. Want me to explain those concepts?`,
        action: { type: 'ask_mentor', query: `Explain the key concepts of ${weakTopic} for Indian elections` },
        icon: '📚',
      });
      return;
    }

    // If user just finished simulation, suggest quiz
    if (currentTool === 'quiz') {
      const simEvents = events.filter((e) => e.type === 'simulation');
      if (simEvents.length >= 3) {
        setOrchestratorSuggestion({
          text: `You've explored the simulation — ready to test what you learned?`,
          action: { type: 'suggest_quiz', topic: 'evm-voting' },
          icon: '🧠',
        });
        return;
      }
    }

    setOrchestratorSuggestion(null);
  }, [lastVerifiedClaim, quizWeakTopics, events]);

  const dismissSuggestion = useCallback(() => {
    setOrchestratorSuggestion(null);
  }, []);

  // Idle detection
  const startIdleTimer = useCallback((context, delayMs = 12000) => {
    clearTimeout(idleTimerRef.current);
    setIdleNudge(null);
    idleTimerRef.current = setTimeout(() => {
      setIdleNudge(context);
    }, delayMs);
  }, []);

  const resetIdleTimer = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    setIdleNudge(null);
  }, []);

  const dismissIdleNudge = useCallback(() => {
    setIdleNudge(null);
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        events,
        lastVerifiedClaim,
        lastVerdict,
        quizWeakTopics,
        visitedTools,
        sessionStartTime,
        orchestratorSuggestion,
        idleNudge,
        logEvent,
        recordToolVisit,
        recordVerification,
        recordQuizResult,
        recordSimulationStep,
        generateSuggestion,
        dismissSuggestion,
        startIdleTimer,
        resetIdleTimer,
        dismissIdleNudge,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error('useGlobalContext must be used within GlobalContextProvider');
  return ctx;
}
