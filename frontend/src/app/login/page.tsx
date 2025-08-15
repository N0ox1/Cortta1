// frontend/src/app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (r.ok) router.push("/dashboard");
    else alert("Login inválido");
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-semibold">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full rounded border p-3"
          placeholder="email@exemplo.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded border p-3"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="w-full rounded-2xl bg-black px-4 py-3 text-white disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Não tem conta? <a className="underline" href="/register">Criar conta</a>
      </p>
    </main>
  );
}
