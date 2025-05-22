'use client';
import React, { ReactElement, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, Smartphone, Database, Cloud, Cpu, Palette,
  Star, Award, Calendar, ExternalLink, Download,
  Filter, Search, Grid, List, TrendingUp, Target
} from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { FaReact, FaNodeJs, FaDocker, FaPython, FaFigma, FaDatabase, FaMobileAlt } from 'react-icons/fa';
import { SiTypescript, SiTensorflow, SiPostgresql } from 'react-icons/si';


interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  experience: string;
  icon: ReactElement;
  color: string;
  projects: number;
  description: string;
}

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
  image: string;
  skills: string[];
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  featured: boolean;
}

export default function SkillsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('level');
  
  const [skillsRef, skillsInView] = useIntersectionObserver({ threshold: 0.3 });
  const [certsRef, certsInView] = useIntersectionObserver({ threshold: 0.3 });

  const skillCategories = [
    { id: 'all', name: 'Todas', icon: <Target />, color: '#8B5CF6' },
    { id: 'frontend', name: 'Frontend', icon: <Code />, color: '#61DAFB' },
    { id: 'backend', name: 'Backend', icon: <Database />, color: '#339933' },
    { id: 'mobile', name: 'Mobile', icon: <Smartphone />, color: '#FF6B6B' },
    { id: 'devops', name: 'DevOps', icon: <Cloud />, color: '#FF9900' },
    { id: 'ai', name: 'IA & ML', icon: <Cpu />, color: '#FF6B35' },
    { id: 'design', name: 'Design', icon: <Palette />, color: '#FF69B4' }
  ];

  const skills: Skill[] = [
    {
      id: '1',
      name: 'React',
      category: 'frontend',
      level: 95,
      experience: '4 anos',
       icon: <FaReact color="#61DAFB" />,
      color: '#61DAFB',
      projects: 25,
      description: 'Framework principal para desenvolvimento frontend, incluindo hooks avançados e otimizações.'
    },
    {
      id: '2',
      name: 'Node.js',
      category: 'backend',
      level: 90,
      experience: '4 anos',
       icon: <FaNodeJs color="#339933" />,
      color: '#339933',
      projects: 20,
      description: 'Runtime JavaScript para backend, APIs RESTful e microserviços escaláveis.'
    },
    {
      id: '3',
      name: 'TypeScript',
      category: 'frontend',
      level: 88,
      experience: '3 anos',
      icon: <SiTypescript color="#3178C6" />,
      color: '#3178C6',
      projects: 22,
      description: 'Superset do JavaScript para desenvolvimento type-safe e mais produtivo.'
    },
    {
      id: '4',
      name: 'Python',
      category: 'backend',
      level: 85,
      experience: '3 anos',
     icon: <FaPython color="#3776AB" />, 
      color: '#3776AB',
      projects: 15,
      description: 'Linguagem versátil para backend, automação e machine learning.'
    },
    {
      id: '5',
      name: 'React Native',
      category: 'mobile',
      level: 78,
      experience: '2 anos',
      icon: <FaMobileAlt color="#61DAFB" />,
      color: '#61DAFB',
      projects: 8,
      description: 'Framework para desenvolvimento mobile cross-platform iOS e Android.'
    },
    {
      id: '6',
      name: 'Docker',
      category: 'devops',
      level: 82,
      experience: '3 anos',
    icon: <FaDocker color="#2496ED" />,
      color: '#2496ED',
      projects: 18,
      description: 'Containerização de aplicações para deployment consistente e escalável.'
    },
    {
      id: '7',
      name: 'PostgreSQL',
      category: 'backend',
      level: 80,
      experience: '3 anos',
      icon: <SiPostgresql color="#336791" />,
      color: '#336791',
      projects: 16,
      description: 'Banco de dados relacional avançado para aplicações enterprise.'
    },
    {
      id: '8',
      name: 'TensorFlow',
      category: 'ai',
      level: 75,
      experience: '2 anos',
      icon: <SiTensorflow color="#FF6F00" />,
      color: '#FF6F00',
      projects: 6,
      description: 'Framework de machine learning para desenvolvimento de modelos de IA.'
    },
    {
      id: '9',
      name: 'Figma',
      category: 'design',
      level: 70,
      experience: '2 anos',
        icon: <FaFigma color="#F24E1E" />,
      color: '#F24E1E',
      projects: 12,
      description: 'Ferramenta de design para criação de interfaces e protótipos interativos.'
    }
  ];

  const certificates: Certificate[] = [
    {
      id: '1',
      title: 'AWS Solutions Architect - Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2024-01-15',
      expiryDate: '2027-01-15',
      credentialUrl: 'https://aws.amazon.com/verify/cert123',
      image: '/api/placeholder/300/200',
      skills: ['AWS', 'Cloud Architecture', 'DevOps'],
      level: 'advanced',
      featured: true
    },
    {
      id: '2',
      title: 'Meta React Native Specialization',
      issuer: 'Meta (Facebook)',
      issueDate: '2023-11-20',
      credentialUrl: 'https://coursera.org/verify/cert456',
      image: '/api/placeholder/300/200',
      skills: ['React Native', 'Mobile Development', 'JavaScript'],
      level: 'intermediate',
      featured: true
    },
    {
      id: '3',
      title: 'Google TensorFlow Developer Certificate',
      issuer: 'Google',
      issueDate: '2023-08-10',
      expiryDate: '2026-08-10',
      credentialUrl: 'https://tensorflow.org/certificate/verify789',
      image: '/api/placeholder/300/200',
      skills: ['TensorFlow', 'Machine Learning', 'Python'],
      level: 'advanced',
      featured: true
    },
    {
      id: '4',
      title: 'MongoDB Certified Developer',
      issuer: 'MongoDB University',
      issueDate: '2023-06-05',
      credentialUrl: 'https://university.mongodb.com/verify/abc123',
      image: '/api/placeholder/300/200',
      skills: ['MongoDB', 'NoSQL', 'Database Design'],
      level: 'intermediate',
      featured: false
    },
    {
      id: '5',
      title: 'Docker Certified Associate',
      issuer: 'Docker Inc.',
      issueDate: '2023-03-22',
      expiryDate: '2025-03-22',
      credentialUrl: 'https://docker.com/verify/def456',
      image: '/api/placeholder/300/200',
      skills: ['Docker', 'Containerization', 'DevOps'],
      level: 'intermediate',
      featured: false
    },
    {
      id: '6',
      title: 'Scrum Master Certified',
      issuer: 'Scrum Alliance',
      issueDate: '2022-12-15',
      expiryDate: '2024-12-15',
      credentialUrl: 'https://scrumalliance.org/verify/ghi789',
      image: '/api/placeholder/300/200',
      skills: ['Scrum', 'Agile', 'Project Management'],
      level: 'intermediate',
      featured: false
    }
  ];

  const filteredSkills = skills.filter(skill => {
    const matchesCategory = activeCategory === 'all' || skill.category === activeCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    switch (sortBy) {
      case 'level':
        return b.level - a.level;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'projects':
        return b.projects - a.projects;
      default:
        return 0;
    }
  });

  const getLevelLabel = (level: number) => {
    if (level >= 90) return 'Expert';
    if (level >= 80) return 'Avançado';
    if (level >= 60) return 'Intermediário';
    return 'Iniciante';
  };

  const getLevelColor = (level: number) => {
    if (level >= 90) return 'text-green-400';
    if (level >= 80) return 'text-blue-400';
    if (level >= 60) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getCertificateLevelColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'text-purple-400 bg-purple-400/20';
      case 'advanced':
        return 'text-green-400 bg-green-400/20';
      case 'intermediate':
        return 'text-blue-400 bg-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 pt-20">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Skills & Certificações
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Um overview completo das minhas habilidades técnicas e certificações profissionais. 
              Sempre aprendendo e evoluindo com as melhores práticas do mercado.
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-gray-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">{skills.length}</div>
                <div className="text-sm">Tecnologias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-400">{certificates.length}</div>
                <div className="text-sm">Certificações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">5+</div>
                <div className="text-sm">Anos Exp.</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            ref={skillsRef}
            initial={{ opacity: 0, y: 30 }}
            animate={skillsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Habilidades Técnicas
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tecnologias que domino e utilizo no dia a dia para criar soluções inovadoras
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={skillsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {skillCategories.map(category => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                      activeCategory === category.id
                        ? 'bg-primary-500/20 border-2 border-primary-500/30 text-primary-400'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {category.icon}
                    <span className="text-sm font-medium">{category.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Search and Sort */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 w-48"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="level" className="bg-gray-800">Nível</option>
                  <option value="name" className="bg-gray-800">Nome</option>
                  <option value="projects" className="bg-gray-800">Projetos</option>
                </select>

                <div className="flex space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'grid' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
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
                    <List className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills Grid/List */}
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {sortedSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={
                    viewMode === 'grid'
                      ? 'group bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-primary-500/50 transition-all duration-300'
                      : 'group bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:border-primary-500/50 transition-all duration-300 flex items-center'
                  }
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">{skill.icon}</div>
                        <div className={`text-sm font-bold ${getLevelColor(skill.level)}`}>
                          {getLevelLabel(skill.level)}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                        {skill.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {skill.description}
                      </p>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Experiência</span>
                          <span className="text-white">{skill.experience}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Projetos</span>
                          <span className="text-white">{skill.projects}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                          />
                        </div>
                        <div className="text-right text-xs text-gray-400">
                          {skill.level}%
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-2xl">{skill.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                            {skill.name}
                          </h3>
                          <p className="text-gray-400 text-sm">{skill.description}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${getLevelColor(skill.level)} mb-1`}>
                            {getLevelLabel(skill.level)}
                          </div>
                          <div className="text-xs text-gray-400">{skill.experience}</div>
                        </div>
                        <div className="w-24">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.level}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                            />
                          </div>
                          <div className="text-right text-xs text-gray-400 mt-1">
                            {skill.level}%
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Certificates Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            ref={certsRef}
            initial={{ opacity: 0, y: 30 }}
            animate={certsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Certificações Profissionais
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Certificações que validam minha expertise e compromisso com o aprendizado contínuo
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 30 }}
                animate={certsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-primary-500/50 transition-all duration-300"
              >
                {/* Featured Badge */}
                {cert.featured && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-yellow-400 text-xs font-medium">Destaque</span>
                    </div>
                  </div>
                )}

                {/* Certificate Image */}
                <div className="relative">
                  <img
                    src={cert.image}
                    alt={cert.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Level Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCertificateLevelColor(cert.level)}`}>
                      {cert.level}
                    </div>
                  </div>

                  {/* Credential Link */}
                  {cert.credentialUrl && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        className="p-2 bg-black/50 rounded-full backdrop-blur-sm border border-white/20 hover:bg-primary-500/50"
                      >
                        <ExternalLink className="w-4 h-4 text-white" />
                      </motion.a>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                    {cert.title}
                  </h3>
                  <p className="text-secondary-400 font-medium mb-3">{cert.issuer}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {cert.skills.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {cert.skills.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-400">
                        +{cert.skills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-gray-400 text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(cert.issueDate).getFullYear()}</span>
                    </div>
                    {cert.expiryDate && (
                      <div className="text-xs">
                        Expira: {new Date(cert.expiryDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 backdrop-blur-xl rounded-3xl border border-white/10 p-12"
          >
            <TrendingUp className="w-12 h-12 text-primary-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-6">
              Sempre Aprendendo e Evoluindo
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              A tecnologia evolui rapidamente, e eu acompanho essa evolução através de 
              aprendizado contínuo e certificações atualizadas.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-semibold text-white"
              >
                <Download className="w-5 h-5" />
                <span>Download Currículo</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-8 py-4 border-2 border-primary-500 rounded-xl font-semibold text-white hover:bg-primary-500/10"
              >
                <Award className="w-5 h-5" />
                <span>Ver Certificados</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}