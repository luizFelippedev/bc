import { Request, Response, NextFunction } from 'express';
import { Certificate } from '../models/Certificate';
import { ApiResponse } from '../utils/ApiResponse';
import { LoggerService } from '../services/LoggerService';
import { CacheService } from '../services/CacheService';
import { FileUploadService } from '../services/FileUploadService';
import mongoose from 'mongoose';

export class CertificateController {
  private logger = LoggerService.getInstance();
  private cacheService = CacheService.getInstance();
  private fileUploadService = FileUploadService.getInstance();

  /**
   * Obter todos os certificados (admin)
   * GET /api/admin/certificates
   */
  public async getAllCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sort = 'date.issued', 
        order = 'desc',
        search,
        category,
        featured
      } = req.query;
      
      // Construir filtros
      const filters: any = {};
      
      if (search) {
        filters.$or = [
          { title: { $regex: search, $options: 'i' } },
          { 'issuer.name': { $regex: search, $options: 'i' } },
          { skills: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (category) filters.category = category;
      if (featured) filters.featured = featured === 'true';
      
      // Construir ordenação
      const sortOption: any = {};
      sortOption[sort as string] = order === 'asc' ? 1 : -1;
      
      // Executar consulta com paginação
      const certificates = await Certificate.find(filters)
        .sort(sortOption)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));
      
      // Contar total
      const total = await Certificate.countDocuments(filters);
      
      res.json(
        ApiResponse.success({
          certificates,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        })
      );
    } catch (error) {
      this.logger.error('Erro ao buscar certificados:', error);
      next(error);
    }
  }

  /**
   * Obter certificado por ID
   * GET /api/admin/certificates/:id
   */
  public async getCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const certificate = await Certificate.findById(id);
      
      if (!certificate) {
        res.status(404).json(
          ApiResponse.error('Certificado não encontrado', 404)
        );
        return;
      }
      
      res.json(
        ApiResponse.success(certificate)
      );
    } catch (error) {
      this.logger.error('Erro ao buscar certificado:', error);
      next(error);
    }
  }

  /**
   * Criar novo certificado
   * POST /api/admin/certificates
   */
  public async createCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const certificateData = req.body;
      
      // Processar upload de imagens se houver
      if (req.file) {
        const uploadResult = await this.fileUploadService.uploadSingle(req.file);
        certificateData.image = uploadResult.url;
      }
      
      const certificate = new Certificate(certificateData);
      await certificate.save();
      
      // Invalidar cache
      await this.cacheService.deletePattern('certificates:*');
      
      res.status(201).json(
        ApiResponse.success(certificate, 'Certificado criado com sucesso')
      );
      
      this.logger.info(`Certificado criado: ${certificate.title} (${certificate._id})`);
    } catch (error) {
      this.logger.error('Erro ao criar certificado:', error);
      next(error);
    }
  }

  /**
   * Atualizar certificado
   * PUT /api/admin/certificates/:id
   */
  public async updateCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const certificateData = req.body;
      
      // Verificar se certificado existe
      const certificate = await Certificate.findById(id);
      
      if (!certificate) {
        res.status(404).json(
          ApiResponse.error('Certificado não encontrado', 404)
        );
        return;
      }
      
      // Processar upload de imagens se houver
      if (req.file) {
        const uploadResult = await this.fileUploadService.uploadSingle(req.file);
        certificateData.image = uploadResult.url;
      }
      
      // Atualizar certificado
      const updatedCertificate = await Certificate.findByIdAndUpdate(
        id,
        certificateData,
        { new: true, runValidators: true }
      );
      
      // Invalidar cache
      await this.cacheService.deletePattern('certificates:*');
      
      res.json(
        ApiResponse.success(updatedCertificate, 'Certificado atualizado com sucesso')
      );
      
      this.logger.info(`Certificado atualizado: ${certificate.title} (${certificate._id})`);
    } catch (error) {
      this.logger.error('Erro ao atualizar certificado:', error);
      next(error);
    }
  }

  /**
   * Excluir certificado
   * DELETE /api/admin/certificates/:id
   */
  public async deleteCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const certificate = await Certificate.findById(id);
      
      if (!certificate) {
        res.status(404).json(
          ApiResponse.error('Certificado não encontrado', 404)
        );
        return;
      }
      
      // Exclusão lógica (alterando isActive para false)
      certificate.isActive = false;
      await certificate.save();
      
      // Ou exclusão física
      // await Certificate.findByIdAndDelete(id);
      
      // Invalidar cache
      await this.cacheService.deletePattern('certificates:*');
      
      res.json(
        ApiResponse.success(null, 'Certificado excluído com sucesso')
      );
      
      this.logger.info(`Certificado excluído: ${certificate.title} (${certificate._id})`);
    } catch (error) {
      this.logger.error('Erro ao excluir certificado:', error);
      next(error);
    }
  }

  /**
   * Alternar status de destaque (featured)
   * PATCH /api/admin/certificates/:id/featured
   */
  public async toggleFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const certificate = await Certificate.findById(id);
      
      if (!certificate) {
        res.status(404).json(
          ApiResponse.error('Certificado não encontrado', 404)
        );
        return;
      }
      
      certificate.featured = !certificate.featured;
      await certificate.save();
      
      // Invalidar cache
      await this.cacheService.deletePattern('certificates:*');
      
      res.json(
        ApiResponse.success({ featured: certificate.featured }, 'Status de destaque atualizado')
      );
    } catch (error) {
      this.logger.error('Erro ao alternar status de destaque:', error);
      next(error);
    }
  }
}

export const certificateController = new CertificateController();