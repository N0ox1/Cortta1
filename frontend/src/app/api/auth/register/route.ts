// frontend/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import crypto from "node:crypto";
import { prisma } from "../../../../lib/prisma"; // ← corrigido

export const runtime = "nodejs";
const redis = Redis.fromEnv();

function newTenantId() {
  return "t_" + crypto.randomUUID().replace(/-/g, "");
}

export async function POST(req: Request) {
  const { name, slug, email, password } = await req.json().catch(() => ({}));
  if (!name || !slug || !email || !password) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const tenantId = newTenantId();

  try {
    const now = new Date();

    const shop = await prisma.barbershop.create({
      data: {
        id: crypto.randomUUID(),    // UUID exigido pelo schema atual
        tenantId,
        slug,
        name,
        email,                      // ← requerido pelo seu schema
        isActive: true,
        createdAt: now,             // ← caso seja NOT NULL
        updatedAt: now,             // ← requerido pelo seu schema
      },
      select: { id: true, tenantId: true, slug: true, name: true },
    });

    await redis.del(`bs:${tenantId}:${slug}`);

    return NextResponse.json(
      { ok: true, id: shop.id, tenantId: shop.tenantId, slug: shop.slug, name: shop.name },
      { status: 200, headers: { "Cache-Control": "no-store", "X-Tenant-Id": tenantId } }
    );
  } catch (err: any) {
    if (err?.code === "P2002") return NextResponse.json({ error: "conflict" }, { status: 409 });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
