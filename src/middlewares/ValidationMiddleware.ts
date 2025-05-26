// src/middlewares/ValidationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { LoggerService } from '../services/LoggerService';
import { ApiError } from '../utils/ApiError';

export class ValidationMiddleware {
  private static logger = LoggerService.getInstance();

  /**
   * Middleware de validação de requisição usando Joi
   * @param schema Esquema Joi para validação
   * @param source Parte da requisição a ser validada ('body', 'query', 'params')
   */
  public static validate(schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') {
    return (req: Request, res: Response, next: NextFunction) => {
      const data = req[source];
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const details = error.details.map(detail => ({
          message: detail.message,
          path: detail.path.join('.')
        }));

        ValidationMiddleware.logger.warn('Validação falhou', {
          source,
          path: req.path,
          method: req.method,
          errors: details
        });

        return next(ApiError.badRequest('Erro de validação', details));
      }

      // Substitui os dados com os valores validados e transformados
      req[source] = value;
      next();
    };
  }

  // Esquemas de validação pré-definidos
  public static schemas = {
    // Auth
    login: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Email inválido',
        'any.required': 'Email é obrigatório'
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'Senha deve ter no mínimo 6 caracteres',
        'any.required': 'Senha é obrigatória'
      })
    }),

    // Projetos
    createProject: Joi.object({
      title: Joi.string().min(3).max(100).required(),
      shortDescription: Joi.string().max(200).required(),
      fullDescription: Joi.string().max(5000).required(),
      category: Joi.string().valid(
        'web_app', 'mobile_app', 'desktop_app', 'ai_ml', 
        'blockchain', 'iot', 'game', 'api'
      ).required(),
      technologies: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          category: Joi.string().required(),
          level: Joi.string().valid('primary', 'secondary', 'learning')
        })
      ).min(1).required(),
      featured: Joi.boolean().default(false),
      status: Joi.string().valid(
        'concept', 'development', 'testing', 
        'deployed', 'maintenance', 'archived'
      ).default('concept'),
      visibility: Joi.string().valid('public', 'private', 'client_only').default('public'),
      timeline: Joi.object({
        startDate: Joi.date().required(),
        endDate: Joi.date().min(Joi.ref('startDate')).allow(null)
      }).required()
    }),

    updateProject: Joi.object({
      title: Joi.string().min(3).max(100),
      shortDescription: Joi.string().max(200),
      fullDescription: Joi.string().max(5000),
      category: Joi.string().valid(
        'web_app', 'mobile_app', 'desktop_app', 'ai_ml', 
        'blockchain', 'iot', 'game', 'api'
      ),
      technologies: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          category: Joi.string().required(),
          level: Joi.string().valid('primary', 'secondary', 'learning')
        })
      ).min(1),
      featured: Joi.boolean(),
      status: Joi.string().valid(
        'concept', 'development', 'testing', 
        'deployed', 'maintenance', 'archived'
      ),
      visibility: Joi.string().valid('public', 'private', 'client_only'),
      timeline: Joi.object({
        startDate: Joi.date(),
        endDate: Joi.date().min(Joi.ref('startDate')).allow(null)
      })
    }),

    // Certificados
    createCertificate: Joi.object({
      title: Joi.string().required(),
      issuer: Joi.object({
        name: Joi.string().required(),
        logo: Joi.string(),
        website: Joi.string().uri(),
        accreditation: Joi.string()
      }).required(),
      dates: Joi.object({
        issued: Joi.date().required(),
        expires: Joi.date().min(Joi.ref('issued')),
        renewed: Joi.date().min(Joi.ref('issued'))
      }).required(),
      level: Joi.string().valid(
        'foundational', 'associate', 'professional', 'expert', 'master'
      ).required(),
      type: Joi.string().valid(
        'technical', 'business', 'language', 'academic', 'professional'
      ).required(),
      skills: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          category: Joi.string().required(),
          proficiencyLevel: Joi.string().valid(
            'beginner', 'intermediate', 'advanced', 'expert'
          ).required()
        })
      ),
      featured: Joi.boolean().default(false)
    }),

    // Contato
    contact: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      subject: Joi.string().min(3).max(200).required(),
      message: Joi.string().min(10).max(2000).required()
    })
  };
}