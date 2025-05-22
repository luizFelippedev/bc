'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Grid, List, Star, Calendar,
  ExternalLink, Github, Eye, Heart, ArrowRight,
  Code, Smartphone, Monitor, Cpu, Zap, Globe
} from 'lucide-react';
import { useData } from '@/contexts';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  technologies: Array<{
    name: string;
    category: string;
    color?: string;
  }>;
  featuredImage: string;
  links: {
    live?: string;
    github?: string;
  };
  status: string;
  featured: boolean;
  views: number;
  likes: number;
  startDate: string;
}

export default function ProjectsPage() {
  const { projects } = useData();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');

  // Mock data fixo para evitar re-renders desnecessários
  const mockProjects: Project[] = useMemo(() => [
    {
      id: '1',
      title: 'E-commerce Platform',
      slug: 'ecommerce-platform',
      shortDescription: 'Plataforma completa de e-commerce com React, Node.js e PostgreSQL',
      category: 'web_app',
      technologies: [
        { name: 'React', category: 'frontend', color: '#61DAFB' },
        { name: 'Node.js', category: 'backend', color: '#339933' },
        { name: 'PostgreSQL', category: 'database', color: '#336791' }
      ],
      featuredImage: '/api/placeholder/800/600',
      links: {
        live: 'https://example.com',
        github: 'https://github.com/user/project'
      },
      status: 'completed',
      featured: true,
      views: 1250,
      likes: 89,
      startDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'AI Chat Assistant',
      slug: 'ai-chat-assistant',
      shortDescription: 'Assistente de chat inteligente usando OpenAI GPT e React Native',
      category: 'mobile_app',
      technologies: [
        { name: 'React Native', category: 'mobile', color: '#61DAFB' },
        { name: 'OpenAI', category: 'ai', color: '#412991' },
        { name: 'Firebase', category: 'backend', color: '#FFCA28' }
      ],
      featuredImage: '/api/placeholder/800/600',
      links: {
        github: 'https://github.com/user/ai-chat'
      },
      status: 'in_progress',
      featured: true,
      views: 980,
      likes: 67,
      startDate: '2024-02-01'
    },
    {
      id: '3',
      title: 'Portfolio Dashboard',
      slug: 'portfolio-dashboard',
      shortDescription: 'Dashboard administrativo para gerenciamento de portfolio com analytics',
      category: 'web_app',
      technologies: [
        { name: 'Next.js', category: 'frontend', color: '#000000' },
        { name: 'TypeScript', category: 'frontend', color: '#3178C6' },
        { name: 'MongoDB', category: 'database', color: '#47A248' }
      ],
      featuredImage: '/api/placeholder/800/600',
      links: {
        live: 'https://dashboard.example.com',
        github: 'https://github.com/user/dashboard'
      },
      status: 'completed',
      featured: false,
      views: 756,
      likes: 43,
      startDate: '2023-11-10'
    },
    {
      id: '4',
      title: 'Blockchain Voting System',
      slug: 'blockchain-voting',
      shortDescription: 'Sistema de votação descentralizado usando Ethereum e Solidity',
      category: 'blockchain',
      technologies: [
        { name: 'Solidity', category: 'blockchain', color: '#363636' },
        { name: 'Web3.js', category: 'frontend', color: '#F16822' },
        { name: 'Ethereum', category: 'blockchain', color: '#627EEA' }
      ],
      featuredImage: '/api/placeholder/800/600',
      links: {
        github: 'https://github.com/user/voting-system'
      },
      status: 'concept',
      featured: false,
      views: 523,
      likes: 32,
      startDate: '2024-03-01'
    }
  ], []);

  // Usa useMemo para evitar recálculo desnecessário
  const currentProjects = useMemo(() => {
    return projects && projects.length > 0 ? projects : mockProjects;
  }, [projects, mockProjects]);

  const categories = useMemo(() => [
    { id: 'all', name: 'Todos', icon: <Globe /> },
    { id: 'web_app', name: 'Web Apps', icon: <Monitor /> },
    { id: 'mobile_app', name: 'Mobile', icon: <Smartphone /> },
    { id: 'ai_ml', name: 'IA & ML', icon: <Cpu /> },
    { id: 'blockchain', name: 'Blockchain', icon: <Zap /> },
    { id: 'api', name: 'APIs', icon: <Code /> }
  ], []);

  const statusOptions = useMemo(() => [
    { id: 'all', name: 'Todos os Status' },
    { id: 'completed', name: 'Concluído' },
    { id: 'in_progress', name: 'Em Desenvolvimento' },
    { id: 'concept', name: 'Conceito' }
  ], []);

  const sortOptions = useMemo(() => [
    { id: 'recent', name: 'Mais Recentes' },
    { id: 'popular', name: 'Mais Populares' },
    { id: 'featured', name: 'Destaques' },
    { id: 'alphabetical', name: 'A-Z' }
  ], []);

  // UseEffect otimizado
  useEffect(() => {
    let filtered = [...currentProjects];

    // Filtrar por busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        project.shortDescription.toLowerCase().includes(searchLower) ||
        project.technologies.some(tech =>
          tech.name.toLowerCase().includes(searchLower)
        )
      );
    }

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Filtrar por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    // Ordenar
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // recent
        filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }

    setFilteredProjects(filtered);
  }, [currentProjects, searchTerm, selectedCategory, selectedStatus, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/20';
      case 'in_progress':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'concept':
        return 'text-blue-400 bg-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em Desenvolvimento';
      case 'concept':
        return 'Conceito';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 pt-20">
      {/* Header */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Meus Projetos
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Uma coleção dos meus trabalhos mais recentes, desde aplicações web modernas
              até soluções de IA inovadoras. Cada projeto representa um desafio único e
              uma oportunidade de crescimento.
            </p>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id} className="bg-gray-800">
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statusOptions.map(status => (
                  <option key={status.id} value={status.id} className="bg-gray-800">
                    {status.name}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id} className="bg-gray-800">
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-gray-400">
                Encontrados {filteredProjects.length} projeto(s)
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid/List */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                  : 'space-y-6'
              }
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={
                    viewMode === 'grid'
                      ? 'group bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-primary-500/50 transition-all duration-300'
                      : 'group bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-primary-500/50 transition-all duration-300 flex'
                  }
                >
                  {/* Image */}
                  <div className={viewMode === 'grid' ? 'relative overflow-hidden' : 'relative overflow-hidden w-64 flex-shrink-0'}>
                    <img
                      src={project.featuredImage}
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-yellow-400 text-xs font-medium">Destaque</span>
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {project.links.live && (
                        <motion.a
                          href={project.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          className="p-2 bg-black/50 rounded-full backdrop-blur-sm border border-white/20 hover:bg-primary-500/50"
                        >
                          <ExternalLink className="w-4 h-4 text-white" />
                        </motion.a>
                      )}
                      {project.links.github && (
                        <motion.a
                          href={project.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          className="p-2 bg-black/50 rounded-full backdrop-blur-sm border border-white/20 hover:bg-primary-500/50"
                        >
                          <Github className="w-4 h-4 text-white" />
                        </motion.a>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {project.shortDescription}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-300"
                          style={{ borderColor: tech.color + '40', color: tech.color }}
                        >
                          {tech.name}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-400">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-gray-400 text-sm mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{project.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{project.likes}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.startDate).getFullYear()}</span>
                      </div>
                    </div>

                    {/* View Project Link */}
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      <span>Ver Projeto</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-gray-400 text-lg mb-4">
                Nenhum projeto encontrado com os filtros selecionados.
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                className="px-6 py-3 bg-primary-600 rounded-xl text-white font-semibold hover:bg-primary-700"
              >
                Limpar Filtros
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}