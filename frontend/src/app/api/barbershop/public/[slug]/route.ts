export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { allow } from '@/lib/rateLimit'
import { redis } from '@/lib/redis'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
           || req.headers.get('x-real-ip') || 'local'

  const rl = await allow(`${ip}:${slug}`, 60, 60)
  if (!rl.ok) return NextResponse.json({ error: 'Too Many Requests' },
    { status: 429, headers: { 'Retry-After': String(rl.retry) } })

  const cacheKey = `shop:${slug}`
  const cached = await redis.get<string>(cacheKey)
  if (cached) {
    const r = NextResponse.json(JSON.parse(cached))
    r.headers.set('Cache-Control','public, s-maxage=60, stale-while-revalidate=120')
    r.headers.set('X-Cache-Source','redis')
    return r
  }

  const s = await prisma.barbershop.findUnique({
    where: { slug }, select: { id:true, name:true, slug:true, isActive:true },
  })
  if (!s) return NextResponse.json({ error:'Not found' }, { status:404 })

  const status = s.isActive === true ? 'ACTIVE' : s.isActive === false ? 'INACTIVE' : 'PENDING'
  const body = { id: s.id, name: s.name, slug: s.slug, status }
  await redis.set(cacheKey, JSON.stringify(body), { ex: 60 })

  const r = NextResponse.json(body)
  r.headers.set('Cache-Control','public, s-maxage=60, stale-while-revalidate=120')
  r.headers.set('X-Cache-Source','db')
  return r
}
