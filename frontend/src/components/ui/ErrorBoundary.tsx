"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
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
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            retry={this.handleRetry}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error!}
          retry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Default Error Fallback Component
interface ErrorFallbackProps {
  error: Error;
  retry: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
}) => (
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
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center"
        >
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-4">
          Ops! Algo deu errado
        </h2>

        <p className="text-gray-400 mb-6">
          Encontramos um erro inesperado. Nossa equipe foi notificada e estamos
          trabalhando para resolver.
        </p>

        {process.env.NODE_ENV === "development" && (
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

          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-white/20 rounded-xl font-semibold text-white hover:bg-white/10"
            >
              <Home className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  </div>
);

// Export a client-side only ErrorBoundary wrapper
export default ErrorBoundary;
