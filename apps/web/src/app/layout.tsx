import type { Metadata } from 'next';
import '@/styles/globals.css';
import Providers from '@/components/providers/Providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://mindbridge.co'),
  title: {
    default: 'MindBridge Colombia — Salud Mental con IA',
    template: '%s | MindBridge Colombia',
  },
  description: 'Plataforma de acompañamiento emocional con inteligencia artificial y psicólogos certificados en Colombia.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
