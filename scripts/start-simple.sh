#!/bin/bash
echo "íº€ Iniciando Portfolio Backend (modo simples)..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "âŒ Node.js nÃ£o encontrado"
    exit 1
fi

# Criar diretÃ³rios se necessÃ¡rio
mkdir -p uploads logs exports backups storage tmp

# Instalar dependÃªncias se necessÃ¡rio
if [ ! -d "node_modules" ]; then
    echo "í³¦ Instalando dependÃªncias..."
    npm install --legacy-peer-deps
fi

# Build se necessÃ¡rio
if [ ! -d "dist" ]; then
    echo "í¿—ï¸ Fazendo build..."
    npm run build
fi

# Iniciar aplicaÃ§Ã£o
echo "í¼ Iniciando servidor..."
npm run dev
