const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar SUPER_ADMIN
  const superAdminPassword = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@barbeariasaas.com' },
    update: {},
    create: {
      name: 'Administrador Master',
      email: 'admin@barbeariasaas.com',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });
  console.log('✅ Super Admin criado:', superAdmin.email);

  // Criar configurações do sistema
  const systemConfigs = [
    { key: 'appName', value: 'Barbearia SaaS', type: 'STRING' },
    { key: 'monthlyFee', value: '99.90', type: 'NUMBER' },
    { key: 'supportEmail', value: 'suporte@barbeariasaas.com', type: 'STRING' },
    { key: 'appUrl', value: 'http://localhost:3000', type: 'STRING' }
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config
    });
  }
  console.log('✅ Configurações do sistema criadas');

  // Criar barbearias de exemplo
  const barbershops = [
    {
      name: 'Barbearia João Silva',
      slug: 'barbearia-joao-silva',
      email: 'joao@barbearia.com',
      phone: '(11) 88888-8888',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      description: 'Barbearia tradicional com os melhores profissionais',
      subscriptionPlan: 'PREMIUM',
      subscriptionStatus: 'ACTIVE',
      monthlyFee: 99.90
    },
    {
      name: 'Barbearia Pedro Santos',
      slug: 'barbearia-pedro-santos',
      email: 'pedro@barbearia.com',
      phone: '(11) 77777-7777',
      address: 'Av. Paulista, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      description: 'Barbearia moderna com atendimento premium',
      subscriptionPlan: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE',
      monthlyFee: 149.90
    },
    {
      name: 'Barbearia Carlos Oliveira',
      slug: 'barbearia-carlos-oliveira',
      email: 'carlos@barbearia.com',
      phone: '(11) 66666-6666',
      address: 'Rua Augusta, 789',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01205-000',
      description: 'Barbearia clássica com tradição',
      subscriptionPlan: 'BASIC',
      subscriptionStatus: 'ACTIVE',
      monthlyFee: 79.90
    }
  ];

  for (const barbershopData of barbershops) {
    const barbershop = await prisma.barbershop.upsert({
      where: { slug: barbershopData.slug },
      update: {},
      create: {
        ...barbershopData,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      }
    });

    // Criar admin da barbearia
    const adminPassword = await bcrypt.hash('123456', 10);
    await prisma.user.upsert({
      where: { email: barbershopData.email },
      update: {},
      create: {
        name: `Admin ${barbershopData.name}`,
        email: barbershopData.email,
        password: adminPassword,
        role: 'BARBERSHOP_ADMIN',
        barbershopId: barbershop.id,
        isActive: true
      }
    });

    // Criar barbeiros
    const barber1Password = await bcrypt.hash('123456', 10);
    const barber2Password = await bcrypt.hash('123456', 10);

    await prisma.user.createMany({
      data: [
        {
          name: `Barbeiro 1 - ${barbershopData.name}`,
          email: `barbeiro1@${barbershopData.slug}.com`,
          password: barber1Password,
          role: 'BARBER',
          barbershopId: barbershop.id,
          isActive: true
        },
        {
          name: `Barbeiro 2 - ${barbershopData.name}`,
          email: `barbeiro2@${barbershopData.slug}.com`,
          password: barber2Password,
          role: 'BARBER',
          barbershopId: barbershop.id,
          isActive: true
        }
      ],
      skipDuplicates: true
    });

    // Criar serviços
    const services = [
      {
        name: 'Corte Masculino',
        description: 'Corte tradicional masculino com acabamento',
        price: 35.00,
        duration: 30,
        category: 'CORTE'
      },
      {
        name: 'Barba',
        description: 'Fazer a barba com navalha',
        price: 25.00,
        duration: 20,
        category: 'BARBA'
      },
      {
        name: 'Corte + Barba',
        description: 'Corte masculino completo com barba',
        price: 50.00,
        duration: 45,
        category: 'COMBO'
      },
      {
        name: 'Sobrancelha',
        description: 'Ajuste de sobrancelha',
        price: 15.00,
        duration: 15,
        category: 'OUTROS'
      },
      {
        name: 'Hidratação',
        description: 'Tratamento hidratante para cabelo',
        price: 40.00,
        duration: 30,
        category: 'OUTROS'
      }
    ];

    for (const serviceData of services) {
      await prisma.service.upsert({
        where: {
          barbershopId_name: {
            barbershopId: barbershop.id,
            name: serviceData.name
          }
        },
        update: {},
        create: {
          ...serviceData,
          barbershopId: barbershop.id
        }
      });
    }

    // Criar clientes de exemplo
    const clients = [
      {
        name: `Cliente 1 - ${barbershopData.name}`,
        email: `cliente1@${barbershopData.slug}.com`,
        phone: '(11) 33333-3333',
        address: 'Rua dos Clientes, 123'
      },
      {
        name: `Cliente 2 - ${barbershopData.name}`,
        email: `cliente2@${barbershopData.slug}.com`,
        phone: '(11) 22222-2222',
        address: 'Av. dos Clientes, 456'
      },
      {
        name: `Cliente 3 - ${barbershopData.name}`,
        email: `cliente3@${barbershopData.slug}.com`,
        phone: '(11) 11111-1111',
        address: 'Rua Augusta, 789'
      }
    ];

    for (const clientData of clients) {
      await prisma.client.upsert({
        where: {
          barbershopId_email: {
            barbershopId: barbershop.id,
            email: clientData.email
          }
        },
        update: {},
        create: {
          ...clientData,
          barbershopId: barbershop.id
        }
      });
    }

    // Criar pagamentos de exemplo
    await prisma.payment.createMany({
      data: [
        {
          barbershopId: barbershop.id,
          amount: barbershopData.monthlyFee,
          status: 'PAID',
          method: 'CREDIT_CARD',
          dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
          paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          description: 'Pagamento mensal'
        },
        {
          barbershopId: barbershop.id,
          amount: barbershopData.monthlyFee,
          status: 'PENDING',
          method: 'CREDIT_CARD',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias no futuro
          description: 'Próximo pagamento mensal'
        }
      ],
      skipDuplicates: true
    });

    console.log(`✅ Barbearia ${barbershopData.name} criada com sucesso`);
  }

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('Super Admin: admin@barbeariasaas.com / admin123');
  console.log('\n📋 Barbearias criadas:');
  barbershops.forEach(shop => {
    console.log(`- ${shop.name} (${shop.slug})`);
    console.log(`  Admin: ${shop.email} / 123456`);
    console.log(`  Barbeiros: barbeiro1@${shop.slug}.com / 123456, barbeiro2@${shop.slug}.com / 123456`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 