/**
 * useSimulation — State machine for the voting simulation.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { streamSimulation } from '../utils/api';
import { SIMULATION_STEPS } from '../utils/constants';

const _VVPAT_DISPLAY_MS = 7000; // kept for reference — runtime uses a 1s interval counting to 7

export function useSimulation() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = not started
  const [narration, setNarration] = useState('');
  const [isNarrating, setIsNarrating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showVVPAT, setShowVVPAT] = useState(false);
  const [vvpatSecondsLeft, setVvpatSecondsLeft] = useState(0);
  const abortControllerRef = useRef(null);
  const vvpatTimerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      clearInterval(vvpatTimerRef.current);
    };
  }, []);

  const totalSteps = SIMULATION_STEPS.length;

  /**
   * Start or restart the simulation.
   */
  const startSimulation = useCallback(() => {
    setCurrentStep(1);
    setNarration('');
    setCompletedSteps(new Set());
    setHasVoted(false);
    setSelectedCandidate(null);
    setShowVVPAT(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /**
   * Fetch narration for the current step from Gemini.
   */
  const fetchNarration = useCallback(async (step) => {
    const stepData = SIMULATION_STEPS.find((s) => s.id === step);
    if (!stepData) return;

    setIsNarrating(true);
    setNarration('');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      let fullText = '';
      const stream = streamSimulation(step, stepData.name, stepData.facts, abortControllerRef.current.signal);

      for await (const chunk of stream) {
        fullText += chunk;
        setNarration(fullText);
      }
    } catch (error) {
      if (error.name === 'AbortError') return; // Ignore abort errors

      console.error('Narration error:', error);
      setNarration(stepData.description);
    } finally {
      setIsNarrating(false);
    }
  }, []);

  /**
   * Advance to the next step.
   */
  const nextStep = useCallback(() => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < totalSteps) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setNarration('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, totalSteps]);

  /**
   * Go back one step.
   */
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setNarration('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  /**
   * Cast a vote on the EVM (step 5).
   */
  const castVote = useCallback((candidate) => {
    setSelectedCandidate(candidate);
    setHasVoted(true);

    // Show VVPAT after brief EVM confirmation delay, then count down 7 seconds
    setTimeout(() => {
      setShowVVPAT(true);
      setVvpatSecondsLeft(7);

      let remaining = 7;
      vvpatTimerRef.current = setInterval(() => {
        remaining -= 1;
        setVvpatSecondsLeft(remaining);
        if (remaining <= 0) {
          clearInterval(vvpatTimerRef.current);
          setShowVVPAT(false);
        }
      }, 1000);
    }, 800);
  }, []);

  /**
   * Reset everything.
   */
  const resetSimulation = useCallback(() => {
    abortControllerRef.current?.abort();
    clearInterval(vvpatTimerRef.current);
    setCurrentStep(0);
    setNarration('');
    setIsNarrating(false);
    setCompletedSteps(new Set());
    setHasVoted(false);
    setSelectedCandidate(null);
    setShowVVPAT(false);
    setVvpatSecondsLeft(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /**
   * Jump directly to a specific step (used by Orchestrator cross-screen navigation).
   */
  const jumpToStep = useCallback((step) => {
    if (step >= 1 && step <= totalSteps) {
      abortControllerRef.current?.abort();
      setCurrentStep(step);
      setNarration('');
      // Mark earlier steps as completed
      const completed = new Set();
      for (let i = 1; i < step; i++) completed.add(i);
      setCompletedSteps(completed);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalSteps]);

  return {
    currentStep,
    narration,
    isNarrating,
    completedSteps,
    hasVoted,
    selectedCandidate,
    showVVPAT,
    vvpatSecondsLeft,
    totalSteps,
    startSimulation,
    fetchNarration,
    nextStep,
    prevStep,
    castVote,
    resetSimulation,
    jumpToStep,
  };
}
