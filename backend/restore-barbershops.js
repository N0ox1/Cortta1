const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function restoreBarbershops() {
  try {
    console.log('🔄 Restaurando barbearias que existiam antes...\n');

    const originalBarbershops = [
      {
        name: 'BARBEARIA CORTTA',
        slug: 'barbearia-cortta',
        email: 'contato@barbeariacortta.com',
        phone: '(11) 99999-8888',
        address: 'Rua das Palmeiras, 456',
        city: 'São Paulo',
        state: 'SP',
        description: 'Barbearia especializada em cortes modernos e tradicionais',
        isActive: true,
        isBlocked: false,
        isTrialActive: true,
        isBlockedByPlan: false,
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        subscriptionPlan: 'BASIC',
        subscriptionStatus: 'ACTIVE'
      },
      {
        name: 'BARBEARIA MENÓ KENTE',
        slug: 'barbearia-meno-kente',
        email: 'info@barbeariamenokente.com',
        phone: '(11) 88888-7777',
        address: 'Av. Brigadeiro Faria Lima, 2000',
        city: 'São Paulo',
        state: 'SP',
        description: 'Barbearia premium com atendimento de primeira qualidade',
        isActive: true,
        isBlocked: false,
        isTrialActive: true,
        isBlockedByPlan: false,
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        subscriptionPlan: 'PREMIUM',
        subscriptionStatus: 'ACTIVE'
      }
    ];

    for (const barbershopData of originalBarbershops) {
      // Verificar se já existe
      const existing = await prisma.barbershop.findUnique({
        where: { slug: barbershopData.slug }
      });

      if (existing) {
        console.log(`⚠️  Barbearia "${barbershopData.name}" já existe, pulando...`);
        continue;
      }

      const barbershop = await prisma.barbershop.create({
        data: barbershopData
      });

      console.log(`✅ Restaurada: ${barbershop.name} (${barbershop.slug})`);
    }

    console.log('\n🎉 Barbearias originais restauradas com sucesso!');
    console.log('🌐 Acesse http://localhost:3000 para ver todas as barbearias');

  } catch (error) {
    console.error('❌ Erro ao restaurar barbearias:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreBarbershops();
