export const serverConfig = {
  port: process.env.PORT || 5001,
  env: process.env.NODE_ENV || 'development',
  apiPrefix: '/api',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  uploadDir: 'uploads',
  maxFileSize: '50mb',
  rateLimits: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 100
  }
};
