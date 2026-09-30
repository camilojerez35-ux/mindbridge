/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Tokens de superficie — sustituyen los hex hardcoded en componentes
        surface: {
          DEFAULT: '#0d1a12', // bg-surface  (sidebar, cards, topbar)
          deep:    '#080f0a', // bg-surface-deep (fondo principal)
          alt:     '#0a1510', // bg-surface-alt  (videollamada, secciones alternas)
          card:    '#1a2e1f', // bg-surface-card (modales, cards elevadas)
        },
        // Colores de marca
        brand: {
          50:  '#e8f5ee',
          100: '#c5e8d4',
          500: '#2d9e6f',
          600: '#1a6b4a',
          700: '#145438',
          800: '#0d3d29',
          900: '#0d1a12',
        },
        teal: { DEFAULT: '#2dd4bf' },
        // Texto sobre superficies oscuras — todos ≥ 4.5:1 (WCAG AA) incluso sobre surface-card
        ink: {
          DEFAULT: '#ffffff',
          soft:    '#c9dccf', // cuerpo de texto largo            (10.6:1 sobre surface)
          muted:   '#8aab96', // texto secundario                 (7.1:1 sobre surface)
          subtle:  '#7a9e87', // terciario: fechas, metadatos, ayudas (4.9:1 sobre surface-card)
        },
        // Texto sobre fondos de acento brillantes (teal-400/500, esmeralda) — 9.2:1 sobre teal-400
        'on-accent': '#04201b',
      },
      fontFamily: {
        // Usa la variable CSS inyectada por next/font (sin request a Google Fonts en runtime)
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
