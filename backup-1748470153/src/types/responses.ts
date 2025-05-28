export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthData {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token?: string;
}
