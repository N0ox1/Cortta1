import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { rl } from "@/lib/ratelimiter";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // extrai o slug do path /api/barbershop/public/:slug
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  const slug = parts[parts.length - 1] || "";
  if (!/^[a-z0-9-]{3,64}$/.test(slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }

  // rate limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "0";
  const { success, remaining, reset } = await rl.limit(`${ip}:${slug}`);
  if (!success) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(0, Math.ceil((reset - Date.now()) / 1000)))
        }
      }
    );
  }

  // cache
  const key = `barbershop:${slug}`;
  const cached = await redis.get<string>(key);
  if (cached) {
    return new NextResponse(cached, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache-Source": "redis",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }

  // db
  const shop = await db.barbershop.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, isActive: true },
  });
  if (!shop) return NextResponse.json({ error: "not_found" }, { status: 400 });

  const body = JSON.stringify({
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    status: shop.isActive ? "active" : "inactive",
  });

  await redis.set(key, body, { ex: 60 });

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "X-Cache-Source": "db",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
