'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronDown, Code, Star, Target, Users, TrendingUp, Award,
  Github, Linkedin, Mail
} from 'lucide-react';
import { useParticles } from '@/hooks/useParticles';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

// Componente de Texto Digitado
const TypedText: React.FC<{ texts: string[]; speed?: number }> = ({ texts, speed = 100 }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
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
          setTimeout(() => setIsDeleting(true), 1500);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts, speed]);

  return <span className="border-r-2 border-primary-400 animate-pulse">{currentText}</span>;
};

export default function HomePage() {
  const canvasRef = useParticles(80);
  const [statsRef, statsInView] = useIntersectionObserver({ threshold: 0.3 });

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
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Efeitos de fundo */}
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

          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-6"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 bg-clip-text text-transparent">
                Full Stack
              </span>
              <br />
              <span className="text-white">Developer</span>
            </h1>
          </motion.div>

          {/* Texto Digitado */}
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
                    'Especialista em Inteligência Artificial e Bots',
                    'Desenvolvedor de Software',
                    'Criador de Experiências'
                  ]}
                />
              </span>
            </p>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
               Engenheiro de Software Full-Stack com foco em aplicações modernas usando React, TypeScript e Node.js. Especializado em UI futurista, integrações com Firebase, IA com OpenAI, bots inteligentes, autenticação OAuth, e bancos de dados performáticos (MySQL, Firestore). Experiência com deploy em nuvem, segurança avançada e design imersivo com animações e partículas.
            </p>
          </motion.div>

          {/* Botões */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full font-semibold text-lg"
            >
              Ver Projetos
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-primary-500 rounded-full font-semibold text-lg hover:bg-primary-500/10"
            >
              Download CV
            </motion.button>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex justify-center space-x-4 mt-20"
          >
            {[
              { icon: <Github />, href: '#' },
              { icon: <Linkedin />, href: '#' },
              { icon: <Mail />, href: '#' },
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
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

      {/* Estatísticas */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            ref={statsRef}
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
    </div>
  );
}
