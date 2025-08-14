const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

async function seedBarbershops() {
  try {
    console.log('🌱 Iniciando seed das barbearias...');

    // Verificar se já existem barbearias
    const existingBarbershops = await prisma.barbershop.findMany();
    
    if (existingBarbershops.length > 0) {
      console.log('✅ Já existem barbearias no banco. Pulando seed.');
      return;
    }

    // Criar barbearias de teste
    const barbershops = [
      {
        name: 'Barbearia do João',
        slug: 'barbearia-do-joao',
        description: 'Barbearia tradicional com os melhores profissionais da região',
        phone: '(11) 99999-9999',
        email: 'joao@barbearia.com',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isActive: true,
        isBlocked: false,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
      },
      {
        name: 'Corte & Estilo',
        slug: 'corte-estilo',
        description: 'Barbearia moderna com técnicas avançadas de corte',
        phone: '(11) 88888-8888',
        email: 'contato@corteestilo.com',
        address: 'Av. Paulista, 456',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-000',
        isActive: true,
        isBlocked: false,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Barbearia Clássica',
        slug: 'barbearia-classica',
        description: 'Barbearia com ambiente retrô e atendimento personalizado',
        phone: '(11) 77777-7777',
        email: 'contato@barbeariaclassica.com',
        address: 'Rua Augusta, 789',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01205-000',
        isActive: true,
        isBlocked: false,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Studio Barbearia',
        slug: 'studio-barbearia',
        description: 'Studio moderno com foco em tendências e inovação',
        phone: '(11) 66666-6666',
        email: 'contato@studiobarbearia.com',
        address: 'Rua Oscar Freire, 321',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01426-000',
        isActive: true,
        isBlocked: false,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Barbearia Express',
        slug: 'barbearia-express',
        description: 'Atendimento rápido e eficiente para homens modernos',
        phone: '(11) 55555-5555',
        email: 'contato@barbeariaexpress.com',
        address: 'Rua 25 de Março, 654',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01021-000',
        isActive: true,
        isBlocked: false,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    ];

    // Inserir barbearias
    for (const barbershop of barbershops) {
      await prisma.barbershop.create({
        data: barbershop
      });
      console.log(`✅ Barbearia "${barbershop.name}" criada com sucesso!`);
    }

    console.log('🎉 Seed das barbearias concluído com sucesso!');
    console.log(`📊 Total de barbearias criadas: ${barbershops.length}`);

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o seed
seedBarbershops(); 