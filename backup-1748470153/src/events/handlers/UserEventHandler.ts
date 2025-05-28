import { eventEmitter, EVENT_TYPES } from '../index';
import { LoggerService } from '../../services/LoggerService';
import { NotificationService } from '../../services/NotificationService';
import { AnalyticsService } from '../../services/AnalyticsService';

export class UserEventHandler {
  private static logger = LoggerService.getInstance();
  private static notificationService = NotificationService.getInstance();
  private static analyticsService = AnalyticsService.getInstance();

  public static initialize(): void {
    eventEmitter.on(EVENT_TYPES.USER.CREATED, this.handleUserCreated);
    eventEmitter.on(EVENT_TYPES.USER.LOGIN, this.handleUserLogin);
    eventEmitter.on(EVENT_TYPES.USER.LOGOUT, this.handleUserLogout);
  }

  private static async handleUserCreated(user: any): Promise<void> {
    try {
      // Notificar admin
      await this.notificationService.sendNotification({
        type: 'info',
        title: 'Novo Usuário',
        message: `Usuário ${user.name} foi criado`,
        recipients: ['admin'],
        channels: ['socket'],
        priority: 'normal',
      });

      // Registrar analytics - CORRIGIDO
      await this.analyticsService.trackEvent({
        eventType: 'page_view', // Usando um tipo válido da interface
        sessionId: user.sessionId || 'system',
        userAgent: 'system',
        ip: '127.0.0.1',
      });
    } catch (error) {
      this.logger.error('Erro ao processar evento user:created:', error);
    }
  }

  private static async handleUserLogin(data: any): Promise<void> {
    try {
      // Registrar analytics - CORRIGIDO
      await this.analyticsService.trackEvent({
        eventType: 'page_view', // Usando um tipo válido da interface
        sessionId: data.sessionId || 'unknown',
        userAgent: data.userAgent,
        ip: data.ip,
      });
    } catch (error) {
      this.logger.error('Erro ao processar evento user:login:', error);
    }
  }

  private static handleUserLogout(data: any): void {
    this.logger.info('User logout event processed', {
      userId: data.userId,
      sessionId: data.sessionId,
    });
  }
}
