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
   * Decrementar valor numérico
   */
  public async decrement(key: string, by: number = 1, options?: CacheOptions): Promise<number> {
    try {
      const fullKey = this.buildKey(key, options?.namespace);
      const result = await this.client.decrby(fullKey, by);
      
      // Definir TTL se especificado
      if (options?.ttl) {
        await this.client.expire(fullKey, options.ttl);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Erro ao decrementar chave ${key}:`, error);
      return 0;
    }
  }

  /**
   * Operação batch para definir múltiplas chaves
   */
  public async setBatch(items: BatchSetItem[], namespace?: string): Promise<boolean> {
    try {
      const pipeline = this.client.pipeline();
      
      for (const item of items) {
        const fullKey = this.buildKey(item.key, namespace);
        const serializedValue = JSON.stringify(item.value);
        const ttl = item.ttl || this.defaultTTL;
        
        if (ttl > 0) {
          pipeline.setex(fullKey, ttl, serializedValue);
        } else {
          pipeline.set(fullKey, serializedValue);
        }
      }
      
      const results = await pipeline.exec();
      const success = results?.every(result => result && result[0] === null);
      
      this.logger.debug(`Batch set executado para ${items.length} items`);
      return success || false;
    } catch (error) {
      this.logger.error('Erro ao executar batch set:', error);
      return false;
    }
  }

  /**
   * Operação batch para obter múltiplas chaves
   */
  public async getBatch<T = any>(keys: string[], namespace?: string): Promise<Record<string, T | null>> {
    try {
      const fullKeys = keys.map(key => this.buildKey(key, namespace));
      const values = await this.client.mget(...fullKeys);
      
      const result: Record<string, T | null> = {};
      
      keys.forEach((key, index) => {
        const value = values[index];
        result[key] = value ? JSON.parse(value) : null;
      });
      
      this.logger.debug(`Batch get executado para ${keys.length} chaves`);
      return result;
    } catch (error) {
      this.logger.error('Erro ao executar batch get:', error);
      return {};
    }
  }

  /**
   * Limpar todo o cache
   */
  public async flushAll(): Promise<boolean> {
    try {
      await this.client.flushall();
      this.logger.warn('Todo o cache foi limpo');
      return true;
    } catch (error) {
      this.logger.error('Erro ao limpar todo o cache:', error);
      return false;
    }
  }

  /**
   * Limpar apenas as chaves com o prefixo do projeto
   */
  public async flushNamespace(namespace?: string): Promise<number> {
    const pattern = namespace ? `${namespace}:*` : '*';
    return await this.deletePattern(pattern);
  }

  /**
   * Obter estatísticas do cache
   */
  public async getStats(): Promise<CacheStats> {
    try {
      const info = await this.client.info('stats', 'memory', 'clients');
      const lines = info.split('\r\n');
      
      const stats: Record<string, string> = {};
      lines.forEach(line => {
        const [key, value] = line.split(':');
        if (key && value) {
          stats[key] = value;
        }
      });

      const keyspaceHits = parseInt(stats.keyspace_hits || '0');
      const keyspaceMisses = parseInt(stats.keyspace_misses || '0');
      const total = keyspaceHits + keyspaceMisses;
      const hitRate = total > 0 ? ((keyspaceHits / total) * 100).toFixed(2) + '%' : '0%';

      return {
        totalKeys: await this.client.dbsize(),
        memoryUsage: this.formatBytes(parseInt(stats.used_memory || '0')),
        connectedClients: parseInt(stats.connected_clients || '0'),
        keyspaceHits,
        keyspaceMisses,
        hitRate
      };
    } catch (error) {
      this.logger.error('Erro ao obter estatísticas do cache:', error);
      return {
        totalKeys: 0,
        memoryUsage: '0 B',
        connectedClients: 0,
        keyspaceHits: 0,
        keyspaceMisses: 0,
        hitRate: '0%'
      };
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
      
      const [exists, type, ttl, size] = await Promise.all([
        this.client.exists(fullKey),
        this.client.type(fullKey),
        this.client.ttl(fullKey),
        this.client.memory('usage', fullKey).catch(() => null)
      ]);

      return {
        exists: exists === 1,
        type,
        ttl,
        size: size || undefined
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

  /**
   * Definir TTL padrão
   */
  public setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
    this.logger.debug(`TTL padrão definido para ${ttl} segundos`);
  }

  /**
   * Obter TTL padrão
   */
  public getDefaultTTL(): number {
    return this.defaultTTL;
  }
}