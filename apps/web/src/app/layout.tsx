import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Providers from '@/components/providers/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mindbridge.co'),
  title: {
    default: 'MindBridge Colombia — Salud Mental con IA',
    template: '%s | MindBridge Colombia',
  },
  description: 'Acompañamiento emocional con IA clínica y psicólogos certificados por COLPSIC. Chat 24/7, videocitas, diario emocional. Cumple Ley 1581/2012.',
  keywords: 'salud mental colombia, psicólogo online, terapia online colombia, ansiedad, depresión, bienestar emocional',
  authors: [{ name: 'MindBridge Colombia' }],
  creator: 'MindBridge Colombia',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://mindbridge.co',
    siteName: 'MindBridge Colombia',
    title: 'MindBridge — Salud Mental con IA y Psicólogos Certificados',
    description: 'Acompañamiento emocional 24/7 con IA clínica y psicólogos verificados por COLPSIC. Gratis para empezar.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MindBridge — Salud Mental con IA · Colombia' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindBridge Colombia — Salud Mental con IA',
    description: 'Acompañamiento emocional con IA y psicólogos certificados. Disponible 24/7 en Colombia.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
