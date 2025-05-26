// src/services/HealthCheckService.ts - Serviço de Health Check Avançado
import { DatabaseService } from './DatabaseService';
import { RedisService } from './RedisService';
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
      details?: any;
    };
    redis: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      details?: any;
    };
    filesystem: {
      status: 'healthy' | 'unhealthy';
      details?: any;
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
  checks: {
    [key: string]: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      message?: string;
      lastChecked: Date;
    };
  };
}

export class HealthCheckService {
  private static instance: HealthCheckService;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private logger: LoggerService;
  private lastCheck: HealthStatus | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.databaseService = DatabaseService.getInstance();
    this.redisService = RedisService.getInstance();
    this.logger = LoggerService.getInstance();
  }

  public static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  /**
   * Inicia o monitoramento periódico de saúde
   * @param intervalMs Intervalo em ms (padrão: 60000 - 1 minuto)
   */
  public startMonitoring(intervalMs: number = 60000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      try {
        const status = await this.checkHealth();
        this.lastCheck = status;

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

  /**
   * Verifica a saúde do sistema e seus componentes
   */
  public async checkHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    const checks: HealthStatus['checks'] = {};
    
    // Verificar componentes
    const [dbStatus, redisStatus, fsStatus, systemStatus] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkRedisHealth(),
      this.checkFilesystemHealth(),
      this.checkSystemHealth()
    ]);

    // Verificações adicionais
    await Promise.all([
      this.runCheck('memory-usage', checks, async () => this.checkMemoryUsage()),
      this.runCheck('event-loop-lag', checks, async () => this.checkEventLoopLag()),
      this.runCheck('open-files', checks, async () => this.checkOpenFiles())
    ]);

    // Determinar status geral
    const components = {
      database: dbStatus,
      redis: redisStatus,
      filesystem: fsStatus,
      system: systemStatus
    };

    const unhealthyComponents = Object.values(components).filter(c => c.status === 'unhealthy');
    const unhealthyChecks = Object.values(checks).filter(c => c.status === 'unhealthy');

    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (unhealthyComponents.length > 0) {
      status = 'unhealthy';
    } else if (unhealthyChecks.length > 0) {
      status = 'degraded';
    }

    const result: HealthStatus = {
      status,
      timestamp: new Date(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      components,
      checks
    };

    this.logger.debug(`Health check completed in ${Date.now() - startTime}ms`, { status });
    return result;
  }

  private async runCheck(
    name: string, 
    checksMap: HealthStatus['checks'], 
    checkFn: () => Promise<{ status: 'healthy' | 'unhealthy', message?: string }>
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const result = await checkFn();
      checksMap[name] = {
        ...result,
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    } catch (error) {
      checksMap[name] = {
        status: 'unhealthy',
        message: error.message,
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    }
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
      this.logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        details: { error: error.message }
      };
    }
  }

  private async checkRedisHealth(): Promise<HealthStatus['components']['redis']> {
    const startTime = Date.now();
    try {
      const isHealthy = await this.redisService.isHealthy();
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        details: { error: error.message }
      };
    }
  }

  private async checkFilesystemHealth(): Promise<HealthStatus['components']['filesystem']> {
    try {
      const fs = require('fs').promises;
      const testFile = '/tmp/health-check-test.txt';
      const testContent = 'health check';
      
      await fs.writeFile(testFile, testContent);
      const content = await fs.readFile(testFile, 'utf8');
      await fs.unlink(testFile);
      
      return {
        status: content === testContent ? 'healthy' : 'unhealthy'
      };
    } catch (error) {
      this.logger.error('Filesystem health check failed:', error);
      return {
        status: 'unhealthy',
        details: { error: error.message }
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
      
      // Sistema é considerado não saudável se uso de memória > 90% ou carga média > 2x núcleos
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
      this.logger.error('System health check failed:', error);
      return {
        status: 'unhealthy',
        memory: {
          total: 0,
          free: 0,
          used: 0,
          percentUsed: 0
        },
        cpu: {
          load: [0, 0, 0],
          cores: 0
        }
      };
    }
  }

  private async checkMemoryUsage(): Promise<{ status: 'healthy' | 'unhealthy', message?: string }> {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    if (heapUsedPercent > 85) {
      return {
        status: 'unhealthy',
        message: `Heap memory usage is high: ${heapUsedPercent.toFixed(2)}%`
      };
    }
    
    return { status: 'healthy' };
  }

  private async checkEventLoopLag(): Promise<{ status: 'healthy' | 'unhealthy', message?: string }> {
    return new Promise(resolve => {
      const start = Date.now();
      
      setImmediate(() => {
        const lag = Date.now() - start;
        
        if (lag > 100) {
          resolve({
            status: 'unhealthy',
            message: `Event loop lag is high: ${lag}ms`
          });
        } else {
          resolve({ status: 'healthy' });
        }
      });
    });
  }

  private async checkOpenFiles(): Promise<{ status: 'healthy' | 'unhealthy', message?: string }> {
    try {
      // Isso funciona apenas em sistemas Linux/Unix
      if (process.platform !== 'win32') {
        const { exec } = require('child_process');
        const pid = process.pid;
        
        return new Promise((resolve) => {
          exec(`lsof -p ${pid} | wc -l`, (error: any, stdout: string) => {
            if (error) {
              resolve({ 
                status: 'healthy', 
                message: 'Could not check open files' 
              });
              return;
            }
            
            const count = parseInt(stdout.trim(), 10);
            if (count > 1000) {
              resolve({
                status: 'unhealthy',
                message: `Too many open files: ${count}`
              });
            } else {
              resolve({ status: 'healthy' });
            }
          });
        });
      } else {
        return { status: 'healthy' };
      }
    } catch (error) {
      return { status: 'healthy' };
    }
  }
  
  /**
   * Retorna a última verificação de saúde ou executa uma nova se não houver
   */
  public async getStatus(): Promise<HealthStatus> {
    if (!this.lastCheck) {
      return this.checkHealth();
    }
    return this.lastCheck;
  }
  
  /**
   * Retorna um resumo do status do sistema
   */
  public async getStatusSummary(): Promise<{ 
    status: 'healthy' | 'unhealthy' | 'degraded';
    uptime: number; 
    environment: string; 
  }> {
    const status = await this.getStatus();
    return {
      status: status.status,
      uptime: status.uptime,
      environment: status.environment
    };
  }
}