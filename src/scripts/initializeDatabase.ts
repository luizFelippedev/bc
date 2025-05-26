// src/scripts/initializeDatabase.ts
import { DatabaseService } from '../services/DatabaseService';
import { LoggerService } from '../services/LoggerService';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Certificate } from '../models/Certificate';
import * as bcrypt from 'bcryptjs';

export class DatabaseInitializer {
  private static logger = LoggerService.getInstance();
  private static database = DatabaseService.getInstance();

  /**
   * Inicializa o banco de dados com dados padrão, se necessário
   */
  public static async initialize(): Promise<void> {
    try {
      this.logger.info('Verificando necessidade de inicialização do banco de dados...');
      
      await this.database.connect();
      
      // Verificar se já existem usuários no sistema
      const userCount = await User.countDocuments();
      
      if (userCount === 0) {
        this.logger.info('Banco de dados vazio. Iniciando processo de inicialização...');
        
        // Criar usuário admin
        await this.createAdminUser();
        
        // Criar projetos de exemplo
        await this.createSampleProjects();
        
        // Criar certificados de exemplo
        await this.createSampleCertificates();
        
        this.logger.info('✅ Banco de dados inicializado com sucesso!');
      } else {
        this.logger.info('Banco de dados já possui dados. Inicialização não necessária.');
      }
    } catch (error) {
      this.logger.error('❌ Erro ao inicializar banco de dados:', error);
      throw error;
    }
  }

  /**
   * Cria o usuário admin padrão
   */
  private static async createAdminUser(): Promise<void> {
    try {
      const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = new User({
        name: 'Administrador',
        email: process.env.ADMIN_EMAIL || 'admin@portfolio.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      await adminUser.save();
      
      this.logger.info('✅ Usuário administrador criado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao criar usuário administrador:', error);
      throw error;
    }
  }

  /**
   * Cria projetos de exemplo
   */
  private static async createSampleProjects(): Promise<void> {
    try {
      const sampleProjects = [
        {
          title: 'API RESTful com Node.js e MongoDB',
          shortDescription: 'API completa com autenticação JWT, validação, cache e documentação Swagger.',
          fullDescription: 'Projeto completo de uma API RESTful desenvolvida com Node.js, Express e MongoDB. Implementa autenticação JWT, validação de dados, cache com Redis, documentação Swagger e testes automatizados.',
          category: 'web_app',
          status: 'deployed',
          visibility: 'public',
          featured: true,
          technologies: [
            { name: 'Node.js', category: 'backend', level: 'primary' },
            { name: 'Express', category: 'backend', level: 'primary' },
            { name: 'MongoDB', category: 'database', level: 'primary' },
            { name: 'Redis', category: 'database', level: 'secondary' },
            { name: 'JWT', category: 'backend', level: 'secondary' }
          ],
          media: {
            featuredImage: 'https://example.com/api-image.jpg',
            gallery: []
          },
          timeline: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-03-01')
          },
          tags: ['api', 'node.js', 'mongodb', 'backend']
        },
        {
          title: 'Aplicação Frontend em React',
          shortDescription: 'Interface moderna em React com Material-UI e integração com APIs.',
          fullDescription: 'Aplicação frontend moderna desenvolvida com React, TypeScript e Material-UI. Implementa gerenciamento de estado com Redux, roteamento com React Router, integração com APIs RESTful e GraphQL.',
          category: 'web_app',
          status: 'deployed',
          visibility: 'public',
          featured: true,
          technologies: [
            { name: 'React', category: 'frontend', level: 'primary' },
            { name: 'TypeScript', category: 'frontend', level: 'primary' },
            { name: 'Material-UI', category: 'frontend', level: 'primary' },
            { name: 'Redux', category: 'frontend', level: 'secondary' }
          ],
          media: {
            featuredImage: 'https://example.com/react-image.jpg',
            gallery: []
          },
          timeline: {
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-04-01')
          },
          tags: ['react', 'frontend', 'typescript', 'ui']
        }
      ];
      
      for (const projectData of sampleProjects) {
        const project = new Project(projectData);
        await project.save();
      }
      
      this.logger.info(`✅ ${sampleProjects.length} projetos de exemplo criados com sucesso`);
    } catch (error) {
      this.logger.error('❌ Erro ao criar projetos de exemplo:', error);
      throw error;
    }
  }

  /**
   * Cria certificados de exemplo
   */
  private static async createSampleCertificates(): Promise<void> {
    try {
      const sampleCertificates = [
        {
          title: 'Certificação em Desenvolvimento Web',
          issuer: {
            name: 'Universidade Tech',
            website: 'https://universidadetech.com'
          },
          dates: {
            issued: new Date('2023-05-15')
          },
          level: 'professional',
          type: 'technical',
          skills: [
            {
              name: 'HTML/CSS',
              category: 'Frontend',
              proficiencyLevel: 'advanced'
            },
            {
              name: 'JavaScript',
              category: 'Frontend',
              proficiencyLevel: 'advanced'
            },
            {
              name: 'Node.js',
              category: 'Backend',
              proficiencyLevel: 'intermediate'
            }
          ],
          media: {
            certificate: 'https://example.com/certificate.pdf'
          },
          featured: true,
          isActive: true
        },
        {
          title: 'Certificação em Cloud Computing',
          issuer: {
            name: 'Cloud Academy',
            website: 'https://cloudacademy.com'
          },
          dates: {
            issued: new Date('2023-08-10')
          },
          level: 'associate',
          type: 'technical',
          skills: [
            {
              name: 'AWS',
              category: 'Cloud',
              proficiencyLevel: 'intermediate'
            },
            {
              name: 'Docker',
              category: 'DevOps',
              proficiencyLevel: 'intermediate'
            },
            {
              name: 'Kubernetes',
              category: 'DevOps',
              proficiencyLevel: 'beginner'
            }
          ],
          media: {
            certificate: 'https://example.com/certificate2.pdf'
          },
          featured: true,
          isActive: true
        }
      ];
      
      for (const certificateData of sampleCertificates) {
        const certificate = new Certificate(certificateData);
        await certificate.save();
      }
      
      this.logger.info(`✅ ${sampleCertificates.length} certificados de exemplo criados com sucesso`);
    } catch (error) {
      this.logger.error('❌ Erro ao criar certificados de exemplo:', error);
      throw error;
    }
  }
}

// Executar inicialização se o script for chamado diretamente
if (require.main === module) {
  (async () => {
    try {
      await DatabaseInitializer.initialize();
      process.exit(0);
    } catch (error) {
      console.error('❌ Erro ao inicializar banco de dados:', error);
      process.exit(1);
    }
  })();
}

export default DatabaseInitializer;