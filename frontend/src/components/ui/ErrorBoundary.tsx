import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return <DefaultErrorFallback error={this.state.error!} retry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

// Default Error Fallback Component
interface ErrorFallbackProps {
  error: Error;
  retry: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, retry }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 pt-20 flex items-center justify-center px-6">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full text-center"
    >
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center"
        >
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Ops! Algo deu errado
        </h2>
        
        <p className="text-gray-400 mb-6">
          Encontramos um erro inesperado. Nossa equipe foi notificada e estamos trabalhando para resolver.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer mb-2">
              Detalhes do erro (desenvolvimento)
            </summary>
            <pre className="text-xs text-red-400 bg-red-900/20 p-3 rounded overflow-x-auto">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={retry}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-semibold text-white"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-white/20 rounded-xl font-semibold text-white hover:bg-white/10"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  </div>
);

// 404 Not Found Component
export const NotFound: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 pt-20 flex items-center justify-center px-6">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl w-full text-center"
    >
      <motion.div
        animate={{ 
          rotateY: [0, 180, 360],
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-8xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-8"
      >
        404
      </motion.div>
      
      <h1 className="text-4xl font-bold text-white mb-4">
        Página Não Encontrada
      </h1>
      
      <p className="text-xl text-gray-400 mb-8">
        A página que você está procurando não existe ou foi movida para outro local.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.back()}
          className="flex items-center justify-center space-x-2 px-8 py-4 border-2 border-primary-500 rounded-xl font-semibold text-white hover:bg-primary-500/10"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/'}
          className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-semibold text-white"
        >
          <Home className="w-5 h-5" />
          <span>Ir para Home</span>
        </motion.button>
      </div>

      {/* Floating elements for visual appeal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-500/30 rounded-full"
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -100, 100, 0],
              scale: [1, 1.5, 0.5, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`
            }}
          />
        ))}
      </div>
    </motion.div>
  </div>
);

// Network Error Component
interface NetworkErrorProps {
  onRetry: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center"
  >
    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertTriangle className="w-6 h-6 text-red-400" />
    </div>
    
    <h3 className="text-lg font-semibold text-white mb-2">
      Erro de Conexão
    </h3>
    
    <p className="text-gray-400 mb-4">
      Não foi possível conectar ao servidor. Verifique sua conexão com a internet.
    </p>
    
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onRetry}
      className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 rounded-lg font-semibold text-white mx-auto"
    >
      <RefreshCw className="w-4 h-4" />
      <span>Tentar Novamente</span>
    </motion.button>
  </motion.div>
);

// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    {icon && (
      <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
        {icon}
      </div>
    )}
    
    <h3 className="text-xl font-semibold text-white mb-2">
      {title}
    </h3>
    
    <p className="text-gray-400 mb-6 max-w-md mx-auto">
      {description}
    </p>
    
    {action && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={action.onClick}
        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-semibold text-white"
      >
        {action.label}
      </motion.button>
    )}
  </motion.div>
);

// Offline Notice
export const OfflineNotice: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-20 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm text-yellow-900 text-center py-2 px-4"
    >
      <div className="flex items-center justify-center space-x-2">
        <AlertTriangle className="w-4 h-4" />
        <span className="font-medium">
          Você está offline. Algumas funcionalidades podem não estar disponíveis.
        </span>
      </div>
    </motion.div>
  );
};