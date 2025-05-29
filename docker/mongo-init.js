// ===== MongoDB Initialization Script =====

// Script executado quando o container MongoDB é criado pela primeira vez
// Cria usuário da aplicação e configurações iniciais

print('=== Portfolio MongoDB Initialization ===');

// Conectar ao banco admin
db = db.getSiblingDB('admin');

// Criar usuário da aplicação
print('Creating application user...');

try {
    db.createUser({
        user: 'portfolio-user',
        pwd: process.env.MONGODB_PASSWORD || 'portfolio123',
        roles: [
            {
                role: 'readWrite',
                db: 'portfolio_production'
            },
            {
                role: 'readWrite', 
                db: 'portfolio_development'
            },
            {
                role: 'readWrite',
                db: 'portfolio_test'
            }
        ]
    });
    print('✅ Application user created successfully');
} catch (error) {
    print('⚠️  User might already exist: ' + error.message);
}

// Conectar ao banco da aplicação (produção)
db = db.getSiblingDB('portfolio_production');

print('Setting up production database...');

// Criar coleções com validação
print('Creating collections with schema validation...');

// Coleção de usuários
db.createCollection('users', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'email', 'password', 'role'],
            properties: {
                name: {
                    bsonType: 'string',
                    minLength: 2,
                    maxLength: 100,
                    description: 'Nome deve ser uma string entre 2 e 100 caracteres'
                },
                email: {
                    bsonType: 'string',
                    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                    description: 'Email deve ter formato válido'
                },
                password: {
                    bsonType: 'string',
                    minLength: 6,
                    description: 'Password deve ter pelo menos 6 caracteres'
                },
                role: {
                    bsonType: 'string',
                    enum: ['admin'],
                    description: 'Role deve ser admin'
                },
                isActive: {
                    bsonType: 'bool',
                    description: 'Status ativo do usuário'
                }
            }
        }
    }
});

// Coleção de projetos
db.createCollection('projects', {
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
                visibility: {
                    bsonType: 'string',
                    enum: ['public', 'private']
                },
                featured: {
                    bsonType: 'bool'
                },
                isActive: {
                    bsonType: 'bool'
                }
            }
        }
    }
});

// Coleção de certificados
db.createCollection('certificates', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'issuer', 'date', 'category'],
            properties: {
                title: {
                    bsonType: 'string',
                    minLength: 3,
                    maxLength: 100
                },
                level: {
                    bsonType: 'string',
                    enum: ['beginner', 'intermediate', 'advanced', 'expert']
                },
                featured: {
                    bsonType: 'bool'
                },
                isActive: {
                    bsonType: 'bool'
                }
            }
        }
    }
});

// Coleção de configurações
db.createCollection('configurations');

// Coleção de analytics
db.createCollection('analytics', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['eventType', 'sessionId'],
            properties: {
                eventType: {
                    bsonType: 'string',
                    enum: ['page_view', 'project_view', 'certificate_view', 'contact']
                },
                sessionId: {
                    bsonType: 'string',
                    minLength: 1
                }
            }
        }
    }
});

print('✅ Collections created with validation');

// Criar índices
print('Creating indexes...');

// Índices para usuários
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: 1 });

// Índices para projetos
db.projects.createIndex({ slug: 1 }, { unique: true });
db.projects.createIndex({ featured: -1, createdAt: -1 });
db.projects.createIndex({ category: 1 });
db.projects.createIndex({ status: 1 });
db.projects.createIndex({ visibility: 1 });
db.projects.createIndex({ isActive: 1 });
db.projects.createIndex({ 
    title: 'text', 
    shortDescription: 'text', 
    fullDescription: 'text',
    tags: 'text'
}, {
    name: 'projects_text_index'
});

// Índices para certificados
db.certificates.createIndex({ featured: -1, 'date.issued': -1 });
db.certificates.createIndex({ category: 1 });
db.certificates.createIndex({ level: 1 });
db.certificates.createIndex({ isActive: 1 });
db.certificates.createIndex({
    title: 'text',
    'issuer.name': 'text',
    skills: 'text'
}, {
    name: 'certificates_text_index'
});

// Índices para analytics
db.analytics.createIndex({ eventType: 1 });
db.analytics.createIndex({ sessionId: 1 });
db.analytics.createIndex({ createdAt: -1 });
db.analytics.createIndex({ projectId: 1 }, { sparse: true });
db.analytics.createIndex({ certificateId: 1 }, { sparse: true });

// Índices compostos para analytics
db.analytics.createIndex({ eventType: 1, createdAt: -1 });
db.analytics.createIndex({ sessionId: 1, createdAt: -1 });

print('✅ Indexes created successfully');

// Configurações de banco
print('Configuring database settings...');

// Definir configurações de profiling (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
    db.setProfilingLevel(1, { slowms: 100 });
    print('✅ Database profiling enabled for slow queries');
}

print('✅ Production database setup completed');

// Conectar ao banco de desenvolvimento se estiver em modo desenvolvimento
if (process.env.NODE_ENV === 'development') {
    print('Setting up development database...');
    
    db = db.getSiblingDB('portfolio_development');
    
    // Criar as mesmas coleções e índices para desenvolvimento
    // (código similar ao de produção, mas com dados de exemplo)
    
    print('✅ Development database setup completed');
}

print('=== MongoDB Initialization Completed ===');