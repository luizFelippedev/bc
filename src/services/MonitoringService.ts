// ===== src/services/MonitoringService.ts =====
import { LoggerService } from './LoggerService';
import { CacheService } from './CacheService';
import { DatabaseService } from './DatabaseService';
import os from 'os';

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercentage: number;
    heapUsed: number;
    heapTotal: number;
  };
  disk: {
    freeSpace?: number;
    totalSpace?: number;
    usagePercentage?: number;
  };
  network: {
    connections: number;
    requests: number;
    errors: number;
  };
  application: {
    uptime: number;
    version: string;
    environment: string;
    nodeVersion: string;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // Em segundos
  enabled: boolean;
  lastTriggered?: Date;
  notificationChannels: string[];
}

export class MonitoringService {
  private static instance: MonitoringService;
  private logger = LoggerService.getInstance();
  private cacheService = CacheService.getInstance();
  private databaseService = DatabaseService.getInstance();
  
  private metrics: SystemMetrics[] = [];
  private maxMetricsHistory = 1000;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertRules: AlertRule[] = [];
  private alertStates: Map<string, { triggeredAt: Date; count: number }> = new Map();

  // Contadores para métricas de aplicação
  private counters = {
    requests: 0,
    errors: 0,
    connections: 0,
  };

  private constructor() {
    this.initializeDefaultAlerts();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Inicializar alertas padrão
   */
  private initializeDefaultAlerts(): void {
    this.alertRules = [
      {
        id: 'high_cpu_usage',
        name: 'Alto uso de CPU',
        metric: 'cpu.usage',
        condition: 'gt',
        threshold: 80,
        duration: 300, // 5 minutos
        enabled: true,
        notificationChannels: ['email', 'log'],
      },
      {
        id: 'high_memory_usage',
        name: 'Alto uso de memória',
        metric: 'memory.usagePercentage',
        condition: 'gt',
        threshold: 85,
        duration: 300,
        enabled: true,
        notificationChannels: ['email', 'log'],
      },
      {
        id: 'high_error_rate',
        name: 'Alta taxa de erro',
        metric: 'network.errors',
        condition: 'gt',
        threshold: 50,
        duration: 60, // 1 minuto
        enabled: true,
        notificationChannels: ['email', 'log'],
      },
    ];
  }

  /**
   * Iniciar monitoramento
   */
  public startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.checkAlerts();
    }, intervalMs);

    this.logger.info(`Monitoramento iniciado (intervalo: ${intervalMs}ms)`);
  }

  /**
   * Parar monitoramento
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.logger.info('Monitoramento parado');
    }
  }

  /**
   * Coletar métricas do sistema
   */
  private async collectMetrics(): Promise<void> {
    try {
      const cpuUsage = process.cpuUsage();
      const memoryUsage = process.memoryUsage();
      const loadAverage = os.loadavg();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;

      const metrics: SystemMetrics = {
        timestamp: new Date(),
        cpu: {
          usage: this.calculateCpuUsage(cpuUsage),
          loadAverage,
          cores: os.cpus().length,
        },
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: usedMemory,
          usagePercentage: (usedMemory / totalMemory) * 100,
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
        },
        disk: await this.getDiskUsage(),
        network: {
          connections: this.counters.connections,
          requests: this.counters.requests,
          errors: this.counters.errors,
        },
        application: {
          uptime: process.uptime(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
        },
      };

      // Adicionar às métricas
      this.metrics.push(metrics);

      // Manter apenas o histórico especificado
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics = this.metrics.slice(-this.maxMetricsHistory);
      }

      // Cachear métricas atuais
      await this.cacheService.set('monitoring:current', metrics, 60);

      // Reset contadores por período
      this.resetCounters();
    } catch (error) {
      this.logger.error('Erro ao coletar métricas:', error);
    }
  }

  /**
   * Calcular uso de CPU
   */
  private calculateCpuUsage(cpuUsage: NodeJS.CpuUsage): number {
    // Implementação básica - em produção use bibliotecas especializadas
    const totalUsage = cpuUsage.user + cpuUsage.system;
    return Math.min(100, (totalUsage / 1000000) * 100); // Converter para porcentagem
  }

  /**
   * Obter uso do disco
   */
  private async getDiskUsage(): Promise<SystemMetrics['disk']> {
    try {
      // Em produção, use uma biblioteca como 'node-disk-info' ou 'statvfs'
      // Por simplicidade, retornamos dados mock
      return {
        freeSpace: 50000000000, // 50GB
        totalSpace: 100000000000, // 100GB
        usagePercentage: 50,
      };
    } catch (error) {
      this.logger.debug('Erro ao obter uso do disco:', error);
      return {};
    }
  }

  /**
   * Reset contadores
   */
  private resetCounters(): void {
    this.counters.requests = 0;
    this.counters.errors = 0;
    // Não resetar connections pois é um valor atual
  }

  /**
   * Verificar alertas
   */
  private async checkAlerts(): Promise<void> {
    const currentMetrics = this.metrics[this.metrics.length - 1];
    if (!currentMetrics) return;

    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      const metricValue = this.getMetricValue(currentMetrics, rule.metric);
      if (metricValue === null) continue;

      const shouldTrigger = this.evaluateCondition(metricValue, rule.condition, rule.threshold);

      if (shouldTrigger) {
        await this.handleAlert(rule, metricValue);
      } else {
        // Limpar estado de alerta se não está mais ativo
        this.alertStates.delete(rule.id);
      }
    }
  }

  /**
   * Obter valor da métrica por path
   */
  private getMetricValue(metrics: SystemMetrics, path: string): number | null {
    try {
      const parts = path.split('.');
      let value: any = metrics;
      
      for (const part of parts) {
        value = value[part];
        if (value === undefined) return null;
      }
      
      return typeof value === 'number' ? value : null;
    } catch {
      return null;
    }
  }

  /**
   * Avaliar condição do alerta
   */
  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      default: return false;
    }
  }

  /**
   * Manipular alerta
   */
  private async handleAlert(rule: AlertRule, currentValue: number): Promise<void> {
    const now = new Date();
    const alertState = this.alertStates.get(rule.id);

    if (!alertState) {
      // Primeiro trigger
      this.alertStates.set(rule.id, { triggeredAt: now, count: 1 });
      return;
    }

    // Verificar se já passou o tempo de duração
    const timeDiff = (now.getTime() - alertState.triggeredAt.getTime()) / 1000;
    
    if (timeDiff >= rule.duration) {
      // Disparar alerta
      await this.triggerAlert(rule, currentValue);
      
      // Atualizar último trigger
      rule.lastTriggered = now;
      this.alertStates.set(rule.id, { triggeredAt: now, count: alertState.count + 1 });
    } else {
      // Incrementar contador
      alertState.count += 1;
    }
  }

  /**
   * Disparar alerta
   */
  private async triggerAlert(rule: AlertRule, currentValue: number): Promise<void> {
    const alertData = {
      rule,
      currentValue,
      timestamp: new Date(),
      severity: this.calculateSeverity(rule, currentValue),
    };

    this.logger.warn(`🚨 ALERTA: ${rule.name}`, alertData);

    // Enviar notificações pelos canais configurados
    for (const channel of rule.notificationChannels) {
      try {
        await this.sendNotification(channel, alertData);
      } catch (error) {
        this.logger.error(`Erro ao enviar notificação via ${channel}:`, error);
      }
    }

    // Salvar alerta no cache para histórico
    await this.saveAlertHistory(alertData);
  }

  /**
   * Calcular severidade do alerta
   */
  private calculateSeverity(rule: AlertRule, currentValue: number): 'low' | 'medium' | 'high' | 'critical' {
    const exceedanceRatio = Math.abs(currentValue - rule.threshold) / rule.threshold;
    
    if (exceedanceRatio > 0.5) return 'critical';
    if (exceedanceRatio > 0.3) return 'high';
    if (exceedanceRatio > 0.1) return 'medium';
    return 'low';
  }

  /**
   * Enviar notificação
   */
  private async sendNotification(channel: string, alertData: any): Promise<void> {
    switch (channel) {
      case 'log':
        this.logger.error(`ALERT: ${alertData.rule.name} - Value: ${alertData.currentValue}`);
        break;
      
      case 'email':
        // Integração com EmailService seria implementada aqui
        this.logger.info(`Email alert would be sent for: ${alertData.rule.name}`);
        break;
      
      case 'webhook':
        // Envio via webhook seria implementado aqui
        this.logger.info(`Webhook alert would be sent for: ${alertData.rule.name}`);
        break;
      
      default:
        this.logger.warn(`Canal de notificação desconhecido: ${channel}`);
    }
  }

  /**
   * Salvar histórico de alerta
   */
  private async saveAlertHistory(alertData: any): Promise<void> {
    try {
      const alertsKey = 'monitoring:alerts:history';
      const alerts = await this.cacheService.get<any[]>(alertsKey) || [];
      
      alerts.push(alertData);
      
      // Manter apenas os últimos 100 alertas
      if (alerts.length > 100) {
        alerts.splice(0, alerts.length - 100);
      }
      
      await this.cacheService.set(alertsKey, alerts, 86400 * 7); // 7 dias
    } catch (error) {
      this.logger.error('Erro ao salvar histórico de alerta:', error);
    }
  }

  /**
   * Métodos públicos para incrementar contadores
   */
  public incrementRequestCounter(): void {
    this.counters.requests++;
  }

  public incrementErrorCounter(): void {
    this.counters.errors++;
  }

  public setConnectionCount(count: number): void {
    this.counters.connections = count;
  }

  /**
   * Obter métricas atuais
   */
  public getCurrentMetrics(): SystemMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  /**
   * Obter histórico de métricas
   */
  public getMetricsHistory(limit?: number): SystemMetrics[] {
    return limit ? this.metrics.slice(-limit) : this.metrics;
  }

  /**
   * Obter estatísticas agregadas
   */
  public getAggregatedStats(timeframe: 'hour' | 'day' | 'week'): any {
    const now = new Date();
    let startTime: Date;

    switch (timeframe) {
      case 'hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    const filteredMetrics = this.metrics.filter(m => m.timestamp >= startTime);
    
    if (filteredMetrics.length === 0) {
      return null;
    }

    return {
      cpu: {
        avg: this.average(filteredMetrics.map(m => m.cpu.usage)),
        max: Math.max(...filteredMetrics.map(m => m.cpu.usage)),
        min: Math.min(...filteredMetrics.map(m => m.cpu.usage)),
      },
      memory: {
        avg: this.average(filteredMetrics.map(m => m.memory.usagePercentage)),
        max: Math.max(...filteredMetrics.map(m => m.memory.usagePercentage)),
        min: Math.min(...filteredMetrics.map(m => m.memory.usagePercentage)),
      },
      requests: {
        total: filteredMetrics.reduce((sum, m) => sum + m.network.requests, 0),
        avg: this.average(filteredMetrics.map(m => m.network.requests)),
      },
      errors: {
        total: filteredMetrics.reduce((sum, m) => sum + m.network.errors, 0),
        avg: this.average(filteredMetrics.map(m => m.network.errors)),
      },
    };
  }

  /**
   * Calcular média
   */
  private average(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0;
  }

  /**
   * Obter histórico de alertas
   */
  public async getAlertHistory(): Promise<any[]> {
    try {
      return await this.cacheService.get<any[]>('monitoring:alerts:history') || [];
    } catch (error) {
      this.logger.error('Erro ao obter histórico de alertas:', error);
      return [];
    }
  }

  /**
   * Configurar regra de alerta
   */
  public setAlertRule(rule: AlertRule): void {
    const existingIndex = this.alertRules.findIndex(r => r.id === rule.id);
    
    if (existingIndex >= 0) {
      this.alertRules[existingIndex] = rule;
    } else {
      this.alertRules.push(rule);
    }
    
    this.logger.info(`Regra de alerta configurada: ${rule.name}`);
  }

  /**
   * Obter regras de alerta
   */
  public getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  /**
   * Remover regra de alerta
   */
  public removeAlertRule(ruleId: string): boolean {
    const index = this.alertRules.findIndex(r => r.id === ruleId);
    
    if (index >= 0) {
      this.alertRules.splice(index, 1);
      this.alertStates.delete(ruleId);
      this.logger.info(`Regra de alerta removida: ${ruleId}`);
      return true;
    }
    
    return false;
  }
}