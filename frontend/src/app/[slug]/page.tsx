// frontend/src/app/[slug]/page.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  return { title: `${params?.slug ?? "Barbearia"} | Cortta1` };
}

async function fetchBarbershop(slug: string) {
  const h = await headers();
  const tenantId = h.get("x-tenant-id") ?? "tenant-default";

  // Base absoluta: env ou cabeçalhos do request
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const base = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`;

  const url = `${base}/api/barbershop/public/${slug}`;

  const r = await fetch(url, {
    headers: { "X-Tenant-Id": tenantId },
    next: { revalidate: 60 },
  });
  if (!r.ok) return null;
  return r.json();
}

export default async function Page({ params }: any) {
  const slug = params?.slug as string;
  const shop = await fetchBarbershop(slug);
  if (!shop) return <div className="p-6">Barbearia não encontrada.</div>;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-3xl font-semibold">{shop.name}</h1>
      <div className="text-sm text-gray-500">slug: {slug}</div>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <h2 className="text-xl">Serviços</h2>
          <p className="text-sm">Em breve.</p>
        </div>
        <div className="rounded-2xl border p-4">
          <h2 className="text-xl">Agendamentos</h2>
          <p className="text-sm">Em breve.</p>
        </div>
      </section>
    </main>
  );
}
