# POLÍTICA DE PRIVACIDAD Y TRATAMIENTO DE DATOS PERSONALES
## MenteBridge Colombia SAS
### Versión 1.0 — Vigente desde: 2026-05-21

> **📋 ESTADO:** Borrador completo. Requiere revisión de abogado especialista en datos personales
> antes del lanzamiento. Los campos marcados `⚑` deben completarse al constituir la empresa.
> Versión preparada para cumplir Ley 1581/2012, Decreto 1377/2013, Ley 2460/2025 y Res. 2654/2019.

---

## 1. IDENTIFICACIÓN DEL RESPONSABLE DEL TRATAMIENTO

| Campo | Valor |
|-------|-------|
| **Razón social** | MenteBridge Colombia SAS |
| **NIT** | ⚑ [Completar al obtener NIT en DIAN] |
| **Domicilio** | ⚑ [Dirección física en Colombia — Ciudad] |
| **Correo de privacidad** | privacidad@mentebridge.com |
| **Teléfono** | ⚑ [Número de contacto] |
| **Oficial de Protección de Datos (DPO)** | ⚑ [Nombre del responsable designado] |
| **Registro ante la SIC** | ⚑ [Número tras registro obligatorio — Ley 1581 Art. 27] |

---

## 2. MARCO LEGAL APLICABLE

Esta política da cumplimiento a:

- **Ley 1581 de 2012** — Protección de Datos Personales (Habeas Data)
- **Decreto 1377 de 2013** — Reglamentario de la Ley 1581
- **Resolución 1151 de 2023** — SIC (actualización de procedimientos)
- **Ley 2460 de 2025** — Nueva Ley de Salud Mental de Colombia
- **Resolución 2654 de 2019** — Habilitación de Servicios de Telesalud y Telemedicina
- **Ley 1090 de 2006** — Código Deontológico y Bioético del Psicólogo
- **Artículo 15, Constitución Política** — Derecho a la intimidad y al habeas data

---

## 3. DATOS QUE RECOPILAMOS

### 3.1 Datos de Identificación
- Nombre completo y apellidos
- Correo electrónico
- Número de teléfono (opcional)
- Ciudad de residencia en Colombia
- Fecha de nacimiento (opcional)
- Fotografía de perfil (opcional, solo si el usuario la carga)

### 3.2 Datos Sensibles de Salud Mental
⚠️ **Categoría especial — Art. 5° Ley 1581. Requieren autorización EXPRESA e INEQUÍVOCA.**

Los siguientes datos se recopilan únicamente con consentimiento explícito previo:

- Conversaciones con el asistente de IA de bienestar emocional
- Registros de estado de ánimo y emociones (escala 1-10)
- Entradas del diario emocional (texto libre)
- Motivo de consulta declarado por el usuario
- Condiciones previas de salud mental autoreportadas
- Medicamentos actuales autoreportados
- Historia clínica de teleconsultas con psicólogos (sujeta a Resolución 2654/2019)
- Indicadores de crisis detectados de forma automatizada (fragmentos anonimizados)

**Medidas técnicas sobre datos sensibles:**
- Cifrado AES-256-GCM en reposo (base de datos)
- Cifrado TLS 1.3 en tránsito (HTTPS obligatorio)
- Acceso restringido por roles — solo el usuario y su psicólogo asignado (con consentimiento)

### 3.3 Datos de Uso de la Plataforma
- Dirección IP (anonimizada a las 24 horas)
- Tipo de dispositivo, sistema operativo y navegador
- Páginas y funcionalidades usadas
- Fecha y hora de acceso (sin vinculación al contenido de sesiones clínicas)
- Métricas de rendimiento de la aplicación (sin datos personales)

### 3.4 Datos de Pago
Los datos de tarjetas bancarias son procesados directamente por **Wompi** (certificado PCI-DSS).
MenteBridge **no almacena** números de tarjeta, CVV ni datos bancarios sensibles.
Guardamos únicamente: monto, método de pago, referencia de transacción y estado.

---

## 4. FINALIDADES DEL TRATAMIENTO

Los datos se tratan **únicamente** para las siguientes finalidades:

| # | Finalidad | Base legal |
|---|-----------|------------|
| 1 | Prestar el servicio de bienestar emocional con IA | Ejecución del contrato (Art. 6, Ley 1581) |
| 2 | Conectar con psicólogos verificados y gestionar citas | Ejecución del contrato |
| 3 | Activar protocolos de seguridad ante crisis detectadas | Interés vital del titular (Art. 6) |
| 4 | Procesar pagos y emitir comprobantes | Obligación legal y ejecución del contrato |
| 5 | Enviar notificaciones del servicio (citas, recordatorios) | Ejecución del contrato |
| 6 | Cumplir requerimientos de autoridades colombianas | Obligación legal |
| 7 | Mejorar la IA con análisis agregados y anonimizados | Interés legítimo (datos no vinculables) |
| 8 | Enviar contenido de salud mental y promociones | **Solo con autorización separada y revocable** |

**MenteBridge NO vende, arrienda ni cede datos personales a terceros con fines comerciales.**

---

## 5. TRATAMIENTO ESPECIAL DE DATOS SENSIBLES

Los datos de salud mental son categoría especial protegida por el Art. 5° de la Ley 1581. MenteBridge aplica las siguientes garantías adicionales:

1. **Consentimiento separado y específico** antes de recopilar cualquier dato sensible.
2. **Cifrado end-to-end** en reposo y en tránsito (AES-256-GCM + TLS 1.3).
3. **Acceso mínimo necesario** — ningún empleado de MenteBridge accede al contenido de las conversaciones salvo por requerimiento judicial.
4. **Compartición restringida** — los datos de salud se comparten únicamente:
   - Con el psicólogo asignado (requiere consentimiento explícito del usuario)
   - Ante riesgo de vida del usuario o de terceros (protocolo de crisis)
   - Ante requerimiento de autoridad judicial colombiana competente
5. **Auditoría de accesos** — todo acceso a datos clínicos queda registrado con timestamp, IP y rol del solicitante.
6. **Secreto profesional** — los psicólogos de la plataforma están sujetos a la Ley 1090/2006.

---

## 6. DERECHOS DEL TITULAR (HABEAS DATA)

De conformidad con la Ley 1581 de 2012, usted tiene derecho a:

| Derecho | Descripción | Plazo de respuesta |
|---------|-------------|-------------------|
| **Conocer (Acceso)** | Solicitar copia de todos sus datos | 10 días hábiles |
| **Actualizar** | Corregir datos desactualizados o incompletos | 15 días hábiles |
| **Rectificar** | Modificar datos incorrectos | 15 días hábiles |
| **Suprimir** | Eliminar sus datos cuando no exista obligación de retención | 15 días hábiles |
| **Revocar** | Retirar el consentimiento para finalidades específicas | 15 días hábiles |
| **Exportar** | Obtener copia portable de sus datos en formato JSON | Inmediato (autoservicio) |
| **Oponerse** | Oponerse al tratamiento para marketing | Inmediato (autoservicio) |

**Cómo ejercer sus derechos:**
- **Correo:** privacidad@mentebridge.com
- **Autoservicio en la app:** Dashboard → Configuración → Mis Datos → Exportar / Eliminar
- **Plazo de respuesta:** Los plazos empiezan a contar desde la recepción de la solicitud completa.

---

## 7. AVISO SOBRE USO DE INTELIGENCIA ARTIFICIAL
*Cumplimiento de la Resolución 2654 de 2019 del Ministerio de Salud — OBLIGATORIO*

**MenteBridge usa Inteligencia Artificial (IA) para brindar apoyo emocional.**

- El sistema de IA es operado y supervisado por **MenteBridge Colombia SAS**.
- La IA es una herramienta de **bienestar emocional**, NO un profesional de la salud mental.
- Las conversaciones con la IA **no constituyen** diagnóstico, prescripción, tratamiento médico ni psicológico clínico.
- La IA puede detectar señales de crisis y activar protocolos de seguridad (derivación a líneas de emergencia).
- Las conversaciones se almacenan de forma segura y cifrada; no son revisadas por humanos salvo requerimiento judicial.
- Los modelos de IA utilizados son provistos por **Anthropic PBC (EE.UU.)**, bajo acuerdo de confidencialidad y sin retención de datos para entrenamiento.

**El uso de la IA requiere autorización expresa previa del usuario, otorgada durante el registro.**

---

## 8. TRANSFERENCIA INTERNACIONAL DE DATOS

Los datos pueden ser procesados por los siguientes proveedores en el exterior:

| Proveedor | País | Tipo de datos | Garantía |
|-----------|------|---------------|---------|
| **Anthropic PBC** | EE.UU. | Conversaciones de IA (solo en tránsito) | Acuerdo de confidencialidad + términos de API |
| **Vercel Inc.** | EE.UU. | Infraestructura de la aplicación | ⚑ DPA por firmar |
| **Supabase Inc.** | EE.UU. | Base de datos (región: us-west-2) | ⚑ DPA por firmar |
| **SendGrid (Twilio)** | EE.UU. | Correos transaccionales | Acuerdo de procesamiento de datos |
| **Sentry** | EE.UU. | Logs de errores (sin datos de salud) | DPA estándar disponible |

Todas las transferencias se realizan bajo las garantías del **Artículo 26 de la Ley 1581 de 2012**.
⚑ Los DPA con Vercel y Supabase deben firmarse antes del lanzamiento.

---

## 9. RETENCIÓN DE DATOS

| Tipo de dato | Período de retención | Razón |
|--------------|---------------------|-------|
| Conversaciones con IA | 2 años desde la última actividad | Continuidad del servicio |
| Historia clínica | 5 años (Resolución 2654/2019) | Obligación legal |
| Registros de pago | 7 años | Obligación tributaria DIAN |
| Audit log de accesos | 3 años | Ley 1581 Art. 17 |
| IP y logs técnicos | 24 horas (anonimizadas) | Seguridad |
| Datos eliminados por usuario | Hasta 30 días en backups | Recuperación accidental |

---

## 10. SEGURIDAD DE LA INFORMACIÓN

MenteBridge implementa las siguientes medidas técnicas y organizativas:

- Cifrado AES-256-GCM para datos sensibles en reposo
- TLS 1.3 para todo el tráfico de red
- Autenticación multifactor disponible para usuarios
- Control de acceso basado en roles (RBAC)
- Registro de auditoría de accesos a datos sensibles
- Pruebas de penetración periódicas (⚑ programar antes del lanzamiento)
- Plan de respuesta a incidentes de seguridad (notificación a la SIC en máximo 72 horas)

---

## 11. VIGENCIA Y MODIFICACIONES

Esta política está vigente desde **2026-05-21**. MenteBridge puede modificarla y notificará a los usuarios registrados por correo electrónico con **30 días de anticipación** antes de cambios sustanciales. El uso continuado de la plataforma tras los cambios implica aceptación de la nueva versión.

---

## 12. AUTORIDAD DE CONTROL

La **Superintendencia de Industria y Comercio (SIC)** es la autoridad de protección de datos en Colombia:

- 🌐 www.sic.gov.co
- 📞 Línea gratuita: 01 8000 910165
- 📧 contacto@sic.gov.co
- 📍 Carrera 13 N° 27-00, Bogotá D.C.

---

*Versión 1.0 — MenteBridge Colombia SAS — Borrador para revisión legal*
*Abogado revisor: ⚑ [Nombre del abogado] — Fecha de revisión: ⚑ [Fecha]*
