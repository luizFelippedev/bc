// src/config/swagger.ts - API Documentation
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './environment';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio API Documentation',
      version: '1.0.0',
      description: 'API Documentation for Portfolio Backend',
      contact: {
        name: 'API Support',
        email: 'support@portfolio.com',
      },
    },
    servers: [
      {
        url:
          config.environment === 'production'
            ? 'https://api.portfolio.com'
            : `http://localhost:${config.port}`,
        description:
          config.environment === 'production' ? 'Production' : 'Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
