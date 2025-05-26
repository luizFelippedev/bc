import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { Certificate } from '../models/Certificate';
import { Analytics } from '../models/Analytics';
import { ApiResponse } from '../utils/ApiResponse';
import { LoggerService } from '../services/LoggerService';
import { AnalyticsService } from '../services/AnalyticsService';
import { CacheService } from '../services/CacheService';
import mongoose from 'mongoose';

export class AdminController {
  private logger = LoggerService.getInstance();
  private analyticsService = AnalyticsService.getInstance();
  private cacheService = CacheService.getInstance();

  /**
   * Obter dados do dashboard admin
   * GET /api/admin/dashboard
   */
  public async getDashboardData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cacheKey = 'admin:dashboard:overview';
      let dashboardData = await this.cacheService.get(cacheKey);

      if (!dashboardData) {
        const now = new Date();
        const today = new Date(now.setHours(0, 0, 0, 0));
        const lastWeek = new Date(now.setDate(now.getDate() - 7));
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));

        const [
          projectsCount,
          certificatesCount,
          totalVisits,
          visitsToday,
          visitsLastWeek,
          visitsLastMonth,
          topProjects,
          deviceStats,
          geoStats
        ] = await Promise.all([
          Project.countDocuments({ isActive: true }),
          Certificate.countDocuments({ isActive: true }),
          Analytics.countDocuments(),
          Analytics.countDocuments({ createdAt: { $gte: today } }),
          Analytics.countDocuments({ createdAt: { $gte: lastWeek } }),
          Analytics.countDocuments({ createdAt: { $gte: lastMonth } }),
          this.getTopProjects(),
          this.getDeviceStats(),
          this.getGeographicStats()
        ]);

        dashboardData = {
          overview: {
            projects: projectsCount,
            certificates: certificatesCount,
            totalVisits,
            visitsToday,
            visitsLastWeek,
            visitsLastMonth,
            lastUpdated: new Date()
          },
          topProjects,
          deviceStats,
          geoStats
        };

        // Cache por 5 minutos
        await this.cacheService.set(cacheKey, dashboardData, 300);
      }

      res.json(ApiResponse.success(dashboardData));
    } catch (error) {
      this.logger.error('Erro ao obter dados do dashboard:', error);
      next(error);
    }
  }

  /**
   * Obter estatísticas detalhadas
   * GET /api/admin/analytics
   */
  public async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, type = 'all' } = req.query;
      
      const filters: any = {};
      
      if (startDate) {
        filters.createdAt = { $gte: new Date(startDate as string) };
      }
      
      if (endDate) {
        if (!filters.createdAt) filters.createdAt = {};
        filters.createdAt.$lte = new Date(endDate as string);
      }
      
      if (type && type !== 'all') {
        filters.eventType = type;
      }
      
      const analyticsData = await this.analyticsService.getDetailedStats(filters);
      
      res.json(ApiResponse.success(analyticsData));
    } catch (error) {
      this.logger.error('Erro ao obter analytics:', error);
      next(error);
    }
  }

  /**
   * Estatísticas em tempo real
   * GET /api/admin/realtime
   */
  public async getRealTimeStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const realTimeData = await this.analyticsService.getRealTimeStats();
      
      res.json(ApiResponse.success(realTimeData));
    } catch (error) {
      this.logger.error('Erro ao obter estatísticas em tempo real:', error);
      next(error);
    }
  }

  /**
   * Métodos auxiliares
   */
  private async getTopProjects(): Promise<any[]> {
    const topProjects = await Analytics.aggregate([
      { $match: { eventType: 'project_view', projectId: { $exists: true } } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $project: {
          _id: 0,
          id: '$project._id',
          title: '$project.title',
          slug: '$project.slug',
          views: '$count'
        }
      }
    ]);
    
    return topProjects;
  }

  private async getDeviceStats(): Promise<any> {
    const devices = await Analytics.aggregate([
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const browsers = await Analytics.aggregate([
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const os = await Analytics.aggregate([
      { $group: { _id: '$os', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    return {
      devices: devices.map(d => ({ device: d._id || 'unknown', count: d.count })),
      browsers: browsers.map(b => ({ browser: b._id || 'unknown', count: b.count })),
      os: os.map(o => ({ os: o._id || 'unknown', count: o.count }))
    };
  }

  private async getGeographicStats(): Promise<any> {
    const countries = await Analytics.aggregate([
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    return {
      countries: countries.map(c => ({ country: c._id || 'unknown', count: c.count }))
    };
  }
}

export const adminController = new AdminController();