"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, AlertCircle, LogIn } from "lucide-react";
import { useAuth } from "@/contexts";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginStatus, setLoginStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const { state: authState, login } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      console.log("User already authenticated, redirecting to admin...");
      router.push("/admin");
    }
  }, [authState.isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error state when user types
    if (loginStatus === "error") setLoginStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoginStatus("idle");

    try {
      console.log("Attempting login with:", formData.email);
      const success = await login(formData.email, formData.password);

      if (success) {
        setLoginStatus("success");
        console.log("Login successful, redirecting to admin...");

        // Small delay to show success state before redirect
        setTimeout(() => {
          router.push("/admin");
        }, 500);
      } else {
        setLoginStatus("error");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const guestLogin = () => {
    setFormData({
      email: "admin@portfolio.com",
      password: "admin123",
    });

    // Small delay to show the fields being filled
    setTimeout(() => {
      handleSubmit(new Event("submit") as any);
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Acesso Administrativo
            </h1>
            <p className="text-gray-400 mt-2">Entre para acessar o painel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="admin@portfolio.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 pr-12"
                    placeholder="admin123"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {(loginStatus === "error" || authState.error) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    {authState.error ||
                      "Credenciais inválidas. Tente novamente."}
                  </span>
                </motion.div>
              )}

              {/* Login Button */}
              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 ${
                  loginStatus === "success"
                    ? "bg-green-600"
                    : "bg-gradient-to-r from-primary-600 to-secondary-600"
                } rounded-xl font-semibold text-white disabled:opacity-50 flex items-center justify-center space-x-2`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : loginStatus === "success" ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Login Bem-Sucedido!</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Entrar</span>
                  </>
                )}
              </motion.button>

              {/* Demo Login Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={guestLogin}
                disabled={isSubmitting}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-gray-300 hover:bg-white/10 disabled:opacity-50"
              >
                Entrar como Admin (Teste)
              </motion.button>
            </div>
          </form>

          {/* Example Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
          >
            <p className="text-sm text-blue-300 mb-2">
              Credenciais de exemplo:
            </p>
            <p className="text-xs text-blue-200">Email: admin@portfolio.com</p>
            <p className="text-xs text-blue-200">Senha: admin123</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Component for check icon
const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
