// ===== src/services/MigrationService.ts =====
import { LoggerService } from './LoggerService';
import { DatabaseService } from './DatabaseService';
import fs from 'fs/promises';
import path from 'path';

interface Migration {
  version: string;
  name: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
  executedAt?: Date;
}

export class MigrationService {
  private static instance: MigrationService;
  private logger: LoggerService;
  private database: DatabaseService;
  private migrationsPath: string;

  private constructor() {
    this.logger = LoggerService.getInstance();
    this.database = DatabaseService.getInstance();
    this.migrationsPath = path.join(process.cwd(), 'migrations');
  }

  public static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  public async runMigrations(): Promise<void> {
    try {
      await this.ensureMigrationsCollection();
      
      const migrationFiles = await this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();
      const executedVersions = new Set(executedMigrations.map(m => m.version));

      for (const migrationFile of migrationFiles) {
        try {
          const migration = await this.loadMigration(migrationFile);
          
          if (!executedVersions.has(migration.version)) {
            this.logger.info(`Executando migration: ${migration.name}`);
            
            await migration.up();
            await this.markMigrationAsExecuted(migration);
            this.logger.info(`Migration completada: ${migration.name}`);
          }
        } catch (error) {
          this.logger.warn(`Erro ao carregar migration ${migrationFile}:`, error);
          // Continue com próximas migrations
        }
      }

      this.logger.info('Migrations executadas com sucesso');
    } catch (error) {
      this.logger.error('Processo de migration falhou:', error);
      throw error;
    }
  }

  private async ensureMigrationsCollection(): Promise<void> {
    const connection = this.database.getConnection();
    if (connection) {
      const collections = await connection.db.listCollections({ name: 'migrations' }).toArray();
      if (collections.length === 0) {
        await connection.db.createCollection('migrations');
      }
    }
  }

  private async getMigrationFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
        .sort();
    } catch (error) {
      this.logger.info('Diretório de migrations não encontrado ou vazio');
      return [];
    }
  }

  private async loadMigration(filename: string): Promise<Migration> {
    const filepath = path.join(this.migrationsPath, filename);
    const module = await import(filepath);
    return module.migration || module.default;
  }

  private async getExecutedMigrations(): Promise<Migration[]> {
    const connection = this.database.getConnection();
    if (connection) {
      return await connection.db.collection('migrations').find({}).toArray();
    }
    return [];
  }

  private async markMigrationAsExecuted(migration: Migration): Promise<void> {
    const connection = this.database.getConnection();
    if (connection) {
      await connection.db.collection('migrations').insertOne({
        ...migration,
        executedAt: new Date()
      });
    }
  }
}
