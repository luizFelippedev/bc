import { Schema, model, Document } from 'mongoose';

export interface IAnalytics extends Document {
  eventType: 'page_view' | 'project_view' | 'certificate_view' | 'contact';
  projectId?: string;
  certificateId?: string;
  page?: string;
  sessionId: string;
  country?: string;
  city?: string;
  browser?: string;
  os?: string;
  device?: 'desktop' | 'mobile' | 'tablet';
  referrer?: string;
  userAgent?: string;
  ip?: string;
  createdAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>({
  eventType: {
    type: String,
    enum: ['page_view', 'project_view', 'certificate_view', 'contact'],
    required: true,
    index: true
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  certificateId: {
    type: Schema.Types.ObjectId,
    ref: 'Certificate',
    index: true
  },
  page: String,
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  country: String,
  city: String,
  browser: String,
  os: String,
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet']
  },
  referrer: String,
  userAgent: String,
  ip: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export const Analytics = model<IAnalytics>('Analytics', analyticsSchema);