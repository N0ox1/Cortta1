const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// Rota pública para listar todas as barbearias ativas
router.get('/', async (req, res) => {
  try {
    const barbershops = await prisma.barbershop.findMany({
      where: {
        isActive: true,
        isBlocked: false
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        state: true,
        logoImage: true,
        workingHours: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(barbershops);
  } catch (error) {
    console.error('Erro ao listar barbearias:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota pública para criar nova barbearia
router.post('/', async (req, res) => {
  try {
    const { name, slug, description, phone, email, address, city, state, zipCode } = req.body;

    // Validar campos obrigatórios
    if (!name || !slug || !phone || !email) {
      return res.status(400).json({ message: 'Nome, URL, telefone e email são obrigatórios' });
    }

    // Verificar se o slug já existe
    const existingBarbershop = await prisma.barbershop.findUnique({
      where: { slug }
    });

    if (existingBarbershop) {
      return res.status(400).json({ message: 'Esta URL já está em uso. Escolha outra.' });
    }

    // Verificar se o email já está em uso
    const existingEmail = await prisma.barbershop.findFirst({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({ message: 'Este email já está em uso.' });
    }

    // Criar a barbearia
    const barbershop = await prisma.barbershop.create({
      data: {
        name,
        slug,
        description,
        phone,
        email,
        address,
        city,
        state,
        zipCode,
        isActive: true,
        isBlocked: false
      }
    });

    res.status(201).json(barbershop);
  } catch (error) {
    console.error('Erro ao criar barbearia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Middleware para identificar a barbearia pelo slug
const identifyBarbershop = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    const barbershop = await prisma.barbershop.findUnique({
      where: { slug }
    });

    if (!barbershop) {
      return res.status(404).json({ message: 'Barbearia não encontrada' });
    }

    if (!barbershop.isActive) {
      return res.status(403).json({ message: 'Barbearia inativa' });
    }

    if (barbershop.isBlocked) {
      return res.status(403).json({ message: 'Barbearia bloqueada. Regularize sua assinatura.' });
    }

    req.barbershop = barbershop;
    next();
  } catch (error) {
    console.error('Erro ao identificar barbearia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Rota pública para buscar dados da barbearia
router.get('/:slug', identifyBarbershop, async (req, res) => {
  try {
    const { barbershop } = req;
    
    res.json({
      id: barbershop.id,
      name: barbershop.name,
      slug: barbershop.slug,
      description: barbershop.description,
      phone: barbershop.phone,
      email: barbershop.email,
      address: barbershop.address,
      city: barbershop.city,
      state: barbershop.state,
      logoImage: barbershop.logoImage,
      bannerImage: barbershop.bannerImage,
      primaryColor: barbershop.primaryColor,
      secondaryColor: barbershop.secondaryColor,
      accentColor: barbershop.accentColor,
      workingHours: barbershop.workingHours,
      createdAt: barbershop.createdAt
    });
  } catch (error) {
    console.error('Erro ao buscar dados da barbearia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota pública para buscar serviços da barbearia
router.get('/:slug/services', identifyBarbershop, async (req, res) => {
  try {
    const { barbershop } = req;
    
    const services = await prisma.service.findMany({
      where: {
        barbershopId: barbershop.id,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(services);
  } catch (error) {
    console.error('Erro ao buscar serviços da barbearia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota pública para buscar barbeiros da barbearia
router.get('/:slug/barbers', identifyBarbershop, async (req, res) => {
  try {
    const { barbershop } = req;
    
    const barbers = await prisma.user.findMany({
      where: {
        barbershopId: barbershop.id,
        role: 'BARBER',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(barbers);
  } catch (error) {
    console.error('Erro ao buscar barbeiros da barbearia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota pública para buscar horários disponíveis
router.get('/:slug/available-slots', identifyBarbershop, async (req, res) => {
  try {
    const { barbershop } = req;
    const { date, barberId } = req.query;

    if (!date || !barberId) {
      return res.status(400).json({ message: 'Data e barbeiro são obrigatórios' });
    }

    // Buscar agendamentos existentes para a data e barbeiro
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barbershopId: barbershop.id,
        barberId: barberId,
        date: {
          gte: new Date(date + 'T00:00:00'),
          lt: new Date(date + 'T23:59:59')
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      },
      select: {
        date: true
      }
    });

    // Gerar horários disponíveis (8h às 18h, intervalos de 30 min)
    const availableSlots = [];
    const startHour = 8;
    const endHour = 18;
    const interval = 30; // minutos

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const slotTime = new Date(date + `T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
        
        // Verificar se o horário não está ocupado
        const isOccupied = existingAppointments.some(appointment => {
          const appointmentTime = new Date(appointment.date);
          return appointmentTime.getTime() === slotTime.getTime();
        });

        if (!isOccupied) {
          availableSlots.push({
            time: slotTime.toISOString(),
            formatted: slotTime.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          });
        }
      }
    }

    res.json(availableSlots);
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota pública para criar agendamento
router.post('/:slug/appointments', identifyBarbershop, async (req, res) => {
  try {
    const { barbershop } = req;
    const { clientName, clientEmail, clientPhone, date, barberId, serviceIds } = req.body;

    // Validar dados obrigatórios
    if (!clientName || !clientEmail || !date || !barberId || !serviceIds || serviceIds.length === 0) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    // Verificar se o barbeiro existe e pertence à barbearia
    const barber = await prisma.user.findFirst({
      where: {
        id: barberId,
        barbershopId: barbershop.id,
        role: 'BARBER',
        isActive: true
      }
    });

    if (!barber) {
      return res.status(400).json({ message: 'Barbeiro não encontrado' });
    }

    // Verificar se os serviços existem
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        barbershopId: barbershop.id,
        isActive: true
      }
    });

    if (services.length !== serviceIds.length) {
      return res.status(400).json({ message: 'Um ou mais serviços não encontrados' });
    }

    // Criar ou buscar cliente
    let client = await prisma.client.findFirst({
      where: {
        email: clientEmail,
        barbershopId: barbershop.id
      }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          barbershopId: barbershop.id
        }
      });
    }

    // Verificar se o horário está disponível
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        barbershopId: barbershop.id,
        barberId: barberId,
        date: new Date(date),
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Horário não disponível' });
    }

    // Criar agendamento
    const appointment = await prisma.appointment.create({
      data: {
        barbershopId: barbershop.id,
        clientId: client.id,
        barberId: barberId,
        date: new Date(date),
        status: 'SCHEDULED',
        createdById: barberId // Usar o barbeiro como criador
      }
    });

    // Adicionar serviços ao agendamento
    const appointmentServices = serviceIds.map(serviceId => {
      const service = services.find(s => s.id === serviceId);
      return {
        appointmentId: appointment.id,
        serviceId: serviceId,
        price: service.price
      };
    });

    await prisma.appointmentService.createMany({
      data: appointmentServices
    });

    // Buscar agendamento completo
    const createdAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
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
      }
    });

    res.status(201).json({
      message: 'Agendamento criado com sucesso',
      appointment: createdAppointment
    });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 