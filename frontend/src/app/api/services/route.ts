import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const preferredRegion = ["gru1"];

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  const slug = new URL(req.url).searchParams.get("slug") || "";
  if (!tenantId) return NextResponse.json({ error: "X-Tenant-Id requerido" }, { status: 400 });
  if (!slug) return NextResponse.json({ error: "slug inválido" }, { status: 400 });

  const shop = await prisma.barbershop.findFirst({ where: { tenantId, slug, isActive: true }, select: { id: true } });
  if (!shop) return NextResponse.json({ services: [] }, { headers: { "cache-control": "s-maxage=30, stale-while-revalidate=60" } });

  const services = await prisma.service.findMany({
    where: { barbershopId: shop.id, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, duration: true, priceCents: true },
    take: 100,
  });

  return NextResponse.json({ services }, { headers: { "cache-control": "s-maxage=60, stale-while-revalidate=120" } });
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ error: "X-Tenant-Id requerido" }, { status: 400 });

  const body = await req.json();
  const { slug, name, duration, priceCents, isActive = true } = body || {};
  if (!slug || !name || !Number.isInteger(duration) || !Number.isInteger(priceCents))
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });

  const shop = await prisma.barbershop.findFirst({ where: { tenantId, slug, isActive: true }, select: { id: true } });
  if (!shop) return NextResponse.json({ error: "barbearia não encontrada" }, { status: 404 });

  const svc = await prisma.service.create({
    data: {
      barbershopId: shop.id,
      name,
      duration,
      priceCents,
      isActive,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: svc.id }, { status: 201 });
}
