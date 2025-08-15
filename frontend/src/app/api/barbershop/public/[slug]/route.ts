import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";

// util simples p/ obter tenant; ajuste depois para subdomínio
function getTenantId(req: Request) {
  // temporário: leia de header (ou defina default)
  const h = req.headers.get("x-tenant-id");
  if (h && /^[a-z0-9-]{3,64}$/i.test(h)) return h;
  // se já usa subdomínio: descomente abaixo
  // const host = new URL(req.url).host; const p = host.split("."); if (p.length>=3) return p[0];
  return "tenant-default";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.pathname.split("/").pop() ?? "";
  const tenantId = getTenantId(req);

  if (!slug) return NextResponse.json({ error: "invalid_slug" }, { status: 400 });

  // chave de cache por tenant+slug
  const key = `bs:${tenantId}:${slug}`;
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

  // ✅ agora usa a UNIQUE composta tenantId+slug
  const shop = await db.barbershop.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
    select: { id: true, name: true, slug: true, isActive: true },
  });

  if (!shop) return NextResponse.json({ error: "not_found" }, { status: 404 });

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
