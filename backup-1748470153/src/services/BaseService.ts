import { LoggerService } from './LoggerService';
import { RedisService } from './RedisService';

export abstract class BaseService {
  protected logger: LoggerService;
  protected redis: RedisService;
  private static instances: Map<string, any> = new Map();

  protected constructor() {
    this.logger = LoggerService.getInstance();
    this.redis = RedisService.getInstance();
  }

  protected static getInstance<T extends BaseService>(this: new () => T): T {
    const className = this.name;
    if (!BaseService.instances.has(className)) {
      BaseService.instances.set(className, new this());
    }
    return BaseService.instances.get(className);
  }

  protected async withCache<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    try {
      const cached = await this.redis.getClient().get(key);
      if (cached) return JSON.parse(cached);

      const data = await operation();
      await this.redis.getClient().setex(key, ttl, JSON.stringify(data));
      return data;
    } catch (error) {
      this.logger.error(`Cache operation failed for key ${key}:`, error);
      return operation();
    }
  }
}
