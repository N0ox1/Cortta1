const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedBarbershops() {
  try {
    console.log('🌱 Criando barbearias de teste...\n');

    const barbershops = [
      {
        name: 'Barbearia João Silva',
        slug: 'barbearia-joao-silva',
        email: 'joao@barbearia.com',
        phone: '(11) 99999-9999',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        description: 'Barbearia tradicional com os melhores profissionais da região',
        isActive: true,
        isBlocked: false,
        subscriptionPlan: 'BASIC',
        subscriptionStatus: 'ACTIVE',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        monthlyFee: 29.90
      },
      {
        name: 'Barbearia Moderna',
        slug: 'barbearia-moderna',
        email: 'contato@barbeariamoderna.com',
        phone: '(11) 88888-8888',
        address: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        description: 'Barbearia moderna com ambiente descontraído e profissionais qualificados',
        isActive: true,
        isBlocked: false,
        subscriptionPlan: 'PREMIUM',
        subscriptionStatus: 'ACTIVE',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        monthlyFee: 49.90
      },
      {
        name: 'Barbearia Clássica',
        slug: 'barbearia-classica',
        email: 'info@barbeariaclassica.com',
        phone: '(11) 77777-7777',
        address: 'Rua Augusta, 500',
        city: 'São Paulo',
        state: 'SP',
        description: 'Barbearia clássica com tradição e qualidade desde 1980',
        isActive: true,
        isBlocked: false,
        subscriptionPlan: 'BASIC',
        subscriptionStatus: 'ACTIVE',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        monthlyFee: 29.90
      }
    ];

    for (const barbershopData of barbershops) {
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

      console.log(`✅ Criada: ${barbershop.name} (${barbershop.slug})`);
    }

    console.log('\n🎉 Barbearias de teste criadas com sucesso!');
    console.log('🌐 Acesse http://localhost:3000 para ver as barbearias na landing page');

  } catch (error) {
    console.error('❌ Erro ao criar barbearias:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBarbershops();
