// frontend/src/app/register/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, slug, email, password }),
    });
    setBusy(false);
    if (r.ok) router.push("/login");
    else alert("Erro ao registrar");
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-semibold">Criar conta</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full rounded border p-3" placeholder="Nome da barbearia" value={name} onChange={(e)=>setName(e.target.value)} required />
        <input className="w-full rounded border p-3" placeholder="slug-exemplo" value={slug} onChange={(e)=>setSlug(e.target.value)} required />
        <input className="w-full rounded border p-3" placeholder="email@exemplo.com" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input className="w-full rounded border p-3" placeholder="Senha" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <button className="w-full rounded-2xl bg-black px-4 py-3 text-white disabled:opacity-60" disabled={busy}>
          {busy ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </main>
  );
}
