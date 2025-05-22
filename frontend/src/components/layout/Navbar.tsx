'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, User, Briefcase, Award, Mail, Settings, LogIn, LogOut,
  Menu, X, Search, Bell, Shield, Moon, Sun, Code
} from 'lucide-react';
import { useTheme, useAuth } from '@/contexts';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { theme, setThemeMode } = useTheme();
  const { state: authState, logout } = useAuth();

  const navigationItems = [
    { id: 'home', label: 'Início', icon: <Home />, path: '/' },
    { id: 'about', label: 'Sobre', icon: <User />, path: '/about' },
    { id: 'projects', label: 'Projetos', icon: <Briefcase />, path: '/projects' },
    { id: 'skills', label: 'Habilidades', icon: <Code />, path: '/skills' },
    { id: 'certificates', label: 'Certificados', icon: <Award />, path: '/certificates' },
    { id: 'contact', label: 'Contato', icon: <Mail />, path: '/contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Portfolio Pro
            </span>
          </motion.div>

          {/* Navegação Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <motion.a
                key={item.id}
                href={item.path}
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.a>
            ))}
          </div>

          {/* Ações da Direita */}
          <div className="flex items-center space-x-3">
            {/* Tema */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setThemeMode(theme.mode === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              {theme.mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Auth */}
            {authState.isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <img
                  src={authState.user?.avatar || '/api/placeholder/32/32'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={logout}
                  className="text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <motion.a
                href="/login"
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 rounded-lg text-white"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </motion.a>
            )}

            {/* Menu Mobile */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Menu Mobile */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-black/80 backdrop-blur-xl border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-2">
                {navigationItems.map((item) => (
                  <motion.a
                    key={item.id}
                    href={item.path}
                    whileHover={{ scale: 1.02, x: 4 }}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};
