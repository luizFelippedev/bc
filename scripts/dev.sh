#!/bin/bash

# Portfolio Backend - Script de Desenvolvimento
# Este script facilita tarefas comuns de desenvolvimento

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir ajuda
show_help() {
    echo -e "${BLUE}Portfolio Backend - Script de Desenvolvimento${NC}"
    echo ""
    echo "Uso: ./scripts/dev.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  setup        - Configuração inicial do projeto"
    echo "  start        - Iniciar servidor em modo desenvolvimento"
    echo "  test         - Executar todos os testes"
    echo "  test:unit    - Executar apenas testes unitários"
    echo "  test:int     - Executar testes de integração"
    echo "  lint         - Verificar código com ESLint"
    echo "  format       - Formatar código com Prettier"
    echo "  build        - Build do projeto"
    echo "  docker:up    - Subir ambiente Docker"
    echo "  docker:down  - Parar ambiente Docker"
    echo "  db:seed      - Popular banco com dados de exemplo"
    echo "  db:reset     - Resetar banco de dados"
    echo "  logs         - Ver logs do servidor"
    echo "  clean        - Limpar arquivos temporários"
    echo "  help         - Exibir esta ajuda"
    echo ""
}

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para verificar dependências
check_dependencies() {
    echo -e "${BLUE}Verificando dependências...${NC}"
    
    if ! command_exists node; then
        echo -e "${RED}❌ Node.js não encontrado. Instale Node.js 18+${NC}"
        exit 1
    fi
    
    if ! command_exists npm; then
        echo -e "${RED}❌ npm não encontrado${NC}"
        exit 1
    fi
    
    if ! command_exists docker; then
        echo -e "${YELLOW}⚠️  Docker não encontrado. Algumas funcionalidades não estarão disponíveis${NC}"
    fi
    
    echo -e "${GREEN}✅ Dependências verificadas${NC}"
}

# Configuração inicial
setup() {
    echo -e "${BLUE}🚀 Configurando projeto...${NC}"
    
    check_dependencies
    
    # Criar arquivo .env se não existir
    if [ ! -f .env ]; then
        echo -e "${YELLOW}📝 Criando arquivo .env...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✅ Arquivo .env criado. Configure as variáveis necessárias.${NC}"
    fi
    
    # Instalar dependências
    echo -e "${BLUE}📦 Instalando dependências...${NC}"
    npm install
    
    # Criar diretórios necessários
    echo -e "${BLUE}📁 Criando diretórios...${NC}"
    mkdir -p uploads logs exports backups
    
    # Instalar Husky hooks
    if [ -d .git ]; then
        echo -e "${BLUE}🪝 Configurando Git hooks...${NC}"
        npm run prepare
    fi
    
    echo -e "${GREEN}✅ Configuração concluída!${NC}"
    echo -e "${YELLOW}💡 Execute './scripts/dev.sh start' para iniciar o servidor${NC}"
}

# Iniciar servidor
start() {
    echo -e "${BLUE}🚀 Iniciando servidor de desenvolvimento...${NC}"
    npm run dev
}

# Executar testes
run_tests() {
    echo -e "${BLUE}🧪 Executando todos os testes...${NC}"
    npm test
}

# Executar testes unitários
run_unit_tests() {
    echo -e "${BLUE}🧪 Executando testes unitários...${NC}"
    npm run test -- --testPathIgnorePatterns=integration
}

# Executar testes de integração
run_integration_tests() {
    echo -e "${BLUE}🧪 Executando testes de integração...${NC}"
    npm run test:integration
}

# Verificar código
lint() {
    echo -e "${BLUE}🔍 Verificando código com ESLint...${NC}"
    npm run lint
}

# Formatar código
format() {
    echo -e "${BLUE}✨ Formatando código com Prettier...${NC}"
    npm run format
}

# Build do projeto
build() {
    echo -e "${BLUE}🏗️  Fazendo build do projeto...${NC}"
    npm run build
    echo -e "${GREEN}✅ Build concluído!${NC}"
}

# Subir ambiente Docker
docker_up() {
    if ! command_exists docker; then
        echo -e "${RED}❌ Docker não encontrado${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🐳 Subindo ambiente Docker...${NC}"
    docker-compose -f docker-compose.dev.yml up -d
    echo -e "${GREEN}✅ Ambiente Docker iniciado${NC}"
}

# Parar ambiente Docker
docker_down() {
    if ! command_exists docker; then
        echo -e "${RED}❌ Docker não encontrado${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🐳 Parando ambiente Docker...${NC}"
    docker-compose -f docker-compose.dev.yml down
    echo -e "${GREEN}✅ Ambiente Docker parado${NC}"
}

# Popular banco com dados
seed_db() {
    echo -e "${BLUE}🌱 Populando banco com dados de exemplo...${NC}"
    npm run seed
    echo -e "${GREEN}✅ Dados inseridos no banco${NC}"
}

# Resetar banco de dados
reset_db() {
    echo -e "${YELLOW}⚠️  Esta operação irá apagar todos os dados!${NC}"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🗃️  Resetando banco de dados...${NC}"
        # Adicionar comando para resetar banco
        npm run init-admin
        echo -e "${GREEN}✅ Banco resetado e admin recriado${NC}"
    else
        echo -e "${YELLOW}Operação cancelada${NC}"
    fi
}

# Ver logs
view_logs() {
    echo -e "${BLUE}📋 Exibindo logs do servidor...${NC}"
    if [ -f logs/combined.log ]; then
        tail -f logs/combined.log
    else
        echo -e "${YELLOW}⚠️  Arquivo de log não encontrado${NC}"
    fi
}

# Limpar arquivos temporários
clean() {
    echo -e "${BLUE}🧹 Limpando arquivos temporários...${NC}"
    
    # Remover build
    rm -rf dist
    
    # Remover logs
    rm -rf logs/*.log
    
    # Remover uploads de teste
    rm -rf test_uploads
    
    # Remover coverage
    rm -rf coverage
    
    # Limpar cache npm
    npm cache clean --force
    
    echo -e "${GREEN}✅ Limpeza concluída${NC}"
}

# Verificar argumento
case "${1:-}" in
    setup)
        setup
        ;;
    start)
        start
        ;;
    test)
        run_tests
        ;;
    test:unit)
        run_unit_tests
        ;;
    test:int)
        run_integration_tests
        ;;
    lint)
        lint
        ;;
    format)
        format
        ;;
    build)
        build
        ;;
    docker:up)
        docker_up
        ;;
    docker:down)
        docker_down
        ;;
    db:seed)
        seed_db
        ;;
    db:reset)
        reset_db
        ;;
    logs)
        view_logs
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando desconhecido: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac