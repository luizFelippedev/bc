// src/server.ts
import { Bootstrap } from './bootstrap';
import { LoggerService } from './services/LoggerService';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const logger = LoggerService.getInstance();

async function startServer() {
  try {
    logger.info('🔄 Iniciando servidor...');
    
    // Inicializar aplicação através do Bootstrap
    const app = await Bootstrap.init();
    
    // Iniciar servidor
    await app.start();
    
    logger.info(`✅ Servidor rodando na porta ${process.env.PORT}`);
    logger.info(`🌍 Ambiente: ${process.env.NODE_ENV}`);
    logger.info(`📚 Documentação API: http://localhost:${process.env.PORT}/docs`);
    logger.info(`👤 Painel Administrativo: http://localhost:${process.env.PORT}/admin`);
  } catch (error) {
    logger.error('❌ Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Iniciar aplicação
startServer();