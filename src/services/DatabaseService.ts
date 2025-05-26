import mongoose, { Connection } from 'mongoose';
import { config } from '../config/environment';
import { LoggerService } from './LoggerService';

export class DatabaseService {
  private static instance: DatabaseService;
  private connection: Connection | null = null;
  private logger = LoggerService.getInstance();

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    try {
      await mongoose.connect(config.database.mongodb.uri, config.database.mongodb.options);
      this.connection = mongoose.connection;
      this.logger.info('✅ MongoDB connected successfully');

      this.connection.on('error', (error) => {
        this.logger.error('❌ MongoDB connection error:', error);
      });

      this.connection.on('disconnected', () => {
        this.logger.warn('MongoDB disconnected');
      });
    } catch (error) {
      this.logger.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      await mongoose.disconnect();
      this.logger.info('MongoDB connection closed');
    }
  }

  public getConnection(): Connection | null {
    return this.connection;
  }

  public getMongo(): Connection | null {
    return this.connection;
  }

  public async isHealthy(): Promise<boolean> {
    try {
      if (!this.connection) return false;
      // 1 = connected, 2 = connecting
      return [1, 2].includes(this.connection.readyState);
    } catch {
      return false;
    }
  }
}
