// migrations/001-initial-setup.ts
import { DatabaseService } from '../src/services/DatabaseService';
import { LoggerService } from '../src/services/LoggerService';

const logger = LoggerService.getInstance();
const database = DatabaseService.getInstance();

export const migration = {
  version: '001',
  name: 'initial-setup',
  description: 'Setup inicial do banco de dados com índices e coleções',

  async up(): Promise<void> {
    try {
      logger.info('Executando migration: initial-setup');
      
      const connection = database.getConnection();
      if (!connection) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      const db = connection.db;

      // Criar coleções se não existirem
      const collections = ['users', 'projects', 'certificates', 'analytics', 'configurations'];
      
      for (const collectionName of collections) {
        const exists = await db.listCollections({ name: collectionName }).hasNext();
        if (!exists) {
          await db.createCollection(collectionName);
          logger.info(`Coleção '${collectionName}' criada`);
        }
      }

      // Criar índices para users
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ role: 1 });
      await db.collection('users').createIndex({ isActive: 1 });

      // Criar índices para projects  
      await db.collection('projects').createIndex({ slug: 1 }, { unique: true });
      await db.collection('projects').createIndex({ featured: -1, createdAt: -1 });
      await db.collection('projects').createIndex({ category: 1 });
      await db.collection('projects').createIndex({ status: 1 });
      await db.collection('projects').createIndex({ isActive: 1 });
      await db.collection('projects').createIndex({ 
        title: 'text', 
        shortDescription: 'text', 
        fullDescription: 'text',
        tags: 'text'
      });

      // Criar índices para certificates
      await db.collection('certificates').createIndex({ featured: -1, 'dates.issued': -1 });
      await db.collection('certificates').createIndex({ category: 1 });
      await db.collection('certificates').createIndex({ level: 1 });
      await db.collection('certificates').createIndex({ isActive: 1 });
      await db.collection('certificates').createIndex({
        title: 'text',
        'issuer.name': 'text',
        skills: 'text'
      });

      // Criar índices para analytics
      await db.collection('analytics').createIndex({ eventType: 1 });
      await db.collection('analytics').createIndex({ projectId: 1 });
      await db.collection('analytics').createIndex({ certificateId: 1 });
      await db.collection('analytics').createIndex({ sessionId: 1 });
      await db.collection('analytics').createIndex({ createdAt: -1 });
      await db.collection('analytics').createIndex({ country: 1 });
      await db.collection('analytics').createIndex({ device: 1 });

      logger.info('Migration initial-setup executada com sucesso');
    } catch (error) {
      logger.error('Erro na migration initial-setup:', error);
      throw error;
    }
  },

  async down(): Promise<void> {
    try {
      logger.info('Revertendo migration: initial-setup');
      
      const connection = database.getConnection();
      if (!connection) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      const db = connection.db;

      // Remover índices (opcional - normalmente não fazemos rollback de índices)
      // Remover coleções (cuidado - isso apaga todos os dados!)
      const collections = ['users', 'projects', 'certificates', 'analytics', 'configurations'];
      
      for (const collectionName of collections) {
        const exists = await db.listCollections({ name: collectionName }).hasNext();
        if (exists) {
          await db.collection(collectionName).drop();
          logger.info(`Coleção '${collectionName}' removida`);
        }
      }

      logger.info('Rollback da migration initial-setup executado');
    } catch (error) {
      logger.error('Erro no rollback da migration initial-setup:', error);
      throw error;
    }
  }
};