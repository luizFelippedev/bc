// API Services for communicating with the backend
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, Project, Certificate, User, ContactForm, Analytics } from '@/types/globals';
import { localStorage } from '@/utils';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.get<string>('portfolio_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - remove token and redirect to login
      localStorage.remove('portfolio_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Generic API request function
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api(config);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'An error occurred');
  }
}

// Auth Services
export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return request({
      method: 'POST',
      url: '/api/auth/login',
      data: { email, password },
    });
  },

  async logout(): Promise<ApiResponse> {
    return request({
      method: 'POST',
      url: '/api/auth/logout',
    });
  },

  async register(userData: Partial<User>): Promise<ApiResponse<{ user: User; token: string }>> {
    return request({
      method: 'POST',
      url: '/api/auth/register',
      data: userData,
    });
  },

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return request({
      method: 'POST',
      url: '/api/auth/refresh',
    });
  },

  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    return request({
      method: 'GET',
      url: '/api/auth/verify',
    });
  },

  async forgotPassword(email: string): Promise<ApiResponse> {
    return request({
      method: 'POST',
      url: '/api/auth/forgot-password',
      data: { email },
    });
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    return request({
      method: 'POST',
      url: '/api/auth/reset-password',
      data: { token, password },
    });
  },
};

// Projects Services
export const projectsService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    featured?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<Project[]>> {
    return request({
      method: 'GET',
      url: '/api/public/projects',
      params,
    });
  },

  async getBySlug(slug: string): Promise<ApiResponse<{ project: Project; related: Project[] }>> {
    return request({
      method: 'GET',
      url: `/api/public/projects/${slug}`,
    });
  },

  async getFeatured(): Promise<ApiResponse<Project[]>> {
    return request({
      method: 'GET',
      url: '/api/public/projects/featured',
    });
  },

  async getCategories(): Promise<ApiResponse<string[]>> {
    return request({
      method: 'GET',
      url: '/api/public/projects/categories',
    });
  },

  // Admin routes
  async create(projectData: FormData): Promise<ApiResponse<Project>> {
    return request({
      method: 'POST',
      url: '/api/admin/projects',
      data: projectData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async update(id: string, projectData: FormData): Promise<ApiResponse<Project>> {
    return request({
      method: 'PUT',
      url: `/api/admin/projects/${id}`,
      data: projectData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async delete(id: string): Promise<ApiResponse> {
    return request({
      method: 'DELETE',
      url: `/api/admin/projects/${id}`,
    });
  },

  async getAnalytics(id: string, startDate?: string, endDate?: string): Promise<ApiResponse<Analytics>> {
    return request({
      method: 'GET',
      url: `/api/admin/projects/${id}/analytics`,
      params: { startDate, endDate },
    });
  },
};

// Certificates Services
export const certificatesService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    type?: string;
    level?: string;
    featured?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<Certificate[]>> {
    return request({
      method: 'GET',
      url: '/api/public/certificates',
      params,
    });
  },

  async getFeatured(): Promise<ApiResponse<Certificate[]>> {
    return request({
      method: 'GET',
      url: '/api/public/certificates/featured',
    });
  },

  // Admin routes
  async create(certificateData: FormData): Promise<ApiResponse<Certificate>> {
    return request({
      method: 'POST',
      url: '/api/admin/certificates',
      data: certificateData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async update(id: string, certificateData: FormData): Promise<ApiResponse<Certificate>> {
    return request({
      method: 'PUT',
      url: `/api/admin/certificates/${id}`,
      data: certificateData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async delete(id: string): Promise<ApiResponse> {
    return request({
      method: 'DELETE',
      url: `/api/admin/certificates/${id}`,
    });
  },
};

// Contact Services
export const contactService = {
  async submitForm(formData: ContactForm): Promise<ApiResponse> {
    return request({
      method: 'POST',
      url: '/api/public/contact',
      data: formData,
    });
  },

  async subscribe(email: string): Promise<ApiResponse> {
    return request({
      method: 'POST',
      url: '/api/public/subscribe',
      data: { email },
    });
  },
};

// Analytics Services
export const analyticsService = {
  async track(event: string, data?: any): Promise<void> {
    try {
      await request({
        method: 'POST',
        url: '/api/public/analytics/track',
        data: {
          event,
          data,
          sessionId: getSessionId(),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      // Silently fail for analytics
      console.warn('Analytics tracking failed:', error);
    }
  },

  async getPublicStats(): Promise<ApiResponse<Analytics>> {
    return request({
      method: 'GET',
      url: '/api/public/analytics/stats',
    });
  },

  // Admin routes
  async getMetrics(startDate?: string, endDate?: string): Promise<ApiResponse<Analytics>> {
    return request({
      method: 'GET',
      url: '/api/admin/analytics/metrics',
      params: { startDate, endDate },
    });
  },

  async getRealTime(): Promise<ApiResponse<any>> {
    return request({
      method: 'GET',
      url: '/api/admin/analytics/realtime',
    });
  },

  async exportData(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const response = await api({
      method: 'GET',
      url: '/api/admin/analytics/export',
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};

// Admin Services
export const adminService = {
  async getDashboard(): Promise<ApiResponse<any>> {
    return request({
      method: 'GET',
      url: '/api/admin/dashboard',
    });
  },

  async getSystemMetrics(): Promise<ApiResponse<any>> {
    return request({
      method: 'GET',
      url: '/api/admin/system/metrics',
    });
  },

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<User[]>> {
    return request({
      method: 'GET',
      url: '/api/admin/users',
      params,
    });
  },

  async updateUserRole(userId: string, role: string): Promise<ApiResponse<User>> {
    return request({
      method: 'PUT',
      url: `/api/admin/users/${userId}/role`,
      data: { role },
    });
  },

  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    resource?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any[]>> {
    return request({
      method: 'GET',
      url: '/api/admin/audit-logs',
      params,
    });
  },

  async createBackup(): Promise<ApiResponse> {
    return request({
      method: 'POST',
      url: '/api/admin/backup',
    });
  },

  async clearCache(pattern?: string): Promise<ApiResponse> {
    return request({
      method: 'POST',
      url: '/api/admin/cache/clear',
      data: { pattern },
    });
  },

  async getSystemConfig(): Promise<ApiResponse<any>> {
    return request({
      method: 'GET',
      url: '/api/admin/system/config',
    });
  },

  async updateSystemConfig(settings: any): Promise<ApiResponse> {
    return request({
      method: 'PUT',
      url: '/api/admin/system/config',
      data: { settings },
    });
  },
};

// Search Services
export const searchService = {
  async search(query: string, type?: 'projects' | 'certificates' | 'all', category?: string): Promise<ApiResponse<any>> {
    return request({
      method: 'GET',
      url: '/api/public/search',
      params: { q: query, type, category },
    });
  },
};

// File Upload Services
export const uploadService = {
  async uploadFile(file: File, folder?: string): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    return request({
      method: 'POST',
      url: '/api/upload/single',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async uploadMultiple(files: File[], folder?: string): Promise<ApiResponse<Array<{ url: string; filename: string }>>> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }

    return request({
      method: 'POST',
      url: '/api/upload/multiple',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async deleteFile(url: string): Promise<ApiResponse> {
    return request({
      method: 'DELETE',
      url: '/api/upload/delete',
      data: { url },
    });
  },
};

// Skills Services
export const skillsService = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return request({
      method: 'GET',
      url: '/api/public/skills',
    });
  },

  async getCategories(): Promise<ApiResponse<any[]>> {
    return request({
      method: 'GET',
      url: '/api/public/skills/categories',
    });
  },
};

// About Services
export const aboutService = {
  async getData(): Promise<ApiResponse<any>> {
    return request({
      method: 'GET',
      url: '/api/public/about',
    });
  },
};

// Utility functions
function getSessionId(): string {
  let sessionId = localStorage.get<string>('session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.set('session_id', sessionId);
  }
  return sessionId;
}

// Export the configured axios instance for custom requests
export { api };

// Health check
export const healthService = {
  async check(): Promise<ApiResponse> {
    return request({
      method: 'GET',
      url: '/health',
    });
  },
};

// RSS and Sitemap
export const contentService = {
  async getRSS(): Promise<string> {
    const response = await api({
      method: 'GET',
      url: '/api/public/rss',
      responseType: 'text',
    });
    return response.data;
  },

  async getSitemap(): Promise<string> {
    const response = await api({
      method: 'GET',
      url: '/api/public/sitemap.xml',
      responseType: 'text',
    });
    return response.data;
  },
};

// Export all services
export default {
  auth: authService,
  projects: projectsService,
  certificates: certificatesService,
  contact: contactService,
  analytics: analyticsService,
  admin: adminService,
  search: searchService,
  upload: uploadService,
  skills: skillsService,
  about: aboutService,
  health: healthService,
  content: contentService,
};