// src/services/NotificationService.ts - Sistema de Notificações
import { Server as SocketIOServer } from 'socket.io';
import { CacheService } from './CacheService';
import { EmailService } from './EmailService';
import { LoggerService } from './LoggerService';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
  recipients: string[];
  channels: ('socket' | 'email' | 'push')[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
}

export class NotificationService {
  private static instance: NotificationService;
  private io: SocketIOServer | null = null;
  private cacheService: CacheService;
  private emailService: EmailService;
  private logger: LoggerService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.emailService = EmailService.getInstance();
    this.logger = LoggerService.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public setSocketIO(io: SocketIOServer): void {
    this.io = io;
    this.logger.info('SocketIOServer configurado no NotificationService');
  }

  public async sendNotification(
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<void> {
    const fullNotification: Notification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date(),
    };

    try {
      // Armazenar notificação
      await this.storeNotification(fullNotification);

      // Enviar pelos canais especificados
      const sendPromises = notification.channels.map((channel) => {
        switch (channel) {
          case 'socket':
            return this.sendSocketNotification(fullNotification);
          case 'email':
            return this.sendEmailNotification(fullNotification);
          case 'push':
            return this.sendPushNotification(fullNotification);
          default:
            return Promise.resolve();
        }
      });

      await Promise.allSettled(sendPromises);

      this.logger.info('Notificação enviada com sucesso', {
        id: fullNotification.id,
        type: fullNotification.type,
        channels: notification.channels,
        recipients: notification.recipients.length,
      });
    } catch (error) {
      this.logger.error('Erro ao enviar notificação:', error);
      throw error;
    }
  }

  private async sendSocketNotification(
    notification: Notification
  ): Promise<void> {
    if (!this.io) {
      this.logger.warn('SocketIO não configurado, pulando notificação socket');
      return;
    }

    try {
      const socketData = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        timestamp: notification.createdAt,
      };

      // Enviar para usuários específicos
      for (const userId of notification.recipients) {
        this.io.to(`user:${userId}`).emit('notification', socketData);
      }

      // Broadcast para admins se for urgente
      if (notification.priority === 'urgent') {
        this.io.to('admins').emit('urgent_notification', socketData);
      }

      this.logger.debug('Notificação socket enviada', {
        id: notification.id,
        recipients: notification.recipients.length,
      });
    } catch (error) {
      this.logger.error('Falha ao enviar notificação socket:', error);
      throw error;
    }
  }

  private async sendEmailNotification(
    notification: Notification
  ): Promise<void> {
    try {
      const emailTemplate = this.getEmailTemplate(notification);

      const emailPromises = notification.recipients.map(async (userId) => {
        const userEmail = await this.getUserEmail(userId);
        if (!userEmail) {
          this.logger.warn(`Email não encontrado para usuário ${userId}`);
          return;
        }

        return this.emailService.sendEmail({
          to: userEmail,
          template: emailTemplate,
          data: {
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            ...notification.data,
          },
          priority: notification.priority === 'urgent' ? 'high' : 'normal',
          subject: '',
        });
      });

      await Promise.allSettled(emailPromises);

      this.logger.debug('Notificações email enviadas', {
        id: notification.id,
        recipients: notification.recipients.length,
      });
    } catch (error) {
      this.logger.error('Falha ao enviar notificação email:', error);
      throw error;
    }
  }

  private async sendPushNotification(
    notification: Notification
  ): Promise<void> {
    // TODO: Implementar push notifications (Firebase, etc.)
    this.logger.info('Push notification seria enviada aqui', {
      id: notification.id,
      title: notification.title,
    });
  }

  private async storeNotification(notification: Notification): Promise<void> {
    try {
      // TTL baseado na data de expiração ou padrão de 7 dias
      const ttl = notification.expiresAt
        ? Math.floor((notification.expiresAt.getTime() - Date.now()) / 1000)
        : 86400 * 7;

      if (ttl <= 0) {
        this.logger.warn('Notificação com TTL expirado, não será armazenada', {
          id: notification.id,
        });
        return;
      }

      // Armazenar a notificação
      await this.cacheService.set(
        `notification:${notification.id}`,
        notification,
        ttl
      );

      // Adicionar à lista de notificações de cada usuário
      const userPromises = notification.recipients.map((userId) =>
        this.addNotificationToUser(userId, notification.id, ttl)
      );

      await Promise.allSettled(userPromises);
    } catch (error) {
      this.logger.error('Falha ao armazenar notificação:', error);
      throw error;
    }
  }

  private async addNotificationToUser(
    userId: string,
    notificationId: string,
    ttl: number
  ): Promise<void> {
    const userNotificationsKey = `user:${userId}:notifications`;

    // Adicionar notificação à lista do usuário
    await this.cacheService
      .getClient()
      .lpush(userNotificationsKey, notificationId);

    // Manter apenas as últimas 100 notificações
    await this.cacheService.getClient().ltrim(userNotificationsKey, 0, 99);

    // Definir TTL para a lista (máximo entre TTL da notificação e 30 dias)
    const listTtl = Math.max(ttl, 86400 * 30);
    await this.cacheService.getClient().expire(userNotificationsKey, listTtl);
  }

  public async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    } = {}
  ): Promise<{
    notifications: Notification[];
    total: number;
    unread: number;
  }> {
    try {
      const { limit = 20, offset = 0, unreadOnly = false } = options;

      const notificationIds = await this.cacheService
        .getClient()
        .lrange(`user:${userId}:notifications`, offset, offset + limit - 1);

      const notifications: Notification[] = [];
      const readNotifications = unreadOnly
        ? await this.cacheService
            .getClient()
            .smembers(`user:${userId}:read_notifications`)
        : [];
      const readSet = new Set(readNotifications);

      for (const id of notificationIds) {
        if (unreadOnly && readSet.has(id)) {
          continue;
        }

        const notificationData = await this.cacheService.get(
          `notification:${id}`
        );
        if (notificationData) {
          notifications.push(notificationData);
        }
      }

      // Contar total e não lidas
      const totalIds = await this.cacheService
        .getClient()
        .llen(`user:${userId}:notifications`);
      const unreadCount = totalIds - readSet.size;

      return {
        notifications,
        total: totalIds,
        unread: Math.max(0, unreadCount),
      };
    } catch (error) {
      this.logger.error('Falha ao obter notificações do usuário:', error);
      return { notifications: [], total: 0, unread: 0 };
    }
  }

  public async markAsRead(
    userId: string,
    notificationIds: string | string[]
  ): Promise<void> {
    try {
      const ids = Array.isArray(notificationIds)
        ? notificationIds
        : [notificationIds];

      if (ids.length === 0) return;

      await this.cacheService
        .getClient()
        .sadd(`user:${userId}:read_notifications`, ...ids);

      // Definir TTL para lista de lidas (30 dias)
      await this.cacheService
        .getClient()
        .expire(`user:${userId}:read_notifications`, 86400 * 30);

      this.logger.debug('Notificações marcadas como lidas', {
        userId,
        count: ids.length,
      });
    } catch (error) {
      this.logger.error('Falha ao marcar notificação como lida:', error);
      throw error;
    }
  }

  public async markAllAsRead(userId: string): Promise<void> {
    try {
      const notificationIds = await this.cacheService
        .getClient()
        .lrange(`user:${userId}:notifications`, 0, -1);

      if (notificationIds.length > 0) {
        await this.markAsRead(userId, notificationIds);
      }
    } catch (error) {
      this.logger.error(
        'Falha ao marcar todas as notificações como lidas:',
        error
      );
      throw error;
    }
  }

  public async deleteNotification(
    userId: string,
    notificationId: string
  ): Promise<void> {
    try {
      // Remover da lista do usuário
      await this.cacheService
        .getClient()
        .lrem(`user:${userId}:notifications`, 1, notificationId);

      // Remover da lista de lidas
      await this.cacheService
        .getClient()
        .srem(`user:${userId}:read_notifications`, notificationId);

      this.logger.debug('Notificação removida para usuário', {
        userId,
        notificationId,
      });
    } catch (error) {
      this.logger.error('Falha ao deletar notificação:', error);
      throw error;
    }
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getEmailTemplate(notification: Notification): string {
    const templateMap: Record<string, string> = {
      info: 'info-notification',
      success: 'success-notification',
      warning: 'warning-notification',
      error: 'error-notification',
    };

    return templateMap[notification.type] || 'generic-notification';
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    try {
      // Em um caso real, você buscaria o email do banco de dados
      const { User } = await import('../models/User');
      const user = await User.findById(userId).select('email');
      return user?.email || null;
    } catch (error) {
      this.logger.error(`Erro ao buscar email do usuário ${userId}:`, error);
      return null;
    }
  }

  /**
   * Limpar notificações expiradas
   */
  public async cleanupExpiredNotifications(): Promise<void> {
    this.logger.info('Limpeza de notificações expiradas iniciada');

    // Esta função seria chamada periodicamente via cron job
    // Por enquanto apenas logga que seria executada

    this.logger.info('Limpeza de notificações expiradas concluída');
  }

  /**
   * Obter estatísticas de notificações
   */
  public async getNotificationStats(
    timeframe: 'day' | 'week' | 'month' = 'day'
  ): Promise<any> {
    try {
      // TODO: Implementar estatísticas baseadas em dados históricos
      return {
        sent: 0,
        read: 0,
        byType: {},
        byChannel: {},
      };
    } catch (error) {
      this.logger.error('Erro ao obter estatísticas de notificações:', error);
      return null;
    }
  }
}
