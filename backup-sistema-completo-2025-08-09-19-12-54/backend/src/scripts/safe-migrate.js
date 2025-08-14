const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🛡️  Sistema de Migração Segura - Cortta');
console.log('==========================================');

// Verificar se estamos em produção
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development' || !isProduction;

if (isProduction) {
  console.log('🚨 ATENÇÃO: Você está em PRODUÇÃO!');
  console.log('⚠️  Certifique-se de que fez backup manual antes de continuar.');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Confirma que fez backup manual? (sim/nao): ', (answer) => {
    if (answer.toLowerCase() !== 'sim') {
      console.log('❌ Migração cancelada por segurança.');
      rl.close();
      process.exit(1);
    }
    rl.close();
    runMigration();
  });
} else {
  console.log('✅ Ambiente de desenvolvimento detectado');
  runMigration();
}

function runMigration() {
  try {
    // 1. Backup automático
    console.log('\n🔄 Fazendo backup automático...');
    execSync('npm run backup:auto', { stdio: 'inherit' });
    
    // 2. Verificar se o backup foi criado
    const backupDir = path.join(__dirname, '../../backups');
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
      if (files.length > 0) {
        const latestBackup = files[files.length - 1];
        console.log(`✅ Backup criado: ${latestBackup}`);
      }
    }

    // 3. Executar migração
    console.log('\n🔄 Executando migração...');
    const migrationCommand = process.argv[2] || 'dev';
    
    if (migrationCommand === 'dev') {
      execSync('npx prisma migrate dev', { stdio: 'inherit' });
    } else if (migrationCommand === 'deploy') {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    } else if (migrationCommand === 'reset') {
      console.log('⚠️  RESET detectado - Isso irá limpar o banco!');
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Confirma RESET do banco? (sim/nao): ', (answer) => {
        if (answer.toLowerCase() !== 'sim') {
          console.log('❌ Reset cancelado.');
          rl.close();
          process.exit(1);
        }
        rl.close();
        execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
        console.log('✅ Reset concluído com sucesso!');
      });
    } else {
      console.log('❌ Comando de migração inválido. Use: dev, deploy, ou reset');
      process.exit(1);
    }

    console.log('\n✅ Migração concluída com sucesso!');
    console.log('📊 Backup salvo em: backend/backups/');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    console.log('\n🔄 Para restaurar o backup:');
    console.log('   npm run backup:list');
    console.log('   npm run backup:restore <arquivo>');
    process.exit(1);
  }
} 