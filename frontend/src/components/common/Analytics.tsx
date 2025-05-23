"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";

// Google Analytics
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

// Custom analytics hook
export function useAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (GA_TRACKING_ID && typeof window !== "undefined" && window.gtag) {
      window.gtag("config", GA_TRACKING_ID, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number,
  ) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }

    // Custom analytics
    if (typeof window !== "undefined") {
      // Send to your custom analytics API
      fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          category,
          label,
          value,
          pathname,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Silently fail for analytics
      });
    }
  };

  const trackPageView = (path: string) => {
    if (typeof window !== "undefined" && window.gtag && GA_TRACKING_ID) {
      window.gtag("config", GA_TRACKING_ID, {
        page_path: path,
      });
    }
  };

  const trackProjectView = (projectId: string, projectTitle: string) => {
    trackEvent("view_project", "engagement", projectTitle);
  };

  const trackCertificateView = (
    certificateId: string,
    certificateTitle: string,
  ) => {
    trackEvent("view_certificate", "engagement", certificateTitle);
  };

  const trackContactForm = (formType: string) => {
    trackEvent("submit_form", "conversion", formType);
  };

  const trackDownload = (fileName: string, fileType: string) => {
    trackEvent("download", "engagement", fileName, 1);
  };

  const trackExternalLink = (url: string, linkText: string) => {
    trackEvent("click_external_link", "engagement", url);
  };

  const trackSearch = (query: string, resultsCount: number) => {
    trackEvent("search", "engagement", query, resultsCount);
  };

  return {
    trackEvent,
    trackPageView,
    trackProjectView,
    trackCertificateView,
    trackContactForm,
    trackDownload,
    trackExternalLink,
    trackSearch,
  };
}

// Analytics Provider Component
export function Analytics() {
  return (
    <>
      {GA_TRACKING_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });
              `,
            }}
          />
        </>
      )}

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </>
  );
}

// Cookie Consent Component
function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const acceptAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(newPreferences);
    localStorage.setItem("cookie-consent", JSON.stringify(newPreferences));
    setShowBanner(false);

    // Initialize analytics
    if (GA_TRACKING_ID && typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }
  };

  const acceptNecessary = () => {
    const newPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(newPreferences);
    localStorage.setItem("cookie-consent", JSON.stringify(newPreferences));
    setShowBanner(false);
  };

  const customizePreferences = () => {
    setShowPreferencesModal(true);
  };

  const savePreferences = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(preferences));
    setShowBanner(false);
    setShowPreferencesModal(false);

    // Update analytics consent
    if (GA_TRACKING_ID && typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: preferences.analytics ? "granted" : "denied",
        ad_storage: preferences.marketing ? "granted" : "denied",
      });
    }
  };

  if (!showBanner) return null;

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 p-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">
                🍪 Este site utiliza cookies
              </h3>
              <p className="text-gray-300 text-sm">
                Utilizamos cookies para melhorar sua experiência, analisar o
                tráfego do site e personalizar conteúdo. Você pode gerenciar
                suas preferências a qualquer momento.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={acceptNecessary}
                className="px-4 py-2 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10 text-sm"
              >
                Apenas Necessários
              </button>
              <button
                onClick={customizePreferences}
                className="px-4 py-2 border border-primary-500 rounded-lg text-primary-400 hover:bg-primary-500/10 text-sm"
              >
                Personalizar
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg text-white font-medium text-sm"
              >
                Aceitar Todos
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferencesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPreferencesModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Preferências de Cookies
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Necessários</h4>
                    <p className="text-gray-400 text-sm">
                      Essenciais para o funcionamento do site
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Analytics</h4>
                    <p className="text-gray-400 text-sm">
                      Nos ajudam a melhorar o site
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        analytics: !prev.analytics,
                      }))
                    }
                    className={`w-12 h-6 rounded-full flex items-center px-1 ${
                      preferences.analytics
                        ? "bg-green-500 justify-end"
                        : "bg-gray-600 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </motion.button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Marketing</h4>
                    <p className="text-gray-400 text-sm">
                      Para personalização de conteúdo
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        marketing: !prev.marketing,
                      }))
                    }
                    className={`w-12 h-6 rounded-full flex items-center px-1 ${
                      preferences.marketing
                        ? "bg-green-500 justify-end"
                        : "bg-gray-600 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </motion.button>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPreferencesModal(false)}
                  className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  onClick={savePreferences}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg text-white font-medium"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Performance monitoring
export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "navigation") {
          const navEntry = entry as PerformanceNavigationTiming;

          // Track page load time
          const loadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
          if (typeof window.gtag !== "undefined") {
            window.gtag("event", "timing_complete", {
              name: "load",
              value: Math.round(loadTime),
            });
          }
        }

        if (entry.entryType === "largest-contentful-paint") {
          const lcpEntry = entry as PerformanceEntry;
          if (typeof window.gtag !== "undefined") {
            window.gtag("event", "web_vital", {
              name: "LCP",
              value: Math.round(lcpEntry.startTime),
              event_category: "performance",
            });
          }
        }
      }
    });

    try {
      observer.observe({
        entryTypes: ["navigation", "largest-contentful-paint"],
      });
    } catch (error) {
      console.warn("Performance observer not supported:", error);
    }

    return () => observer.disconnect();
  }, []);
}

// Web Vitals tracking
export function trackWebVitals() {
  if (typeof window === "undefined") return;

  // Track CLS (Cumulative Layout Shift)
  let clsValue = 0;
  let clsEntries: any[] = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        const firstEntry = clsEntries[0];
        const lastEntry = clsEntries[clsEntries.length - 1];

        if (
          !firstEntry ||
          entry.startTime - lastEntry.startTime < 1000 ||
          entry.startTime - firstEntry.startTime < 5000
        ) {
          clsValue += (entry as any).value;
          clsEntries.push(entry);
        } else {
          clsValue = (entry as any).value;
          clsEntries = [entry];
        }
      }
    }
  });

  try {
    observer.observe({ entryTypes: ["layout-shift"] });
  } catch (error) {
    console.warn("Layout shift observer not supported:", error);
  }

  // Track when page is hidden to send final CLS value
  const sendCLS = () => {
    if (typeof window.gtag !== "undefined") {
      window.gtag("event", "web_vital", {
        name: "CLS",
        value: Math.round(clsValue * 1000),
        event_category: "performance",
      });
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendCLS();
    }
  });

  window.addEventListener("beforeunload", sendCLS);
}

// Error tracking
export function trackError(error: Error, errorInfo?: any) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "exception", {
      description: error.message,
      fatal: false,
    });
  }

  // Send to custom error tracking
  if (typeof window !== "undefined") {
    fetch("/api/analytics/error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        errorInfo,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently fail
    });
  }
}

// Session tracking
export function useSessionTracking() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let sessionStart = Date.now();
    let isActive = true;

    const trackSession = () => {
      const sessionDuration = Date.now() - sessionStart;

      if (typeof window.gtag !== "undefined") {
        window.gtag("event", "session_duration", {
          value: Math.round(sessionDuration / 1000),
          event_category: "engagement",
        });
      }
    };

    // Track activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    const handleActivity = () => {
      if (!isActive) {
        isActive = true;
        sessionStart = Date.now();
      }
    };

    const handleInactivity = () => {
      if (isActive) {
        isActive = false;
        trackSession();
      }
    };

    // Set up activity tracking
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Track when page becomes hidden
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        trackSession();
      }
    });

    // Track when user leaves
    window.addEventListener("beforeunload", trackSession);

    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      document.removeEventListener("visibilitychange", trackSession);
      window.removeEventListener("beforeunload", trackSession);
    };
  }, []);
}

// Scroll depth tracking
export function useScrollDepthTracking() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const thresholds = [25, 50, 75, 100];
    const triggered = new Set<number>();

    const trackScrollDepth = () => {
      const scrollTop = window.pageYOffset;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      thresholds.forEach((threshold) => {
        if (scrollPercent >= threshold && !triggered.has(threshold)) {
          triggered.add(threshold);

          if (typeof window.gtag !== "undefined") {
            window.gtag("event", "scroll_depth", {
              value: threshold,
              event_category: "engagement",
            });
          }
        }
      });
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          trackScrollDepth();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
}
