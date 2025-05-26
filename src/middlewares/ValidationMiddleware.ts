// src/middleware/ValidationMiddleware.ts - Sistema de Validação Avançado
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { LoggerService } from '../services/LoggerService';

const logger = LoggerService.getInstance();

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    logger.warn('Validation failed:', {
      path: req.path,
      errors: errors.array()
    });

    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: errors.array()
    });
  };
};