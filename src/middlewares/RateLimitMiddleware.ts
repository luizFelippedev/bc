// src/middlewares/RateLimitMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { LoggerService } from '../services/LoggerService';
import { CacheService } from '../services/CacheService';
import { ApiError } from '../utils/ApiError';

export class RateLimitMiddleware {
  private static logger = LoggerService.getInstance();
  private static limiterMap: Map<string, RateLimiterRedis> = new Map();

  /**
   * Cria um middleware de rate limiting
   */
  public static createLimiter(options: {
    keyPrefix?: string;
    points?: number;
    duration?: number;
    blockDuration?: number;
    keyGenerator?: (req: Request) => string;
  }) {
    const {
      keyPrefix = 'rate_limit',
      points = 60,
      duration = 60,
      blockDuration = 0,
      keyGenerator = (req: Request) => req.ip || 'unknown'
    } = options;

    const limiterKey = `${keyPrefix}:${points}:${duration}`;
    
    if (!this.limiterMap.has(limiterKey)) {
      let limiter: RateLimiterRedis;
      
      try {
        const cacheService = CacheService.getInstance();
        limiter = new RateLimiterRedis({
          storeClient: cacheService.getClient(),
          keyPrefix,
          points,
          duration,
          blockDuration
        });
      } catch (error) {
        // Fallback para rate limiter em memória
        this.logger.warn('Redis não disponível para rate limiting, usando fallback em memória');
        const { RateLimiterMemory } = require('rate-limiter-flexible');
        limiter = new RateLimiterMemory({
          keyPrefix,
          points,
          duration,
          blockDuration
        });
      }
      
      this.limiterMap.set(limiterKey, limiter);
    }

    const limiter = this.limiterMap.get(limiterKey)!;

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        let key = keyGenerator(req);
        
        // Garantir que a chave seja válida
        if (!key || key === 'undefined' || key === 'null') {
          key = req.ip || req.socket?.remoteAddress || 'anonymous';
        }
        
        // Se ainda não tiver uma chave válida, usar fallback
        if (!key) {
          key = `fallback_${Date.now()}_${Math.random()}`;
        }
        
        await limiter.consume(key);
        next();
      } catch (error: any) {
        if (error.msBeforeNext) {
          res.set('Retry-After', String(Math.ceil(error.msBeforeNext / 1000)));
          res.set('X-RateLimit-Limit', String(points));
          res.set('X-RateLimit-Remaining', '0');
          res.set('X-RateLimit-Reset', String(Math.ceil(Date.now() + error.msBeforeNext)));
          
          this.logger.warn('Rate limit excedido', {
            ip: req.ip,
            path: req.path,
            method: req.method,
            msBeforeNext: error.msBeforeNext
          });
          
          const apiError = ApiError.tooManyRequests(
            `Muitas requisições. Tente novamente em ${Math.ceil(error.msBeforeNext / 1000)} segundos`
          );
          next(apiError);
        } else {
          this.logger.error('Erro no rate limiter:', error);
          // Não bloquear a requisição se houver erro no rate limiter
          next();
        }
      }
    };
  }

  /**
   * Limitador para rotas de API públicas
   */
  public static publicApiLimiter = RateLimitMiddleware.createLimiter({
    keyPrefix: 'rate_limit:public',
    points: 100,      // 100 requisições
    duration: 60      // em 60 segundos
  });

  /**
   * Limitador para rotas de autenticação
   */
  public static authLimiter = RateLimitMiddleware.createLimiter({
    keyPrefix: 'rate_limit:auth',
    points: 10,       // 10 tentativas
    duration: 60 * 15, // em 15 minutos
    blockDuration: 60 * 60 // Bloqueia por 1 hora após exceder
  });

  /**
   * Limitador para rotas administrativas
   */
  public static adminLimiter = RateLimitMiddleware.createLimiter({
    keyPrefix: 'rate_limit:admin',
    points: 1000,     // 1000 requisições
    duration: 60      // em 60 segundos
  });

  /**
   * Limitador para contato
   */
  public static contactLimiter = RateLimitMiddleware.createLimiter({
    keyPrefix: 'rate_limit:contact',
    points: 5,        // 5 mensagens
    duration: 60 * 60, // em 1 hora
    blockDuration: 60 * 60 * 24 // Bloqueia por 1 dia
  });
}
