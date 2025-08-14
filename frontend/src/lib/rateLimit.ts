type Bucket = { tokens: number; ts: number }
const g = globalThis as any
const BUCKET_KEY = '__rateBucketsV1'
const buckets: Map<string, Bucket> = g[BUCKET_KEY] ?? (g[BUCKET_KEY] = new Map())

export function allow(key: string, rate = 60, intervalMs = 60_000) {
  const now = Date.now()
  const b = buckets.get(key) ?? { tokens: rate, ts: now }
  const elapsed = now - b.ts
  if (elapsed > 0) {
    const refill = Math.floor((elapsed / intervalMs) * rate)
    if (refill > 0) {
      b.tokens = Math.min(rate, b.tokens + refill)
      b.ts = now
    }
  }
  if (b.tokens <= 0) {
    buckets.set(key, b)
    const retry = Math.max(1, Math.ceil((intervalMs - (now - b.ts)) / 1000))
    return { ok: false, retry }
  }
  b.tokens -= 1
  buckets.set(key, b)
  return { ok: true, retry: 0 }
}
