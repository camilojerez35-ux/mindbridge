const plugin = require('tailwindcss/plugin');

/**
 * Paleta de MenteBridge — fuente única de verdad.
 * Tailwind genera las clases (bg-surface, text-ink-subtle…) y el plugin de abajo expone
 * los mismos valores como variables CSS (--surface, --ink-subtle…) para los estilos inline.
 * Contrastes medidos con WCAG 2.1 (mínimo 4.5:1 para texto normal).
 */
const surface = {
  DEFAULT: '#0d1a12', // bg-surface  (sidebar, cards, topbar)
  deep:    '#080f0a', // bg-surface-deep (fondo principal)
  alt:     '#0a1510', // bg-surface-alt  (videollamada, secciones alternas)
  card:    '#1a2e1f', // bg-surface-card (modales, cards elevadas)
};

// Texto sobre superficies oscuras — todos ≥ 4.5:1 incluso sobre surface-card
const ink = {
  DEFAULT: '#ffffff',
  soft:    '#c9dccf', // cuerpo de texto largo                (10.6:1 sobre surface)
  muted:   '#8aab96', // texto secundario                     (7.1:1 sobre surface)
  subtle:  '#7a9e87', // terciario: fechas, metadatos, ayudas (4.9:1 sobre surface-card)
};

// Texto sobre fondos de acento brillantes (teal-400/500, esmeralda) — 9.2:1 sobre teal-400
const onAccent = '#04201b';

/** { DEFAULT: x, deep: y } → { '--surface': x, '--surface-deep': y } */
function comoVariables(prefijo, escala) {
  return Object.fromEntries(
    Object.entries(escala).map(([k, v]) => [k === 'DEFAULT' ? `--${prefijo}` : `--${prefijo}-${k}`, v]),
  );
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        surface,
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
        ink,
        'on-accent': onAccent,
      },
      fontFamily: {
        // Usa la variable CSS inyectada por next/font (sin request a Google Fonts en runtime)
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ':root': {
          ...comoVariables('surface', surface),
          ...comoVariables('ink', ink),
          '--on-accent': onAccent,
        },
      });
    }),
  ],
};
