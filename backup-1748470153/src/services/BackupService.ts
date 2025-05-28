// src/services/BackupService.ts
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { LoggerService } from './LoggerService';

const execAsync = promisify(exec);

export class BackupService {
  private static instance: BackupService;
  private logger: LoggerService;

  private constructor() {
    this.logger = LoggerService.getInstance();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  public async createDatabaseBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `portfolio-db-${timestamp}.gz`;
      const backupPath = path.join(process.cwd(), 'backups', backupFileName);

      if (!fs.existsSync(path.dirname(backupPath))) {
        fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      }

      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
      const command = `mongodump --uri="${mongoUri}" --archive="${backupPath}" --gzip`;
      
      try {
        await execAsync(command);
        this.logger.info(`📦 Database backup criado: ${backupPath}`);
        return backupPath;
      } catch (error) {
        this.logger.error('❌ Erro ao executar mongodump. Verifique se MongoDB tools estão instalados:', error);
        throw new Error('MongoDB tools não estão disponíveis');
      }
    } catch (error) {
      this.logger.error('❌ Erro ao criar backup do banco de dados:', error);
      throw error;
    }
  }

  public async uploadBackupToCloud(filePath: string): Promise<void> {
    // Implementação básica - pode ser estendida com provedores de cloud específicos
    this.logger.info(`📤 Upload de backup seria feito aqui para: ${path.basename(filePath)}`);
    this.logger.info('💡 Para usar upload real, configure as credenciais de cloud storage');
    
    // Aqui você pode adicionar integração com:
    // - AWS S3
    // - Google Cloud Storage  
    // - Azure Blob Storage
    // etc.
  }

  private async backupStaticFiles(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveName = `static-files-${timestamp}.tar.gz`;
      const archivePath = path.join(process.cwd(), 'backups', archiveName);

      // Verificar se tar está disponível
      try {
        const command = `tar -czf "${archivePath}" uploads/ || echo "Backup de arquivos ignorado - tar não disponível"`;
        await execAsync(command);
        
        if (fs.existsSync(archivePath)) {
          await this.uploadBackupToCloud(archivePath);
          this.logger.info('🗂️ Backup dos arquivos estáticos concluído');
        } else {
          this.logger.warn('⚠️ Comando tar não disponível - backup de arquivos ignorado');
        }
      } catch (error) {
        this.logger.warn('⚠️ Erro ao criar backup de arquivos estáticos:', error);
      }
    } catch (error) {
      this.logger.error('❌ Erro ao fazer backup de arquivos estáticos:', error);
      throw error;
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      
      if (!fs.existsSync(backupDir)) {
        return;
      }
      
      const files = fs.readdirSync(backupDir);
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(backupDir, file);
        
        try {
          const stats = fs.statSync(filePath);
          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(filePath);
            this.logger.info(`🧹 Backup antigo removido: ${file}`);
          }
        } catch (error) {
          this.logger.warn(`⚠️ Erro ao processar arquivo ${file}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('❌ Erro ao limpar backups antigos:', error);
    }
  }

  public async createFullBackup(): Promise<void> {
    try {
      this.logger.info('🚀 Iniciando backup completo...');

      try {
        const dbBackupPath = await this.createDatabaseBackup();
        await this.uploadBackupToCloud(dbBackupPath);
      } catch (error) {
        this.logger.error('❌ Falha no backup do banco de dados:', error);
      }

      try {
        await this.backupStaticFiles();
      } catch (error) {
        this.logger.error('❌ Falha no backup de arquivos estáticos:', error);
      }

      await this.cleanupOldBackups();

      this.logger.info('✅ Backup completo finalizado');
    } catch (error) {
      this.logger.error('❌ Falha no backup completo:', error);
    }
  }

  public async scheduleBackups(): Promise<void> {
    // Implementação básica de agendamento
    const intervalMs = 24 * 60 * 60 * 1000; // 24 horas
    
    setInterval(async () => {
      this.logger.info('🕑 Iniciando backup agendado...');
      try {
        await this.createFullBackup();
      } catch (error) {
        this.logger.error('❌ Erro no backup agendado:', error);
      }
    }, intervalMs);

    this.logger.info('🗓️ Agendador de backup iniciado (diário)');
  }
}