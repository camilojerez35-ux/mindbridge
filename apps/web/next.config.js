/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  experimental: { serverComponentsExternalPackages: [] },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(), payment=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // unsafe-eval solo en dev (requerido por HMR de Next.js); no en producción
              `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"} https://js.wompi.co https://*.daily.co`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.anthropic.com https://*.daily.co wss://*.daily.co https://api.wompi.co",
              "frame-src https://*.daily.co https://checkout.wompi.co",
              "media-src 'self' blob: https://*.daily.co",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
