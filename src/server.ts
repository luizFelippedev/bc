// server.ts - Ponto de entrada principal
import dotenv from 'dotenv';
import { Bootstrap } from '../src/bootstrap';
import { LoggerService } from '../src/services/LoggerService';

// Carregar variáveis de ambiente primeiro
dotenv.config();

const logger = LoggerService.getInstance();

export class PortfolioServer {
  private app: any;

  constructor() {
    // Inicialização será feita no start()
  }

  private async initialize(): Promise<void> {
    try {
      logger.info('🚀 Inicializando servidor...');

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

    const port = process.env.PORT || 5000;
    logger.info(`🚀 Servidor rodando na porta ${port}`);
    logger.info(`📚 Documentação API: http://localhost:${port}/docs`);
    logger.info(
      `💾 MongoDB: ${process.env.MONGODB_URI ? 'Conectado' : 'Não configurado'}`
    );
    logger.info(
      `🗄️  Redis: ${process.env.REDIS_HOST ? 'Conectado' : 'Não configurado'}`
    );

    // Log de informações adicionais no desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      logger.info('🔧 Modo de desenvolvimento ativo');
      logger.info(`📊 Health check: http://localhost:${port}/health`);
      logger.info(`🔐 Admin login: http://localhost:${port}/api/auth/login`);
    }
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
  } catch (error) {
    logger.error('❌ Falha ao iniciar o servidor:', error);

    // Log adicional para debugging
    if (error instanceof Error) {
      logger.error('Stack trace:', error.stack);
    }

    // Aguardar um pouco para garantir que logs sejam escritos
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
}

// Manipuladores de erro não capturado
process.on('uncaughtException', (error: Error) => {
  logger.error('🔥 Exceção não capturada:', error);
  logger.error('Stack:', error.stack);

  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('🔥 Promise rejeitada não tratada:', reason);
  logger.error('Promise:', promise);

  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Manipuladores de sinal para graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`📴 Recebido sinal ${signal}. Iniciando shutdown graceful...`);

  // Aqui você poderia adicionar lógica adicional de limpeza
  // Por exemplo, fechar conexões de banco de dados, etc.

  setTimeout(() => {
    logger.info('👋 Servidor encerrado');
    process.exit(0);
  }, 5000); // 5 segundos para cleanup
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Iniciar aplicação se executado diretamente
if (require.main === module) {
  startServer();
}

export default PortfolioServer;
