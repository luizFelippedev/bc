# Portfolio Backend API

Sistema completo de backend para gerenciamento de portfolio profissional desenvolvido com Node.js, TypeScript, MongoDB e Redis.

## 🚀 Funcionalidades

- **API RESTful completa** com documentação Swagger
- **Autenticação JWT** para administradores
- **Gerenciamento de Projetos** com upload de imagens
- **Sistema de Certificados** com validação
- **Analytics e Métricas** em tempo real
- **Cache inteligente** com Redis
- **Sistema de Logs** avançado
- **Rate Limiting** e segurança
- **WebSocket** para notificações
- **Sistema de Backup** automatizado
- **Export de dados** (JSON/CSV)

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **MongoDB** 6+
- **Redis** 7+
- **npm** 8+

## 🛠️ Instalação Rápida

### 1. Clone e instale

```bash
git clone <seu-repositorio>
cd portfolio-backend
chmod +x scripts/fix-all-errors.sh
./scripts/fix-all-errors.sh
```

### 2. Configure o ambiente

Edite o arquivo `.env`:

```env
# Banco de dados
MONGODB_URI=mongodb://localhost:27017/portfolio

# JWT
JWT_SECRET=sua-chave-secreta-super-segura-aqui
JWT_EXPIRES_IN=8h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Servidor
PORT=5000
NODE_ENV=development

# Admin padrão
ADMIN_EMAIL=admin@portfolio.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador
```

### 3. Inicie os serviços

```bash
# MongoDB
mongod

# Redis  
redis-server

# Aplicação (em outro terminal)
npm run dev
```

### 4. Inicialize o sistema

```bash
# Criar usuário administrador
npm run init-admin

# Executar migrations (opcional)
npm run migrate
```

## 🌐 Endpoints da API

### Públicos
- `GET /` - Informações da API
- `GET /health` - Status da aplicação
- `GET /docs` - Documentação Swagger
- `GET /api/public/projects` - Listar projetos públicos
- `GET /api/public/projects/:slug` - Projeto por slug
- `GET /api/public/certificates` - Listar certificados
- `GET /api/public/configuration` - Configuração do site

### Autenticação
- `POST /api/auth/login` - Login de administrador
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/refresh` - Renovar token

### Administrativas (requer autenticação)
- `GET /api/admin/dashboard` - Dados do dashboard
- `GET /api/admin/projects` - Gerenciar projetos
- `POST /api/admin/projects` - Criar projeto
- `PUT /api/admin/projects/:id` - Atualizar projeto
- `DELETE /api/admin/projects/:id` - Deletar projeto
- `GET /api/admin/certificates` - Gerenciar certificados
- `GET /api/admin/analytics` - Estatísticas detalhadas

## 🔐 Autenticação

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portfolio.com","password":"admin123"}'
```

### Usar token nas requisições
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:5000/api/admin/dashboard
```

## 📁 Estrutura do Projeto

```
src/
├── config/          # Configurações
├── controllers/     # Controladores da API
├── middlewares/     # Middlewares Express
├── models/         # Modelos MongoDB
├── routes/         # Rotas da API
├── services/       # Serviços de negócio
├── utils/          # Utilitários
└── types/          # Tipos TypeScript

uploads/            # Arquivos enviados
logs/              # Logs da aplicação
exports/           # Exports de dados
backups/           # Backups
templates/         # Templates de email
```

## 🧪 Testes

```bash
# Todos os testes
npm test

# Testes com coverage
npm run test:coverage

# Testes de integração
npm run test:integration
```

## 📊 Monitoramento

### Health Check
```bash
curl http://localhost:5000/health
```

### Logs em tempo real
```bash
tail -f logs/combined.log
```

### Métricas Redis
```bash
redis-cli info stats
```

## 🐳 Docker (Opcional)

```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up

# Produção
docker-compose up
```

## 🚀 Deploy em Produção

### 1. Configurar variáveis de ambiente

```env
NODE_ENV=production
MONGODB_URI=mongodb://usuario:senha@host:port/database
REDIS_URL=redis://host:port
JWT_SECRET=chave-super-secreta-producao
```

### 2. Build e iniciar

```bash
npm run build
npm start
```

### 3. Processo com PM2

```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Servidor em modo desenvolvimento
npm run dev:debug        # Com debug habilitado

# Build
npm run build           # Compilar TypeScript
npm run typecheck       # Verificar tipos

# Qualidade de código
npm run lint            # Verificar código
npm run lint:fix        # Corrigir automaticamente
npm run format          # Formatar código

# Base de dados
npm run init-admin      # Criar usuário admin
npm run migrate         # Executar migrations
npm run seed           # Popular com dados exemplo

# Utilitários
npm run clean          # Limpar arquivos temporários
npm run health-check   # Verificar saúde da API
```

## 🛡️ Segurança

- **JWT** para autenticação
- **Rate limiting** por IP
- **Helmet** para headers de segurança
- **CORS** configurado
- **Validação** de dados com Joi
- **Sanitização** de inputs
- **Logs de auditoria**

## 📈 Performance

- **Cache** com Redis para consultas frequentes
- **Compressão** gzip nas respostas
- **Connection pooling** MongoDB
- **Índices** otimizados no banco
- **Rate limiting** para prevenir abuso

## 🔍 Troubleshooting

### Erro: MongoDB connection failed
```bash
# Verificar se MongoDB está rodando
mongod --version
sudo systemctl start mongod
```

### Erro: Redis connection failed
```bash
# Verificar se Redis está rodando
redis-cli ping
sudo systemctl start redis
```

### Erro: Permission denied nos uploads
```bash
chmod 755 uploads/
chmod 755 logs/
chmod 755 exports/
```

### Erro: Port already in use
```bash
# Matar processo na porta 5000
sudo lsof -ti:5000 | xargs kill -9
```

## 📝 Logs

Os logs são salvos em:
- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros
- `logs/exceptions.log` - Exceções não tratadas

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Consulte a documentação em `/docs`
- Verifique os logs em `logs/`

---

**Desenvolvido com ❤️ usando Node.js + TypeScript**