// tests/setup.ts - Configuração global para testes
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Redis from 'ioredis-mock';

// Configurações globais de teste
let mongoServer: MongoMemoryServer;

// Setup antes de todos os testes
beforeAll(async () => {
  // Configurar variáveis de ambiente para teste
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.LOG_LEVEL = 'error'; // Reduzir logs durante testes
  
  // Configurar timeout para testes
  jest.setTimeout(30000);
  
  // Inicializar MongoDB em memória
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  
  // Conectar ao MongoDB de teste
  await mongoose.connect(mongoUri);
  
  // Mock do Redis
  jest.mock('ioredis', () => Redis);
});

// Limpeza após cada teste
afterEach(async () => {
  // Limpar todas as coleções
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Limpeza após todos os testes
afterAll(async () => {
  // Fechar conexão com MongoDB
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  // Parar servidor MongoDB em memória
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Configurações globais do Jest
global.console = {
  ...console,
  log: jest.fn(), // Silenciar logs durante testes
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Helper functions para testes
export const testHelpers = {
  // Criar usuário de teste
  createTestUser: async () => {
    const { User } = await import('../src/models/User');
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123',
      role: 'admin',
      isActive: true
    });
    return await user.save();
  },
  
  // Criar projeto de teste
  createTestProject: async () => {
    const { Project } = await import('../src/models/Project');
    const project = new Project({
      title: 'Test Project',
      slug: 'test-project',
      shortDescription: 'A test project',
      fullDescription: 'This is a test project for testing purposes',
      category: 'web_app',
      status: 'completed',
      visibility: 'public',
      featured: false,
      technologies: [
        { name: 'React', category: 'frontend', level: 'primary' }
      ],
      images: {
        featured: 'https://example.com/image.jpg',
        gallery: []
      },
      date: {
        start: new Date('2024-01-01'),
        end: new Date('2024-03-01')
      },
      links: {},
      tags: ['test'],
      isActive: true
    });
    return await project.save();
  },
  
  // Criar certificado de teste
  createTestCertificate: async () => {
    const { Certificate } = await import('../src/models/Certificate');
    const certificate = new Certificate({
      title: 'Test Certificate',
      issuer: {
        name: 'Test Academy',
        website: 'https://testacademy.com'
      },
      dates: {
        issued: new Date('2024-01-01')
      },
      category: 'technical',
      skills: ['JavaScript', 'Node.js'],
      level: 'intermediate',
      featured: false,
      image: 'https://example.com/cert.jpg',
      isActive: true
    });
    return await certificate.save();
  },
  
  // Gerar token JWT de teste
  generateTestToken: async (userId?: string) => {
    const jwt = await import('jsonwebtoken');
    const payload = {
      id: userId || '507f1f77bcf86cd799439011',
      role: 'admin'
    };
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
  },
  
  // Limpar específica coleção
  cleanupCollection: async (collectionName: string) => {
    const collection = mongoose.connection.collections[collectionName];
    if (collection) {
      await collection.deleteMany({});
    }
  },
  
  // Aguardar por condição
  waitFor: async (condition: () => boolean | Promise<boolean>, timeout = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
  }
};

// Mocks globais
jest.mock('../src/services/EmailService', () => ({
  EmailService: {
    getInstance: () => ({
      sendEmail: jest.fn().mockResolvedValue(true),
      sendTemplatedEmail: jest.fn().mockResolvedValue(true)
    })
  }
}));

jest.mock('../src/services/NotificationService', () => ({
  NotificationService: {
    getInstance: () => ({
      sendNotification: jest.fn().mockResolvedValue(true)
    })
  }
}));

// Configurar mocks do console para capturar logs se necessário
export const consoleMocks = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
  info: jest.spyOn(console, 'info').mockImplementation(() => {})
};

// Exportar constantes úteis para testes
export const TEST_CONSTANTS = {
  ADMIN_EMAIL: 'admin@test.com',
  ADMIN_PASSWORD: 'testpassword123',
  TEST_USER_EMAIL: 'user@test.com',
  TEST_PROJECT_SLUG: 'test-project',
  TEST_CERTIFICATE_ID: '507f1f77bcf86cd799439011'
};