const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Função para criar backup completo
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../../backups');
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

  try {
    console.log('🔄 Iniciando backup do banco de dados...');

    // Criar diretório de backup se não existir
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Backup de todas as tabelas
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      tables: {}
    };

    // Backup de usuários
    console.log('📊 Fazendo backup de usuários...');
    backup.tables.users = await prisma.user.findMany();

    // Backup de barbearias
    console.log('🏪 Fazendo backup de barbearias...');
    backup.tables.barbershops = await prisma.barbershop.findMany();

    // Backup de serviços
    console.log('✂️ Fazendo backup de serviços...');
    backup.tables.services = await prisma.service.findMany();

    // Backup de clientes
    console.log('👥 Fazendo backup de clientes...');
    backup.tables.clients = await prisma.client.findMany();

    // Backup de agendamentos
    console.log('📅 Fazendo backup de agendamentos...');
    backup.tables.appointments = await prisma.appointment.findMany();

    // Backup de serviços dos agendamentos
    console.log('🔗 Fazendo backup de serviços dos agendamentos...');
    backup.tables.appointmentServices = await prisma.appointmentService.findMany();

    // Backup de pagamentos
    console.log('💰 Fazendo backup de pagamentos...');
    backup.tables.payments = await prisma.payment.findMany();

    // Backup de solicitações de acesso
    console.log('🔐 Fazendo backup de solicitações de acesso...');
    backup.tables.joinRequests = await prisma.joinRequest.findMany();

    // Backup de configurações do sistema
    console.log('⚙️ Fazendo backup de configurações...');
    backup.tables.systemConfigs = await prisma.systemConfig.findMany();

    // Salvar backup
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backup criado com sucesso: ${backupFile}`);
    console.log(`📊 Estatísticas do backup:`);
    console.log(`   - Usuários: ${backup.tables.users.length}`);
    console.log(`   - Barbearias: ${backup.tables.barbershops.length}`);
    console.log(`   - Serviços: ${backup.tables.services.length}`);
    console.log(`   - Clientes: ${backup.tables.clients.length}`);
    console.log(`   - Agendamentos: ${backup.tables.appointments.length}`);
    console.log(`   - Pagamentos: ${backup.tables.payments.length}`);
    console.log(`   - Solicitações: ${backup.tables.joinRequests.length}`);

    return backupFile;

  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    throw error;
  }
}

// Função para restaurar backup
async function restoreBackup(backupFile) {
  try {
    console.log(`🔄 Iniciando restauração do backup: ${backupFile}`);

    if (!fs.existsSync(backupFile)) {
      throw new Error('Arquivo de backup não encontrado');
    }

    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

    console.log('⚠️  ATENÇÃO: Esta operação irá limpar o banco atual!');
    console.log('📅 Backup criado em:', backup.timestamp);

    // Limpar banco atual (CUIDADO!)
    console.log('🧹 Limpando banco atual...');
    await prisma.appointmentService.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.service.deleteMany();
    await prisma.client.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.joinRequest.deleteMany();
    await prisma.user.deleteMany();
    await prisma.barbershop.deleteMany();
    await prisma.systemConfig.deleteMany();

    // Restaurar dados
    console.log('📥 Restaurando dados...');

    if (backup.tables.systemConfigs) {
      console.log('⚙️ Restaurando configurações...');
      await prisma.systemConfig.createMany({
        data: backup.tables.systemConfigs
      });
    }

    if (backup.tables.barbershops) {
      console.log('🏪 Restaurando barbearias...');
      await prisma.barbershop.createMany({
        data: backup.tables.barbershops
      });
    }

    if (backup.tables.users) {
      console.log('👤 Restaurando usuários...');
      await prisma.user.createMany({
        data: backup.tables.users
      });
    }

    if (backup.tables.services) {
      console.log('✂️ Restaurando serviços...');
      await prisma.service.createMany({
        data: backup.tables.services
      });
    }

    if (backup.tables.clients) {
      console.log('👥 Restaurando clientes...');
      await prisma.client.createMany({
        data: backup.tables.clients
      });
    }

    if (backup.tables.appointments) {
      console.log('📅 Restaurando agendamentos...');
      await prisma.appointment.createMany({
        data: backup.tables.appointments
      });
    }

    if (backup.tables.appointmentServices) {
      console.log('🔗 Restaurando serviços dos agendamentos...');
      await prisma.appointmentService.createMany({
        data: backup.tables.appointmentServices
      });
    }

    if (backup.tables.payments) {
      console.log('💰 Restaurando pagamentos...');
      await prisma.payment.createMany({
        data: backup.tables.payments
      });
    }

    if (backup.tables.joinRequests) {
      console.log('🔐 Restaurando solicitações de acesso...');
      await prisma.joinRequest.createMany({
        data: backup.tables.joinRequests
      });
    }

    console.log('✅ Restauração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error);
    throw error;
  }
}

// Função para listar backups disponíveis
function listBackups() {
  const backupDir = path.join(__dirname, '../../backups');
  
  if (!fs.existsSync(backupDir)) {
    console.log('📁 Nenhum backup encontrado');
    return [];
  }

  const files = fs.readdirSync(backupDir)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: stats.size,
        created: stats.birthtime
      };
    })
    .sort((a, b) => b.created - a.created);

  console.log('📋 Backups disponíveis:');
  files.forEach((file, index) => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    console.log(`${index + 1}. ${file.name} (${sizeMB} MB) - ${file.created.toLocaleString()}`);
  });

  return files;
}

// Executar baseado no argumento
const command = process.argv[2];

switch (command) {
  case 'create':
    createBackup()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;
  
  case 'restore':
    const backupFile = process.argv[3];
    if (!backupFile) {
      console.error('❌ Especifique o arquivo de backup: node backup.js restore backup-file.json');
      process.exit(1);
    }
    restoreBackup(backupFile)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;
  
  case 'list':
    listBackups();
    process.exit(0);
    break;
  
  default:
    console.log('📖 Uso:');
    console.log('  node backup.js create     - Criar novo backup');
    console.log('  node backup.js restore <file> - Restaurar backup');
    console.log('  node backup.js list       - Listar backups');
    process.exit(0);
}

module.exports = { createBackup, restoreBackup, listBackups }; 