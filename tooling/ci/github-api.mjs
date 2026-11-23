/**
 * Retry transient GitHub REST failures without hiding permanent permission errors.
 * The caller owns request concurrency; this helper owns one request's backoff.
 */
export async function requestWithBackoff(url, {
  method = 'GET',
  headers = {},
  fetchImpl = fetch,
  wait = (milliseconds) => new Promise((resolve) => { setTimeout(resolve, milliseconds); }),
  maxAttempts = 4
} = {}) {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) throw new Error('maxAttempts must be positive');

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let response;
    try {
      response = await fetchImpl(url, { method, headers });
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;
      await wait(1000 * (2 ** attempt));
      continue;
    }

    if (response.ok || attempt === maxAttempts - 1) return response;
    const body = response.status === 403 ? await response.clone().text() : '';
    const rateLimited = response.status === 429 ||
      (response.status === 403 && /secondary rate limit|rate limit exceeded|API rate limit exceeded/i.test(body));
    const transient = rateLimited || response.status >= 500;
    if (!transient) return response;

    const after = Number(response.headers.get('retry-after'));
    const retryAfterMs = Number.isFinite(after) && after > 0 ? after * 1000 : 0;
    const backoffMs = (rateLimited ? 15_000 : 1000) * (2 ** attempt);
    await wait(Math.min(120_000, Math.max(backoffMs, retryAfterMs)));
  }
  throw new Error('unreachable retry state');
}

/** Maps with bounded concurrency, retaining input order and rejecting on errors. */
export async function mapLimited(items, limit, callback) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error('limit must be positive');
  const result = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      result[index] = await callback(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return result;
}
