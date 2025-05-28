// src/controllers/ExportController.ts
import { Request, Response, NextFunction } from 'express';
import { ExportService } from '../services/ExportService';
import { LoggerService } from '../services/LoggerService';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import * as fs from 'fs';
import * as path from 'path';

export class ExportController {
  private exportService: ExportService;
  private logger: LoggerService;

  constructor() {
    this.exportService = ExportService.getInstance();
    this.logger = LoggerService.getInstance();
  }

  /**
   * Exporta projetos para arquivo
   * GET /api/admin/export/projects
   */
  public async exportProjects(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const format = (req.query.format || 'json') as 'json' | 'csv' | 'xlsx';
      const fields = req.query.fields
        ? (req.query.fields as string).split(',')
        : undefined;
      const fileName = req.query.fileName as string;

      // Construir filtros a partir dos parâmetros da requisição
      const filters = this.buildFilters(req.query, [
        'category',
        'status',
        'featured',
        'visibility',
        'isActive',
      ]);

      // Exportar projetos
      const filePath = await this.exportService.exportProjects(
        {
          format,
          fields,
          fileName,
          includeHeaders: req.query.headers !== 'false',
        },
        filters
      );

      // Verificar se é para fazer download do arquivo
      if (req.query.download === 'true') {
        this.downloadFile(res, filePath);
      } else {
        res.json(
          ApiResponse.success({
            filePath: path.basename(filePath),
            format,
            totalRecords: fs.statSync(filePath).size,
            message: 'Projetos exportados com sucesso',
          })
        );
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exporta certificados para arquivo
   * GET /api/admin/export/certificates
   */
  public async exportCertificates(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const format = (req.query.format || 'json') as 'json' | 'csv' | 'xlsx';
      const fields = req.query.fields
        ? (req.query.fields as string).split(',')
        : undefined;
      const fileName = req.query.fileName as string;

      // Construir filtros a partir dos parâmetros da requisição
      const filters = this.buildFilters(req.query, [
        'type',
        'level',
        'featured',
        'isActive',
      ]);

      // Exportar certificados
      const filePath = await this.exportService.exportCertificates(
        {
          format,
          fields,
          fileName,
          includeHeaders: req.query.headers !== 'false',
        },
        filters
      );

      // Verificar se é para fazer download do arquivo
      if (req.query.download === 'true') {
        this.downloadFile(res, filePath);
      } else {
        res.json(
          ApiResponse.success({
            filePath: path.basename(filePath),
            format,
            totalRecords: fs.statSync(filePath).size,
            message: 'Certificados exportados com sucesso',
          })
        );
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exporta usuários para arquivo
   * GET /api/admin/export/users
   */
  public async exportUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const format = (req.query.format || 'json') as 'json' | 'csv' | 'xlsx';
      const fields = req.query.fields
        ? (req.query.fields as string).split(',')
        : undefined;
      const fileName = req.query.fileName as string;

      // Construir filtros a partir dos parâmetros da requisição
      const filters = this.buildFilters(req.query, ['role', 'isActive']);

      // Exportar usuários
      const filePath = await this.exportService.exportUsers(
        {
          format,
          fields,
          fileName,
          includeHeaders: req.query.headers !== 'false',
        },
        filters
      );

      // Verificar se é para fazer download do arquivo
      if (req.query.download === 'true') {
        this.downloadFile(res, filePath);
      } else {
        res.json(
          ApiResponse.success({
            filePath: path.basename(filePath),
            format,
            totalRecords: fs.statSync(filePath).size,
            message: 'Usuários exportados com sucesso',
          })
        );
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Baixa um arquivo exportado anteriormente
   * GET /api/admin/export/download/:filename
   */
  public async downloadExportedFile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const fileName = req.params.filename;
      const filePath = path.join(process.cwd(), 'exports', fileName);

      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        throw ApiError.notFound('Arquivo de exportação');
      }

      this.downloadFile(res, filePath);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Construir filtros para consulta baseado nos parâmetros da requisição
   */
  private buildFilters(query: any, allowedFields: string[]): any {
    const filters: any = {};

    // Adicionar filtros baseados em campos permitidos
    allowedFields.forEach((field) => {
      if (query[field] !== undefined && query[field] !== '') {
        // Converter 'true'/'false' para booleanos
        if (query[field] === 'true') {
          filters[field] = true;
        } else if (query[field] === 'false') {
          filters[field] = false;
        } else {
          filters[field] = query[field];
        }
      }
    });

    // Filtro de data - startDate, endDate
    if (query.startDate || query.endDate) {
      filters.createdAt = {};

      if (query.startDate) {
        filters.createdAt.$gte = new Date(query.startDate as string);
      }

      if (query.endDate) {
        filters.createdAt.$lte = new Date(query.endDate as string);
      }
    }

    // Filtro de busca por texto
    if (query.search) {
      filters.$text = { $search: query.search as string };
    }

    return filters;
  }

  /**
   * Envia um arquivo para download
   */
  private downloadFile(res: Response, filePath: string): void {
    const fileName = path.basename(filePath);
    const mimeTypes: Record<string, string> = {
      json: 'application/json',
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    const ext = path.extname(filePath).substring(1);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', contentType);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}

export const exportController = new ExportController();
