import { prisma } from '@/lib/db'

export async function allowDb(key: string, rate = 60, windowMs = 60_000) {
  const now = new Date()
  const resetAt = new Date(Math.floor(now.getTime() / windowMs) * windowMs + windowMs)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key text PRIMARY KEY,
      tokens int NOT NULL,
      reset_at timestamptz NOT NULL
    )`)
  const row = await prisma.$queryRawUnsafe<any[]>(`SELECT key, tokens, reset_at FROM rate_limits WHERE key=$1`, key)
  let tokens = rate
  let ra = resetAt
  if (row[0]) {
    const curr = row[0]
    if (new Date(curr.reset_at) <= now) { tokens = rate; ra = resetAt }
    else { tokens = curr.tokens }
  }
  if (tokens <= 0) return { ok: false, retry: Math.ceil((new Date(ra).getTime() - now.getTime())/1000) }
  tokens -= 1
  await prisma.$executeRawUnsafe(
    `INSERT INTO rate_limits(key,tokens,reset_at) VALUES($1,$2,$3)
     ON CONFLICT (key) DO UPDATE SET tokens=$2, reset_at=$3`, key, tokens, ra)
  return { ok: true, retry: 0 }
}
