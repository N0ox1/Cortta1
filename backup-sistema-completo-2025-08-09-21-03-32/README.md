# Barbearia SaaS - Plataforma de Agendamento Online

Uma plataforma SaaS completa para barbearias gerenciarem seus agendamentos online, com sistema multi-tenant e painel administrativo master.

## 🚀 Características

- **Multi-tenancy**: Cada barbearia tem sua própria URL única (`/:barbershopSlug`)
- **Painel Admin Master**: Gestão centralizada de todas as barbearias
- **Agendamento Online**: Sistema público de agendamento para clientes
- **Gestão Financeira**: Controle de pagamentos e assinaturas
- **Dashboard Analytics**: Métricas e relatórios em tempo real
- **Interface Responsiva**: Design moderno e adaptável

## 🏗️ Arquitetura

### Backend
- **Node.js** com Express
- **PostgreSQL** com Prisma ORM
- **JWT** para autenticação
- **Multi-tenant** com isolamento de dados
- **Rate limiting** e segurança

### Frontend
- **React** com React Router
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **React Hook Form** para formulários
- **Recharts** para gráficos
- **React Hot Toast** para notificações

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <repository-url>
cd barbearia-saas
```

### 2. Instale as dependências
```bash
npm run install-all
```

### 3. Configure o banco de dados

Crie um arquivo `.env` na pasta `backend/`:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/barbearia_saas"

# JWT
JWT_SECRET="sua-chave-secreta-muito-segura-aqui"

# Server
PORT=5000
NODE_ENV=development

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"

# App
APP_URL="http://localhost:3000"
```

### 4. Configure o banco PostgreSQL
```bash
# Crie o banco de dados
createdb barbearia_saas

# Execute as migrações
cd backend
npm run db:push

# Popule com dados iniciais
npm run db:seed
```

### 5. Inicie a aplicação
```bash
# Desenvolvimento (frontend + backend)
npm run dev

# Ou separadamente:
npm run server  # Backend na porta 5000
npm run client  # Frontend na porta 3000
```

## 🔐 Credenciais de Acesso

Após executar o seed, você terá acesso com:

### Super Admin (Painel Master)
- **Email**: `admin@barbeariasaas.com`
- **Senha**: `admin123`

### Barbearias de Exemplo
- **Barbearia João Silva**
  - Admin: `joao@barbearia.com` / `123456`
  - Barbeiros: `barbeiro1@barbearia-joao-silva.com` / `123456`

- **Barbearia Pedro Santos**
  - Admin: `pedro@barbearia.com` / `123456`
  - Barbeiros: `barbeiro1@barbearia-pedro-santos.com` / `123456`

## 📱 Telas Principais

### 1. Painel Admin Master
- **Dashboard**: Métricas gerais, top barbearias, faturamento
- **Gestão de Barbearias**: Lista, edição, bloqueio/desbloqueio
- **Gestão Financeira**: Pagamentos, cobranças, relatórios
- **Configurações**: Taxas, e-mails, configurações do sistema

### 2. URLs das Barbearias
- **Público**: `http://localhost:3000/barbearia-joao-silva`
- **Agendamento**: Sistema público de agendamento
- **Serviços**: Lista de serviços disponíveis
- **Barbeiros**: Profissionais disponíveis

## 🗄️ Estrutura do Banco

### Principais Tabelas
- **users**: Usuários do sistema (SUPER_ADMIN, BARBERSHOP_ADMIN, BARBER)
- **barbershops**: Barbearias (tenants)
- **services**: Serviços oferecidos
- **clients**: Clientes das barbearias
- **appointments**: Agendamentos
- **payments**: Pagamentos e cobranças
- **system_configs**: Configurações do sistema

## 🔧 Scripts Disponíveis

### Root
```bash
npm run dev          # Desenvolvimento completo
npm run server       # Apenas backend
npm run client       # Apenas frontend
npm run install-all  # Instala todas as dependências
npm run build        # Build do frontend
npm run start        # Produção
```

### Backend
```bash
npm run dev          # Desenvolvimento com nodemon
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Sincronizar schema
npm run db:migrate   # Executar migrações
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular banco com dados
```

## 🌐 URLs da Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Prisma Studio**: http://localhost:5555 (após `npm run db:studio`)

## 🔒 Segurança

- **JWT Tokens** para autenticação
- **Role-based access control** (RBAC)
- **Rate limiting** para APIs
- **Helmet** para headers de segurança
- **CORS** configurado
- **Validação** de dados com express-validator

## 📊 Funcionalidades

### Admin Master
- ✅ Dashboard com métricas
- ✅ Gestão de barbearias
- ✅ Controle financeiro
- ✅ Configurações do sistema
- ✅ Bloqueio/desbloqueio de barbearias

### Barbearias
- ✅ Cadastro e configuração
- ✅ Gestão de serviços
- ✅ Controle de barbeiros
- ✅ Agendamentos
- ✅ Clientes

### Público
- ✅ Agendamento online
- ✅ Visualização de serviços
- ✅ Seleção de barbeiros
- ✅ Horários disponíveis

## 🚀 Deploy

### Backend (Railway/Heroku)
```bash
# Configure as variáveis de ambiente
DATABASE_URL=...
JWT_SECRET=...
NODE_ENV=production

# Deploy
npm run build
npm start
```

### Frontend (Vercel/Netlify)
```bash
# Configure a API URL
REACT_APP_API_URL=https://seu-backend.railway.app

# Build e deploy
npm run build
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, envie um e-mail para `suporte@barbeariasaas.com` ou abra uma issue no GitHub.

---

**Desenvolvido com ❤️ para barbearias** 