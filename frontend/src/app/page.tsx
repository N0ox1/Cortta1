// frontend/src/app/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Cortta1 — SaaS para Barbearias",
  description: "Agendamentos, serviços e operação multi-tenant.",
};

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="flex items-center justify-between">
        <div className="text-xl font-semibold">Cortta1</div>
        <nav className="space-x-4 text-sm">
          <Link href="/login" className="underline">Entrar</Link>
          <Link href="/register" className="underline">Criar conta</Link>
        </nav>
      </header>

      <section className="mt-16 grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Operação de barbearia, simples e escalável
          </h1>
          <p className="text-gray-600">
            Multi-tenant, rápido e seguro. Agendamentos, serviços e relatórios em minutos.
          </p>
          <div className="flex gap-3">
            <Link
              href="/register"
              className="rounded-2xl bg-black px-5 py-3 text-white"
            >
              Começar grátis
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border px-5 py-3"
            >
              Entrar
            </Link>
          </div>
          <ul className="mt-6 grid gap-2 text-sm text-gray-700">
            <li>• Multi-tenant por subdomínio (pronto)</li>
            <li>• Cache + CDN, p95 &lt; 250ms</li>
            <li>• Rate limiting por IP + tenant + slug</li>
          </ul>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="mb-3 text-lg font-semibold">Status</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>API pública: <code>/api/barbershop/public/[slug]</code></li>
            <li>Página pública: <code>/:slug</code></li>
            <li>Região: Vercel gru1</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
