import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { allow } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;

  // ----- RATE LIMIT -----
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "0";
  const { allowed } = await allow(`${ip}:${slug}`, 60, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429 }
    );
  }

  // ----- CACHE -----
  const cacheKey = `barbershop:${slug}`;
  const cached = await redis.get<string>(cacheKey);
  if (cached) {
    return new NextResponse(cached, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache-Source": "redis",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }

  // ----- DATABASE -----
  const shop = await db.barbershop.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, isActive: true },
  });

  if (!shop) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = JSON.stringify({
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    status: shop.isActive ? "active" : "inactive",
  });

  await redis.set(cacheKey, body, { ex: 60 });

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "X-Cache-Source": "db",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
