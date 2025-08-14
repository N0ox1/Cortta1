const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const router = express.Router();

// Login
router.post('/login', [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        barbershop: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }



    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        barbershopId: user.barbershopId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar se email existe (não cria usuário)
router.post('/register', [
  body('email').isEmail().withMessage('E-mail inválido')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Verificar se o e-mail já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'E-mail já cadastrado' });
    }

    // Email disponível para registro
    res.status(200).json({
      message: 'Email disponível para registro',
      email
    });

  } catch (error) {
    console.error('Erro ao verificar email:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Registrar usuário + barbearia (fluxo completo)
router.post('/register-complete', [
  body('user.email').isEmail().withMessage('E-mail inválido'),
  body('user.firstName').notEmpty().withMessage('Nome é obrigatório'),
  body('user.lastName').notEmpty().withMessage('Sobrenome é obrigatório'),
  body('user.password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('user.phone').notEmpty().withMessage('Telefone é obrigatório'),
  body('user.country').notEmpty().withMessage('País é obrigatório'),
  body('barbershop.name').notEmpty().withMessage('Nome da barbearia é obrigatório'),
  body('barbershop.phone').notEmpty().withMessage('Telefone da barbearia é obrigatório')
], async (req, res) => {
  try {
    console.log('🔍 Iniciando registro completo...');
    console.log('📝 Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Erros de validação:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { user: userData, barbershop: barbershopData } = req.body;

    // Verificar se o e-mail já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'E-mail já cadastrado' });
    }

    console.log('🔍 Verificando se o nome da barbearia já existe...');
    // Verificar se o nome da barbearia já existe
    const existingBarbershop = await prisma.barbershop.findFirst({
      where: { name: barbershopData.name }
    });

    if (existingBarbershop) {
      console.log('❌ Nome da barbearia já existe:', barbershopData.name);
      return res.status(400).json({ message: 'Nome da barbearia já existe' });
    }
    console.log('✅ Nome da barbearia disponível');

    console.log('🔐 Fazendo hash da senha...');
    // Hash da senha
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    console.log('✅ Hash da senha concluído');

    console.log('🏪 Criando barbearia...');
    // Criar barbearia primeiro
    const barbershop = await prisma.barbershop.create({
      data: {
        name: barbershopData.name,
        slug: barbershopData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
        email: `barbearia-${Date.now()}@example.com`,
        phone: barbershopData.phone,
        address: barbershopData.address || '',
        city: barbershopData.city || '',
        state: barbershopData.state || '',
        description: barbershopData.description || '',
        website: barbershopData.website || '',
        categories: barbershopData.categories || [],
        teamSize: barbershopData.teamSize || null,
        subscriptionPlan: 'BASIC',
        subscriptionStatus: 'ACTIVE',
        monthlyFee: 99,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      }
    });

    // Criar usuário admin da barbearia
    const user = await prisma.user.create({
      data: {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        country: userData.country,
        role: 'BARBERSHOP_ADMIN',
        barbershopId: barbershop.id,
        isActive: true
      }
    });

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        barbershopId: user.barbershopId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Conta criada com sucesso',
      token,
      user: userWithoutPassword,
      barbershop
    });

  } catch (error) {
    console.error('Erro no registro completo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Solicitar acesso a uma barbearia existente
router.post('/request-join', [
  body('user.email').isEmail().withMessage('E-mail inválido'),
  body('user.firstName').notEmpty().withMessage('Nome é obrigatório'),
  body('user.lastName').notEmpty().withMessage('Sobrenome é obrigatório'),
  body('user.password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('user.phone').optional().notEmpty().withMessage('Telefone não pode ser vazio'),
  body('user.country').optional().notEmpty().withMessage('País não pode ser vazio'),
  body('barbershopId').notEmpty().withMessage('ID da barbearia é obrigatório')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user: userData, barbershopId } = req.body;

    // Verificar se a barbearia existe
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId }
    });

    if (!barbershop) {
      return res.status(404).json({ message: 'Barbearia não encontrada' });
    }

    // Verificar se já existe uma solicitação pendente para este email e barbearia
    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        userEmail: userData.email,
        barbershopId: barbershopId,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Você já possui uma solicitação pendente para esta barbearia' });
    }

    // Hash da senha para armazenar temporariamente
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Criar solicitação de acesso
    const joinRequest = await prisma.joinRequest.create({
      data: {
        userEmail: userData.email,
        userFirstName: userData.firstName,
        userLastName: userData.lastName,
        userPhone: userData.phone,
        userCountry: userData.country,
        userPassword: hashedPassword, // Senha temporária hasheada
        barbershopId: barbershopId
      }
    });

    // Enviar notificação em tempo real para o admin da barbearia
    const io = req.app.get('io');
    if (io) {
      io.to(`barbershop-${barbershopId}`).emit('new-join-request', {
        type: 'NEW_REQUEST',
        message: `Nova solicitação de acesso de ${userData.firstName} ${userData.lastName}`,
        request: {
          id: joinRequest.id,
          userFirstName: userData.firstName,
          userLastName: userData.lastName,
          userEmail: userData.email,
          createdAt: joinRequest.createdAt
        }
      });
    }

    // TODO: Enviar email de notificação para o admin da barbearia

    res.status(201).json({
      message: 'Solicitação enviada com sucesso',
      requestId: joinRequest.id
    });

  } catch (error) {
    console.error('Erro ao enviar solicitação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar solicitação de acesso para juntar-se a uma barbearia
router.post('/register-join', [
  body('user.email').isEmail().withMessage('E-mail inválido'),
  body('user.firstName').notEmpty().withMessage('Nome é obrigatório'),
  body('user.lastName').notEmpty().withMessage('Sobrenome é obrigatório'),
  body('user.phone').notEmpty().withMessage('Telefone é obrigatório'),
  body('user.country').notEmpty().withMessage('País é obrigatório'),
  body('user.password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('barbershopId').notEmpty().withMessage('ID da barbearia é obrigatório')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user: userData, barbershopId } = req.body;

    // Verificar se o e-mail já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'E-mail já cadastrado' });
    }

    // Verificar se a barbearia existe
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId }
    });

    if (!barbershop) {
      return res.status(400).json({ message: 'Barbearia não encontrada' });
    }

    // Hash da senha para armazenar temporariamente
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Criar solicitação de acesso
    const joinRequest = await prisma.joinRequest.create({
      data: {
        userEmail: userData.email,
        userFirstName: userData.firstName,
        userLastName: userData.lastName,
        userPhone: userData.phone,
        userCountry: userData.country,
        userPassword: hashedPassword, // Senha temporária hasheada
        barbershopId: barbershop.id,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      message: 'Solicitação de acesso criada com sucesso. Aguarde a aprovação do administrador.',
      requestId: joinRequest.id,
      barbershopName: barbershop.name
    });

  } catch (error) {
    console.error('Erro ao criar solicitação de acesso:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar se email existe
router.post('/check-email', [
  body('email').isEmail().withMessage('E-mail inválido')
], async (req, res) => {
  try {
    console.log('🔍 Verificação de email iniciada');
    
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Erros de validação:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    console.log('📧 Email recebido:', email);

    // Buscar usuário
    console.log('🔍 Buscando usuário no banco...');
    const user = await prisma.user.findUnique({
      where: { email }
    });

    const exists = !!user;
    console.log('✅ Usuário encontrado:', exists);
    console.log('📤 Enviando resposta:', { exists });

    res.json({
      exists: exists
    });

  } catch (error) {
    console.error('❌ Erro ao verificar email:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        barbershop: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Usuário não encontrado ou inativo' });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Token válido',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
});

// ===== SOLICITAÇÕES DE ACESSO =====

// Verificar status de solicitação de acesso
router.get('/check-request-status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('🔍 Verificando status para email:', email);

    // Buscar a solicitação mais recente para este email
    const request = await prisma.joinRequest.findFirst({
      where: {
        userEmail: email
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        barbershop: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('🔍 Solicitação mais recente encontrada:', request);

    // Se não há solicitação, permitir login
    if (!request) {
      console.log('✅ Nenhuma solicitação encontrada, permitindo login');
      return res.json({ hasRequest: false });
    }

    console.log('🔍 Status da solicitação mais recente:', request.status);

    // Se a solicitação mais recente foi APROVADA, permitir login
    if (request.status === 'APPROVED') {
      console.log('✅ Solicitação aprovada, permitindo login');
      return res.json({ hasRequest: false });
    }

    // Se a solicitação mais recente foi PENDING ou REJECTED, mostrar modal
    console.log('❌ Solicitação pendente/rejeitada, mostrando modal');
    res.json({
      hasRequest: true,
      status: request.status,
      barbershopId: request.barbershopId,
      barbershopName: request.barbershop.name,
      createdAt: request.createdAt
    });
  } catch (error) {
    console.error('Erro ao verificar status da solicitação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});





// Alterar senha
router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    const { currentPassword, newPassword } = req.body;

    // Verificar senha atual
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidCurrentPassword) {
      return res.status(400).json({ message: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    res.json({ message: 'Senha alterada com sucesso' });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 