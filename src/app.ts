// src/app.ts
import express, { Application } from 'express';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import RedisStore from 'connect-redis';
import path from 'path';
import { redisClient } from './config/redis';
import { config } from './config/environment';
import { DatabaseService } from './services/DatabaseService';
import { LoggerService } from './services/LoggerService';
import { SecurityConfig } from './config/security';
import { ErrorHandlerMiddleware } from './middlewares/errorHandler';
import { LoggerMiddleware } from './middlewares/loggerMiddleware';
import { HealthCheckService } from './services/HealthCheckService';
import { SocketService } from './services/SocketService';
import router from './routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

export class App {
  private app: Application;
  private server: HttpServer;
  private io: SocketIOServer;
  private logger = LoggerService.getInstance();
  private database = DatabaseService.getInstance();
  private healthService = HealthCheckService.getInstance();
  private socketService: SocketService | null = null;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.cors.origins,
        credentials: true
      }
    });

    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupSocketService();
  }

  private setupMiddlewares(): void {
    // Adicionar ID único a cada requisição
    this.app.use(LoggerMiddleware.requestId());
    
    // Logging de requisições
    this.app.use(LoggerMiddleware.requestLogger());
    
    // Compressão de resposta
    this.app.use(compression());
    
    // Parsing de JSON e URL-encoded
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Cookies e sessão
    this.app.use(cookieParser(config.session?.secret));
    
    // Configurar session com Redis
    if (config.session?.enabled) {
      this.app.use(session({
        store: new RedisStore({ client: redisClient }),
        secret: config.session.secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: config.session.maxAge || 86400000 // 1 dia
        }
      }));
    }
    
    // Configurações de segurança
    SecurityConfig.setup(this.app);
    
    // Servir arquivos estáticos
    this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
    
    // Swagger API docs
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  private setupRoutes(): void {
    // Endpoint de health check simples
    this.app.get('/health', async (req, res) => {
      const status = await this.healthService.getStatusSummary();
      res.status(status.status === 'healthy' ? 200 : 503).json(status);
    });
    
    // Rotas da API
    this.app.use('/api', router);
  }

  private setupErrorHandling(): void {
    // Rota não encontrada (404)
    this.app.use(ErrorHandlerMiddleware.notFound);
    
    // Handler de erros global
    this.app.use(ErrorHandlerMiddleware.handleError);
    
    // Configurar handlers para exceções não capturadas
    ErrorHandlerMiddleware.setupUncaughtHandlers();
  }

  private setupSocketService(): void {
    // Inicializar serviço de WebSocket para dashboard em tempo real
    this.socketService = SocketService.getInstance(this.io);
    this.socketService.initialize();
    this.logger.info('Serviço WebSocket inicializado');
  }

  public async start(): Promise<void> {
    try {
      // Conectar ao banco de dados
      await this.database.connect();
      
      // Iniciar monitoramento de saúde
      this.healthService.startMonitoring();
      
      // Iniciar servidor
      const port = config.port || 5000;
      this.server.listen(port, () => {
        this.logger.info(`🚀 Servidor iniciado na porta ${port}`);
        this.logger.info(`📚 Documentação API: http://localhost:${port}/docs`);
        this.logger.info(`🌍 Ambiente: ${process.env.NODE_ENV}`);
        this.logger.info(`👤 Acesso admin: http://localhost:${port}/admin`);
      });
    } catch (error) {
      this.logger.error('Falha ao iniciar aplicação:', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      this.logger.info('Iniciando desligamento do servidor...');
      
      // Parar monitoramento de saúde
      this.healthService.stopMonitoring();
      
      // Desconectar WebSockets
      this.io.disconnectSockets(true);
      
      // Fechar servidor HTTP
      await new Promise<void>((resolve, reject) => {
        this.server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      
      // Desconectar do banco de dados
      await this.database.disconnect();
      
      this.logger.info('Servidor desligado com sucesso');
    } catch (error) {
      this.logger.error('Erro durante o desligamento do servidor:', error);
      throw error;
    }
  }
  
  // Getter para facilitar testes
  public getApp(): Application {
    return this.app;
  }
  
  public getServer(): HttpServer {
    return this.server;
  }
  
  public getSocketIO(): SocketIOServer {
    return this.io;
  }
}