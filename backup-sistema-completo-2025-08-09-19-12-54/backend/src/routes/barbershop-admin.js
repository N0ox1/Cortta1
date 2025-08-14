const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');

const prisma = new PrismaClient();
const router = express.Router();

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.body.type || 'logos';
    const uploadPath = `uploads/${type === 'banner' ? 'banners' : 'logos'}/`;
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const type = req.body.type || 'logo';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${type}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  }
});

// Middleware para verificar se o usuário pertence a uma barbearia
const requireBarbershopAccess = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user.barbershopId) {
      return res.status(403).json({ message: 'Acesso negado. Usuário não pertence a uma barbearia.' });
    }

    // Buscar dados da barbearia
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: user.barbershopId }
    });

    if (!barbershop) {
      return res.status(404).json({ message: 'Barbearia não encontrada' });
    }

    if (!barbershop.isActive) {
      return res.status(403).json({ message: 'Barbearia inativa' });
    }

    req.barbershop = barbershop;
    next();
  } catch (error) {
    console.error('Erro ao verificar acesso da barbearia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Aplicar middleware de acesso à barbearia em todas as rotas
router.use(requireBarbershopAccess);

// ===== DASHBOARD =====

// Estatísticas do dashboard
router.get('/dashboard/stats', async (req, res) => {
  try {
    const { barbershop } = req;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    // Início da semana (domingo)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Fim da semana (sábado)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Agendamentos de hoje
    const todayAppointments = await prisma.appointment.count({
      where: {
        barbershopId: barbershop.id,
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    // Agendamentos da semana
    const weekAppointments = await prisma.appointment.count({
      where: {
        barbershopId: barbershop.id,
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      }
    });

    // Total de clientes
    const totalClients = await prisma.client.count({
      where: {
        barbershopId: barbershop.id
      }
    });

    // Receita mensal
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyRevenue = await prisma.appointmentService.aggregate({
      where: {
        appointment: {
          barbershopId: barbershop.id,
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          },
          status: 'COMPLETED'
        }
      },
      _sum: {
        price: true
      }
    });

    res.json({
      todayAppointments,
      weekAppointments,
      totalClients,
      totalRevenue: monthlyRevenue._sum.price || 0
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Agendamentos de hoje
router.get('/dashboard/today-appointments', async (req, res) => {
  try {
    const { barbershop } = req;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const appointments = await prisma.appointment.findMany({
      where: {
        barbershopId: barbershop.id,
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        client: true,
        barber: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.json(appointments);
  } catch (error) {
    console.error('Erro ao buscar agendamentos de hoje:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Serviços mais agendados
router.get('/dashboard/top-services', async (req, res) => {
  try {
    const { barbershop } = req;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const topServices = await prisma.appointmentService.groupBy({
      by: ['serviceId'],
      where: {
        appointment: {
          barbershopId: barbershop.id,
          date: {
            gte: startOfMonth
          },
          status: 'COMPLETED'
        }
      },
      _count: {
        serviceId: true
      },
      _sum: {
        price: true
      },
      orderBy: {
        _count: {
          serviceId: 'desc'
        }
      },
      take: 5
    });

    // Buscar detalhes dos serviços
    const serviceIds = topServices.map(item => item.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds }
      },
      select: {
        id: true,
        name: true
      }
    });

    const result = topServices.map(item => {
      const service = services.find(s => s.id === item.serviceId);
      return {
        id: item.serviceId,
        name: service?.name || 'Serviço não encontrado',
        count: item._count.serviceId,
        totalRevenue: item._sum.price || 0
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar serviços mais agendados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Status do pagamento
router.get('/dashboard/payment-status', async (req, res) => {
  try {
    const { barbershop } = req;
    
    // Verificar se há pagamento pendente (implementação básica)
    const pending = barbershop.subscriptionStatus === 'EXPIRED' || barbershop.subscriptionStatus === 'PENDING';
    
    res.json({ pending });
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ===== AGENDAMENTOS =====

// Listar agendamentos
router.get('/appointments', async (req, res) => {
  try {
    const { barbershop } = req;
    const { date, status } = req.query;

    const where = {
      barbershopId: barbershop.id
    };

    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      
      where.date = {
        gte: startOfDay,
        lt: endOfDay
      };
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: true,
        barber: {
          select: {
            id: true,
            name: true
          }
        },
        services: {
          include: {
            service: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.json(appointments);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar status do agendamento
router.patch('/appointments/:id/status', async (req, res) => {
  try {
    const { barbershop } = req;
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        barbershopId: barbershop.id
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    res.json({ message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status do agendamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ===== EQUIPE / BARBEIROS =====
// Lista toda a equipe da barbearia (barbeiros, profissionais e administrador)
router.get('/staff', async (req, res) => {
  try {
    const { barbershop } = req;

    const staff = await prisma.user.findMany({
      where: {
        barbershopId: barbershop.id,
        role: {
          in: ['BARBER', 'PROFESSIONAL', 'BARBERSHOP_ADMIN']
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(staff);
  } catch (error) {
    console.error('Erro ao listar equipe:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ===== SERVIÇOS =====

// Listar serviços
router.get('/services', async (req, res) => {
  try {
    const { barbershop } = req;

    const services = await prisma.service.findMany({
      where: {
        barbershopId: barbershop.id
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(services);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar serviço
router.post('/services', async (req, res) => {
  try {
    const { barbershop } = req;
    const { name, description, price, duration } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        barbershopId: barbershop.id
      }
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar serviço
router.put('/services/:id', async (req, res) => {
  try {
    const { barbershop } = req;
    const { id } = req.params;
    const { name, description, price, duration } = req.body;

    const service = await prisma.service.findFirst({
      where: {
        id,
        barbershopId: barbershop.id
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration)
      }
    });

    res.json(updatedService);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Excluir serviço
router.delete('/services/:id', async (req, res) => {
  try {
    const { barbershop } = req;
    const { id } = req.params;

    const service = await prisma.service.findFirst({
      where: {
        id,
        barbershopId: barbershop.id
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    await prisma.service.delete({
      where: { id }
    });

    res.json({ message: 'Serviço excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ===== PERFIL DA BARBEARIA =====

// Buscar dados da barbearia
router.get('/profile', async (req, res) => {
  try {
    const { barbershop } = req;

    res.json(barbershop);
  } catch (error) {
    console.error('Erro ao buscar dados da barbearia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar dados da barbearia
router.put('/profile', async (req, res) => {
  try {
    const { barbershop } = req;
    const updateData = { ...req.body };

    const updatedBarbershop = await prisma.barbershop.update({
      where: { id: barbershop.id },
      data: updateData
    });

    res.json(updatedBarbershop);
  } catch (error) {
    console.error('Erro ao atualizar dados da barbearia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Upload de imagens
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const { barbershop } = req;
    const { type } = req.body; // 'banner' ou 'logo'

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    // Validar tipo de arquivo
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Apenas imagens são permitidas' });
    }

    // Validar tamanho (5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'A imagem deve ter menos de 5MB' });
    }

    const imageUrl = `/uploads/${type === 'banner' ? 'banners' : 'logos'}/${req.file.filename}`;

    // Atualizar a barbearia com a nova imagem
    const updateData = {};
    if (type === 'banner') {
      updateData.bannerImage = imageUrl;
    } else if (type === 'logo') {
      updateData.logoImage = imageUrl;
    }

    await prisma.barbershop.update({
      where: { id: barbershop.id },
      data: updateData
    });

    res.json({ imageUrl });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ===== SOLICITAÇÕES DE ACESSO =====

// Listar solicitações de acesso da barbearia
router.get('/join-requests', async (req, res) => {
  try {
    const { barbershop } = req;

    const requests = await prisma.joinRequest.findMany({
      where: {
        barbershopId: barbershop.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(requests);
  } catch (error) {
    console.error('Erro ao buscar solicitações de acesso:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Aprovar solicitação de acesso
router.post('/join-requests/:id/approve', async (req, res) => {
  try {
    const { barbershop } = req;
    const { id } = req.params;

    // Verificar se a solicitação existe e pertence à barbearia
    const request = await prisma.joinRequest.findFirst({
      where: {
        id,
        barbershopId: barbershop.id,
        status: 'PENDING'
      }
    });

    if (!request) {
      return res.status(404).json({ message: 'Solicitação não encontrada ou já processada' });
    }

    // Verificar se o usuário já existe
    let user = await prisma.user.findUnique({
      where: { email: request.userEmail }
    });

    if (user) {
      // Se o usuário já existe, apenas associá-lo à barbearia
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          barbershopId: barbershop.id,
          role: 'PROFESSIONAL',
          isActive: true
        }
      });
      console.log('✅ Usuário existente associado à barbearia:', user.email);
    } else {
      // Se o usuário não existe, criar um novo com a senha salva na solicitação
      if (!request.userPassword) {
        return res.status(400).json({ message: 'Senha não encontrada na solicitação' });
      }
      
      user = await prisma.user.create({
        data: {
          email: request.userEmail,
          name: `${request.userFirstName} ${request.userLastName}`,
          phone: request.userPhone,
          country: request.userCountry,
          role: 'PROFESSIONAL',
          barbershopId: barbershop.id,
          isActive: true,
          password: request.userPassword // Usar a senha salva na solicitação
        }
      });
      console.log('✅ Novo usuário criado com senha da solicitação:', user.email);
    }

    // Atualizar status da solicitação
    await prisma.joinRequest.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    // Enviar notificação em tempo real para o usuário (se estiver online)
    const io = req.app.get('io');
    if (io) {
      io.emit('request-approved', {
        type: 'REQUEST_APPROVED',
        message: 'Sua solicitação foi aprovada! Você já pode fazer login.',
        userEmail: request.userEmail,
        barbershopName: barbershop.name
      });
    }

    // TODO: Enviar email de notificação para o usuário

    res.json({ 
      message: 'Solicitação aprovada com sucesso',
      userId: user.id
    });
  } catch (error) {
    console.error('Erro ao aprovar solicitação:', error);
    
    // Se o erro for de email duplicado, informar
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Este e-mail já está cadastrado no sistema' });
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rejeitar solicitação de acesso
router.post('/join-requests/:id/reject', async (req, res) => {
  try {
    const { barbershop } = req;
    const { id } = req.params;

    // Verificar se a solicitação existe e pertence à barbearia
    const request = await prisma.joinRequest.findFirst({
      where: {
        id,
        barbershopId: barbershop.id,
        status: 'PENDING'
      }
    });

    if (!request) {
      return res.status(404).json({ message: 'Solicitação não encontrada ou já processada' });
    }

    // Verificar se existe um usuário criado apenas para esta solicitação
    const user = await prisma.user.findUnique({
      where: { email: request.userEmail }
    });

    // Se o usuário existe e foi criado apenas para esta barbearia, deletá-lo
    if (user && user.barbershopId === barbershop.id) {
      await prisma.user.delete({
        where: { id: user.id }
      });
      console.log('🗑️ Usuário deletado após rejeição:', user.email);
    }

    // Atualizar status da solicitação
    await prisma.joinRequest.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    // Enviar notificação em tempo real para o usuário (se estiver online)
    const io = req.app.get('io');
    if (io) {
      io.emit('request-rejected', {
        type: 'REQUEST_REJECTED',
        message: 'Sua solicitação foi rejeitada.',
        userEmail: request.userEmail,
        barbershopName: barbershop.name
      });
    }

    // TODO: Enviar email de notificação para o usuário

    res.json({ message: 'Solicitação rejeitada com sucesso' });
  } catch (error) {
    console.error('Erro ao rejeitar solicitação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ===== GERENCIAMENTO DE USUÁRIOS =====

// Listar usuários da barbearia
router.get('/users', async (req, res) => {
  try {
    const { barbershop } = req;

    const users = await prisma.user.findMany({
      where: {
        barbershopId: barbershop.id,
        role: {
          in: ['PROFESSIONAL', 'BARBER']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Bloquear usuário
router.post('/users/:id/block', async (req, res) => {
  try {
    const { barbershop } = req;
    const { id } = req.params;

    // Verificar se o usuário existe e pertence à barbearia
    const user = await prisma.user.findFirst({
      where: {
        id,
        barbershopId: barbershop.id,
        role: {
          in: ['PROFESSIONAL', 'BARBER']
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Não permitir bloquear o próprio usuário
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Não é possível bloquear seu próprio usuário' });
    }

    // Bloquear usuário
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    // Enviar notificação em tempo real
    const io = req.app.get('io');
    if (io) {
      io.emit('user-blocked', {
        type: 'USER_BLOCKED',
        message: 'Seu acesso foi bloqueado pela administração.',
        userEmail: user.email,
        barbershopName: barbershop.name
      });
    }

    res.json({ message: 'Usuário bloqueado com sucesso' });
  } catch (error) {
    console.error('Erro ao bloquear usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Desbloquear usuário
router.post('/users/:id/unblock', async (req, res) => {
  try {
    const { barbershop } = req;
    const { id } = req.params;

    // Verificar se o usuário existe e pertence à barbearia
    const user = await prisma.user.findFirst({
      where: {
        id,
        barbershopId: barbershop.id,
        role: {
          in: ['PROFESSIONAL', 'BARBER']
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Desbloquear usuário
    await prisma.user.update({
      where: { id },
      data: { isActive: true }
    });

    // Enviar notificação em tempo real
    const io = req.app.get('io');
    if (io) {
      io.emit('user-unblocked', {
        type: 'USER_UNBLOCKED',
        message: 'Seu acesso foi restaurado pela administração.',
        userEmail: user.email,
        barbershopName: barbershop.name
      });
    }

    res.json({ message: 'Usuário desbloqueado com sucesso' });
  } catch (error) {
    console.error('Erro ao desbloquear usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Excluir usuário
router.delete('/users/:id', async (req, res) => {
  try {
    const { barbershop } = req;
    const { id } = req.params;

    // Verificar se o usuário existe e pertence à barbearia
    const user = await prisma.user.findFirst({
      where: {
        id,
        barbershopId: barbershop.id,
        role: {
          in: ['PROFESSIONAL', 'BARBER']
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Não permitir excluir o próprio usuário
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Não é possível excluir seu próprio usuário' });
    }

    // Excluir usuário
    await prisma.user.delete({
      where: { id }
    });

    // Enviar notificação em tempo real
    const io = req.app.get('io');
    if (io) {
      io.emit('user-deleted', {
        type: 'USER_DELETED',
        message: 'Seu acesso foi removido pela administração.',
        userEmail: user.email,
        barbershopName: barbershop.name
      });
    }

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota de teste para notificações
router.post('/test-notification', async (req, res) => {
  try {
    const { barbershop } = req;
    
    const io = req.app.get('io');
    if (io) {
      console.log('🧪 Teste: Enviando notificação para barbearia:', barbershop.id);
      
      io.to(`barbershop-${barbershop.id}`).emit('new-join-request', {
        type: 'TEST_REQUEST',
        message: 'Teste de notificação em tempo real',
        request: {
          id: 'test-' + Date.now(),
          userFirstName: 'Teste',
          userLastName: 'Usuário',
          userEmail: 'teste@exemplo.com',
          createdAt: new Date()
        }
      });
      
      res.json({ message: 'Notificação de teste enviada' });
    } else {
      res.status(500).json({ message: 'WebSocket não disponível' });
    }
  } catch (error) {
    console.error('Erro no teste de notificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 