// src/services/ExportService.ts
import { LoggerService } from './LoggerService';
import { Project } from '../models/Project';
import { Certificate } from '../models/Certificate';
import { User } from '../models/User';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  fileName?: string;
  fields?: string[];
  includeHeaders?: boolean;
  delimiter?: string;
}

export class ExportService {
  private static instance: ExportService;
  private logger: LoggerService;
  private exportPath: string;

  private constructor() {
    this.logger = LoggerService.getInstance();
    this.exportPath = path.join(process.cwd(), 'exports');
    this.ensureExportDirectory();
  }

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  private async ensureExportDirectory(): Promise<void> {
    try {
      await fs.access(this.exportPath);
    } catch {
      await fs.mkdir(this.exportPath, { recursive: true });
    }
  }

  /**
   * Exporta projetos para arquivo
   */
  public async exportProjects(
    options: ExportOptions, 
    filters: any = {}
  ): Promise<string> {
    try {
      this.logger.info('Exportando projetos', { format: options.format, filters });
      
      const projects = await Project.find(filters)
        .select(options.fields?.join(' ') || '')
        .lean();
      
      if (projects.length === 0) {
        throw new Error('Nenhum projeto encontrado para exportar');
      }
      
      return this.exportData(projects, {
        ...options,
        fileName: options.fileName || `projetos_${new Date().toISOString().slice(0, 10)}`
      });
    } catch (error) {
      this.logger.error('Erro ao exportar projetos:', error);
      throw error;
    }
  }

  /**
   * Exporta certificados para arquivo
   */
  public async exportCertificates(
    options: ExportOptions, 
    filters: any = {}
  ): Promise<string> {
    try {
      this.logger.info('Exportando certificados', { format: options.format, filters });
      
      const certificates = await Certificate.find(filters)
        .select(options.fields?.join(' ') || '')
        .lean();
      
      if (certificates.length === 0) {
        throw new Error('Nenhum certificado encontrado para exportar');
      }
      
      return this.exportData(certificates, {
        ...options,
        fileName: options.fileName || `certificados_${new Date().toISOString().slice(0, 10)}`
      });
    } catch (error) {
      this.logger.error('Erro ao exportar certificados:', error);
      throw error;
    }
  }

  /**
   * Exporta usuários para arquivo
   */
  public async exportUsers(
    options: ExportOptions, 
    filters: any = {}
  ): Promise<string> {
    try {
      this.logger.info('Exportando usuários', { format: options.format, filters });
      
      // Nunca exportar senhas
      const fields = options.fields?.filter(f => f !== 'password') || [];
      if (!fields.includes('-password')) {
        fields.push('-password');
      }
      
      const users = await User.find(filters)
        .select(fields.join(' '))
        .lean();
      
      if (users.length === 0) {
        throw new Error('Nenhum usuário encontrado para exportar');
      }
      
      return this.exportData(users, {
        ...options,
        fileName: options.fileName || `usuarios_${new Date().toISOString().slice(0, 10)}`
      });
    } catch (error) {
      this.logger.error('Erro ao exportar usuários:', error);
      throw error;
    }
  }

  /**
   * Função genérica para exportar dados
   */
  private async exportData(
    data: any[], 
    options: ExportOptions
  ): Promise<string> {
    const { format, fileName } = options;
    const timestamp = new Date().getTime();
    const fullFileName = `${fileName}_${timestamp}.${format}`;
    const filePath = path.join(this.exportPath, fullFileName);
    
    try {
      switch (format) {
        case 'json':
          await this.exportToJSON(data, filePath);
          break;
        case 'csv':
          await this.exportToCSV(data, filePath, options);
          break;
        default:
          throw new Error(`Formato de exportação não suportado: ${format}`);
      }
      
      this.logger.info(`Dados exportados com sucesso para ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error(`Erro ao exportar dados para ${format}:`, error);
      throw error;
    }
  }

  private async exportToJSON(data: any[], filePath: string): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  private async exportToCSV(
    data: any[], 
    filePath: string, 
    options: ExportOptions
  ): Promise<void> {
    try {
      // Preparar dados para CSV (achatar objetos aninhados)
      const flattenedData = data.map(item => this.flattenObject(item));
      
      // Criar CSV manualmente
      const fields = options.fields || Object.keys(flattenedData[0] || {});
      const delimiter = options.delimiter || ',';
      
      let csv = '';
      
      // Headers
      if (options.includeHeaders !== false) {
        csv += fields.join(delimiter) + '\n';
      }
      
      // Data rows
      for (const row of flattenedData) {
        const values = fields.map(field => {
          const value = row[field];
          // Escape values with quotes if they contain delimiter or quotes
          if (typeof value === 'string' && (value.includes(delimiter) || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        });
        csv += values.join(delimiter) + '\n';
      }
      
      await fs.writeFile(filePath, csv);
    } catch (error) {
      this.logger.error('Erro ao converter para CSV:', error);
      throw error;
    }
  }

  /**
   * Achata objetos aninhados para CSV
   * Exemplo: { user: { name: 'John' } } -> { 'user.name': 'John' }
   */
  private flattenObject(obj: any, prefix: string = ''): any {
    const result: any = {};
    
    for (const key in obj) {
      if (obj[key] === null || obj[key] === undefined) {
        result[prefix + key] = '';
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
        const nested = this.flattenObject(obj[key], `${prefix}${key}.`);
        Object.assign(result, nested);
      } else if (Array.isArray(obj[key])) {
        result[prefix + key] = JSON.stringify(obj[key]);
      } else if (obj[key] instanceof Date) {
        result[prefix + key] = obj[key].toISOString();
      } else {
        result[prefix + key] = obj[key];
      }
    }
    
    return result;
  }
}