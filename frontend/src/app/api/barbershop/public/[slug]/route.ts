export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { allowDb } from '@/lib/rateLimitDb'

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const rl = await allowDb(`${ip}:${slug}`, 60, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'Too Many Requests' }, { status: 429, headers: { 'Retry-After': String(rl.retry) } })

  const s = await prisma.barbershop.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, isActive: true },
  })
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const status = s.isActive === true ? 'ACTIVE' : s.isActive === false ? 'INACTIVE' : 'PENDING'
  return NextResponse.json({ id: s.id, name: s.name, slug: s.slug, status })
}
