import { Request, Response, NextFunction } from 'express';
import { Configuration } from '../models/Configuration';
import { ApiResponse } from '../utils/ApiResponse';
import { LoggerService } from '../services/LoggerService';
import { CacheService } from '../services/CacheService';
import { FileUploadService } from '../services/FileUploadService';

export class ConfigurationController {
  private logger = LoggerService.getInstance();
  private cacheService = CacheService.getInstance();
  private fileUploadService = FileUploadService.getInstance();

  /**
   * Obter configuração do site
   * GET /api/admin/configuration
   */
  public async getConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let config = await Configuration.findOne();
      
      if (!config) {
        // Criar configuração padrão
        config = await Configuration.create({
          profile: {
            name: 'Seu Nome',
            title: 'Desenvolvedor Web',
            description: 'Desenvolvedor Web com experiência em React, Node.js e MongoDB',
            contactEmail: 'seuemail@example.com'
          },
          socialLinks: [],
          siteSettings: {
            title: 'Meu Portfólio',
            description: 'Portfólio de projetos e certificados',
            language: 'pt-BR',
            primaryColor: '#3B82F6',
            secondaryColor: '#10B981',
            darkMode: true
          },
          seo: {
            keywords: ['portfolio', 'desenvolvedor', 'web']
          }
        });
      }
      
      res.json(
        ApiResponse.success(config)
      );
    } catch (error) {
      this.logger.error('Erro ao buscar configuração:', error);
      next(error);
    }
  }

  /**
   * Atualizar configuração do site
   * PUT /api/admin/configuration
   */
  public async updateConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const configData = req.body;
      
      // Processar upload de imagens
      if (req.files) {
        const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        
        for (const file of files) {
          const uploadResult = await this.fileUploadService.uploadSingle(file);
          
          switch (file.fieldname) {
            case 'avatar':
              configData.profile = {
                ...configData.profile,
                avatar: uploadResult.url
              };
              break;
            case 'resumeFile':
              configData.profile = {
                ...configData.profile,
                resumeUrl: uploadResult.url
              };
              break;
            case 'metaImage':
              configData.seo = {
                ...configData.seo,
                metaImage: uploadResult.url
              };
              break;
          }
        }
      }
      
      let config = await Configuration.findOne();
      
      if (!config) {
        config = await Configuration.create(configData);
      } else {
        config = await Configuration.findOneAndUpdate({}, configData, { new: true });
      }
      
      // Invalidar cache
      await this.cacheService.delete('site:configuration');
      
      res.json(
        ApiResponse.success(config, 'Configuração atualizada com sucesso')
      );
      
      this.logger.info('Configuração do site atualizada');
    } catch (error) {
      this.logger.error('Erro ao atualizar configuração:', error);
      next(error);
    }
  }
}

export const configurationController = new ConfigurationController();