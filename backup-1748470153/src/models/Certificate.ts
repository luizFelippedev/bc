import { Schema, model, Document } from 'mongoose';

export interface ICertificate extends Document {
  title: string;
  issuer: {
    name: string;
    logo?: string;
    website?: string;
  };
  date: {
    issued: Date;
    expires?: Date;
  };
  credentialId?: string;
  credentialUrl?: string;
  category: string;
  skills: string[];
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  featured: boolean;
  image: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    issuer: {
      name: { type: String, required: true },
      logo: String,
      website: String,
    },
    date: {
      issued: { type: Date, required: true },
      expires: Date,
    },
    credentialId: String,
    credentialUrl: String,
    category: {
      type: String,
      required: true,
      index: true,
    },
    skills: [String],
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate',
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para busca eficiente
certificateSchema.index({
  title: 'text',
  'issuer.name': 'text',
  skills: 'text',
});
certificateSchema.index({ featured: -1, 'date.issued': -1 });

export const Certificate = model<ICertificate>(
  'Certificate',
  certificateSchema
);
