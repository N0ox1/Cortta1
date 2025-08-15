import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { rlPub, rlGlobal } from "@/lib/ratelimiter";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // slug
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  const slug = parts[parts.length - 1] || "";
  if (!/^[a-z0-9-]{3,64}$/.test(slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }

  // IP (Vercel envia X-Forwarded-For)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0";
  const rateKey = `${ip}:slug:${slug}`;

  // primeiro global, depois específico
  const g = await rlGlobal.limit(ip);
  if (!g.success) {
    return NextResponse.json({ error: "rate_limited_global" }, { status: 429, headers: { "Retry-After": String(Math.max(0, Math.ceil((g.reset - Date.now())/1000))) }});
  }

  const r = await rlPub.limit(rateKey);
  if (!r.success) {
    return NextResponse.json({ error: "rate_limited" }, {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(0, Math.ceil((r.reset - Date.now())/1000))),
        "X-RateLimit-Limit": "20/10s",
        "X-RateLimit-Remaining": "0"
      }
    });
  }

  // CACHE
  const key = `barbershop:${slug}`;
  const cached = await redis.get<string>(key);
  if (cached) {
    return new NextResponse(cached, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache-Source": "redis",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "X-RateLimit-Limit": "20/10s",
        "X-RateLimit-Remaining": String(r.remaining)
      }
    });
  }

  // DB
  const shop = await db.barbershop.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, isActive: true }
  });
  if (!shop) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = JSON.stringify({
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    status: shop.isActive ? "active" : "inactive"
  });

  await redis.set(key, body, { ex: 60 });

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "X-Cache-Source": "db",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "X-RateLimit-Limit": "20/10s",
      "X-RateLimit-Remaining": String(r.remaining)
    }
  });
}
