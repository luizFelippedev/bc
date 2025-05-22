'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Briefcase, Award, Users, TrendingUp, Settings,
  Plus, Edit, Trash2, Eye, Activity
} from 'lucide-react';
import { useAuth, useData } from '@/contexts';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { state: authState } = useAuth();
  const { projects, certificates, addProject, addCertificate } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      router.push('/login');
    }
  }, [authState.isAuthenticated, router]);

  if (!authState.isAuthenticated) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <BarChart3 /> },
    { id: 'projects', label: 'Projetos', icon: <Briefcase /> },
    { id: 'certificates', label: 'Certificados', icon: <Award /> },
    { id: 'settings', label: 'Configurações', icon: <Settings /> },
  ];

  const stats = {
    totalProjects: projects.length || 12,
    totalCertificates: certificates.length || 8,
    totalUsers: 1247,
    totalViews: 45231
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-400 mt-2">
                Bem-vindo de volta, {authState.user?.name}! 👋
              </p>
            </div>
          </motion.div>
        </div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { title: 'Projetos', value: stats.totalProjects, icon: <Briefcase />, color: 'from-blue-500 to-blue-600' },
            { title: 'Certificados', value: stats.totalCertificates, icon: <Award />, color: 'from-green-500 to-green-600' },
            { title: 'Usuários', value: stats.totalUsers, icon: <Users />, color: 'from-purple-500 to-purple-600' },
            { title: 'Visualizações', value: stats.totalViews, icon: <Eye />, color: 'from-orange-500 to-orange-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">{stat.title}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="text-sm font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'projects' && <ProjectsTab />}
            {activeTab === 'certificates' && <CertificatesTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Componente Overview
const OverviewTab: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <Activity className="w-5 h-5 mr-2" />
        Atividades Recentes
      </h3>
      <div className="space-y-4">
        {[
          { title: 'Novo projeto React criado', time: '2 horas atrás', type: 'project' },
          { title: 'Certificado AWS adicionado', time: '1 dia atrás', type: 'certificate' },
          { title: '50 novas visualizações', time: '2 dias atrás', type: 'view' },
        ].map((activity, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.01, x: 4 }}
            className="flex items-center space-x-4 p-4 rounded-xl hover:bg-white/5"
          >
            <div className={`p-2 rounded-lg ${
              activity.type === 'project' ? 'bg-blue-500/20 text-blue-400' :
              activity.type === 'certificate' ? 'bg-green-500/20 text-green-400' :
              'bg-orange-500/20 text-orange-400'
            }`}>
              {activity.type === 'project' && <Briefcase className="w-4 h-4" />}
              {activity.type === 'certificate' && <Award className="w-4 h-4" />}
              {activity.type === 'view' && <Eye className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-medium">{activity.title}</div>
              <div className="text-gray-400 text-xs">{activity.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <h3 className="text-xl font-bold text-white mb-6">Ações Rápidas</h3>
      <div className="space-y-3">
        {[
          { label: 'Novo Projeto', icon: <Plus />, color: 'bg-blue-500' },
          { label: 'Novo Certificado', icon: <Award />, color: 'bg-green-500' },
          { label: 'Ver Analytics', icon: <BarChart3 />, color: 'bg-purple-500' },
        ].map((action, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02, x: 4 }}
            className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5"
          >
            <div className={`p-2 rounded-lg ${action.color}`}>
              {action.icon}
            </div>
            <span className="text-white text-sm font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  </div>
);

// Componente Projects
const ProjectsTab: React.FC = () => (
  <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-white">Gerenciar Projetos</h3>
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg text-white"
      >
        <Plus className="w-4 h-4" />
        <span>Novo Projeto</span>
      </motion.button>
    </div>
    <p className="text-gray-400">Funcionalidade de gerenciamento de projetos em desenvolvimento...</p>
  </div>
);

// Componente Certificates
const CertificatesTab: React.FC = () => (
  <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-white">Gerenciar Certificados</h3>
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 rounded-lg text-white"
      >
        <Plus className="w-4 h-4" />
        <span>Novo Certificado</span>
      </motion.button>
    </div>
    <p className="text-gray-400">Funcionalidade de gerenciamento de certificados em desenvolvimento...</p>
  </div>
);

// Componente Settings
const SettingsTab: React.FC = () => (
  <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
    <h3 className="text-xl font-bold text-white mb-6">Configurações do Sistema</h3>
    <p className="text-gray-400">Configurações avançadas em desenvolvimento...</p>
  </div>
);
