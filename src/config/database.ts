// src/config/database.ts - MongoDB connection
import mongoose from 'mongoose';
import { config } from './environment';
import { LoggerService } from '../services/LoggerService';

const logger = LoggerService.getInstance();

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.database.mongodb.uri, config.database.mongodb.options);
    
    mongoose.connection.on('connected', () => {
      logger.info('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

// src/config/redis.ts - Redis connection
import { createClient } from 'redis';
import { logger } from '../utils/logger';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    logger.info('✅ Redis connected successfully');
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
};