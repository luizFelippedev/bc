import Redis from 'ioredis';
import { config } from './environment';
import { LoggerService } from '../services/LoggerService';

const logger = LoggerService.getInstance();

export const createRedisClient = () => {
  const redis = new Redis({
    host: config.database.redis.host,
    port: config.database.redis.port,
    password: config.database.redis.password,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      logger.warn(`Retrying Redis connection in ${delay}ms...`);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true
  });

  redis.on('connect', () => {
    logger.info('✅ Redis connected successfully');
  });

  redis.on('error', (error) => {
    logger.error('❌ Redis connection error:', error);
  });

  return redis;
};

export const redisClient = createRedisClient();
