// ===== src/services/DatabaseService.ts =====
import mongoose, { Connection } from 'mongoose';
import { config, isDevelopment } from '../config/environment';
import { LoggerService } from './LoggerService';

export class DatabaseService {
  private static instance: DatabaseService;
  private connection: Connection | null = null;
  private logger = LoggerService.getInstance();
  private isConnecting = false;
  private connectionAttempts = 0;
  private maxRetries = isDevelopment ? 3 : 5;
  private retryDelay = isDevelopment ? 3000 : 5000;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.setupProcessHandlers();
  }

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

    await this.attemptConnection();
  }

  private async attemptConnection(): Promise<void> {
    this.isConnecting = true;
    
    try {
      this.logger.info(`Tentando conectar ao MongoDB (tentativa ${this.connectionAttempts + 1}/${this.maxRetries})`);
      
      // Usar as opções de conexão da configuração
      await mongoose.connect(config.database.mongodb.uri, config.database.mongodb.options);
      
      this.connection = mongoose.connection;
      this.setupEventHandlers();
      this.startHealthCheck();
      this.connectionAttempts = 0;
      
      this.logger.info('✅ MongoDB conectado com sucesso');
      this.logger.info(`🏷️  Database: ${this.connection.name}`);
      this.logger.info(`🖥️  Host: ${this.connection.host}:${this.connection.port}`);
      
      // Clear any existing reconnect interval
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
      
    } catch (error) {
      this.logger.error(`❌ Falha ao conectar com MongoDB (tentativa ${this.connectionAttempts + 1}):`, error);
      
      this.connectionAttempts++;
      
      if (this.connectionAttempts < this.maxRetries) {
        this.logger.info(`Tentando reconectar em ${this.retryDelay / 1000} segundos...`);
        
        setTimeout(() => {
          this.attemptConnection();
        }, this.retryDelay);
      } else {
        this.logger.error(`❌ Falha ao conectar após ${this.maxRetries} tentativas`);
        
        if (!isDevelopment) {
          throw new Error(`Failed to connect to MongoDB after ${this.maxRetries} attempts`);
        } else {
          // Em desenvolvimento, continue tentando em intervalos maiores
          this.logger.warn('⚠️  Modo desenvolvimento: continuando tentativas de reconexão...');
          this.scheduleReconnect();
        }
      }
    } finally {
      this.isConnecting = false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.on('connected', () => {
      this.logger.info('🔗 MongoDB conectado');
      this.connectionAttempts = 0;
    });

    this.connection.on('error', (error) => {
      this.logger.error('❌ Erro de conexão MongoDB:', error);
      
      // Em produção, tente reconectar imediatamente em caso de erro
      if (!isDevelopment && !this.isConnecting) {
        this.scheduleReconnect();
      }
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('🔌 MongoDB desconectado');
      this.stopHealthCheck();
      
      if (!this.isConnecting && !this.reconnectInterval) {
        this.scheduleReconnect();
      }
    });

    this.connection.on('reconnected', () => {
      this.logger.info('🔄 MongoDB reconectado');
      this.connectionAttempts = 0;
      this.startHealthCheck();
    });

    this.connection.on('close', () => {
      this.logger.info('📪 Conexão MongoDB fechada');
      this.stopHealthCheck();
    });

    // Eventos específicos para debugging em desenvolvimento
    if (isDevelopment) {
      this.connection.on('connecting', () => {
        this.logger.debug('🔄 Conectando ao MongoDB...');
      });

      this.connection.on('disconnecting', () => {
        this.logger.debug('🔌 Desconectando do MongoDB...');
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectInterval) {
      return; // Já existe um agendamento
    }

    const delay = Math.min(this.retryDelay * Math.pow(2, this.connectionAttempts), 30000); // Max 30s
    
    this.reconnectInterval = setTimeout(() => {
      this.logger.info('🔄 Tentando reconectar automaticamente...');
      this.reconnectInterval = null;
      this.connectionAttempts = 0;
      this.attemptConnection();
    }, delay);
  }

  private startHealthCheck(): void {
    if (this.healthCheckInterval || !this.connection) {
      return;
    }

    // Health check a cada 30 segundos
    this.healthCheckInterval = setInterval(async () => {
      try {
        const isHealthy = await this.isHealthy();
        if (!isHealthy) {
          this.logger.warn('⚠️  Health check falhou - conexão pode estar instável');
        }
      } catch (error) {
        this.logger.error('❌ Erro durante health check:', error);
      }
    }, 30000);
  }

  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private setupProcessHandlers(): void {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    
    signals.forEach(signal => {
      process.on(signal, () => {
        this.gracefulShutdown(signal);
      });
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      this.logger.error('❌ Uncaught Exception:', error);
      this.gracefulShutdown('uncaughtException');
    });
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    this.logger.info(`🛑 ${signal} recebido, iniciando encerramento gracioso...`);
    
    try {
      // Parar health check
      this.stopHealthCheck();
      
      // Cancelar reconexões agendadas
      if (this.reconnectInterval) {
        clearTimeout(this.reconnectInterval);
        this.reconnectInterval = null;
      }
      
      // Fechar conexão do banco
      await this.disconnect();
      
      this.logger.info('✅ Encerramento gracioso concluído');
    } catch (error) {
      this.logger.error('❌ Erro durante encerramento gracioso:', error);
    } finally {
      process.exit(0);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      this.stopHealthCheck();
      
      if (this.reconnectInterval) {
        clearTimeout(this.reconnectInterval);
        this.reconnectInterval = null;
      }

      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        this.logger.info('✅ Conexão MongoDB fechada com sucesso');
      }
    } catch (error) {
      this.logger.error('❌ Erro ao fechar conexão MongoDB:', error);
      throw error;
    }
  }

  public getConnection(): Connection | null {
    return this.connection;
  }

  public async isHealthy(): Promise<boolean> {
    try {
      if (!this.connection) {
        return false;
      }

      const readyState = this.connection.readyState;
      if (readyState !== 1) { // 1 = connected
        return false;
      }

      // Teste com operação simples com timeout
      if (this.connection.db) {
        const startTime = Date.now();
        await this.connection.db.admin().ping();
        const responseTime = Date.now() - startTime;
        
        // Log tempo de resposta se for muito alto
        if (responseTime > 1000) {
          this.logger.warn(`⚠️  Health check lento: ${responseTime}ms`);
        }
        
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('❌ Health check falhou:', error);
      return false;
    }
  }

  public async getConnectionInfo(): Promise<{
    readyState: number;
    readyStateText: string;
    host: string;
    port: number;
    name: string;
    connected: boolean;
  } | null> {
    if (!this.connection) {
      return null;
    }

    return {
      readyState: this.connection.readyState,
      readyStateText: this.getReadyStateText(),
      host: this.connection.host,
      port: this.connection.port,
      name: this.connection.name,
      connected: this.connection.readyState === 1,
    };
  }

  public getReadyStateText(): string {
    if (!this.connection) {
      return 'No connection';
    }

    const states = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };

    return states[this.connection.readyState as keyof typeof states] || 'Unknown';
  }

  public async forceReconnect(): Promise<void> {
    this.logger.info('🔄 Forçando reconexão...');
    
    try {
      await this.disconnect();
    } catch (error) {
      this.logger.warn('⚠️  Erro ao desconectar antes da reconexão:', error);
    }

    this.connectionAttempts = 0;
    await this.connect();
  }

  public async getStats(): Promise<{
    connections: {
      available: number;
      current: number;
      created: number;
    };
    collections: number;
    indexes: number;
  } | null> {
    try {
      if (!this.connection?.db) {
        return null;
      }

      const admin = this.connection.db.admin();
      const serverStatus = await admin.serverStatus();
      const collections = await this.connection.db.listCollections().toArray();
      
      // Contar índices
      let totalIndexes = 0;
      for (const collection of collections) {
        const indexes = await this.connection.db.collection(collection.name).indexes();
        totalIndexes += indexes.length;
      }

      return {
        connections: {
          available: serverStatus.connections?.available || 0,
          current: serverStatus.connections?.current || 0,
          created: serverStatus.connections?.totalCreated || 0,
        },
        collections: collections.length,
        indexes: totalIndexes,
      };
    } catch (error) {
      this.logger.error('❌ Erro ao obter estatísticas:', error);
      return null;
    }
  }
}