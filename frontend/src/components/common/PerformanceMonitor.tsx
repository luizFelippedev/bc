"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Wifi, Zap, Clock, AlertTriangle } from "lucide-react";

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte

  // Network
  connection?: "slow-2g" | "2g" | "3g" | "4g" | "unknown";
  downlink?: number;

  // Memory (if available)
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;

  // Custom metrics
  pageLoadTime?: number;
  resourceCount?: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<number>(0);

  useEffect(() => {
    // Only run in development or when explicitly enabled
    const shouldMonitor =
      process.env.NODE_ENV === "development" ||
      localStorage.getItem("performance-monitor") === "true";

    if (!shouldMonitor) return;

    measurePerformance();
    setupPerformanceObserver();

    // Re-measure every 30 seconds
    const interval = setInterval(measurePerformance, 30000);

    return () => clearInterval(interval);
  }, []);

  const measurePerformance = () => {
    if (typeof window === "undefined") return;

    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType("paint");

    const newMetrics: PerformanceMetrics = {};

    // Basic timing
    if (navigation) {
      newMetrics.pageLoadTime =
        navigation.loadEventEnd - navigation.loadEventStart;
      newMetrics.ttfb = navigation.responseStart - navigation.requestStart;
    }

    // Paint metrics
    const fcp = paint.find((entry) => entry.name === "first-contentful-paint");
    if (fcp) {
      newMetrics.fcp = fcp.startTime;
    }

    // Network information
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      newMetrics.connection = connection.effectiveType;
      newMetrics.downlink = connection.downlink;
    }

    // Memory information (Chrome only)
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      newMetrics.usedJSHeapSize = memory.usedJSHeapSize;
      newMetrics.totalJSHeapSize = memory.totalJSHeapSize;
    }

    // Resource count
    newMetrics.resourceCount = performance.getEntriesByType("resource").length;

    setMetrics(newMetrics);
    calculatePerformanceScore(newMetrics);
  };

  const setupPerformanceObserver = () => {
    if (!("PerformanceObserver" in window)) return;

    // Observe Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case "largest-contentful-paint":
            setMetrics((prev) => ({ ...prev, lcp: entry.startTime }));
            break;
          case "first-input":
            setMetrics((prev) => ({
              ...prev,
              fid: (entry as any).processingStart - entry.startTime,
            }));
            break;
          case "layout-shift":
            if (!(entry as any).hadRecentInput) {
              setMetrics((prev) => ({
                ...prev,
                cls: (prev.cls || 0) + (entry as any).value,
              }));
            }
            break;
        }
      }
    });

    try {
      observer.observe({
        entryTypes: ["largest-contentful-paint", "first-input", "layout-shift"],
      });
    } catch (e) {
      // Some browsers might not support all entry types
      console.warn("Some performance metrics not supported:", e);
    }
  };

  const calculatePerformanceScore = (metrics: PerformanceMetrics) => {
    let score = 100;

    // LCP scoring (Good: <2.5s, Needs improvement: 2.5-4s, Poor: >4s)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30;
      else if (metrics.lcp > 2500) score -= 15;
    }

    // FID scoring (Good: <100ms, Needs improvement: 100-300ms, Poor: >300ms)
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 25;
      else if (metrics.fid > 100) score -= 10;
    }

    // CLS scoring (Good: <0.1, Needs improvement: 0.1-0.25, Poor: >0.25)
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 25;
      else if (metrics.cls > 0.1) score -= 10;
    }

    // Network quality
    if (metrics.connection === "slow-2g" || metrics.connection === "2g") {
      score -= 10;
    }

    // Memory usage (if available)
    if (metrics.usedJSHeapSize && metrics.totalJSHeapSize) {
      const memoryUsage = metrics.usedJSHeapSize / metrics.totalJSHeapSize;
      if (memoryUsage > 0.8) score -= 10;
      else if (memoryUsage > 0.6) score -= 5;
    }

    setPerformanceScore(Math.max(0, score));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excelente";
    if (score >= 70) return "Bom";
    if (score >= 50) return "Precisa melhorar";
    return "Ruim";
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Only show in development or when explicitly enabled
  if (
    process.env.NODE_ENV !== "development" &&
    localStorage.getItem("performance-monitor") !== "true"
  ) {
    return null;
  }

  return (
    <>
      {/* Performance Badge */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowDebugInfo(!showDebugInfo)}
        className="fixed bottom-4 left-4 z-50 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 p-3 text-white hover:bg-white/10 transition-all"
        title="Performance Monitor"
      >
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4" />
          <span
            className={`text-xs font-bold ${getScoreColor(performanceScore)}`}
          >
            {performanceScore}
          </span>
        </div>
      </motion.button>

      {/* Debug Panel */}
      <AnimatePresence>
        {showDebugInfo && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed bottom-20 left-4 z-50 w-80 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Performance Monitor
              </h3>
              <button
                onClick={() => setShowDebugInfo(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Overall Score */}
            <div className="mb-4 p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Score Geral</span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-lg font-bold ${getScoreColor(
                      performanceScore,
                    )}`}
                  >
                    {performanceScore}
                  </span>
                  <span
                    className={`text-xs ${getScoreColor(performanceScore)}`}
                  >
                    {getScoreLabel(performanceScore)}
                  </span>
                </div>
              </div>
            </div>

            {/* Core Web Vitals */}
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-medium text-gray-300">
                Core Web Vitals
              </h4>

              {metrics.lcp && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Zap className="w-3 h-3 mr-2 text-blue-400" />
                    <span>LCP</span>
                  </div>
                  <span
                    className={
                      metrics.lcp > 2500 ? "text-red-400" : "text-green-400"
                    }
                  >
                    {formatTime(metrics.lcp)}
                  </span>
                </div>
              )}

              {metrics.fid !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-2 text-yellow-400" />
                    <span>FID</span>
                  </div>
                  <span
                    className={
                      metrics.fid > 100 ? "text-red-400" : "text-green-400"
                    }
                  >
                    {formatTime(metrics.fid)}
                  </span>
                </div>
              )}

              {metrics.cls !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-2 text-purple-400" />
                    <span>CLS</span>
                  </div>
                  <span
                    className={
                      metrics.cls > 0.1 ? "text-red-400" : "text-green-400"
                    }
                  >
                    {metrics.cls.toFixed(3)}
                  </span>
                </div>
              )}
            </div>

            {/* Network Info */}
            {metrics.connection && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Network
                </h4>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Wifi className="w-3 h-3 mr-2 text-green-400" />
                    <span>Connection</span>
                  </div>
                  <span className="uppercase">{metrics.connection}</span>
                </div>
                {metrics.downlink && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="ml-5">Downlink</span>
                    <span>{metrics.downlink} Mbps</span>
                  </div>
                )}
              </div>
            )}

            {/* Memory Info */}
            {metrics.usedJSHeapSize && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Memory
                </h4>
                <div className="flex items-center justify-between text-sm">
                  <span>JS Heap</span>
                  <span>{formatBytes(metrics.usedJSHeapSize)}</span>
                </div>
                {metrics.totalJSHeapSize && (
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div
                      className="bg-blue-400 h-1 rounded-full"
                      style={{
                        width: `${
                          (metrics.usedJSHeapSize / metrics.totalJSHeapSize) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Other Metrics */}
            <div className="text-xs text-gray-400 space-y-1">
              {metrics.resourceCount && (
                <div>Resources: {metrics.resourceCount}</div>
              )}
              {metrics.pageLoadTime && (
                <div>Load Time: {formatTime(metrics.pageLoadTime)}</div>
              )}
              {metrics.ttfb && <div>TTFB: {formatTime(metrics.ttfb)}</div>}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <button
                onClick={measurePerformance}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Atualizar Métricas
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Hook para usar métricas de performance
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    const updateMetrics = () => {
      if (typeof window === "undefined") return;

      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;

      setMetrics({
        pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        resourceCount: performance.getEntriesByType("resource").length,
      });
    };

    updateMetrics();
  }, []);

  return metrics;
};
