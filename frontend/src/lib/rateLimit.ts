import { incrWithExpire } from "./redis";

export async function allow(id: string, max: number, windowSeconds: number) {
  const key = `rl:${id}`;
  const count = await incrWithExpire(key, windowSeconds);
  const allowed = count <= max;
  const remaining = Math.max(0, max - count);
  const reset = windowSeconds; // janela fixa
  return { allowed, remaining, reset, count };
}
