/**
 * useSimulation — State machine for the voting simulation.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { streamSimulation } from '../utils/api';
import { SIMULATION_STEPS } from '../utils/constants';

export function useSimulation() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = not started
  const [narration, setNarration] = useState('');
  const [isNarrating, setIsNarrating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showVVPAT, setShowVVPAT] = useState(false);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
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
    }
  }, [currentStep, totalSteps]);

  /**
   * Go back one step.
   */
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setNarration('');
    }
  }, [currentStep]);

  /**
   * Cast a vote on the EVM (step 5).
   */
  const castVote = useCallback((candidate) => {
    setSelectedCandidate(candidate);
    setHasVoted(true);
    // Trigger VVPAT after a short delay
    setTimeout(() => setShowVVPAT(true), 800);
  }, []);

  /**
   * Reset everything.
   */
  const resetSimulation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCurrentStep(0);
    setNarration('');
    setIsNarrating(false);
    setCompletedSteps(new Set());
    setHasVoted(false);
    setSelectedCandidate(null);
    setShowVVPAT(false);
  }, []);

  return {
    currentStep,
    narration,
    isNarrating,
    completedSteps,
    hasVoted,
    selectedCandidate,
    showVVPAT,
    totalSteps,
    startSimulation,
    fetchNarration,
    nextStep,
    prevStep,
    castVote,
    resetSimulation,
    setShowVVPAT,
  };
}
