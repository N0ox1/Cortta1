// frontend/src/app/[slug]/page.tsx
import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${params.slug} | Barbearia` };
}

async function fetchBarbershop(reqHeaders: Headers, slug: string) {
  const tenantId = reqHeaders.get("x-tenant-id") ?? "tenant-default";
  const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/barbershop/public/${slug}`;

  const r = await fetch(url, {
    headers: { "X-Tenant-Id": tenantId },
    // cache HTTP + revalidate 60s para CDN
    next: { revalidate: 60 },
  });

  if (!r.ok) return null;
  return r.json();
}

export default async function Page({ params }: Props) {
  // Em produção, o middleware já cuida do RL; aqui só propagamos tenant via header.
  // Em domínio próprio no futuro, resolveTenant() funcionará por subdomínio automaticamente.
  const shop = await fetchBarbershop(headers(), params.slug);
  if (!shop) return <div className="p-6">Barbearia não encontrada.</div>;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-3xl font-semibold">{shop.name}</h1>
      <div className="text-sm text-gray-500">slug: {params.slug}</div>
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
