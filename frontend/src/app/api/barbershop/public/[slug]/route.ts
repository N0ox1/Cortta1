// src/app/api/barbershop/public/[slug]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { resolveTenant } from "@/lib/tenant";
import { Redis } from "@upstash/redis";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
const redis = Redis.fromEnv();

export async function GET(req: NextRequest, context: any) {
  const { slug } = (context?.params ?? {}) as { slug: string };
  const tenantId = resolveTenant(req);
  const key = `bs:${tenantId}:${slug}`;

  const cached = await redis.get(key);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "X-Cache-Source": "redis",
        "X-Tenant-Id": tenantId,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }

  const shop = await prisma.barbershop.findFirst({
    where: { tenantId, slug, isActive: true },
  });

  if (!shop) {
    return NextResponse.json(
      { error: "not_found" },
      {
        status: 404,
        headers: { "X-Tenant-Id": tenantId, "Cache-Control": "no-store" },
      }
    );
  }

  await redis.set(key, shop, { ex: 60 });

  return NextResponse.json(shop, {
    headers: {
      "X-Cache-Source": "db",
      "X-Tenant-Id": tenantId,
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
