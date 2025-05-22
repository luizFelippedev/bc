'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Sun, Moon, Zap, Sparkles, Code, 
  Play, Pause, Eye, EyeOff, Settings 
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { NoSSR } from './NoSSR';

const ThemeSelectorContent: React.FC = () => {
  const { 
    theme, 
    setThemeMode, 
    toggleAnimations, 
    toggleParticles, 
    toggleGlassEffect,
    isLoaded 
  } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = [
    {
      id: 'light' as const,
      name: 'Light',
      icon: <Sun className="w-4 h-4" />,
      colors: ['#3b82f6', '#8b5cf6', '#f59e0b'],
      description: 'Tema claro e minimalista'
    },
    {
      id: 'dark' as const,
      name: 'Dark',
      icon: <Moon className="w-4 h-4" />,
      colors: ['#60a5fa', '#a78bfa', '#fbbf24'],
      description: 'Tema escuro elegante'
    },
    {
      id: 'cyberpunk' as const,
      name: 'Cyberpunk',
      icon: <Zap className="w-4 h-4" />,
      colors: ['#00ffff', '#ff00ff', '#ffff00'],
      description: 'Estilo futurista cyberpunk'
    },
    {
      id: 'neon' as const,
      name: 'Neon',
      icon: <Sparkles className="w-4 h-4" />,
      colors: ['#ff0080', '#8000ff', '#00ff80'],
      description: 'Cores neon vibrantes'
    },
    {
      id: 'matrix' as const,
      name: 'Matrix',
      icon: <Code className="w-4 h-4" />,
      colors: ['#00ff41', '#008f11', '#41ff00'],
      description: 'Inspirado no filme Matrix'
    }
  ];

  if (!isLoaded) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="w-12 h-12 bg-gray-800 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
      >
        <Palette className="w-5 h-5" />
      </motion.button>

      {/* Theme Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-0 w-80 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Configurações de Tema
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Theme Options */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Escolha um tema:</h4>
              {themeOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setThemeMode(option.id)}
                  className={`w-full p-3 rounded-xl border transition-all text-left ${
                    theme.mode === option.id
                      ? 'border-white/30 bg-white/10'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="text-white mr-2">
                        {option.icon}
                      </div>
                      <span className="text-white font-medium">{option.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      {option.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{option.description}</p>
                </motion.button>
              ))}
            </div>

            {/* Settings Toggles */}
            <div className="space-y-4 border-t border-white/10 pt-4">
              <h4 className="text-sm font-medium text-gray-300">Configurações:</h4>
              
              {/* Animations Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {theme.animations ? 
                    <Play className="w-4 h-4 text-green-400 mr-2" /> : 
                    <Pause className="w-4 h-4 text-red-400 mr-2" />
                  }
                  <span className="text-white text-sm">Animações</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleAnimations}
                  className={`w-12 h-6 rounded-full transition-all ${
                    theme.animations ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{
                      x: theme.animations ? 24 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </motion.button>
              </div>

              {/* Particles Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sparkles className={`w-4 h-4 mr-2 ${theme.particles ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span className="text-white text-sm">Partículas</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleParticles}
                  className={`w-12 h-6 rounded-full transition-all ${
                    theme.particles ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{
                      x: theme.particles ? 24 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </motion.button>
              </div>

              {/* Glass Effect Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {theme.glassEffect ? 
                    <Eye className="w-4 h-4 text-purple-400 mr-2" /> : 
                    <EyeOff className="w-4 h-4 text-gray-400 mr-2" />
                  }
                  <span className="text-white text-sm">Efeito Glass</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleGlassEffect}
                  className={`w-12 h-6 rounded-full transition-all ${
                    theme.glassEffect ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{
                      x: theme.glassEffect ? 24 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </motion.button>
              </div>
            </div>

            {/* Current Theme Info */}
            <div className="mt-4 p-3 bg-white/5 rounded-xl">
              <div className="text-xs text-gray-400 mb-1">Tema atual:</div>
              <div className="text-white font-medium capitalize">{theme.mode}</div>
              <div className="flex space-x-1 mt-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.customColors.primary }}
                />
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.customColors.secondary }}
                />
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.customColors.accent }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ThemeSelector: React.FC = () => {
  return (
    <NoSSR fallback={
      <div className="fixed top-4 right-4 z-50">
        <div className="w-12 h-12 bg-gray-800 rounded-full animate-pulse" />
      </div>
    }>
      <ThemeSelectorContent />
    </NoSSR>
  );
};