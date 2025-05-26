// src/server.ts (refatorado)
import { Bootstrap } from './bootstrap';
import { LoggerService } from './services/LoggerService';

const logger = LoggerService.getInstance();

async function startServer() {
  try {
    const app = await Bootstrap.init();
    await app.start();
    
    logger.info(`✅ Servidor rodando na porta ${process.env.PORT}`);
    logger.info(`🌍 Ambiente: ${process.env.NODE_ENV}`);
    logger.info(`📚 Documentação API: http://localhost:${process.env.PORT}/docs`);
  } catch (error) {
    logger.error('❌ Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();
