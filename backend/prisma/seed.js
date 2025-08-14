// seed básico tolerante ao schema
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // detectar tabela
  const [{ exists: hasBarbershops }] = await prisma.$queryRaw`
    SELECT to_regclass('public.barbershops') IS NOT NULL AS exists
  `
  const [{ exists: hasTenants }] = await prisma.$queryRaw`
    SELECT to_regclass('public.tenants') IS NOT NULL AS exists
  `
  const table = hasBarbershops ? 'barbershops' : hasTenants ? 'tenants' : null
  if (!table) throw new Error('Nenhuma tabela barbershops/tenants encontrada')

  // colunas disponíveis
  const cols = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name=${table}
  `
  const set = new Set(cols.map(c => c.column_name))

  // payload mínimo + opcionais
  const fields = ['name', 'slug']
  const payload = { name: 'Cortes Premium', slug: 'cortes-premium' }
  if (set.has('is_active')) { fields.push('is_active'); payload.is_active = true }
  if (set.has('isActive'))  { fields.push('isActive');  payload.isActive = true }
  if (set.has('status'))    { fields.push('status');    payload.status = 'ACTIVE' }
  if (set.has('tenant_id')) { fields.push('tenant_id'); payload.tenant_id = 'tenant-1' }
  if (set.has('tenantId'))  { fields.push('tenantId');  payload.tenantId = 'tenant-1' }

  const colsList = fields.map(f => `"${f}"`).join(', ')
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ')
  const values = fields.map(f => payload[f])

  await prisma.$executeRawUnsafe(
    `INSERT INTO ${table} (${colsList}) VALUES (${placeholders})
     ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name"`,
    ...values
  )

  console.log(`Seed ok em ${table} para slug cortes-premium`)
}

main().catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
