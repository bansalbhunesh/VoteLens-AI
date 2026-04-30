/**
 * VoteLens AI — API Client
 * Fetch wrapper for all backend API calls.
 */

const API_BASE = '/api';

/**
 * Makes a streaming chat request. Returns an async generator of text chunks.
 * @param {Array<{role: string, content: string}>} messages
 * @param {'normal'|'nervous'} mode
 * @param {AbortSignal} [signal]
 * @returns {AsyncGenerator<string>}
 */
export async function* streamChat(messages, mode = 'normal', signal, lang = 'en') {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode, lang }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Chat request failed');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          if (parsed.text) yield parsed.text;
          if (parsed.error) throw new Error(parsed.error);
        } catch (e) {
          if (e.message !== 'Unexpected end of JSON input') {
            // Ignore parse errors from partial chunks
          }
        }
      }
    }
  }
}

/**
 * Upload and analyze an image.
 * @param {File} file
 * @param {string} [prompt]
 * @returns {Promise<{analysis: string}>}
 */
export async function analyzeImage(file, prompt = '') {
  const formData = new FormData();
  formData.append('image', file);
  if (prompt) formData.append('prompt', prompt);

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Image analysis failed');
  }

  return response.json();
}

/**
 * Get grounded real-time election information via Google Search.
 * @param {string} query
 * @returns {Promise<{text: string, sources: Array}>}
 */
export async function getElectionInfo(query) {
  const response = await fetch(`${API_BASE}/election-info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Failed to fetch election info');
  }

  return response.json();
}

/**
 * Verify a claim about elections.
 * @param {string} claim
 * @returns {Promise<{text: string, sources: Array, searchQueries: Array}>}
 */
export async function verifyClaim(claim) {
  const response = await fetch(`${API_BASE}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Verify failed' }));
    throw new Error(err.error || 'Verification failed');
  }

  return response.json();
}

/**
 * Generate quiz questions for a topic using Gemini JSON mode.
 * @param {string} topic
 * @returns {Promise<Array>}
 */
export async function generateQuiz(topic) {
  const response = await fetch(`${API_BASE}/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Quiz failed' }));
    throw new Error(err.error || 'Failed to generate quiz');
  }

  const data = await response.json();
  return data.questions;
}

/**
 * Stream simulation narration for a step.
 * @param {number} step
 * @param {string} stepName
 * @param {string[]} facts
 * @param {AbortSignal} [signal]
 * @returns {AsyncGenerator<string>}
 */
export async function* streamSimulation(step, stepName, facts = [], signal) {
  const response = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, stepName, facts }),
    signal,
  });

  if (!response.ok) {
    throw new Error('Simulation narration failed');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          if (parsed.text) yield parsed.text;
        } catch {
          // Ignore parse errors
        }
      }
    }
  }
}
