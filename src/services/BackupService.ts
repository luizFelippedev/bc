// src/services/BackupService.ts
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Storage } from '@google-cloud/storage';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import cron from 'node-cron';
import { LoggerService } from './LoggerService';

const execAsync = promisify(exec);

export class BackupService {
  private static instance: BackupService;
  private logger: LoggerService;
  private storage: Storage | null = null;
  private s3: S3Client | null = null;

  private constructor() {
    this.logger = LoggerService.getInstance();
    this.initializeCloudStorage();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  private initializeCloudStorage(): void {
    if (process.env.GOOGLE_CLOUD_KEYFILE) {
      this.storage = new Storage({
        keyFilename: process.env.GOOGLE_CLOUD_KEYFILE,
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      });
    }

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.s3 = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  public async createDatabaseBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `portfolio-db-${timestamp}.gz`;
      const backupPath = path.join(process.cwd(), 'backups', backupFileName);

      if (!fs.existsSync(path.dirname(backupPath))) {
        fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      }

      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_enterprise';
      const command = `mongodump --uri="${mongoUri}" --archive="${backupPath}" --gzip`;
      await execAsync(command);

      this.logger.info(`📦 Database backup criado: ${backupPath}`);
      return backupPath;
    } catch (error) {
      this.logger.error('❌ Erro ao criar backup do banco de dados:', error);
      throw error;
    }
  }

  public async uploadBackupToCloud(filePath: string): Promise<void> {
    const fileName = path.basename(filePath);

    // Google Cloud
    if (this.storage && process.env.GOOGLE_CLOUD_BACKUP_BUCKET) {
      try {
        const bucket = this.storage.bucket(process.env.GOOGLE_CLOUD_BACKUP_BUCKET);
        await bucket.upload(filePath, {
          destination: `backups/${fileName}`,
          metadata: {
            metadata: {
              createdAt: new Date().toISOString(),
              type: 'backup',
            },
          },
        });
        this.logger.info(`☁️ Enviado para Google Cloud: ${fileName}`);
      } catch (error) {
        this.logger.error('❌ Falha ao enviar para Google Cloud:', error);
      }
    }

    // AWS S3
    if (this.s3 && process.env.AWS_BACKUP_BUCKET) {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        await this.s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_BACKUP_BUCKET!,
            Key: `backups/${fileName}`,
            Body: fileBuffer,
            Metadata: {
              createdAt: new Date().toISOString(),
              type: 'backup',
            },
          })
        );
        this.logger.info(`☁️ Enviado para AWS S3: ${fileName}`);
      } catch (error) {
        this.logger.error('❌ Falha ao enviar para AWS S3:', error);
      }
    }
  }

  private async backupStaticFiles(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveName = `static-files-${timestamp}.tar.gz`;
      const archivePath = path.join(process.cwd(), 'backups', archiveName);

      const command = `tar -czf "${archivePath}" uploads/ public/`;
      await execAsync(command);

      await this.uploadBackupToCloud(archivePath);
      this.logger.info('🗂️ Backup dos arquivos estáticos concluído');
    } catch (error) {
      this.logger.error('❌ Erro ao fazer backup de arquivos estáticos:', error);
      throw error;
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      const files = fs.readdirSync(backupDir);
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          this.logger.info(`🧹 Backup antigo removido: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error('❌ Erro ao limpar backups antigos:', error);
    }
  }

  public async createFullBackup(): Promise<void> {
    try {
      this.logger.info('🚀 Iniciando backup completo...');

      const dbBackupPath = await this.createDatabaseBackup();
      await this.uploadBackupToCloud(dbBackupPath);

      await this.backupStaticFiles();
      await this.cleanupOldBackups();

      this.logger.info('✅ Backup completo finalizado com sucesso');
    } catch (error) {
      this.logger.error('❌ Falha no backup completo:', error);
    }
  }

  public async scheduleBackups(): Promise<void> {
    cron.schedule('0 2 * * *', async () => {
      this.logger.info('🕑 Iniciando backup agendado...');
      try {
        await this.createFullBackup();
      } catch (error) {
        this.logger.error('❌ Erro no backup agendado:', error);
      }
    });

    this.logger.info('🗓️ Agendador de backup iniciado (diário às 2h)');
  }
}
