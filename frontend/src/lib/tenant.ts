// src/lib/tenant.ts
import { NextRequest } from "next/server";

export function resolveTenant(req: NextRequest): string {
  // Temporário: leia de header (depois suportará subdomínio)
  const tenantId = req.headers.get("x-tenant-id");
  
  if (tenantId && /^[a-z0-9-]{3,64}$/i.test(tenantId)) {
    return tenantId;
  }
  
  // Se não houver header válido, retorna tenant padrão
  return "tenant-default";
}
