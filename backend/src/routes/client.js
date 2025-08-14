const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Rota para buscar agendamentos de um cliente por telefone
router.get('/appointments/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({ message: 'Telefone é obrigatório' });
    }

    // Limpar o telefone (remover caracteres especiais)
    const cleanPhone = phone.replace(/\D/g, '');

    // Buscar cliente pelo telefone
    const client = await prisma.client.findFirst({
      where: {
        phone: {
          contains: cleanPhone
        }
      }
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Buscar agendamentos do cliente
    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: client.id
      },
      include: {
        barbershop: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true
          }
        },
        barber: {
          select: {
            id: true,
            name: true
          }
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(appointments);

  } catch (error) {
    console.error('Erro ao buscar agendamentos do cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para cancelar agendamento
router.delete('/appointments/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar o agendamento
    const appointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Verificar se pode ser cancelado (não pode ser cancelado se já passou)
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);

    if (appointmentDate < now) {
      return res.status(400).json({ message: 'Não é possível cancelar um agendamento que já passou' });
    }

    if (hoursUntilAppointment < 2) {
      return res.status(400).json({ message: 'Só é possível cancelar agendamentos com mais de 2 horas de antecedência' });
    }

    if (appointment.status !== 'SCHEDULED') {
      return res.status(400).json({ message: 'Só é possível cancelar agendamentos agendados' });
    }

    // Cancelar o agendamento
    await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    res.json({ message: 'Agendamento cancelado com sucesso' });

  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 