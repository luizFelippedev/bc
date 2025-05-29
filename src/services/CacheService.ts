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