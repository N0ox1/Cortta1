// src/middleware.ts
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

export const config = {
  matcher: ["/api/:path*"],
};

// Limite global: 600 req/min por IP
const rlGlobal = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(600, "60 s"),
  analytics: true,
  prefix: "rl:v1:global",
});

// Limite público: 60 req/min por IP + slug
const rlPub = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60 s"),
  analytics: true,
  prefix: "rl:v1:pub",
});

export default async function middleware(req: Request) {
  const ip =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    "unknown";

  const url = new URL(req.url);
  const slug = url.pathname.replace("/api/barbershop/public/", "");

  // Global
  const rGlobal = await rlGlobal.limit(ip);
  if (!rGlobal.success) {
    return new NextResponse("Too Many Requests (global)", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": "600/60s",
        "X-RateLimit-Remaining": rGlobal.remaining.toString(),
        "Retry-After": "60",
      },
    });
  }

  // Público
  if (url.pathname.startsWith("/api/barbershop/public/")) {
    const rPub = await rlPub.limit(`${ip}:${slug}`);
    if (!rPub.success) {
      return new NextResponse("Too Many Requests (public)", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "60/60s",
          "X-RateLimit-Remaining": rPub.remaining.toString(),
          "Retry-After": "60",
        },
      });
    }
  }

  return NextResponse.next();
}
