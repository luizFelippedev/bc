import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/LoggerService';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Não autorizado') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Acesso negado') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Recurso') {
    super(404, `${resource} não encontrado`);
    this.name = 'NotFoundError';
  }
}

const logger = LoggerService.getInstance();

export const errorHandler = {
  notFound: (req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError('Rota'));
  },

  handleError: (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Error handling request:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        details: err.details,
        code: err.name,
        path: req.path
      });
    }

    // Erros de validação do MongoDB
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        details: err.message,
        code: 'ValidationError',
        path: req.path
      });
    }

    // Erros de casting do MongoDB
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Formato de dados inválido',
        details: err.message,
        code: 'CastError',
        path: req.path
      });
    }

    // Erro interno do servidor
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Erro interno do servidor' 
        : err.message,
      code: 'InternalServerError',
      path: req.path
    });
  },

  handleUncaughtErrors: () => {
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection:', reason);
      process.exit(1);
    });
  }
};
