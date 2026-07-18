# CHECKLIST — DATA PROCESSING AGREEMENTS (DPA)
## Transferencias Internacionales de Datos — Ley 1581/2012 Art. 26
### MenteBridge Colombia SAS

> Los DPA deben firmarse ANTES del lanzamiento. Sin ellos, las transferencias
> de datos a servidores en EE.UU. no tienen base legal suficiente bajo la Ley 1581.

---

## 1. ANTHROPIC PBC (Procesamiento de conversaciones de IA)

**Estado:** ⚑ PENDIENTE

**Qué datos transfiere:** Mensajes de los usuarios al modelo Claude (solo en tránsito — Anthropic no los almacena según su política de API Enterprise)

**Pasos:**
1. Ir a https://www.anthropic.com/legal/privacy — leer política actual
2. Verificar en la consola de Anthropic si hay opción de DPA/BAA (Business Associate Agreement)
3. Si se procesan datos de salud, puede requerirse un **BAA** (equivalente a HIPAA para datos médicos)
4. Enviar solicitud a: privacy@anthropic.com o legal@anthropic.com
5. Documentar la respuesta y guardar en esta carpeta

**Base legal alternativa mientras se gestiona el DPA:**
- Cláusula en Política de Privacidad (sección 8) informando la transferencia
- Consentimiento explícito del usuario al usar la IA

**Contacto Anthropic:** privacy@anthropic.com

---

## 2. VERCEL INC. (Infraestructura de la aplicación)

**Estado:** ⚑ PENDIENTE

**Qué datos transfiere:** Todo el tráfico de la aplicación (logs, métricas, funciones serverless)

**Pasos:**
1. Ir a https://vercel.com/legal/privacy-policy
2. Vercel ofrece DPA estándar — solicitarlo en: https://vercel.com/legal/dpa
3. Completar el formulario con datos de la empresa (requiere NIT ⚑)
4. Firmar digitalmente y guardar copia

**Región de datos:** Verificar que los datos se procesen en región más cercana o configurar región EU/US adecuada

**Contacto Vercel:** privacy@vercel.com

---

## 3. SUPABASE INC. (Base de datos PostgreSQL)

**Estado:** ⚑ PENDIENTE — CRÍTICO (contiene datos de salud cifrados)

**Qué datos transfiere:** Toda la base de datos (usuarios, conversaciones cifradas, citas, pagos)

**Pasos:**
1. Ir a https://supabase.com/privacy
2. Supabase ofrece DPA — disponible en: https://supabase.com/docs/guides/platform/gdpr
3. Verificar que el proyecto esté en región compatible (us-west-2 actual — considerar mover a EU si hay usuarios europeos)
4. Firmar DPA y guardar copia

**IMPORTANTE:** Por tratarse de datos de salud mental (categoría especial Ley 1581), este DPA tiene prioridad máxima.

**Contacto Supabase:** dpa@supabase.io

---

## 4. SENDGRID / TWILIO (Correos transaccionales)

**Estado:** ⚑ PENDIENTE (menor urgencia — no procesa datos de salud)

**Qué datos transfiere:** Correo electrónico del destinatario, asunto y cuerpo del email (confirmaciones, notificaciones)

**Pasos:**
1. SendGrid ofrece DPA estándar: https://sendgrid.com/policies/dpa/
2. Aceptar el DPA desde el panel de SendGrid → Settings → Data Processing Agreement
3. Guardar confirmación

---

## 5. SENTRY (Monitoreo de errores)

**Estado:** ⚑ PENDIENTE (baja urgencia — no procesa datos clínicos)

**Qué datos transfiere:** Logs de errores (sin contenido de mensajes de usuarios — configurado para excluir PII)

**Pasos:**
1. Sentry ofrece DPA: https://sentry.io/legal/dpa/
2. Aceptar desde la consola de Sentry → Settings → Legal → DPA
3. Verificar que la configuración de Sentry excluya PII (ya implementado en sentry.ts)

---

## TABLA DE ESTADO

| Proveedor | Datos | Urgencia | DPA firmado | Fecha |
|-----------|-------|----------|-------------|-------|
| Anthropic | Conversaciones IA (tránsito) | 🔴 Alta | ⬜ No | — |
| Vercel | Infraestructura app | 🟠 Media-alta | ⬜ No | — |
| Supabase | Base de datos completa | 🔴 Crítica | ⬜ No | — |
| SendGrid | Emails transaccionales | 🟡 Media | ⬜ No | — |
| Sentry | Logs de errores (sin PII) | 🟢 Baja | ⬜ No | — |

---

## RESPONSABLE DE GESTIÓN

- **Responsable:** ⚑ [Nombre del DPO / abogado externo]
- **Fecha límite para completar todos los DPA:** ⚑ [Fecha antes del lanzamiento]
- **Consulta legal:** ⚑ [Nombre del abogado especialista en datos]

---

*Documento interno — No publicar — MenteBridge Colombia SAS*
*Actualizado: 2026-05-21*
