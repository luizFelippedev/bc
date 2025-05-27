// migrations/002-complete-setup.ts
import { DatabaseService } from '../src/services/DatabaseService';
import { LoggerService } from '../src/services/LoggerService';

const logger = LoggerService.getInstance();
const database = DatabaseService.getInstance();

export const migration = {
  version: '002',
  name: 'complete-setup',
  description: 'Setup completo do sistema com configurações avançadas',

  async up(): Promise<void> {
    try {
      logger.info('Executando migration: complete-setup');
      
      const connection = database.getConnection();
      if (!connection) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      const db = connection.db;

      // ================================
      // USUÁRIOS - Configurações avançadas
      // ================================
      
      // Índices compostos para users
      await db.collection('users').createIndex(
        { email: 1, isActive: 1 }, 
        { unique: true, partialFilterExpression: { isActive: true } }
      );
      
      await db.collection('users').createIndex({ lastLogin: -1 });
      await db.collection('users').createIndex({ createdAt: -1 });
      
      // ================================
      // PROJETOS - Melhorias
      // ================================
      
      // Índices para performance de projetos
      await db.collection('projects').createIndex({ 
        visibility: 1, 
        isActive: 1, 
        featured: -1, 
        createdAt: -1 
      });
      
      await db.collection('projects').createIndex({ 
        category: 1, 
        status: 1, 
        isActive: 1 
      });
      
      await db.collection('projects').createIndex({ views: -1 });
      
      // Índice para busca por tags
      await db.collection('projects').createIndex({ tags: 1 });
      
      // Índice para data de criação e atualização
      await db.collection('projects').createIndex({ 
        updatedAt: -1, 
        createdAt: -1 
      });
      
      // ================================
      // CERTIFICADOS - Melhorias
      // ================================
      
      // Índices compostos para certificados
      await db.collection('certificates').createIndex({
        isActive: 1,
        featured: -1,
        'dates.issued': -1
      });
      
      await db.collection('certificates').createIndex({
        category: 1,
        level: 1,
        isActive: 1
      });
      
      // Índice para data de expiração
      await db.collection('certificates').createIndex({ 'dates.expires': 1 });
      
      // ================================
      // ANALYTICS - Índices otimizados
      // ================================
      
      // Índices compostos para analytics
      await db.collection('analytics').createIndex({
        eventType: 1,
        createdAt: -1
      });
      
      // Índice para sessões
      await db.collection('analytics').createIndex({
        sessionId: 1,
        createdAt: -1
      });
      
      // Índice para geolocalização
      await db.collection('analytics').createIndex({
        country: 1,
        city: 1,
        createdAt: -1
      });
      
      // Índice para dispositivos
      await db.collection('analytics').createIndex({
        device: 1,
        browser: 1,
        os: 1
      });
      
      // TTL index para analytics (manter por 2 anos)
      await db.collection('analytics').createIndex(
        { createdAt: 1 }, 
        { expireAfterSeconds: 63072000 } // 2 anos
      );
      
      // ================================
      // CONFIGURAÇÕES - Nova coleção melhorada
      // ================================
      
      // Garantir que existe apenas uma configuração
      await db.collection('configurations').createIndex(
        { active: 1 }, 
        { unique: true, partialFilterExpression: { active: true } }
      );
      
      // ================================
      // LOGS DE AUDITORIA
      // ================================
      
      // Criar coleção de auditoria se não existir
      const auditExists = await db.listCollections({ name: 'audit_logs' }).hasNext();
      if (!auditExists) {
        await db.createCollection('audit_logs', {
          capped: true,
          size: 100000000, // 100MB
          max: 1000000     // 1M documentos
        });
      }
      
      // Índices para auditoria
      await db.collection('audit_logs').createIndex({ userId: 1, timestamp: -1 });
      await db.collection('audit_logs').createIndex({ action: 1, timestamp: -1 });
      await db.collection('audit_logs').createIndex({ resource: 1, timestamp: -1 });
      await db.collection('audit_logs').createIndex({ success: 1, timestamp: -1 });
      
      // ================================
      // NOTIFICAÇÕES
      // ================================
      
      // Criar coleção de notificações
      const notificationsExists = await db.listCollections({ name: 'notifications' }).hasNext();
      if (!notificationsExists) {
        await db.createCollection('notifications');
      }
      
      // Índices para notificações
      await db.collection('notifications').createIndex({ 
        'recipients.userId': 1, 
        createdAt: -1 
      });
      
      await db.collection('notifications').createIndex({ 
        type: 1, 
        priority: 1, 
        createdAt: -1 
      });
      
      // TTL para notificações (30 dias)
      await db.collection('notifications').createIndex(
        { createdAt: 1 }, 
        { expireAfterSeconds: 2592000 }
      );
      
      // ================================
      // EMAILS LOG
      // ================================
      
      // Criar coleção para log de emails
      const emailLogsExists = await db.listCollections({ name: 'email_logs' }).hasNext();
      if (!emailLogsExists) {
        await db.createCollection('email_logs', {
          capped: true,
          size: 50000000,  // 50MB
          max: 100000      // 100k documentos
        });
      }
      
      // Índices para email logs
      await db.collection('email_logs').createIndex({ sentAt: -1 });
      await db.collection('email_logs').createIndex({ status: 1, sentAt: -1 });
      await db.collection('email_logs').createIndex({ template: 1, sentAt: -1 });
      
      // ================================
      // BACKUPS LOG
      // ================================
      
      // Criar coleção para log de backups
      const backupLogsExists = await db.listCollections({ name: 'backup_logs' }).hasNext();
      if (!backupLogsExists) {
        await db.createCollection('backup_logs');
      }
      
      // Índices para backup logs
      await db.collection('backup_logs').createIndex({ startedAt: -1 });
      await db.collection('backup_logs').createIndex({ status: 1, startedAt: -1 });
      await db.collection('backup_logs').createIndex({ type: 1, startedAt: -1 });
      
      // ================================
      // MIGRATIONS LOG
      // ================================
      
      // Melhorar coleção de migrations
      await db.collection('migrations').createIndex({ version: 1 }, { unique: true });
      await db.collection('migrations').createIndex({ executedAt: -1 });
      
      // ================================
      // SESSÕES
      // ================================
      
      // Criar coleção para sessões se usando MongoDB para sessões
      const sessionsExists = await db.listCollections({ name: 'sessions' }).hasNext();
      if (!sessionsExists) {
        await db.createCollection('sessions');
      }
      
      // TTL para sessões (24 horas)
      await db.collection('sessions').createIndex(
        { expires: 1 }, 
        { expireAfterSeconds: 0 }
      );
      
      // ================================
      // CONFIGURAÇÕES DE PERFORMANCE
      // ================================
      
      // Configurações do MongoDB para melhor performance
      try {
        // Habilitar profiling para queries lentas (> 100ms)
        await db.runCommand({ profile: 2, slowms: 100 });
        
        // Estatísticas de performance
        await db.runCommand({ collStats: 'projects' });
        await db.runCommand({ collStats: 'certificates' });
        await db.runCommand({ collStats: 'analytics' });
        
        logger.info('Configurações de performance aplicadas');
      } catch (error) {
        logger.warn('Algumas configurações de performance não puderam ser aplicadas:', error);
      }
      
      // ================================
      // DADOS INICIAIS
      // ================================
      
      // Criar configuração inicial se não existir
      const configExists = await db.collection('configurations').findOne({ active: true });
      if (!configExists) {
        await db.collection('configurations').insertOne({
          active: true,
          profile: {
            name: 'Portfolio',
            title: 'Desenvolvedor Full Stack',
            description: 'Desenvolvedor apaixonado por tecnologia e inovação',
            contactEmail: 'contato@portfolio.com',
            location: 'Brasil'
          },
          socialLinks: [
            {
              platform: 'github',
              url: 'https://github.com/seu-usuario',
              icon: 'github'
            },
            {
              platform: 'linkedin',
              url: 'https://linkedin.com/in/seu-perfil',
              icon: 'linkedin'
            }
          ],
          siteSettings: {
            title: 'Meu Portfolio',
            description: 'Portfolio profissional com projetos e certificados',
            language: 'pt-BR',
            primaryColor: '#3B82F6',
            secondaryColor: '#10B981',
            darkMode: true
          },
          seo: {
            keywords: ['portfolio', 'desenvolvedor', 'web', 'full stack'],
            metaDescription: 'Portfolio profissional de desenvolvedor full stack'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        logger.info('Configuração inicial criada');
      }
      
      // ================================
      // VALIDAÇÕES E CONSTRAINTS
      // ================================
      
      // Adicionar validações ao nível do banco (MongoDB 3.6+)
      try {
        // Validador para projetos
        await db.runCommand({
          collMod: 'projects',
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['title', 'slug', 'shortDescription', 'category'],
              properties: {
                title: {
                  bsonType: 'string',
                  minLength: 3,
                  maxLength: 100
                },
                slug: {
                  bsonType: 'string',
                  pattern: '^[a-z0-9-]+$'
                },
                shortDescription: {
                  bsonType: 'string',
                  maxLength: 200
                },
                category: {
                  bsonType: 'string',
                  enum: ['web_app', 'mobile_app', 'desktop_app', 'ai_ml', 'blockchain', 'iot', 'game', 'api']
                },
                status: {
                  bsonType: 'string',
                  enum: ['in_progress', 'completed', 'archived']
                },
                featured: {
                  bsonType: 'bool'
                },
                isActive: {
                  bsonType: 'bool'
                }
              }
            }
          },
          validationAction: 'warn' // Usar 'error' em produção se desejar
        });
        
        logger.info('Validadores aplicados');
      } catch (error) {
        logger.warn('Validadores não puderam ser aplicados (versão do MongoDB?):', error);
      }
      
      logger.info('Migration complete-setup executada com sucesso');
      
    } catch (error) {
      logger.error('Erro na migration complete-setup:', error);
      throw error;
    }
  },

  async down(): Promise<void> {
    try {
      logger.info('Revertendo migration: complete-setup');
      
      const connection = database.getConnection();
      if (!connection) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      const db = connection.db;
      
      // Remover índices específicos criados nesta migration
      const collectionsToClean = ['users', 'projects', 'certificates', 'analytics', 'audit_logs', 'notifications'];
      
      for (const collectionName of collectionsToClean) {
        try {
          const collection = db.collection(collectionName);
          const indexes = await collection.indexes();
          
          // Manter apenas índices essenciais (_id)
          for (const index of indexes) {
            if (index.name !== '_id_') {
              await collection.dropIndex(index.name);
            }
          }
          
          logger.info(`Índices removidos da coleção: ${collectionName}`);
        } catch (error) {
          logger.warn(`Erro ao limpar índices da coleção ${collectionName}:`, error);
        }
      }
      
      // Remover coleções criadas nesta migration
      const collectionsToRemove = ['audit_logs', 'notifications', 'email_logs', 'backup_logs', 'sessions'];
      
      for (const collectionName of collectionsToRemove) {
        try {
          const exists = await db.listCollections({ name: collectionName }).hasNext();
          if (exists) {
            await db.collection(collectionName).drop();
            logger.info(`Coleção removida: ${collectionName}`);
          }
        } catch (error) {
          logger.warn(`Erro ao remover coleção ${collectionName}:`, error);
        }
      }
      
      logger.info('Rollback da migration complete-setup executado');
      
    } catch (error) {
      logger.error('Erro no rollback da migration complete-setup:', error);
      throw error;
    }
  }
};