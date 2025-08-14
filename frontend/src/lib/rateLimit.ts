import { redis } from '@/lib/redis'

export async function allow(key: string, limit=60, windowSec=60) {
  const bucket = Math.floor(Date.now()/1000/windowSec)
  const k = `rl:${key}:${bucket}`
  const c = await redis.incr(k)
  if (c === 1) await redis.expire(k, windowSec)
  return { ok: c <= limit, retry: c <= limit ? 0 : windowSec }
}
