// src/middlewares/responseHandler.ts - Middleware de Resposta Completo
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, PaginationMeta } from '../utils/ApiResponse';
import { LoggerService } from '../services/LoggerService';

const logger = LoggerService.getInstance();

// Estender a interface Response para incluir métodos personalizados
declare global {
  namespace Express {
    interface Response {
      sendSuccess<T>(data: T, message?: string): Response;
      sendError(message: string, statusCode?: number, errors?: any): Response;
      sendPaginated<T>(
        data: T[],
        pagination: PaginationMeta,
        message?: string
      ): Response;
      sendCreated<T>(data: T, message?: string): Response;
      sendNotFound(resource?: string): Response;
      sendUnauthorized(message?: string): Response;
      sendForbidden(message?: string): Response;
      sendValidationError(errors: any[], message?: string): Response;
    }
  }
}

export class ResponseHandlerMiddleware {
  /**
   * Middleware principal que adiciona métodos de resposta personalizados
   */
  public static handler(req: Request, res: Response, next: NextFunction): void {
    // Resposta de sucesso genérica
    res.sendSuccess = function <T>(data: T, message?: string): Response {
      const response = ApiResponse.success(data, message);

      logger.debug('Success response sent', {
        method: req.method,
        path: req.path,
        statusCode: 200,
        hasData: !!data,
      });

      return res.status(200).json(response);
    };

    // Resposta de erro genérica
    res.sendError = function (
      message: string,
      statusCode: number = 400,
      errors?: any
    ): Response {
      const response = ApiResponse.error(message, statusCode, errors);

      logger.warn('Error response sent', {
        method: req.method,
        path: req.path,
        statusCode,
        message,
        hasErrors: !!errors,
      });

      return res.status(statusCode).json(response);
    };

    // Resposta paginada
    res.sendPaginated = function <T>(
      data: T[],
      pagination: PaginationMeta,
      message?: string
    ): Response {
      const response = ApiResponse.paginated(data, pagination, message);

      logger.debug('Paginated response sent', {
        method: req.method,
        path: req.path,
        statusCode: 200,
        itemCount: data.length,
        totalItems: pagination.total,
        currentPage: pagination.page,
      });

      return res.status(200).json(response);
    };

    // Resposta de criação (201)
    res.sendCreated = function <T>(data: T, message?: string): Response {
      const response = ApiResponse.success(
        data,
        message || 'Resource created successfully'
      );

      logger.info('Created response sent', {
        method: req.method,
        path: req.path,
        statusCode: 201,
        hasData: !!data,
      });

      return res.status(201).json(response);
    };

    // Resposta de não encontrado (404)
    res.sendNotFound = function (resource: string = 'Resource'): Response {
      const response = ApiResponse.error(`${resource} not found`, 404);

      logger.debug('Not found response sent', {
        method: req.method,
        path: req.path,
        statusCode: 404,
        resource,
      });

      return res.status(404).json(response);
    };

    // Resposta de não autorizado (401)
    res.sendUnauthorized = function (
      message: string = 'Unauthorized'
    ): Response {
      const response = ApiResponse.error(message, 401);

      logger.warn('Unauthorized response sent', {
        method: req.method,
        path: req.path,
        statusCode: 401,
        message,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      return res.status(401).json(response);
    };

    // Resposta de proibido (403)
    res.sendForbidden = function (message: string = 'Forbidden'): Response {
      const response = ApiResponse.error(message, 403);

      logger.warn('Forbidden response sent', {
        method: req.method,
        path: req.path,
        statusCode: 403,
        message,
        userId: (req as any).user?.id,
        ip: req.ip,
      });

      return res.status(403).json(response);
    };

    // Resposta de erro de validação (422)
    res.sendValidationError = function (
      errors: any[],
      message: string = 'Validation failed'
    ): Response {
      const response = ApiResponse.error(message, 422, errors);

      logger.debug('Validation error response sent', {
        method: req.method,
        path: req.path,
        statusCode: 422,
        errorCount: errors?.length || 0,
        errors,
      });

      return res.status(422).json(response);
    };

    next();
  }

  /**
   * Método auxiliar para configurar headers de cache
   */
  public static cache(maxAge: number = 3600) {
    return (req: Request, res: Response, next: NextFunction): void => {
      res.set('Cache-Control', `public, max-age=${maxAge}`);
      next();
    };
  }

  /**
   * Método auxiliar para desabilitar cache
   */
  public static noCache(req: Request, res: Response, next: NextFunction): void {
    res.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
  }

  /**
   * Middleware para adicionar headers de resposta CORS personalizados
   */
  public static corsHeaders(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Expose-Headers', 'X-Total-Count, X-Request-ID');
    next();
  }

  /**
   * Middleware para adicionar metadados à resposta
   */
  public static addMetadata(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Interceptar o método json original
    const originalJson = res.json;

    res.json = function (obj: any) {
      // Adicionar metadados se for uma resposta de sucesso da API
      if (obj && typeof obj === 'object' && obj.success !== undefined) {
        obj.metadata = {
          timestamp: new Date().toISOString(),
          requestId: req.id || req.get('x-request-id'),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
        };
      }

      return originalJson.call(this, obj);
    };

    next();
  }
}

// Exportar middleware principal como padrão
export const responseHandler = ResponseHandlerMiddleware.handler;

// Exportar métodos auxiliares
export const cacheMiddleware = ResponseHandlerMiddleware.cache;
export const noCacheMiddleware = ResponseHandlerMiddleware.noCache;
export const corsHeadersMiddleware = ResponseHandlerMiddleware.corsHeaders;
export const metadataMiddleware = ResponseHandlerMiddleware.addMetadata;
