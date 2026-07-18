# MenteBridge Colombia — Rutas y Estructura Completa

## 🗺️ Mapa de Rutas

### Páginas públicas
| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `src/app/page.tsx` | Landing page completa con hero, features, planes, CTA |
| `/login` | `src/app/(auth)/login/page.tsx` | Inicio de sesión con Google OAuth |
| `/registro` | `src/app/(auth)/registro/page.tsx` | Registro con consentimientos Ley 1581 |

### Dashboard (requiere login)
| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/dashboard` | `src/app/(dashboard)/page.tsx` | Inicio: saludo, stats, accesos rápidos, tip del día |
| `/dashboard/chat` | `src/app/(dashboard)/chat/page.tsx` | Chat con IA clínica + protocolo de crisis |
| `/dashboard/diario` | `src/app/(dashboard)/diario/page.tsx` | Diario emocional: nueva entrada + lista con análisis IA |
| `/dashboard/progreso` | `src/app/(dashboard)/progreso/page.tsx` | Gráficas de ánimo, heatmap, insights de IA |
| `/dashboard/ejercicios` | `src/app/(dashboard)/ejercicios/page.tsx` | 8 ejercicios guiados con modo interactivo paso a paso |
| `/dashboard/citas` | `src/app/(dashboard)/citas/page.tsx` | Directorio psicólogos + agendamiento + videollamada |
| `/dashboard/perfil` | `src/app/(dashboard)/perfil/page.tsx` | Perfil, plan, seguridad, consentimientos |

### APIs
| Método | Ruta | Archivo | Descripción |
|--------|------|---------|-------------|
| POST | `/api/ai/chat` | `src/app/api/ai/chat/route.ts` | Chat IA con Claude + detección de crisis local |
| GET | `/api/diario` | `src/app/api/diario/route.ts` | Listar entradas del diario |
| POST | `/api/diario` | `src/app/api/diario/route.ts` | Crear nueva entrada |
| GET | `/api/animo` | `src/app/api/animo/route.ts` | Historial de registros de ánimo |
| POST | `/api/animo` | `src/app/api/animo/route.ts` | Registrar nuevo ánimo |
| GET | `/api/psicologos` | `src/app/api/psicologos/route.ts` | Buscar psicólogos con filtros |
| GET | `/api/citas` | `src/app/api/citas/route.ts` | Listar citas del usuario |
| POST | `/api/citas` | `src/app/api/citas/route.ts` | Agendar nueva cita |

---

## 📁 Estructura completa de archivos

```
apps/web/
├── package.json                          ← Dependencias del proyecto
├── next.config.js                        ← Config Next.js + headers seguridad
├── tailwind.config.js                    ← Colores y fuentes personalizadas
├── postcss.config.js                     ← PostCSS para Tailwind
│
└── src/
    ├── styles/
    │   └── globals.css                   ← Estilos base + animaciones
    │
    ├── app/
    │   ├── layout.tsx                    ← Layout raíz con fuentes y metadata SEO
    │   ├── page.tsx                      ← Landing page
    │   │
    │   ├── (auth)/                       ← Grupo de rutas sin dashboard
    │   │   ├── login/page.tsx            ← Login
    │   │   └── registro/page.tsx         ← Registro con consentimientos
    │   │
    │   ├── (dashboard)/                  ← Grupo con sidebar y header
    │   │   ├── layout.tsx                ← Layout dashboard: sidebar + header
    │   │   ├── page.tsx                  ← /dashboard — inicio
    │   │   ├── chat/page.tsx             ← /dashboard/chat
    │   │   ├── diario/page.tsx           ← /dashboard/diario
    │   │   ├── progreso/page.tsx         ← /dashboard/progreso
    │   │   ├── ejercicios/page.tsx       ← /dashboard/ejercicios
    │   │   ├── citas/page.tsx            ← /dashboard/citas
    │   │   └── perfil/page.tsx           ← /dashboard/perfil
    │   │
    │   └── api/
    │       ├── ai/chat/route.ts          ← POST: Chat con Claude API
    │       ├── diario/route.ts           ← GET/POST: Diario emocional
    │       ├── animo/route.ts            ← GET/POST: Seguimiento de ánimo
    │       ├── psicologos/route.ts       ← GET: Directorio de psicólogos
    │       └── citas/route.ts            ← GET/POST: Gestión de citas
```

---

## ⚡ Cómo ejecutar

```bash
# 1. Entrar a la carpeta de la app
cd apps/web

# 2. Instalar dependencias
npm install

# 3. Crear .env.local y agregar tu clave de Anthropic
# ANTHROPIC_API_KEY=sk-ant-...

# 4. Iniciar en desarrollo
npm run dev

# 5. Abrir en el navegador
# http://localhost:3000
```

---

## 🔑 Variables de entorno mínimas

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=cualquier-texto-secreto-largo
ANTHROPIC_API_KEY=sk-ant-TU-CLAVE-REAL
```

Sin `ANTHROPIC_API_KEY` real, el chat funciona en **modo demo** con respuestas predefinidas.

---

## 📡 Probar las APIs (Thunder Client o Postman)

```
# Chat con IA
POST http://localhost:3000/api/ai/chat
Body: { "mensaje": "me siento ansioso hoy", "historial": [] }

# Nueva entrada de diario
POST http://localhost:3000/api/diario
Body: { "contenido": "hoy fue un día difícil", "animo": 4, "emociones": ["😰 Ansiedad"] }

# Buscar psicólogos
GET http://localhost:3000/api/psicologos?q=ansiedad&ciudad=bogota&disponible=true

# Registrar ánimo
POST http://localhost:3000/api/animo
Body: { "valor": 7, "emociones": "😌 Calma" }
```

---

## 🚨 Protocolo de Crisis — Palabras que activan detección

El sistema detecta localmente (sin llamar a Claude) las siguientes frases:

**Nivel CRÍTICO** → Modal de crisis inmediato:
- "suicidio", "quitarme la vida", "no quiero vivir", "hacerme daño", "mejor muerto/a", "me corté"

**Nivel ALTO** → Apoyo reforzado + sugerencia de psicólogo:
- "no puedo más", "soy una carga", "todos estarían mejor sin mí", "quiero desaparecer"

**Recursos de crisis Colombia:**
- Línea 106 — Bogotá (24h, gratuita)
- 800-1222-5555 — Nacional
- 123 — Emergencias

---

## ⚖️ Cumplimiento legal Colombia

| Norma | Implementado en |
|-------|----------------|
| Ley 1581/2012 (datos) | `/registro` — consentimientos explícitos |
| Res. 2654/2019 (IA) | Chat — aviso visible, responsable identificado |
| Ley 2460/2025 (salud mental) | Disclaimers en landing, dashboard y chat |
| Ley 1090/2006 (psicólogos) | Verificación COLPSIC en directorio |

---

*MenteBridge Colombia SAS · v1.0 · Mayo 2026*
