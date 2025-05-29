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
    if (nodeVersion < `v${requiredVersion}`) {
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

    // Conectar aos serviços na ordem correta
    logger.info('📡 Conectando aos serviços...');
    
    // 1. Conectar ao banco de dados (obrigatório)
    const database = DatabaseService.getInstance();
    await database.connect();
    logger.info('✅ MongoDB conectado');

    // 2. Conectar ao cache (opcional)
    try {
      const cache = CacheService.getInstance();
      await cache.connect();
      logger.info('✅ Redis conectado');
    } catch (error) {
      logger.warn('⚠️  Redis não disponível - continuando sem cache:', error);
    }

    // 3. Inicializar aplicação
    const app = new App();
    await app.start();

    // Log de informações
    const port = process.env.PORT || 5000;
    logger.info(`🌍 Servidor rodando: http://localhost:${port}`);
    logger.info(`📚 API Docs: http://localhost:${port}/docs`);
    logger.info(`💾 Health: http://localhost:${port}/health`);

    // Informações de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      logger.info('🔧 Modo de desenvolvimento ativo');
      logger.info(`🔐 Admin login: http://localhost:${port}/api/admin/auth/login`);
      logger.info('📧 Email: admin@portfolio.com | Senha: admin123');
    }

  } catch (error) {
    logger.error('❌ Falha ao iniciar aplicação:', error);
    process.exit(1);
  }
}

// Manipuladores de erro não capturado
process.on('uncaughtException', (error: Error) => {
  logger.error('🔥 Exceção não capturada:', error);
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('🔥 Promise rejeitada não tratada:', reason);
  setTimeout(() => process.exit(1), 1000);
});

// Handlers de graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`📴 Recebido sinal ${signal}. Iniciando shutdown graceful...`);
  
  try {
    const database = DatabaseService.getInstance();
    await database.disconnect();
    
    const cache = CacheService.getInstance();
    await cache.disconnect();
    
    logger.info('👋 Servidor encerrado com sucesso');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Erro durante shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Iniciar aplicação
startServer();