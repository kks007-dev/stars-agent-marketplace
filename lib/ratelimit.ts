/**
 * In-memory sliding-window rate limiter, keyed by user id.
 *
 * PRODUCTION NOTE: this lives in one server process's memory. On serverless
 * (Vercel) each instance has its own Map, so limits are per-instance and reset
 * on cold start. Swap this for Upstash Redis (@upstash/ratelimit) or a DB
 * counter before opening to real traffic. Keep the same `check()` signature.
 */
const hits = new Map<string, number[]>();

export function check(key: string, max: number, windowSec: number) {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return { ok: false as const, retryAfterSec: Math.ceil((recent[0] + windowMs - now) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  // opportunistic cleanup so the Map cannot grow without bound
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return { ok: true as const, remaining: max - recent.length };
}
