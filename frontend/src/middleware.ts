// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { resolveTenant } from "@/lib/tenant";

export const config = {
  matcher: ["/api/:path*"],
};

const redis = Redis.fromEnv();

const rlGlobal = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(600, "1 m"),
  analytics: true,
  prefix: "rl:global",
});

const rlPublic = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "rl:public",
});

function ipFrom(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.ip ?? "0.0.0.0";
}

function slugFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/api\/barbershop\/public\/([^\/?#]+)/);
  return m?.[1] ?? null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Global 600/min por IP para toda API
  if (pathname.startsWith("/api/")) {
    const ip = ipFrom(req);
    const g = await rlGlobal.limit(`g:${ip}`);
    if (!g.success) {
      return NextResponse.json(
        { error: "rate_limited_global" },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "Cache-Control": "no-store",
          },
        }
      );
    }
  }

  // Público 60/min por IP+tenant+slug
  if (pathname.startsWith("/api/barbershop/public/")) {
    const ip = ipFrom(req);
    const tenantId = resolveTenant(req);
    const slug = slugFromPath(pathname) ?? "unknown";
    const key = `${ip}:t:${tenantId}:s:${slug}`;

    const r = await rlPublic.limit(key);
    if (!r.success) {
      return NextResponse.json(
        { error: "rate_limited_public" },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "Cache-Control": "no-store",
            "X-Tenant-Id": tenantId,
          },
        }
      );
    }
  }

  return NextResponse.next();
}
