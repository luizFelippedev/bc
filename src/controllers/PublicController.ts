// ===== src/controllers/PublicController.ts =====
import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { Certificate } from '../models/Certificate';
import { Configuration } from '../models/Configuration';
import { ApiResponse } from '../utils/ApiResponse';
import { LoggerService } from '../services/LoggerService';
import { CacheService } from '../services/CacheService';
import { AnalyticsService } from '../services/AnalyticsService';

export class PublicController {
  private logger = LoggerService.getInstance();
  private cacheService = CacheService.getInstance();
  private analyticsService = AnalyticsService.getInstance();

  /**
   * Obter projetos públicos
   * GET /api/public/projects
   */
  public async getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 12, 
        category, 
        featured,
        search
      } = req.query;
      
      const cacheKey = `public:projects:${page}:${limit}:${category || 'all'}:${featured || 'all'}:${search || ''}`;
      let result = await this.cacheService.get(cacheKey);
      
      if (!result) {
        // Construir filtros
        const filters: any = { isActive: true, visibility: 'public' };
        
        if (category) filters.category = category;
        if (featured) filters.featured = featured === 'true';
        if (search) {
          filters.$text = { $search: search as string };
        }
        
        // Executar consulta
        const projects = await Project.find(filters)
          .select('title slug shortDescription images technologies category featured status date views tags')
          .sort({ featured: -1, createdAt: -1 })
          .skip((Number(page) - 1) * Number(limit))
          .limit(Number(limit))
          .lean();
        
        const total = await Project.countDocuments(filters);
        
        result = {
          projects,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
            hasNext: Number(page) < Math.ceil(total / Number(limit)),
            hasPrev: Number(page) > 1
          }
        };
        
        // Cache por 5 minutos
        await this.cacheService.set(cacheKey, result, 300);
      }
      
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter projeto por slug
   * GET /api/public/projects/:slug
   */
  public async getProjectBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      
      const cacheKey = `public:project:${slug}`;
      let project = await this.cacheService.get(cacheKey);
      
      if (!project) {
        project = await Project.findOne({ 
          slug, 
          isActive: true, 
          visibility: 'public' 
        }).lean();
        
        if (!project) {
  res.status(404).json(
    ApiResponse.error('Projeto não encontrado', 404)
  );
  return; // Sem return res
}
        
        // Cache por 15 minutos
        await this.cacheService.set(cacheKey, project, 900);
      }
      
      // Incrementar visualizações
      await Project.findByIdAndUpdate(project._id, { $inc: { views: 1 } });
      
      // Rastrear visualização
      await this.analyticsService.trackEvent({
        eventType: 'project_view',
        projectId: project._id.toString(),
        sessionId: req.sessionID || req.ip || 'anonymous',
        userAgent: req.get('user-agent'),
        ip: req.ip
      });
      
      res.json(ApiResponse.success({ project }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter certificados públicos
   * GET /api/public/certificates
   */
  public async getCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { featured } = req.query;
      
      const cacheKey = `public:certificates:${featured || 'all'}`;
      let certificates = await this.cacheService.get(cacheKey);
      
      if (!certificates) {
        const filters: any = { isActive: true };
        if (featured) filters.featured = featured === 'true';
        
        certificates = await Certificate.find(filters)
          .select('title issuer dates category skills level featured image')
          .sort({ featured: -1, 'dates.issued': -1 })
          .lean();
        
        // Cache por 30 minutos
        await this.cacheService.set(cacheKey, certificates, 1800);
      }
      
      res.json(ApiResponse.success(certificates));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter configuração do site
   * GET /api/public/configuration
   */
  public async getConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cacheKey = 'public:configuration';
      let config = await this.cacheService.get(cacheKey);
      
      if (!config) {
        config = await Configuration.findOne()
          .select('-__v -updatedAt')
          .lean();
        
        if (!config) {
          config = {
            profile: {
              name: 'Portfolio',
              title: 'Desenvolvedor Full Stack',
              description: 'Desenvolvedor apaixonado por tecnologia',
              contactEmail: 'contato@portfolio.com'
            },
            siteSettings: {
              title: 'Portfolio',
              description: 'Portfolio de projetos e certificados',
              language: 'pt-BR'
            }
          };
        }
        
        // Cache por 1 hora
        await this.cacheService.set(cacheKey, config, 3600);
      }
      
      res.json(ApiResponse.success(config));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rastrear evento de analytics
   * POST /api/public/analytics/track
   */
  public async trackEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventType, projectId, certificateId, page } = req.body;
      
      await this.analyticsService.trackEvent({
        eventType,
        projectId,
        certificateId,
        page,
        sessionId: req.sessionID || req.ip || 'anonymous',
        userAgent: req.get('user-agent'),
        ip: req.ip,
        referrer: req.get('referer')
      });
      
      res.json(ApiResponse.success(null, 'Evento rastreado com sucesso'));
    } catch (error) {
      next(error);
    }
  }
}

export const publicController = new PublicController();
