import { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.APP_URL;
  const now  = new Date();

  return [
    { url: `${base}/`,                  lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/psicologos`,        lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/sobre-nosotros`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/login`,             lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/registro`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/forgot-password`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
