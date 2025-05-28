// src/services/TestingService.ts - Serviço de Testes
import { LoggerService } from './LoggerService';
import { DatabaseService } from './DatabaseService';
import { CacheService } from './CacheService';

export class TestingService {
  private static instance: TestingService;
  private logger: LoggerService;
  private database: DatabaseService;
  private cache: CacheService;

  private constructor() {
    this.logger = LoggerService.getInstance();
    this.database = DatabaseService.getInstance();
    this.cache = CacheService.getInstance();
  }

  public static getInstance(): TestingService {
    if (!TestingService.instance) {
      TestingService.instance = new TestingService();
    }
    return TestingService.instance;
  }

  public async setupTestEnvironment(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Test environment setup can only be run in test mode');
    }

    try {
      // Clear test database
      await this.clearTestDatabase();
      
      // Clear test cache
      await this.clearTestCache();
      
      // Seed test data
      await this.seedTestData();
      
      this.logger.info('Test environment setup completed');
    } catch (error) {
      this.logger.error('Test environment setup failed:', error);
      throw error;
    }
  }

  public async teardownTestEnvironment(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      return;
    }

    try {
      await this.clearTestDatabase();
      await this.clearTestCache();
      
      this.logger.info('Test environment cleaned up');
    } catch (error) {
      this.logger.error('Test environment cleanup failed:', error);
    }
  }

  private async clearTestDatabase(): Promise<void> {
    const connection = this.database.getConnection();
    if (connection?.db) {
      const collections = await connection.db.listCollections().toArray();
      
      for (const collection of collections) {
        if (!collection.name.startsWith('system.')) {
          await connection.db.collection(collection.name).deleteMany({});
        }
      }
    }
  }

  private async clearTestCache(): Promise<void> {
    try {
      const client = this.cache.getClient();
      await client.flushdb();
    } catch (error) {
      this.logger.warn('Erro ao limpar cache de teste:', error);
    }
  }

  private async seedTestData(): Promise<void> {
    const { Project } = await import('../models/Project');
    const { Certificate } = await import('../models/Certificate');
    const { User } = await import('../models/User');

    // Seed test projects
    const testProjects = [
      {
        title: 'Test Project 1',
        slug: 'test-project-1',
        shortDescription: 'This is a test project',
        fullDescription: 'This is a detailed description of the test project',
        category: 'web_app',
        status: 'completed',
        featured: true,
        technologies: [
          { name: 'React', category: 'frontend', level: 'primary' },
          { name: 'Node.js', category: 'backend', level: 'primary' }
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
        tags: [],
        views: 0,
        isActive: true
      }
    ];

    await Project.insertMany(testProjects);

    // Seed test certificates
    const testCertificates = [
      {
        title: 'Test Certificate',
        issuer: { name: 'Test Academy' },
        date: { issued: new Date('2024-01-01') },
        level: 'intermediate',
        category: 'technical',
        skills: ['JavaScript'],
        image: 'https://example.com/cert.jpg',
        featured: true,
        isActive: true
      }
    ];

    await Certificate.insertMany(testCertificates);

    // Seed test users
    const testUsers = [
      {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        isActive: true
      }
    ];

    await User.insertMany(testUsers);
  }
}