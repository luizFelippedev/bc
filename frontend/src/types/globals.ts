// Global type definitions for the portfolio application

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "visitor";
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    loginCount: number;
    lastLogin: Date;
    timeSpent: number;
  };
  permissions: {
    canCreateProjects: boolean;
    canEditProjects: boolean;
    canDeleteProjects: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
  };
}

export interface Technology {
  name: string;
  icon: React.ReactNode | string;
  color: string;
  category:
    | "frontend"
    | "backend"
    | "database"
    | "devops"
    | "mobile"
    | "design"
    | "ai"
    | "blockchain";
  level: "primary" | "secondary" | "learning";
}

export interface Project {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  challenges: string[];
  solutions: string[];
  results: {
    metrics: Array<{ name: string; value: string; improvement?: string }>;
    testimonials: Array<{
      author: string;
      role: string;
      content: string;
      rating: number;
    }>;
  };
  technologies: Technology[];
  media: {
    featuredImage: string;
    gallery: string[];
    videos: Array<{
      url: string;
      type: "demo" | "presentation" | "code_review";
    }>;
    screenshots: Array<{
      url: string;
      description: string;
      device: "desktop" | "tablet" | "mobile";
    }>;
  };
  links: {
    live?: string;
    github?: string;
    documentation?: string;
    caseStudy?: string;
    api?: string;
  };
  category:
    | "web_app"
    | "mobile_app"
    | "desktop_app"
    | "ai_ml"
    | "blockchain"
    | "iot"
    | "game"
    | "api";
  status:
    | "concept"
    | "development"
    | "testing"
    | "deployed"
    | "maintenance"
    | "archived";
  visibility: "public" | "private" | "client_only";
  featured: boolean;
  priority: number;
  timeline: {
    startDate: Date;
    endDate?: Date;
    milestones: Array<{
      title: string;
      description: string;
      date: Date;
      status: "pending" | "in_progress" | "completed";
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
}

export interface Certificate {
  id: string;
  uuid: string;
  title: string;
  issuer: {
    name: string;
    logo?: string;
    website?: string;
    accreditation?: string;
  };
  credential: {
    id?: string;
    url?: string;
    verificationUrl?: string;
    blockchainVerification?: {
      network: string;
      contractAddress: string;
      tokenId: string;
    };
  };
  dates: {
    issued: Date;
    expires?: Date;
    renewed?: Date;
  };
  level: "foundational" | "associate" | "professional" | "expert" | "master";
  type: "technical" | "business" | "language" | "academic" | "professional";
  skills: Array<{
    name: string;
    category: string;
    proficiencyLevel: "beginner" | "intermediate" | "advanced" | "expert";
  }>;
  media: {
    certificate: string;
    badge?: string;
    transcript?: string;
  };
  verification: {
    verified: boolean;
    verifiedAt?: Date;
    verificationMethod: "manual" | "api" | "blockchain";
    notes?: string;
  };
  metadata: {
    courseHours?: number;
    examScore?: number;
    passingScore?: number;
    continuingEducationUnits?: number;
  };
  tags: string[];
  featured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0-100
  experience: string;
  category: string;
  icon: string;
  color: string;
  projects: number;
  description: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  budget?: string;
  timeline?: string;
  projectType?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage?: number;
    prevPage?: number;
  };
}

export interface Analytics {
  pageViews: number;
  uniqueVisitors: number;
  projectViews: number;
  contactFormSubmissions: number;
  downloadCount: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
  topProjects: Array<{ project: string; views: number }>;
  geographicData: Array<{ country: string; visitors: number }>;
  deviceData: Array<{ device: string; count: number }>;
  trafficSources: Array<{ source: string; visitors: number }>;
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

export interface ThemeState {
  mode: "light" | "dark" | "cyberpunk" | "neon" | "matrix";
  customColors: ThemeConfig;
  animations: boolean;
  particles: boolean;
  glassEffect: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface DataContextState {
  projects: Project[];
  certificates: Certificate[];
  isLoading: boolean;
}

// Event types for analytics
export interface AnalyticsEvent {
  type:
    | "page_view"
    | "project_view"
    | "certificate_view"
    | "contact_form"
    | "download"
    | "socket_connection"
    | "socket_disconnection"
    | "user_activity";
  userId?: string;
  sessionId: string;
  data: Record<string, any>;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  data?: any;
  recipients: string[];
  channels: ("socket" | "email" | "push")[];
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
}

// File upload types
export interface UploadResult {
  fieldname: string;
  originalname: string;
  filename: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
  metadata?: any;
}

// Search types
export interface SearchResult {
  id: string;
  type: "project" | "certificate";
  title: string;
  description: string;
  score: number;
  highlights?: string[];
}

// Performance monitoring types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  labels?: Record<string, string>;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  external?: boolean;
  children?: NavigationItem[];
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  size?: "sm" | "md" | "lg" | "xl";
  type?: "spinner" | "dots" | "pulse" | "bars" | "wave";
  color?: "primary" | "secondary" | "white" | "gray";
  text?: string;
  fullScreen?: boolean;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Error types
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;
}

// Socket types
export interface SocketUser {
  id: string;
  socketId: string;
  userId?: string;
  role?: string;
  isAuthenticated: boolean;
  connectedAt: Date;
  lastActivity: Date;
  metadata: {
    userAgent: string;
    ipAddress: string;
    location?: {
      country: string;
      city: string;
    };
  };
}

// Utility types for better TypeScript support
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// API Utility types
export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiRequestConfig {
  method: ApiMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

// Form types
export interface FormField {
  name: string;
  type:
    | "text"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "file";
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: (value: any) => string | undefined;
  options?: Array<{ label: string; value: string }>;
}

export interface FormConfig {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  initialValues?: Record<string, any>;
  submitLabel?: string;
  resetLabel?: string;
}

// Enhanced Window interface
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    fs?: {
      readFile: (
        path: string,
        options?: { encoding?: string },
      ) => Promise<Uint8Array | string>;
    };
    // PWA related
    deferredPrompt?: any;
    // Performance monitoring
    webVitals?: {
      getCLS: (callback: (metric: any) => void) => void;
      getFID: (callback: (metric: any) => void) => void;
      getFCP: (callback: (metric: any) => void) => void;
      getLCP: (callback: (metric: any) => void) => void;
      getTTFB: (callback: (metric: any) => void) => void;
    };
  }

  // Enhanced Navigator interface
  interface Navigator {
    standalone?: boolean;
    connection?: {
      effectiveType: string;
      downlink: number;
      rtt: number;
    };
  }

  // Environment variables
  namespace NodeJS {
    interface ProcessEnv {
      // Base environment
      NODE_ENV: "development" | "production" | "test";

      // Application URLs
      NEXT_PUBLIC_APP_URL: string;
      NEXT_PUBLIC_API_URL: string;

      // Database
      DATABASE_URL: string;
      MONGODB_URI: string;
      REDIS_URL: string;

      // Authentication
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      REFRESH_TOKEN_SECRET: string;
      REFRESH_TOKEN_EXPIRES_IN: string;

      // File Storage
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      AWS_S3_BUCKET: string;

      // Analytics
      NEXT_PUBLIC_GA_TRACKING_ID: string;
      GOOGLE_ANALYTICS_ID: string;

      // Email Services
      EMAIL_HOST: string;
      EMAIL_PORT: string;
      EMAIL_USER: string;
      EMAIL_PASS: string;
      SENDGRID_API_KEY: string;
      RESEND_API_KEY: string;

      // Social Auth
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
      LINKEDIN_CLIENT_ID: string;
      LINKEDIN_CLIENT_SECRET: string;

      // External APIs
      OPENAI_API_KEY: string;
      STRIPE_SECRET_KEY: string;
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;

      // Monitoring & Logging
      SENTRY_DSN: string;
      NEXT_PUBLIC_SENTRY_DSN: string;
      LOGROCKET_APP_ID: string;

      // Feature Flags
      FEATURE_ANALYTICS: string;
      FEATURE_PWA: string;
      FEATURE_DARK_MODE: string;

      // Security
      ENCRYPTION_KEY: string;
      CORS_ORIGIN: string;
      RATE_LIMIT_MAX: string;
      RATE_LIMIT_WINDOW: string;

      // Development
      NEXT_PUBLIC_DEBUG: string;
      DISABLE_SSL: string;

      // Cache
      CACHE_TTL: string;
      REDIS_CACHE_PREFIX: string;

      // Webhooks
      WEBHOOK_SECRET: string;
      GITHUB_WEBHOOK_SECRET: string;

      // Deployment
      VERCEL_URL: string;
      VERCEL_ENV: string;
      RAILWAY_ENVIRONMENT: string;

      // Custom
      PORTFOLIO_ADMIN_EMAIL: string;
      CONTACT_NOTIFICATION_EMAIL: string;
      BACKUP_SCHEDULE: string;
    }
  }
}

// Socket.IO extension
declare module "socket.io-client" {
  interface Socket {
    userId?: string;
    userRole?: string;
    isAuthenticated?: boolean;
  }
}

// Framer Motion extensions
declare module "framer-motion" {
  interface AnimationProps {
    layoutId?: string;
  }
}

// Next.js extensions
declare module "next/router" {
  interface NextRouter {
    query: {
      [key: string]: string | string[] | undefined;
    };
  }
}

// React extensions for custom props
declare module "react" {
  interface HTMLAttributes<T> {
    css?: any; // For emotion/styled-components
  }
}

// Tailwind CSS IntelliSense
declare module "tailwindcss/lib/util/flattenColorPalette" {
  function flattenColorPalette(colors: any): any;
  export = flattenColorPalette;
}

// Export types for easier importing
export type {
  DeepPartial,
  Nullable,
  Optional,
  RequiredBy,
  ApiMethod,
  ApiRequestConfig,
  FormField,
  FormConfig,
};

// Re-export commonly used React types
export type {
  ReactNode,
  ReactElement,
  ComponentType,
  FC,
  PropsWithChildren,
  RefObject,
  MutableRefObject,
  CSSProperties,
} from "react";

export {};

// Additional utility types for specific use cases
export type ProjectStatus = Project["status"];
export type ProjectCategory = Project["category"];
export type CertificateLevel = Certificate["level"];
export type CertificateType = Certificate["type"];
export type ThemeMode = ThemeState["mode"];
export type UserRole = User["role"];

// Branded types for better type safety
export type ProjectId = string & { readonly brand: unique symbol };
export type UserId = string & { readonly brand: unique symbol };
export type CertificateId = string & { readonly brand: unique symbol };

// Enum-like objects for better intellisense
export const PROJECT_STATUSES = {
  CONCEPT: "concept",
  DEVELOPMENT: "development",
  TESTING: "testing",
  DEPLOYED: "deployed",
  MAINTENANCE: "maintenance",
  ARCHIVED: "archived",
} as const;

export const PROJECT_CATEGORIES = {
  WEB_APP: "web_app",
  MOBILE_APP: "mobile_app",
  DESKTOP_APP: "desktop_app",
  AI_ML: "ai_ml",
  BLOCKCHAIN: "blockchain",
  IOT: "iot",
  GAME: "game",
  API: "api",
} as const;

export const CERTIFICATE_LEVELS = {
  FOUNDATIONAL: "foundational",
  ASSOCIATE: "associate",
  PROFESSIONAL: "professional",
  EXPERT: "expert",
  MASTER: "master",
} as const;

export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
  CYBERPUNK: "cyberpunk",
  NEON: "neon",
  MATRIX: "matrix",
} as const;
