// src/server.ts
import dotenv from 'dotenv';
import { Bootstrap } from './bootstrap';
import { LoggerService } from './services/LoggerService';

// Carregar variáveis de ambiente primeiro
dotenv.config();

const logger = LoggerService.getInstance();

export class PortfolioServer {
  private app: any;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      logger.info('🚀 Inicializando servidor...');
      
      // Inicializar aplicação através do Bootstrap
      this.app = await Bootstrap.init();
      
      logger.info(`✅ Servidor inicializado com sucesso`);
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    } catch (error) {
      logger.error('❌ Falha ao inicializar o servidor:', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    if (!this.app) {
      await this.initialize();
    }
    
    await this.app.start();
  }

  public async shutdown(): Promise<void> {
    if (this.app) {
      await this.app.shutdown();
    }
  }

  public getApp(): any {
    return this.app;
  }
}

// Função para iniciar o servidor quando executado diretamente
export async function startServer(): Promise<void> {
  try {
    const server = new PortfolioServer();
    await server.start();
    
    logger.info(`🚀 Servidor rodando na porta ${process.env.PORT || 5000}`);
    logger.info(`📚 Documentação API: http://localhost:${process.env.PORT || 5000}/docs`);
  } catch (error) {
    logger.error('❌ Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Se o arquivo for executado diretamente
if (require.main === module) {
  startServer();
}