import { describe, it, expect } from '@jest/globals';
import {
  MENTOR_SYSTEM_PROMPT,
  SIMULATION_NARRATOR_PROMPT,
  VERIFICATION_PROMPT,
  INTENT_PROMPT
} from '../api/prompts.js';

describe('Prompts & AI Intent Logic', () => {
  it('validates the Mentor System Prompt', () => {
    expect(MENTOR_SYSTEM_PROMPT).toContain('VoteLens AI');
    expect(MENTOR_SYSTEM_PROMPT).toContain('Indian citizens');
    expect(MENTOR_SYSTEM_PROMPT).toContain('STRICT GUARDRAILS');
  });

  it('validates the Simulation Narrator Prompt', () => {
    expect(SIMULATION_NARRATOR_PROMPT).toContain('Simulation Narrator');
    expect(SIMULATION_NARRATOR_PROMPT).toContain('PREPARATION');
    expect(SIMULATION_NARRATOR_PROMPT).toContain('EVM');
  });

  it('validates the Verification Prompt for fact-checking', () => {
    expect(VERIFICATION_PROMPT).toContain('Misinformation Verification Engine');
    expect(VERIFICATION_PROMPT).toContain('[VERDICT]');
  });

  it('validates Intent Prompt routing correctness', () => {
    expect(INTENT_PROMPT).toContain('Intent Router');
    expect(INTENT_PROMPT).toContain('verify');
    expect(INTENT_PROMPT).toContain('simulate');
    expect(INTENT_PROMPT).toContain('mentor');
    expect(INTENT_PROMPT).toContain('quiz');
  });
});
