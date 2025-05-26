import { eventEmitter, EVENT_TYPES } from '../index';
import { LoggerService } from '../../services/LoggerService';
import { NotificationService } from '../../services/NotificationService';

export class SystemEventHandler {
  private static logger = LoggerService.getInstance();
  private static notificationService = NotificationService.getInstance();

  public static initialize(): void {
    eventEmitter.on(EVENT_TYPES.SYSTEM.ERROR, this.handleSystemError);
    eventEmitter.on(EVENT_TYPES.SYSTEM.WARNING, this.handleSystemWarning);
    eventEmitter.on(EVENT_TYPES.SYSTEM.BACKUP_STARTED, this.handleBackupStarted);
    eventEmitter.on(EVENT_TYPES.SYSTEM.BACKUP_COMPLETED, this.handleBackupCompleted);
  }

  private static async handleSystemError(error: any): Promise<void> {
    this.logger.error('Sistema error:', error);
    
    await this.notificationService.sendNotification({
      type: 'error',
      title: 'Erro do Sistema',
      message: error.message,
      recipients: ['admin'],
      channels: ['socket', 'email'],
      priority: 'high'
    });
  }

  private static async handleSystemWarning(warning: any): Promise<void> {
    this.logger.warn('Sistema warning:', warning);
    
    await this.notificationService.sendNotification({
      type: 'warning',
      title: 'Alerta do Sistema',
      message: warning.message,
      recipients: ['admin'],
      channels: ['socket'],
      priority: 'normal'
    });
  }

  private static handleBackupStarted(): void {
    this.logger.info('Backup iniciado');
  }

  private static handleBackupCompleted(result: any): void {
    this.logger.info('Backup completado:', result);
  }
}
