// ===== src/services/HealthCheckService.ts =====
import { DatabaseService } from './DatabaseService';
import { CacheService } from './CacheService';
import { LoggerService } from './LoggerService';
import os from 'os';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  version: string;
  uptime: number;
  environment: string;
  components: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
    };
    cache: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
    };
    system: {
      status: 'healthy' | 'unhealthy';
      memory: {
        total: number;
        free: number;
        used: number;
        percentUsed: number;
      };
      cpu: {
        load: number[];
        cores: number;
      };
    };
  };
}

export class HealthCheckService {
  private static instance: HealthCheckService;
  private databaseService: DatabaseService;
  private cacheService: CacheService;
  private logger: LoggerService;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.databaseService = DatabaseService.getInstance();
    this.cacheService = CacheService.getInstance();
    this.logger = LoggerService.getInstance();
  }

  public static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  public startMonitoring(intervalMs: number = 60000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      try {
        const status = await this.checkHealth();
        if (status.status !== 'healthy') {
          this.logger.warn('Sistema em estado não saudável', {
            status: status.status,
            components: Object.entries(status.components)
              .filter(([_, comp]) => comp.status !== 'healthy')
              .map(([name, _]) => name),
          });
        }
      } catch (error) {
        this.logger.error('Erro ao verificar saúde do sistema:', error);
      }
    }, intervalMs);

    this.logger.info(`Monitoramento de saúde iniciado (intervalo: ${intervalMs}ms)`);
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      this.logger.info('Monitoramento de saúde parado');
    }
  }

  public async checkHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    const [dbStatus, cacheStatus, systemStatus] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkCacheHealth(),
      this.checkSystemHealth()
    ]);

    const components = {
      database: dbStatus,
      cache: cacheStatus,
      system: systemStatus
    };

    const unhealthyComponents = Object.values(components).filter(c => c.status === 'unhealthy');
    
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (unhealthyComponents.length > 0) {
      status = unhealthyComponents.length === Object.keys(components).length ? 'unhealthy' : 'degraded';
    }

    const result: HealthStatus = {
      status,
      timestamp: new Date(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      components
    };

    this.logger.debug(`Health check completed in ${Date.now() - startTime}ms`, { status });
    return result;
  }

  private async checkDatabaseHealth(): Promise<HealthStatus['components']['database']> {
    const startTime = Date.now();
    try {
      const isHealthy = await this.databaseService.isHealthy();
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime
      };
    }
  }

  private async checkCacheHealth(): Promise<HealthStatus['components']['cache']> {
    const startTime = Date.now();
    try {
      const isHealthy = await this.cacheService.isHealthy();
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime
      };
    }
  }

  private async checkSystemHealth(): Promise<HealthStatus['components']['system']> {
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const percentUsed = (usedMem / totalMem) * 100;
      
      const cpuLoad = os.loadavg();
      const cpuCores = os.cpus().length;
      
      const isMemHealthy = percentUsed < 90;
      const isCpuHealthy = cpuLoad[0] / cpuCores < 2;
      
      return {
        status: isMemHealthy && isCpuHealthy ? 'healthy' : 'unhealthy',
        memory: {
          total: totalMem,
          free: freeMem,
          used: usedMem,
          percentUsed
        },
        cpu: {
          load: cpuLoad,
          cores: cpuCores
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        memory: { total: 0, free: 0, used: 0, percentUsed: 0 },
        cpu: { load: [0, 0, 0], cores: 0 }
      };
    }
  }

  public async getStatusSummary(): Promise<{ 
    status: 'healthy' | 'unhealthy' | 'degraded';
    uptime: number; 
    environment: string; 
  }> {
    const status = await this.checkHealth();
    return {
      status: status.status,
      uptime: status.uptime,
      environment: status.environment
    };
  }

  public async getStatus(): Promise<HealthStatus> {
    return this.checkHealth();
  }
}
