export class ApiResponse {
  /**
   * Resposta de sucesso
   */
  public static success<T>(data: T, message?: string): any {
    return {
      success: true,
      message: message || 'Operação realizada com sucesso',
      data,
      timestamp: new Date()
    };
  }

  /**
   * Resposta de erro
   */
  public static error(message: string, statusCode: number = 500, errors?: any): any {
    return {
      success: false,
      message,
      statusCode,
      errors,
      timestamp: new Date()
    };
  }

  /**
   * Resposta paginada
   */
  public static paginated<T>(data: T[], pagination: any, message?: string): any {
    return {
      success: true,
      message: message || 'Dados recuperados com sucesso',
      data,
      pagination,
      timestamp: new Date()
    };
  }
}