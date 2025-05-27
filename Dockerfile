# Multi-stage build para otimização de produção
FROM node:18-alpine AS base

# Instalar dependências necessárias para módulos nativos
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    dumb-init

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./

# ================================
# Estágio de desenvolvimento
# ================================
FROM base AS development

# Instalar todas as dependências (incluindo devDependencies)
RUN npm ci --include=dev

# Copiar código fonte
COPY . .

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Criar diretórios necessários com permissões
RUN mkdir -p uploads logs exports backups && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

CMD ["dumb-init", "npm", "run", "dev"]

# ================================
# Estágio de build
# ================================
FROM base AS build

# Instalar apenas dependencies de produção
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Instalar devDependencies temporariamente para build
RUN npm ci --include=dev --ignore-scripts

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build && \
    npm prune --production && \
    rm -rf src tests *.md *.json.example

# ================================
# Estágio de produção
# ================================
FROM node:18-alpine AS production

# Instalar dumb-init para gerenciamento de processos
RUN apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar aplicação buildada
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./

# Copiar templates e arquivos estáticos necessários
COPY --chown=nodejs:nodejs templates ./templates
COPY --chown=nodejs:nodejs migrations ./migrations

# Criar diretórios necessários com permissões corretas
RUN mkdir -p uploads logs exports backups && \
    chown -R nodejs:nodejs uploads logs exports backups

# Mudar para usuário não-root
USER nodejs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Usar dumb-init para gerenciamento adequado de sinais
CMD ["dumb-init", "node", "dist/index.js"]

# ================================
# Estágio de teste
# ================================
FROM development AS test

# Instalar dependências de teste
RUN npm ci --include=dev

# Copiar configurações de teste
COPY jest.config.js ./
COPY jest.integration.config.js ./

# Executar testes
CMD ["npm", "test"]