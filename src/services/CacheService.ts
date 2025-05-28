// src/services/CacheService.ts - Serviço de Cache Completo
import Redis from 'ioredis';
import { LoggerService } from './LoggerService';
import { config } from '../config/environment';

interface CacheOptions {
  ttl?: number;
  namespace?: string;
  compress?: boolean;
}

interface BatchSetItem {
  key: string;
  value: any;
  ttl?: number;
}

interface CacheStats {
  totalKeys: number;
  memoryUsage: string;
  connectedClients: number;
  keyspaceHits: number;
  keyspaceMisses: number;
  hitRate: string;
}

export class CacheService {
  private static instance: CacheService;
  private client: Redis;
  private logger = LoggerService.getInstance();
  private isConnected: boolean = false;
  private defaultTTL: number = 3600; // 1 hora por padrão
  private keyPrefix: string = 'portfolio:';

  private constructor() {
    this.client = this.createClient();
    this.setupEventHandlers();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Criar cliente Redis com configurações otimizadas
   */
  private createClient(): Redis {
    return new Redis({
      host: config.database.redis.host,
      port: config.database.redis.port,
      password: config.database.redis.password,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn(`Tentando reconectar Redis em ${delay}ms... (tentativa ${times})`);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      db: 0, // Database padrão
      keyPrefix: this.keyPrefix
    });
  }

  /**
   * Configurar event handlers para monitoramento
   */
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.info('✅ Redis conectado com sucesso');
    });

    this.client.on('ready', () => {
      this.logger.info('Redis pronto para receber comandos');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      this.logger.error('❌ Erro na conexão Redis:', error);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.logger.warn('Conexão Redis fechada');
    });

    this.client.on('reconnecting', (delay: number) => {
      this.logger.info(`Reconectando Redis em ${delay}ms...`);
    });

    this.client.on('end', () => {
      this.isConnected = false;
      this.logger.warn('Conexão Redis encerrada');
    });
  }

  /**
   * Conectar ao Redis
   */
  public async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
      }
    } catch (error) {
      this.logger.error('Falha ao conectar com Redis:', error);
      throw error;
    }
  }

  /**
   * Obter valor do cache
   */
  public async get<T = any>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options?.namespace);
      const data = await this.client.get(fullKey);
      
      if (!data) {
        this.logger.debug(`Cache miss para chave: ${fullKey}`);
        return null;
      }

      this.logger.debug(`Cache hit para chave: ${fullKey}`);
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Erro ao obter cache para chave ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Definir valor no cache
   */
  public async set(key: string, value: any, ttlOrOptions?: number | CacheOptions): Promise<boolean> {
    try {
      let options: CacheOptions = {};
      
      // Se for um número, é o TTL
      if (typeof ttlOrOptions === 'number') {
        options.ttl = ttlOrOptions;
      } else if (ttlOrOptions) {
        options = ttlOrOptions;
      }
      
      const fullKey = this.buildKey(key, options.namespace);
      const ttl = options.ttl || this.defaultTTL;
      const serializedValue = JSON.stringify(value);

      if (ttl > 0) {
        await this.client.setex(fullKey, ttl, serializedValue);
      } else {
        await this.client.set(fullKey, serializedValue);
      }

      this.logger.debug(`Cache definido para chave: ${fullKey} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao definir cache para chave ${key}:`, error);
      return false;
    }
  }

  /**
   * Excluir chave do cache
   */
  public async delete(key: string, namespace?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const result = await this.client.del(fullKey);
      
      this.logger.debug(`Cache excluído para chave: ${fullKey}`);
      return result > 0;
    } catch (error) {
      this.logger.error(`Erro ao excluir cache para chave ${key}:`, error);
      return false;
    }
  }

  /**
   * Excluir chaves com padrão
   */
  public async deletePattern(pattern: string, namespace?: string): Promise<number> {
    try {
      const fullPattern = this.buildKey(pattern, namespace);
      const keys = await this.client.keys(fullPattern);
      
      if (keys.length === 0) {
        return 0;
      }

      // Remover o keyPrefix das chaves retornadas pelo Redis
      const cleanKeys = keys.map(key => key.replace(this.keyPrefix, ''));
      const result = await this.client.del(...cleanKeys);
      
      this.logger.debug(`${result} chaves excluídas com padrão: ${fullPattern}`);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao excluir cache com padrão ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Verificar se uma chave existe
   */
  public async exists(key: string, namespace?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`Erro ao verificar existência da chave ${key}:`, error);
      return false;
    }
  }

  /**
   * Definir TTL para uma chave existente
   */
  public async expire(key: string, ttl: number, namespace?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const result = await this.client.expire(fullKey, ttl);
      return result === 1;
    } catch (error) {
      this.logger.error(`Erro ao definir TTL para chave ${key}:`, error);
      return false;
    }
  }

  /**
   * Obter TTL de uma chave
   */
  public async getTtl(key: string, namespace?: string): Promise<number> {
    try {
      const fullKey = this.buildKey(key, namespace);
      return await this.client.ttl(fullKey);
    } catch (error) {
      this.logger.error(`Erro ao obter TTL da chave ${key}:`, error);
      return -1;
    }
  }

  /**
   * Incrementar valor numérico
   */
  public async increment(key: string, by: number = 1, options?: CacheOptions): Promise<number> {
    try {
      const fullKey = this.buildKey(key, options?.namespace);
      const result = await this.client.incrby(fullKey, by);
      
      // Definir TTL se especificado
      if (options?.ttl) {
        await this.client.expire(fullKey, options.ttl);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Erro ao incrementar chave ${key}:`, error);
      return 0;
    }
  }

  /**
   * Verificar se Redis está saudável
   */
  public async isHealthy(): Promise<boolean> {
    try {
      const response = await this.client.ping();
      return response === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check falhou:', error);
      return false;
    }
  }

  /**
   * Obter informações detalhadas de uma chave
   */
  public async getKeyInfo(key: string, namespace?: string): Promise<{
    exists: boolean;
    type: string;
    ttl: number;
    size?: number;
  }> {
    try {
      const fullKey = this.buildKey(key, namespace);
      
      const [exists, type, ttl] = await Promise.all([
        this.client.exists(fullKey),
        this.client.type(fullKey),
        this.client.ttl(fullKey)
      ]);

      // Tentar obter tamanho, mas não falhar se não conseguir
      let size: number | undefined;
      try {
        size = await this.client.memory('USAGE', fullKey);
      } catch (error) {
        // Ignorar erro se comando MEMORY não estiver disponível
        size = undefined;
      }

      return {
        exists: exists === 1,
        type,
        ttl,
        size
      };
    } catch (error) {
      this.logger.error(`Erro ao obter informações da chave ${key}:`, error);
      return { exists: false, type: 'none', ttl: -1 };
    }
  }

  /**
   * Desconectar do Redis
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.quit();
        this.isConnected = false;
        this.logger.info('Desconectado do Redis');
      }
    } catch (error) {
      this.logger.error('Erro ao desconectar do Redis:', error);
    }
  }

  /**
   * Obter cliente Redis bruto (use com cuidado)
   */
  public getClient(): Redis {
    return this.client;
  }

  /**
   * Construir chave completa com namespace
   */
  private buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  /**
   * Formatar bytes para string legível
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}