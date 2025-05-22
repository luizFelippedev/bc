'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, MapPin, Calendar, Mail, Phone, Download,
  Github, Linkedin, Twitter, Globe, Award, BookOpen,
  Briefcase, Heart, Coffee, Code2, Zap, Target, GlassWater,
  Users
} from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useAuth } from '@/contexts';

export default function AboutPage() {
  const [skillsRef, skillsInView] = useIntersectionObserver({ threshold: 0.3 });
  const [timelineRef, timelineInView] = useIntersectionObserver({ threshold: 0.3 });
  const { state: authState } = useAuth();

  const skills = [
    { name: 'JavaScript/TypeScript', level: 95, category: 'Frontend' },
    { name: 'React/Next.js', level: 90, category: 'Frontend' },
    { name: 'Node.js/Express', level: 88, category: 'Backend' },
    { name: 'Python/Django', level: 85, category: 'Backend' },
    { name: 'PostgreSQL/MongoDB', level: 82, category: 'Database' },
    { name: 'AWS/Docker', level: 80, category: 'DevOps' },
    { name: 'AI/Machine Learning', level: 75, category: 'IA' },
    { name: 'React Native', level: 78, category: 'Mobile' }
  ];

  // Corrigido: timeline com datas realistas
  const timeline = [
    {
      year: '2024',
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Solutions',
      description: 'Liderando desenvolvimento de aplicações enterprise com foco em IA e automação.',
      type: 'work'
    },
    {
      year: '2023',
      title: 'AWS Solutions Architect Certification',
      company: 'Amazon Web Services',
      description: 'Certificação avançada em arquitetura de soluções na nuvem.',
      type: 'education'
    },
    {
      year: '2022',
      title: 'Full Stack Developer',
      company: 'StartupTech',
      description: 'Desenvolvimento de plataforma SaaS para gestão empresarial com 100k+ usuários.',
      type: 'work'
    },
    {
      year: '2021',
      title: 'Bacharelado em Engenharia de Software',
      company: 'Unesa',
      description: 'Graduação com foco em Inteligência Artificial e Engenharia de Software.',
      type: 'education'
    },
    {
      year: '2020',
      title: 'Desenvolvedor Junior',
      company: 'Tech Innovations',
      description: 'Início da carreira profissional desenvolvendo aplicações web com React e Node.js.',
      type: 'work'
    }
  ];

  const personalInfo = {
    name: 'Luiz Felippe',
    role: 'Engenheiro De Software',
    location: 'São Paulo, Brasil',
    email: 'luizfelippeandrade@outlook.com',
    phone: '+55 (11) 95232-3645',
    availability: 'Disponível para projetos',
    experience: '5+ anos'
  };

  const interests = [
    { icon: <Code2 />, name: 'Coding', description: 'Apaixonado por criar soluções elegantes' },
    { icon: <GlassWater />, name: 'Coke', description: 'Combustível para longas sessões de código' },
    { icon: <BookOpen />, name: 'Learning', description: 'Sempre aprendendo novas tecnologias' },
    { icon: <Heart />, name: 'Open Source', description: 'Contribuindo para a comunidade' }
  ];

  const achievements = [
    {
      icon: <Award />,
      title: '50+ Projetos Entregues',
      description: 'Projetos web e mobile para diversos clientes'
    },
    {
      icon: <Users />,
      title: '25+ Clientes Satisfeitos',
      description: 'Taxa de satisfação de 98% dos clientes'
    },
    {
      icon: <Code2 />,
      title: '100k+ Linhas de Código',
      description: 'Código limpo e bem documentado'
    },
    {
      icon: <Globe />,
      title: '5+ Países Atendidos',
      description: 'Projetos internacionais de sucesso'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 pt-20">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 p-1"
                >
                  <div className="w-full h-full bg-gray-900 rounded-full" />
                </motion.div>
                <img
                  src="/api/placeholder/300/300"
                  alt="Profile"
                  className="relative w-64 h-64 mx-auto lg:mx-0 rounded-full object-cover border-4 border-white/20"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  {personalInfo.name}
                </span>
              </h1>
              <p className="text-2xl text-gray-300 mb-6">{personalInfo.role}</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-center lg:justify-start space-x-3 text-gray-400">
                  <MapPin className="w-5 h-5" />
                  <span>{personalInfo.location}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3 text-gray-400">
                  <Calendar className="w-5 h-5" />
                  <span>{personalInfo.experience} de experiência</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3 text-gray-400">
                  <Target className="w-5 h-5" />
                  <span>{personalInfo.availability}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-semibold"
                >
                  <Download className="w-5 h-5" />
                  <span>Download CV</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-6 py-3 border-2 border-primary-500 rounded-xl font-semibold hover:bg-primary-500/10"
                >
                  <Mail className="w-5 h-5" />
                  <span>Entre em Contato</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Me */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Sobre Mim
              </span>
            </h2>
            <div className="text-lg text-gray-300 leading-relaxed space-y-4">
              <p>
                Sou um desenvolvedor Full Stack apaixonado por criar experiências digitais excepcionais. 
                Com mais de 5 anos de experiência, especializo-me em React, Node.js e tecnologias de IA.
              </p>
              <p>
                Minha jornada começou com curiosidade sobre como as coisas funcionam digitalmente. 
                Hoje, transformo ideias complexas em soluções elegantes e escaláveis, sempre focando 
                na experiência do usuário e na performance.
              </p>
              <p>
                Quando não estou codificando, você me encontrará explorando novas tecnologias, 
                contribuindo para projetos open source ou compartilhando conhecimento com a comunidade dev.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Conquistas
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center"
              >
                <div className="text-primary-400 mb-4 flex justify-center">
                  {React.cloneElement(achievement.icon, { className: 'w-8 h-8' })}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{achievement.title}</h3>
                <p className="text-gray-400 text-sm">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            ref={skillsRef}
            initial={{ opacity: 0, y: 50 }}
            animate={skillsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Habilidades Técnicas
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -50 }}
                animate={skillsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-semibold">{skill.name}</span>
                  <span className="text-primary-400 text-sm">{skill.category}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={skillsInView ? { width: `${skill.level}%` } : { width: 0 }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full"
                  />
                </div>
                <div className="text-right text-gray-400 text-sm">{skill.level}%</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            ref={timelineRef}
            initial={{ opacity: 0, y: 50 }}
            animate={timelineInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Minha Jornada
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-500 to-secondary-500" />
            
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={timelineInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative flex items-center mb-8 ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      {item.type === 'work' ? (
                        <Briefcase className="w-5 h-5 text-primary-400" />
                      ) : (
                        <Award className="w-5 h-5 text-secondary-400" />
                      )}
                      <span className="text-primary-400 font-bold">{item.year}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-secondary-400 font-medium mb-2">{item.company}</p>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full border-4 border-gray-900" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interests */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Interesses & Hobbies
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {interests.map((interest, index) => (
              <motion.div
                key={interest.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center"
              >
                <div className="text-primary-400 mb-4 flex justify-center">
                  {React.cloneElement(interest.icon, { className: 'w-8 h-8' })}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{interest.name}</h3>
                <p className="text-gray-400 text-sm">{interest.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 backdrop-blur-xl rounded-3xl border border-white/10 p-12"
          >
            <h2 className="text-3xl font-bold mb-6 text-white">
              Vamos Trabalhar Juntos?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Estou sempre interessado em novos projetos e oportunidades desafiadoras.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-semibold"
              >
                <Mail className="w-5 h-5" />
                <span>Enviar Email</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-8 py-4 border-2 border-primary-500 rounded-xl font-semibold hover:bg-primary-500/10"
              >
                <Phone className="w-5 h-5" />
                <span>Agendar Chamada</span>
              </motion.button>
            </div>
            
            <div className="flex justify-center space-x-6 mt-8">
              {[
                { icon: <Github />, href: '#' },
                { icon: <Linkedin />, href: '#' },
                { icon: <Twitter />, href: '#' },
                { icon: <Globe />, href: '#' }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.2, y: -2 }}
                  className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}