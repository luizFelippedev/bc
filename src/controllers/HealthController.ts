// src/controllers/HealthController.ts
import { Request, Response } from 'express';
import { HealthCheckService } from '../services/HealthCheckService';
import { ApiResponse } from '../utils/ApiResponse';

export class HealthController {
  private healthService: HealthCheckService;

  constructor() {
    this.healthService = HealthCheckService.getInstance();
  }

  /**
   * Retorna um status básico da aplicação
   * GET /health
   */
  public async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const summary = await this.healthService.getStatusSummary();
      res.status(summary.status === 'healthy' ? 200 : 503)
         .json(ApiResponse.success(summary));
    } catch (error) {
      res.status(500).json(ApiResponse.error('Erro ao verificar saúde da aplicação'));
    }
  }

  /**
   * Retorna status detalhado da aplicação e seus componentes
   * GET /health/detailed
   */
  public async getDetailedHealth(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.healthService.getStatus();
      
      res.status(status.status === 'healthy' ? 200 : 
                 status.status === 'degraded' ? 200 : 503)
         .json(ApiResponse.success(status));
    } catch (error) {
      res.status(500).json(ApiResponse.error('Erro ao verificar saúde detalhada da aplicação'));
    }
  }

  /**
   * Verifica a saúde da aplicação em tempo real
   * GET /health/check
   */
  public async checkHealth(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.healthService.checkHealth();
      
      res.status(status.status === 'healthy' ? 200 : 
                 status.status === 'degraded' ? 200 : 503)
         .json(ApiResponse.success(status));
    } catch (error) {
      res.status(500).json(ApiResponse.error('Erro ao verificar saúde da aplicação'));
    }
  }
}

export const healthController = new HealthController();