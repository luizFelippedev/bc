'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  const popularPages = [
    { name: 'Sobre', href: '/about', description: 'Conheça minha trajetória' },
    { name: 'Projetos', href: '/projects', description: 'Veja meus trabalhos' },
    { name: 'Skills', href: '/skills', description: 'Minhas habilidades' },
    { name: 'Contato', href: '/contact', description: 'Entre em contato' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 pt-20 flex items-center justify-center px-6">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-500/20 rounded-full"
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -100, 100, 0],
              scale: [1, 1.5, 0.5, 1],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              delay: i * 0.7
            }}
            style={{
              left: `${5 + i * 12}%`,
              top: `${15 + i * 8}%`
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full text-center relative z-10"
      >
        {/* 404 Number */}
        <motion.div
          animate={{ 
            rotateY: [0, 15, -15, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-8"
        >
          <div className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 bg-clip-text text-transparent leading-none">
            404
          </div>
        </motion.div>
        
        {/* Title and Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Página Não Encontrada
          </h1>
          
          <p className="text-xl text-gray-400 mb-2">
            Ops! A página que você está procurando não existe.
          </p>
          <p className="text-gray-500">
            Ela pode ter sido movida, removida ou você digitou o endereço incorretamente.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center justify-center space-x-2 px-8 py-4 border-2 border-primary-500 rounded-xl font-semibold text-white hover:bg-primary-500/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </motion.button>
          
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-semibold text-white"
            >
              <Home className="w-5 h-5" />
              <span>Ir para Home</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Popular Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
            <Search className="w-6 h-6 mr-2 text-primary-400" />
            Páginas Populares
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularPages.map((page, index) => (
              <Link key={page.name} href={page.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-primary-500/50 transition-all group cursor-pointer"
                >
                  <h3 className="text-white font-semibold mb-1 group-hover:text-primary-400 transition-colors">
                    {page.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {page.description}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm mb-4">
            Ainda não encontrou o que procura?
          </p>
          <Link href="/contact">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-medium text-gray-300 hover:bg-white/20 hover:text-white transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Entre em Contato</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Easter Egg */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="mt-8"
        >
          <p className="text-gray-600 text-xs">
            🎮 Dica: Talvez esta página esteja em outro castelo...
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}