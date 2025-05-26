import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/LoggerService';

const logger = LoggerService.getInstance();

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
  }

  static badRequest(msg: string, details?: any) {
    return new ApiError(400, msg, details);
  }
  static unauthorized(msg: string, details?: any) {
    return new ApiError(401, msg, details);
  }
  static forbidden(msg: string, details?: any) {
    return new ApiError(403, msg, details);
  }
  static notFound(msg: string, details?: any) {
    return new ApiError(404, msg, details);
  }
  static internal(msg: string, details?: any) {
    return new ApiError(500, msg, details);
  }
}

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
      path: req.originalUrl
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    path: req.originalUrl
  });
};
