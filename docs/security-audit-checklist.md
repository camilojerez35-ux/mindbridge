# MindBridge — Checklist de Auditoría de Seguridad
**Versión:** 1.0  
**Fecha:** 2026-07-01  
**Marco legal:** Ley 1581/2012 (protección datos Colombia), Resolución 2654/2019 (telesalud), Ley 1266/2008

---

## 1. Autenticación y gestión de sesiones

| Control | Estado | Notas |
|---|---|---|
| Contraseñas hasheadas con bcrypt (cost=12) | ✅ | `auth-options.ts` |
| Sin almacenamiento de contraseñas en texto plano | ✅ | |
| JWT con expiración configurable (30 días sesión) | ✅ | `auth-options.ts` |
| Tokens de email firmados con HMAC-SHA256 (TTL 24h) | ✅ | `tokens.ts` |
| Tokens de reset firmados con HMAC-SHA256 (TTL 1h) | ✅ | `tokens.ts` |
| Comparación de tokens con `timingSafeEqual` | ✅ | Previene timing attacks |
| Rate limiting en login (10/15 min por IP) | ✅ | `rate-limit.ts` |
| Rate limiting en registro (5/hora por IP) | ✅ | |
| Invalidación de sesión en cambio de contraseña | ⚠️ PENDIENTE | Requiere blacklist de JWT o rotation de secret |
| Protección CSRF en formularios | ⚠️ REVISAR | Next.js mitiga via SameSite Cookie; verificar en pentest |
| `Secure`, `HttpOnly`, `SameSite=Strict` en cookies | ✅ | NextAuth config `SECURE_COOKIE=true` en prod |
| Verificación de email obligatoria antes de login | ✅ | estado `PENDIENTE_VERIFICACION` |
| Dev bypass desactivado en producción | ✅ | Condicionado a `NODE_ENV=development` |
| Verificación de edad ≥ 18 en registro | ✅ | Implementado 2026-07-01 |

**Pendiente para pentest externo:**
- Session fixation
- Token enumeration
- OAuth state parameter validation (Google)
- Concurrent session handling

---

## 2. Autorización y control de acceso

| Control | Estado | Notas |
|---|---|---|
| RBAC (USUARIO, PSICOLOGO, ADMIN, SUPERADMIN) | ✅ | Middleware + DB |
| Rutas `/admin/*` protegidas por rol | ✅ | `middleware.ts` |
| Rutas `/psicologo/*` protegidas por rol | ✅ | |
| Plan-gating para funciones premium | ✅ | |
| Verificación de consentimiento obligatorio | ✅ | Middleware redirige a `/consentimiento` |
| IDOR — acceso cruzado entre usuarios | ⚠️ VERIFICAR | Cada endpoint debe validar que `usuarioId` del token === recurso solicitado. Revisar en pentest. |
| Psicólogo solo ve sus propios pacientes | ⚠️ VERIFICAR | Revisar queries de citas/sesiones en pentest |

---

## 3. Cifrado y protección de datos en salud

| Control | Estado | Notas |
|---|---|---|
| AES-256-GCM para datos clínicos en reposo | ✅ | `encryption.ts` — condicionesPrevias, medicamentos |
| AES-256-GCM para fragmentos de crisis | ✅ | `incident-logger.ts` |
| Clave de cifrado en variable de entorno (no en código) | ✅ | `ENCRYPTION_KEY` (64 hex = 32 bytes) |
| Cifrado en tránsito (HTTPS/TLS) | ✅ | Vercel fuerza HTTPS |
| Datos de salud no incluidos en logs de acceso | ⚠️ VERIFICAR | Asegurar que `metadatos` en audit logs no incluya PII clínica |
| Fragmentos de crisis anonimizados antes de almacenar | ✅ | Solo se guarda fragmento, no ID conversación |
| Política de retención de datos definida | ⚠️ PENDIENTE | Definir TTL para incidentes de crisis y sesiones antiguas |

**Para pentest externo:**
- Test de extracción de claves de cifrado
- Verificar que `ENCRYPTION_KEY` no esté en `.env.example` ni en git history
- Revisar que DB (Supabase) tenga cifrado en reposo habilitado

---

## 4. Validación de entrada y prevención de inyección

| Control | Estado | Notas |
|---|---|---|
| Validación con Zod en todas las rutas API | ✅ | Schemas estrictos (`.strict()`) |
| Prisma ORM previene SQL injection | ✅ | No hay queries raw |
| Sanitización de outputs en React (XSS) | ✅ | Next.js escapa por defecto |
| Tamaño máximo de payload en API | ⚠️ VERIFICAR | Configurar `maxBodySize` en Next.js si no está limitado por Vercel |
| Validación de tipos de archivos subidos | N/A | No hay upload de archivos actualmente |
| Fragmento de crisis limitado a 500 chars | ✅ | CrisisSchema |

---

## 5. Gestión de secretos y variables de entorno

| Control | Estado | Notas |
|---|---|---|
| Secretos en variables de entorno (no en código) | ✅ | |
| `.env` excluido de git (`.gitignore`) | ✅ VERIFICAR | Confirmar con `git log -- .env` |
| `NEXTAUTH_SECRET` ≥ 32 bytes aleatorios | ✅ VERIFICAR | Generar con `openssl rand -hex 32` |
| `ENCRYPTION_KEY` = 64 hex chars (256 bits) | ✅ VERIFICAR | |
| `CRON_SECRET` para proteger endpoints de cron | ✅ | Implementado en crisis-escalacion |
| Rotación de secretos documentada | ⚠️ PENDIENTE | Definir proceso y frecuencia |

---

## 6. Protocolo de crisis y respuesta ante incidentes

| Control | Estado | Notas |
|---|---|---|
| Detección automática de crisis en chat/diario/ánimo | ✅ | |
| Clasificación BAJO/MODERADO/ALTO/CRÍTICO | ✅ | |
| Notificación al psicólogo asignado (email) | ✅ | Niveles ALTO y CRÍTICO |
| Detección de horario fuera de oficina (Colombia UTC-5) | ✅ | Implementado 2026-07-01 |
| Enlace de confirmación de recepción en email | ✅ | Implementado 2026-07-01 |
| Escalación automática si no hay confirmación en 15 min | ✅ | Cron `/api/cron/crisis-escalacion` |
| Botón SOS con líneas de emergencia (123, 106, 800-112-5555) | ✅ | `PanicButton.tsx` |
| Audit log de cada incidente de crisis | ✅ | `registrarAuditLog` |
| Cifrado del fragmento antes de persistir | ✅ | AES-256-GCM |
| **Protocolo de guardia documentado** | ⚠️ PENDIENTE | Ver sección 6.1 |
| Fallback a línea externa si psicólogo no responde (2 ciclos = 30 min CRÍTICO) | ⚠️ PENDIENTE | Segunda escalación hacia guardia/línea externa |

### 6.1 Protocolo de guardia — PENDIENTE definir

Los siguientes puntos deben ser acordados con el equipo clínico y documentados en SLA antes del lanzamiento:

1. **Horario de guardia:** ¿Hay un psicólogo de guardia 24/7 o solo en horario laboral?
2. **Contacto de guardia:** Número de celular del psicólogo de turno (rotativo semanal).
3. **Umbral de escalación:** Propuesta actual — 15 min sin confirmación → segunda alerta; 30 min → alerta a guardia por SMS/WhatsApp.
4. **Fallback final:** Si no hay guardia disponible → instrucción automática al usuario de llamar al 106 / 123, con SMS al número de emergencia del usuario si está registrado.
5. **Registro de incidentes no atendidos:** Todo incidente CRÍTICO sin confirmación en 30 min debe generar un reporte de incidente formal.

---

## 7. Infraestructura y configuración

| Control | Estado | Notas |
|---|---|---|
| HTTPS forzado en todos los endpoints | ✅ | Vercel |
| Cabeceras de seguridad HTTP | ⚠️ VERIFICAR | Agregar `next.config.js` headers: CSP, HSTS, X-Frame-Options, etc. |
| Content Security Policy (CSP) | ⚠️ PENDIENTE | Implementar antes de producción |
| Rate limiting con Redis (Upstash) + fallback in-memory | ✅ | |
| Logs de auditoría inmutables | ⚠️ VERIFICAR | `logAuditoria` sin campo `updatedAt` es buena señal; verificar permisos de DB |
| Monitoreo de errores (Sentry stub) | ⚠️ PENDIENTE | Reemplazar stubs con Sentry real o equivalente |
| Alertas Slack para crisis CRÍTICO | ✅ | `SLACK_WEBHOOK_CRISIS` |
| Supabase Row Level Security (RLS) habilitado | ⚠️ VERIFICAR | Crítico — sin RLS cualquier cliente puede leer cualquier fila |
| Backup de base de datos automatizado | ⚠️ VERIFICAR | Confirmar en Supabase dashboard |

---

## 8. Gaps identificados — Pendientes antes de producción

| # | Gap | Prioridad | Responsable |
|---|---|---|---|
| G1 | Content Security Policy no implementada | ALTA | Dev |
| G2 | Google OAuth: usuario creado sin `fechaNacimiento` — verificación de edad en flujo de consentimiento | ALTA | Dev |
| G3 | Supabase RLS: verificar que está habilitado y políticas definidas | ALTA | Dev/Infra |
| G4 | Cabeceras HTTP de seguridad (CSP, HSTS, X-Frame-Options) en `next.config.js` | ALTA | Dev |
| G5 | Protocolo de guardia 24/7 no definido operacionalmente | CRÍTICA | Equipo clínico |
| G6 | Rotación de secretos (`NEXTAUTH_SECRET`, `ENCRYPTION_KEY`) sin proceso documentado | MEDIA | Dev/Ops |
| G7 | Invalidación de JWT al cambiar contraseña | MEDIA | Dev |
| G8 | Política de retención de datos de crisis | MEDIA | Legal/Dev |
| G9 | Sentry (monitoring) en modo stub — sin alertas reales en producción | MEDIA | Dev |
| G10 | IDOR entre usuarios — verificar en pentest | ALTA | Pentest externo |

---

## 9. Alcance recomendado para pentest externo

El pentest debe cubrir como mínimo:

1. **Autenticación:** Brute force, session fixation, token enumeration, OAuth flow
2. **Autorización:** IDOR entre usuarios (acceso a datos de otros pacientes), escalación de privilegios
3. **Cifrado:** Extracción de claves, debilidades en implementación AES-GCM, IV reuse
4. **Inyección:** SQL (via Prisma), XSS (React), SSRF (en llamadas a APIs externas)
5. **Datos en tránsito:** TLS downgrade, certificate pinning (mobile)
6. **Crisis API:** Abuso del endpoint `/api/ai/crisis` para spam de notificaciones
7. **Cron endpoints:** Verificar que `/api/cron/*` no es accesible sin `CRON_SECRET`
8. **Rate limiting:** Bypass de limits via IP rotation, header spoofing (`X-Forwarded-For`)
9. **Mobile app:** Token storage en SecureStore, certificate pinning, reverse engineering del APK

**Herramientas sugeridas:** OWASP ZAP, Burp Suite Pro, sqlmap, nuclei templates.
**Proveedor recomendado:** Empresa colombiana certificada CREST o equivalente (requerimiento Circular SFC 007/2018).
