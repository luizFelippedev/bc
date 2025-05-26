export interface ApiResponseData {
  [key: string]: any;
}

export class ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;

  constructor(init: Partial<ApiResponse<T>>) {
    this.success = init.success ?? false;
    this.data = init.data;
    this.error = init.error;
    this.message = init.message;
    this.statusCode = init.statusCode ?? 500;
  }

  static success<T>(data?: T, message?: string): ApiResponse<T> {
    return new ApiResponse<T>({
      success: true,
      data,
      message,
      statusCode: 200
    });
  }

  static error(error: string, statusCode: number = 500): ApiResponse {
    return new ApiResponse({
      success: false,
      error,
      statusCode
    });
  }
}
