import { Analytics } from '../models/Analytics';
import { Project } from '../models/Project';
import { LoggerService } from './LoggerService';
import { CacheService } from './CacheService';

interface TrackEventOptions {
  eventType: 'page_view' | 'project_view' | 'certificate_view' | 'contact';
  projectId?: string;
  certificateId?: string;
  page?: string;
  sessionId: string;
  userAgent?: string;
  ip?: string;
  referrer?: string;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private logger = LoggerService.getInstance();
  private cacheService = CacheService.getInstance();

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Rastrear evento de visualização
   */
  public async trackEvent(options: TrackEventOptions): Promise<void> {
    try {
      // Extrair informações do user agent
      const deviceInfo = this.parseUserAgent(options.userAgent || '');
      
      // Salvar evento no banco de dados
      const event = new Analytics({
        eventType: options.eventType,
        projectId: options.projectId,
        certificateId: options.certificateId,
        page: options.page,
        sessionId: options.sessionId,
        ip: options.ip,
        userAgent: options.userAgent,
        referrer: options.referrer,
        ...deviceInfo
      });
      
      await event.save();
      
      // Atualizar contadores
      if (options.eventType === 'project_view' && options.projectId) {
        await Project.findByIdAndUpdate(
          options.projectId,
          { $inc: { views: 1 } }
        );
      }
      
      // Invalidar cache de estatísticas
      await this.cacheService.delete('admin:dashboard:overview');
      await this.cacheService.delete('admin:realtime:stats');
    } catch (error) {
      this.logger.error('Erro ao rastrear evento:', error);
    }
  }

  /**
   * Obter estatísticas detalhadas
   */
  public async getDetailedStats(filters: any = {}): Promise<any> {
    try {
      // Buscar eventos filtrados
      const events = await Analytics.find(filters)
        .sort({ createdAt: -1 })
        .limit(1000);
      
      // Calcular estatísticas
      const stats = this.calculateStats(events);
      
      return stats;
    } catch (error) {
      this.logger.error('Erro ao obter estatísticas detalhadas:', error);
      return {};
    }
  }

  /**
   * Obter estatísticas em tempo real
   */
  public async getRealTimeStats(): Promise<any> {
    try {
      const cacheKey = 'admin:realtime:stats';
      let stats = await this.cacheService.get(cacheKey);
      
      if (!stats) {
        const now = new Date();
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
        
        // Eventos dos últimos 15 minutos
        const recentEvents = await Analytics.find({
          createdAt: { $gte: fifteenMinutesAgo }
        }).sort({ createdAt: -1 });
        
        // Sessões ativas
        const activeSessions = new Set();
        recentEvents.forEach(event => activeSessions.add(event.sessionId));
        
        // Projetos visualizados recentemente
        const recentProjectViews = await Analytics.find({
          eventType: 'project_view',
          projectId: { $exists: true },
          createdAt: { $gte: fifteenMinutesAgo }
        }).populate('projectId', 'title slug');
        
        stats = {
          activeVisitors: activeSessions.size,
          pageViews: recentEvents.filter(e => e.eventType === 'page_view').length,
          projectViews: recentEvents.filter(e => e.eventType === 'project_view').length,
          recentProjects: recentProjectViews
            .map(e => ({ title: e.projectId?.title, slug: e.projectId?.slug, timestamp: e.createdAt }))
            .slice(0, 5),
          lastUpdated: new Date()
        };
        
        // Cache por 15 segundos
        await this.cacheService.set(cacheKey, stats, 15);
      }
      
      return stats;
    } catch (error) {
      this.logger.error('Erro ao obter estatísticas em tempo real:', error);
      return {
        activeVisitors: 0,
        pageViews: 0,
        projectViews: 0,
        recentProjects: [],
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Métodos auxiliares
   */
  private parseUserAgent(userAgent: string): any {
    // Implementação simplificada - em produção use uma biblioteca como ua-parser-js
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) browser = 'Internet Explorer';
    
    let os = 'unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
    
    return {
      device: isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop'),
      browser,
      os
    };
  }

  private calculateStats(events: any[]): any {
    // Aqui você implementaria cálculos estatísticos detalhados
    // Por simplicidade, vamos retornar contagens básicas
    
    return {
      total: events.length,
      byType: {
        pageView: events.filter(e => e.eventType === 'page_view').length,
        projectView: events.filter(e => e.eventType === 'project_view').length,
        certificateView: events.filter(e => e.eventType === 'certificate_view').length,
        contact: events.filter(e => e.eventType === 'contact').length
      },
      byDevice: {
        desktop: events.filter(e => e.device === 'desktop').length,
        mobile: events.filter(e => e.device === 'mobile').length,
        tablet: events.filter(e => e.device === 'tablet').length
      }
    };
  }
}