import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/client-providers'
import { Toaster } from 'react-hot-toast'
import { NavigationLoading } from '@/components/ui/navigation-loading'
import dynamic from 'next/dynamic'

const FloatingElements = dynamic(() => import('@/components/3d/floating-elements'), {
  ssr: false,
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'FraudShield - AI-Powered Fraud Detection',
  description: 'Advanced AI fraud detection system with real-time analysis and comprehensive dashboard',
  keywords: ['fraud detection', 'AI', 'security', 'fintech', 'machine learning'],
  authors: [{ name: 'FraudShield Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#fbbf24',
  openGraph: {
    title: 'FraudShield - AI-Powered Fraud Detection',
    description: 'Advanced AI fraud detection system with real-time analysis',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-dark-900 text-white">
        <div id="root" className="relative">
          <NavigationLoading />
          <FloatingElements />
          <ClientProviders>
            <div className="cyber-bg min-h-screen">
              {children}
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f1f1f',
                  color: '#fff',
                  border: '1px solid #fbbf24',
                },
                success: {
                  iconTheme: {
                    primary: '#fbbf24',
                    secondary: '#000',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </ClientProviders>
        </div>
      </body>
    </html>
  )
}