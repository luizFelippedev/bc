// src/app.ts - Arquivo principal de inicialização
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config/environment';
import { DatabaseService } from './services/DatabaseService';
import { LoggerService } from './services/LoggerService';
import { errorHandler } from './middleware/errorHandler';
import { setupRoutes } from './routes';
import { setupMiddlewares } from '@/middlewares';

export class App {
  private app: Application;
  private server: any;
  private io: SocketIOServer;
  private logger = LoggerService.getInstance();
  private database = DatabaseService.getInstance();

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.setupServer();
  }

  private setupServer(): void {
    this.setupSocketIO();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupSocketIO(): void {
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.cors.origins,
        credentials: true
      }
    });
  }

  private setupMiddlewares(): void {
    setupMiddlewares(this.app);
  }

  private setupRoutes(): void {
    setupRoutes(this.app);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      await this.database.connect();
      
      this.server.listen(config.port, () => {
        this.logger.info(`🚀 Server running on port ${config.port}`);
        this.logger.info(`📚 API Documentation: http://localhost:${config.port}/docs`);
      });
    } catch (error) {
      this.logger.error('Failed to start server:', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      await this.database.disconnect();
      this.server.close();
      this.logger.info('Server shutdown completed');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      throw error;
    }
  }
}

const app = new App();
app.start();