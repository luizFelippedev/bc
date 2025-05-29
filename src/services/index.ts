// ===== src/services/index.ts =====
// Exportar todos os serviços principais

// Serviços principais
export { LoggerService } from './LoggerService';
export { DatabaseService } from './DatabaseService';
export { CacheService } from './CacheService';
export { HealthCheckService } from './HealthCheckService';

// Serviços de configuração e sistema
export { ConfigurationService } from './ConfigurationService';
export { SystemService } from './SystemService';
export { MonitoringService } from './MonitoringService';

// Serviços de análise e dados
export { AnalyticsService } from './AnalyticsService';
export { SearchService } from './SearchService';
export { ExportService } from './ExportService';

// Serviços de comunicação
export { EmailService } from './EmailService';
export { NotificationService } from './NotificationService';
export { SocketService } from './SocketService';

// Serviços de arquivos e uploads
export { FileUploadService } from './FileUploadService';
export { BackupService } from './BackupService';

// Serviços de auditoria e segurança
export { AuditService } from './AuditService';

// Serviços de migração e manutenção
export { MigrationService } from './MigrationService';

// Serviços de teste e desenvolvimento
export { TestingService } from './TestingService';

// Serviços de performance
export { PerformanceMonitoringService } from './PerformanceMonitoringService';

// Serviços de paginação
export { PaginationService } from './PaginationService';

// Tipos e interfaces
export type { SystemMetrics, AlertRule } from './MonitoringService';
export type { SiteConfiguration } from './ConfigurationService';
export type { RequestMetrics } from '../middlewares/MetricsMiddleware';

/**
 * Factory para inicializar todos os serviços
 */
export class ServiceFactory {
  private static initialized = false;
  private static services: Map<string, any> = new Map();

  /**
   * Inicializar todos os serviços essenciais
   */
  public static async initializeServices(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const logger = LoggerService.getInstance();
    logger.info('🔧 Inicializando serviços...');

    try {
      // Serviços básicos
      const database = DatabaseService.getInstance();
      const cache = CacheService.getInstance();
      const config = ConfigurationService.getInstance();
      const system = SystemService.getInstance();
      const monitoring = MonitoringService.getInstance();
      const health = HealthCheckService.getInstance();

      // Conectar serviços dependentes
      await database.connect();
      await cache.connect();

      // Inicializar monitoramento
      monitoring.startMonitoring(30000); // 30 segundos
      system.startMaintenanceScheduler();

      // Armazenar referências
      this.services.set('database', database);
      this.services.set('cache', cache);
      this.services.set('config', config);
      this.services.set('system', system);
      this.services.set('monitoring', monitoring);
      this.services.set('health', health);

      this.initialized = true;
      logger.info('✅ Todos os serviços inicializados com sucesso');
    } catch (error) {
      logger.error('❌ Erro ao inicializar serviços:', error);
      throw error;
    }
  }

  /**
   * Obter instância de um serviço
   */
  public static getService<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Serviço não encontrado: ${serviceName}`);
    }
    return service as T;
  }

  /**
   * Verificar se os serviços foram inicializados
   */
  public static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Shutdown graceful de todos os serviços
   */
  public static async shutdownServices(): Promise<void> {
    const logger = LoggerService.getInstance();
    logger.info('🛑 Encerrando serviços...');

    try {
      // Parar monitoramento
      const monitoring = this.services.get('monitoring');
      if (monitoring) {
        monitoring.stopMonitoring();
      }

      const system = this.services.get('system');
      if (system) {
        system.stopMaintenanceScheduler();
      }

      const health = this.services.get('health');
      if (health) {
        health.stopMonitoring();
      }

      // Desconectar serviços
      const database = this.services.get('database');
      if (database) {
        await database.disconnect();
      }

      const cache = this.services.get('cache');
      if (cache) {
        await cache.disconnect();
      }

      this.services.clear();
      this.initialized = false;
      logger.info('✅ Todos os serviços encerrados com sucesso');
    } catch (error) {
      logger.error('❌ Erro ao encerrar serviços:', error);
      throw error;
    }
  }
}

/**
 * Helper para obter serviços facilmente
 */
export class Services {
  static get logger() {
    return LoggerService.getInstance();
  }

  static get database() {
    return DatabaseService.getInstance();
  }

  static get cache() {
    return CacheService.getInstance();
  }

  static get config() {
    return ConfigurationService.getInstance();
  }

  static get system() {
    return SystemService.getInstance();
  }

  static get monitoring() {
    return MonitoringService.getInstance();
  }

  static get health() {
    return HealthCheckService.getInstance();
  }

  static get analytics() {
    return AnalyticsService.getInstance();
  }

  static get search() {
    return SearchService.getInstance();
  }

  static get export() {
    return ExportService.getInstance();
  }

  static get email() {
    return EmailService.getInstance();
  }

  static get notification() {
    return NotificationService.getInstance();
  }

  static get fileUpload() {
    return FileUploadService.getInstance();
  }

  static get backup() {
    return BackupService.getInstance();
  }

  static get audit() {
    return AuditService.getInstance();
  }

  static get migration() {
    return MigrationService.getInstance();
  }

  static get testing() {
    return TestingService.getInstance();
  }

  static get performance() {
    return PerformanceMonitoringService.getInstance();
  }
}