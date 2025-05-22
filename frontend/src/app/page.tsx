'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronDown, Code, Star, Target, Users, TrendingUp, Award,
  Github, Linkedin, Mail, ArrowRight, Zap, Globe, Briefcase, Heart
} from 'lucide-react';
import Link from 'next/link';
import { useParticles } from '@/hooks/useParticles';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useAnimation } from '@/hooks';

// Optimized Typed Text Component
const TypedText: React.FC<{ texts: string[]; speed?: number }> = ({ texts, speed = 100 }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const timeout = setTimeout(() => {
      const fullText = texts[currentTextIndex];
      
      if (isDeleting) {
        setCurrentText(prev => prev.slice(0, -1));
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      } else {
        setCurrentText(fullText.slice(0, currentText.length + 1));
        if (currentText === fullText) {
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, 1500);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts, speed, isPaused]);

  return <span className="border-r-2 border-primary-400 animate-pulse">{currentText}</span>;
};

// Featured Project Card
const FeaturedProject: React.FC<{ 
  title: string;
  description: string;
  tags: string[];
  image: string;
  link: string;
  delay?: number;
}> = ({ title, description, tags, image, link, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-primary-500/50 transition-all duration-300"
    >
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <Link href={link} className="flex items-center text-primary-400 hover:text-primary-300 transition-colors text-sm">
          <span>Ver Projeto</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </motion.div>
  );
};

// Skill Card Component
const SkillCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  level: number;
  delay?: number;
}> = ({ icon, title, description, level, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-primary-500/50 transition-all duration-300"
    >
      <div className="text-3xl text-primary-400 mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      
      <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          transition={{ duration: 1, delay: delay + 0.3 }}
          className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
        />
      </div>
      <div className="text-right text-xs text-gray-400">{level}%</div>
    </motion.div>
  );
};

export default function HomePage() {
  const canvasRef = useParticles(80);
  const [heroRef, heroInView] = useIntersectionObserver({ threshold: 0.3 });
  const [statsRef, statsInView] = useIntersectionObserver({ threshold: 0.3 });
  const [projectsRef, projectsInView] = useIntersectionObserver({ threshold: 0.3 });
  const [skillsRef, skillsInView] = useIntersectionObserver({ threshold: 0.3 });

  // Featured projects data
  const featuredProjects = [
    {
      title: "E-commerce Platform",
      description: "Plataforma completa de e-commerce com React, Node.js e PostgreSQL",
      tags: ["React", "Node.js", "PostgreSQL"],
      image: "/api/placeholder/800/600",
      link: "/projects/ecommerce-platform"
    },
    {
      title: "AI Chat Assistant",
      description: "Assistente de chat inteligente usando OpenAI GPT e React Native",
      tags: ["React Native", "OpenAI", "Firebase"],
      image: "/api/placeholder/800/600",
      link: "/projects/ai-chat-assistant"
    },
    {
      title: "Portfolio Dashboard",
      description: "Dashboard administrativo para gerenciamento de portfolio",
      tags: ["Next.js", "TypeScript", "MongoDB"],
      image: "/api/placeholder/800/600",
      link: "/projects/portfolio-dashboard"
    }
  ];

  // Key skills data
  const keySkills = [
    {
      icon: <Code />,
      title: "Frontend Development",
      description: "Criação de interfaces modernas e responsivas com React, Next.js e TypeScript",
      level: 95
    },
    {
      icon: <Zap />,
      title: "Backend Development",
      description: "APIs robustas e escaláveis com Node.js, Express e bancos de dados relacionais/NoSQL",
      level: 90
    },
    {
      icon: <Briefcase />,
      title: "Mobile Development",
      description: "Desenvolvimento de aplicativos mobile com React Native para iOS e Android",
      level: 85
    },
    {
      icon: <Globe />,
      title: "DevOps & Cloud",
      description: "Implementação de CI/CD, Docker, e soluções em nuvem com AWS e Firebase",
      level: 80
    }
  ];

  // Stats data
  const stats = [
    { icon: <Target className="w-8 h-8" />, value: '50+', label: 'Projetos Concluídos' },
    { icon: <Users className="w-8 h-8" />, value: '25+', label: 'Clientes Satisfeitos' },
    { icon: <Award className="w-8 h-8" />, value: '8+', label: 'Certificações' },
    { icon: <TrendingUp className="w-8 h-8" />, value: '5+', label: 'Anos de Experiência' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Canvas de Partículas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
        aria-hidden="true"
      />

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6 pt-20"
      >
        {/* Background Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 text-center max-w-6xl mx-auto">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 p-1"
              >
                <div className="w-full h-full bg-gray-900 rounded-full" />
              </motion.div>
              <img
                src="/api/placeholder/200/200"
                alt="Profile"
                className="relative w-48 h-48 rounded-full object-cover border-4 border-white/20 shadow-2xl"
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-6"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 bg-clip-text text-transparent">
                Luiz Felippe
              </span>
              <br />
              <span className="text-white">Engenheiro de Software</span>
            </h1>
          </motion.div>

          {/* Typed Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-8"
          >
            <p className="text-2xl md:text-3xl text-gray-300 mb-4">
              Eu sou{' '}
              <span className="text-primary-400 font-mono">
                <TypedText
                  texts={[
                    'Desenvolvedor Full Stack',
                    'Especialista em Inteligência Artificial',
                    'Desenvolvedor de Software',
                    'Criador de Experiências Digitais'
                  ]}
                />
              </span>
            </p>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Engenheiro de Software Full-Stack com foco em aplicações modernas usando React, TypeScript e Node.js. 
              Especializado em UI futurista, integrações com Firebase, IA com OpenAI, bots inteligentes, 
              e bancos de dados performáticos.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            <Link href="/projects">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full font-semibold text-lg"
              >
                Ver Projetos
              </motion.button>
            </Link>

            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-primary-500 rounded-full font-semibold text-lg hover:bg-primary-500/10"
              >
                Entre em Contato
              </motion.button>
            </Link>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex justify-center space-x-4 mt-20"
          >
            {[
              { icon: <Github />, href: 'https://github.com', ariaLabel: 'GitHub Profile' },
              { icon: <Linkedin />, href: 'https://linkedin.com', ariaLabel: 'LinkedIn Profile' },
              { icon: <Mail />, href: 'mailto:luizfelippeandrade@outlook.com', ariaLabel: 'Email Contact' },
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                aria-label={social.ariaLabel}
                target={social.href.startsWith('http') ? '_blank' : undefined}
                rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.0 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 mb-10"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center text-gray-400"
            >
              <span className="text-sm mb-2">Scroll para explorar</span>
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section 
        ref={projectsRef}
        className="relative py-20 px-6"
        id="featured-projects"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={projectsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Projetos em Destaque
              </span>
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Uma seleção dos meus projetos mais recentes e relevantes. Cada projeto representa
              uma solução única para um problema específico.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <FeaturedProject 
                key={index}
                {...project}
                delay={index * 0.1}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex justify-center mt-12"
          >
            <Link href="/projects">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-primary-500 rounded-xl text-lg hover:bg-primary-500/10"
              >
                <span>Ver Todos os Projetos</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Key Skills Section */}
      <section 
        ref={skillsRef}
        className="relative py-20 px-6 bg-black/20"
        id="skills"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={skillsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Principais Habilidades
              </span>
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Tecnologias e ferramentas que domino para criar soluções digitais completas e eficientes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keySkills.map((skill, index) => (
              <SkillCard 
                key={index}
                {...skill}
                delay={index * 0.1}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex justify-center mt-12"
          >
            <Link href="/skills">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-primary-500 rounded-xl text-lg hover:bg-primary-500/10"
              >
                <span>Ver Todas as Habilidades</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Statistics */}
      <section 
        ref={statsRef}
        className="relative py-20 px-6"
        id="stats"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Números que Impressionam
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="text-center p-6 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10"
              >
                <div className="text-primary-400 mb-4 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center"
          >
            <div className="flex justify-center mb-6">
              <Heart className="w-12 h-12 text-red-400 fill-current" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Vamos Trabalhar Juntos?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Estou sempre aberto a novos projetos e oportunidades desafiadoras. 
              Entre em contato para discutirmos sua ideia!
            </p>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-semibold text-white text-lg"
              >
                Entre em Contato
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}