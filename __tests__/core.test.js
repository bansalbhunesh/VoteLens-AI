import { describe, it, expect } from '@jest/globals';
import { MENTOR_SYSTEM_PROMPT, SIMULATION_NARRATOR_PROMPT, INTENT_PROMPT } from '../api/prompts.js';
import { SIMULATION_STEPS, QUICK_PROMPTS, EVM_CANDIDATES } from '../client/src/utils/constants.js';

describe('Backend Prompts Configuration', () => {
  it('should load all main system prompts correctly', () => {
    expect(MENTOR_SYSTEM_PROMPT).toBeDefined();
    expect(SIMULATION_NARRATOR_PROMPT).toBeDefined();
    expect(INTENT_PROMPT).toBeDefined();

    expect(MENTOR_SYSTEM_PROMPT).toContain('VoteLens AI');
    expect(SIMULATION_NARRATOR_PROMPT).toContain('Simulation Narrator');
    expect(INTENT_PROMPT).toContain('Intent Router');
  });
});

describe('Civic Constants Configuration', () => {
  it('should provide all valid simulation steps with expected metadata', () => {
    expect(SIMULATION_STEPS).toBeDefined();
    expect(SIMULATION_STEPS.length).toBe(7);

    const firstStep = SIMULATION_STEPS[0];
    expect(firstStep.id).toBe(1);
    expect(firstStep.name).toBe('Preparation');
    expect(firstStep.icon).toBe('📋');
  });

  it('should provide quick prompt templates', () => {
    expect(QUICK_PROMPTS).toBeDefined();
    expect(QUICK_PROMPTS.length).toBeGreaterThan(0);
    expect(QUICK_PROMPTS[0].text).toContain('turned 18');
  });

  it('should configure initial EVM candidate lists including NOTA', () => {
    expect(EVM_CANDIDATES).toBeDefined();
    expect(EVM_CANDIDATES.some((c) => c.name === 'NOTA')).toBe(true);
  });
});
