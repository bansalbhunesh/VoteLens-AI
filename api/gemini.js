/**
 * VoteLens AI — Gemini SDK Wrapper
 * Handles all interactions with the Google Gemini API.
 */

import { GoogleGenAI } from '@google/genai';
import {
  MENTOR_SYSTEM_PROMPT,
  NERVOUS_VOTER_PROMPT,
  VERIFICATION_PROMPT,
  SIMULATION_NARRATOR_PROMPT,
  IMAGE_ANALYSIS_PROMPT,
  QUIZ_PROMPT,
} from './prompts.js';
import { withRetries } from './utils/ai-wrapper.js';

/** @type {GoogleGenAI|null} */
let ai = null;

/**
 * Lazily initializes and returns the Gemini AI client.
 * @returns {GoogleGenAI}
 */
function getClient() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

const MODEL = 'gemini-2.5-flash';

/**
 * Selects the appropriate system prompt based on mode.
 * @param {'normal'|'nervous'} mode
 * @returns {string}
 */
function getSystemPrompt(mode) {
  return mode === 'nervous' ? NERVOUS_VOTER_PROMPT : MENTOR_SYSTEM_PROMPT;
}

/**
 * Chat with the AI Election Mentor. Returns a streaming response.
 * Guardrails are enforced by the system prompt — no blocking pre-check needed.
 * @param {Array<{role: string, content: string}>} messages - Conversation history
 * @param {'normal'|'nervous'} mode - Mentor personality mode
 * @param {'en'|'hi'} lang - Response language
 * @returns {AsyncGenerator<string>} Streamed text chunks
 */
export async function* chatWithMentor(messages, mode = 'normal', lang = 'en', signal) {
  const client = getClient();
  const basePrompt = getSystemPrompt(mode);
  const systemPrompt = lang === 'hi'
    ? `${basePrompt}\n\nIMPORTANT: Respond in Hindi (Devanagari script). Use simple, conversational Hindi.`
    : basePrompt;

  const contents = messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const response = await client.models.generateContentStream({
    model: MODEL,
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1024,
      abortSignal: signal,
    },
  });

  for await (const chunk of response) {
    if (signal?.aborted) return;
    if (chunk.text) yield chunk.text;
  }
}

/**
 * Analyze an uploaded image using Gemini's multimodal capabilities.
 * @param {Buffer} imageBuffer - The image data
 * @param {string} mimeType - MIME type of the image
 * @param {string} [userPrompt] - Optional user context about the image
 * @returns {Promise<string>} Analysis text
 */
export async function analyzeImage(imageBuffer, mimeType, userPrompt = '') {
  const client = getClient();

  const textContent = userPrompt
    ? `${userPrompt}\n\nAnalyze the uploaded image with this context in mind.`
    : 'Analyze this image related to the Indian election process.';

  const response = await withRetries((signal) => client.models.generateContent({
    model: MODEL,
    contents: [
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType,
        },
      },
      textContent
    ],
    config: {
      systemInstruction: IMAGE_ANALYSIS_PROMPT,
      temperature: 0.4,
      maxOutputTokens: 1500,
    },
    // The google/genai sdk might not take AbortSignal directly in config, but we can pass it if supported
    // Though for now withRetries will enforce timeout wrapper
  }), { timeoutMs: 30000, retries: 2 });

  return response.text;
}

/**
 * Verify a claim about elections using Google Search grounding.
 * @param {string} claim - The claim to verify
 * @returns {Promise<{text: string, sources: Array}>} Verdict with sources
 */
export async function verifyInformation(claim) {
  const client = getClient();

  const response = await withRetries(() => client.models.generateContent({
    model: MODEL,
    contents: `Verify this claim about the Indian election process:\n\n"${claim}"`,
    config: {
      systemInstruction: VERIFICATION_PROMPT,
      tools: [{ googleSearch: {} }],
      temperature: 0.2,
      maxOutputTokens: 1500,
    },
  }), { timeoutMs: 20000, retries: 2 });

  const sources = [];
  const candidate = response.candidates?.[0];
  if (candidate?.groundingMetadata?.groundingChunks) {
    for (const chunk of candidate.groundingMetadata.groundingChunks) {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || 'Source',
          url: chunk.web.uri || '',
        });
      }
    }
  }

  return {
    text: response.text,
    sources,
    searchQueries: candidate?.groundingMetadata?.webSearchQueries || [],
  };
}

/**
 * Get real-time election information using Google Search grounding.
 * @param {string} query - User's election-related query
 * @returns {Promise<{text: string, sources: Array}>}
 */
export async function getElectionInfo(query) {
  const client = getClient();

  const response = await withRetries(() => client.models.generateContent({
    model: MODEL,
    contents: query,
    config: {
      systemInstruction: MENTOR_SYSTEM_PROMPT,
      tools: [{ googleSearch: {} }],
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
  }), { timeoutMs: 20000, retries: 2 });

  const sources = [];
  const candidate = response.candidates?.[0];
  if (candidate?.groundingMetadata?.groundingChunks) {
    for (const chunk of candidate.groundingMetadata.groundingChunks) {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || 'Source',
          url: chunk.web.uri || '',
        });
      }
    }
  }

  return {
    text: response.text,
    sources,
  };
}

/**
 * Generate 5 MCQ questions about a topic using Gemini JSON structured output.
 * @param {string} topic - The quiz topic
 * @returns {Promise<Array>} Array of question objects
 */
export async function generateQuiz(topic) {
  const client = getClient();

  const response = await withRetries(() => client.models.generateContent({
    model: MODEL,
    contents: `Generate exactly 5 multiple-choice quiz questions about: "${topic}" for Indian voters.`,
    config: {
      systemInstruction: QUIZ_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0.65,
      maxOutputTokens: 2500,
    },
  }), { timeoutMs: 30000, retries: 2 });

  return JSON.parse(response.text);
}

/**
 * Generate simulation narration for a specific step.
 * @param {number} step - Step number (1-7)
 * @param {string} stepName - Human-readable step name
 * @param {string[]} facts - Array of facts to include in the narration
 * @returns {AsyncGenerator<string>} Streamed narration
 */
export async function* getSimulationNarration(step, stepName, facts = [], signal) {
  const client = getClient();
  const prompt = SIMULATION_NARRATOR_PROMPT.replace('{step}', String(step));

  const factContext = facts.length > 0
    ? `\n\nWeave these verified facts naturally into the narration:\n- ${facts.join('\n- ')}`
    : '';

  // Use withRetries for the initial API call; streaming loop handles abort manually.
  const response = await withRetries(() => client.models.generateContentStream({
    model: MODEL,
    contents: `Narrate step ${step}: ${stepName}. Make it vivid and immersive.${factContext}`,
    config: {
      systemInstruction: prompt,
      temperature: 0.8,
      maxOutputTokens: 500,
      abortSignal: signal,
    },
  }), { timeoutMs: 20000, retries: 2 });

  for await (const chunk of response) {
    if (signal?.aborted) return;
    if (chunk.text) yield chunk.text;
  }
}
