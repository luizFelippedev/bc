// src/models/Project.ts (com validação melhorada)

import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

export interface IProject extends Document {
  _id: Types.ObjectId;
  uuid: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  challenges: string[];
  solutions: string[];
  results: {
    metrics: Array<{ name: string; value: string; improvement?: string }>;
    testimonials: Array<{ author: string; role: string; content: string; rating: number }>;
  };
  technologies: Array<{
    name: string;
    category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'blockchain';
    level: 'primary' | 'secondary' | 'learning';
    icon?: string;
    color?: string;
  }>;
  media: {
    featuredImage: string;
    gallery: string[];
    videos: Array<{ url: string; type: 'demo' | 'presentation' | 'code_review' }>;
    screenshots: Array<{ url: string; description: string; device: 'desktop' | 'tablet' | 'mobile' }>;
  };
  links: {
    live?: string;
    github?: string;
    documentation?: string;
    caseStudy?: string;
    api?: string;
  };
  category: 'web_app' | 'mobile_app' | 'desktop_app' | 'ai_ml' | 'blockchain' | 'iot' | 'game' | 'api';
  status: 'concept' | 'development' | 'testing' | 'deployed' | 'maintenance' | 'archived';
  visibility: 'public' | 'private' | 'client_only';
  featured: boolean;
  priority: number;
  timeline: {
    startDate: Date;
    endDate?: Date;
    milestones: Array<{
      title: string;
      description: string;
      date: Date;
      status: 'pending' | 'in_progress' | 'completed';
    }>;
  };
  team: Array<{
    name: string;
    role: string;
    avatar?: string;
    linkedin?: string;
  }>;
  client?: {
    name: string;
    industry: string;
    logo?: string;
    website?: string;
  };
  tags: string[];
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
  };
  analytics: {
    views: number;
    likes: number;
    shares: number;
    inquiries: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos personalizados
  updateAnalytics(type: 'view' | 'like' | 'share' | 'inquiry'): Promise<void>;
  generateSlug(): string;
}

const projectSchema = new Schema<IProject>({
  uuid: { 
    type: String, 
    default: uuidv4, 
    unique: true, 
    immutable: true 
  },
  title: { 
    type: String, 
    required: [true, 'Título é obrigatório'], 
    trim: true, 
    maxlength: [100, 'Título não pode ter mais de 100 caracteres'] 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    index: true 
  },
  shortDescription: { 
    type: String, 
    required: [true, 'Descrição curta é obrigatória'], 
    maxlength: [200, 'Descrição curta não pode ter mais de 200 caracteres'] 
  },
  fullDescription: { 
    type: String, 
    required: [true, 'Descrição completa é obrigatória'], 
    maxlength: [5000, 'Descrição completa não pode ter mais de 5000 caracteres'] 
  },
  challenges: [{ 
    type: String, 
    maxlength: [500, 'Desafio não pode ter mais de 500 caracteres'] 
  }],
  solutions: [{ 
    type: String, 
    maxlength: [500, 'Solução não pode ter mais de 500 caracteres'] 
  }],
  results: {
    metrics: [{
      name: { 
        type: String, 
        required: [true, 'Nome da métrica é obrigatório'] 
      },
      value: { 
        type: String, 
        required: [true, 'Valor da métrica é obrigatório'] 
      },
      improvement: String
    }],
    testimonials: [{
      author: { 
        type: String, 
        required: [true, 'Autor do depoimento é obrigatório'] 
      },
      role: { 
        type: String, 
        required: [true, 'Cargo do autor é obrigatório'] 
      },
      content: { 
        type: String, 
        required: [true, 'Conteúdo do depoimento é obrigatório'],
        maxlength: [1000, 'Depoimento não pode ter mais de 1000 caracteres'] 
      },
      rating: { 
        type: Number, 
        min: [1, 'Avaliação mínima é 1'], 
        max: [5, 'Avaliação máxima é 5'] 
      }
    }]
  },
  technologies: [{
    name: { 
      type: String, 
      required: [true, 'Nome da tecnologia é obrigatório'] 
    },
    category: {
      type: String,
      enum: {
        values: ['frontend', 'backend', 'database', 'devops', 'mobile', 'ai', 'blockchain'],
        message: '{VALUE} não é uma categoria válida'
      },
      required: [true, 'Categoria da tecnologia é obrigatória']
    },
    level: {
      type: String,
      enum: {
        values: ['primary', 'secondary', 'learning'],
        message: '{VALUE} não é um nível válido'
      },
      default: 'primary'
    },
    icon: String,
    color: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: props => `${props.value} não é uma cor hexadecimal válida`
      }
    }
  }],
  media: {
    featuredImage: { 
      type: String, 
      required: [true, 'Imagem destacada é obrigatória'],
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\..+/.test(v);
        },
        message: props => `${props.value} não é uma URL válida`
      }
    },
    gallery: [{ 
      type: String,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\..+/.test(v);
        },
        message: props => `${props.value} não é uma URL válida`
      }
    }],
    videos: [{
      url: { 
        type: String, 
        required: [true, 'URL do vídeo é obrigatória'],
        validate: {
          validator: function(v) {
            return /^https?:\/\/.+\..+/.test(v);
          },
          message: props => `${props.value} não é uma URL válida`
        }
      },
      type: { 
        type: String, 
        enum: {
          values: ['demo', 'presentation', 'code_review'],
          message: '{VALUE} não é um tipo de vídeo válido'
        }, 
        required: [true, 'Tipo do vídeo é obrigatório'] 
      }
    }],
    screenshots: [{
      url: { 
        type: String, 
        required: [true, 'URL da captura de tela é obrigatória'],
        validate: {
          validator: function(v) {
            return /^https?:\/\/.+\..+/.test(v);
          },
          message: props => `${props.value} não é uma URL válida`
        }
      },
      description: String,
      device: { 
        type: String, 
        enum: {
          values: ['desktop', 'tablet', 'mobile'],
          message: '{VALUE} não é um dispositivo válido'
        }, 
        default: 'desktop' 
      }
    }]
  },
  links: {
    live: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\..+/.test(v);
        },
        message: props => `${props.value} não é uma URL válida`
      }
    },
    github: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/github\.com\/.+\/.+/.test(v);
        },
        message: props => `${props.value} não é uma URL válida do GitHub`
      }
    },
    documentation: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\..+/.test(v);
        },
        message: props => `${props.value} não é uma URL válida`
      }
    },
    caseStudy: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\..+/.test(v);
        },
        message: props => `${props.value} não é uma URL válida`
      }
    },
    api: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\..+/.test(v);
        },
        message: props => `${props.value} não é uma URL válida`
      }
    }
  },
  category: {
    type: String,
    enum: {
      values: ['web_app', 'mobile_app', 'desktop_app', 'ai_ml', 'blockchain', 'iot', 'game', 'api'],
      message: '{VALUE} não é uma categoria válida'
    },
    required: [true, 'Categoria é obrigatória'],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['concept', 'development', 'testing', 'deployed', 'maintenance', 'archived'],
      message: '{VALUE} não é um status válido'
    },
    default: 'concept',
    index: true
  },
  visibility: {
    type: String,
    enum: {
      values: ['public', 'private', 'client_only'],
      message: '{VALUE} não é uma visibilidade válida'
    },
    default: 'public',
    index: true
  },
  featured: { 
    type: Boolean, 
    default: false,
    index: true
  },
  priority: { 
    type: Number, 
    default: 0, 
    min: [0, 'Prioridade mínima é 0'], 
    max: [10, 'Prioridade máxima é 10'],
    index: true
  },
  timeline: {
    startDate: { 
      type: Date, 
      required: [true, 'Data de início é obrigatória'],
      validate: {
        validator: function(v) {
          return v <= new Date();
        },
        message: 'Data de início não pode ser no futuro'
      }
    },
    endDate: { 
      type: Date,
      validate: {
        validator: function(v) {
          const startDate = this.get('timeline.startDate');
          return !v || v >= startDate;
        },
        message: 'Data de término deve ser após a data de início'
      }
    },
    milestones: [{
      title: { 
        type: String, 
        required: [true, 'Título do marco é obrigatório'] 
      },
      description: String,
      date: { 
        type: Date, 
        required: [true, 'Data do marco é obrigatória'] 
      },
      status: { 
        type: String, 
        enum: {
          values: ['pending', 'in_progress', 'completed'],
          message: '{VALUE} não é um status válido'
        }, 
        default: 'pending' 
      }
    }]
  },
  team: [{
    name: { 
      type: String, 
      required: [true, 'Nome do membro da equipe é obrigatório'] 
    },
    role: { 
      type: String, 
      required: [true, 'Função do membro da equipe é obrigatória'] 
    },
    avatar: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\..+/.test(v);
        },
        message: props => `${props.value} não é uma URL válida`
      }
    },
    linkedin: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(?:www\.)?linkedin\.com\/in\/.+/.test(v);
        },
        message: props => `${props.value} não é uma URL válida do LinkedIn`
      }
    }
  }],
  client: {
    name: String,
    industry: String,
    logo: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\..+/.test(v);
        },
        message: props => `${props.value} não é uma URL válida`
      }
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\..+/.test(v);
        },
        message: props => `${props.value} não é uma URL válida`
      }
    }
  },
  tags: [{ 
    type: String, 
    lowercase: true, 
    trim: true,
    index: true
  }],
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta título não pode ter mais de 60 caracteres']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta descrição não pode ter mais de 160 caracteres']
    },
    keywords: [String]
  },
  analytics: {
    views: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    likes: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    shares: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    inquiries: { 
      type: Number, 
      default: 0,
      min: 0 
    }
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para performance
projectSchema.index({ slug: 1 });
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ featured: -1, priority: -1 });
projectSchema.index({ 'analytics.views': -1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ 'timeline.startDate': -1 });

// Middleware para gerar slug
projectSchema.pre('validate', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.generateSlug();
  }
  next();
});

// Métodos de instância
projectSchema.methods.updateAnalytics = async function(type: 'view' | 'like' | 'share' | 'inquiry'): Promise<void> {
  const field = `analytics.${type}s`;
  this[field] = (this[field] || 0) + 1;
  await this.save();
};

projectSchema.methods.generateSlug = function(): string {
  const base = slugify(this.title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
  
  return base;
};

// Middleware para evitar duplicação de slug
projectSchema.pre('save', async function(next) {
  if (this.isModified('slug')) {
    const baseSlug = this.slug;
    let slugCount = 0;
    let testSlug = baseSlug;
    let existingProject;
    
    do {
      if (slugCount > 0) {
        testSlug = `${baseSlug}-${slugCount}`;
      }
      
      existingProject = await this.constructor.findOne({ 
        slug: testSlug, 
        _id: { $ne: this._id } 
      });
      
      slugCount++;
    } while (existingProject);
    
    this.slug = testSlug;
  }
  
  next();
});

// Hooks para validação adicional
projectSchema.pre('save', function(next) {
  // Validar que todas as datas dos marcos são entre a data de início e término
  if (this.isModified('timeline.milestones') || this.isModified('timeline.startDate') || this.isModified('timeline.endDate')) {
    const { startDate, endDate, milestones } = this.timeline;
    
    if (milestones && milestones.length > 0) {
      for (const milestone of milestones) {
        if (milestone.date < startDate) {
          return next(new Error(`Marco "${milestone.title}" tem data anterior à data de início do projeto`));
        }
        
        if (endDate && milestone.date > endDate) {
          return next(new Error(`Marco "${milestone.title}" tem data posterior à data de término do projeto`));
        }
      }
    }
  }
  
  next();
});

// Virtuals
projectSchema.virtual('status_humanized').get(function() {
  const statusMap = {
    concept: 'Conceito',
    development: 'Em Desenvolvimento',
    testing: 'Em Teste',
    deployed: 'Implantado',
    maintenance: 'Em Manutenção',
    archived: 'Arquivado'
  };
  
  return statusMap[this.status] || this.status;
});

projectSchema.virtual('duration').get(function() {
  const { startDate, endDate } = this.timeline;
  
  if (!startDate) return null;
  
  const end = endDate || new Date();
  const durationMs = end.getTime() - startDate.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  
  return durationDays;
});

export const Project = model<IProject>('Project', projectSchema);