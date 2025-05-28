# ================================
# Estágio base
# ================================
FROM node:18-alpine AS base

# Instalar dependências para pacotes nativos
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
RUN npm ci --include=dev --ignore-scripts && \
    npm cache clean --force

# Copiar código fonte
COPY . .

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Criar diretórios com permissões apropriadas
RUN mkdir -p uploads logs exports backups && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Health check (modo dev)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

CMD ["dumb-init", "npm", "run", "dev"]

# ================================
# Estágio de build
# ================================
FROM base AS build

# Instalar todas as dependências (para build)
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
FROM base AS production

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar aplicação já buildada do estágio anterior
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./

# Copiar arquivos extras necessários
COPY --chown=nodejs:nodejs templates ./templates
COPY --chown=nodejs:nodejs migrations ./migrations

# Criar diretórios com permissões corretas
RUN mkdir -p uploads logs exports backups && \
    chown -R nodejs:nodejs uploads logs exports backups

USER nodejs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

CMD ["dumb-init", "node", "dist/index.js"]

# ================================
# Estágio de teste
# ================================
FROM development AS test

# Copiar configs de teste
COPY jest.config.js ./
COPY jest.integration.config.js ./

CMD ["npm", "test"]
