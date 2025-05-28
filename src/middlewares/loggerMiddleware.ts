// src/middlewares/loggerMiddleware.ts (melhorado)
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/LoggerService';
import onFinished from 'on-finished';

export class LoggerMiddleware {
  private static logger = LoggerService.getInstance();

  /**
   * Middleware para logging de requisições HTTP
   */
  public static requestLogger() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = process.hrtime();

      // Capturar quando os headers são enviados
      const originalSend = res.send;
      let headersSentTime: number;

      res.send = function (data: any) {
        headersSentTime = LoggerMiddleware.calculateDuration(startTime);
        res.locals.headersSentTime = headersSentTime;
        return originalSend.call(this, data);
      };

      // Capturar quando a resposta é finalizada
      onFinished(res, () => {
        const totalTime = LoggerMiddleware.calculateDuration(startTime);

        // Adicionar informações adicionais
        const requestInfo = {
          responseTime: totalTime,
          headersSentTime: res.locals.headersSentTime || totalTime,
          contentType: res.get('Content-Type'),
          contentLength: res.get('Content-Length') || 0,
          requestId: req.headers['x-request-id'] || req.id,
          route: req.route?.path || req.path,
          query: Object.keys(req.query).length > 0 ? req.query : undefined,
          sessionId: req.sessionID,
          cookies:
            Object.keys(req.cookies || {}).length > 0
              ? Object.keys(req.cookies)
              : undefined,
        };

        LoggerMiddleware.logger.logRequest(req, res, totalTime);

        // Se houver erro, registrar informações adicionais
        if (res.statusCode >= 400) {
          LoggerMiddleware.logger.warn(
            `Resposta de erro ${res.statusCode}`,
            requestInfo
          );
        }
      });

      next();
    };
  }

  /**
   * Calcula a duração em milissegundos a partir de um timestamp hrtime
   */
  private static calculateDuration(startTime: [number, number]): number {
    const diff = process.hrtime(startTime);
    return diff[0] * 1000 + diff[1] / 1000000;
  }

  /**
   * Adiciona um ID único a cada requisição
   */
  public static requestId() {
    return (req: Request, res: Response, next: NextFunction) => {
      const id =
        req.headers['x-request-id'] || LoggerMiddleware.generateRequestId();
      req.id = id as string;
      res.setHeader('X-Request-ID', id);
      next();
    };
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

// Adicionar a propriedade id ao Request
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
