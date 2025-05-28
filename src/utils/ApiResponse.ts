// ===== src/utils/ApiResponse.ts =====
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ApiResponse {
  /**
   * Resposta de sucesso
   */
  public static success<T>(data: T, message?: string): any {
    return {
      success: true,
      message: message || 'Operation completed successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Resposta de erro
   */
  public static error(
    message: string,
    statusCode: number = 500,
    errors?: any
  ): any {
    return {
      success: false,
      message,
      statusCode,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Resposta paginada
   */
  public static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    message?: string
  ): any {
    return {
      success: true,
      message: message || 'Data retrieved successfully',
      data,
      pagination,
      timestamp: new Date().toISOString(),
    };
  }
}
