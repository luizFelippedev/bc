// src/middlewares/RateLimitMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { LoggerService } from '../services/LoggerService';
import { CacheService } from '../services/CacheService';
import { ApiError } from '../utils/ApiError';

export class RateLimitMiddleware {
  private static logger = LoggerService.getInstance();
  private static limiterMap: Map<string, RateLimiterRedis | RateLimiterMemory> = new Map();

  /**
   * Define cabeçalhos de resposta de rate limit
   */
  private static setRateLimitHeaders(res: Response, limit: number, msBeforeNext: number) {
    res.set('Retry-After', String(Math.ceil(msBeforeNext / 1000)));
    res.set('X-RateLimit-Limit', String(limit));
    res.set('X-RateLimit-Remaining', '0');
    res.set('X-RateLimit-Reset', String(Math.ceil(Date.now() + msBeforeNext)));
  }

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

    const limiterKey = `${keyPrefix}:${points}:${duration}:${blockDuration}`;

    if (!this.limiterMap.has(limiterKey)) {
      let limiter: RateLimiterRedis | RateLimiterMemory;

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
        this.logger.warn('Redis não disponível para rate limiting, usando fallback em memória');
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
        let key = keyGenerator(req)?.trim() || req.ip || req.socket?.remoteAddress || `fallback_${Date.now()}_${Math.random()}`;

        await limiter.consume(key);
        next();
      } catch (error: any) {
        if (error?.msBeforeNext) {
          this.setRateLimitHeaders(res, points, error.msBeforeNext);

          this.logger.warn('Rate limit excedido', {
            ip: req.ip,
            path: req.path,
            method: req.method,
            userAgent: req.headers['user-agent'],
            referer: req.headers['referer'],
            msBeforeNext: error.msBeforeNext
          });

          const apiError = ApiError.tooManyRequests(
            `Muitas requisições. Tente novamente em ${Math.ceil(error.msBeforeNext / 1000)} segundos`
          );
          next(apiError);
        } else {
          this.logger.error('Erro no rate limiter:', error);
          next(); // Não bloquear se o limiter falhar
        }
      }
    };
  }

  /**
   * Limitador para rotas públicas
   */
  public static publicApiLimiter = RateLimitMiddleware.createLimiter({
    keyPrefix: 'rate_limit:public',
    points: 100,      // 100 requisições
    duration: 60      // por minuto
  });

  /**
   * Limitador para rotas de autenticação
   */
  public static authLimiter = RateLimitMiddleware.createLimiter({
    keyPrefix: 'rate_limit:auth',
    points: 10,        // 10 tentativas
    duration: 60 * 15, // a cada 15 minutos
    blockDuration: 60 * 60 // bloqueia por 1h após exceder
  });

  /**
   * Limitador para rotas administrativas
   */
  public static adminLimiter = RateLimitMiddleware.createLimiter({
    keyPrefix: 'rate_limit:admin',
    points: 1000,      // 1000 requisições
    duration: 60       // por minuto
  });

  /**
   * Limitador para contato
   */
  public static contactLimiter = RateLimitMiddleware.createLimiter({
    keyPrefix: 'rate_limit:contact',
    points: 5,              // 5 mensagens
    duration: 60 * 60,      // por hora
    blockDuration: 60 * 60 * 24 // bloqueia por 24h
  });

  /**
   * Criar limiter customizado por rota
   */
  public static forRoute(options: {
    keyPrefix?: string;
    points?: number;
    duration?: number;
    blockDuration?: number;
    keyGenerator?: (req: Request) => string;
  }) {
    return RateLimitMiddleware.createLimiter(options);
  }
}
