// src/scripts/migrate.ts - Script de migration
import 'dotenv/config';
import { DatabaseService } from '../services/DatabaseService';
import { LoggerService } from '../services/LoggerService';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Certificate } from '../models/Certificate';
import { Configuration } from '../models/Configuration';

const logger = LoggerService.getInstance();
const database = DatabaseService.getInstance();

async function createIndexes(): Promise<void> {
  try {
    logger.info('📊 Criando índices...');

    // Índices para usuários
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isActive: 1 });
    logger.info('✅ Índices de usuários criados');

    // Índices para projetos
    await Project.collection.createIndex({ slug: 1 }, { unique: true });
    await Project.collection.createIndex({ featured: -1, createdAt: -1 });
    await Project.collection.createIndex({ category: 1 });
    await Project.collection.createIndex({ status: 1 });
    await Project.collection.createIndex({ isActive: 1 });
    
    // Índice de texto para busca
    await Project.collection.createIndex({
      title: 'text',
      shortDescription: 'text',
      fullDescription: 'text',
      tags: 'text'
    });
    logger.info('✅ Índices de projetos criados');

    // Índices para certificados
    await Certificate.collection.createIndex({ featured: -1, 'date.issued': -1 });
    await Certificate.collection.createIndex({ category: 1 });
    await Certificate.collection.createIndex({ level: 1 });
    await Certificate.collection.createIndex({ isActive: 1 });
    
    // Índice de texto para busca
    await Certificate.collection.createIndex({
      title: 'text',
      'issuer.name': 'text',
      skills: 'text'
    });
    logger.info('✅ Índices de certificados criados');

    // Índice para configuração
    await Configuration.collection.createIndex({ active: 1 });
    logger.info('✅ Índices de configuração criados');

  } catch (error) {
    logger.error('❌ Erro ao criar índices:', error);
    throw error;
  }
}

async function createDefaultConfiguration(): Promise<void> {
  try {
    logger.info('⚙️ Verificando configuração padrão...');
    
    const existingConfig = await Configuration.findOne();
    
    if (!existingConfig) {
      const defaultConfig = new Configuration({
        profile: {
          name: 'Seu Nome',
          title: 'Desenvolvedor Full Stack',
          description: 'Desenvolvedor apaixonado por tecnologia e inovação',
          location: 'Brasil',
          contactEmail: 'contato@portfolio.com',
          avatar: '',
          resumeUrl: '',
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
          darkMode: true,
        },
        seo: {
          keywords: ['portfolio', 'desenvolvedor', 'web', 'full stack'],
          googleAnalyticsId: '',
          metaImage: '',
        },
      });

      await defaultConfig.save();
      logger.info('✅ Configuração padrão criada');
    } else {
      logger.info('ℹ️ Configuração já existe');
    }
  } catch (error) {
    logger.error('❌ Erro ao criar configuração padrão:', error);
    throw error;
  }
}

async function createAdminUser(): Promise<void> {
  try {
    logger.info('👤 Verificando usuário administrador...');
    
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@portfolio.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const adminName = process.env.ADMIN_NAME || 'Administrador';

      const adminUser = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword, // Será hasheado automaticamente pelo pre-save hook
        role: 'admin',
        isActive: true,
      });

      await adminUser.save();
      logger.info(`✅ Usuário administrador criado: ${adminEmail}`);
    } else {
      logger.info('ℹ️ Usuário administrador já existe');
    }
  } catch (error) {
    logger.error('❌ Erro ao criar usuário administrador:', error);
    throw error;
  }
}

async function runMigrations(): Promise<void> {
  try {
    logger.info('🚀 Iniciando migrations...');
    
    // Conectar ao banco
    await database.connect();
    
    // Executar migrations em ordem
    await createIndexes();
    await createDefaultConfiguration();
    await createAdminUser();
    
    logger.info('✅ Todas as migrations executadas com sucesso!');
    
  } catch (error) {
    logger.error('❌ Falha nas migrations:', error);
    throw error;
  } finally {
    await database.disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('🎉 Migrations concluídas!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Falha nas migrations:', error);
      process.exit(1);
    });
}

export { runMigrations };