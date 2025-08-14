const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('👤 Criando usuário de teste...\n');

    // Primeiro, vamos pegar uma barbearia existente
    const barbershop = await prisma.barbershop.findFirst({
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!barbershop) {
      console.log('❌ Nenhuma barbearia encontrada! Crie uma barbearia primeiro.');
      return;
    }

    console.log(`🏪 Usando barbearia: ${barbershop.name} (${barbershop.email})`);

    // Hash da senha
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: 'admin@teste.com',
        password: hashedPassword,
        name: 'Administrador Teste',
        phone: '(11) 99999-9999',
        role: 'BARBERSHOP_ADMIN',
        isActive: true,
        barbershopId: barbershop.id
      }
    });

    console.log('✅ Usuário criado com sucesso!');
    console.log('');
    console.log('🔑 Credenciais de login:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Senha: 123456`);
    console.log(`   Barbearia: ${barbershop.name}`);
    console.log('');
    console.log('🌐 Acesse http://localhost:3000/login para fazer login');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
