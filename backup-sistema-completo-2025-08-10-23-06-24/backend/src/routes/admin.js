const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const errorHandler = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar se é super admin
const requireSuperAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Acesso negado. Apenas super administradores.' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Aplicar middleware de autenticação e super admin em todas as rotas
router.use(authenticateToken);
router.use(requireSuperAdmin);

// ===== DASHBOARD =====
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalBarbershops,
      activeBarbershops,
      totalRevenue,
      pendingPayments
    ] = await Promise.all([
      prisma.barbershop.count(),
      prisma.barbershop.count({ where: { isActive: true } }),
      prisma.barbershop.aggregate({
        _sum: { totalRevenue: true }
      }),
      prisma.payment.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      totalBarbershops,
      activeBarbershops,
      totalRevenue: totalRevenue._sum.totalRevenue || 0,
      pendingPayments
    });
  } catch (error) {
    next(error);
  }
});

// ===== BARBEARIAS =====
router.get('/barbershops', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [barbershops, total] = await Promise.all([
      prisma.barbershop.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { users: true, appointments: true }
          }
        }
      }),
      prisma.barbershop.count({ where })
    ]);

    res.json({
      barbershops,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// ===== SOLICITAÇÕES DE ACESSO =====
router.get('/join-requests', async (req, res, next) => {
  try {
    const requests = await prisma.joinRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        barbershop: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
          }
        }
      }
    });

    // Formatar dados para o frontend
    const formattedRequests = requests.map(request => ({
      id: request.id,
      status: request.status.toLowerCase(),
      createdAt: request.createdAt,
      user: {
        firstName: request.userFirstName,
        lastName: request.userLastName,
        email: request.userEmail,
        phone: request.userPhone
      },
      barbershop: request.barbershop
    }));

    res.json(formattedRequests);
  } catch (error) {
    next(error);
  }
});

router.post('/join-requests/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await prisma.joinRequest.findUnique({
      where: { id },
      include: { barbershop: true }
    });

    if (!request) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: 'Solicitação já foi processada' });
    }

    // Atualizar status da solicitação
    await prisma.joinRequest.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    // TODO: Enviar email de notificação para o usuário
    // TODO: Criar conta do usuário automaticamente

    res.json({ message: 'Solicitação aprovada com sucesso' });
  } catch (error) {
    next(error);
  }
});

router.post('/join-requests/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await prisma.joinRequest.findUnique({
      where: { id },
      include: { barbershop: true }
    });

    if (!request) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: 'Solicitação já foi processada' });
    }

    // Atualizar status da solicitação
    await prisma.joinRequest.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    // TODO: Enviar email de notificação para o usuário

    res.json({ message: 'Solicitação rejeitada com sucesso' });
  } catch (error) {
    next(error);
  }
});

// ===== PAGAMENTOS =====
router.get('/payments', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          barbershop: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// ===== CONFIGURAÇÕES =====
router.get('/settings', async (req, res, next) => {
  try {
    const configs = await prisma.systemConfig.findMany();
    res.json(configs);
  } catch (error) {
    next(error);
  }
});

router.post('/settings', [
  body('key').notEmpty().withMessage('Chave é obrigatória'),
  body('value').notEmpty().withMessage('Valor é obrigatório'),
  body('type').isIn(['STRING', 'NUMBER', 'BOOLEAN', 'JSON']).withMessage('Tipo inválido')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { key, value, type } = req.body;

    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: { value, type },
      create: { key, value, type }
    });

    res.json(config);
  } catch (error) {
    next(error);
  }
});

// Aplicar middleware de tratamento de erros
router.use(errorHandler.errorHandler);

module.exports = router; 