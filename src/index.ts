// src/index.ts - Ponto de entrada principal da aplicação
import 'dotenv/config';
import { LoggerService } from './services/LoggerService';
import { DatabaseService } from './services/DatabaseService';
import { CacheService } from './services/CacheService';
import { App } from './app';

const logger = LoggerService.getInstance();

async function startServer(): Promise<void> {
  try {
    logger.info('🚀 Iniciando Portfolio Backend...');

    // Verificar Node.js version
    const nodeVersion = process.version;
    const requiredVersion = '18.0.0';
    const currentVersionNumber = nodeVersion.slice(1); // Remove 'v'
    
    if (currentVersionNumber < requiredVersion) {
      throw new Error(
        `Node.js ${requiredVersion} ou superior é necessário. Versão atual: ${nodeVersion}`
      );
    }

    logger.info(`Node.js versão: ${nodeVersion}`);
    logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Porta: ${process.env.PORT || 5000}`);

    // Verificar variáveis de ambiente críticas
    const criticalEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
    const missingVars = criticalEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Variáveis de ambiente obrigatórias não definidas: ${missingVars.join(', ')}`
      );
    }

    // ✅ CORREÇÃO: Melhor tratamento de conexões
    logger.info('📡 Conectando aos serviços...');
    
    // Conectar ao MongoDB
    try {
      const database = DatabaseService.getInstance();
      await database.connect();
      logger.info('✅ MongoDB conectado com sucesso');
    } catch (error) {
      logger.error('❌ Falha ao conectar MongoDB:', error);
      throw error;
    }

    // Conectar ao Redis (opcional)
    try {
      const cache = CacheService.getInstance();
      await cache.connect();
      logger.info('✅ Redis conectado - cache habilitado');
    } catch (error) {
      logger.warn('⚠️  Redis não disponível - continuando sem cache externo:', error);
    }

    // ✅ Inicializar aplicação
    const app = new App();
    await app.start();

    // Configurar graceful shutdown
    setupGracefulShutdown(app);

  } catch (error) {
    logger.error('❌ Falha crítica ao iniciar aplicação:', error);
    
    // Tentar limpar recursos antes de sair
    try {
      await cleanup();
    } catch (cleanupError) {
      logger.error('❌ Erro durante limpeza:', cleanupError);
    }
    
    process.exit(1);
  }
}

// ✅ Função para limpeza de recursos
async function cleanup(): Promise<void> {
  try {
    logger.info('🧹 Limpando recursos...');
    
    const database = DatabaseService.getInstance();
    await database.disconnect();
    logger.info('✅ MongoDB desconectado');
    
    const cache = CacheService.getInstance();
    await cache.disconnect();
    logger.info('✅ Redis desconectado');
    
  } catch (error) {
    logger.error('❌ Erro durante cleanup:', error);
  }
}

// ✅ Configurar graceful shutdown
function setupGracefulShutdown(app: App): void {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`📴 Recebido sinal ${signal}. Iniciando shutdown graceful...`);
    
    try {
      // Parar de aceitar novas conexões
      await app.shutdown();
      
      // Limpar recursos
      await cleanup();
      
      logger.info('👋 Servidor encerrado com sucesso');
      process.exit(0);
      
    } catch (error) {
      logger.error('❌ Erro durante shutdown graceful:', error);
      process.exit(1);
    }
  };

  // Registrar handlers de shutdown
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handler para Windows
  if (process.platform === 'win32') {
    process.on('SIGBREAK', () => gracefulShutdown('SIGBREAK'));
  }
}

// ✅ Manipuladores de erro não capturado
process.on('uncaughtException', (error: Error) => {
  logger.error('🔥 Exceção não capturada:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
  
  // Dar tempo para logs serem escritos
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('🔥 Promise rejeitada não tratada:', {
    reason: reason,
    promise: promise.toString()
  });
  
  // Dar tempo para logs serem escritos
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// ✅ Handler para avisos
process.on('warning', (warning) => {
  logger.warn('⚠️ Node.js Warning:', {
    name: warning.name,
    message: warning.message,
    stack: warning.stack
  });
});

// ✅ Log de informações do processo na inicialização
logger.info('🔧 Informações do processo:', {
  pid: process.pid,
  platform: process.platform,
  arch: process.arch,
  nodeVersion: process.version,
  memoryUsage: process.memoryUsage()
});

// 🚀 Iniciar aplicação
startServer().catch((error) => {
  logger.error('💥 Erro fatal na inicialização:', error);
  process.exit(1);
});