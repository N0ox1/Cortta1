const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware para autenticar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Token de acesso necessário' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        barbershop: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Usuário não encontrado ou inativo' });
    }

    // Adicionar usuário ao request
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(403).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar se é SUPER_ADMIN
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Acesso negado. Apenas super administradores.' });
  }
  next();
};

// Middleware para verificar se é admin da barbearia
const requireBarbershopAdmin = (req, res, next) => {
  if (req.user.role !== 'BARBERSHOP_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores de barbearia.' });
  }
  next();
};

// Middleware para verificar se a barbearia está ativa
const requireActiveBarbershop = (req, res, next) => {
  if (req.user.barbershop && !req.user.barbershop.isActive) {
    return res.status(403).json({ message: 'Barbearia inativa. Entre em contato com o suporte.' });
  }
  next();
};

// Middleware para verificar se a barbearia não está bloqueada
const requireUnblockedBarbershop = (req, res, next) => {
  if (req.user.barbershop && req.user.barbershop.isBlocked) {
    return res.status(403).json({ message: 'Barbearia bloqueada. Regularize sua assinatura.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireSuperAdmin,
  requireBarbershopAdmin,
  requireActiveBarbershop,
  requireUnblockedBarbershop
}; 