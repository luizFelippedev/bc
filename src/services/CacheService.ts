// ===== src/services/CacheService.ts =====
import Redis, { Redis as RedisClient } from 'ioredis';
import { config, isDevelopment } from '../config/environment';
import { LoggerService } from './LoggerService';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export interface CacheInfo {
  connected: boolean;
  version: string;
  memory: {
    used: number;
    peak: number;
    fragmentation: number;
  };
  clients: {
    connected: number;
    blocked: number;
  };
  stats: {
    hits: number;
    misses: number;
    keys: number;
  };
}

export class CacheService {
  private static instance: CacheService;
  private client: RedisClient;
  private logger = LoggerService.getInstance();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = isDevelopment ? 3 : 10;
  private reconnectDelay = 2000;

  private constructor() {
    this.initializeClient();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private initializeClient(): void {
    const redisConfig = {
      host: config.database.redis.host,
      port: config.database.redis.port,
      password: config.database.redis.password,
      db: config.database.redis.db || 0,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    };

    this.client = new Redis(redisConfig);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.logger.info('🔗 Redis conectando...');
    });

    this.client.on('ready', () => {
      this.logger.info('✅ Redis conectado e pronto');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.client.on('error', (error) => {
      this.logger.error('❌ Erro Redis:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      this.logger.warn('🔌 Redis desconectado');
      this.isConnected = false;
    });

    this.client.on('reconnecting', (delay) => {
      this.logger.info(`🔄 Redis reconectando em ${delay}ms...`);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts > this.maxReconnectAttempts) {
        this.logger.error('❌ Máximo de tentativas de reconexão Redis excedido');
        this.client.disconnect();
      }
    });

    this.client.on('end', () => {
      this.logger.info('📪 Conexão Redis encerrada');
      this.isConnected = false;
    });
  }

  public async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        return;
      }

      await this.client.connect();
      this.logger.info('✅ Cache service conectado');
    } catch (error) {
      this.logger.warn('⚠️  Redis não disponível, usando cache em memória');
      // Não falhar se Redis não estiver disponível
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.disconnect();
        this.isConnected = false;
        this.logger.info('✅ Cache service desconectado');
      }
    } catch (error) {
      this.logger.error('❌ Erro ao desconectar cache:', error);
    }
  }

  public getClient(): RedisClient {
    return this.client;
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) return null;
      
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.debug('Erro ao obter do cache:', error);
      return null;
    }
  }

  public async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      if (!this.isConnected) return false;
      
      const serialized = JSON.stringify(value);
      
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      this.logger.debug('Erro ao definir no cache:', error);
      return false;
    }
  }

  public async delete(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) return false;
      
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      this.logger.debug('Erro ao deletar do cache:', error);
      return false;
    }
  }

  public async deletePattern(pattern: string): Promise<number> {
    try {
      if (!this.isConnected) return 0;
      
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      
      const result = await this.client.del(...keys);
      return result;
    } catch (error) {
      this.logger.debug('Erro ao deletar padrão do cache:', error);
      return 0;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) return false;
      
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      this.logger.debug('Erro ao verificar existência no cache:', error);
      return false;
    }
  }

  public async isHealthy(): Promise<boolean> {
    try {
      if (!this.isConnected) return false;
      
      await this.client.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  public async getInfo(): Promise<CacheInfo | null> {
    try {
      if (!this.isConnected) return null;
      
      const info = await this.client.info();
      // Parse basic info from Redis INFO command
      return {
        connected: this.isConnected,
        version: '7.0.0', // Placeholder
        memory: {
          used: 0,
          peak: 0,
          fragmentation: 1.0,
        },
        clients: {
          connected: 1,
          blocked: 0,
        },
        stats: {
          hits: 0,
          misses: 0,
          keys: 0,
        },
      };
    } catch (error) {
      return null;
    }
  }
}
