import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/responses';

export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  res.sendSuccess = function<T>(data: T): Response {
    const response: ApiResponse<T> = {
      success: true,
      data
    };
    return res.json(response);
  };

  res.sendError = function(error: string): Response {
    const response: ApiResponse = {
      success: false,
      error
    };
    return res.status(400).json(response);
  };

  next();
};
