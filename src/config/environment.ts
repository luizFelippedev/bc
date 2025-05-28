// ===== src/config/environment.ts =====
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
  session?: {
    secret: string;
    maxAge: number;
    enabled: boolean;
  };
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000'),
  environment: process.env.NODE_ENV || 'development',
  
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || '',
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      } as ConnectOptions
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    }
  },

  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  },

  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    refreshToken: {
      secret: process.env.JWT_REFRESH_SECRET || '',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  },

  uploads: {
    path: process.env.UPLOAD_PATH || 'uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB
    allowedTypes: [
      'image/jpeg', 
      'image/png', 
      'image/webp', 
      'image/gif',
      'application/pdf'
    ]
  },

  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 hours
    enabled: process.env.SESSION_ENABLED === 'true'
  }
};