// seed simples para frontend
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Iniciando seed...')
    
    // primeiro, vamos verificar quais tabelas existem
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('barbershops', 'tenants')
    `
    console.log('📊 Tabelas encontradas:', tables)
    
    // tentar com barbershops incluindo todos os campos obrigatórios
    const now = new Date()
    const shopId = 'shop-cortes-premium-' + Date.now()
    
    const result = await prisma.$executeRawUnsafe(`
      INSERT INTO barbershops (
        id, name, slug, email, "isActive", "subscriptionPlan", 
        "subscriptionStatus", "monthlyFee", "totalRevenue", "monthlyRevenue",
        "createdAt", "updatedAt"
      ) 
      VALUES ($1, $2, $3, $4, $5, $6::"SubscriptionPlan", $7::"SubscriptionStatus", $8, $9, $10, $11, $12)
      ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        "isActive" = EXCLUDED."isActive",
        "updatedAt" = EXCLUDED."updatedAt"
    `, 
      shopId,                    // id
      'Cortes Premium',          // name
      'cortes-premium',          // slug
      'contato@cortespremium.com', // email
      true,                      // isActive
      'BASIC',                   // subscriptionPlan (cast para enum)
      'ACTIVE',                  // subscriptionStatus (cast para enum)
      29.90,                     // monthlyFee
      0.00,                      // totalRevenue
      0.00,                      // monthlyRevenue
      now,                       // createdAt
      now                        // updatedAt
    )
    
    console.log('✅ Seed executado com sucesso!')
    console.log('📊 Barbearia "Cortes Premium" criada/atualizada')
    console.log(`🆔 ID: ${shopId}`)
    
  } catch (error) {
    console.error('❌ Erro no seed:', error.message)
    console.error('🔍 Detalhes:', error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
