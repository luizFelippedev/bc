import { Schema, model, Document } from 'mongoose';

export interface IConfiguration extends Document {
  profile: {
    name: string;
    title: string;
    description: string;
    avatar: string;
    location: string;
    contactEmail: string;
    resumeUrl?: string;
  };
  socialLinks: Array<{
    platform: string;
    url: string;
    icon: string;
  }>;
  siteSettings: {
    title: string;
    description: string;
    language: string;
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
  };
  seo: {
    keywords: string[];
    googleAnalyticsId?: string;
    metaImage?: string;
  };
  updatedAt: Date;
}

const configurationSchema = new Schema<IConfiguration>(
  {
    profile: {
      name: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      avatar: String,
      location: String,
      contactEmail: { type: String, required: true },
      resumeUrl: String,
    },
    socialLinks: [
      {
        platform: { type: String, required: true },
        url: { type: String, required: true },
        icon: String,
      },
    ],
    siteSettings: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      language: { type: String, default: 'pt-BR' },
      primaryColor: { type: String, default: '#3B82F6' },
      secondaryColor: { type: String, default: '#10B981' },
      darkMode: { type: Boolean, default: true },
    },
    seo: {
      keywords: [String],
      googleAnalyticsId: String,
      metaImage: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Configuration = model<IConfiguration>(
  'Configuration',
  configurationSchema
);
