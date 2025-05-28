// ===== src/utils/ApiError.ts =====
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;
  public isOperational: boolean;
  public timestamp: Date;
  public path?: string;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code || `ERROR_${statusCode}`;
    this.details = details;
    this.isOperational = isOperational;
    this.timestamp = new Date();

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods para erros comuns
  public static badRequest(
    message: string = 'Bad Request',
    details?: any
  ): ApiError {
    return new ApiError(400, message, 'BAD_REQUEST', true, details);
  }

  public static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  public static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  public static notFound(resource: string = 'Resource'): ApiError {
    return new ApiError(404, `${resource} not found`, 'NOT_FOUND');
  }

  public static conflict(
    message: string = 'Conflict',
    details?: any
  ): ApiError {
    return new ApiError(409, message, 'CONFLICT', true, details);
  }

  public static validation(
    message: string = 'Validation Error',
    details?: any
  ): ApiError {
    return new ApiError(422, message, 'VALIDATION_ERROR', true, details);
  }

  public static tooManyRequests(
    message: string = 'Too Many Requests'
  ): ApiError {
    return new ApiError(429, message, 'TOO_MANY_REQUESTS');
  }

  public static internal(
    message: string = 'Internal Server Error',
    isOperational: boolean = false
  ): ApiError {
    return new ApiError(500, message, 'INTERNAL_ERROR', isOperational);
  }

  public static database(
    message: string = 'Database Error',
    details?: any
  ): ApiError {
    return new ApiError(503, message, 'DATABASE_ERROR', false, details);
  }
}
