// frontend/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"; // quando conectar de fato

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { name, slug, email, password } = await req.json().catch(() => ({}));
  if (!name || !slug || !email || !password) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // TODO: criar tenant + usuário no DB. Placeholder:
  return NextResponse.json({ ok: true, tenantId: "tenant-default", slug }, { status: 200 });
}
