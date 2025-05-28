import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from './LoggerService';
import sharp from 'sharp';

interface UploadResult {
  fieldname: string;
  originalname: string;
  filename: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
}

export class FileUploadService {
  private static instance: FileUploadService;
  private logger = LoggerService.getInstance();
  private uploadDir: string;

  private constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirectory();
  }

  public static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService();
    }
    return FileUploadService.instance;
  }

  /**
   * Garantir que o diretório de upload exista
   */
  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Configuração do Multer
   */
  public getMulterConfig(): multer.Options {
    return {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, this.uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
          const ext = path.extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo de arquivo não suportado'));
        }
      },
    };
  }

  /**
   * Upload de um único arquivo
   */
  public async uploadSingle(file: Express.Multer.File): Promise<UploadResult> {
    try {
      // Otimizar imagens se forem JPG, PNG ou WEBP
      if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
        await this.optimizeImage(file.path);
      }

      // URL pública para o arquivo
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const relativePath = path.relative(process.cwd(), file.path);
      const url = `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;

      return {
        fieldname: file.fieldname,
        originalname: file.originalname,
        filename: file.filename,
        path: file.path,
        url,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Erro ao processar upload:', error);
      throw error;
    }
  }

  /**
   * Upload de múltiplos arquivos
   */
  public async uploadMultiple(
    files: Express.Multer.File[]
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadSingle(file);
      results.push(result);
    }

    return results;
  }

  /**
   * Otimizar imagem com sharp
   */
  private async optimizeImage(filePath: string): Promise<void> {
    try {
      // Obter informações da imagem
      const metadata = await sharp(filePath).metadata();

      // Redimensionar se for muito grande
      if ((metadata.width || 0) > 2000 || (metadata.height || 0) > 2000) {
        await sharp(filePath)
          .resize({
            width: 2000,
            height: 2000,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toFile(`${filePath}.optimized`);

        // Substituir original pela otimizada
        await fs.unlink(filePath);
        await fs.rename(`${filePath}.optimized`, filePath);
      } else {
        // Apenas comprimir
        await sharp(filePath)
          .jpeg({ quality: 80 })
          .toFile(`${filePath}.optimized`);

        await fs.unlink(filePath);
        await fs.rename(`${filePath}.optimized`, filePath);
      }
    } catch (error) {
      this.logger.error('Erro ao otimizar imagem:', error);
      // Continuar mesmo se a otimização falhar
    }
  }
}
