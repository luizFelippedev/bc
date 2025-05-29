#!/bin/sh
# ===== Docker Entrypoint Script =====

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo_info "Starting Portfolio Backend API..."
echo_info "Environment: ${NODE_ENV:-development}"
echo_info "Port: ${PORT:-5000}"

# Verificar variáveis de ambiente obrigatórias
check_required_env() {
    echo_info "Checking required environment variables..."
    
    local missing_vars=""
    
    if [ -z "$MONGODB_URI" ]; then
        missing_vars="$missing_vars MONGODB_URI"
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        missing_vars="$missing_vars JWT_SECRET"
    fi
    
    if [ -n "$missing_vars" ]; then
        echo_error "Missing required environment variables:$missing_vars"
        exit 1
    fi
    
    echo_success "All required environment variables are set"
}

# Esperar serviços dependentes
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local timeout=${4:-30}
    
    echo_info "Waiting for $service_name at $host:$port..."
    
    local count=0
    while ! nc -z $host $port; do
        count=$((count + 1))
        if [ $count -gt $timeout ]; then
            echo_error "Timeout waiting for $service_name"
            return 1
        fi
        echo_info "Attempt $count/$timeout - $service_name not ready, waiting..."
        sleep 1
    done
    
    echo_success "$service_name is ready!"
}

# Função para extrair host e porta do MongoDB URI
extract_mongo_details() {
    # Exemplo: mongodb://user:pass@host:port/db -> host:port
    if echo "$MONGODB_URI" | grep -q "@"; then
        # URI com autenticação
        echo "$MONGODB_URI" | sed -n 's|.*@\([^/]*\)/.*|\1|p'
    else
        # URI simples
        echo "$MONGODB_URI" | sed -n 's|mongodb://\([^/]*\)/.*|\1|p'
    fi
}

# Aguardar dependências
wait_for_dependencies() {
    # Extrair detalhes do MongoDB
    local mongo_details=$(extract_mongo_details)
    if [ -n "$mongo_details" ]; then
        local mongo_host=$(echo $mongo_details | cut -d: -f1)
        local mongo_port=$(echo $mongo_details | cut -d: -f2)
        
        # Se não tiver porta, usar padrão
        if [ "$mongo_port" = "$mongo_host" ]; then
            mongo_port="27017"
        fi
        
        wait_for_service "$mongo_host" "$mongo_port" "MongoDB" 60
    fi
    
    # Aguardar Redis se configurado
    if [ -n "$REDIS_HOST" ]; then
        local redis_port=${REDIS_PORT:-6379}
        wait_for_service "$REDIS_HOST" "$redis_port" "Redis" 30 || echo_warning "Redis not available, continuing without cache"
    fi
}

# Preparar diretórios
prepare_directories() {
    echo_info "Preparing directories..."
    
    mkdir -p logs uploads temp backups
    
    # Ajustar permissões se necessário
    if [ "$(id -u)" = "0" ]; then
        echo_warning "Running as root, adjusting permissions..."
        chown -R portfolio:nodejs logs uploads temp backups 2>/dev/null || true
    fi
    
    echo_success "Directories prepared"
}

# Executar migrations em produção
run_migrations() {
    if [ "$NODE_ENV" = "production" ]; then
        echo_info "Running database migrations..."
        
        # Tentar executar migrations com timeout
        timeout 60 node dist/scripts/migrate.js || {
            echo_warning "Migrations failed or timed out, continuing..."
        }
        
        echo_success "Migrations completed"
    fi
}

# Inicializar dados se necessário
initialize_data() {
    if [ "$NODE_ENV" = "production" ] && [ "$INIT_DATA" = "true" ]; then
        echo_info "Initializing application data..."
        
        # Executar seed com timeout
        timeout 60 node dist/scripts/seed.js || {
            echo_warning "Data initialization failed or timed out"
        }
        
        echo_success "Data initialization completed"
    fi
}

# Health check interno
health_check() {
    echo_info "Performing initial health check..."
    
    # Aguardar aplicação estar pronta
    local count=0
    local max_attempts=30
    
    while [ $count -lt $max_attempts ]; do
        if curl -f http://localhost:${PORT:-5000}/health >/dev/null 2>&1; then
            echo_success "Application is healthy!"
            return 0
        fi
        
        count=$((count + 1))
        echo_info "Health check attempt $count/$max_attempts..."
        sleep 2
    done
    
    echo_warning "Application health check failed, but continuing..."
    return 1
}

# Graceful shutdown handler
shutdown_handler() {
    echo_info "Received shutdown signal..."
    
    if [ -n "$APP_PID" ]; then
        echo_info "Stopping application (PID: $APP_PID)..."
        kill -TERM $APP_PID
        wait $APP_PID
    fi
    
    echo_success "Application stopped gracefully"
    exit 0
}

# Configurar signal handlers
trap shutdown_handler TERM INT

# Executar verificações e preparações
main() {
    check_required_env
    prepare_directories
    wait_for_dependencies
    run_migrations
    initialize_data
    
    echo_info "Starting application..."
    
    # Iniciar aplicação
    if [ "$NODE_ENV" = "development" ]; then
        echo_info "Starting in development mode with nodemon..."
        exec nodemon --inspect=0.0.0.0:9229 src/index.ts
    else
        echo_info "Starting in production mode..."
        node dist/index.js &
        APP_PID=$!
        
        # Aguardar um pouco e fazer health check
        sleep 5
        health_check &
        
        # Aguardar o processo principal
        wait $APP_PID
    fi
}

# Verificar se netcat está disponível
if ! command -v nc >/dev/null 2>&1; then
    echo_warning "netcat not available, skipping service wait checks"
    
    # Definir função vazia para wait_for_service
    wait_for_service() {
        echo_info "Skipping wait for $3 (netcat not available)"
        sleep 2
    }
fi

# Verificar se curl está disponível
if ! command -v curl >/dev/null 2>&1; then
    echo_warning "curl not available, skipping health checks"
    
    # Definir função vazia para health_check
    health_check() {
        echo_info "Skipping health check (curl not available)"
        return 0
    }
fi

# Executar aplicação
main "$@"