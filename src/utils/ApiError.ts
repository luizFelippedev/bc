// src/utils/ApiError.ts (aprimorado)
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly path?: string;

  constructor({
    statusCode = 500,
    message = 'Erro interno do servidor',
    code,
    details,
    isOperational = true,
    path
  }: {
    statusCode?: number;
    message?: string;
    code?: string;
    details?: any;
    isOperational?: boolean;
    path?: string;
  }) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || this.getCodeFromStatus(statusCode);
    this.details = details;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.path = path;

    Error.captureStackTrace(this, this.constructor);
  }

  private getCodeFromStatus(statusCode: number): string {
    const codes = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE'
    };
    
    return codes[statusCode] || 'UNKNOWN_ERROR';
  }

  // Métodos de factory para erros comuns
  public static badRequest(message: string, details?: any) {
    return new ApiError({
      statusCode: 400,
      message,
      details
    });
  }

  public static unauthorized(message: string = 'Acesso não autorizado') {
    return new ApiError({
      statusCode: 401,
      message
    });
  }

  public static forbidden(message: string = 'Acesso negado') {
    return new ApiError({
      statusCode: 403,
      message
    });
  }

  public static notFound(resource: string = 'Recurso') {
    return new ApiError({
      statusCode: 404,
      message: `${resource} não encontrado`
    });
  }

  public static conflict(message: string, details?: any) {
    return new ApiError({
      statusCode: 409,
      message,
      details
    });
  }

  public static validation(message: string, details?: any) {
    return new ApiError({
      statusCode: 422,
      message,
      details
    });
  }

  public static tooManyRequests(message: string = 'Muitas requisições') {
    return new ApiError({
      statusCode: 429,
      message
    });
  }

  public static internal(message: string = 'Erro interno do servidor', isOperational: boolean = true) {
    return new ApiError({
      statusCode: 500,
      message,
      isOperational
    });
  }

  public static serviceUnavailable(message: string = 'Serviço indisponível') {
    return new ApiError({
      statusCode: 503,
      message
    });
  }

  public static database(message: string, details?: any) {
    return new ApiError({
      statusCode: 500,
      message: `Erro de banco de dados: ${message}`,
      code: 'DATABASE_ERROR',
      details,
      isOperational: true
    });
  }
}