# 🇨🇴 MenteBridge — Plataforma de Salud Mental con IA + Psicólogos

> Plataforma SaaS de bienestar emocional para Colombia, impulsada por la API de Claude (Anthropic) y conectada con psicólogos profesionales verificados.

---

## 📋 Descripción

MenteBridge es una plataforma de acceso económico que combina:

1. **IA Especializada en Salud Mental** — disponible 24/7, empática, clínicamente fundamentada en TCC/ACT, impulsada por Claude API.
2. **Red de Psicólogos Verificados** — teleconsulta con profesionales habilitados en Colombia (COLPSIC), pago por sesión.

**Marco legal:** Ley 2460/2025, Ley 1581/2012, Resolución 2654/2019, Ley 1090/2006.

---

## 🗂️ Estructura del Monorepo

```
mindbridge/
├── apps/
│   └── web/                    # Aplicación Next.js 14 (frontend + API routes)
├── packages/
│   ├── database/               # Prisma ORM + esquema PostgreSQL
│   ├── shared/                 # Tipos, constantes y utilidades compartidas
│   └── ai-clinical/            # Motor de IA clínica (prompts, protocolos, técnicas)
├── backend/                    # Servidor Node.js/Fastify independiente (jobs, webhooks)
├── docs/                       # Documentación legal, técnica, clínica y operacional
├── infrastructure/             # Docker, scripts de deploy, variables de entorno
├── tests/                      # Tests unitarios, integración, E2E y clínicos
└── .github/                    # CI/CD workflows
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Cuenta en [Anthropic API](https://console.anthropic.com)
- Cuenta en [Wompi](https://wompi.co) (pagos Colombia)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-org/mindbridge.git
cd mindbridge

# Instalar dependencias (todos los workspaces)
npm install

# Copiar variables de entorno
cp infrastructure/env/.env.example apps/web/.env.local

# Configurar base de datos
npm run db:migrate
npm run db:seed

# Iniciar en desarrollo
npm run dev
```

### Variables de entorno requeridas
Ver `infrastructure/env/.env.example` para la lista completa.

---

## 🧩 Packages del Monorepo

| Package | Descripción |
|---------|-------------|
| `apps/web` | App Next.js 14 — UI + API Routes |
| `packages/database` | Prisma schema + migrations |
| `packages/shared` | Tipos TypeScript compartidos |
| `packages/ai-clinical` | System prompt, protocolos de crisis, técnicas TCC/ACT |
| `backend` | Jobs, webhooks de pagos, notificaciones |

---

## ⚠️ Aviso Legal Obligatorio

> Esta plataforma es una **herramienta de bienestar emocional**. NO realiza diagnósticos clínicos, NO prescribe medicamentos y NO reemplaza la atención médica o psicológica profesional.
>
> En caso de crisis: **Línea 106** (Bogotá) | **800-1222-5555** (Nacional) | **123** (Emergencias)

**Cumplimiento normativo:**
- Ley 2460/2025 — Salud Mental Colombia
- Ley 1581/2012 — Protección de Datos Personales
- Resolución 2654/2019 — Telesalud y Telemedicina
- Ley 1090/2006 — Código Deontológico del Psicólogo

---

## 📊 KPIs Fase 1 (Mes 6)
- 1.000 usuarios suscriptos
- 50 citas/mes procesadas
- 30 psicólogos activos verificados
- Retención mensual >60%
- NPS >40

---

## 👥 Equipo

| Rol | Responsabilidad |
|-----|----------------|
| CEO/Fundador | Estrategia, inversión, relaciones |
| Psicólogo Co-Fundador | IA clínica, red de profesionales |
| Desarrollador Fullstack | Producto, integraciones |
| Diseñador UX/UI | Interfaz empática |
| Abogado Consultor | Cumplimiento legal |

---

## 📜 Licencia

Propietaria — MenteBridge Colombia SAS © 2026. Todos los derechos reservados.
