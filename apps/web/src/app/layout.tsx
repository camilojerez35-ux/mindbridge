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
  metadataBase: new URL('https://mentebridge.com'),
  title: {
    default: 'MenteBridge Colombia — Salud Mental con IA',
    template: '%s | MenteBridge Colombia',
  },
  description: 'Acompañamiento emocional con IA clínica y psicólogos certificados por COLPSIC. Chat 24/7, videocitas, diario emocional. Cumple Ley 1581/2012.',
  keywords: 'salud mental colombia, psicólogo online, terapia online colombia, ansiedad, depresión, bienestar emocional',
  authors: [{ name: 'MenteBridge Colombia' }],
  creator: 'MenteBridge Colombia',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://mentebridge.com',
    siteName: 'MenteBridge Colombia',
    title: 'MenteBridge — Salud Mental con IA y Psicólogos Certificados',
    description: 'Acompañamiento emocional 24/7 con IA clínica y psicólogos verificados por COLPSIC. Gratis para empezar.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MenteBridge — Salud Mental con IA · Colombia' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenteBridge Colombia — Salud Mental con IA',
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
