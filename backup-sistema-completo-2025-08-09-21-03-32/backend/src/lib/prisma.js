const { PrismaClient } = require('@prisma/client');
const { config } = require('../config/database');

// Configurar o PrismaClient com as configurações centralizadas
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url
    }
  },
  log: ['query', 'info', 'warn', 'error'],
});

// Testar conexão na inicialização
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma conectado com sucesso ao banco de dados');
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar Prisma:', error);
  });

module.exports = prisma; 