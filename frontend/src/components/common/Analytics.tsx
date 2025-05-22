'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

// Google Analytics
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

// Custom analytics hook
export function useAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (GA_TRACKING_ID && typeof window.gtag !== 'undefined') {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }

    // Custom analytics
    if (typeof window !== 'undefined') {
      // Send to your custom analytics API
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: path,
      });
    }
  };

  const trackProjectView = (projectId: string, projectTitle: string) => {
    trackEvent('view_project', 'engagement', projectTitle);
  };

  const trackCertificateView = (certificateId: string, certificateTitle: string) => {
    trackEvent('view_certificate', 'engagement', certificateTitle);
  };

  const trackContactForm = (formType: string) => {
    trackEvent('submit_form', 'conversion', formType);
  };

  const trackDownload = (fileName: string, fileType: string) => {
    trackEvent('download', 'engagement', fileName, 1);
  };

  const trackExternalLink = (url: string, linkText: string) => {
    trackEvent('click_external_link', 'engagement', url);
  };

  const trackSearch = (query: string, resultsCount: number) => {
    trackEvent('search', 'engagement', query, resultsCount);
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
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
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
    localStorage.setItem('cookie-consent', JSON.stringify(newPreferences));
    setShowBanner(false);
    
    // Initialize analytics
    if (GA_TRACKING_ID) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
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
    localStorage.setItem('cookie-consent', JSON.stringify(newPreferences));
    setShowBanner(false);
  };

  const customizePreferences = () => {
    // Open preferences modal
    setShowPreferencesModal(true);
  };

  if (!showBanner) return null;

  return (
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
              Utilizamos cookies para melhorar sua experiência, analisar o tráfego do site 
              e personalizar conteúdo. Você pode gerenciar suas preferências a qualquer momento.
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
  );
}

// Performance monitoring
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          // Track page load time
          const loadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'timing_complete', {
              name: 'load',
              value: Math.round(loadTime),
            });
          }
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          const lcpEntry = entry as PerformanceEntry;
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'web_vital', {
              name: 'LCP',
              value: Math.round(lcpEntry.startTime),
              event_category: 'performance',
            });
          }
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint'] });

    return () => observer.disconnect();
  }, []);
}