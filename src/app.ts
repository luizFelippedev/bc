// src/app.ts - Aplicação principal
import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import ConnectRedis from 'connect-redis';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';

import { config } from './config/environment';
import { LoggerService } from './services/LoggerService';
import { HealthCheckService } from './services/HealthCheckService';
import { SocketService } from './services/SocketService';
import { CacheService } from './services/CacheService';
import { ErrorHandlerMiddleware } from './middlewares/errorHandler';
import { LoggerMiddleware } from './middlewares/loggerMiddleware';

import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import { healthRoutes } from './routes/health';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

export class App {
  private app: Application;
  private server: HttpServer;
  private io: SocketIOServer;
  private logger = LoggerService.getInstance();
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
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: false // Desabilitar para Swagger
    }));

    // CORS
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: config.cors.credentials,
      methods: config.cors.methods,
      allowedHeaders: config.cors.allowedHeaders
    }));

    // Trust proxy (para obter IP real atrás de proxies)
    this.app.set('trust proxy', 1);

    // Compression
    this.app.use(compression());
    
    // Request ID e logging
    this.app.use(LoggerMiddleware.requestId());
    this.app.use(LoggerMiddleware.requestLogger());
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Cookies
    this.app.use(cookieParser(config.session?.secret));
    
    // Session com Redis (se disponível)
    this.setupSession();
    
    // Static files
    this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
    
    // Swagger docs
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  private setupSession(): void {
    if (config.session?.enabled) {
      try {
        const cacheService = CacheService.getInstance();
        const RedisStore = ConnectRedis(session);
        
        this.app.use(session({
          store: new RedisStore({ 
            client: cacheService.getClient() as any,
            prefix: 'sess:'
          }),
          secret: config.session.secret,
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: config.session.maxAge
          }
        }));
        
        this.logger.info('✅ Session configurada com Redis');
      } catch (error) {
        this.logger.warn('⚠️  Session configurada sem Redis (in-memory):', error);
        
        // Fallback para session em memória
        this.app.use(session({
          secret: config.session.secret,
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: false,
            httpOnly: true,
            maxAge: config.session.maxAge
          }
        }));
      }
    }
  }

  private setupRoutes(): void {
    // Health check
    this.app.use('/health', healthRoutes);
    
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/public', publicRoutes);
    this.app.use('/api/admin', adminRoutes);
    
    // Root route
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'Portfolio API',
        version: process.env.npm_package_version || '1.0.0',
        environment: config.environment,
        docs: '/docs',
        health: '/health',
        status: 'running',
        timestamp: new Date().toISOString()
      });
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(ErrorHandlerMiddleware.notFound);
    
    // Global error handler
    this.app.use(ErrorHandlerMiddleware.handleError);
  }

  private setupSocketService(): void {
    try {
      this.socketService = SocketService.getInstance(this.io);
      this.socketService.initialize();
      this.logger.info('✅ WebSocket service inicializado');
    } catch (error) {
      this.logger.error('❌ Erro ao inicializar WebSocket:', error);
    }
  }

  public async start(): Promise<void> {
    try {
      // Iniciar monitoramento de saúde
      this.healthService.startMonitoring();
      
      // Iniciar servidor
      const port = config.port;
      await new Promise<void>((resolve) => {
        this.server.listen(port, () => {
          this.logger.info(`🚀 Servidor iniciado na porta ${port}`);
          resolve();
        });
      });
      
    } catch (error) {
      this.logger.error('❌ Falha ao iniciar aplicação:', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      this.logger.info('📴 Iniciando shutdown graceful...');
      
      // Parar monitoramento
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
      
      this.logger.info('✅ Shutdown concluído');
    } catch (error) {
      this.logger.error('❌ Erro durante shutdown:', error);
      throw error;
    }
  }

  public getApp(): Application {
    return this.app;
  }

  public getServer(): HttpServer {
    return this.server;
  }
}