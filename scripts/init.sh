#!/bin/bash

# =============================================================================
# Portfolio Backend - Script de Inicialização Completa
# =============================================================================
# Este script configura completamente o ambiente de desenvolvimento/produção
# Executar com: chmod +x scripts/init.sh && ./scripts/init.sh
# =============================================================================

set -e  # Parar execução em caso de erro

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/logs/init.log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emoji para diferentes tipos de mensagem
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
GEAR="⚙️"
FOLDER="📁"
PACKAGE="📦"
DATABASE="💾"
CACHE="🗄️"
SECURITY="🔒"
DOCKER="🐳"
TEST="🧪"
FIRE="🔥"

# =============================================================================
# FUNÇÕES UTILITÁRIAS
# =============================================================================

# Função para logging
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}${INFO} ${message}${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}${SUCCESS} ${message}${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}${WARNING} ${message}${NC}"
            ;;
        "ERROR")
            echo -e "${RED}${ERROR} ${message}${NC}"
            ;;
        "TITLE")
            echo ""
            echo -e "${PURPLE}${ROCKET} ${message}${NC}"
            echo "============================================="
            ;;
    esac
    
    # Salvar no arquivo de log
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar se porta está ocupada
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Aguardar serviço ficar disponível
wait_for_service() {
    local service_name=$1
    local host=${2:-localhost}
    local port=$3
    local max_attempts=${4:-30}
    local attempt=0
    
    log "INFO" "Aguardando $service_name ($host:$port) ficar disponível..."
    
    while [ $attempt -lt $max_attempts ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            log "SUCCESS" "$service_name está disponível!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log "INFO" "Tentativa $attempt/$max_attempts - aguardando $service_name..."
        sleep 2
    done
    
    log "ERROR" "$service_name não ficou disponível após $max_attempts tentativas"
    return 1
}

# Verificar espaço em disco
check_disk_space() {
    local required_gb=${1:-2}
    local available_gb=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    
    if [ "$available_gb" -lt "$required_gb" ]; then
        log "WARNING" "Espaço em disco baixo: ${available_gb}GB disponível (mínimo: ${required_gb}GB)"
        return 1
    else
        log "SUCCESS" "Espaço em disco OK: ${available_gb}GB disponível"
        return 0
    fi
}

# =============================================================================
# VERIFICAÇÕES PRÉ-REQUISITOS
# =============================================================================

check_prerequisites() {
    log "TITLE" "Verificando Pré-requisitos"
    
    local missing_deps=()
    
    # Node.js
    if command_exists node; then
        local node_version=$(node --version | sed 's/v//')
        local node_major=$(echo $node_version | cut -d. -f1)
        
        if [ "$node_major" -ge 18 ]; then
            log "SUCCESS" "Node.js $node_version encontrado"
        else
            log "ERROR" "Node.js 18+ necessário. Versão atual: $node_version"
            missing_deps+=("nodejs>=18")
        fi
    else
        log "ERROR" "Node.js não encontrado"
        missing_deps+=("nodejs")
    fi
    
    # npm
    if command_exists npm; then
        local npm_version=$(npm --version)
        log "SUCCESS" "npm $npm_version encontrado"
    else
        log "ERROR" "npm não encontrado"
        missing_deps+=("npm")
    fi
    
    # MongoDB
    if command_exists mongod; then
        log "SUCCESS" "MongoDB encontrado"
    elif command_exists docker; then
        log "INFO" "MongoDB não encontrado localmente, mas Docker disponível"
    else
        log "WARNING" "MongoDB não encontrado (pode usar Docker)"
        missing_deps+=("mongodb ou docker")
    fi
    
    # Redis
    if command_exists redis-server; then
        log "SUCCESS" "Redis encontrado"
    elif command_exists docker; then
        log "INFO" "Redis não encontrado localmente, mas Docker disponível"
    else
        log "WARNING" "Redis não encontrado (pode usar Docker)"
        missing_deps+=("redis ou docker")
    fi
    
    # Git
    if command_exists git; then
        log "SUCCESS" "Git encontrado"
    else
        log "WARNING" "Git não encontrado"
    fi
    
    # Docker (opcional)
    if command_exists docker; then
        log "SUCCESS" "Docker encontrado"
        if command_exists docker-compose; then
            log "SUCCESS" "Docker Compose encontrado"
        else
            log "WARNING" "Docker Compose não encontrado"
        fi
    else
        log "INFO" "Docker não encontrado (opcional)"
    fi
    
    # Verificar espaço em disco
    check_disk_space 3
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log "ERROR" "Dependências obrigatórias não encontradas:"
        printf '%s\n' "${missing_deps[@]}" | sed 's/^/  - /'
        echo ""
        log "INFO" "Instale as dependências e execute novamente"
        exit 1
    fi
    
    log "SUCCESS" "Todos os pré-requisitos verificados!"
}

# =============================================================================
# CONFIGURAÇÃO DE DIRETÓRIOS
# =============================================================================

setup_directories() {
    log "TITLE" "Configurando Estrutura de Diretórios"
    
    cd "$PROJECT_ROOT"
    
    local directories=(
        "logs"
        "uploads"
        "uploads/images"
        "uploads/documents"
        "uploads/temp"
        "exports"
        "backups"
        "backups/mongodb"
        "backups/files"
        "ssl"
        "docs"
        "docs/api"
        "docs/images"
        "templates"
        "templates/email"
        "templates/reports"
        "migrations"
        "tests/unit"
        "tests/integration"
        "tests/fixtures"
        "scripts"
        "public"
        "storage"
        "storage/cache"
        "storage/sessions"
        "tmp"
        "coverage"
        "monitoring"
        "monitoring/prometheus"
        "monitoring/grafana"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log "SUCCESS" "Criado diretório: $dir"
        else
            log "INFO" "Diretório já existe: $dir"
        fi
    done
    
    # Criar arquivos .gitkeep para manter diretórios vazios no Git
    local gitkeep_dirs=(
        "uploads" "exports" "backups" "ssl" "logs" 
        "docs" "storage" "public" "tmp"
    )
    
    for dir in "${gitkeep_dirs[@]}"; do
        if [ ! -f "$dir/.gitkeep" ]; then
            touch "$dir/.gitkeep"
            log "SUCCESS" "Criado .gitkeep em $dir"
        fi
    done
    
    # Definir permissões corretas
    chmod 755 uploads/ exports/ backups/ logs/ storage/ tmp/
    chmod 700 ssl/ # SSL certificates devem ser mais restritivos
    
    log "SUCCESS" "Estrutura de diretórios configurada!"
}

# =============================================================================
# CONFIGURAÇÃO DE ARQUIVOS
# =============================================================================

setup_config_files() {
    log "TITLE" "Configurando Arquivos de Configuração"
    
    cd "$PROJECT_ROOT"
    
    # .env
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log "SUCCESS" "Arquivo .env criado a partir de .env.example"
        else
            log "WARNING" "Arquivo .env.example não encontrado"
        fi
    else
        log "INFO" "Arquivo .env já existe"
    fi
    
    # .gitignore
    if [ ! -f ".gitignore" ]; then
        log "INFO" "Criando .gitignore básico..."
        cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*

# Environment variables
.env
.env.local
.env.*.local

# Build output
dist/
build/

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/
.nyc_output/

# Uploads and generated files
uploads/*
!uploads/.gitkeep
exports/*
!exports/.gitkeep
backups/*
!backups/.gitkeep
ssl/*
!ssl/.gitkeep
tmp/*
!tmp/.gitkeep

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
Thumbs.db

# Database
*.sqlite
*.db
EOF
        log "SUCCESS" "Arquivo .gitignore criado"
    fi
    
    # package.json (verificar se existe)
    if [ ! -f "package.json" ]; then
        log "ERROR" "package.json não encontrado!"
        exit 1
    fi
    
    # tsconfig.json (verificar se existe)
    if [ ! -f "tsconfig.json" ]; then
        log "WARNING" "tsconfig.json não encontrado"
    fi
    
    log "SUCCESS" "Arquivos de configuração prontos!"
}

# =============================================================================
# INSTALAÇÃO DE DEPENDÊNCIAS
# =============================================================================

install_dependencies() {
    log "TITLE" "Instalando Dependências"
    
    cd "$PROJECT_ROOT"
    
    # Limpar cache npm
    log "INFO" "Limpando cache do npm..."
    npm cache clean --force
    
    # Instalar dependências
    log "INFO" "Instalando dependências do projeto..."
    if npm install; then
        log "SUCCESS" "Dependências instaladas com sucesso!"
    else
        log "ERROR" "Falha na instalação das dependências"
        exit 1
    fi
    
    # Verificar vulnerabilidades
    log "INFO" "Verificando vulnerabilidades de segurança..."
    npm audit --audit-level=high || log "WARNING" "Vulnerabilidades encontradas - execute 'npm audit fix'"
    
    # Configurar husky se Git estiver disponível
    if [ -d ".git" ] && command_exists git; then
        log "INFO" "Configurando Git hooks com Husky..."
        npm run prepare || log "WARNING" "Falha ao configurar Husky"
    fi
    
    log "SUCCESS" "Instalação de dependências concluída!"
}

# =============================================================================
# CONFIGURAÇÃO DE SERVIÇOS
# =============================================================================

setup_services() {
    log "TITLE" "Configurando Serviços (MongoDB e Redis)"
    
    local use_docker=false
    
    # Verificar se deve usar Docker
    if command_exists docker && command_exists docker-compose; then
        read -p "Usar Docker para MongoDB e Redis? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            use_docker=true
        fi
    fi
    
    if [ "$use_docker" = true ]; then
        setup_docker_services
    else
        setup_local_services
    fi
}

setup_docker_services() {
    log "INFO" "Configurando serviços com Docker..."
    
    cd "$PROJECT_ROOT"
    
    # Verificar se docker-compose.dev.yml existe
    if [ ! -f "docker-compose.dev.yml" ]; then
        log "ERROR" "docker-compose.dev.yml não encontrado"
        return 1
    fi
    
    # Parar containers existentes
    log "INFO" "Parando containers existentes..."
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    # Iniciar serviços
    log "INFO" "Iniciando MongoDB e Redis com Docker..."
    if docker-compose -f docker-compose.dev.yml up -d mongodb redis; then
        log "SUCCESS" "Serviços Docker iniciados!"
        
        # Aguardar serviços ficarem disponíveis
        wait_for_service "MongoDB" "localhost" 27017
        wait_for_service "Redis" "localhost" 6379
    else
        log "ERROR" "Falha ao iniciar serviços Docker"
        return 1
    fi
}

setup_local_services() {
    log "INFO" "Verificando serviços locais..."
    
    # MongoDB
    if command_exists mongod; then
        if check_port 27017; then
            log "SUCCESS" "MongoDB já está rodando na porta 27017"
        else
            log "INFO" "Iniciando MongoDB..."
            # Tentar iniciar MongoDB como serviço do sistema
            if command_exists systemctl; then
                sudo systemctl start mongod || log "WARNING" "Não foi possível iniciar MongoDB via systemctl"
            fi
        fi
    fi
    
    # Redis
    if command_exists redis-server; then
        if check_port 6379; then
            log "SUCCESS" "Redis já está rodando na porta 6379"
        else
            log "INFO" "Iniciando Redis..."
            # Tentar iniciar Redis como serviço do sistema
            if command_exists systemctl; then
                sudo systemctl start redis || log "WARNING" "Não foi possível iniciar Redis via systemctl"
            fi
        fi
    fi
}

# =============================================================================
# CONFIGURAÇÃO DO BANCO DE DADOS
# =============================================================================

setup_database() {
    log "TITLE" "Configurando Banco de Dados"
    
    cd "$PROJECT_ROOT"
    
    # Aguardar MongoDB estar disponível
    if ! wait_for_service "MongoDB" "localhost" 27017 15; then
        log "ERROR" "MongoDB não está disponível"
        return 1
    fi
    
    # Executar migrations
    log "INFO" "Executando migrations..."
    if npm run migrate; then
        log "SUCCESS" "Migrations executadas com sucesso!"
    else
        log "WARNING" "Falha ao executar migrations (pode ser normal na primeira execução)"
    fi
    
    # Criar usuário administrador
    log "INFO" "Criando/verificando usuário administrador..."
    if npm run init-admin; then
        log "SUCCESS" "Usuário administrador configurado!"
    else
        log "WARNING" "Falha ao configurar usuário administrador"
    fi
    
    # Popular com dados de exemplo (opcional)
    read -p "Deseja popular o banco com dados de exemplo? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "INFO" "Populando banco com dados de exemplo..."
        if npm run seed; then
            log "SUCCESS" "Dados de exemplo inseridos!"
        else
            log "WARNING" "Falha ao inserir dados de exemplo"
        fi
    fi
    
    log "SUCCESS" "Configuração do banco de dados concluída!"
}

# =============================================================================
# TESTES
# =============================================================================

run_tests() {
    log "TITLE" "Executando Testes"
    
    cd "$PROJECT_ROOT"
    
    # Verificar se existem testes
    if [ ! -d "tests" ] && [ ! -f "jest.config.js" ]; then
        log "WARNING" "Nenhum teste encontrado, pulando..."
        return 0
    fi
    
    # Executar linting
    log "INFO" "Verificando código com ESLint..."
    if npm run lint; then
        log "SUCCESS" "Código passou na verificação do ESLint!"
    else
        log "WARNING" "Problemas encontrados no ESLint"
    fi
    
    # Executar testes unitários
    log "INFO" "Executando testes unitários..."
    if npm run test; then
        log "SUCCESS" "Todos os testes passaram!"
    else
        log "WARNING" "Alguns testes falharam"
    fi
    
    log "SUCCESS" "Verificação de testes concluída!"
}

# =============================================================================
# BUILD E VERIFICAÇÃO
# =============================================================================

build_project() {
    log "TITLE" "Fazendo Build do Projeto"
    
    cd "$PROJECT_ROOT"
    
    # Build TypeScript
    log "INFO" "Compilando TypeScript..."
    if npm run build; then
        log "SUCCESS" "Build concluído com sucesso!"
    else
        log "ERROR" "Falha no build"
        return 1
    fi
    
    # Verificar arquivos gerados
    if [ -d "dist" ]; then
        local file_count=$(find dist -name "*.js" | wc -l)
        log "SUCCESS" "Build gerou $file_count arquivos JavaScript"
    else
        log "ERROR" "Diretório 'dist' não foi criado"
        return 1
    fi
}

# =============================================================================
# VERIFICAÇÃO FINAL
# =============================================================================

health_check() {
    log "TITLE" "Verificação de Saúde do Sistema"
    
    cd "$PROJECT_ROOT"
    
    # Iniciar aplicação em background para teste
    log "INFO" "Iniciando aplicação para teste..."
    npm run dev &
    local app_pid=$!
    
    # Aguardar aplicação ficar disponível
    sleep 10
    
    if wait_for_service "Aplicação" "localhost" 5000 15; then
        # Testar endpoint de health
        log "INFO" "Testando endpoint de saúde..."
        if curl -f http://localhost:5000/health >/dev/null 2>&1; then
            log "SUCCESS" "Endpoint de saúde OK!"
        else
            log "WARNING" "Endpoint de saúde não respondeu"
        fi
        
        # Testar endpoint da API
        log "INFO" "Testando API..."
        if curl -f http://localhost:5000/api/public/configuration >/dev/null 2>&1; then
            log "SUCCESS" "API pública OK!"
        else
            log "WARNING" "API pública não respondeu"
        fi
    else
        log "ERROR" "Aplicação não ficou disponível"
    fi
    
    # Parar aplicação de teste
    kill $app_pid 2>/dev/null || true
    sleep 2
    
    log "SUCCESS" "Verificação de saúde concluída!"
}

# =============================================================================
# RELATÓRIO FINAL
# =============================================================================

generate_report() {
    log "TITLE" "Relatório de Inicialização"
    
    local report_file="$PROJECT_ROOT/docs/installation-report.md"
    
    cat > "$report_file" << EOF
# Relatório de Instalação - Portfolio Backend

**Data:** $(date '+%Y-%m-%d %H:%M:%S')
**Ambiente:** $(uname -s) $(uname -r)

## Configuração do Sistema

### Tecnologias Instaladas
- **Node.js:** $(node --version 2>/dev/null || echo "Não encontrado")
- **npm:** $(npm --version 2>/dev/null || echo "Não encontrado")
- **MongoDB:** $(mongod --version 2>/dev/null | head -1 || echo "Não encontrado")
- **Redis:** $(redis-server --version 2>/dev/null || echo "Não encontrado")
- **Docker:** $(docker --version 2>/dev/null || echo "Não encontrado")

### Estrutura de Diretórios
EOF
    
    # Adicionar lista de diretórios criados
    find . -type d -name "node_modules" -prune -o -type d -print | sort >> "$report_file"
    
    cat >> "$report_file" << EOF

### URLs Importantes
- **Aplicação:** http://localhost:5000
- **API Docs:** http://localhost:5000/docs
- **Health Check:** http://localhost:5000/health

### Próximos Passos
1. Configure as variáveis de ambiente no arquivo .env
2. Execute: \`npm run dev\` para iniciar o servidor
3. Acesse http://localhost:5000 para testar
4. Login admin: admin@portfolio.com / admin123

### Comandos Úteis
\`\`\`bash
# Iniciar desenvolvimento
npm run dev

# Executar testes
npm test

# Build para produção
npm run build

# Docker (desenvolvimento)
npm run docker:dev

# Docker (produção)
npm run docker:prod
\`\`\`

### Logs
Os logs de instalação foram salvos em: \`logs/init.log\`
EOF
    
    log "SUCCESS" "Relatório salvo em: $report_file"
}

# =============================================================================
# FUNÇÃO PRINCIPAL
# =============================================================================

main() {
    clear
    echo -e "${PURPLE}"
    echo "============================================="
    echo "🚀 PORTFOLIO BACKEND - INICIALIZAÇÃO"
    echo "============================================="
    echo -e "${NC}"
    echo ""
    
    # Garantir que diretório de logs existe
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Iniciar log
    log "INFO" "Iniciando configuração do Portfolio Backend..."
    log "INFO" "Diretório do projeto: $PROJECT_ROOT"
    log "INFO" "Arquivo de log: $LOG_FILE"
    
    # Executar etapas
    check_prerequisites
    setup_directories
    setup_config_files
    install_dependencies
    setup_services
    setup_database
    run_tests
    build_project
    health_check
    generate_report
    
    # Mensagem final
    echo ""
    echo -e "${GREEN}============================================="
    echo -e "🎉 INICIALIZAÇÃO CONCLUÍDA COM SUCESSO!"
    echo -e "=============================================${NC}"
    echo ""
    echo -e "${CYAN}Próximos passos:${NC}"
    echo -e "${YELLOW}1.${NC} Configure o arquivo .env com suas credenciais"
    echo -e "${YELLOW}2.${NC} Execute: ${BLUE}npm run dev${NC}"
    echo -e "${YELLOW}3.${NC} Acesse: ${BLUE}http://localhost:5000${NC}"
    echo -e "${YELLOW}4.${NC} Documentação: ${BLUE}http://localhost:5000/docs${NC}"
    echo ""
    echo -e "${CYAN}Login padrão:${NC}"
    echo -e "${YELLOW}Email:${NC} admin@portfolio.com"
    echo -e "${YELLOW}Senha:${NC} admin123"
    echo ""
    echo -e "${CYAN}Logs salvos em:${NC} $LOG_FILE"
    echo -e "${CYAN}Relatório:${NC} docs/installation-report.md"
    echo ""
    
    log "SUCCESS" "Inicialização concluída com sucesso!"
}

# =============================================================================
# EXECUÇÃO
# =============================================================================

# Verificar se está sendo executado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi