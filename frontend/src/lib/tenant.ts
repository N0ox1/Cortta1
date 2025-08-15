// src/lib/tenant.ts
import type { NextRequest } from "next/server";

export function resolveTenant(req: NextRequest): string {
  const h = req.headers;
  const host = h.get("host") ?? "";
  const sub = host.split(":")[0].split(".")[0]; // ignora porta
  if (sub && sub !== "www" && !sub.endsWith("vercel")) return sub;

  const header = h.get("x-tenant-id");
  return header && header.trim() ? header.trim() : "tenant-default";
}
