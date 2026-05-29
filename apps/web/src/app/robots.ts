import { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/psicologos', '/sobre-nosotros', '/blog'],
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/api/',
          '/psicologo',
          '/admin',
          '/reset-password',
          '/verificar-email',
          '/consentimiento-google',
          '/_next/',
          '/monitoring',
        ],
      },
    ],
    sitemap: `${env.APP_URL}/sitemap.xml`,
  };
}
