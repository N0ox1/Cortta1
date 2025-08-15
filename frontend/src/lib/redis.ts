import { Redis } from "@upstash/redis";

// Requer nas envs da Vercel:
// UPSTASH_REDIS_REST_URL
// UPSTASH_REDIS_REST_TOKEN
export const redis = Redis.fromEnv();

// Helpers opcionais
export async function get<T>(key: string) {
  return (await redis.get<T>(key)) ?? null;
}
export async function set(key: string, value: unknown, ttlSeconds?: number) {
  return ttlSeconds
    ? redis.set(key, value, { ex: ttlSeconds })
    : redis.set(key, value);
}
export async function incrWithExpire(key: string, windowSeconds: number) {
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, windowSeconds);
  return n;
}
