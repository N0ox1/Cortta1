// frontend/src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // TODO: validar no DB. Placeholder de sucesso:
  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  res.cookies.set("sid", "dev", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
