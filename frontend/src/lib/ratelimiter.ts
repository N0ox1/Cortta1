import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

export const rl = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(60, "60 s"), // 60 req por 60s
  analytics: false
});
