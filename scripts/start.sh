#!/bin/bash

# start.sh - Script para iniciar o Portfolio Backend
# Execute com: chmod +x start.sh && ./start.sh

set -e

echo "🚀 Iniciando Portfolio Backend..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto."
    exit 1
fi

echo "✅ Ambiente verificado"

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p uploads logs exports backups ssl storage tmp

# Criar .env se não existir
if [ ! -f ".env" ]; then
    echo "⚙️ Criando arquivo .env..."
    cp .env.example .env 2>/dev/null || cat > .env << 'EOF'
NODE_ENV=development
PORT=5000
BASE_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017/portfolio_development
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=8h
SESSION_SECRET=your-session-secret-change-this
SESSION_ENABLED=true
ADMIN_EMAIL=admin@portfolio.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador
LOG_LEVEL=info
EOF
fi

# Build do projeto
echo "🏗️ Fazendo build..."
npm run build

# Verificar se serviços estão rodando
echo "🔍 Verificando serviços..."

# Função para verificar se uma porta está aberta
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✅ $service está rodando na porta $port"
        return 0
    else
        echo "⚠️  $service não está rodando na porta $port"
        return 1
    fi
}

# Verificar MongoDB
if ! check_port 27017 "MongoDB"; then
    echo "🐳 Iniciando MongoDB com Docker..."
    if command -v docker &> /dev/null; then
        docker run -d -p 27017:27017 --name portfolio-mongodb mongo:6 2>/dev/null || echo "MongoDB container já existe"
        sleep 5
    else
        echo "⚠️  MongoDB não encontrado. Instale MongoDB ou Docker."
        echo "   Com Docker: docker run -d -p 27017:27017 --name mongodb mongo:6"
    fi
fi

# Verificar Redis (opcional)
if ! check_port 6379 "Redis"; then
    echo "🐳 Iniciando Redis com Docker (opcional)..."
    if command -v docker &> /dev/null; then
        docker run -d -p 6379:6379 --name portfolio-redis redis:7-alpine 2>/dev/null || echo "Redis container já existe"
        sleep 2
    else
        echo "ℹ️  Redis não encontrado (opcional). O sistema funcionará sem cache."
    fi
fi

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços..."
sleep 3

# Iniciar aplicação
echo "🚀 Iniciando servidor..."
echo ""
echo "🌐 URLs importantes:"
echo "   API: http://localhost:5000"
echo "   Docs: http://localhost:5000/docs"
echo "   Health: http://localhost:5000/health"
echo ""
echo "🔐 Login administrativo:"
echo "   Email: admin@portfolio.com"
echo "   Senha: admin123"
echo ""
echo "📋 Para parar: Ctrl+C"
echo ""

# Iniciar em modo desenvolvimento
npm run dev