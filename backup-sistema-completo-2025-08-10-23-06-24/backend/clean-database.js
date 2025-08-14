const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('🧹 Limpando banco de dados...\n');

    // Deletar todos os usuários
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ ${deletedUsers.count} usuários deletados`);

    // Deletar todas as barbearias
    const deletedBarbershops = await prisma.barbershop.deleteMany({});
    console.log(`✅ ${deletedBarbershops.count} barbearias deletadas`);

    // Deletar outros dados relacionados
    const deletedServices = await prisma.service.deleteMany({});
    console.log(`✅ ${deletedServices.count} serviços deletados`);

    const deletedClients = await prisma.client.deleteMany({});
    console.log(`✅ ${deletedClients.count} clientes deletados`);

    const deletedAppointments = await prisma.appointment.deleteMany({});
    console.log(`✅ ${deletedAppointments.count} agendamentos deletados`);

    const deletedJoinRequests = await prisma.joinRequest.deleteMany({});
    console.log(`✅ ${deletedJoinRequests.count} solicitações de entrada deletadas`);

    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`✅ ${deletedPayments.count} pagamentos deletados`);

    console.log('\n🎉 Banco de dados limpo com sucesso!');
    console.log('💡 Agora você pode criar tudo do zero com dados reais.');

  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
