// src/services/CacheService.ts - Serviço de Cache com fallback
import Redis from 'ioredis';
import { LoggerService } from './LoggerService';
import { config } from '../config/environment';

interface CacheOptions {
  ttl?: number;
  namespace?: string;
}

export class CacheService {
  private static instance: CacheService;
  private client: Redis | null = null;
  private memoryCache: Map<string, { value: any; expires: number }> = new Map();
  private logger = LoggerService.getInstance();
  private isConnected: boolean = false;
  private defaultTTL: number = 3600; // 1 hora
  private keyPrefix: string = 'portfolio:';

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
    try {
      this.client = new Redis({
        host: config.database.redis.host,
        port: config.database.redis.port,
        password: config.database.redis.password,
        retryStrategy: (times: number) => {
          if (times > 3) {
            this.logger.warn('Redis: Desistindo de reconectar após 3 tentativas');
            return null;
          }
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 3000,
        keyPrefix: this.keyPrefix
      });

      this.setupEventHandlers();
    } catch (error) {
      this.logger.warn('Redis não disponível, usando cache em memória:', error);
      this.client = null;
    }
  }

  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.info('✅ Redis conectado - cache habilitado');
    });

    this.client.on('ready', () => {
      this.logger.debug('Redis pronto para receber comandos');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      this.logger.warn('Redis erro - usando cache em memória:', error);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.logger.warn('Redis desconectado - usando cache em memória');
    });
  }

  public async connect(): Promise<void> {
    if (this.client && !this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        this.logger.warn('Falha ao conectar Redis, continuando com cache em memória:', error);
      }
    }
  }

  public async get<T = any>(key: string, options?: CacheOptions): Promise<T | null> {
    const fullKey = this.buildKey(key, options?.namespace);
    
    try {
      if (this.client && this.isConnected) {
        const data = await this.client.get(fullKey);
        if (data) {
          return JSON.parse(data) as T;
        }
      } else {
        // Fallback para cache em memória
        const cached = this.memoryCache.get(fullKey);
        if (cached && cached.expires > Date.now()) {
          return cached.value as T;
        } else if (cached) {
          this.memoryCache.delete(fullKey);
        }
      }
      
      return null;
    } catch (error) {
      this.logger.debug(`Erro ao obter cache para chave ${key}:`, error);
      return null;
    }
  }

  public async set(key: string, value: any, ttlOrOptions?: number | CacheOptions): Promise<boolean> {
    let options: CacheOptions = {};
    
    if (typeof ttlOrOptions === 'number') {
      options.ttl = ttlOrOptions;
    } else if (ttlOrOptions) {
      options = ttlOrOptions;
    }
    
    const fullKey = this.buildKey(key, options.namespace);
    const ttl = options.ttl || this.defaultTTL;
    
    try {
      if (this.client && this.isConnected) {
        const serializedValue = JSON.stringify(value);
        if (ttl > 0) {
          await this.client.setex(fullKey, ttl, serializedValue);
        } else {
          await this.client.set(fullKey, serializedValue);
        }
      } else {
        // Fallback para cache em memória
        const expires = ttl > 0 ? Date.now() + (ttl * 1000) : Number.MAX_SAFE_INTEGER;
        this.memoryCache.set(fullKey, { value, expires });
        
        // Limpar cache em memória periodicamente
        this.cleanupMemoryCache();
      }
      
      return true;
    } catch (error) {
      this.logger.debug(`Erro ao definir cache para chave ${key}:`, error);
      return false;
    }
  }

  public async delete(key: string, namespace?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, namespace);
    
    try {
      if (this.client && this.isConnected) {
        const result = await this.client.del(fullKey);
        return result > 0;
      } else {
        return this.memoryCache.delete(fullKey);
      }
    } catch (error) {
      this.logger.debug(`Erro ao excluir cache para chave ${key}:`, error);
      return false;
    }
  }

  public async deletePattern(pattern: string, namespace?: string): Promise<number> {
    const fullPattern = this.buildKey(pattern, namespace);
    
    try {
      if (this.client && this.isConnected) {
        const keys = await this.client.keys(fullPattern);
        if (keys.length === 0) return 0;
        
        const cleanKeys = keys.map(key => key.replace(this.keyPrefix, ''));
        const result = await this.client.del(...cleanKeys);
        return result;
      } else {
        // Para cache em memória, usar regex
        let count = 0;
        const regex = new RegExp(fullPattern.replace(/\*/g, '.*'));
        
        for (const [key] of this.memoryCache) {
          if (regex.test(key)) {
            this.memoryCache.delete(key);
            count++;
          }
        }
        
        return count;
      }
    } catch (error) {
      this.logger.debug(`Erro ao excluir cache com padrão ${pattern}:`, error);
      return 0;
    }
  }

  public async exists(key: string, namespace?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, namespace);
    
    try {
      if (this.client && this.isConnected) {
        const result = await this.client.exists(fullKey);
        return result === 1;
      } else {
        const cached = this.memoryCache.get(fullKey);
        return !!(cached && cached.expires > Date.now());
      }
    } catch (error) {
      this.logger.debug(`Erro ao verificar existência da chave ${key}:`, error);
      return false;
    }
  }

  public async isHealthy(): Promise<boolean> {
    try {
      if (this.client && this.isConnected) {
        const response = await this.client.ping();
        return response === 'PONG';
      }
      // Cache em memória sempre está "saudável"
      return true;
    } catch (error) {
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        this.isConnected = false;
        this.logger.info('Redis desconectado');
      }
      
      this.memoryCache.clear();
    } catch (error) {
      this.logger.error('Erro ao desconectar Redis:', error);
    }
  }

  public getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client não está disponível');
    }
    return this.client;
  }

  private buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  private cleanupMemoryCache(): void {
    // Limpar cache em memória expirado a cada 5 minutos
    if (this.memoryCache.size > 100) {
      const now = Date.now();
      for (const [key, cached] of this.memoryCache) {
        if (cached.expires <= now) {
          this.memoryCache.delete(key);
        }
      }
    }
  }
}
