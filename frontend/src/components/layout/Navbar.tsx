'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, User, Briefcase, Award, Mail, Settings, LogIn, LogOut,
  Menu, X, Search, Bell, Shield, Moon, Sun, Code, ChevronDown
} from 'lucide-react';
import { useTheme, useAuth } from '@/contexts';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, setThemeMode } = useTheme();
  const { state: authState, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { id: 'home', label: 'Início', icon: <Home />, path: '/' },
    { id: 'about', label: 'Sobre', icon: <User />, path: '/about' },
    { id: 'projects', label: 'Projetos', icon: <Briefcase />, path: '/projects' },
    { id: 'skills', label: 'Habilidades', icon: <Code />, path: '/skills' },
    { id: 'certificates', label: 'Certificados', icon: <Award />, path: '/certificates' },
    { id: 'contact', label: 'Contato', icon: <Mail />, path: '/contact' },
  ];

  const adminItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin' },
    { id: 'projects', label: 'Projetos', path: '/admin/projects' },
    { id: 'certificates', label: 'Certificados', path: '/admin/certificates' },
    { id: 'settings', label: 'Configurações', path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.push('/');
  };

  const isActivePath = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Portfolio Pro
              </span>
            </motion.div>
          </Link>

          {/* Navegação Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link key={item.id} href={item.path}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    isActivePath(item.path)
                      ? 'text-primary-400 bg-primary-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Ações da Direita */}
          <div className="flex items-center space-x-3">
            {/* Tema */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setThemeMode(theme.mode === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
            >
              {theme.mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Auth */}
            {authState.isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  <img
                    src={authState.user?.avatar || '/api/placeholder/32/32'}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-white/20"
                  />
                  <span className="text-white text-sm hidden md:block">
                    {authState.user?.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </motion.button>

                {/* User Menu Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <img
                            src={authState.user?.avatar || '/api/placeholder/40/40'}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full border border-white/20"
                          />
                          <div>
                            <div className="text-white font-medium">{authState.user?.name}</div>
                            <div className="text-gray-400 text-sm">{authState.user?.email}</div>
                          </div>
                        </div>
                      </div>

                      {/* Admin Menu */}
                      {authState.user?.role === 'admin' && (
                        <div className="py-2">
                          <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Admin
                          </div>
                          {adminItems.map((item) => (
                            <Link key={item.id} href={item.path}>
                              <motion.div
                                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                onClick={() => setShowUserMenu(false)}
                                className={`px-4 py-2 text-sm cursor-pointer flex items-center space-x-2 ${
                                  isActivePath(item.path)
                                    ? 'text-primary-400 bg-primary-500/10'
                                    : 'text-gray-300 hover:text-white'
                                }`}
                              >
                                <Shield className="w-4 h-4" />
                                <span>{item.label}</span>
                              </motion.div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Logout */}
                      <div className="border-t border-white/10">
                        <motion.button
                          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-left text-red-400 hover:text-red-300 flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sair</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 rounded-lg text-white cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </motion.div>
              </Link>
            )}

            {/* Menu Mobile */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
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
              className="lg:hidden bg-black/80 backdrop-blur-xl border-t border-white/10 rounded-b-2xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {navigationItems.map((item) => (
                  <Link key={item.id} href={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.02, x: 4 }}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer ${
                        isActivePath(item.path)
                          ? 'text-primary-400 bg-primary-500/10'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                ))}

                {/* Admin Menu Mobile */}
                {authState.isAuthenticated && authState.user?.role === 'admin' && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-3">
                      Admin
                    </div>
                    {adminItems.map((item) => (
                      <Link key={item.id} href={item.path}>
                        <motion.div
                          whileHover={{ scale: 1.02, x: 4 }}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer ${
                            isActivePath(item.path)
                              ? 'text-primary-400 bg-primary-500/10'
                              : 'text-gray-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Shield className="w-5 h-5" />
                          <span>{item.label}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </motion.nav>
  );
};