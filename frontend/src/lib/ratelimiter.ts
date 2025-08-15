import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

// 20 req / 10s, com burst 10
export const rlPub = new Ratelimit({
  redis,
  limiter: Ratelimit.tokenBucket(20, "10 s", { burst: 10 }),
  prefix: "rl:v1:pub"
});

// opcional: global fallback 200/min
export const rlGlobal = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, "60 s"),
  prefix: "rl:v1:glob"
});
