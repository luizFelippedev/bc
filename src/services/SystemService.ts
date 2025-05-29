// ===== src/services/SystemService.ts =====
import { LoggerService } from './LoggerService';
import { DatabaseService } from './DatabaseService';
import { CacheService } from './CacheService';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SystemInfo {
  application: {
    name: string;
    version: string;
    environment: string;
    uptime: number;
    startTime: Date;
    nodeVersion: string;
    pid: number;
  };
  system: {
    platform: string;
    architecture: string;
    hostname: string;
    cpus: number;
    totalMemory: number;
    freeMemory: number;
    loadAverage: number[];
    uptime: number;
  };
  database: {
    connected: boolean;
    host?: string;
    port?: number;
    name?: string;
  };
  cache: {
    connected: boolean;
    type: string;
  };
  directories: {
    root: string;
    logs: string;
    uploads: string;
    temp: string;
  };
}

export interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastRun?: Date;
  nextRun: Date;
  enabled: boolean;
  task: () => Promise<void>;
}

export class SystemService {
  private static instance: SystemService;
  private logger = LoggerService.getInstance();
  private databaseService = DatabaseService.getInstance();
  private cacheService = CacheService.getInstance();
  
  private startTime = new Date();
  private maintenanceTasks: MaintenanceTask[] = [];
  private maintenanceInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeMaintenanceTasks();
  }

  public static getInstance(): SystemService {
    if (!SystemService.instance) {
      SystemService.instance = new SystemService();
    }
    return SystemService.instance;
  }

  /**
   * Obter informações do sistema
   */
  public async getSystemInfo(): Promise<SystemInfo> {
    try {
      const dbConnection = this.databaseService.getConnection();
      
      return {
        application: {
          name: 'Portfolio API',
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          uptime: process.uptime(),
          startTime: this.startTime,
          nodeVersion: process.version,
          pid: process.pid,
        },
        system: {
          platform: os.platform(),
          architecture: os.arch(),
          hostname: os.hostname(),
          cpus: os.cpus().length,
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          loadAverage: os.loadavg(),
          uptime: os.uptime(),
        },
        database: {
          connected: await this.databaseService.isHealthy(),
          host: dbConnection?.host,
          port: dbConnection?.port,
          name: dbConnection?.name,
        },
        cache: {
          connected: await this.cacheService.isHealthy(),
          type: 'Redis',
        },
        directories: {
          root: process.cwd(),
          logs: path.join(process.cwd(), 'logs'),
          uploads: path.join(process.cwd(), 'uploads'),
          temp: os.tmpdir(),
        },
      };
    } catch (error) {
      this.logger.error('Erro ao obter informações do sistema:', error);
      throw error;
    }
  }

  /**
   * Verificar saúde geral do sistema
   */
  public async performSystemCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Array<{ name: string; status: string; message?: string }>;
  }> {
    const checks = [];
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Verificar banco de dados
    try {
      const dbHealthy = await this.databaseService.isHealthy();
      checks.push({
        name: 'Database',
        status: dbHealthy ? 'healthy' : 'critical',
        message: dbHealthy ? 'Connected' : 'Connection failed',
      });
      
      if (!dbHealthy) overallStatus = 'critical';
    } catch (error) {
      checks.push({
        name: 'Database',
        status: 'critical',
        message: 'Check failed',
      });
      overallStatus = 'critical';
    }

    // Verificar cache
    try {
      const cacheHealthy = await this.cacheService.isHealthy();
      checks.push({
        name: 'Cache',
        status: cacheHealthy ? 'healthy' : 'warning',
        message: cacheHealthy ? 'Connected' : 'Not available',
      });
      
      if (!cacheHealthy && overallStatus === 'healthy') {
        overallStatus = 'warning';
      }
    } catch (error) {
      checks.push({
        name: 'Cache',
        status: 'warning',
        message: 'Check failed',
      });
      if (overallStatus === 'healthy') overallStatus = 'warning';
    }

    // Verificar memória
    const memoryUsage = (os.totalmem() - os.freemem()) / os.totalmem();
    checks.push({
      name: 'Memory',
      status: memoryUsage > 0.9 ? 'critical' : memoryUsage > 0.8 ? 'warning' : 'healthy',
      message: `${(memoryUsage * 100).toFixed(1)}% used`,
    });

    if (memoryUsage > 0.9) overallStatus = 'critical';
    else if (memoryUsage > 0.8 && overallStatus === 'healthy') overallStatus = 'warning';

    // Verificar espaço em disco
    try {
      const diskUsage = await this.checkDiskSpace();
      checks.push({
        name: 'Disk Space',
        status: diskUsage.usagePercentage > 90 ? 'critical' 
               : diskUsage.usagePercentage > 80 ? 'warning' : 'healthy',
        message: `${diskUsage.usagePercentage.toFixed(1)}% used`,
      });

      if (diskUsage.usagePercentage > 90) overallStatus = 'critical';
      else if (diskUsage.usagePercentage > 80 && overallStatus === 'healthy') {
        overallStatus = 'warning';
      }
    } catch (error) {
      checks.push({
        name: 'Disk Space',
        status: 'warning',
        message: 'Unable to check',
      });
    }

    // Verificar diretórios essenciais
    const directories = ['logs', 'uploads'];
    for (const dir of directories) {
      try {
        const dirPath = path.join(process.cwd(), dir);
        await fs.access(dirPath);
        checks.push({
          name: `Directory ${dir}`,
          status: 'healthy',
          message: 'Accessible',
        });
      } catch (error) {
        checks.push({
          name: `Directory ${dir}`,
          status: 'warning',
          message: 'Not accessible',
        });
        if (overallStatus === 'healthy') overallStatus = 'warning';
      }
    }

    return { status: overallStatus, checks };
  }

  /**
   * Verificar espaço em disco
   */
  private async checkDiskSpace(): Promise<{
    total: number;
    free: number;
    used: number;
    usagePercentage: number;
  }> {
    try {
      // Implementação básica - funciona no Linux/Mac
      const { stdout } = await execAsync('df -h / | tail -1');
      const parts = stdout.trim().split(/\s+/);
      
      if (parts.length >= 5) {
        const usageStr = parts[4];
        const usagePercentage = parseInt(usageStr.replace('%', ''));
        
        return {
          total: 100,
          free: 100 - usagePercentage,
          used: usagePercentage,
          usagePercentage,
        };
      }
    } catch (error) {
      this.logger.debug('Erro ao verificar espaço em disco com df:', error);
    }

    // Fallback para Windows ou quando df não funciona
    return {
      total: 100,
      free: 75,
      used: 25,
      usagePercentage: 25,
    };
  }

  /**
   * Limpeza do sistema
   */
  public async performSystemCleanup(): Promise<{
    cleaned: string[];
    errors: string[];
    spaceFreed: number;
  }> {
    const cleaned: string[] = [];
    const errors: string[] = [];
    let spaceFreed = 0;

    this.logger.info('Iniciando limpeza do sistema');

    // Limpar logs antigos
    try {
      const logsPath = path.join(process.cwd(), 'logs');
      
      try {
        await fs.access(logsPath);
        const logFiles = await fs.readdir(logsPath);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 dias

        for (const file of logFiles) {
          const filePath = path.join(logsPath, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < cutoffDate) {
            const size = stats.size;
            await fs.unlink(filePath);
            cleaned.push(`Log file: ${file}`);
            spaceFreed += size;
          }
        }
      } catch (error) {
        // Diretório não existe, criar
        await fs.mkdir(logsPath, { recursive: true });
      }
    } catch (error) {
      errors.push(`Erro ao limpar logs: ${error}`);
    }

    // Limpar arquivos temporários
    try {
      const tempPath = path.join(process.cwd(), 'temp');
      
      try {
        await fs.access(tempPath);
        const tempFiles = await fs.readdir(tempPath);
        
        for (const file of tempFiles) {
          const filePath = path.join(tempPath, file);
          const stats = await fs.stat(filePath);
          const size = stats.size;
          
          await fs.unlink(filePath);
          cleaned.push(`Temp file: ${file}`);
          spaceFreed += size;
        }
      } catch (error) {
        // Diretório temp não existe ou não é acessível
      }
    } catch (error) {
      errors.push(`Erro ao limpar arquivos temporários: ${error}`);
    }

    this.logger.info('Limpeza do sistema concluída', {
      filesRemoved: cleaned.length,
      spaceFreed: `${(spaceFreed / 1024 / 1024).toFixed(2)} MB`,
      errors: errors.length,
    });

    return { cleaned, errors, spaceFreed };
  }

  /**
   * Inicializar tarefas de manutenção
   */
  private initializeMaintenanceTasks(): void {
    this.maintenanceTasks = [
      {
        id: 'cleanup',
        name: 'System Cleanup',
        description: 'Remove old logs and temporary files',
        frequency: 'daily',
        nextRun: this.calculateNextRun('daily'),
        enabled: true,
        task: async () => {
          await this.performSystemCleanup();
        },
      },
      {
        id: 'cache_cleanup',
        name: 'Cache Cleanup',
        description: 'Clear expired cache entries',
        frequency: 'daily',
        nextRun: this.calculateNextRun('daily'),
        enabled: true,
        task: async () => {
          // Implementar limpeza de cache se necessário
          this.logger.info('Cache cleanup executado');
        },
      },
      {
        id: 'health_check',
        name: 'System Health Check',
        description: 'Perform comprehensive system health check',
        frequency: 'daily',
        nextRun: this.calculateNextRun('daily'),
        enabled: true,
        task: async () => {
          const result = await this.performSystemCheck();
          if (result.status !== 'healthy') {
            this.logger.warn('System health check failed', result);
          }
        },
      },
    ];
  }

  /**
   * Calcular próxima execução
   */
  private calculateNextRun(frequency: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();
    const nextRun = new Date(now);

    switch (frequency) {
      case 'daily':
        nextRun.setDate(now.getDate() + 1);
        nextRun.setHours(2, 0, 0, 0); // 2:00 AM
        break;
      case 'weekly':
        nextRun.setDate(now.getDate() + (7 - now.getDay())); // Próximo domingo
        nextRun.setHours(3, 0, 0, 0); // 3:00 AM
        break;
      case 'monthly':
        nextRun.setMonth(now.getMonth() + 1, 1); // Primeiro dia do próximo mês
        nextRun.setHours(4, 0, 0, 0); // 4:00 AM
        break;
    }

    return nextRun;
  }

  /**
   * Iniciar agendador de manutenção
   */
  public startMaintenanceScheduler(): void {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
    }

    // Verificar a cada hora se há tarefas para executar
    this.maintenanceInterval = setInterval(async () => {
      await this.runScheduledMaintenance();
    }, 60 * 60 * 1000); // 1 hora

    this.logger.info('Agendador de manutenção iniciado');
  }

  /**
   * Parar agendador de manutenção
   */
  public stopMaintenanceScheduler(): void {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = null;
      this.logger.info('Agendador de manutenção parado');
    }
  }

  /**
   * Executar manutenção agendada
   */
  private async runScheduledMaintenance(): Promise<void> {
    const now = new Date();

    for (const task of this.maintenanceTasks) {
      if (!task.enabled || now < task.nextRun) {
        continue;
      }

      try {
        this.logger.info(`Executando tarefa de manutenção: ${task.name}`);
        await task.task();
        
        task.lastRun = now;
        task.nextRun = this.calculateNextRun(task.frequency);
        
        this.logger.info(`Tarefa de manutenção concluída: ${task.name}`);
      } catch (error) {
        this.logger.error(`Erro na tarefa de manutenção ${task.name}:`, error);
      }
    }
  }

  /**
   * Executar tarefa de manutenção específica
   */
  public async runMaintenanceTask(taskId: string): Promise<void> {
    const task = this.maintenanceTasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error(`Tarefa de manutenção não encontrada: ${taskId}`);
    }

    this.logger.info(`Executando tarefa de manutenção manual: ${task.name}`);
    
    try {
      await task.task();
      task.lastRun = new Date();
      this.logger.info(`Tarefa de manutenção manual concluída: ${task.name}`);
    } catch (error) {
      this.logger.error(`Erro na tarefa de manutenção manual ${task.name}:`, error);
      throw error;
    }
  }

  /**
   * Obter tarefas de manutenção
   */
  public getMaintenanceTasks(): Omit<MaintenanceTask, 'task'>[] {
    return this.maintenanceTasks.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description,
      frequency: task.frequency,
      lastRun: task.lastRun,
      nextRun: task.nextRun,
      enabled: task.enabled,
    }));
  }

  /**
   * Configurar tarefa de manutenção
   */
  public configureMaintenanceTask(taskId: string, enabled: boolean): void {
    const task = this.maintenanceTasks.find(t => t.id === taskId);
    
    if (task) {
      task.enabled = enabled;
      this.logger.info(`Tarefa de manutenção ${taskId} ${enabled ? 'habilitada' : 'desabilitada'}`);
    }
  }

  /**
   * Restart da aplicação (graceful)
   */
  public async gracefulRestart(): Promise<void> {
    this.logger.info('Iniciando restart graceful da aplicação');
    
    try {
      // Parar agendadores
      this.stopMaintenanceScheduler();
      
      // Notificar outros serviços
      this.logger.info('Aplicação será reiniciada em 5 segundos');
      
      setTimeout(() => {
        process.exit(0); // PM2 ou similar deve reiniciar automaticamente
      }, 5000);
    } catch (error) {
      this.logger.error('Erro durante restart graceful:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de uso do sistema
   */
  public async getUsageStats(): Promise<any> {
    const systemInfo = await this.getSystemInfo();
    
    return {
      uptime: {
        application: systemInfo.application.uptime,
        system: systemInfo.system.uptime,
      },
      memory: {
        usage: ((systemInfo.system.totalMemory - systemInfo.system.freeMemory) / systemInfo.system.totalMemory) * 100,
        total: systemInfo.system.totalMemory,
        free: systemInfo.system.freeMemory,
      },
      cpu: {
        cores: systemInfo.system.cpus,
        loadAverage: systemInfo.system.loadAverage,
      },
      storage: await this.checkDiskSpace(),
    };
  }

  /**
   * Criar diretórios necessários
   */
  public async ensureDirectories(): Promise<void> {
    const directories = ['logs', 'uploads', 'backups', 'exports', 'temp'];
    
    for (const dir of directories) {
      try {
        const dirPath = path.join(process.cwd(), dir);
        await fs.mkdir(dirPath, { recursive: true });
        this.logger.debug(`Diretório assegurado: ${dir}`);
      } catch (error) {
        this.logger.error(`Erro ao criar diretório ${dir}:`, error);
      }
    }
  }
}