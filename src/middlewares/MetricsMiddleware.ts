// ===== src/middlewares/MetricsMiddleware.ts =====
import { Request, Response, NextFunction } from 'express';
import { MonitoringService } from '../services/MonitoringService';
import { LoggerService } from '../services/LoggerService';
import { CacheService } from '../services/CacheService';

export interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  contentLength: number;
  userAgent?: string;
  ip: string;
  timestamp: Date;
  route?: string;
}

export class MetricsMiddleware {
  private static monitoringService = MonitoringService.getInstance();
  private static logger = LoggerService.getInstance();
  private static cacheService = CacheService.getInstance();
  
  // Contadores em memória para métricas rápidas
  private static requestCounts = new Map<string, number>();
  private static statusCounts = new Map<number, number>();
  private static routeCounts = new Map<string, number>();
  private static responseTimes: number[] = [];
  private static maxResponseTimes = 1000; // Manter últimos 1000 tempos

  /**
   * Middleware principal para coleta de métricas
   */
  public static collectMetrics(req: Request, res: Response, next: NextFunction): void {
    const startTime = process.hrtime.bigint();
    const startTimestamp = Date.now();

    // Incrementar contador de requisições no monitoring service
    MetricsMiddleware.monitoringService.incrementRequestCounter();

    // Capturar informações da requisição
    const requestInfo = {
      method: req.method,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('user-agent'),
      route: req.route?.path,
    };

    // Interceptar o end da resposta
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any, callback?: any) {
      // Calcular tempo de resposta
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000; // Converter para ms

      // Criar métricas da requisição
      const metrics: RequestMetrics = {
        ...requestInfo,
        statusCode: res.statusCode,
        responseTime,
        contentLength: parseInt(res.get('content-length') || '0'),
        timestamp: new Date(startTimestamp),
      };

      // Processar métricas
      MetricsMiddleware.processRequestMetrics(metrics);

      // Chamar método original
      originalEnd.call(this, chunk, encoding, callback);
    };

    next();
  }

  /**
   * Processar métricas da requisição
   */
  private static processRequestMetrics(metrics: RequestMetrics): void {
    try {
      // Incrementar contadores
      this.incrementCounter(this.requestCounts, metrics.method);
      this.incrementCounter(this.statusCounts, metrics.statusCode);
      
      if (metrics.route) {
        this.incrementCounter(this.routeCounts, metrics.route);
      }

      // Armazenar tempo de resposta
      this.responseTimes.push(metrics.responseTime);
      if (this.responseTimes.length > this.maxResponseTimes) {
        this.responseTimes.shift();
      }

      // Incrementar contador de erros se status >= 400
      if (metrics.statusCode >= 400) {
        this.monitoringService.incrementErrorCounter();
      }

      // Log de requisições lentas
      if (metrics.responseTime > 5000) { // 5 segundos
        this.logger.warn('Requisição lenta detectada', {
          path: metrics.path,
          method: metrics.method,
          responseTime: metrics.responseTime,
          statusCode: metrics.statusCode,
        });
      }

      // Armazenar métricas detalhadas periodicamente
      this.storeDetailedMetrics(metrics);
    } catch (error) {
      this.logger.error('Erro ao processar métricas da requisição:', error);
    }
  }

  /**
   * Incrementar contador genérico
   */
  private static incrementCounter<T>(map: Map<T, number>, key: T): void {
    map.set(key, (map.get(key) || 0) + 1);
  }

  /**
   * Armazenar métricas detalhadas
   */
  private static async storeDetailedMetrics(metrics: RequestMetrics): Promise<void> {
    try {
      // Armazenar no cache com TTL de 1 hora
      const metricsKey = `metrics:requests:${Date.now()}`;
      await this.cacheService.set(metricsKey, metrics, 3600);

      // Manter lista das chaves de métricas para limpeza
      const metricsListKey = 'metrics:requests:list';
      const metricsList = await this.cacheService.get<string[]>(metricsListKey) || [];
      metricsList.push(metricsKey);

      // Manter apenas as últimas 10000 métricas
      if (metricsList.length > 10000) {
        const oldKey = metricsList.shift();
        if (oldKey) {
          await this.cacheService.delete(oldKey);
        }
      }

      await this.cacheService.set(metricsListKey, metricsList, 86400);
    } catch (error) {
      this.logger.debug('Erro ao armazenar métricas detalhadas:', error);
    }
  }

  /**
   * Middleware para endpoints de métricas específicas
   */
  public static trackEndpoint(endpointName: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        // Log específico do endpoint
        MetricsMiddleware.logger.debug(`Endpoint ${endpointName} executado`, {
          duration,
          statusCode: res.statusCode,
          method: req.method,
        });

        // Armazenar métricas específicas do endpoint
        MetricsMiddleware.storeEndpointMetrics(endpointName, {
          duration,
          statusCode: res.statusCode,
          timestamp: new Date(),
        });
      });

      next();
    };
  }

  /**
   * Armazenar métricas específicas do endpoint
   */
  private static async storeEndpointMetrics(endpoint: string, data: any): Promise<void> {
    try {
      const key = `metrics:endpoint:${endpoint}`;
      const existing = await this.cacheService.get<any[]>(key) || [];
      
      existing.push(data);
      
      // Manter apenas os últimos 100 registros por endpoint
      if (existing.length > 100) {
        existing.splice(0, existing.length - 100);
      }
      
      await this.cacheService.set(key, existing, 3600);
    } catch (error) {
      this.logger.debug(`Erro ao armazenar métricas do endpoint ${endpoint}:`, error);
    }
  }

  /**
   * Obter estatísticas em tempo real
   */
  public static getRealtimeStats(): any {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    // Filtrar tempos de resposta dos últimos 5 minutos
    const recentResponseTimes = this.responseTimes.slice(-300); // Aproximadamente 5 min de dados

    return {
      requests: {
        total: Array.from(this.requestCounts.values()).reduce((sum, count) => sum + count, 0),
        byMethod: Object.fromEntries(this.requestCounts),
        perMinute: this.calculateRequestsPerMinute(),
      },
      responses: {
        byStatus: Object.fromEntries(this.statusCounts),
        times: {
          avg: recentResponseTimes.length > 0 
            ? recentResponseTimes.reduce((sum, time) => sum + time, 0) / recentResponseTimes.length 
            : 0,
          min: recentResponseTimes.length > 0 ? Math.min(...recentResponseTimes) : 0,
          max: recentResponseTimes.length > 0 ? Math.max(...recentResponseTimes) : 0,
          p95: this.calculatePercentile(recentResponseTimes, 95),
          p99: this.calculatePercentile(recentResponseTimes, 99),
        },
      },
      routes: {
        byRoute: Object.fromEntries(this.routeCounts),
        mostActive: this.getMostActiveRoutes(5),
      },
      errors: {
        rate: this.calculateErrorRate(),
        total: Array.from(this.statusCounts.entries())
          .filter(([status]) => status >= 400)
          .reduce((sum, [, count]) => sum + count, 0),
      },
    };
  }

  /**
   * Calcular requisições por minuto
   */
  private static calculateRequestsPerMinute(): number {
    // Implementação simplificada - em produção seria mais sofisticada
    const totalRequests = Array.from(this.requestCounts.values()).reduce((sum, count) => sum + count, 0);
    const uptimeMinutes = process.uptime() / 60;
    return uptimeMinutes > 0 ? totalRequests / uptimeMinutes : 0;
  }

  /**
   * Calcular percentil
   */
  private static calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Obter rotas mais ativas
   */
  private static getMostActiveRoutes(limit: number): Array<{ route: string; count: number }> {
    return Array.from(this.routeCounts.entries())
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Calcular taxa de erro
   */
  private static calculateErrorRate(): number {
    const totalRequests = Array.from(this.requestCounts.values()).reduce((sum, count) => sum + count, 0);
    const totalErrors = Array.from(this.statusCounts.entries())
      .filter(([status]) => status >= 400)
      .reduce((sum, [, count]) => sum + count, 0);
    
    return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
  }

  /**
   * Middleware para monitoramento de usuários ativos
   */
  public static trackActiveUsers(req: Request, res: Response, next: NextFunction): void {
    const sessionId = req.sessionID || req.ip || 'anonymous';
    const userId = (req as any).user?.id;
    
    // Armazenar informação do usuário ativo
    MetricsMiddleware.updateActiveUsers(sessionId, userId);
    
    next();
  }

  /**
   * Atualizar usuários ativos
   */
  private static async updateActiveUsers(sessionId: string, userId?: string): Promise<void> {
    try {
      const activeUsersKey = 'metrics:active_users';
      const userInfo = {
        sessionId,
        userId,
        lastSeen: new Date(),
        ip: 'hidden', // Por privacidade
      };

      // Usar um hash set para usuários únicos
      await this.cacheService.set(`${activeUsersKey}:${sessionId}`, userInfo, 1800); // 30 minutos

      // Incrementar contador de conexões
      const activeCount = await this.getActiveUserCount();
      this.monitoringService.setConnectionCount(activeCount);
    } catch (error) {
      this.logger.debug('Erro ao atualizar usuários ativos:', error);
    }
  }

  /**
   * Obter contagem de usuários ativos
   */
  public static async getActiveUserCount(): Promise<number> {
    try {
      // Esta seria uma implementação mais sofisticada em produção
      // Por simplicidade, retornamos um número baseado nos últimos acessos
      return 1; // Placeholder
    } catch (error) {
      this.logger.debug('Erro ao obter contagem de usuários ativos:', error);
      return 0;
    }
  }

  /**
   * Limpar contadores (para reset periódico)
   */
  public static resetCounters(): void {
    this.requestCounts.clear();
    this.statusCounts.clear();
    this.routeCounts.clear();
    this.responseTimes.length = 0;
    
    this.logger.debug('Contadores de métricas resetados');
  }

  /**
   * Middleware para rastreamento de APIs específicas
   */
  public static trackApiUsage(apiName: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const startTime = Date.now();
      
      try {
        // Incrementar contador de uso da API
        await MetricsMiddleware.incrementApiUsage(apiName);
        
        res.on('finish', async () => {
          const duration = Date.now() - startTime;
          
          // Registrar métricas da API
          await MetricsMiddleware.recordApiMetrics(apiName, {
            duration,
            statusCode: res.statusCode,
            method: req.method,
            path: req.path,
            timestamp: new Date(),
          });
        });
        
        next();
      } catch (error) {
        MetricsMiddleware.logger.error(`Erro no tracking da API ${apiName}:`, error);
        next();
      }
    };
  }

  /**
   * Incrementar uso da API
   */
  private static async incrementApiUsage(apiName: string): Promise<void> {
    try {
      const key = `metrics:api_usage:${apiName}`;
      const current = await this.cacheService.get<number>(key) || 0;
      await this.cacheService.set(key, current + 1, 86400); // 24 horas
    } catch (error) {
      this.logger.debug(`Erro ao incrementar uso da API ${apiName}:`, error);
    }
  }

  /**
   * Registrar métricas da API
   */
  private static async recordApiMetrics(apiName: string, metrics: any): Promise<void> {
    try {
      const key = `metrics:api_details:${apiName}`;
      const existing = await this.cacheService.get<any[]>(key) || [];
      
      existing.push(metrics);
      
      // Manter apenas os últimos 500 registros
      if (existing.length > 500) {
        existing.splice(0, existing.length - 500);
      }
      
      await this.cacheService.set(key, existing, 86400);
    } catch (error) {
      this.logger.debug(`Erro ao registrar métricas da API ${apiName}:`, error);
    }
  }

  /**
   * Obter métricas de uma API específica
   */
  public static async getApiMetrics(apiName: string): Promise<any> {
    try {
      const [usage, details] = await Promise.all([
        this.cacheService.get<number>(`metrics:api_usage:${apiName}`),
        this.cacheService.get<any[]>(`metrics:api_details:${apiName}`),
      ]);

      return {
        usage: usage || 0,
        details: details || [],
        averageResponseTime: details && details.length > 0
          ? details.reduce((sum, d) => sum + d.duration, 0) / details.length
          : 0,
      };
    } catch (error) {
      this.logger.error(`Erro ao obter métricas da API ${apiName}:`, error);
      return { usage: 0, details: [], averageResponseTime: 0 };
    }
  }
}