import { headers } from "next/headers";

type Barbershop = { id: string; tenantId: string; slug: string; name: string };

async function getBarbershop(slug: string): Promise<Barbershop> {
  const h = headers();
  const tenantId = h.get("x-tenant-id");
  if (!tenantId) throw new Error("Missing X-Tenant-Id");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/barbershop/public/${slug}`,
    { headers: { "X-Tenant-Id": tenantId }, next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // <- aguarda o Promise
  const data = await getBarbershop(slug);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-semibold">{data.name}</h1>
      <p className="text-sm text-neutral-500">@{data.slug}</p>
    </main>
  );
}
