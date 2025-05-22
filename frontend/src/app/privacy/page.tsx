'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, UserCheck, Mail, Calendar } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: 'coleta',
      title: 'Informações que Coletamos',
      icon: <Eye className="w-6 h-6" />,
      content: [
        'Informações pessoais fornecidas voluntariamente (nome, email, telefone)',
        'Dados de navegação e uso do site através de cookies',
        'Informações técnicas como endereço IP, tipo de navegador e dispositivo',
        'Dados de projetos e certificações públicas para fins de portfolio'
      ]
    },
    {
      id: 'uso',
      title: 'Como Usamos suas Informações',
      icon: <UserCheck className="w-6 h-6" />,
      content: [
        'Responder às suas mensagens e solicitações de contato',
        'Melhorar a experiência do usuário no site',
        'Enviar newsletters e atualizações (mediante consentimento)',
        'Analisar o tráfego e comportamento dos usuários para otimizações'
      ]
    },
    {
      id: 'protecao',
      title: 'Proteção de Dados',
      icon: <Lock className="w-6 h-6" />,
      content: [
        'Utilizamos criptografia SSL para proteger dados em trânsito',
        'Armazenamento seguro em servidores com medidas de proteção',
        'Acesso restrito às informações apenas para fins necessários',
        'Backup regular e seguro dos dados coletados'
      ]
    },
    {
      id: 'cookies',
      title: 'Política de Cookies',
      icon: <Shield className="w-6 h-6" />,
      content: [
        'Cookies essenciais para funcionamento básico do site',
        'Cookies de análise para Google Analytics (podem ser desabilitados)',
        'Cookies de personalização para melhorar sua experiência',
        'Você pode gerenciar cookies através das configurações do navegador'
      ]
    },
    {
      id: 'direitos',
      title: 'Seus Direitos (LGPD)',
      icon: <UserCheck className="w-6 h-6" />,
      content: [
        'Solicitar acesso aos dados pessoais que possuímos sobre você',
        'Corrigir dados pessoais incompletos, inexatos ou desatualizados',
        'Solicitar a exclusão de dados pessoais desnecessários',
        'Revogar consentimento para tratamento de dados a qualquer momento'
      ]
    },
    {
      id: 'contato',
      title: 'Entre em Contato',
      icon: <Mail className="w-6 h-6" />,
      content: [
        'Para dúvidas sobre privacidade: privacy@joaosilva.dev',
        'Para exercer seus direitos: joao@joaosilva.dev',
        'Resposta garantida em até 48 horas',
        'Atendimento em português e inglês'
      ]
    }
  ];

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
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-primary-400 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  Política de Privacidade
                </span>
              </h1>
            </div>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Sua privacidade é nossa prioridade. Esta política explica como coletamos, 
              usamos e protegemos suas informações pessoais.
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Última atualização: 22 de maio de 2024</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sections */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
              >
                <div className="flex items-center mb-6">
                  <div className="text-primary-400 mr-4">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {section.title}
                  </h2>
                </div>
                
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-300 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Compromisso com a Transparência
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Este site está em conformidade com a Lei Geral de Proteção de Dados (LGPD) 
              e as melhores práticas internacionais de privacidade. Mantemos registros 
              detalhados de todas as atividades de tratamento de dados.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Qualquer alteração nesta política será comunicada com antecedência através 
              do email cadastrado ou aviso no site. Recomendamos a verificação periódica 
              desta página.
            </p>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-400 mb-6">
              Tem dúvidas sobre nossa política de privacidade?
            </p>
            <motion.a
              href="mailto:privacy@joaosilva.dev"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-semibold text-white"
            >
              <Mail className="w-5 h-5" />
              <span>Fale Conosco</span>
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}