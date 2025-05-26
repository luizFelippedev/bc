import { Schema, model, Document } from 'mongoose';
import slugify from 'slugify';

export interface IProject extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  technologies: Array<{
    name: string;
    category: string;
    level: 'primary' | 'secondary' | 'learning';
  }>;
  images: {
    featured: string;
    gallery: string[];
  };
  links: {
    live?: string;
    github?: string;
    documentation?: string;
  };
  category: string;
  featured: boolean;
  status: 'in_progress' | 'completed' | 'archived';
  date: {
    start: Date;
    end?: Date;
  };
  views: number;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  shortDescription: { 
    type: String, 
    required: true, 
    maxlength: 200 
  },
  fullDescription: { 
    type: String, 
    required: true 
  },
  technologies: [{
    name: { type: String, required: true },
    category: { type: String, required: true },
    level: { 
      type: String, 
      enum: ['primary', 'secondary', 'learning'],
      default: 'primary'
    }
  }],
  images: {
    featured: { type: String, required: true },
    gallery: [String]
  },
  links: {
    live: String,
    github: String,
    documentation: String
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'archived'],
    default: 'completed',
    index: true
  },
  date: {
    start: { type: Date, required: true },
    end: Date
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Índices para busca eficiente
projectSchema.index({ title: 'text', shortDescription: 'text', fullDescription: 'text', tags: 'text' });
projectSchema.index({ featured: -1, createdAt: -1 });

// Middleware para gerar slug
projectSchema.pre('validate', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

export const Project = model<IProject>('Project', projectSchema);