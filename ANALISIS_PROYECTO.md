# MenteBridge (MindBridge) — Análisis Completo del Proyecto

> Documento generado el 2026-08-23 mediante análisis del código actual del repositorio.
> SaaS de salud mental para Colombia: chat con IA clínica, psicólogos verificados, citas/videollamadas, tests psicológicos, diario emocional y sistema de suscripciones.

---

## 1. Estructura del monorepo

Turborepo con npm workspaces (`apps/*`, `packages/*`, `backend`). El paquete raíz sigue llamándose `mindbridge` internamente aunque la marca visible pasó a **MenteBridge**.

```
mindbridge/
├── apps/
│   ├── web/        @mindbridge/web     — Next.js 14 App Router (producto principal + API)
│   └── mobile/     @mindbridge/mobile  — Expo Router / React Native
├── packages/
│   ├── database/   @mindbridge/database  — Prisma schema, migraciones, seed
│   └── ai-clinical/@mindbridge/ai-clinical — lógica clínica IA (prompts, protocolo de crisis)
├── backend/        @mindbridge/backend — servidor Express standalone para jobs/workers
├── tests/          — unit, integration, e2e (Playwright), ai-clinical
├── docs/, infrastructure/, scripts/, .github/workflows/
```

---

## 2. Stack tecnológico

| Área | Tecnología |
|---|---|
| Runtime | Node ≥20, npm ≥10 (`packageManager: npm@11.12.1`) |
| Web | Next.js `^14.2.0` (App Router), React `^18.3.0` |
| Mobile | Expo `~56.0.12`, Expo Router `~56.2.11`, React Native `0.85.3`, **React 19.2.3** |
| ORM | Prisma `^5.14.0` (database, web, backend) |
| Auth | NextAuth `^4.24.14` (web) + JWT propio (`jsonwebtoken`, `bcryptjs`) para login móvil |
| IA | `@anthropic-ai/sdk` — **`^0.104.1` en raíz vs `^0.24.0` en apps/web** (desalineado) |
| Validación | Zod — **`^4.4.3` en raíz vs `^3.23.0` en apps/web** (desalineado) |
| Cache/Rate limit | `ioredis ^5.3.0` + Upstash/Vercel KV |
| Pagos | **Wompi** — integración propia por HTTP firmado, sin SDK de terceros |
| Monitoreo | `@sentry/nextjs ^10.63.0`, PostHog (`posthog-js`/`posthog-node`) |
| Estado global (mobile) | Zustand `^5.0.14` |
| Testing | Vitest `^4.1.9`, Playwright (e2e), Jest + jest-expo (mobile) |
| Otros | date-fns, lucide-react, TailwindCSS `^3.4.0`, pdfkit (reportes/PDF) |

**Nota:** no se confirmó SendGrid ni otro proveedor de email en los `package.json`; requiere revisar `apps/web/src/lib` directamente si es relevante.

---

## 3. Modelo de datos (Prisma, ~744 líneas, 20 modelos)

Esquema con comentarios explícitos de cumplimiento normativo colombiano (Ley 1581/2012 de habeas data, Resolución 2654/2019 de telemedicina).

- **Usuario** — núcleo del sistema: consentimientos separados (datos/IA/marketing) con timestamps, campos clínicos sensibles cifrados en aplicación (`motivoConsulta`, `condicionesPrevias`, `medicamentos`), `rol` (USUARIO/ADMIN/PSICOLOGO/SUPERADMIN), `planActual` (GRATIS/PLUS/FAMILIA/EMPRESARIAL), derecho al olvido con ventana de 30 días, `pushToken` para Expo.
- **Suscripcion → Pago** — pasarela (Wompi/ePayco), método (PSE/NEQUI/TARJETA), estados ACTIVA/VENCIDA/CANCELADA/PAUSADA/PRUEBA.
- **SesionChat → MensajeChat** — chat con IA: ánimo antes/después, flag `huboEventoCrisis`, **muestreo de revisión clínica** (para detectar drift del modelo), y marcado de crisis por mensaje (`esCrisis`/`nivelCrisis`).
- **EntradaDiario / RegistroAnimo / EjercicioCompletado** — diario con análisis IA embebido, registro puntual de ánimo, tracking de ejercicios (mindfulness, etc.).
- **Psicologo** — verificación de tarjeta profesional (COLPSIC), especialidades, enfoque terapéutico, disponibilidad en JSON, ciclo de vida PENDIENTE_VERIFICACION → VERIFICADO → ACTIVO/SUSPENDIDO/RECHAZADO.
- **Cita** — comisión de plataforma del 20% explícita en el modelo, campos de videollamada con tokens separados por rol, notas clínicas cifradas, auditoría de cancelación.
- **Pago / PagosPsicologo** — `idTransaccionPasarela` único (previene duplicados), liquidaciones mensuales a psicólogos.
- **Resena** — calificación 1-5 con moderación.
- **IncidenteCrisis** — nivel, indicadores detectados, fragmento anonimizado, token de confirmación único, resolución.
- **Consentimiento + AuditLog** — trazabilidad legal; `AuditLog` deliberadamente sin FK a Usuario para sobrevivir al derecho al olvido.
- **ResultadoTest** (PHQ-9, GAD-7, DASS-21...), **PerfilPersonalizacion**, **ConsejoDiario**, **ProgresoCurso**, **TareaSesion**, **ResumenSemanal** (generado por IA), **SenalRTC** (señalización WebRTC P2P, expira a las 24h).

---

## 4. Rutas API (`apps/web/src/app/api`, ~60 endpoints)

- **Auth**: `[...nextauth]`, `registro`, `forgot-password`, `reset-password`, `verificar-email`, `reenviar-verificacion`, `mobile-login`, `consentimiento-google`.
- **Chat IA**: `ai/chat`, `ai/crisis`, `chat/sesiones`, `chat/sesiones/[id]`.
- **Crisis**: `crisis/confirmar/[token]`, `cron/crisis-escalacion` (cada 15 min vía GitHub Actions).
- **Citas/videollamadas**: `citas`, `citas/[citaId]/confirmar`, `citas/[citaId]/sala`, `videollamada/[citaId]/signal`.
- **Pagos**: `pagos`, `pagos/webhook`, `webhooks/wompi`.
- **Psicólogos**: `psicologos`, `psicologos/[psicologoId]`, `psicologos/perfil`, `psicologos/registro`, `psicologos/verificar`, `psicologo/citas*`, `psicologo/pacientes/[usuarioId]/historia`, `psicologo/tareas*`, `psicologo/notificaciones`.
- **Admin**: `admin/psicologos`, `admin/psicologos/[id]/verificar`, `admin/revision-muestral`.
- **Usuarios**: `usuarios`, `usuarios/registro`, `usuarios/datos`, `usuarios/eliminar-datos`, `usuarios/password`, `usuarios/plan`, `usuarios/consentimiento`.
- **Contenido**: `diario`, `diario/[id]`, `animo`, `ejercicios/completados`, `tests`, `tests/resultado`, `consejo-dia`, `cursos/progreso`, `tareas`, `resumen-semanal`.
- **Otros**: `dashboard/stats`, `stats`, `resenas`, `notificaciones`, `dispositivos`, `consentimiento`, `health`.

---

## 5. Funcionalidades clave

- **Chat con IA clínica**: `packages/ai-clinical` con prompts especializados, técnicas TCC/ACT/mindfulness, detección de crisis integrada en cada mensaje.
- **Sistema de crisis/escalamiento**: endurecido recientemente — conecta escalamiento real al psicólogo asignado, cron cada 15 min vía GitHub Actions (Vercel Hobby solo permite crons diarios), tokens de confirmación.
- **Pagos Wompi**: implementación propia con webhook, verificación de firma reforzada recientemente.
- **Videollamadas**: señalización WebRTC P2P propia (modelo `SenalRTC`, sin Twilio/Agora), con limpieza automática diaria.
- **Citas**: comisión de plataforma fija del 20%, notas clínicas separadas de notas de IA.
- **Tests psicológicos**: tipo PHQ-9/GAD-7/DASS-21, resultados persistidos.
- **Diario emocional**: con análisis IA y detección de patrones.
- **Suscripciones**: GRATIS/PLUS/FAMILIA/EMPRESARIAL; se quitaron videollamadas gratis de planes Plus/Familia recientemente.

---

## 6. App móvil (Expo)

Pantallas vía Expo Router: auth (login/registro/forgot-password), tabs (chat, diario, home, perfil, psicólogos), agendar cita, chat detalle, citas, editar-perfil, estadísticas, onboarding, perfil de psicólogo, suscripción, tests, videollamada.

Estructura: `lib/api`, `lib/storage`, `store` (Zustand), `hooks`, `components`. 27 archivos de test bajo `__tests__/`. Trabajo reciente en componentes/hooks reutilizables, push notifications Expo, disponibilidad real, banner offline, config EAS lista para build.

---

## 7. Seguridad y compliance

Commits recientes muy enfocados en seguridad (orden cronológico aprox.):

- Corrección de 24 issues de auditoría (5 críticos, 7 altos, 8 medios, 4 bajos).
- Sentry real conectado, registro de usuarios endurecido.
- Cierre de IDOR en reseñas.
- Invalidación de sesiones tras cambio de contraseña, verificación de edad en OAuth Google.
- Escalamiento de crisis real conectado a psicólogo + cron cada 15 min.
- Endurecimiento de verificación Wompi, cron y tokens de reset (commit más reciente).

Librerías dedicadas: `apps/web/src/lib/encryption.ts`, `apps/web/src/lib/rate-limit.ts`, `apps/web/src/lib/env.ts`. `AuditLog` en Prisma para trazabilidad. Cron de escalamiento protegido con `CRON_SECRET` vía Bearer token.

---

## 8. Testing

- **`tests/` (raíz)**: unit (crisis-protocol, encryption, tokens), integration (chat-api, registro, sesiones, usuarios-registro), e2e con Playwright (landing, registro, chat-crisis, psicólogos, flujo-usuario), y suite de IA clínica (`protocol-crisis-test.ts`) que actúa como **gate obligatorio en CI**.
- **Mobile**: 27 archivos de test (components/hooks/lib/store).
- **`apps/web`**: sin tests propios dentro del workspace — todo centralizado en `tests/` raíz; cobertura probablemente parcial frente a ~60 rutas API.

---

## 9. CI/CD y deploy

- `.github/workflows/ci-cd.yml`: gate obligatorio de tests clínicos (bloquea todo si falla el protocolo de crisis) → lint/typecheck → tests unitarios con cobertura a Codecov → auditoría de seguridad (`npm audit` + TruffleHog para secretos) → build → deploy condicional a staging (`develop`) y producción (`main`) vía Vercel CLI, con dry-run de migraciones Prisma.
- `.github/workflows/crisis-escalacion-cron.yml`: workaround para la limitación de Vercel Hobby (crons nativos solo diarios) — llama al endpoint de escalamiento cada 15 min.
- `apps/web/vercel.json`: 5 crons nativos (notificaciones de citas 24h/1h, recordatorio de ánimo, inactividad IA semanal, limpieza de señales RTC).
- `turbo.json`: pipeline dev/build/lint/test/typecheck/start, con env vars propagadas (Wompi, Anthropic, Sentry, Redis/Upstash/KV, JWT/encryption keys).

---

## 10. Deuda técnica y pendientes

1. **Versiones desalineadas entre workspaces**: `@anthropic-ai/sdk` (`^0.104.1` raíz vs `^0.24.0` web) y `zod` (`^4.4.3` raíz vs `^3.23.0` web) — riesgo de comportamiento divergente según qué instalación resuelva npm.
2. ~~`packages/shared` sin `package.json`~~ — eliminado (código muerto, tipos duplicados que no importaba ni web ni mobile).
3. ~~Rutas API duplicadas: `api/consejo-del-dia` y `api/consejo-dia`~~ — eliminado `consejo-del-dia` (el frontend, web y mobile, usa `consejo-dia`).
4. ~~Endpoint de desarrollo expuesto: `api/dev/test-email`~~ — eliminado (ya estaba gateado con 403 en producción, se removió por higiene de código).
5. **React 18 (web) vs React 19 (mobile)**: divergencia de major version que puede complicar código compartido.
6. Muy pocos `TODO`/`FIXME` en código (buena señal, sin bloqueos explícitos marcados).
7. El historial de commits reciente es casi enteramente de fixes de seguridad y build previos a lanzamiento — el proyecto está en **fase de estabilización pre-producción**, no de features nuevas.
8. Proveedor de email no confirmado en dependencias — verificar directamente en `apps/web/src/lib`.
9. Ausencia de tests dentro de `apps/web` mismo puede dificultar mantener cobertura a medida que crecen las rutas API.

---

## Resumen ejecutivo

MenteBridge es un SaaS de salud mental maduro en su modelado de datos y notablemente enfocado en compliance colombiano (habeas data, telemedicina) y seguridad clínica (protocolo de crisis con gate en CI, cifrado de datos sensibles, auditoría inmutable). El código está en **fase de estabilización pre-lanzamiento**: la mayoría de commits recientes son fixes de seguridad, no features nuevas. Los riesgos principales identificados son de **consistencia de dependencias** (SDK de Anthropic y Zod con versiones distintas entre workspaces) y algunos **cabos sueltos de rutas/endpoints** (posible duplicado, endpoint de dev expuesto) más que fallas arquitectónicas de fondo.
