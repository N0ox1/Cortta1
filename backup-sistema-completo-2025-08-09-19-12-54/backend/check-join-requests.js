const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkJoinRequests() {
  try {
    console.log('🔍 Verificando tabela join_requests...');
    
    // Verificar se a tabela existe
    const requests = await prisma.joinRequest.findMany();
    
    console.log('📊 Total de solicitações:', requests.length);
    console.log('📋 Solicitações:', requests);
    
    // Verificar barbearias
    const barbershops = await prisma.barbershop.findMany({
      where: { isActive: true }
    });
    
    console.log('\n🏪 Barbearias ativas:', barbershops.length);
    barbershops.forEach(bs => {
      console.log(`  - ${bs.name} (ID: ${bs.id})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJoinRequests();
