// ===== src/services/DatabaseService.ts =====
import mongoose, { Connection } from 'mongoose';
import { config } from '../config/environment';
import { LoggerService } from './LoggerService';

export class DatabaseService {
  private static instance: DatabaseService;
  private connection: Connection | null = null;
  private logger = LoggerService.getInstance();
  private isConnecting = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.connection?.readyState === 1) {
      this.logger.info('MongoDB já está conectado');
      return;
    }
    if (this.isConnecting) {
      this.logger.info('Conexão com MongoDB já está em andamento');
      return;
    }
    try {
      this.isConnecting = true;
      await mongoose.connect(config.database.mongodb.uri, config.database.mongodb.options);
      this.connection = mongoose.connection;
      this.setupEventHandlers();
      this.logger.info('✅ MongoDB conectado com sucesso');
    } catch (error) {
      this.logger.error('❌ Falha ao conectar com MongoDB:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.on('connected', () => {
      this.logger.info('MongoDB conectado');
    });

    this.connection.on('error', (error) => {
      this.logger.error('❌ Erro de conexão MongoDB:', error);
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB desconectado');
    });

    this.connection.on('reconnected', () => {
      this.logger.info('MongoDB reconectado');
    });
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      this.logger.info('Conexão MongoDB fechada');
    }
  }

  public getConnection(): Connection | null {
    return this.connection;
  }

  public async isHealthy(): Promise<boolean> {
    try {
      if (!this.connection) return false;
      // 1 = connected, 2 = connecting
      const isConnected = [1, 2].includes(this.connection.readyState);
      
      if (isConnected && this.connection.db) {
        // Test with a simple operation
        await this.connection.db.admin().ping();
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }
}