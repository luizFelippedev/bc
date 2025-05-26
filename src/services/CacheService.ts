import Redis from 'ioredis';
import { LoggerService } from './LoggerService';

export class CacheService {
  private static instance: CacheService;
  private client: Redis;
  private logger = LoggerService.getInstance();

  private constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3
    });

    this.client.on('error', (error) => {
      this.logger.error('Erro na conexão Redis:', error);
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Obter valor do cache
   */
  public async get(key: string): Promise<any> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Erro ao obter cache para chave ${key}:`, error);
      return null;
    }
  }

  /**
   * Definir valor no cache
   */
  public async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      this.logger.error(`Erro ao definir cache para chave ${key}:`, error);
    }
  }

  /**
   * Excluir chave do cache
   */
  public async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Erro ao excluir cache para chave ${key}:`, error);
    }
  }

  /**
   * Excluir chaves com padrão
   */
  public async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Erro ao excluir cache com padrão ${pattern}:`, error);
    }
  }

  /**
   * Limpar todo o cache
   */
  public async flushAll(): Promise<void> {
    try {
      await this.client.flushall();
    } catch (error) {
      this.logger.error('Erro ao limpar todo o cache:', error);
    }
  }
}