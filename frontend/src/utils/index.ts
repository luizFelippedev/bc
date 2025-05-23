// Utility functions and helpers for the portfolio application

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to a readable string
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("pt-BR", defaultOptions).format(dateObj);
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals = [
    { label: "ano", seconds: 31536000 },
    { label: "mês", seconds: 2592000 },
    { label: "semana", seconds: 604800 },
    { label: "dia", seconds: 86400 },
    { label: "hora", seconds: 3600 },
    { label: "minuto", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `há ${count} ${interval.label}${count > 1 ? "s" : ""}`;
    }
  }

  return "agora mesmo";
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate a random ID
 */
export function generateId(length = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Truncate text to a specific length
 */
export function truncate(text: string, length: number, suffix = "..."): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
}

/**
 * Format numbers with proper separators
 */
export function formatNumber(num: number, locale = "pt-BR"): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      textArea.remove();
      return success;
    }
  } catch {
    return false;
  }
}

/**
 * Download a file from URL
 */
export function downloadFile(url: string, filename?: string): void {
  const link = document.createElement("a");
  link.href = url;
  if (filename) {
    link.download = filename;
  }
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

/**
 * Generate a random color
 */
export function generateRandomColor(): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
    "#FF9FF3",
    "#54A0FF",
    "#5F27CD",
    "#00D2D3",
    "#FF9F43",
    "#10AC84",
    "#EE5A24",
    "#0984E3",
    "#6C5CE7",
    "#A29BFE",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Calculate reading time
 */
export function calculateReadingTime(
  text: string,
  wordsPerMinute = 200,
): number {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Get contrast color (black or white) for a given background color
 */
export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return "#000000";

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

/**
 * Get device type
 */
export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (isMobile()) return "mobile";
  if (isTablet()) return "tablet";
  return "desktop";
}

/**
 * Smooth scroll to element
 */
export function smoothScrollTo(elementId: string, offset = 0): void {
  const element = document.getElementById(elementId);
  if (element) {
    const targetPosition = element.offsetTop - offset;
    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }
}

/**
 * Get scroll percentage
 */
export function getScrollPercentage(): number {
  if (typeof window === "undefined") return 0;

  const winScroll =
    document.body.scrollTop || document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  return height > 0 ? (winScroll / height) * 100 : 0;
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency = "BRL",
  locale = "pt-BR",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Local storage with JSON support
 */
export const localStorage = {
  get: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.clear();
    } catch {
      // Silently fail
    }
  },
};

/**
 * Session storage with JSON support
 */
export const sessionStorage = {
  get: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.clear();
    } catch {
      // Silently fail
    }
  },
};

/**
 * Wait for a specified amount of time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      await sleep(delay * Math.pow(2, attempt - 1));
    }
  }

  throw lastError!;
}

/**
 * Check if code is running on server
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Check if code is running on client
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Get query parameter from URL
 */
export function getQueryParam(param: string): string | null {
  if (isServer()) return null;

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Set query parameter in URL
 */
export function setQueryParam(param: string, value: string): void {
  if (isServer()) return;

  const url = new URL(window.location.href);
  url.searchParams.set(param, value);
  window.history.replaceState({}, "", url.toString());
}

/**
 * Remove query parameter from URL
 */
export function removeQueryParam(param: string): void {
  if (isServer()) return;

  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  window.history.replaceState({}, "", url.toString());
}

/**
 * Analytics utilities
 */
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (isServer()) return;

    // Google Analytics
    if (typeof window.gtag !== "undefined") {
      window.gtag("event", event, properties);
    }

    // Custom analytics
    console.log("Analytics Event:", { event, properties });
  },

  page: (path: string) => {
    if (isServer()) return;

    if (typeof window.gtag !== "undefined") {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_TRACKING_ID, {
        page_path: path,
      });
    }
  },
};

/**
 * Error utilities
 */
export const errorUtils = {
  log: (error: Error, context?: Record<string, any>) => {
    console.error("Error:", error.message, { error, context });

    // Send to error tracking service
    if (process.env.NODE_ENV === "production") {
      // Sentry, LogRocket, etc.
    }
  },

  notify: (message: string, type: "error" | "warning" | "info" = "error") => {
    // Show toast notification
    console.log(`${type.toUpperCase()}: ${message}`);
  },
};

/**
 * API utilities
 */
export const apiUtils = {
  isNetworkError: (error: any): boolean => {
    return !error.response && error.request;
  },

  isTimeoutError: (error: any): boolean => {
    return error.code === "ECONNABORTED";
  },

  getErrorMessage: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.message) {
      return error.message;
    }

    return "Ocorreu um erro inesperado";
  },
};
