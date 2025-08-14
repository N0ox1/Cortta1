const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBarbershops() {
  try {
    const barbershops = await prisma.barbershop.findMany({
      where: {
        isActive: true,
        isBlocked: false
      }
    });
    
    console.log('Barbearias encontradas:', barbershops.length);
    console.log('Barbearias:', barbershops);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBarbershops();
