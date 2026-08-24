# MenteBridge (MindBridge) — Análisis Completo del Proyecto

> Documento generado el 2026-08-23 y actualizado el mismo día tras una sesión de correcciones (bugs críticos de pagos/crisis, features de retención, ajuste de precios).
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
| IA | `@anthropic-ai/sdk` `^0.104.1` — alineado entre raíz y apps/web |
| Validación | Zod `^4.4.3` — alineado entre raíz y apps/web |
| Cache/Rate limit | `ioredis ^5.3.0` + Upstash/Vercel KV |
| Pagos | **Wompi** — integración propia por HTTP firmado, sin SDK de terceros |
| Monitoreo | `@sentry/nextjs ^10.63.0`, PostHog (`posthog-js`/`posthog-node`) |
| Estado global (mobile) | Zustand `^5.0.14` |
| Testing | Vitest `^4.1.9`, Playwright (e2e), Jest + jest-expo (mobile) |
| Otros | date-fns, lucide-react, TailwindCSS `^3.4.0`, pdfkit (reportes/PDF) |

**Email:** Resend, vía HTTP directo sin SDK (`apps/web/src/lib/email/confirmaciones.ts`), con fallback a consola en dev si falta `RESEND_API_KEY`.

---

## 3. Modelo de datos (Prisma, 21 modelos)

Esquema con comentarios explícitos de cumplimiento normativo colombiano (Ley 1581/2012 de habeas data, Resolución 2654/2019 de telemedicina). 9 migraciones aplicadas.

- **Usuario** — núcleo del sistema: consentimientos separados (datos/IA/marketing) con timestamps, campos clínicos sensibles cifrados en aplicación (`motivoConsulta`, `condicionesPrevias`, `medicamentos`), `rol` (USUARIO/ADMIN/PSICOLOGO/SUPERADMIN), `planActual` (GRATIS/**BASICO**/PLUS/FAMILIA/EMPRESARIAL), derecho al olvido con ventana de 30 días, `pushToken` para Expo, y campos de dedup de recordatorios (`ultimoReengagementEnviadoEn`, `ultimaInactividadIAEnviadoEn`) para que los crons de reengagement no reenvíen indefinidamente.
- **Suscripcion → Pago** — pasarela (Wompi/ePayco), método (PSE/NEQUI/TARJETA), estados ACTIVA/VENCIDA/CANCELADA/PAUSADA/PRUEBA.
- **SesionChat → MensajeChat** — chat con IA: ánimo antes/después, flag `huboEventoCrisis`, **muestreo de revisión clínica** (para detectar drift del modelo), y marcado de crisis por mensaje (`esCrisis`/`nivelCrisis`).
- **EntradaDiario / RegistroAnimo / EjercicioCompletado** — diario con análisis IA embebido, registro puntual de ánimo, tracking de ejercicios (mindfulness, etc.).
- **Psicologo** — verificación de tarjeta profesional (COLPSIC), especialidades, enfoque terapéutico, disponibilidad en JSON, ciclo de vida PENDIENTE_VERIFICACION → VERIFICADO → ACTIVO/SUSPENDIDO/RECHAZADO.
- **Cita** — comisión de plataforma del 20% explícita en el modelo, campos de videollamada con tokens separados por rol, notas clínicas cifradas, auditoría de cancelación, y campos de dedup de recordatorios (`recordatorio24hEnviadoEn`, `recordatorio1hEnviadoEn`) para que el cron de notificaciones sea idempotente.
- **Pago / PagosPsicologo** — `idTransaccionPasarela` único (previene duplicados), liquidaciones mensuales a psicólogos.
- **Resena** — calificación 1-5 con moderación.
- **IncidenteCrisis** — nivel, indicadores detectados, fragmento anonimizado, token de confirmación único, resolución.
- **Consentimiento + AuditLog** — trazabilidad legal; `AuditLog` deliberadamente sin FK a Usuario para sobrevivir al derecho al olvido.
- **ResultadoTest** (PHQ-9, GAD-7, DASS-21...), **PerfilPersonalizacion**, **ConsejoDiario**, **ProgresoCurso**, **TareaSesion**, **ResumenSemanal** (generado por IA), **SenalRTC** (señalización WebRTC P2P, expira a las 24h).

---

## 4. Rutas API (`apps/web/src/app/api`, ~60 endpoints)

- **Auth**: `[...nextauth]`, `forgot-password`, `reset-password`, `verificar-email`, `reenviar-verificacion`, `mobile-login`, `consentimiento-google` (el registro vive en `usuarios/registro`, ver más abajo).
- **Chat IA**: `ai/chat`, `ai/crisis`, `chat/sesiones`, `chat/sesiones/[id]`.
- **Crisis**: `crisis/confirmar/[token]`, `cron/crisis-escalacion` (cada 15 min vía GitHub Actions).
- **Citas/videollamadas**: `citas`, `citas/[citaId]/confirmar`, `citas/[citaId]/sala`, `videollamada/[citaId]/signal`.
- **Pagos**: `pagos`, `webhooks/wompi` (única implementación — se eliminó el duplicado `pagos/webhook`, ver §10).
- **Psicólogos**: `psicologos`, `psicologos/[psicologoId]`, `psicologos/perfil`, `psicologos/registro`, `psicologos/verificar`, `psicologo/citas*`, `psicologo/pacientes/[usuarioId]/historia`, `psicologo/tareas*`, `psicologo/notificaciones`.
- **Admin**: `admin/psicologos`, `admin/psicologos/[id]/verificar`, `admin/revision-muestral`.
- **Usuarios**: `usuarios`, `usuarios/registro`, `usuarios/datos`, `usuarios/eliminar-datos`, `usuarios/password`, `usuarios/plan`, `usuarios/consentimiento`.
- **Contenido**: `diario`, `diario/[id]`, `animo`, `ejercicios/completados`, `tests`, `tests/resultado`, `consejo-dia`, `cursos/progreso`, `tareas`, `resumen-semanal`.
- **Otros**: `dashboard/stats`, `stats`, `resenas`, `notificaciones`, `dispositivos`, `consentimiento`, `health`.

---

## 5. Funcionalidades clave

- **Chat con IA clínica**: `packages/ai-clinical` con prompts especializados (TCC/ACT/mindfulness), detección de crisis integrada en cada mensaje, **prompt caching** en el system prompt clínico estático (reduce costo sin cambiar comportamiento), mensaje de bienvenida abierto y empático al iniciar.
- **Sistema de crisis/escalamiento**: conecta al psicólogo asignado por cita más reciente; si el usuario **no tiene psicólogo asignado**, escala al correo de administración en vez de quedar en silencio (fix reciente — antes afectaba justo a usuarios nuevos/plan gratuito). Cron cada 15 min vía GitHub Actions (Vercel Hobby solo permite crons diarios), tokens de confirmación.
- **Pagos Wompi**: única implementación (`api/webhooks/wompi`) tras eliminar un duplicado inseguro. La verificación de firma tenía un bug crítico que rechazaba **todos** los webhooks reales (navegaba el payload mal); corregido y cubierto con 8 tests de integración.
- **Videollamadas**: señalización WebRTC P2P propia (modelo `SenalRTC`, sin Twilio/Agora), con limpieza automática diaria.
- **Citas**: comisión de plataforma fija del 20%, notas clínicas separadas de notas de IA. Recordatorios de 24h/1h antes rediseñados para ser idempotentes y auto-reparables (antes prácticamente nunca se disparaban — ver §10).
- **Tests psicológicos**: tipo PHQ-9/GAD-7/DASS-21, resultados persistidos.
- **Diario emocional**: con análisis IA y detección de patrones.
- **Suscripciones**: GRATIS/**BASICO**/PLUS/FAMILIA/EMPRESARIAL. Plan Básico nuevo ($14.900 COP/mes), precios actualizados (Plus $25.900, Familia $44.900), facturación anual para Plus ($259.000 = 10 meses). Sin videollamadas incluidas — se agendan y pagan por aparte (20% comisión).
- **Retención**: racha de días consecutivos registrando ánimo (web y mobile), gráfica de ánimo de las últimas 4 semanas en el dashboard/home, push de reengagement a usuarios inactivos 3+ días (máx. 1 vez por semana por usuario).
- **Analytics**: eventos de PostHog conectados en los puntos clave del funnel (registro, login, chat, crisis, citas, upgrade de plan) — la infraestructura ya existía pero no se invocaba en ningún lado.

---

## 6. App móvil (Expo)

Pantallas vía Expo Router: auth (login/registro/forgot-password), tabs (chat, diario, home, perfil, psicólogos), agendar cita, chat detalle, citas, editar-perfil, estadísticas, onboarding, perfil de psicólogo, suscripción, tests, videollamada.

Estructura: `lib/api`, `lib/storage`, `store` (Zustand), `hooks`, `components`. 27 archivos de test bajo `__tests__/`. Trabajo reciente en componentes/hooks reutilizables, push notifications Expo, disponibilidad real, banner offline, config EAS lista para build. Nuevo componente `RachaAnimo` (racha + gráfica semanal en el home) y toggle mensual/anual en la pantalla de suscripción.

---

## 7. Seguridad y compliance

Commits recientes muy enfocados en seguridad (orden cronológico aprox.):

- Corrección de 24 issues de auditoría (5 críticos, 7 altos, 8 medios, 4 bajos).
- Sentry real conectado, registro de usuarios endurecido.
- Cierre de IDOR en reseñas.
- Invalidación de sesiones tras cambio de contraseña, verificación de edad en OAuth Google.
- Escalamiento de crisis real conectado a psicólogo + cron cada 15 min.
- Endurecimiento de verificación Wompi, cron y tokens de reset.
- **(2026-08-23)** Fix crítico: la verificación de firma del webhook de Wompi rechazaba todos los pagos reales (navegaba `body` en vez de `body.data`) — ningún pago se hubiera activado nunca en producción. Corregido y probado. Eliminado un segundo webhook de Wompi duplicado con el mismo tipo de bug, no usado por el código pero con riesgo de reactivarse por error.
- **(2026-08-23)** Fix: escalamiento de crisis sin psicólogo asignado ya no queda en silencio (escala a admin).
- **(2026-08-23)** Eliminados endpoints huérfanos: `api/dev/test-email`, `api/consejo-del-dia` (duplicado), `packages/shared` (sin `package.json`, no importado por nadie).

Librerías dedicadas: `apps/web/src/lib/encryption.ts`, `apps/web/src/lib/rate-limit.ts`, `apps/web/src/lib/env.ts`. `AuditLog` en Prisma para trazabilidad. Cron de escalamiento protegido con `CRON_SECRET` vía Bearer token.

---

## 8. Testing

- **`tests/` (raíz)**: unit (crisis-protocol, encryption, tokens), integration (chat-api, registro, sesiones, usuarios-registro, **webhook-wompi** — 8 casos: firma, anti-tampering de monto, activación mensual/anual, idempotencia, confirmación de cita, **notificaciones** — 12 casos: ventanas de recordatorios de citas por dedup, zona horaria de "hoy", reintento de inactividad-ia, límite de reenvío de reengagement), e2e con Playwright (landing, registro, chat-crisis, psicólogos, flujo-usuario), y suite de IA clínica (`protocol-crisis-test.ts`) que actúa como **gate obligatorio en CI**.
- **Mobile**: 27 archivos de test (components/hooks/lib/store).
- **`apps/web`**: sin tests propios dentro del workspace — todo centralizado en `tests/` raíz; cobertura sigue siendo parcial frente a ~60 rutas API — cubiertos: pagos/webhook, crons de notificaciones, chat/crisis, registro de usuarios, sesiones de chat. Faltan: login, citas (creación), suscripciones (creación de intención de pago), reset/forgot password.
- **Estado actual**: 134/134 tests pasando, typecheck y build de producción limpios.

---

## 9. CI/CD y deploy

- `.github/workflows/ci-cd.yml`: gate obligatorio de tests clínicos (bloquea todo si falla el protocolo de crisis) → lint/typecheck → tests unitarios con cobertura a Codecov → auditoría de seguridad (`npm audit` + TruffleHog para secretos) → build → deploy condicional a staging (`develop`) y producción (`main`) vía Vercel CLI, con dry-run de migraciones Prisma.
- `.github/workflows/crisis-escalacion-cron.yml`: workaround para la limitación de Vercel Hobby (crons nativos solo diarios) — llama al endpoint de escalamiento cada 15 min.
- `.github/workflows/recordatorios-citas-cron.yml` (**nuevo**): mismo workaround para los recordatorios de citas 24h/1h — corre cada hora vía GitHub Actions; se movieron desde `vercel.json` porque un cron diario con ventana de horas dejaba sin cubrir casi todas las citas reales.
- `apps/web/vercel.json`: 4 crons nativos (recordatorio de ánimo, inactividad IA semanal, limpieza de señales RTC, reengagement de 3 días).
- `turbo.json`: pipeline dev/build/lint/test/typecheck/start, con env vars propagadas (Wompi, Anthropic, Sentry, Redis/Upstash/KV, JWT/encryption keys).

---

## 10. Deuda técnica — resuelta hoy y pendiente

### Resuelto en la sesión del 2026-08-23

1. ~~Versiones desalineadas: `@anthropic-ai/sdk` y `zod`~~ — alineadas entre raíz y `apps/web`; corregidos los breaking changes reales de Zod v3→v4 (`.errors`→`.issues`, `z.literal` con `message`, `z.record` con dos argumentos).
2. ~~`packages/shared` sin `package.json`~~ — eliminado (código muerto).
3. ~~Rutas duplicadas: `api/consejo-del-dia`~~ — eliminada.
4. ~~Endpoint de desarrollo expuesto: `api/dev/test-email`~~ — eliminado.
5. **🔴 Bug crítico encontrado y corregido**: la verificación de firma del webhook de Wompi rechazaba todos los pagos reales — ningún pago se habría activado nunca en producción. Además se encontró y eliminó un segundo webhook de Wompi duplicado (`api/pagos/webhook` + `api/pagos/wompi.ts`) con el mismo tipo de bug, sin usar en el código pero con riesgo de reactivarse por error.
6. **Gap de seguridad clínica corregido**: escalamiento de crisis quedaba en silencio si el usuario no tenía psicólogo asignado (afectaba justo a usuarios nuevos/plan gratuito) — ahora escala a admin.
7. **Bug funcional corregido**: los recordatorios de citas 24h/1h antes prácticamente nunca se disparaban (cron diario con ventana de horas) — rediseñados a idempotentes/auto-reparables, movidos a GitHub Actions cada hora.
8. **Bug de zona horaria corregido**: `recordatorioAnimo` calculaba "hoy" en UTC del servidor en vez de hora de Bogotá.
9. **Gaps de producto corregidos**: `inactividadIA` solo notificaba una vez por usuario (nunca reintentaba); `reengagement3Dias` no tenía límite y podía enviar push diario indefinido — ambos ahora acotados.
10. Analytics (PostHog) conectado — la infraestructura existía pero no se invocaba en ningún lado.
11. Tests de integración agregados: webhook de Wompi (8 casos) y crons de notificaciones (12 casos, reproducen los 4 bugs corregidos).
12. ~~`api/auth/registro` huérfano~~ — eliminado junto con su test dedicado (`tests/integration/registro.test.ts`), confirmado sin referencias en web ni mobile. El registro real sigue siendo `api/usuarios/registro`.

### Pendiente

1. **React 18 (web) vs React 19 (mobile)**: divergencia de major version que puede complicar código compartido. El plan es esperar a que Next.js soporte React 19 completamente — no forzar antes.
2. Cobertura de tests en `apps/web` sigue siendo parcial frente a ~60 rutas API — cubiertos: pagos/webhook y crons de notificaciones (ambos con bugs reales encontrados y corregidos), chat/crisis, registro de usuarios, sesiones. Prioridad sugerida para lo que falta: login (`auth-options.authorize`), citas, suscripciones/pagos (creación de intención), reset/forgot password.
3. Verificación operativa pendiente: confirmar contra el sandbox real de Wompi que el fix de firma funciona con webhooks genuinos (no solo con los tests, que simulan la firma) — hay un runbook preparado para esto, pendiente de ejecutar antes del primer pago real en producción.

---

## Resumen ejecutivo

MenteBridge es un SaaS de salud mental maduro en su modelado de datos y notablemente enfocado en compliance colombiano (habeas data, telemedicina) y seguridad clínica (protocolo de crisis con gate en CI, cifrado de datos sensibles, auditoría inmutable). Una sesión de auditoría el 2026-08-23 encontró y corrigió un **bug crítico que habría bloqueado todos los pagos en producción** (firma del webhook de Wompi mal calculada) junto con un webhook duplicado con el mismo defecto, un gap de escalamiento de crisis para usuarios sin psicólogo asignado, y recordatorios de citas que casi nunca se ejecutaban. En la misma sesión se alinearon las dependencias entre workspaces, se agregó el plan de precios Básico con facturación anual, se conectó la infraestructura de analytics ya existente, y se añadieron features de retención (racha, gráfica de ánimo, reengagement). El código queda con 131 tests pasando, typecheck y build limpios. El riesgo remanente principal es la cobertura de tests aún parcial en `apps/web` frente al volumen de rutas API.
