// src/middlewares/RateLimitMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisClient } from '../config/redis';
import { LoggerService } from '../services/LoggerService';
import { ApiError } from '../utils/ApiError';

export class RateLimitMiddleware {
  private static logger = LoggerService.getInstance();
  private static limiterMap: Map<string, RateLimiterRedis> = new Map();

  /**
   * Cria um middleware de rate limiting baseado em Redis
   * @param options Opções de configuração
   */
  public static createLimiter(options: {
    keyPrefix?: string;      // Prefixo para chaves Redis
    points?: number;         // Número máximo de requisições
    duration?: number;       // Duração em segundos
    blockDuration?: number;  // Duração do bloqueio após exceder limite
    keyGenerator?: (req: Request) => string; // Função para gerar chave única
  }) {
    const {
      keyPrefix = 'rate_limit',
      points = 60,
      duration = 60,
      blockDuration = 0,
      keyGenerator = (req: Request) => req.ip || 'unknown'
    } = options;

    // Reutilizar limiters existentes
    const limiterKey = `${keyPrefix}:${points}:${duration}`;
    if (!this.limiterMap.has(limiterKey)) {
      const limiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix,
        points,
        duration,
        blockDuration
      });
      this.limiterMap.set(limiterKey, limiter);
    }

    const limiter = this.limiterMap.get(limiterKey)!;

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        let key = keyGenerator(req);
        
        // CORRIGIDO: Garantir que a chave seja válida
        if (!key || key === 'undefined' || key === 'null') {
          key = req.ip || req.socket.remoteAddress || 'anonymous';
        }
        
        // Se ainda não tiver uma chave válida, usar um fallback
        if (!key) {
          key = 'fallback_' + Date.now();
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
          
          next(ApiError.tooManyRequests(`Muitas requisições. Tente novamente em ${Math.ceil(error.msBeforeNext / 1000)} segundos`));
        } else {
          this.logger.error('Erro no rate limiter:', error);
          next(ApiError.internal('Erro ao verificar rate limit'));
        }
      }
    };
  }

  /**
   * Limitador para rotas de API públicas
   */
  public static publicApiLimiter = RateLimitMiddleware.createLimiter({
    keyPrefix: 'rate_limit:public',
    points: 60,       // 60 requisições
    duration: 60      // em 60 segundos (1 requisição por segundo)
  });

  /**
   * Limitador para rotas de autenticação
   */
  public static authLimiter = RateLimitMiddleware.createLimiter({
    keyPrefix: 'rate_limit:auth',
    points: 10,       // 10 requisições
    duration: 60 * 15, // em 15 minutos
    blockDuration: 60 * 60 // Bloqueia por 1 hora após exceder
  });

  /**
   * Limitador para rotas de contato
   */
  public static contactLimiter = RateLimitMiddleware.createLimiter({
    keyPrefix: 'rate_limit:contact',
    points: 3,        // 3 requisições
    duration: 60 * 60, // em 1 hora
    blockDuration: 60 * 60 * 24 // Bloqueia por 1 dia após exceder
  });

  /**
   * Limitador para rotas administrativas
   */
  public static adminLimiter = RateLimitMiddleware.createLimiter({
    keyPrefix: 'rate_limit:admin',
    points: 300,      // 300 requisições
    duration: 60      // em 60 segundos (5 requisições por segundo)
  });

  /**
   * Cria um limitador específico para uma rota
   */
  public static forRoute(routeOptions: {
    points: number;
    duration: number;
    blockDuration?: number;
  }) {
    return RateLimitMiddleware.createLimiter({
      keyPrefix: `rate_limit:route:${routeOptions.points}:${routeOptions.duration}`,
      points: routeOptions.points,
      duration: routeOptions.duration,
      blockDuration: routeOptions.blockDuration
    });
  }
}