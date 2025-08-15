// frontend/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";
import crypto from "node:crypto";

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
    // cria barbearia (tenant) ativa
    const shop = await prisma.barbershop.create({
      data: { tenantId, slug, name, isActive: true },
    });

    // invalida cache público desta barbearia
    await redis.del(`bs:${tenantId}:${slug}`);

    return NextResponse.json(
      { ok: true, tenantId: shop.tenantId, slug: shop.slug, id: shop.id },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Tenant-Id": tenantId,
        },
      }
    );
  } catch (err: any) {
    // conflito de chave única, etc.
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
