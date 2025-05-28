// src/scripts/seed.ts - Script para popular banco com dados de exemplo
import 'dotenv/config';
import { DatabaseService } from '../services/DatabaseService';
import { LoggerService } from '../services/LoggerService';
import { Project } from '../models/Project';
import { Certificate } from '../models/Certificate';
import { runMigrations } from './migrate';

const logger = LoggerService.getInstance();
const database = DatabaseService.getInstance();

const sampleProjects = [
  {
    title: 'Sistema de E-commerce Completo',
    shortDescription: 'Plataforma de e-commerce com carrinho, pagamentos e painel admin',
    fullDescription: 'Sistema completo de e-commerce desenvolvido com React, Node.js e MongoDB. Inclui funcionalidades de carrinho de compras, integração com gateway de pagamento, painel administrativo, sistema de avaliações e muito mais.',
    category: 'web_app',
    status: 'completed',
    featured: true,
    technologies: [
      { name: 'React', category: 'frontend', level: 'primary' },
      { name: 'Node.js', category: 'backend', level: 'primary' },
      { name: 'MongoDB', category: 'database', level: 'primary' },
      { name: 'TypeScript', category: 'language', level: 'primary' },
      { name: 'Tailwind CSS', category: 'frontend', level: 'secondary' },
      { name: 'Stripe', category: 'service', level: 'secondary' }
    ],
    images: {
      featured: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop'
      ]
    },
    links: {
      live: 'https://ecommerce-demo.vercel.app',
      github: 'https://github.com/usuario/ecommerce',
      documentation: ''
    },
    date: {
      start: new Date('2024-01-15'),
      end: new Date('2024-03-30')
    },
    tags: ['e-commerce', 'react', 'nodejs', 'mongodb', 'typescript', 'stripe'],
    views: 127,
    isActive: true
  },
  {
    title: 'App Mobile de Gerenciamento de Tarefas',
    shortDescription: 'Aplicativo mobile para organização pessoal e produtividade',
    fullDescription: 'Aplicativo mobile desenvolvido com React Native para gerenciamento de tarefas, com funcionalidades de categorização, lembretes, sincronização na nuvem e modo offline.',
    category: 'mobile_app',
    status: 'completed',
    featured: true,
    technologies: [
      { name: 'React Native', category: 'mobile', level: 'primary' },
      { name: 'Expo', category: 'mobile', level: 'primary' },
      { name: 'Firebase', category: 'backend', level: 'primary' },
      { name: 'TypeScript', category: 'language', level: 'primary' },
      { name: 'AsyncStorage', category: 'mobile', level: 'secondary' }
    ],
    images: {
      featured: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop'
      ]
    },
    links: {
      live: 'https://play.google.com/store/apps/details?id=com.taskapp',
      github: 'https://github.com/usuario/task-app',
      documentation: ''
    },
    date: {
      start: new Date('2023-11-01'),
      end: new Date('2024-01-15')
    },
    tags: ['mobile', 'react-native', 'firebase', 'produtividade', 'expo'],
    views: 89,
    isActive: true
  },
  {
    title: 'Dashboard de Analytics em Tempo Real',
    shortDescription: 'Dashboard interativo para visualização de dados em tempo real',
    fullDescription: 'Dashboard desenvolvido com Vue.js e D3.js para visualização de dados em tempo real, com gráficos interativos, relatórios customizáveis e integração com múltiplas fontes de dados.',
    category: 'web_app',
    status: 'completed',
    featured: false,
    technologies: [
      { name: 'Vue.js', category: 'frontend', level: 'primary' },
      { name: 'D3.js', category: 'frontend', level: 'primary' },
      { name: 'WebSocket', category: 'backend', level: 'primary' },
      { name: 'Express', category: 'backend', level: 'secondary' },
      { name: 'Redis', category: 'database', level: 'secondary' }
    ],
    images: {
      featured: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      gallery: []
    },
    links: {
      live: 'https://analytics-dashboard-demo.netlify.app',
      github: 'https://github.com/usuario/analytics-dashboard',
      documentation: 'https://docs.analytics-dashboard.com'
    },
    date: {
      start: new Date('2023-08-01'),
      end: new Date('2023-10-15')
    },
    tags: ['dashboard', 'analytics', 'vue', 'd3js', 'websocket', 'tempo-real'],
    views: 54,
    isActive: true
  },
  {
    title: 'API RESTful com Autenticação JWT',
    shortDescription: 'API robusta com autenticação, validação e documentação completa',
    fullDescription: 'API RESTful desenvolvida com Node.js, Express e MongoDB, incluindo autenticação JWT, middleware de validação, rate limiting, documentação Swagger e testes automatizados.',
    category: 'api',
    status: 'completed',
    featured: false,
    technologies: [
      { name: 'Node.js', category: 'backend', level: 'primary' },
      { name: 'Express', category: 'backend', level: 'primary' },
      { name: 'MongoDB', category: 'database', level: 'primary' },
      { name: 'JWT', category: 'security', level: 'primary' },
      { name: 'Swagger', category: 'documentation', level: 'secondary' },
      { name: 'Jest', category: 'testing', level: 'secondary' }
    ],
    images: {
      featured: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
      gallery: []
    },
    links: {
      live: 'https://api-demo.herokuapp.com/docs',
      github: 'https://github.com/usuario/api-restful',
      documentation: 'https://api-demo.herokuapp.com/docs'
    },
    date: {
      start: new Date('2023-06-01'),
      end: new Date('2023-07-30')
    },
    tags: ['api', 'nodejs', 'express', 'mongodb', 'jwt', 'swagger'],
    views: 76,
    isActive: true
  },
  {
    title: 'Chatbot com Inteligência Artificial',
    shortDescription: 'Chatbot inteligente para atendimento ao cliente usando NLP',
    fullDescription: 'Chatbot desenvolvido com Python e bibliotecas de NLP para atendimento automatizado ao cliente, com integração a APIs de tradução e análise de sentimentos.',
    category: 'ai_ml',
    status: 'in_progress',
    featured: true,
    technologies: [
      { name: 'Python', category: 'backend', level: 'primary' },
      { name: 'NLTK', category: 'ai', level: 'primary' },
      { name: 'TensorFlow', category: 'ai', level: 'primary' },
      { name: 'Flask', category: 'backend', level: 'secondary' },
      { name: 'OpenAI API', category: 'service', level: 'secondary' }
    ],
    images: {
      featured: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=600&fit=crop',
      gallery: []
    },
    links: {
      live: '',
      github: 'https://github.com/usuario/chatbot-ai',
      documentation: ''
    },
    date: {
      start: new Date('2024-02-01'),
      end: null
    },
    tags: ['ai', 'chatbot', 'nlp', 'python', 'tensorflow', 'machine-learning'],
    views: 32,
    isActive: true
  }
];

const sampleCertificates = [
  {
    title: 'AWS Certified Solutions Architect',
    issuer: {
      name: 'Amazon Web Services',
      logo: 'https://images.credly.com/size/340x340/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png',
      website: 'https://aws.amazon.com/certification/'
    },
    date: {
      issued: new Date('2024-01-15'),
      expires: new Date('2027-01-15')
    },
    credentialId: 'AWS-SAA-2024-001',
    credentialUrl: 'https://aws.amazon.com/verification',
    category: 'Cloud Computing',
    skills: ['AWS', 'Cloud Architecture', 'EC2', 'S3', 'RDS', 'Lambda'],
    level: 'advanced',
    featured: true,
    image: 'https://images.credly.com/size/340x340/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png',
    description: 'Certificação que valida conhecimentos em arquitetura de soluções na AWS',
    isActive: true
  },
  {
    title: 'React Developer Certification',
    issuer: {
      name: 'Meta (Facebook)',
      logo: 'https://images.credly.com/size/340x340/images/035b7671-8209-4545-8709-c9c6e9163e6c/image.png',
      website: 'https://developers.facebook.com/docs/react/'
    },
    date: {
      issued: new Date('2023-11-20'),
      expires: null
    },
    credentialId: 'META-REACT-2023-456',
    credentialUrl: 'https://developers.facebook.com/certification',
    category: 'Frontend Development',
    skills: ['React', 'JavaScript', 'JSX', 'Hooks', 'Context API', 'Redux'],
    level: 'advanced',
    featured: true,
    image: 'https://images.credly.com/size/340x340/images/035b7671-8209-4545-8709-c9c6e9163e6c/image.png',
    description: 'Certificação oficial em desenvolvimento React pela Meta',
    isActive: true
  },
  {
    title: 'Node.js Application Developer',
    issuer: {
      name: 'OpenJS Foundation',
      logo: 'https://images.credly.com/size/340x340/images/a025ba8a-e2ce-4f59-96b7-4306c69f181c/image.png',
      website: 'https://openjsf.org/certification/'
    },
    date: {
      issued: new Date('2023-09-10'),
      expires: null
    },
    credentialId: 'NODEJS-2023-789',
    credentialUrl: 'https://openjsf.org/certification/verify',
    category: 'Backend Development',
    skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Authentication'],
    level: 'intermediate',
    featured: false,
    image: 'https://images.credly.com/size/340x340/images/a025ba8a-e2ce-4f59-96b7-4306c69f181c/image.png',
    description: 'Certificação em desenvolvimento de aplicações Node.js',
    isActive: true
  },
  {
    title: 'Google Cloud Professional Cloud Architect',
    issuer: {
      name: 'Google Cloud',
      logo: 'https://images.credly.com/size/340x340/images/71ccc6c6-6c2a-4ce5-8b48-9b6f0d1b7a1b/image.png',
      website: 'https://cloud.google.com/certification'
    },
    date: {
      issued: new Date('2023-07-05'),
      expires: new Date('2025-07-05')
    },
    credentialId: 'GCP-PCA-2023-123',
    credentialUrl: 'https://cloud.google.com/certification/verify',
    category: 'Cloud Computing',
    skills: ['Google Cloud Platform', 'Kubernetes', 'Docker', 'Terraform', 'BigQuery'],
    level: 'expert',
    featured: true,
    image: 'https://images.credly.com/size/340x340/images/71ccc6c6-6c2a-4ce5-8b48-9b6f0d1b7a1b/image.png',
    description: 'Certificação profissional em arquitetura de soluções no Google Cloud',
    isActive: true
  },
  {
    title: 'MongoDB Certified Developer',
    issuer: {
      name: 'MongoDB University',
      logo: 'https://images.credly.com/size/340x340/images/d7f73336-9adb-4833-a2e8-c9d6a9f5e6a7/mongodb-certified-developer-associate-badge.png',
      website: 'https://university.mongodb.com/certification'
    },
    date: {
      issued: new Date('2023-05-20'),
      expires: new Date('2026-05-20')
    },
    credentialId: 'MONGO-DEV-2023-567',
    credentialUrl: 'https://university.mongodb.com/verify',
    category: 'Database',
    skills: ['MongoDB', 'Aggregation', 'Indexing', 'Mongoose', 'Database Design'],
    level: 'intermediate',
    featured: false,
    image: 'https://images.credly.com/size/340x340/images/d7f73336-9adb-4833-a2e8-c9d6a9f5e6a7/mongodb-certified-developer-associate-badge.png',
    description: 'Certificação em desenvolvimento com MongoDB',
    isActive: true
  }
];

async function seedProjects(): Promise<void> {
  try {
    logger.info('🚀 Populando projetos de exemplo...');
    
    // Verificar se já existem projetos
    const existingProjects = await Project.countDocuments();
    
    if (existingProjects > 0) {
      logger.info(`ℹ️ Já existem ${existingProjects} projetos no banco`);
      return;
    }
    
    // Inserir projetos de exemplo
    const projects = await Project.insertMany(sampleProjects);
    logger.info(`✅ ${projects.length} projetos de exemplo criados`);
    
  } catch (error) {
    logger.error('❌ Erro ao popular projetos:', error);
    throw error;
  }
}

async function seedCertificates(): Promise<void> {
  try {
    logger.info('🏆 Populando certificados de exemplo...');
    
    // Verificar se já existem certificados
    const existingCertificates = await Certificate.countDocuments();
    
    if (existingCertificates > 0) {
      logger.info(`ℹ️ Já existem ${existingCertificates} certificados no banco`);
      return;
    }
    
    // Inserir certificados de exemplo
    const certificates = await Certificate.insertMany(sampleCertificates);
    logger.info(`✅ ${certificates.length} certificados de exemplo criados`);
    
  } catch (error) {
    logger.error('❌ Erro ao popular certificados:', error);
    throw error;
  }
}

async function runSeed(): Promise<void> {
  try {
    logger.info('🌱 Iniciando seed do banco de dados...');
    
    // Conectar ao banco
    await database.connect();
    
    // Executar migrations primeiro
    logger.info('🔧 Executando migrations...');
    await runMigrations();
    
    // Popular dados
    await seedProjects();
    await seedCertificates();
    
    logger.info('✅ Seed concluído com sucesso!');
    
  } catch (error) {
    logger.error('❌ Falha no seed:', error);
    throw error;
  } finally {
    await database.disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runSeed()
    .then(() => {
      logger.info('🎉 Banco de dados populado com sucesso!');
      logger.info('🔑 Login admin: admin@portfolio.com / admin123');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Falha no seed:', error);
      process.exit(1);
    });
}

export { runSeed };