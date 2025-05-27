// src/config/security.ts
import helmet from 'helmet';
import cors from 'cors';
import { Express } from 'express';
import { LoggerService } from '../services/LoggerService';

export class SecurityConfig {
  private static logger = LoggerService.getInstance();

  /**
   * Configura todas as medidas de segurança
   */
  public static setup(app: Express): void {
    this.setupHelmet(app);
    this.setupCors(app);
    this.setupContentSecurity(app);
    this.setupHeaderSecurity(app);
    
    this.logger.info('Configurações de segurança aplicadas');
  }

  /**
   * Configura Helmet para proteções básicas de cabeçalhos
   */
  private static setupHelmet(app: Express): void {
    app.use(helmet());
  }

  /**
   * Configura CORS de forma segura
   */
  private static setupCors(app: Express): void {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    app.use(cors({
      origin: (origin, callback) => {
        // Permitir requisições sem origin (como mobile apps ou curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          this.logger.warn(`Requisição CORS bloqueada de origem: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      maxAge: 86400 // 24 horas
    }));
  }

  /**
   * Configura Content Security Policy
   */
  private static setupContentSecurity(app: Express): void {
    app.use(helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://*.cloudinary.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    }));
  }

  /**
   * Configura headers de segurança adicionais
   */
  private static setupHeaderSecurity(app: Express): void {
    // Strict Transport Security (força HTTPS)
    if (process.env.NODE_ENV === 'production') {
      app.use(helmet.hsts({
        maxAge: 31536000, // 1 ano
        includeSubDomains: true,
        preload: true
      }));
    }
    
    // Prevenir sniffing de MIME
    app.use(helmet.noSniff());
    
    // Prevenir clickjacking
    app.use(helmet.frameguard({ action: 'deny' }));
    
    // Prevenir IE de executar downloads não seguros
    app.use(helmet.ieNoOpen());
    
    // Remover X-Powered-By
    app.disable('x-powered-by');
  }
}