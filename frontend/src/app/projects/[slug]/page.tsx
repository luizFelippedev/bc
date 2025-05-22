'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, Github, Calendar, User, Target, CheckCircle,
  Star, Heart, Eye, Share2, Download, ArrowLeft, ChevronLeft,
  ChevronRight, Play, Code, Lightbulb, Trophy, Users
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ProjectDetail {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  status: string;
  featured: boolean;
  technologies: Array<{
    name: string;
    category: string;
    color?: string;
    icon?: string;
  }>;
  media: {
    featuredImage: string;
    gallery: string[];
    videos?: Array<{
      url: string;
      title: string;
      thumbnail: string;
    }>;
  };
  links: {
    live?: string;
    github?: string;
    documentation?: string;
  };
  timeline: {
    startDate: string;
    endDate?: string;
    duration: string;
  };
  team: Array<{
    name: string;
    role: string;
    avatar: string;
  }>;
  challenges: string[];
  solutions: string[];
  results: Array<{
    metric: string;
    value: string;
    description: string;
  }>;
  features: string[];
  testimonials: Array<{
    author: string;
    role: string;
    content: string;
    rating: number;
  }>;
  stats: {
    views: number;
    likes: number;
    shares: number;
  };
  relatedProjects: Array<{
    id: string;
    title: string;
    slug: string;
    featuredImage: string;
    category: string;
  }>;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockProject: ProjectDetail = {
      id: '1',
      title: 'E-commerce Platform',
      slug: 'ecommerce-platform',
      shortDescription: 'Plataforma completa de e-commerce com React, Node.js e PostgreSQL',
      fullDescription: `Este projeto é uma plataforma completa de e-commerce desenvolvida com as mais modernas tecnologias do mercado. O objetivo foi criar uma solução escalável, segura e de alta performance para vendas online.

      A plataforma inclui um painel administrativo completo, sistema de pagamentos integrado, gestão de inventário em tempo real, sistema de reviews e avaliações, chat ao vivo com os clientes, e um sistema de recomendação baseado em IA.

      Durante o desenvolvimento, enfrentamos diversos desafios técnicos interessantes, incluindo otimização de consultas ao banco de dados, implementação de cache distribuído, e integração com múltiplos gateways de pagamento.

      O resultado final foi uma plataforma robusta que suporta milhares de transações simultâneas e oferece uma experiência de usuário excepcional tanto para compradores quanto para vendedores.`,
      category: 'web_app',
      status: 'completed',
      featured: true,
      technologies: [
        { name: 'React', category: 'frontend', color: '#61DAFB' },
        { name: 'Node.js', category: 'backend', color: '#339933' },
        { name: 'PostgreSQL', category: 'database', color: '#336791' },
        { name: 'Redis', category: 'cache', color: '#DC382D' },
        { name: 'Docker', category: 'devops', color: '#2496ED' },
        { name: 'AWS', category: 'cloud', color: '#FF9900' },
        { name: 'Stripe', category: 'payment', color: '#635BFF' },
        { name: 'Socket.io', category: 'realtime', color: '#010101' }
      ],
      media: {
        featuredImage: '/api/placeholder/1200/800',
        gallery: [
          '/api/placeholder/800/600',
          '/api/placeholder/800/600',
          '/api/placeholder/800/600',
          '/api/placeholder/800/600',
          '/api/placeholder/800/600'
        ],
        videos: [
          {
            url: 'https://example.com/demo.mp4',
            title: 'Demo da Aplicação',
            thumbnail: '/api/placeholder/400/300'
          }
        ]
      },
      links: {
        live: 'https://ecommerce-demo.com',
        github: 'https://github.com/user/ecommerce-platform',
        documentation: 'https://docs.ecommerce-demo.com'
      },
      timeline: {
        startDate: '2024-01-15',
        endDate: '2024-05-30',
        duration: '4 meses'
      },
      team: [
        {
          name: 'João Silva',
          role: 'Full Stack Developer',
          avatar: '/api/placeholder/100/100'
        },
        {
          name: 'Maria Santos',
          role: 'UI/UX Designer',
          avatar: '/api/placeholder/100/100'
        },
        {
          name: 'Pedro Costa',
          role: 'DevOps Engineer',
          avatar: '/api/placeholder/100/100'
        }
      ],
      challenges: [
        'Escalabilidade para suportar alto volume de transações simultâneas',
        'Integração com múltiplos gateways de pagamento internacionais',
        'Implementação de sistema de cache distribuído para melhor performance',
        'Desenvolvimento de sistema de recomendação usando machine learning',
        'Garantir segurança PCI DSS para processamento de pagamentos'
      ],
      solutions: [
        'Implementação de microserviços com load balancing automático',
        'Criação de adapter pattern para integração unificada de pagamentos',
        'Uso de Redis Cluster para cache distribuído e sessions',
        'Desenvolvimento de algoritmo colaborativo usando TensorFlow.js',
        'Implementação de criptografia end-to-end e auditoria completa'
      ],
      results: [
        {
          metric: 'Performance',
          value: '99.9%',
          description: 'Uptime médio da aplicação'
        },
        {
          metric: 'Conversão',
          value: '+45%',
          description: 'Aumento na taxa de conversão'
        },
        {
          metric: 'Velocidade',
          value: '1.2s',
          description: 'Tempo médio de carregamento'
        },
        {
          metric: 'Satisfação',
          value: '4.8/5',
          description: 'Avaliação dos usuários'
        }
      ],
      features: [
        'Catálogo de produtos com busca avançada e filtros',
        'Carrinho de compras com cálculo de frete em tempo real',
        'Sistema de pagamento com Stripe, PayPal e PIX',
        'Painel administrativo com analytics em tempo real',
        'Sistema de reviews e avaliações',
        'Chat ao vivo com suporte',
        'Notificações push em tempo real',
        'Sistema de cupons e promoções',
        'Gestão de inventário automatizada',
        'Relatórios detalhados de vendas'
      ],
      testimonials: [
        {
          author: 'Ana Carolina',
          role: 'Gerente de E-commerce',
          content: 'A plataforma superou nossas expectativas. A interface é intuitiva e as funcionalidades são exatamente o que precisávamos.',
          rating: 5
        },
        {
          author: 'Carlos Mendes',
          role: 'CTO',
          content: 'Excelente arquitetura e performance. A equipe demonstrou grande expertise técnica.',
          rating: 5
        }
      ],
      stats: {
        views: 1250,
        likes: 89,
        shares: 23
      },
      relatedProjects: [
        {
          id: '2',
          title: 'AI Chat Assistant',
          slug: 'ai-chat-assistant',
          featuredImage: '/api/placeholder/300/200',
          category: 'mobile_app'
        },
        {
          id: '3',
          title: 'Portfolio Dashboard',
          slug: 'portfolio-dashboard',
          featuredImage: '/api/placeholder/300/200',
          category: 'web_app'
        },
        {
          id: '4',
          title: 'Blockchain Voting',
          slug: 'blockchain-voting',
          featuredImage: '/api/placeholder/300/200',
          category: 'blockchain'
        }
      ]
    };

    setProject(mockProject);
  }, [params.slug]);

  const nextImage = () => {
    if (project) {
      setCurrentImageIndex((prev) => 
        prev === project.media.gallery.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (project) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? project.media.gallery.length - 1 : prev - 1
      );
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Aqui você implementaria a lógica para enviar o like para o backend
  };

  const handleShare = async () => {
    if (navigator.share && project) {
      try {
        await navigator.share({
          title: project.title,
          text: project.shortDescription,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Carregando projeto...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 pt-20">
      {/* Back Button */}
      <div className="fixed top-24 left-6 z-50">
        <Link
          href="/projects"
          className="flex items-center space-x-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 text-white hover:bg-black/70 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Project Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                {project.featured && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-yellow-400 text-xs font-medium">Projeto Destaque</span>
                  </div>
                )}
                <div className="px-2 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full">
                  <span className="text-primary-400 text-xs font-medium capitalize">{project.category.replace('_', ' ')}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  {project.title}
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {project.shortDescription}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                {project.links.live && (
                  <motion.a
                    href={project.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-semibold text-white"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Ver Projeto</span>
                  </motion.a>
                )}

                {project.links.github && (
                  <motion.a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-6 py-3 border-2 border-white/20 rounded-xl font-semibold text-white hover:bg-white/10"
                  >
                    <Github className="w-5 h-5" />
                    <span>Código Fonte</span>
                  </motion.a>
                )}

                <motion.button
                  onClick={handleLike}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    isLiked 
                      ? 'bg-red-500/20 border-2 border-red-500/30 text-red-400' 
                      : 'border-2 border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{project.stats.likes + (isLiked ? 1 : 0)}</span>
                </motion.button>

                <motion.button
                  onClick={handleShare}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-6 py-3 border-2 border-white/20 rounded-xl font-semibold text-white hover:bg-white/10"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Compartilhar</span>
                </motion.button>
              </div>

              {/* Project Stats */}
              <div className="flex items-center space-x-6 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>{project.stats.views} visualizações</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{project.timeline.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{project.team.length} membros</span>
                </div>
              </div>
            </motion.div>

            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={project.media.gallery[currentImageIndex]}
                  alt={`${project.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-96 object-cover"
                />
                
                {/* Navigation Arrows */}
                {project.media.gallery.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full backdrop-blur-sm border border-white/20 hover:bg-black/70"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full backdrop-blur-sm border border-white/20 hover:bg-black/70"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 rounded-full backdrop-blur-sm border border-white/20">
                  <span className="text-white text-sm">
                    {currentImageIndex + 1} / {project.media.gallery.length}
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {project.media.gallery.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {project.media.gallery.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-primary-500' 
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Tecnologias Utilizadas
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {project.technologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center"
              >
                <div className="text-2xl mb-2" style={{ color: tech.color }}>
                  {tech.icon || '⚡'}
                </div>
                <div className="text-white font-medium text-sm">{tech.name}</div>
                <div className="text-gray-400 text-xs capitalize">{tech.category}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Description */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Sobre o Projeto</h2>
            <div className="text-gray-300 leading-relaxed space-y-4">
              {project.fullDescription.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph.trim()}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Resultados Alcançados
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {project.results.map((result, index) => (
              <motion.div
                key={result.metric}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-primary-500/10 to-secondary-500/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center"
              >
                <div className="text-3xl font-bold text-primary-400 mb-2">{result.value}</div>
                <div className="text-white font-semibold mb-1">{result.metric}</div>
                <div className="text-gray-400 text-sm">{result.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {project.team.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  Equipe do Projeto
                </span>
              </h2>
            </motion.div>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl">
                {project.team.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-primary-500/30"
                    />
                    <h3 className="text-white font-semibold mb-1">{member.name}</h3>
                    <p className="text-gray-400 text-sm">{member.role}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Related Projects */}
      {project.relatedProjects.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  Projetos Relacionados
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {project.relatedProjects.map((relatedProject, index) => (
                <motion.div
                  key={relatedProject.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link
                    href={`/projects/${relatedProject.slug}`}
                    className="group block bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-primary-500/50 transition-all duration-300"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={relatedProject.featuredImage}
                        alt={relatedProject.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-white font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                        {relatedProject.title}
                      </h3>
                      <p className="text-gray-400 text-sm capitalize">
                        {relatedProject.category.replace('_', ' ')}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}