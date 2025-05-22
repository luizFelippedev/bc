'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Send, Clock, MessageCircle,
  Github, Linkedin, Twitter, Globe, CheckCircle,
  Calendar, Coffee, Zap, Heart
} from 'lucide-react';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  budget?: string;
  timeline?: string;
  projectType?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    budget: '',
    timeline: '',
    projectType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      value: 'joao@portfolio.com',
      description: 'Respondo em até 24h',
      action: 'mailto:joao@portfolio.com'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Telefone',
      value: '+55 (11) 99999-9999',
      description: 'WhatsApp disponível',
      action: 'tel:+5511999999999'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Localização',
      value: 'São Paulo, Brasil',
      description: 'Trabalho remotamente',
      action: null
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Disponibilidade',
      value: 'Segunda a Sexta',
      description: '9h às 18h (GMT-3)',
      action: null
    }
  ];

  const socialLinks = [
    {
      name: 'GitHub',
      icon: <Github className="w-5 h-5" />,
      url: 'https://github.com/joaosilva',
      color: 'hover:text-gray-300'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      url: 'https://linkedin.com/in/joaosilva',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      url: 'https://twitter.com/joaosilva',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Website',
      icon: <Globe className="w-5 h-5" />,
      url: 'https://joaosilva.dev',
      color: 'hover:text-primary-400'
    }
  ];

  const projectTypes = [
    'Website/Landing Page',
    'Aplicação Web',
    'Aplicativo Mobile',
    'E-commerce',
    'Dashboard/Admin',
    'API/Backend',
    'Consultoria',
    'Outro'
  ];

  const budgetRanges = [
    'R$ 5.000 - R$ 15.000',
    'R$ 15.000 - R$ 30.000',
    'R$ 30.000 - R$ 50.000',
    'R$ 50.000+',
    'A definir'
  ];

  const timelineOptions = [
    '1-2 semanas',
    '1 mês',
    '2-3 meses',
    '3-6 meses',
    '6+ meses',
    'Flexível'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio do formulário
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        budget: '',
        timeline: '',
        projectType: ''
      });
    }, 3000);
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
                Vamos Conversar?
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Tenho uma ideia? Precisa de ajuda com um projeto? Ou apenas quer bater um papo sobre tecnologia? 
              Adoraria ouvir de você! 🚀
            </p>
            
            <div className="flex items-center justify-center space-x-6 text-gray-400">
              <div className="flex items-center space-x-2">
                <Coffee className="w-5 h-5 text-primary-400" />
                <span>Sempre disponível para um café virtual</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-secondary-400" />
                <span>Resposta rápida garantida</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                {info.action ? (
                  <a
                    href={info.action}
                    className="block bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-primary-500/50 transition-all duration-300 h-full"
                  >
                    <ContactInfoContent info={info} />
                  </a>
                ) : (
                  <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 h-full">
                    <ContactInfoContent info={info} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Envie sua Mensagem
              </h2>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Mensagem Enviada!</h3>
                  <p className="text-gray-400">
                    Obrigado pelo contato! Vou responder em breve.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nome *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo de Projeto
                      </label>
                      <select
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="" className="bg-gray-800">Selecione...</option>
                        {projectTypes.map(type => (
                          <option key={type} value={type} className="bg-gray-800">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Orçamento
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="" className="bg-gray-800">Selecione...</option>
                        {budgetRanges.map(range => (
                          <option key={range} value={range} className="bg-gray-800">
                            {range}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prazo
                      </label>
                      <select
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="" className="bg-gray-800">Selecione...</option>
                        {timelineOptions.map(option => (
                          <option key={option} value={option} className="bg-gray-800">
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Assunto *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Sobre o que você gostaria de conversar?"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Conte-me mais sobre seu projeto ou ideia. Quanto mais detalhes, melhor posso ajudar!"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Enviar Mensagem</span>
                      </>
                    )}
                  </motion.button>

                  <p className="text-gray-400 text-sm text-center">
                    Ao enviar, você concorda que posso usar essas informações para responder sua mensagem.
                  </p>
                </form>
              )}
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Social Links */}
              <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-primary-400" />
                  Vamos nos Conectar
                </h3>
                <p className="text-gray-400 mb-6">
                  Siga-me nas redes sociais para ver meus últimos projetos e insights sobre tecnologia.
                </p>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      className={`p-3 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all ${social.color}`}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Perguntas Frequentes
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">
                      💼 Que tipo de projetos você aceita?
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Trabalho com desenvolvimento web, mobile, APIs e consultoria em tecnologia. 
                      Especialmente interessado em projetos inovadores com IA.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">
                      ⏱️ Qual o prazo típico dos projetos?
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Depende da complexidade. Projetos simples levam 2-4 semanas, 
                      enquanto aplicações complexas podem levar 2-6 meses.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">
                      🌍 Você trabalha remotamente?
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Sim! Trabalho com clientes do mundo todo. Tenho experiência 
                      com equipes distribuídas e metodologias ágeis.
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonial */}
              <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                <div className="flex items-start space-x-4">
                  <img
                    src="https://via.placeholder.com/48"
                    alt="Cliente"
                    className="w-12 h-12 rounded-full border-2 border-primary-500/30"
                  />
                  <div>
                    <p className="text-gray-300 italic mb-3">
                      "Luiz Felippe entregou um trabalho excepcional. Comunicação clara, 
                      código limpo e resultado final superou nossas expectativas!"
                    </p>
                    <div className="text-sm">
                      <div className="text-white font-medium">Ana Silva</div>
                      <div className="text-gray-400">CEO, TechStart</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
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
            <div className="flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-red-400 fill-current mr-2" />
              <h2 className="text-2xl font-bold text-white">
                Pronto para Criar Algo Incrível?
              </h2>
            </div>
            <p className="text-gray-300 text-lg mb-8">
              Cada grande projeto começa com uma conversa. Vamos transformar sua ideia em realidade!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.a
                href="mailto:joao@portfolio.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-semibold text-white"
              >
                <Mail className="w-5 h-5" />
                <span>Enviar Email Direto</span>
              </motion.a>
              
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-8 py-4 border-2 border-primary-500 rounded-xl font-semibold text-white hover:bg-primary-500/10"
              >
                <Calendar className="w-5 h-5" />
                <span>Agendar Reunião</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Componente auxiliar para informações de contato
const ContactInfoContent: React.FC<{ info: any }> = ({ info }) => (
  <>
    <div className="text-primary-400 mb-4 group-hover:scale-110 transition-transform">
      {info.icon}
    </div>
    <h3 className="text-white font-semibold mb-2">{info.title}</h3>
    <p className="text-gray-300 font-medium mb-1">{info.value}</p>
    <p className="text-gray-400 text-sm">{info.description}</p>
  </>
);