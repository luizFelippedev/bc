import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { AppProviders } from '@/contexts'
import { Navbar } from '@/components/layout/Navbar'
import { ThemeScript } from '@/contexts/ThemeContext'
import { ThemeSelector } from '@/components/common/ThemeSelector'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Portfolio Revolucionário',
  description: 'Portfolio profissional com tecnologias avançadas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <ThemeScript />
      </head>
      <body className={inter.className}>
        <AppProviders>
          <Navbar />
          <ThemeSelector />
          {children}
        </AppProviders>
      </body>
    </html>
  )
}