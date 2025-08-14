const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente de forma robusta
const envPath = path.resolve(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

// Fail fast se DATABASE_URL estiver ausente
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL ausente - Configure a variável de ambiente');
  process.exit(1);
}

// Configurações do banco de dados
const databaseConfig = {
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "barbearia_saas",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
};

// Configurações gerais
const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "sua-chave-secreta-muito-segura-aqui",
  appUrl: process.env.APP_URL || "http://localhost:3000",
  database: databaseConfig,
};

// Função para validar configurações
function validateConfig() {
  console.log('🔧 Validando configurações...');
  
  const required = ['database.url', 'jwtSecret'];
  const missing = [];
  
  required.forEach(key => {
    const value = key.split('.').reduce((obj, k) => obj && obj[k], config);
    if (!value) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Configurações obrigatórias ausentes:', missing);
    return false;
  }
  
  console.log('✅ Configurações validadas com sucesso');
  return true;
}

// Função para exibir configurações (sem senhas)
function displayConfig() {
  console.log('🔧 Configurações carregadas:');
  console.log(`📊 Ambiente: ${config.nodeEnv}`);
  console.log(`🔗 Porta: ${config.port}`);
  console.log(`🌐 App URL: ${config.appUrl}`);
  console.log(`🗄️  Banco: ${config.database.host}:${config.database.port}/${config.database.database}`);
  console.log(`👤 Usuário DB: ${config.database.username}`);
}

module.exports = {
  config,
  validateConfig,
  displayConfig,
}; 