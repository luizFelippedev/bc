#!/bin/bash
echo "� Iniciando Portfolio Backend (modo simples)..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado"
    exit 1
fi

# Criar diretórios se necessário
mkdir -p uploads logs exports backups storage tmp

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "� Instalando dependências..."
    npm install --legacy-peer-deps
fi

# Build se necessário
if [ ! -d "dist" ]; then
    echo "�️ Fazendo build..."
    npm run build
fi

# Iniciar aplicação
echo "� Iniciando servidor..."
npm run dev
