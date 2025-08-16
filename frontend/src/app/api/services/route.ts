import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const preferredRegion = ["gru1"];

const Query = z.object({ slug: z.string().min(1) });

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ error: "X-Tenant-Id requerido" }, { status: 400 });
  const parsed = Query.safeParse({ slug: new URL(req.url).searchParams.get("slug") ?? "" });
  if (!parsed.success) return NextResponse.json({ error: "slug inválido" }, { status: 400 });

  const shop = await prisma.barbershop.findFirst({
    where: { tenantId, slug: parsed.data.slug, isActive: true },
    select: { id: true },
  });
  if (!shop) return NextResponse.json({ services: [] }, { headers: { "cache-control": "s-maxage=30, stale-while-revalidate=60" } });

  const services = await prisma.service.findMany({
    where: { tenantId, barbershopId: shop.id, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, durationMin: true, priceCents: true },
    take: 100,
  });

  return NextResponse.json({ services }, { headers: { "cache-control": "s-maxage=60, stale-while-revalidate=120" } });
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return NextResponse.json({ error: "X-Tenant-Id requerido" }, { status: 400 });

  const Body = z.object({
    slug: z.string().min(1),
    name: z.string().min(2),
    durationMin: z.number().int().positive(),
    priceCents: z.number().int().nonnegative(),
    isActive: z.boolean().optional().default(true),
  });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "payload inválido" }, { status:400 });

  const shop = await prisma.barbershop.findFirst({
    where: { tenantId, slug: parsed.data.slug, isActive: true },
    select: { id: true },
  });
  if (!shop) return NextResponse.json({ error: "barbearia não encontrada" }, { status: 404 });

  const svc = await prisma.service.create({
    data: {
      tenantId,
      barbershopId: shop.id,
      name: parsed.data.name,
      durationMin: parsed.data.durationMin,
      priceCents: parsed.data.priceCents,
      isActive: parsed.data.isActive,
    },
    select: { id: true },
    });

  return NextResponse.json({ id: svc.id }, { status: 201 });
}
