// src/bootstrap.ts
import { App } from './app';
import { LoggerService } from './services/LoggerService';
import { HealthCheckService } from './services/HealthCheckService';
import { MigrationService } from './services/MigrationService';
import { User } from './models/User';
import bcrypt from 'bcryptjs';

export class Bootstrap {
  private static logger = LoggerService.getInstance();
  private static healthService = HealthCheckService.getInstance();
  private static migrationService = MigrationService.getInstance();

  public static async init(): Promise<App> {
    try {
      this.logger.info('🚀 Iniciando aplicação...');
      
      // Verificar variáveis de ambiente obrigatórias
      this.checkRequiredEnvVars();
      
      // Inicializar aplicação
      const app = new App();
      
      // Executar migrations
      await this.runMigrations();
      
      // Inicializar usuário administrador
      await this.initializeAdmin();
      
      // Iniciar monitoramento de saúde
      this.healthService.startMonitoring();
      
      // Configurar handlers para graceful shutdown
      this.setupShutdownHandlers(app);
      
      return app;
    } catch (error) {
      this.logger.error('❌ Falha na inicialização da aplicação:', error);
      process.exit(1);
    }
  }

  private static checkRequiredEnvVars(): void {
    const requiredVars = [
      'PORT',
      'NODE_ENV',
      'MONGODB_URI',
      'JWT_SECRET'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      this.logger.error(`❌ Variáveis de ambiente obrigatórias não definidas: ${missingVars.join(', ')}`);
      process.exit(1);
    }
  }

  private static async runMigrations(): Promise<void> {
    try {
      this.logger.info('🔄 Executando migrations...');
      await this.migrationService.runMigrations();
      this.logger.info('✅ Migrations executadas com sucesso');
    } catch (error) {
      this.logger.error('❌ Falha ao executar migrations:', error);
      throw error;
    }
  }

  private static async initializeAdmin(): Promise<void> {
    try {
      this.logger.info('🔄 Verificando usuário administrador...');
      
      // Verificar se já existe um admin
      const adminExists = await User.findOne({ role: 'admin' });
      
      if (adminExists) {
        this.logger.info('✅ Usuário administrador já existe');
        return;
      }
      
      // Obter credenciais do ambiente ou usar padrões
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const adminName = process.env.ADMIN_NAME || 'Administrador';
      
      // Criar usuário admin
      const adminUser = new User({
        name: adminName,
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        role: 'admin',
        isActive: true
      });
      
      await adminUser.save();
      
      this.logger.info(`✅ Usuário administrador criado com sucesso: ${adminEmail}`);
    } catch (error) {
      this.logger.error('❌ Falha ao inicializar usuário administrador:', error);
      throw error;
    }
  }

  private static setupShutdownHandlers(app: App): void {
    const shutdown = async (signal: string) => {
      this.logger.info(`📴 Recebido sinal ${signal}. Iniciando shutdown graceful...`);
      
      try {
        this.healthService.stopMonitoring();
        await app.shutdown();
        this.logger.info('👋 Aplicação encerrada com sucesso');
        process.exit(0);
      } catch (error) {
        this.logger.error('❌ Erro durante shutdown:', error);
        process.exit(1);
      }
    };

    // Sinais para capturar
    ['SIGTERM', 'SIGINT', 'SIGUSR2'].forEach((signal) => {
      process.on(signal, () => shutdown(signal));
    });

    // Capturar exceções não tratadas
    process.on('uncaughtException', (error) => {
      this.logger.error('🔥 Exceção não capturada:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      this.logger.error('🔥 Promise rejeitada não tratada:', reason);
      shutdown('unhandledRejection');
    });
  }
}