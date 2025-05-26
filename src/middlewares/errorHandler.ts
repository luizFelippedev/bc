// src/middlewares/errorHandler.ts (aprimorado)
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/LoggerService';
import { ApiError } from '../utils/ApiError';
import { ValidationError } from 'joi';
import { MongoError } from 'mongodb';
import mongoose from 'mongoose';

export class ErrorHandlerMiddleware {
  private static logger = LoggerService.getInstance();

  /**
   * Middleware para lidar com rotas não encontradas
   */
  public static notFound(req: Request, res: Response, next: NextFunction) {
    next(ApiError.notFound('Rota'));
  }

  /**
   * Middleware para tratar todos os erros
   */
  public static handleError(err: Error, req: Request, res: Response, next: NextFunction) {
    // Já é um ApiError? Se não, converter para um
    let error = err instanceof ApiError ? err : this.convertToApiError(err);
    
    // Adicionar caminho da requisição ao erro
    error.path = error.path || req.path;
    
    // Registrar erro
    this.logError(error, req);
    
    // Responder ao cliente
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: error.timestamp,
        path: error.path
      }
    });
  }

  /**
   * Converte erros comuns para ApiError
   */
  private static convertToApiError(error: any): ApiError {
    // Erro de validação do Joi
    if (error instanceof ValidationError) {
      return ApiError.validation('Erro de validação', {
        details: error.details.map(detail => ({
          message: detail.message,
          path: detail.path.join('.')
        }))
      });
    }

    // Erro de validação do Mongoose
    if (error.name === 'ValidationError' && error.errors) {
      const details = Object.keys(error.errors).map(field => ({
        path: field,
        message: error.errors[field].message
      }));
      
      return ApiError.validation('Erro de validação do modelo', details);
    }

    // Erro de duplicação do MongoDB
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      const mongoError = error as MongoError;
      
      if (mongoError.code === 11000) {
        // Erro de chave duplicada
        return ApiError.conflict('Recurso já existe', {
          duplicateKey: this.getDuplicateKeyFromError(mongoError)
        });
      }
      
      return ApiError.database(mongoError.message, { code: mongoError.code });
    }

    // Erro de casting do Mongoose
    if (error.name === 'CastError') {
      return ApiError.badRequest(`Formato de dados inválido: ${error.message}`);
    }

    // Erro genérico
    return ApiError.internal(
      process.env.NODE_ENV === 'production' ? 
        'Erro interno do servidor' : 
        error.message || 'Erro interno do servidor',
      false
    );
  }

  /**
   * Extrai a chave duplicada de um erro do MongoDB
   */
  private static getDuplicateKeyFromError(error: MongoError): string {
    try {
      const keyValue = (error as any).keyValue;
      if (keyValue) {
        return Object.keys(keyValue)[0];
      }
      
      // Tentar extrair do erro
      const errorMessage = error.message;
      const matches = errorMessage.match(/index:\s+(\w+)_/);
      return matches ? matches[1] : 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }

  /**
   * Registra o erro com informações adequadas
   */
  private static logError(error: ApiError, req: Request): void {
    // Erros operacionais são esperados e não precisam de stack trace
    if (error.isOperational) {
      this.logger.warn('Erro operacional', {
        error: {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          path: error.path || req.path
        },
        request: {
          method: req.method,
          path: req.path,
          query: req.query,
          params: req.params,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          userId: req.user?.id
        }
      });
    } else {
      // Erros não operacionais são bugs e precisam de mais informações
      this.logger.error('Erro não operacional', {
        error: {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          stack: error.stack,
          path: error.path || req.path
        },
        request: {
          method: req.method,
          path: req.path,
          query: req.query,
          params: req.params,
          body: this.sanitizeBody(req.body),
          ip: req.ip,
          userAgent: req.get('user-agent'),
          userId: req.user?.id
        }
      });
    }
  }

  /**
   * Sanitiza dados sensíveis do body antes de registrar
   */
  private static sanitizeBody(body: any): any {
    if (!body) return {};
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'senha', 'secret', 'token', 'credit_card', 'cartao'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });
    
    return sanitized;
  }

  /**
   * Configura handlers para exceções não capturadas
   */
  public static setupUncaughtHandlers(): void {
    process.on('uncaughtException', (error: Error) => {
      this.logger.error('Exceção não capturada', {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      });
      
      // Iniciar shutdown graceful
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });

    process.on('unhandledRejection', (reason: any) => {
      this.logger.error('Promise rejeitada não tratada', {
        error: {
          message: reason.message || String(reason),
          stack: reason.stack,
          name: reason.name
        }
      });
    });
  }
}