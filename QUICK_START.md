# 🚀 Guia de Início Rápido

Siga estes passos para ter o Portfolio Backend funcionando em poucos minutos!

## Método 1: Setup Automático (Mais Rápido) ⚡

```bash
# 1. Clone e entre no diretório
git clone <repository-url>
cd portfolio-backend

# 2. Execute o setup automático
node scripts/setup.js

# 3. Configure o .env (edite apenas se necessário)
# O arquivo já vem pré-configurado para desenvolvimento

# 4. Inicie os serviços com Docker (recomendado)
docker-compose -f docker-compose.simple.yml up -d

# 5. Inicie o servidor
npm run dev
```

✅ **Pronto!** Acesse http://localhost:5000

## Método 2: Passo a Passo Manual 🔧

### Passo 1: Preparação
```bash
# Clone o repositório
git clone <repository-url>
cd portfolio-backend

# Instale as dependências
npm install

# Crie os diretórios necessários
mkdir -p uploads logs exports backups ssl storage tmp
```

### Passo 2: Configuração
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env com suas configurações (opcional para desenvolvimento)
nano .env
```

### Passo 3: Serviços
Escolha uma opção:

**Opção A: Docker (Recomendado)**
```bash
# Apenas MongoDB e Redis
docker-compose -f docker-compose.simple.yml up -d

# Verificar se estão rodando
docker ps
```

**Opção B: Serviços Locais**
```bash
# MongoDB
mongod --dbpath ./data/db

# Redis (em outro terminal)
redis-server
```

### Passo 4: Build e Execução
```bash
# Build do projeto
npm run build

# Iniciar servidor
npm run dev
```

## Verificação ✅

1. **API funcionando**: http://localhost:5000
2. **Health check**: http://localhost:5000/health
3. **Documentação**: http://localhost:5000/docs
4. **Projetos públicos**: http://localhost:5000/api/public/projects

## Login Administrativo 🔐

- **URL**: http://localhost:5000/api/auth/login
- **Email**: admin@portfolio.com
- **Senha**: admin123

## Solução de Problemas 🔧

### Erro: "Cannot find module"
```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: MongoDB connection
```bash
# Verifique se MongoDB está rodando
docker ps
# ou
ps aux | grep mongod

# Se necessário, inicie MongoDB
docker-compose -f docker-compose.simple.yml up -d mongodb
```

### Erro: Redis connection
```bash
# Redis é opcional, mas se quiser usar:
docker-compose -f docker-compose.simple.yml up -d redis
```

### Erro: Port already in use
```bash
# Verifique qual processo está usando a porta
lsof -i :5000

# Mate o processo se necessário
kill -9 <PID>
```

### Erro: Permission denied
```bash
# Ajuste as permissões dos diretórios
chmod 755 uploads logs exports backups storage tmp
chmod 700 ssl
```

## Comandos Úteis 📋

```bash
# Desenvolvimento
npm run dev              # Servidor desenvolvimento
npm run dev:debug        # Com debug
npm run build            # Build produção

# Testes
npm test                 # Executar testes
npm run test:coverage    # Com cobertura

# Qualidade
npm run lint             # Verificar código
npm run format           # Formatar código

# Database
npm run init-admin       # Criar admin
npm run migrate          # Migrations
npm run seed             # Dados exemplo

# Docker
npm run docker:dev       # Ambiente completo
docker-compose -f docker-compose.simple.yml up -d  # Apenas serviços
```

## Próximos Passos 🎯

1. **Personalize** o .env com suas configurações
2. **Teste** os endpoints na documentação (/docs)
3. **Desenvolva** suas funcionalidades
4. **Deploy** usando Docker ou serviços cloud

## Interfaces Admin (Opcionais) 🖥️

Se você iniciou com `docker-compose.simple.yml`:

- **MongoDB Admin**: http://localhost:8081 (admin/admin)
- **Redis Admin**: http://localhost:8082

## Dicas 💡

- Use **VS Code** com extensões TypeScript e ESLint
- Mantenha o **servidor em modo watch** com `npm run dev`
- Monitore **logs em tempo real** com `tail -f logs/combined.log`
- Use **Postman** ou **Insomnia** para testar APIs
- Acesse **/docs** para documentação interativa

---

**🎉 Parabéns! Seu Portfolio Backend está funcionando!**

Para dúvidas, consulte o [README.md](README.md) completo ou abra uma issue.