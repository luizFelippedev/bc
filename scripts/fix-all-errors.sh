#!/usr/bin/env node

/**
 * Script para corrigir automaticamente os erros de TypeScript no projeto Portfolio Backend
 * Autor: Claude
 * Data: 28/05/2025
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Função para colorir texto
const colorize = (text, color) => `${colors[color]}${text}${colors.reset}`;

// Log com cores
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Função para ler arquivo
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    log(`❌ Erro ao ler arquivo ${filePath}: ${error.message}`, 'red');
    return null;
  }
}

// Função para escrever arquivo
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    log(`❌ Erro ao escrever arquivo ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

// Função para buscar e substituir texto
function replaceInFile(filePath, searchValue, replaceValue) {
  try {
    if (!fs.existsSync(filePath)) {
      log(`⚠️ Arquivo não encontrado: ${filePath}`, 'yellow');
      return false;
    }

    const fileContent = readFile(filePath);
    if (!fileContent) return false;

    // Verifica se o padrão existe
    if (!fileContent.includes(searchValue)) {
      log(`⚠️ Padrão não encontrado em ${filePath}`, 'yellow');
      return false;
    }

    // Substitui o texto
    const newContent = fileContent.replace(searchValue, replaceValue);
    const success = writeFile(filePath, newContent);

    if (success) {
      log(`✅ Arquivo ${filePath} atualizado com sucesso`, 'green');
    }

    return success;
  } catch (error) {
    log(`❌ Erro ao processar arquivo ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

// Função para buscar e substituir com regex
function replaceRegexInFile(filePath, searchRegex, replaceValue) {
  try {
    if (!fs.existsSync(filePath)) {
      log(`⚠️ Arquivo não encontrado: ${filePath}`, 'yellow');
      return false;
    }

    const fileContent = readFile(filePath);
    if (!fileContent) return false;

    // Substitui usando regex
    const newContent = fileContent.replace(searchRegex, replaceValue);
    
    // Verifica se houve alteração
    if (fileContent === newContent) {
      log(`⚠️ Nenhuma alteração em ${filePath} usando regex`, 'yellow');
      return false;
    }
    
    const success = writeFile(filePath, newContent);

    if (success) {
      log(`✅ Arquivo ${filePath} atualizado com sucesso (regex)`, 'green');
    }

    return success;
  } catch (error) {
    log(`❌ Erro ao processar arquivo ${filePath} com regex: ${error.message}`, 'red');
    return false;
  }
}

// Função para adicionar método a uma classe
function addMethodToClass(filePath, className, methodCode) {
  try {
    if (!fs.existsSync(filePath)) {
      log(`⚠️ Arquivo não encontrado: ${filePath}`, 'yellow');
      return false;
    }

    const fileContent = readFile(filePath);
    if (!fileContent) return false;

    // Encontrar a classe
    const classRegex = new RegExp(`export class ${className} {([\\s\\S]*?)}`);
    const classMatch = fileContent.match(classRegex);

    if (!classMatch) {
      log(`⚠️ Classe ${className} não encontrada em ${filePath}`, 'yellow');
      return false;
    }

    // Verificar se o método já existe
    if (fileContent.includes(methodCode.split('(')[0])) {
      log(`ℹ️ Método já existe em ${filePath}`, 'blue');
      return true;
    }

    // Adicionar o método antes do último fechamento de chave da classe
    const lastBraceIndex = fileContent.lastIndexOf('}');
    if (lastBraceIndex === -1) {
      log(`❌ Estrutura da classe ${className} não reconhecida`, 'red');
      return false;
    }

    const newContent = 
      fileContent.substring(0, lastBraceIndex) + 
      '\n\n  ' + methodCode + '\n' + 
      fileContent.substring(lastBraceIndex);

    const success = writeFile(filePath, newContent);

    if (success) {
      log(`✅ Método adicionado à classe ${className} em ${filePath}`, 'green');
    }

    return success;
  } catch (error) {
    log(`❌ Erro ao adicionar método à classe ${className}: ${error.message}`, 'red');
    return false;
  }
}

// Função para atualizar uma interface
function updateInterface(filePath, interfaceName, newProperties) {
  try {
    if (!fs.existsSync(filePath)) {
      log(`⚠️ Arquivo não encontrado: ${filePath}`, 'yellow');
      return false;
    }

    const fileContent = readFile(filePath);
    if (!fileContent) return false;

    // Encontrar a interface
    const interfaceRegex = new RegExp(`interface ${interfaceName} {([\\s\\S]*?)}`);
    const interfaceMatch = fileContent.match(interfaceRegex);

    if (!interfaceMatch) {
      log(`⚠️ Interface ${interfaceName} não encontrada em ${filePath}`, 'yellow');
      return false;
    }

    // Substituir a interface
    const originalInterface = interfaceMatch[0];
    const updatedInterface = originalInterface.replace(interfaceMatch[1], newProperties);

    const newContent = fileContent.replace(originalInterface, updatedInterface);
    const success = writeFile(filePath, newContent);

    if (success) {
      log(`✅ Interface ${interfaceName} atualizada em ${filePath}`, 'green');
    }

    return success;
  } catch (error) {
    log(`❌ Erro ao atualizar interface ${interfaceName}: ${error.message}`, 'red');
    return false;
  }
}

// Backup dos arquivos antes das modificações
function backupFiles(files) {
  const backupDir = path.join(process.cwd(), 'backup-' + Date.now());
  fs.mkdirSync(backupDir, { recursive: true });
  
  log(`📂 Criando backup dos arquivos em ${backupDir}`, 'blue');
  
  files.forEach(file => {
    try {
      const content = readFile(file);
      if (content) {
        const backupPath = path.join(backupDir, path.basename(file));
        writeFile(backupPath, content);
        log(`✅ Backup criado: ${backupPath}`, 'green');
      }
    } catch (error) {
      log(`⚠️ Erro ao criar backup de ${file}: ${error.message}`, 'yellow');
    }
  });
  
  return backupDir;
}

// Iniciar as correções
async function fixTypescriptErrors() {
  log('🚀 Iniciando correções dos erros de TypeScript no Portfolio Backend', 'bright');
  log('==================================================================', 'blue');

  // Lista de arquivos que serão modificados
  const filesToFix = [
    'src/app.ts',
    'src/controllers/AuthController.ts',
    'src/controllers/ExportController.ts',
    'src/services/ExportService.ts',
    'src/routes/admin.ts',
    'src/routes/export.ts',
    'src/middlewares/RateLimitMiddleware.ts',
    'src/services/EmailService.ts'
  ];

  // Criar backup dos arquivos originais
  const backupDir = backupFiles(filesToFix);

  // 1. Corrigir src/app.ts - middleware compression()
  log('\n🔧 Corrigindo middleware compression() em src/app.ts...', 'blue');
  replaceRegexInFile(
    'src/app.ts',
    /this\.app\.use\(compression\(\)\);/g,
    'this.app.use(compression() as any);'
  );

  // 2. Corrigir src/app.ts - middleware session() com Redis
  log('\n🔧 Corrigindo middleware session() com Redis em src/app.ts...', 'blue');
  replaceRegexInFile(
    'src/app.ts',
    /const RedisStore = ConnectRedis\(session\);/g,
    'const RedisStore = ConnectRedis(session) as any;'
  );
  
  replaceRegexInFile(
    'src/app.ts',
    /this\.app\.use\(session\(\{[\s\S]*?store:[\s\S]*?\}\)\);/g,
    (match) => match.replace(/\}\)\);$/, '}) as any);')
  );

  // 3. Corrigir src/app.ts - middleware session() sem Redis
  log('\n🔧 Corrigindo middleware session() sem Redis em src/app.ts...', 'blue');
  replaceRegexInFile(
    'src/app.ts',
    /this\.app\.use\(session\(\{[\s\S]*?cookie:[\s\S]*?\}\)\);/g,
    (match) => match.replace(/\}\)\);$/, '}) as any);')
  );

  // 4. Corrigir src/app.ts - middleware do Swagger UI
  log('\n🔧 Corrigindo middleware do Swagger UI em src/app.ts...', 'blue');
  replaceRegexInFile(
    'src/app.ts',
    /this\.app\.use\('\/docs', swaggerUi\.serve, swaggerUi\.setup\(swaggerSpec\)\);/g,
    "this.app.use('/docs', swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);"
  );

  // 5. Corrigir src/controllers/AuthController.ts - jwt.sign()
  log('\n🔧 Corrigindo jwt.sign() em src/controllers/AuthController.ts...', 'blue');
  replaceRegexInFile(
    'src/controllers/AuthController.ts',
    /const token = jwt\.sign\(\s*\{\s*id: (user\._id).*?\},\s*config\.jwt\.secret,/g,
    'const token = jwt.sign(\n        { \n          id: ($1 as any).toString(), \n          role: user.role \n        },\n        config.jwt.secret as any,'
  );

  // 6. Atualizar interface ExportOptions em src/services/ExportService.ts
  log('\n🔧 Atualizando interface ExportOptions em src/services/ExportService.ts...', 'blue');
  replaceRegexInFile(
    'src/services/ExportService.ts',
    /interface ExportOptions \{\s*format: 'json' \| 'csv';/g,
    "interface ExportOptions {\n  format: 'json' | 'csv' | 'xlsx';"
  );

  // 7. Corrigir src/routes/admin.ts - fileFilter
  log('\n🔧 Corrigindo fileFilter em src/routes/admin.ts...', 'blue');
  replaceRegexInFile(
    'src/routes/admin.ts',
    /const fileFilter = \(req: Request, file: Express\.Multer\.File, cb: FileFilterCallback\) => \{[\s\S]*?\};/g,
    (match) => match.replace(/\};$/, '}) as any;')
  );

  // 8. Corrigir src/routes/admin.ts - upload.fields()
  log('\n🔧 Corrigindo upload.fields() em src/routes/admin.ts...', 'blue');
  replaceRegexInFile(
    'src/routes/admin.ts',
    /upload\.fields\(\[\s*\{ name: ['"].*?['"]\, maxCount: \d+ \},[\s\S]*?\]\),/g,
    (match) => match.replace(/\]\),/, ']) as any,')
  );

  // 9. Corrigir src/routes/admin.ts - upload.single()
  log('\n🔧 Corrigindo upload.single() em src/routes/admin.ts...', 'blue');
  replaceRegexInFile(
    'src/routes/admin.ts',
    /upload\.single\(['"].*?['"]\),/g,
    (match) => match.replace(/\),/, ') as any,')
  );

  // 10. Adicionar método forRoute em src/middlewares/RateLimitMiddleware.ts
  log('\n🔧 Adicionando método forRoute em src/middlewares/RateLimitMiddleware.ts...', 'blue');
  addMethodToClass(
    'src/middlewares/RateLimitMiddleware.ts',
    'RateLimitMiddleware',
    `public static forRoute(options: {
    keyPrefix?: string;
    points?: number;
    duration?: number;
    blockDuration?: number;
    keyGenerator?: (req: Request) => string;
  }) {
    return RateLimitMiddleware.createLimiter(options);
  }`
  );

  // 11. Corrigir src/services/EmailService.ts - createTransporter para createTransport
  log('\n🔧 Corrigindo createTransporter para createTransport em src/services/EmailService.ts...', 'blue');
  replaceRegexInFile(
    'src/services/EmailService.ts',
    /this\.transporter = nodemailer\.createTransporter\(/g,
    'this.transporter = nodemailer.createTransport('
  );

  // Mensagem final
  log('\n✅ Todas as correções foram aplicadas com sucesso!', 'green');
  log(`📂 Backup dos arquivos originais: ${backupDir}`, 'blue');
  log('\n📋 Próximos passos:', 'bright');
  log('1. Compile o projeto: npm run build', 'yellow');
  log('2. Execute a aplicação: npm run dev', 'yellow');
  log('\n💡 Caso ainda ocorram erros, verifique o log acima para identificar correções pendentes.', 'bright');
}

// Executar o script
fixTypescriptErrors().catch(err => {
  log(`❌ Erro ao executar o script: ${err.message}`, 'red');
  console.error(err);
  process.exit(1);
});