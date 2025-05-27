// ===== src/index.ts =====
import dotenv from 'dotenv';
import { Bootstrap } from './bootstrap';
import { LoggerService } from './services/LoggerService';

// Carregar variáveis de ambiente primeiro
dotenv.config();

const logger = LoggerService.getInstance();

async function startServer() {
  try {
    logger.info('🚀 Iniciando servidor...');
    
    // Inicializar aplicação através do Bootstrap
    const app = await Bootstrap.init();
    
    // Iniciar servidor
    await app.start();
    
    logger.info(`✅ Servidor rodando na porta ${process.env.PORT || 5000}`);
    logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`📚 Documentação API: http://localhost:${process.env.PORT || 5000}/docs`);
  } catch (error) {
    logger.error('❌ Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Iniciar aplicação
startServer();