// src/services/SearchService.ts - Serviço de Busca
import { Project } from '../models/Project';
import { Certificate } from '../models/Certificate';
import { LoggerService } from './LoggerService';
import { CacheService } from './CacheService';

interface SearchOptions {
  query: string;
  type?: 'all' | 'projects' | 'certificates';
  limit?: number;
  offset?: number;
  filters?: {
    category?: string;
    featured?: boolean;
    status?: string;
    level?: string;
  };
}

interface SearchResult {
  projects: any[];
  certificates: any[];
  total: number;
  took: number; // tempo de busca em ms
}

export class SearchService {
  private static instance: SearchService;
  private logger: LoggerService;
  private cacheService: CacheService;

  private constructor() {
    this.logger = LoggerService.getInstance();
    this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Busca global em projetos e certificados
   */
  public async search(options: SearchOptions): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug('Iniciando busca', { 
        query: options.query, 
        type: options.type 
      });

      // Verificar cache primeiro
      const cacheKey = this.generateCacheKey(options);
      const cachedResult = await this.cacheService.get<SearchResult>(cacheKey);
      
      if (cachedResult) {
        this.logger.debug('Resultado encontrado em cache', { cacheKey });
        return {
          ...cachedResult,
          took: Date.now() - startTime
        };
      }

      const result: SearchResult = {
        projects: [],
        certificates: [],
        total: 0,
        took: 0
      };

      // Buscar em projetos
      if (options.type === 'all' || options.type === 'projects' || !options.type) {
        result.projects = await this.searchProjects(options);
      }

      // Buscar em certificados
      if (options.type === 'all' || options.type === 'certificates' || !options.type) {
        result.certificates = await this.searchCertificates(options);
      }

      result.total = result.projects.length + result.certificates.length;
      result.took = Date.now() - startTime;

      // Cache do resultado por 5 minutos
      await this.cacheService.set(cacheKey, result, 300);

      this.logger.debug('Busca concluída', {
        query: options.query,
        projectsFound: result.projects.length,
        certificatesFound: result.certificates.length,
        totalFound: result.total,
        took: result.took
      });

      return result;
    } catch (error) {
      this.logger.error('Erro na busca:', error);
      return {
        projects: [],
        certificates: [],
        total: 0,
        took: Date.now() - startTime
      };
    }
  }

  /**
   * Busca específica em projetos
   */
  private async searchProjects(options: SearchOptions): Promise<any[]> {
    try {
      const query: any = {
        isActive: true,
        visibility: 'public'
      };

      // Busca por texto
      if (options.query && options.query.trim()) {
        query.$text = { $search: options.query };
      }

      // Aplicar filtros
      if (options.filters) {
        if (options.filters.category) {
          query.category = options.filters.category;
        }
        if (options.filters.featured !== undefined) {
          query.featured = options.filters.featured;
        }
        if (options.filters.status) {
          query.status = options.filters.status;
        }
      }

      const projects = await Project.find(query)
        .select('title slug shortDescription category featured status images technologies tags views')
        .sort({ featured: -1, views: -1, createdAt: -1 })
        .limit(options.limit || 20)
        .skip(options.offset || 0)
        .lean();

      return projects.map(project => ({
        ...project,
        type: 'project'
      }));
    } catch (error) {
      this.logger.error('Erro na busca de projetos:', error);
      return [];
    }
  }

  /**
   * Busca específica em certificados
   */
  private async searchCertificates(options: SearchOptions): Promise<any[]> {
    try {
      const query: any = {
        isActive: true
      };

      // Busca por texto
      if (options.query && options.query.trim()) {
        query.$text = { $search: options.query };
      }

      // Aplicar filtros
      if (options.filters) {
        if (options.filters.category) {
          query.category = options.filters.category;
        }
        if (options.filters.featured !== undefined) {
          query.featured = options.filters.featured;
        }
        if (options.filters.level) {
          query.level = options.filters.level;
        }
      }

      const certificates = await Certificate.find(query)
        .select('title issuer.name category level featured image skills')
        .sort({ featured: -1, 'dates.issued': -1 })
        .limit(options.limit || 20)
        .skip(options.offset || 0)
        .lean();

      return certificates.map(certificate => ({
        ...certificate,
        type: 'certificate'
      }));
    } catch (error) {
      this.logger.error('Erro na busca de certificados:', error);
      return [];
    }
  }

  /**
   * Busca por sugestões/autocompletar
   */
  public async getSuggestions(query: string, limit: number = 10): Promise<string[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const cacheKey = `search:suggestions:${query}:${limit}`;
      const cached = await this.cacheService.get<string[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const suggestions = new Set<string>();

      // Buscar títulos de projetos
      const projects = await Project.find({
        title: { $regex: query, $options: 'i' },
        isActive: true,
        visibility: 'public'
      })
      .select('title')
      .limit(limit)
      .lean();

      projects.forEach(project => suggestions.add(project.title));

      // Buscar títulos de certificados
      const certificates = await Certificate.find({
        title: { $regex: query, $options: 'i' },
        isActive: true
      })
      .select('title')
      .limit(limit)
      .lean();

      certificates.forEach(cert => suggestions.add(cert.title));

      // Buscar tags de projetos
      const projectsWithTags = await Project.find({
        tags: { $regex: query, $options: 'i' },
        isActive: true,
        visibility: 'public'
      })
      .select('tags')
      .limit(5)
      .lean();

      projectsWithTags.forEach(project => {
        project.tags?.forEach(tag => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(tag);
          }
        });
      });

      const result = Array.from(suggestions).slice(0, limit);

      // Cache por 1 hora
      await this.cacheService.set(cacheKey, result, 3600);

      return result;
    } catch (error) {
      this.logger.error('Erro ao obter sugestões:', error);
      return [];
    }
  }

  /**
   * Busca popular/trending
   */
  public async getPopularSearches(limit: number = 10): Promise<string[]> {
    try {
      const cacheKey = `search:popular:${limit}`;
      const cached = await this.cacheService.get<string[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Em um cenário real, você manteria um log de buscas
      // Por enquanto, vamos retornar termos populares baseados em views
      const popularProjects = await Project.find({
        isActive: true,
        visibility: 'public'
      })
      .select('title tags')
      .sort({ views: -1 })
      .limit(limit)
      .lean();

      const popularTerms = new Set<string>();

      popularProjects.forEach(project => {
        // Adicionar título
        popularTerms.add(project.title);
        
        // Adicionar tags
        project.tags?.forEach(tag => popularTerms.add(tag));
      });

      const result = Array.from(popularTerms).slice(0, limit);

      // Cache por 24 horas
      await this.cacheService.set(cacheKey, result, 86400);

      return result;
    } catch (error) {
      this.logger.error('Erro ao obter buscas populares:', error);
      return [];
    }
  }

  /**
   * Busca facetada (categorias, filtros)
   */
  public async getFacets(): Promise<{
    categories: { name: string; count: number }[];
    statuses: { name: string; count: number }[];
    levels: { name: string; count: number }[];
  }> {
    try {
      const cacheKey = 'search:facets';
      const cached = await this.cacheService.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const [projectCategories, projectStatuses, certificateLevels] = await Promise.all([
        // Categorias de projetos
        Project.aggregate([
          { $match: { isActive: true, visibility: 'public' } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Status de projetos
        Project.aggregate([
          { $match: { isActive: true, visibility: 'public' } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Níveis de certificados
        Certificate.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$level', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);

      const facets = {
        categories: projectCategories.map(c => ({ 
          name: c._id, 
          count: c.count 
        })),
        statuses: projectStatuses.map(s => ({ 
          name: s._id, 
          count: s.count 
        })),
        levels: certificateLevels.map(l => ({ 
          name: l._id, 
          count: l.count 
        }))
      };

      // Cache por 1 hora
      await this.cacheService.set(cacheKey, facets, 3600);

      return facets;
    } catch (error) {
      this.logger.error('Erro ao obter facetas:', error);
      return {
        categories: [],
        statuses: [],
        levels: []
      };
    }
  }

  /**
   * Gerar chave de cache única para a busca
   */
  private generateCacheKey(options: SearchOptions): string {
    const keyParts = [
      'search',
      options.query || 'empty',
      options.type || 'all',
      options.limit || 20,
      options.offset || 0
    ];

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined) {
          keyParts.push(`${key}:${value}`);
        }
      });
    }

    return keyParts.join(':');
  }

  /**
   * Limpar cache de busca
   */
  public async clearSearchCache(): Promise<void> {
    try {
      await this.cacheService.deletePattern('search:*');
      this.logger.info('Cache de busca limpo');
    } catch (error) {
      this.logger.error('Erro ao limpar cache de busca:', error);
    }
  }
}