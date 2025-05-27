# Portfolio Backend API

Sistema completo de backend para portfolio profissional desenvolvido em Node.js com TypeScript, MongoDB, Redis e Socket.IO.

## 🚀 Características

- **API RESTful completa** com TypeScript
- **Autenticação JWT** segura para administradores
- **Cache Redis** para performance otimizada
- **Upload de arquivos** com otimização de imagens
- **WebSockets** para comunicação em tempo real
- **Sistema de Analytics** detalhado
- **Documentação Swagger** automática
- **Containerização Docker** completa
- **Testes automatizados** integrados
- **Logs estruturados** com Winston
- **Rate Limiting** avançado
- **Sistema de backup** automático

## 📋 Pré-requisitos

- Node.js 18+ 
- MongoDB 6+
- Redis 7+
- Docker e Docker Compose (opcional)

## 🛠️ Instalação

### Método 1: Instalação Local

1. **Clone o repositório**
```bash
git clone https://github.com/your-username/portfolio-backend.git
cd portfolio-backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Inicie os serviços necessários**
```bash
# MongoDB
mongod

# Redis
redis-server
```

5. **Execute as migrations e seeds**
```bash
npm run migrate
npm run init-admin
```

6. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

### Método 2: Docker

1. **Clone e configure**
```bash
git clone https://github.com/your-username/portfolio-backend.git
cd portfolio-backend
cp .env.example .env
```

2. **Inicie com Docker Compose**
```bash
# Desenvolvimento
npm run docker:dev

# Produção
npm run docker:prod
```

## 📚 Documentação da API

Após iniciar o servidor, acesse:
- **Swagger UI**: http://localhost:5000/docs
- **Health Check**: http://localhost:5000/health

## 🔐 Autenticação

### Login de Administrador
```bash
POST /api/auth/login
{
  "email": "admin@portfolio.com",
  "password": "admin123"
}
```

### Usar Token nas Requisições
```bash
Authorization: Bearer <seu-jwt-token>
```

## 📡 Endpoints Principais

### Públicos
- `GET /api/public/projects` - Lista projetos públicos
- `GET /api/public/projects/:slug` - Detalhes do projeto
- `GET /api/public/certificates` - Lista certificados
- `GET /api/public/configuration` - Configurações do site
- `POST /api/public/analytics/track` - Rastrear eventos

### Administrativos
- `GET /api/admin/dashboard` - Dashboard com estatísticas
- `GET /api/admin/projects` - CRUD de projetos
- `GET /api/admin/certificates` - CRUD de certificados
- `GET /api/admin/analytics` - Analytics detalhadas
- `PUT /api/admin/configuration` - Configurações do site

## 🏗️ Estrutura do Projeto

```
src/
├── config/           # Configurações (DB, Redis, etc.)
├── controllers/      # Controladores da API
├── middlewares/      # Middlewares personalizados
├── models/          # Modelos do MongoDB
├── routes/          # Definições de rotas
├── services/        # Serviços e lógica de negócio
├── utils/           # Utilitários e helpers
├── types/           # Definições de tipos TypeScript
├── scripts/         # Scripts de manutenção
└── index.ts         # Ponto de entrada
```

## 🧪 Testes

```bash
# Todos os testes
npm test

# Testes com watch mode
npm run test:watch

# Testes de integração
npm run test:integration

# Cobertura de testes
npm run test:coverage
```

## 📊 Monitoramento e Analytics

### Health Check
```bash
GET /health
```

### Métricas em Tempo Real
```bash
GET /api/admin/realtime
```

### Analytics Detalhadas
```bash
GET /api/admin/analytics?startDate=2024-01-01&endDate=2024-12-31
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor com hot reload
npm run build           # Build para produção
npm start              # Servidor de produção

# Qualidade de código
npm run lint           # ESLint
npm run lint:fix       # Corrigir problemas do ESLint
npm run format         # Prettier
npm run typecheck      # Verificação de tipos

# Banco de dados
npm run migrate        # Executar migrations
npm run init-admin     # Criar usuário admin inicial
npm run seed           # Popular com dados de exemplo

# Docker
npm run docker:dev     # Ambiente de desenvolvimento
npm run docker:prod    # Ambiente de produção
npm run docker:down    # Parar containers
```

## 🏠 Variáveis de Ambiente

Consulte o arquivo `.env.example` para todas as variáveis disponíveis.

### Obrigatórias
- `NODE_ENV` - Ambiente (development/production)
- `PORT` - Porta do servidor
- `MONGODB_URI` - URI de conexão MongoDB
- `JWT_SECRET` - Chave secreta JWT

### Opcionais
- `REDIS_HOST` - Host Redis (padrão: localhost)
- `EMAIL_*` - Configurações de email
- `AWS_*` - Configurações AWS S3
- `GOOGLE_CLOUD_*` - Google Cloud Storage

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- Rate limiting por IP e usuário
- Validação de entrada com Joi
- Headers de segurança com Helmet
- Sanitização de dados
- Logs de auditoria
- CORS configurável

## 🚀 Deploy

### Heroku
```bash
# Adicionar buildpacks
heroku buildpacks:add heroku/nodejs

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

### DigitalOcean/AWS
1. Configure as variáveis de ambiente
2. Use Docker Compose para produção
3. Configure proxy reverso (Nginx)
4. Configure SSL/TLS

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- 📧 Email: dev@portfolio.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/portfolio-backend/issues)
- 📖 Docs: [API Documentation](http://localhost:5000/docs)

## 🎯 Roadmap

- [ ] Sistema de notificações push
- [ ] Integração com redes sociais
- [ ] Sistema de comentários
- [ ] Dashboard de métricas avançadas
- [ ] API GraphQL
- [ ] Integração com CMS
- [ ] Sistema de templates
- [ ] Multi-idiomas (i18n)

---

⭐ **Se este projeto foi útil, não esqueça de dar uma estrela!**