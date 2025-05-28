// ===== src/app.ts =====
import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import ConnectRedis from 'connect-redis';
import path from 'path';
import cors from 'cors';

import { redisClient } from './config/redis';
import { config } from './config/environment';
import { DatabaseService } from './services/DatabaseService';
import { LoggerService } from './services/LoggerService';
import { HealthCheckService } from './services/HealthCheckService';
import { SocketService } from './services/SocketService';
import { ErrorHandlerMiddleware } from './middlewares/errorHandler';
import { LoggerMiddleware } from './middlewares/loggerMiddleware';

import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';

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
        credentials: config.cors.credentials,
        methods: config.cors.methods
      }
    });

    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupSocketService();
  }

  private setupMiddlewares(): void {
    // CORS
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: config.cors.credentials,
      methods: config.cors.methods,
      allowedHeaders: config.cors.allowedHeaders
    }));

    // Adicionar ID único a cada requisição
    this.app.use(LoggerMiddleware.requestId());
    
    // Logging de requisições
    this.app.use(LoggerMiddleware.requestLogger());
    
    // Compressão de resposta - CORRIGIDO
    this.app.use(compression());
    
    // Trust proxy (para obter IP real atrás de proxies)
    this.app.set('trust proxy', 1);
    
    // Parsing de JSON e URL-encoded
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Cookies
    this.app.use(cookieParser(config.session?.secret));
    
    // Configurar session com Redis se habilitado - CORRIGIDO
    if (config.session?.enabled && redisClient) {
      const RedisStore = new ConnectRedis({
        client: redisClient,
        prefix: 'sess:'
      });
      
      this.app.use(session({
        store: RedisStore,
        secret: config.session.secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: config.session.maxAge
        }
      }));
    }
    
    // Headers de segurança básicos
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });
    
    // Servir arquivos estáticos
    this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
    
    // Swagger API docs - CORRIGIDO
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  private setupRoutes(): void {
    // Endpoint de health check simples
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        const status = await this.healthService.getStatusSummary();
        res.status(status.status === 'healthy' ? 200 : 503).json(status);
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Health check failed'
        });
      }
    });
    
    // Rotas da API
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/public', publicRoutes);
    this.app.use('/api/admin', adminRoutes);
    
    // Rota raiz
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'Portfolio API',
        version: process.env.npm_package_version || '1.0.0',
        environment: config.environment,
        docs: '/docs',
        status: 'running'
      });
    });
  }

  private setupErrorHandling(): void {
    // Rota não encontrada (404)
    this.app.use(ErrorHandlerMiddleware.notFound);
    
    // Handler de erros global
    this.app.use(ErrorHandlerMiddleware.handleError);
  }

  private setupSocketService(): void {
    // Inicializar serviço de WebSocket
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
      const port = config.port;
      this.server.listen(port, () => {
        this.logger.info(`🚀 Servidor iniciado na porta ${port}`);
        this.logger.info(`📚 Documentação API: http://localhost:${port}/docs`);
        this.logger.info(`🌍 Ambiente: ${config.environment}`);
      });
    } catch (error) {
      this.logger.error('Falha ao iniciar aplicação:', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      this.logger.info('Iniciando shutdown graceful...');
      
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
      this.logger.error('Erro durante o shutdown:', error);
      throw error;
    }
  }
}