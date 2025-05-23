// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { AppProviders } from "@/contexts";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeScript } from "@/contexts/ThemeContext";
import { ThemeSelector } from "@/components/common/ThemeSelector";
import { Analytics } from "@/components/common/Analytics";
import { PWAManager } from "@/components/common/PWA";
import { PerformanceMonitor } from "@/components/common/PerformanceMonitor";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { NoSSR } from "@/components/common/NoSSR";

// Font configuration
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Metadata for SEO
export const metadata: Metadata = {
  title: "Portfolio Luiz Felippe | Engenheiro de Software Full Stack",
  description:
    "Portfolio profissional de Luiz Felippe - Desenvolvedor Full Stack especializado em React, Node.js e IA. Criando experiências digitais excepcionais.",
  keywords: [
    "portfolio",
    "desenvolvedor",
    "full stack",
    "react",
    "nodejs",
    "javascript",
    "typescript",
  ],
  authors: [{ name: "Luiz Felippe", url: "https://luizfelippe.dev" }],
  creator: "Luiz Felippe",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://luizfelippe.dev",
    title: "Portfolio Luiz Felippe | Engenheiro de Software Full Stack",
    description:
      "Portfolio profissional de Luiz Felippe - Desenvolvedor Full Stack especializado em React, Node.js e IA.",
    siteName: "Portfolio Luiz Felippe",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Luiz Felippe | Engenheiro de Software Full Stack",
    description:
      "Portfolio profissional de Luiz Felippe - Desenvolvedor Full Stack especializado em React, Node.js e IA.",
    creator: "@luizfelippedev",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://luizfelippe.dev"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // *******************************************************************
    // PAY EXTREME ATTENTION TO THE WHITESPACE HERE:
    // No newlines or spaces immediately after `>` or before `<` for <html>, <head>, <body>
    // *******************************************************************
    <html
      lang="pt-BR"
      className={inter.variable}
      suppressHydrationWarning={true}
    >
      <head>
        <ThemeScript />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AppProviders>
            {/* Header Components */}
            <Navbar />
            <GlobalSearch />

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer Component */}
            <Footer />

            {/* Utility Components */}
            <NoSSR>
              <ThemeSelector />
              <Analytics />
              <PWAManager />
              {process.env.NODE_ENV === "development" && <PerformanceMonitor />}
            </NoSSR>
          </AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
