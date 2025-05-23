"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Clock,
  Briefcase,
  Award,
  User,
  Mail,
  ArrowRight,
  Command,
  Hash,
  Calendar,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebouncedState } from "@/hooks";

interface SearchResult {
  id: string;
  type: "project" | "skill" | "certificate" | "page" | "contact";
  title: string;
  description: string;
  url: string;
  metadata?: {
    date?: string;
    tags?: string[];
    category?: string;
  };
  score: number;
}

interface SearchSection {
  title: string;
  icon: React.ReactNode;
  results: SearchResult[];
}

const mockSearchData: SearchResult[] = [
  {
    id: "1",
    type: "project",
    title: "E-commerce Platform",
    description: "Plataforma completa de e-commerce com React e Node.js",
    url: "/projects/ecommerce-platform",
    metadata: {
      date: "2024-01-15",
      tags: ["React", "Node.js", "E-commerce"],
      category: "Web Application",
    },
    score: 0.95,
  },
  {
    id: "2",
    type: "skill",
    title: "React",
    description: "Framework JavaScript para interfaces de usuário",
    url: "/skills#react",
    metadata: {
      category: "Frontend",
      tags: ["JavaScript", "UI", "Frontend"],
    },
    score: 0.9,
  },
  {
    id: "3",
    type: "certificate",
    title: "AWS Solutions Architect",
    description: "Certificação em arquitetura de soluções AWS",
    url: "/certificates#aws",
    metadata: {
      date: "2024-01-15",
      category: "Cloud Computing",
    },
    score: 0.85,
  },
  {
    id: "4",
    type: "page",
    title: "Sobre Mim",
    description: "Conheça minha trajetória profissional e experiências",
    url: "/about",
    score: 0.7,
  },
  {
    id: "5",
    type: "contact",
    title: "Entre em Contato",
    description: "Vamos conversar sobre seu próximo projeto",
    url: "/contact",
    score: 0.6,
  },
];

export const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedState(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }

      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem("recent-searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search when query changes
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setSelectedIndex(0);
    }
  }, [debouncedQuery]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);

    try {
      // Simulate API call - replace with actual search API
      await new Promise((resolve) => setTimeout(resolve, 200));

      const filtered = mockSearchData.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.metadata?.tags?.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );

      // Sort by score
      filtered.sort((a, b) => b.score - a.score);

      setResults(filtered);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      }
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const newRecent = [
      query,
      ...recentSearches.filter((s) => s !== query),
    ].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem("recent-searches", JSON.stringify(newRecent));

    // Navigate to result
    router.push(result.url);
    setIsOpen(false);
    setQuery("");
  };

  const handleRecentClick = (recent: string) => {
    setQuery(recent);
    performSearch(recent);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent-searches");
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "project":
        return <Briefcase className="w-4 h-4" />;
      case "skill":
        return <Hash className="w-4 h-4" />;
      case "certificate":
        return <Award className="w-4 h-4" />;
      case "page":
        return <User className="w-4 h-4" />;
      case "contact":
        return <Mail className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "project":
        return "Projeto";
      case "skill":
        return "Habilidade";
      case "certificate":
        return "Certificado";
      case "page":
        return "Página";
      case "contact":
        return "Contato";
      default:
        return type;
    }
  };

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>,
  );

  return (
    <>
      {/* Search Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">Buscar...</span>
        <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-500">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </motion.button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl mt-20 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center p-6 border-b border-white/10">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar projetos, habilidades, certificados..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-3 p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-6 text-center">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-gray-400 mt-2">Buscando...</p>
                  </div>
                ) : query && results.length > 0 ? (
                  <div className="p-2">
                    {Object.entries(groupedResults).map(([type, items]) => (
                      <div key={type} className="mb-4">
                        <div className="flex items-center px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {getIcon(type as SearchResult["type"])}
                          <span className="ml-2">
                            {getTypeLabel(type as SearchResult["type"])}
                          </span>
                        </div>
                        {items.map((result, index) => {
                          const globalIndex = results.indexOf(result);
                          return (
                            <motion.button
                              key={result.id}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => handleResultClick(result)}
                              className={`w-full flex items-center p-4 rounded-xl text-left transition-all ${
                                globalIndex === selectedIndex
                                  ? "bg-primary-500/20 border border-primary-500/30"
                                  : "hover:bg-white/5"
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="font-medium text-white">
                                    {result.title}
                                  </span>
                                  {result.metadata?.category && (
                                    <span className="ml-2 px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                      {result.metadata.category}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-400 text-sm mt-1">
                                  {result.description}
                                </p>
                                {result.metadata?.tags && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {result.metadata.tags
                                      .slice(0, 3)
                                      .map((tag, i) => (
                                        <span
                                          key={i}
                                          className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                  </div>
                                )}
                                {result.metadata?.date && (
                                  <div className="flex items-center mt-2 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>
                                      {new Date(
                                        result.metadata.date,
                                      ).toLocaleDateString("pt-BR")}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 ml-4" />
                            </motion.button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : query && !isLoading ? (
                  <div className="p-6 text-center">
                    <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">
                      Nenhum resultado encontrado para "{query}"
                    </p>
                  </div>
                ) : (
                  <div className="p-6">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-400 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Buscas Recentes
                          </h3>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-gray-500 hover:text-gray-300"
                          >
                            Limpar
                          </button>
                        </div>
                        <div className="space-y-1">
                          {recentSearches.map((recent, index) => (
                            <button
                              key={index}
                              onClick={() => handleRecentClick(recent)}
                              className="w-full flex items-center p-3 rounded-lg hover:bg-white/5 text-left"
                            >
                              <Clock className="w-4 h-4 text-gray-400 mr-3" />
                              <span className="text-gray-300">{recent}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-3">
                        Ações Rápidas
                      </h3>
                      <div className="space-y-1">
                        {[
                          {
                            label: "Ver Projetos",
                            url: "/projects",
                            icon: <Briefcase />,
                          },
                          {
                            label: "Minhas Habilidades",
                            url: "/skills",
                            icon: <Hash />,
                          },
                          {
                            label: "Certificações",
                            url: "/certificates",
                            icon: <Award />,
                          },
                          {
                            label: "Entre em Contato",
                            url: "/contact",
                            icon: <Mail />,
                          },
                        ].map((action, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              router.push(action.url);
                              setIsOpen(false);
                            }}
                            className="w-full flex items-center p-3 rounded-lg hover:bg-white/5 text-left"
                          >
                            <div className="text-gray-400 mr-3">
                              {action.icon}
                            </div>
                            <span className="text-gray-300">
                              {action.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-white/10 text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-white/10 rounded">↑↓</kbd>
                    <span>Navegar</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-white/10 rounded">↵</kbd>
                    <span>Selecionar</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-white/10 rounded">Esc</kbd>
                    <span>Fechar</span>
                  </div>
                </div>
                {results.length > 0 && (
                  <span>
                    {results.length} resultado{results.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
