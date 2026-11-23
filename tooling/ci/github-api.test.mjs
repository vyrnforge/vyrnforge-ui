import { describe, expect, test } from 'vitest';
import { mapLimited, requestWithBackoff } from './github-api.mjs';

function response(status, message = '', headers = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (name) => headers[name] ?? null },
    clone: () => ({ text: async () => message })
  };
}

describe('GitHub API retry and concurrency', () => {
  test('retries secondary 403 rate limits with backoff', async () => {
    const attempts = [];
    const waits = [];
    const result = await requestWithBackoff('/repo', {
      fetchImpl: async () => { attempts.push(true); return attempts.length === 1 ? response(403, 'You have exceeded a secondary rate limit') : response(200); },
      wait: async (ms) => waits.push(ms)
    });
    expect(result.status).toBe(200);
    expect(attempts).toHaveLength(2);
    expect(waits).toEqual([15000]);
  });

  test('respects Retry-After and retries 429', async () => {
    let calls = 0;
    const waits = [];
    await requestWithBackoff('/repo', {
      fetchImpl: async () => ++calls === 1 ? response(429, '', { 'retry-after': '42' }) : response(204),
      wait: async (ms) => waits.push(ms)
    });
    expect(calls).toBe(2);
    expect(waits).toEqual([42000]);
  });

  test('does not retry authorization failures or missing resources', async () => {
    for (const status of [403, 404]) {
      let calls = 0;
      const value = await requestWithBackoff('/repo', {
        fetchImpl: async () => { calls++; return response(status, 'Resource not accessible by integration'); },
        wait: async () => { throw new Error('unexpected retry'); }
      });
      expect(value.status).toBe(status);
      expect(calls).toBe(1);
    }
  });

  test('retries 5xx but caps attempts', async () => {
    let calls = 0;
    const waits = [];
    const value = await requestWithBackoff('/repo', {
      fetchImpl: async () => { calls++; return response(503); },
      maxAttempts: 3,
      wait: async (ms) => waits.push(ms)
    });
    expect(value.status).toBe(503);
    expect(calls).toBe(3);
    expect(waits).toEqual([1000, 2000]);
  });

  test('bounds simultaneous work and retains result order', async () => {
    let active = 0;
    let peak = 0;
    const mapped = await mapLimited([1, 2, 3, 4, 5], 2, async (number) => {
      active++;
      peak = Math.max(active, peak);
      await Promise.resolve();
      active--;
      return number * 2;
    });
    expect(mapped).toEqual([2, 4, 6, 8, 10]);
    expect(peak).toBeLessThanOrEqual(2);
  });
});
