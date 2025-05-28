// src/middlewares/ValidationMiddleware.ts - Middleware de validação completo
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { LoggerService } from '../services/LoggerService';
import { ApiError } from '../utils/ApiError';

export class ValidationMiddleware {
  private static logger = LoggerService.getInstance();

  /**
   * Middleware de validação de requisição usando Joi
   */
  public static validate(
    schema: Joi.ObjectSchema,
    source: 'body' | 'query' | 'params' = 'body'
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      const data = req[source];
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details = error.details.map((detail) => ({
          message: detail.message,
          path: detail.path.join('.'),
          value: detail.context?.value
        }));

        ValidationMiddleware.logger.warn('Validação falhou', {
          source,
          path: req.path,
          method: req.method,
          errors: details,
        });

        return next(ApiError.validation('Erro de validação', details));
      }

      // Substitui os dados com os valores validados
      req[source] = value;
      next();
    };
  }

  // Esquemas de validação
  public static schemas = {
    // Autenticação
    login: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Email inválido',
        'any.required': 'Email é obrigatório',
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'Senha deve ter no mínimo 6 caracteres',
        'any.required': 'Senha é obrigatória',
      }),
    }),

    // Projetos
    createProject: Joi.object({
      title: Joi.string().min(3).max(100).required().messages({
        'string.min': 'Título deve ter no mínimo 3 caracteres',
        'string.max': 'Título deve ter no máximo 100 caracteres',
        'any.required': 'Título é obrigatório'
      }),
      
      shortDescription: Joi.string().max(200).required().messages({
        'string.max': 'Descrição curta deve ter no máximo 200 caracteres',
        'any.required': 'Descrição curta é obrigatória'
      }),
      
      fullDescription: Joi.string().max(5000).optional(),
      
      category: Joi.string()
        .valid('web_app', 'mobile_app', 'desktop_app', 'ai_ml', 'blockchain', 'iot', 'game', 'api')
        .required()
        .messages({
          'any.only': 'Categoria deve ser uma das opções válidas',
          'any.required': 'Categoria é obrigatória'
        }),
      
      technologies: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            category: Joi.string().required(),
            level: Joi.string()
              .valid('primary', 'secondary', 'learning')
              .default('primary'),
          })
        )
        .min(1)
        .required()
        .messages({
          'array.min': 'Pelo menos uma tecnologia é obrigatória',
          'any.required': 'Tecnologias são obrigatórias'
        }),
      
      featured: Joi.boolean().default(false),
      
      status: Joi.string()
        .valid('in_progress', 'completed', 'archived')
        .default('completed'),
      
      visibility: Joi.string()
        .valid('public', 'private')
        .default('public'),
      
      date: Joi.object({
        start: Joi.date().required(),
        end: Joi.date().min(Joi.ref('start')).allow(null),
      }).required(),
      
      links: Joi.object({
        live: Joi.string().uri().allow(''),
        github: Joi.string().uri().allow(''),
        documentation: Joi.string().uri().allow(''),
      }).default({}),
      
      tags: Joi.array().items(Joi.string()).default([]),
    }),

    updateProject: Joi.object({
      title: Joi.string().min(3).max(100).optional(),
      shortDescription: Joi.string().max(200).optional(),
      fullDescription: Joi.string().max(5000).optional(),
      category: Joi.string()
        .valid('web_app', 'mobile_app', 'desktop_app', 'ai_ml', 'blockchain', 'iot', 'game', 'api')
        .optional(),
      technologies: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            category: Joi.string().required(),
            level: Joi.string()
              .valid('primary', 'secondary', 'learning')
              .default('primary'),
          })
        )
        .optional(),
      featured: Joi.boolean().optional(),
      status: Joi.string()
        .valid('in_progress', 'completed', 'archived')
        .optional(),
      visibility: Joi.string()
        .valid('public', 'private')
        .optional(),
      date: Joi.object({
        start: Joi.date().required(),
        end: Joi.date().min(Joi.ref('start')).allow(null),
      }).optional(),
      links: Joi.object({
        live: Joi.string().uri().allow(''),
        github: Joi.string().uri().allow(''),
        documentation: Joi.string().uri().allow(''),
      }).optional(),
      tags: Joi.array().items(Joi.string()).optional(),
    }),

    // Certificados
    createCertificate: Joi.object({
      title: Joi.string().min(3).max(100).required(),
      
      issuer: Joi.object({
        name: Joi.string().required(),
        logo: Joi.string().uri().allow(''),
        website: Joi.string().uri().allow(''),
      }).required(),
      
      date: Joi.object({
        issued: Joi.date().required(),
        expires: Joi.date().min(Joi.ref('issued')).allow(null),
      }).required(),
      
      credentialId: Joi.string().allow(''),
      credentialUrl: Joi.string().uri().allow(''),
      
      category: Joi.string().required(),
      
      skills: Joi.array().items(Joi.string()).min(1).required(),
      
      level: Joi.string()
        .valid('beginner', 'intermediate', 'advanced', 'expert')
        .default('intermediate'),
      
      featured: Joi.boolean().default(false),
      
      description: Joi.string().max(1000).allow(''),
    }),

    updateCertificate: Joi.object({
      title: Joi.string().min(3).max(100).optional(),
      issuer: Joi.object({
        name: Joi.string().required(),
        logo: Joi.string().uri().allow(''),
        website: Joi.string().uri().allow(''),
      }).optional(),
      date: Joi.object({
        issued: Joi.date().required(),
        expires: Joi.date().min(Joi.ref('issued')).allow(null),
      }).optional(),
      credentialId: Joi.string().allow('').optional(),
      credentialUrl: Joi.string().uri().allow('').optional(),
      category: Joi.string().optional(),
      skills: Joi.array().items(Joi.string()).min(1).optional(),
      level: Joi.string()
        .valid('beginner', 'intermediate', 'advanced', 'expert')
        .optional(),
      featured: Joi.boolean().optional(),
      description: Joi.string().max(1000).allow('').optional(),
    }),

    // Configuração
    updateConfiguration: Joi.object({
      profile: Joi.object({
        name: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().allow(''),
        contactEmail: Joi.string().email().required(),
        resumeUrl: Joi.string().uri().allow(''),
      }).optional(),
      
      socialLinks: Joi.array().items(
        Joi.object({
          platform: Joi.string().required(),
          url: Joi.string().uri().required(),
          icon: Joi.string().allow(''),
        })
      ).optional(),
      
      siteSettings: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        language: Joi.string().default('pt-BR'),
        primaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#3B82F6'),
        secondaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#10B981'),
        darkMode: Joi.boolean().default(true),
      }).optional(),
      
      seo: Joi.object({
        keywords: Joi.array().items(Joi.string()),
        googleAnalyticsId: Joi.string().allow(''),
        metaImage: Joi.string().uri().allow(''),
      }).optional(),
    }),

    // Contato
    contact: Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Nome deve ter no mínimo 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
        'any.required': 'Nome é obrigatório'
      }),
      
      email: Joi.string().email().required().messages({
        'string.email': 'Email inválido',
        'any.required': 'Email é obrigatório'
      }),
      
      subject: Joi.string().min(3).max(200).required().messages({
        'string.min': 'Assunto deve ter no mínimo 3 caracteres',
        'string.max': 'Assunto deve ter no máximo 200 caracteres',
        'any.required': 'Assunto é obrigatório'
      }),
      
      message: Joi.string().min(10).max(2000).required().messages({
        'string.min': 'Mensagem deve ter no mínimo 10 caracteres',
        'string.max': 'Mensagem deve ter no máximo 2000 caracteres',
        'any.required': 'Mensagem é obrigatória'
      }),
      
      phone: Joi.string().allow('').optional(),
      company: Joi.string().allow('').optional(),
    }),

    // Paginação e filtros
    pagination: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      sort: Joi.string().default('createdAt'),
      order: Joi.string().valid('asc', 'desc').default('desc'),
    }),

    projectFilters: Joi.object({
      search: Joi.string().allow(''),
      category: Joi.string().allow(''),
      status: Joi.string().valid('in_progress', 'completed', 'archived').allow(''),
      featured: Joi.boolean(),
      visibility: Joi.string().valid('public', 'private').allow(''),
    }),

    certificateFilters: Joi.object({
      search: Joi.string().allow(''),
      category: Joi.string().allow(''),
      level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').allow(''),
      featured: Joi.boolean(),
    }),

    // Analytics
    analyticsQuery: Joi.object({
      startDate: Joi.date().optional(),
      endDate: Joi.date().min(Joi.ref('startDate')).optional(),
      type: Joi.string().valid('all', 'page_view', 'project_view', 'certificate_view', 'contact').default('all'),
      limit: Joi.number().integer().min(1).max(1000).default(100),
    }),

    // ID de parâmetro
    mongoId: Joi.object({
      id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': 'ID deve ser um ObjectId válido do MongoDB'
      })
    }),

    // Slug de parâmetro
    slug: Joi.object({
      slug: Joi.string().pattern(/^[a-z0-9-]+$/).required().messages({
        'string.pattern.base': 'Slug deve conter apenas letras minúsculas, números e hífens'
      })
    }),
  };

  /**
   * Validação específica para parâmetros de ID
   */
  public static validateId = ValidationMiddleware.validate(
    ValidationMiddleware.schemas.mongoId,
    'params'
  );

  /**
   * Validação específica para parâmetros de slug
   */
  public static validateSlug = ValidationMiddleware.validate(
    ValidationMiddleware.schemas.slug,
    'params'
  );

  /**
   * Validação para query de paginação
   */
  public static validatePagination = ValidationMiddleware.validate(
    ValidationMiddleware.schemas.pagination,
    'query'
  );
}