const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { config, validateConfig, displayConfig } = require('./config/database');

// Validar e exibir configurações
if (!validateConfig()) {
  console.error('❌ Configurações inválidas. Encerrando...');
  process.exit(1);
}

displayConfig();

// Importar rotas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const barbershopRoutes = require('./routes/barbershop');
const barbershopAdminRoutes = require('./routes/barbershop-admin');
const clientRoutes = require('./routes/client');

// Importar middleware
const { authenticateToken } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.appUrl,
    methods: ["GET", "POST"]
  }
});
const PORT = config.port;

// Middleware de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000 // limite de 1000 requests por IP (aumentado temporariamente)
});
app.use(limiter);

// Middleware
app.use(cors({
  origin: config.appUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas de clientes (públicas)
app.use('/api/client', clientRoutes);

// Rotas protegidas - Admin Master
app.use('/api/admin', authenticateToken, adminRoutes);

// Rotas das barbearias (públicas)
app.use('/api/barbershop/public', barbershopRoutes);

// Rotas administrativas das barbearias (protegidas)
app.use('/api/barbershop', authenticateToken, barbershopAdminRoutes);

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Barbearia SaaS API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erros
app.use(errorHandler.errorHandler);

// WebSocket para notificações em tempo real
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  // Juntar-se a uma sala específica da barbearia
  socket.on('join-barbershop', (barbershopId) => {
    socket.join(`barbershop-${barbershopId}`);
    console.log(`👥 Cliente ${socket.id} entrou na barbearia ${barbershopId}`);
  });

  // Sair de uma sala
  socket.on('leave-barbershop', (barbershopId) => {
    socket.leave(`barbershop-${barbershopId}`);
    console.log(`👋 Cliente ${socket.id} saiu da barbearia ${barbershopId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

// Disponibilizar io para as rotas
app.set('io', io);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Inicializar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket ativo`);

}); 