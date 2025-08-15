// src/lib/tenant.ts
import type { NextRequest } from "next/server";

export function resolveTenant(req: NextRequest): string {
  const h = req.headers;
  const host = (h.get("host") ?? "").toLowerCase();
  const useSubdomain =
    host &&
    !host.endsWith(".vercel.app") &&        // ignora *.vercel.app (preview/prod)
    !host.endsWith(".vercel.pub");          // segurança extra

  let fromSub: string | null = null;
  if (useSubdomain) {
    const hostname = host.split(":")[0];
    const parts = hostname.split(".");
    // pega o label mais à esquerda como tenant (ex.: a.dominio.com -> "a")
    if (parts.length >= 3) fromSub = parts[0];
    if (parts.length === 2) fromSub = parts[0]; // ex.: tenant.meudominio.com
  }

  const fromHeader = h.get("x-tenant-id")?.trim();
  return (fromSub && fromSub !== "www" ? fromSub : (fromHeader || "tenant-default"));
}
