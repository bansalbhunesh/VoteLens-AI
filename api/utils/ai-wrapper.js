/**
 * VoteLens AI — AI Wrapper Utilities
 * Provides robustness via timeouts and exponential backoff retries.
 */

const DEFAULT_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

/**
 * Execute an async function with retries, exponential backoff, and timeouts.
 * @param {Function} operation - The async function to execute. It receives an AbortSignal.
 * @param {Object} options - Options for the wrapper.
 * @param {number} [options.timeoutMs] - Maximum time in ms before aborting.
 * @param {number} [options.retries] - Number of times to retry on failure.
 * @returns {Promise<any>}
 */
export async function withRetries(operation, options = {}) {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const maxRetries = options.retries !== undefined ? options.retries : MAX_RETRIES;
  
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error('TIMEOUT')), timeoutMs);
    
    try {
      const result = await operation(controller.signal);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      const isTimeout = error.message === 'TIMEOUT' || error.name === 'AbortError';
      const isRateLimit = error.status === 429;
      const isServerError = error.status >= 500;
      
      // We only retry on timeouts, rate limits, or server errors.
      if (!isTimeout && !isRateLimit && !isServerError) {
        throw error; // Throw immediately for other errors (like 400 Bad Request)
      }
      
      if (attempt >= maxRetries) {
        throw new Error(`AI Request failed after ${attempt + 1} attempts. Last error: ${error.message}`);
      }
      
      // Exponential backoff
      const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
      console.warn(`[AI Wrapper] Attempt ${attempt + 1} failed (${error.message}). Retrying in ${backoffMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      attempt++;
    }
  }
}
