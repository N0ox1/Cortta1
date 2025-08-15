import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const config = {
  matcher: ["/api/barbershop/public/:path*"], // só onde precisa
};

const redis = Redis.fromEnv(); // UPSTASH_* na Vercel
const rlGlobal = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, "60 s"),
  prefix: "rl:v1:glob",
});
const rlPub = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  prefix: "rl:v1:pub",
});

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const slug = url.pathname.split("/").pop() ?? "";
  const ip =
    (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "0";

  // global
  const g = await rlGlobal.limit(ip);
  if (!g.success) {
    return NextResponse.json(
      { error: "rate_limited_global" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(0, Math.ceil((g.reset - Date.now()) / 1000))),
          "X-RateLimit-Limit": "200/60s",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // específico por slug
  const r = await rlPub.limit(`${ip}:slug:${slug}`);
  if (!r.success) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(0, Math.ceil((r.reset - Date.now()) / 1000))),
          "X-RateLimit-Limit": "20/10s",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", "20/10s");
  res.headers.set("X-RateLimit-Remaining", String(r.remaining));
  return res;
}
