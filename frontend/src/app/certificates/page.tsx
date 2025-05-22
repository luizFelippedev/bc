'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Calendar, ExternalLink, Download, Search, Filter,
  Star, CheckCircle, Clock, Globe, Building, User,
  Grid, List, SortAsc, Eye, Share2
} from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface Certificate {
  id: string;
  title: string;
  issuer: {
    name: string;
    logo: string;
    website?: string;
  };
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  verificationUrl?: string;
  image: string;
  description: string;
  skills: string[];
  level: 'foundational' | 'associate' | 'professional' | 'expert' | 'master';
  type: 'technical' | 'business' | 'language' | 'academic' | 'professional';
  featured: boolean;
  verified: boolean;
  courseHours?: number;
  examScore?: number;
  passingScore?: number;
}

export default function CertificatesPage() {
  const [certificates] = useState<Certificate[]>([
    {
      id: '1',
      title: 'AWS Solutions Architect - Associate',
      issuer: {
        name: 'Amazon Web Services',
        logo: '/api/placeholder/80/80',
        website: 'https://aws.amazon.com'
      },
      issueDate: '2024-01-15',
      expiryDate: '2027-01-15',
      credentialId: 'AWS-SAA-2024-001',
      credentialUrl: 'https://aws.amazon.com/verification/cert123',
      verificationUrl: 'https://aws.amazon.com/training/certification/saa/',
      image: '/api/placeholder/400/300',
      description: 'Certificação que valida conhecimentos técnicos para projetar e implementar sistemas distribuídos escaláveis, altamente disponíveis e tolerantes a falhas na AWS.',
      skills: ['AWS', 'Cloud Architecture', 'S3', 'EC2', 'VPC', 'IAM', 'RDS', 'Lambda'],
      level: 'associate',
      type: 'technical',
      featured: true,
      verified: true,
      courseHours: 40,
      examScore: 850,
      passingScore: 720
    },
    {
      id: '2',
      title: 'Meta React Native Specialization',
      issuer: {
        name: 'Meta (Facebook)',
        logo: '/api/placeholder/80/80',
        website: 'https://developers.facebook.com'
      },
      issueDate: '2023-11-20',
      credentialUrl: 'https://coursera.org/verify/specialization/ABC123',
      image: '/api/placeholder/400/300',
      description: 'Especialização completa em desenvolvimento mobile com React Native, cobrindo desde conceitos básicos até técnicas avançadas de otimização e deployment.',
      skills: ['React Native', 'Mobile Development', 'JavaScript', 'iOS', 'Android', 'Redux'],
      level: 'professional',
      type: 'technical',
      featured: true,
      verified: true,
      courseHours: 120
    },
    {
      id: '3',
      title: 'Google TensorFlow Developer Certificate',
      issuer: {
        name: 'Google',
        logo: '/api/placeholder/80/80',
        website: 'https://tensorflow.org'
      },
      issueDate: '2023-08-10',
      expiryDate: '2026-08-10',
      credentialId: 'TF-DEV-2023-456',
      credentialUrl: 'https://tensorflow.org/certificate/verify/DEF456',
      verificationUrl: 'https://www.tensorflow.org/certificate',
      image: '/api/placeholder/400/300',
      description: 'Certificação que demonstra proficiência em usar TensorFlow para resolver problemas de machine learning e deep learning em diferentes domínios.',
      skills: ['TensorFlow', 'Machine Learning', 'Python', 'Deep Learning', 'Computer Vision', 'NLP'],
      level: 'professional',
      type: 'technical',
      featured: true,
      verified: true,
      courseHours: 80,
      examScore: 92,
      passingScore: 80
    },
    {
      id: '4',
      title: 'MongoDB Certified Developer Associate',
      issuer: {
        name: 'MongoDB University',
        logo: '/api/placeholder/80/80',
        website: 'https://university.mongodb.com'
      },
      issueDate: '2023-06-05',
      credentialId: 'MONGO-DEV-789',
      credentialUrl: 'https://university.mongodb.com/verify/GHI789',
      image: '/api/placeholder/400/300',
      description: 'Certificação que valida habilidades para projetar, construir e evoluir aplicações usando MongoDB como banco de dados.',
      skills: ['MongoDB', 'NoSQL', 'Database Design', 'Aggregation', 'Indexing', 'Replication'],
      level: 'associate',
      type: 'technical',
      featured: false,
      verified: true,
      courseHours: 60
    },
    {
      id: '5',
      title: 'Docker Certified Associate',
      issuer: {
        name: 'Docker Inc.',
        logo: '/api/placeholder/80/80',
        website: 'https://docker.com'
      },
      issueDate: '2023-03-22',
      expiryDate: '2025-03-22',
      credentialId: 'DCA-2023-321',
      credentialUrl: 'https://docker.com/verify/JKL321',
      image: '/api/placeholder/400/300',
      description: 'Certificação que demonstra competência em containerização, orchestração e gerenciamento de aplicações Docker em ambientes de produção.',
      skills: ['Docker', 'Containerization', 'Docker Compose', 'Swarm', 'DevOps', 'Orchestration'],
      level: 'associate',
      type: 'technical',
      featured: false,
      verified: true,
      examScore: 78,
      passingScore: 70
    },
    {
      id: '6',
      title: 'Certified Scrum Master',
      issuer: {
        name: 'Scrum Alliance',
        logo: '/api/placeholder/80/80',
        website: 'https://scrumalliance.org'
      },
      issueDate: '2022-12-15',
      expiryDate: '2024-12-15',
      credentialId: 'CSM-2022-654',
      credentialUrl: 'https://scrumalliance.org/verify/MNO654',
      image: '/api/placeholder/400/300',
      description: 'Certificação em metodologia ágil Scrum, focando em liderança de equipes, facilitação de cerimônias e remoção de impedimentos.',
      skills: ['Scrum', 'Agile', 'Project Management', 'Team Leadership', 'Sprint Planning'],
      level: 'professional',
      type: 'business',
      featured: false,
      verified: true,
      courseHours: 16
    }
  ]);

  const [filteredCertificates, setFilteredCertificates] = useState(certificates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');

  const [heroRef, heroInView] = useIntersectionObserver({ threshold: 0.3 });

  const levels = [
    { id: 'all', name: 'Todos os Níveis' },
    { id: 'foundational', name: 'Fundacional' },
    { id: 'associate', name: 'Associado' },
    { id: 'professional', name: 'Profissional' },
    { id: 'expert', name: 'Expert' },
    { id: 'master', name: 'Master' }
  ];

  const types = [
    { id: 'all', name: 'Todos os Tipos' },
    { id: 'technical', name: 'Técnico' },
    { id: 'business', name: 'Business' },
    { id: 'academic', name: 'Acadêmico' },
    { id: 'professional', name: 'Profissional' }
  ];

  const statusOptions = [
    { id: 'all', name: 'Todos' },
    { id: 'active', name: 'Ativo' },
    { id: 'expiring', name: 'Expirando' },
    { id: 'expired', name: 'Expirado' }
  ];

  const sortOptions = [
    { id: 'recent', name: 'Mais Recentes' },
    { id: 'name', name: 'Nome A-Z' },
    { id: 'level', name: 'Nível' },
    { id: 'featured', name: 'Destaques' }
  ];

  React.useEffect(() => {
    let filtered = [...certificates];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(cert => cert.level === selectedLevel);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(cert => cert.type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter(cert => {
        if (selectedStatus === 'active') {
          return !cert.expiryDate || new Date(cert.expiryDate) > now;
        } else if (selectedStatus === 'expiring') {
          if (!cert.expiryDate) return false;
          const expiryDate = new Date(cert.expiryDate);
          const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          return expiryDate <= thirtyDaysFromNow && expiryDate > now;
        } else if (selectedStatus === 'expired') {
          return cert.expiryDate && new Date(cert.expiryDate) <= now;
        }
        return true;
      });
    }

    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'level':
        const levelOrder = ['foundational', 'associate', 'professional', 'expert', 'master'];
        filtered.sort((a, b) => levelOrder.indexOf(b.level) - levelOrder.indexOf(a.level));
        break;
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default: // recent
        filtered.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    }

    setFilteredCertificates(filtered);
  }, [searchTerm, selectedLevel, selectedType, selectedStatus, sortBy]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'master':
        return 'text-purple-400 bg-purple-400/20 border-purple-400/30';
      case 'expert':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'professional':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'associate':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'foundational':
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical':
        return '⚡';
      case 'business':
        return '💼';
      case 'academic':
        return '🎓';
      case 'professional':
        return '🏆';
      default:
        return '📜';
    }
  };

  const getExpirationStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (expiry <= now) {
      return { status: 'expired', color: 'text-red-400', label: 'Expirado' };
    } else if (expiry <= thirtyDaysFromNow) {
      return { status: 'expiring', color: 'text-yellow-400', label: 'Expirando em breve' };
    } else {
      return { status: 'active', color: 'text-green-400', label: 'Ativo' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 pt-20">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Certificações
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Minhas certificações profissionais que validam expertise e compromisso com 
              a excelência técnica e aprendizado contínuo.
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-gray-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">{certificates.length}</div>
                <div className="text-sm">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {certificates.filter(c => c.verified).length}
                </div>
                <div className="text-sm">Verificadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {certificates.filter(c => c.featured).length}
                </div>
                <div className="text-sm">Destaques</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar certificações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Level Filter */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {levels.map(level => (
                  <option key={level.id} value={level.id} className="bg-gray-800">
                    {level.name}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {types.map(type => (
                  <option key={type.id} value={type.id} className="bg-gray-800">
                    {type.name}
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

            {/* View Mode and Stats */}
            <div className="flex justify-between items-center">
              <div className="text-gray-400">
                Encontradas {filteredCertificates.length} certificação(ões)
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

      {/* Certificates Grid/List */}
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
              {filteredCertificates.map((cert, index) => (
                <motion.div
                  key={cert.id}
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
                  <div className={viewMode === 'grid' ? 'relative' : 'relative w-64 flex-shrink-0'}>
                    <img
                      src={cert.image}
                      alt={cert.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      {cert.featured && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-yellow-400 text-xs font-medium">Destaque</span>
                        </div>
                      )}
                      {cert.verified && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 text-xs font-medium">Verificado</span>
                        </div>
                      )}
                    </div>

                    {/* Level Badge */}
                    <div className="absolute top-4 right-4">
                      <div className={`px-2 py-1 border rounded-full text-xs font-medium capitalize ${getLevelColor(cert.level)}`}>
                        {cert.level}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {cert.credentialUrl && (
                        <motion.a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          className="p-2 bg-black/50 rounded-full backdrop-blur-sm border border-white/20 hover:bg-primary-500/50"
                        >
                          <ExternalLink className="w-4 h-4 text-white" />
                        </motion.a>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-2 bg-black/50 rounded-full backdrop-blur-sm border border-white/20 hover:bg-primary-500/50"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={cert.issuer.logo}
                          alt={cert.issuer.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="text-xs">
                          <div className="text-gray-400">{cert.issuer.name}</div>
                          <div className="text-primary-400">{getTypeIcon(cert.type)} {cert.type}</div>
                        </div>
                      </div>
                      {cert.expiryDate && (
                        <div className={`text-xs ${getExpirationStatus(cert.expiryDate)?.color}`}>
                          {getExpirationStatus(cert.expiryDate)?.label}
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                      {cert.title}
                    </h3>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {cert.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {cert.skills.slice(0, viewMode === 'grid' ? 3 : 6).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {cert.skills.length > (viewMode === 'grid' ? 3 : 6) && (
                        <span className="px-2 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-400">
                          +{cert.skills.length - (viewMode === 'grid' ? 3 : 6)}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="space-y-2 text-xs text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Emitido:</span>
                        <span>{new Date(cert.issueDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {cert.expiryDate && (
                        <div className="flex items-center justify-between">
                          <span>Expira:</span>
                          <span>{new Date(cert.expiryDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      {cert.examScore && (
                        <div className="flex items-center justify-between">
                          <span>Pontuação:</span>
                          <span>{cert.examScore}/{cert.passingScore}</span>
                        </div>
                      )}
                      {cert.courseHours && (
                        <div className="flex items-center justify-between">
                          <span>Carga Horária:</span>
                          <span>{cert.courseHours}h</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredCertificates.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-4">
                Nenhuma certificação encontrada com os filtros selecionados.
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLevel('all');
                  setSelectedType('all');
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