// ===== src/services/ConfigurationService.ts =====
import { Configuration } from '../models/Configuration';
import { LoggerService } from './LoggerService';
import { CacheService } from './CacheService';
import { ValidationError } from 'joi';

export interface SiteConfiguration {
  profile: {
    name: string;
    title: string;
    description: string;
    avatar?: string;
    location?: string;
    contactEmail: string;
    resumeUrl?: string;
  };
  socialLinks: Array<{
    platform: string;
    url: string;
    icon?: string;
  }>;
  siteSettings: {
    title: string;
    description: string;
    language: string;
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
  };
  seo: {
    keywords: string[];
    googleAnalyticsId?: string;
    metaImage?: string;
  };
}

export class ConfigurationService {
  private static instance: ConfigurationService;
  private logger = LoggerService.getInstance();
  private cacheService = CacheService.getInstance();
  private cacheKey = 'site:configuration';
  private cacheTTL = 3600; // 1 hora

  private constructor() {}

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  /**
   * Obter configuração do site
   */
  public async getConfiguration(): Promise<SiteConfiguration> {
    try {
      // Tentar cache primeiro
      const cached = await this.cacheService.get<SiteConfiguration>(this.cacheKey);
      if (cached) {
        return cached;
      }

      // Buscar no banco de dados
      let config = await Configuration.findOne().lean();

      if (!config) {
        // Criar configuração padrão se não existir
        config = await this.createDefaultConfiguration();
      }

      // Cache da configuração
      await this.cacheService.set(this.cacheKey, config, this.cacheTTL);

      return config as SiteConfiguration;
    } catch (error) {
      this.logger.error('Erro ao obter configuração:', error);
      
      // Retornar configuração padrão em caso de erro
      return this.getDefaultConfiguration();
    }
  }

  /**
   * Atualizar configuração do site
   */
  public async updateConfiguration(configData: Partial<SiteConfiguration>): Promise<SiteConfiguration> {
    try {
      this.logger.info('Atualizando configuração do site');

      // Validar dados de entrada
      this.validateConfiguration(configData);

      // Atualizar no banco de dados
      let config = await Configuration.findOne();

      if (!config) {
        config = new Configuration(configData);
      } else {
        // Merge dos dados existentes com os novos
        config = Object.assign(config, configData);
      }

      await config.save();

      // Invalidar cache
      await this.cacheService.delete(this.cacheKey);

      // Cachear nova configuração
      const updatedConfig = config.toObject() as SiteConfiguration;
      await this.cacheService.set(this.cacheKey, updatedConfig, this.cacheTTL);

      this.logger.info('Configuração atualizada com sucesso');
      return updatedConfig;
    } catch (error) {
      this.logger.error('Erro ao atualizar configuração:', error);
      throw error;
    }
  }

  /**
   * Criar configuração padrão
   */
  private async createDefaultConfiguration(): Promise<SiteConfiguration> {
    const defaultConfig: SiteConfiguration = this.getDefaultConfiguration();

    try {
      const config = new Configuration(defaultConfig);
      await config.save();
      
      this.logger.info('Configuração padrão criada');
      return config.toObject() as SiteConfiguration;
    } catch (error) {
      this.logger.error('Erro ao criar configuração padrão:', error);
      return defaultConfig;
    }
  }

  /**
   * Obter configuração padrão
   */
  private getDefaultConfiguration(): SiteConfiguration {
    return {
      profile: {
        name: 'Seu Nome',
        title: 'Desenvolvedor Full Stack',
        description: 'Desenvolvedor apaixonado por tecnologia e inovação, especializado em criar soluções web modernas e eficientes.',
        location: 'Brasil',
        contactEmail: process.env.CONTACT_EMAIL || 'contato@portfolio.com',
        avatar: '',
        resumeUrl: '',
      },
      socialLinks: [
        {
          platform: 'github',
          url: 'https://github.com/seu-usuario',
          icon: 'github'
        },
        {
          platform: 'linkedin',
          url: 'https://linkedin.com/in/seu-perfil',
          icon: 'linkedin'
        },
        {
          platform: 'twitter',
          url: 'https://twitter.com/seu-usuario',
          icon: 'twitter'
        }
      ],
      siteSettings: {
        title: 'Meu Portfolio',
        description: 'Portfolio profissional showcasing projetos e certificados',
        language: 'pt-BR',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        darkMode: true,
      },
      seo: {
        keywords: ['portfolio', 'desenvolvedor', 'web development', 'full stack', 'react', 'node.js'],
        googleAnalyticsId: '',
        metaImage: '',
      },
    };
  }

  /**
   * Validar configuração
   */
  private validateConfiguration(config: any): void {
    const errors: string[] = [];

    // Validar profile
    if (config.profile) {
      if (config.profile.name && config.profile.name.trim().length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
      }
      
      if (config.profile.contactEmail && !this.isValidEmail(config.profile.contactEmail)) {
        errors.push('Email de contato inválido');
      }
    }

    // Validar social links
    if (config.socialLinks && Array.isArray(config.socialLinks)) {
      config.socialLinks.forEach((link: any, index: number) => {
        if (!link.platform || !link.url) {
          errors.push(`Link social ${index + 1}: plataforma e URL são obrigatórios`);
        }
        
        if (link.url && !this.isValidUrl(link.url)) {
          errors.push(`Link social ${index + 1}: URL inválida`);
        }
      });
    }

    // Validar cores
    if (config.siteSettings) {
      if (config.siteSettings.primaryColor && !this.isValidHexColor(config.siteSettings.primaryColor)) {
        errors.push('Cor primária deve ser um código hexadecimal válido');
      }
      
      if (config.siteSettings.secondaryColor && !this.isValidHexColor(config.siteSettings.secondaryColor)) {
        errors.push('Cor secundária deve ser um código hexadecimal válido');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '), [], '');
    }
  }

  /**
   * Validar email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validar cor hexadecimal
   */
  private isValidHexColor(color: string): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
  }

  /**
   * Limpar cache de configuração
   */
  public async clearCache(): Promise<void> {
    try {
      await this.cacheService.delete(this.cacheKey);
      this.logger.info('Cache de configuração limpo');
    } catch (error) {
      this.logger.error('Erro ao limpar cache de configuração:', error);
    }
  }

  /**
   * Verificar se configuração existe
   */
  public async configurationExists(): Promise<boolean> {
    try {
      const count = await Configuration.countDocuments();
      return count > 0;
    } catch (error) {
      this.logger.error('Erro ao verificar existência da configuração:', error);
      return false;
    }
  }

  /**
   * Reset para configuração padrão
   */
  public async resetToDefault(): Promise<SiteConfiguration> {
    try {
      this.logger.info('Resetando configuração para padrão');

      // Deletar configuração existente
      await Configuration.deleteMany({});

      // Limpar cache
      await this.clearCache();

      // Criar nova configuração padrão
      return await this.createDefaultConfiguration();
    } catch (error) {
      this.logger.error('Erro ao resetar configuração:', error);
      throw error;
    }
  }

  /**
   * Fazer backup da configuração
   */
  public async backupConfiguration(): Promise<string> {
    try {
      const config = await this.getConfiguration();
      const backup = {
        configuration: config,
        backupDate: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      };

      const backupString = JSON.stringify(backup, null, 2);
      this.logger.info('Backup da configuração criado');
      
      return backupString;
    } catch (error) {
      this.logger.error('Erro ao criar backup da configuração:', error);
      throw error;
    }
  }

  /**
   * Restaurar configuração do backup
   */
  public async restoreConfiguration(backupString: string): Promise<SiteConfiguration> {
    try {
      const backup = JSON.parse(backupString);
      
      if (!backup.configuration) {
        throw new Error('Backup inválido: configuração não encontrada');
      }

      this.logger.info('Restaurando configuração do backup');
      return await this.updateConfiguration(backup.configuration);
    } catch (error) {
      this.logger.error('Erro ao restaurar configuração:', error);
      throw error;
    }
  }
}