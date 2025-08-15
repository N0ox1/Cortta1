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
    const shop = await prisma.barbershop.create({
      data: { tenantId, slug, name, isActive: true },
    });

    await (await Redis.fromEnv()).del(`bs:${tenantId}:${slug}`);

    return NextResponse.json(
      { ok: true, tenantId: shop.tenantId, slug: shop.slug, id: shop.id },
      { status: 200, headers: { "Cache-Control": "no-store", "X-Tenant-Id": tenantId } }
    );
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
