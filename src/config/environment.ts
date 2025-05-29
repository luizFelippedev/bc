// ===== src/config/environment.ts =====
import { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

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
      db?: number;
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
  session: {
    secret: string;
    maxAge: number;
    enabled: boolean;
  };
  logging: {
    level: string;
    format: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
  };
}

// Função para validar variáveis de ambiente obrigatórias
function validateRequiredEnvVars(): void {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Verifique seu arquivo .env');
    process.exit(1);
  }
}

// Função para construir opções do MongoDB
function buildMongoOptions(): ConnectOptions {
  const baseOptions: ConnectOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
    family: 4, // IPv4
  };

  // Adicionar opções específicas para desenvolvimento vs produção
  if (process.env.NODE_ENV === 'production') {
    return {
      ...baseOptions,
      retryWrites: true,
      w: 'majority',
      readPreference: 'primary',
      compressors: ['zlib'],
    };
  }

  return baseOptions;
}

// Função para processar origens CORS
function processCorsOrigins(): string[] {
  const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173'];
  
  if (!process.env.ALLOWED_ORIGINS) {
    return defaultOrigins;
  }

  const origins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  
  // Validar formato das origens
  const invalidOrigins = origins.filter(origin => {
    try {
      new URL(origin);
      return false;
    } catch {
      return !origin.includes('*'); // Permitir wildcards
    }
  });

  if (invalidOrigins.length > 0) {
    console.warn('⚠️  Origens CORS inválidas encontradas:', invalidOrigins);
  }

  return origins.filter(origin => !invalidOrigins.includes(origin));
}

// Função para validar tipos de arquivo permitidos
function validateAllowedTypes(): string[] {
  const defaultTypes = [
    'image/jpeg', 
    'image/png', 
    'image/webp', 
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const envTypes = process.env.ALLOWED_FILE_TYPES?.split(',').map(type => type.trim());
  
  if (!envTypes) {
    return defaultTypes;
  }

  // Validar se os tipos MIME são válidos
  const validTypes = envTypes.filter(type => {
    const isValid = /^[a-zA-Z]+\/[a-zA-Z0-9\-\+\.]+$/.test(type);
    if (!isValid) {
      console.warn(`⚠️  Tipo MIME inválido: ${type}`);
    }
    return isValid;
  });

  return validTypes.length > 0 ? validTypes : defaultTypes;
}

// Validar configuração
validateRequiredEnvVars();

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000'),
  environment: process.env.NODE_ENV || 'development',
  
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI!,
      options: buildMongoOptions()
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    }
  },

  cors: {
    origins: processCorsOrigins(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-File-Name'
    ],
    credentials: true
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    refreshToken: {
      secret: process.env.JWT_REFRESH_SECRET!,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  },

  uploads: {
    path: process.env.UPLOAD_PATH || 'uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB
    allowedTypes: validateAllowedTypes()
  },

  session: {
    secret: process.env.SESSION_SECRET || 'fallback-session-secret-change-in-production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 hours
    enabled: process.env.SESSION_ENABLED === 'true'
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per window
    message: 'Muitas tentativas, tente novamente mais tarde.'
  }
};

// Função para validar toda a configuração
export function validateConfig(): void {
  console.log('🔧 Validando configuração...');

  // Validar porta
  if (config.port < 1 || config.port > 65535) {
    throw new Error(`Porta inválida: ${config.port}`);
  }

  // Validar URI do MongoDB
  try {
    new URL(config.database.mongodb.uri);
  } catch {
    throw new Error('URI do MongoDB inválida');
  }

  // Validar segredos JWT em produção
  if (config.environment === 'production') {
    if (config.jwt.secret.length < 32) {
      throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres em produção');
    }
    
    if (config.jwt.refreshToken.secret.length < 32) {
      throw new Error('JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres em produção');
    }

    if (config.session.secret === 'fallback-session-secret-change-in-production') {
      throw new Error('SESSION_SECRET deve ser definido em produção');
    }
  }

  // Validar tamanho máximo de upload
  if (config.uploads.maxSize < 1024) { // Mínimo 1KB
    throw new Error('Tamanho máximo de upload muito pequeno');
  }

  console.log('✅ Configuração validada com sucesso');
  console.log(`📍 Ambiente: ${config.environment}`);
  console.log(`🚪 Porta: ${config.port}`);
  console.log(`🗄️  MongoDB: ${config.database.mongodb.uri.replace(/\/\/.*@/, '//***:***@')}`);
  console.log(`📦 Redis: ${config.database.redis.host}:${config.database.redis.port}`);
  console.log(`🌐 CORS Origins: ${config.cors.origins.join(', ')}`);
  console.log(`📁 Upload Path: ${config.uploads.path}`);
  console.log(`📏 Max File Size: ${(config.uploads.maxSize / 1024 / 1024).toFixed(2)}MB`);
}

// Exportar função para obter configuração específica do ambiente
export function getEnvConfig(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Variável de ambiente ${key} não encontrada`);
  }
  return value || defaultValue || '';
}

// Verificar se estamos em modo de desenvolvimento
export const isDevelopment = config.environment === 'development';
export const isProduction = config.environment === 'production';
export const isTest = config.environment === 'test';

// Executar validação no momento da importação
validateConfig();