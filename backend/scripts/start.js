const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Fail fast se DATABASE_URL estiver ausente
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL ausente - Configure a variável de ambiente');
  process.exit(1);
}

// Configurar outras variáveis de ambiente padrão
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "sua-chave-secreta-muito-segura-aqui";
}
if (!process.env.PORT) {
  process.env.PORT = "5000";
}
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

console.log('🚀 Iniciando servidor com configurações robustas...');
console.log('🔧 Configurações:');
console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
console.log(`🔗 Porta: ${process.env.PORT}`);
console.log(`🗄️  Banco: Configurado`);

// Iniciar o servidor
const server = spawn('node', ['src/server.js'], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
});

server.on('close', (code) => {
  console.log(`📴 Servidor encerrado com código: ${code}`);
}); 