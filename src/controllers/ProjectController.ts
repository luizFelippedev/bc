import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { ApiResponse } from '../utils/ApiResponse';
import { LoggerService } from '../services/LoggerService';
import { CacheService } from '../services/CacheService';
import { FileUploadService } from '../services/FileUploadService';
import mongoose from 'mongoose';

export class ProjectController {
  private logger = LoggerService.getInstance();
  private cacheService = CacheService.getInstance();
  private fileUploadService = FileUploadService.getInstance();

  /**
   * Obter todos os projetos (admin)
   * GET /api/admin/projects
   */
  public async getAllProjects(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        search,
        category,
        status,
        featured,
      } = req.query;

      // Construir filtros
      const filters: any = {};

      if (search) {
        filters.$or = [
          { title: { $regex: search, $options: 'i' } },
          { shortDescription: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ];
      }

      if (category) filters.category = category;
      if (status) filters.status = status;
      if (featured) filters.featured = featured === 'true';

      // Construir ordenação
      const sortOption: any = {};
      sortOption[sort as string] = order === 'asc' ? 1 : -1;

      // Executar consulta com paginação
      const projects = await Project.find(filters)
        .sort(sortOption)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      // Contar total
      const total = await Project.countDocuments(filters);

      res.json(
        ApiResponse.success({
          projects,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        })
      );
    } catch (error) {
      this.logger.error('Erro ao buscar projetos:', error);
      next(error);
    }
  }

  /**
   * Obter projeto por ID
   * GET /api/admin/projects/:id
   */
  public async getProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const project = await Project.findById(id);

      if (!project) {
        res.status(404).json(ApiResponse.error('Projeto não encontrado', 404));
        return;
      }

      res.json(ApiResponse.success(project));
    } catch (error) {
      this.logger.error('Erro ao buscar projeto:', error);
      next(error);
    }
  }

  /**
   * Criar novo projeto
   * POST /api/admin/projects
   */
  public async createProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectData = req.body;

      // Processar upload de imagens se houver
      if (req.files) {
        const files = Array.isArray(req.files)
          ? req.files
          : Object.values(req.files).flat();

        const uploadResults =
          await this.fileUploadService.uploadMultiple(files);

        // Associar imagens ao projeto
        projectData.images = {
          featured:
            uploadResults.find((file) => file.fieldname === 'featured')?.url ||
            '',
          gallery: uploadResults
            .filter((file) => file.fieldname === 'gallery')
            .map((file) => file.url),
        };
      }

      const project = new Project(projectData);
      await project.save();

      // Invalidar cache
      await this.cacheService.deletePattern('projects:*');

      res
        .status(201)
        .json(ApiResponse.success(project, 'Projeto criado com sucesso'));

      this.logger.info(`Projeto criado: ${project.title} (${project._id})`);
    } catch (error) {
      this.logger.error('Erro ao criar projeto:', error);
      next(error);
    }
  }

  /**
   * Atualizar projeto
   * PUT /api/admin/projects/:id
   */
  public async updateProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const projectData = req.body;

      // Verificar se projeto existe
      const project = await Project.findById(id);

      if (!project) {
        res.status(404).json(ApiResponse.error('Projeto não encontrado', 404));
        return;
      }

      // Processar upload de imagens se houver
      if (req.files) {
        const files = Array.isArray(req.files)
          ? req.files
          : Object.values(req.files).flat();

        const uploadResults =
          await this.fileUploadService.uploadMultiple(files);

        // Atualizar imagens existentes ou adicionar novas
        projectData.images = {
          ...project.images,
          featured:
            uploadResults.find((file) => file.fieldname === 'featured')?.url ||
            project.images.featured,
          gallery: [
            ...project.images.gallery,
            ...uploadResults
              .filter((file) => file.fieldname === 'gallery')
              .map((file) => file.url),
          ],
        };
      }

      // Atualizar projeto
      const updatedProject = await Project.findByIdAndUpdate(id, projectData, {
        new: true,
        runValidators: true,
      });

      // Invalidar cache
      await this.cacheService.deletePattern('projects:*');
      await this.cacheService.delete(`project:${project.slug}`);

      res.json(
        ApiResponse.success(updatedProject, 'Projeto atualizado com sucesso')
      );

      this.logger.info(`Projeto atualizado: ${project.title} (${project._id})`);
    } catch (error) {
      this.logger.error('Erro ao atualizar projeto:', error);
      next(error);
    }
  }

  /**
   * Excluir projeto
   * DELETE /api/admin/projects/:id
   */
  public async deleteProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const project = await Project.findById(id);

      if (!project) {
        res.status(404).json(ApiResponse.error('Projeto não encontrado', 404));
        return;
      }

      // Exclusão lógica (alterando isActive para false)
      project.isActive = false;
      await project.save();

      // Ou exclusão física
      // await Project.findByIdAndDelete(id);

      // Invalidar cache
      await this.cacheService.deletePattern('projects:*');
      await this.cacheService.delete(`project:${project.slug}`);

      res.json(ApiResponse.success(null, 'Projeto excluído com sucesso'));

      this.logger.info(`Projeto excluído: ${project.title} (${project._id})`);
    } catch (error) {
      this.logger.error('Erro ao excluir projeto:', error);
      next(error);
    }
  }

  /**
   * Alternar status de destaque (featured)
   * PATCH /api/admin/projects/:id/featured
   */
  public async toggleFeatured(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const project = await Project.findById(id);

      if (!project) {
        res.status(404).json(ApiResponse.error('Projeto não encontrado', 404));
        return;
      }

      project.featured = !project.featured;
      await project.save();

      // Invalidar cache
      await this.cacheService.deletePattern('projects:*');
      await this.cacheService.delete(`project:${project.slug}`);

      res.json(
        ApiResponse.success(
          { featured: project.featured },
          'Status de destaque atualizado'
        )
      );
    } catch (error) {
      this.logger.error('Erro ao alternar status de destaque:', error);
      next(error);
    }
  }
}

export const projectController = new ProjectController();
