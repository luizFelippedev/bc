// src/config/environment.ts - Configuração Empresarial
import { ConnectOptions } from 'mongoose';

export interface AppConfig {
  port: number;
  environment: string;
  database: {
    mongodb: {
      uri: string;
      options: ConnectOptions;
    };
    redis: {
      host: string;
      port: number;
      password?: string;
    };
  };
  cors: {
    origins: string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshToken: {
      secret: string;
      expiresIn: string;
    };
  };
  uploads: {
    path: string;
    maxSize: number;
    allowedTypes: string[];
  };
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5001'),
  environment: process.env.NODE_ENV || 'development',
  
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    }
  },

  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '1h',
    refreshToken: {
      secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      expiresIn: '7d'
    }
  },

  uploads: {
    path: 'uploads',
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  }
};