import { describe, it, expect, jest } from '@jest/globals';
import { withRetries } from '../api/utils/ai-wrapper.js';

describe('AI Wrapper Utilities with Retries', () => {
  it('returns the operation value directly when successful on first try', async () => {
    const fn = jest.fn(async () => 'success');
    const result = await withRetries(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on server failure and succeeds on subsequent try', async () => {
    let callCount = 0;
    const fn = jest.fn(async () => {
      callCount++;
      if (callCount === 1) {
        const err = new Error('Server Unavailable');
        err.status = 503;
        throw err;
      }
      return 'recovered';
    });

    const result = await withRetries(fn, { retries: 1 });
    expect(result).toBe('recovered');
    expect(callCount).toBe(2);
  });
});
