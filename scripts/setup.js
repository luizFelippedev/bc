#!/usr/bin/env node

// scripts/setup.js - Script de inicialização rápida
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const checkCommand = (command) => {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const createDirectories = () => {
  const dirs = [
    'uploads', 'uploads/images', 'uploads/documents', 'uploads/temp',
    'logs', 'exports', 'backups', 'backups/mongodb', 'backups/files',
    'ssl', 'storage', 'storage/cache', 'storage/sessions', 'tmp'
  ];

  log('\n📁 Criando diretórios necessários...', 'blue');
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✅ Criado: ${dir}`, 'green');
    } else {
      log(`ℹ️  Já existe: ${dir}`, 'yellow');
    }
  });

  // Criar .gitkeep para manter diretórios no Git
  const gitkeepDirs = ['uploads', 'logs', 'exports', 'backups', 'ssl', 'storage', 'tmp'];
  gitkeepDirs.forEach(dir => {
    const gitkeepPath = path.join(dir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '');
    }
  });
};

const createEnvFile = () => {
  log('\n⚙️  Configurando arquivo .env...', 'blue');
  
  if (!fs.existsSync('.env')) {
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      log('✅ Arquivo .env criado a partir de .env.example', 'green');
      log('⚠️  Configure as variáveis no arquivo .env antes de continuar!', 'yellow');
    } else {
      // Criar .env básico
      const basicEnv = `# Portfolio Backend Environment
NODE_ENV=development
PORT=5000
BASE_URL=http://localhost:5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/portfolio_development

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=8h

# Session
SESSION_SECRET=your-session-secret-change-this
SESSION_ENABLED=true
SESSION_MAX_AGE=86400000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Admin padrão
ADMIN_EMAIL=admin@portfolio.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador

# Upload
UPLOAD_PATH=uploads
MAX_FILE_SIZE=52428800

# Logs
LOG_LEVEL=info
`;
      fs.writeFileSync('.env', basicEnv);
      log('✅ Arquivo .env básico criado', 'green');
      log('⚠️  Configure as variáveis no arquivo .env!', 'yellow');
    }
  } else {
    log('ℹ️  Arquivo .env já existe', 'yellow');
  }
};

const checkServices = () => {
  log('\n🔍 Verificando serviços...', 'blue');
  
  // MongoDB
  if (checkCommand('mongod')) {
    log('✅ MongoDB encontrado', 'green');
  } else {
    log('⚠️  MongoDB não encontrado - você pode usar Docker', 'yellow');
    log('   Execute: docker run -d -p 27017:27017 --name mongodb mongo:6', 'cyan');
  }
  
  // Redis
  if (checkCommand('redis-server')) {
    log('✅ Redis encontrado', 'green');
  } else {
    log('⚠️  Redis não encontrado - você pode usar Docker', 'yellow');
    log('   Execute: docker run -d -p 6379:6379 --name redis redis:7-alpine', 'cyan');
  }
  
  // Docker
  if (checkCommand('docker')) {
    log('✅ Docker encontrado', 'green');
  } else {
    log('ℹ️  Docker não encontrado (opcional)', 'blue');
  }
};

const installDependencies = () => {
  log('\n📦 Instalando dependências...', 'blue');
  
  try {
    log('Executando npm install...', 'cyan');
    execSync('npm install', { stdio: 'inherit' });
    log('✅ Dependências instaladas com sucesso!', 'green');
  } catch (error) {
    log('❌ Erro ao instalar dependências:', 'red');
    console.error(error.message);
    process.exit(1);
  }
};

const buildProject = () => {
  log('\n🏗️  Fazendo build do projeto...', 'blue');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    log('✅ Build concluído com sucesso!', 'green');
  } catch (error) {
    log('❌ Erro no build:', 'red');
    console.error(error.message);
    process.exit(1);
  }
};

const showInstructions = () => {
  log('\n🎉 Configuração concluída com sucesso!', 'green');
  log('\n📋 Próximos passos:', 'bright');
  log('1. Configure o arquivo .env com suas credenciais', 'yellow');
  log('2. Inicie MongoDB e Redis (ou use Docker)', 'yellow');
  log('3. Execute: npm run dev', 'cyan'); 
  log('4. Acesse: http://localhost:5000', 'cyan');
  log('\n🔐 Login padrão:', 'bright');
  log('Email: admin@portfolio.com', 'yellow');
  log('Senha: admin123', 'yellow');
  log('\n📚 Outros comandos úteis:', 'bright');
  log('npm run dev          - Modo desenvolvimento', 'cyan');
  log('npm run build        - Build para produção', 'cyan');
  log('npm test             - Executar testes', 'cyan');
  log('npm run init-admin   - Criar usuário admin', 'cyan');
  log('npm run migrate      - Executar migrations', 'cyan');
  log('\n🐳 Docker (opcional):', 'bright');
  log('npm run docker:dev   - Ambiente completo com Docker', 'cyan');
  log('');
};

// Função principal
const main = () => {
  log('🚀 Portfolio Backend - Setup', 'bright');
  log('================================', 'blue');
  
  try {
    createDirectories();
    createEnvFile();
    checkServices();
    installDependencies();
    buildProject();
    showInstructions();
  } catch (error) {
    log(`❌ Erro durante a configuração: ${error.message}`, 'red');
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };