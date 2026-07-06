# PROTOCOLO DE MANEJO DE CRISIS EN SALUD MENTAL
## MindBridge Colombia SAS — Documento Clínico Interno
### Versión 1.0 — 2026-05-21

> **ESTADO:** Borrador. Requiere firma de psicólogo/a clínico/a co-fundador/a antes del lanzamiento.
> Conforme a: Resolución 2654/2019, Ley 1090/2006, Lineamientos COLPSIC para telesalud.

---

## 1. MARCO LEGAL Y RESPONSABILIDAD

Este protocolo cumple con:
- **Resolución 2654 de 2019** (Min. Salud): requisitos para prestación de servicios de salud mental a través de tecnologías de la información
- **Ley 1090 de 2006** (Código Deontológico del Psicólogo): obligación de actuar ante riesgo vital
- **Ley 1616 de 2013** (Salud Mental Colombia): atención integral y prioritaria en crisis

**Responsabilidad:** Los psicólogos de la red MindBridge son los únicos responsables del ejercicio clínico. La plataforma provee herramientas de apoyo, no reemplaza el juicio clínico.

---

## 2. DEFINICIÓN DE CRISIS

Una **crisis de salud mental** es un estado transitorio de desequilibrio psicológico precipitado por eventos estresantes o amenazas percibidas, en el que la persona no puede resolver la situación con sus recursos habituales.

### 2.1 Tipos de crisis manejadas

| Tipo | Descripción |
|------|-------------|
| **Ideación suicida** | Pensamientos de hacerse daño o quitarse la vida |
| **Crisis de pánico severa** | Episodio de terror intenso con síntomas físicos |
| **Disociación aguda** | Desconexión de la realidad, despersonalización |
| **Crisis de duelo** | Pérdida reciente con respuesta aguda desadaptativa |
| **Episodio maníaco/psicótico** | Signos de ruptura con la realidad |

---

## 3. SISTEMA DE NIVELES DE RIESGO

### NIVEL CRÍTICO — Riesgo Vital Inmediato

**Indicadores:**
- Verbalización explícita de plan suicida con método y tiempo
- Intento en curso o reciente (últimas horas)
- Amenaza de daño a terceros inmediata
- Disociación severa con desorientación total

**Respuesta automatizada del sistema:**
1. Activar modal de pánico inmediatamente
2. Mostrar líneas de emergencia en primer plano (106, 123)
3. Registrar incidente de forma síncrona (awaited antes de respuesta)
4. Notificar al psicólogo asignado por email
5. NO continuar conversación con IA — respuesta de crisis únicamente

**Tiempo de respuesta humana objetivo:** Inmediato — el usuario debe llamar al 123

---

### NIVEL ALTO — Riesgo Significativo

**Indicadores:**
- Ideación suicida sin plan específico
- Desesperanza severa ("no tiene sentido seguir")
- Automutilación activa o reciente
- Incapacidad de garantizar seguridad propia

**Respuesta automatizada del sistema:**
1. Mensaje de apoyo con recursos profesionales
2. Sugerir cita urgente con psicólogo (mismo día si disponible)
3. Registrar incidente de forma síncrona
4. Notificar al psicólogo asignado por email
5. NO continuar generando respuestas de IA — respuesta de crisis únicamente

**Tiempo de respuesta humana objetivo:** < 2 horas (psicólogo asignado)

---

### NIVEL MODERADO — Riesgo Presente

**Indicadores:**
- Pensamientos de muerte vagos ("quisiera no estar aquí")
- Ansiedad severa sin riesgo vital inmediato
- Episodio depresivo significativo
- Consumo problemático reciente

**Respuesta automatizada del sistema:**
1. Respuesta empática con técnicas de regulación (respiración, grounding)
2. Recordatorio de recursos disponibles
3. Registro asíncrono del incidente
4. Sugerir agendar cita en próximas 48h

**Tiempo de respuesta humana objetivo:** < 24 horas (próxima cita disponible)

---

### NIVEL BAJO — Malestar Emocional

**Indicadores:**
- Tristeza, ansiedad leve-moderada
- Estrés laboral o relacional
- Problemas de sueño o concentración

**Respuesta automatizada del sistema:**
1. Respuesta empática con psicoeducación
2. Técnicas de autorregulación
3. Registro si hay patrón repetitivo

**Tiempo de respuesta humana objetivo:** Próxima cita agendada

---

## 4. PALABRAS CLAVE Y FRASES DETECTORAS

### Nivel Crítico
```
suicidar, suicidio, matarme, quitarme la vida, no quiero existir,
acabar con todo, método [específico + tiempo], pastillas para morir,
tengo un arma, voy a hacerlo ahora
```

### Nivel Alto
```
ideación, no tiene sentido vivir, mejor muerto, hacerme daño,
cortarme, autolesión, desesperanza total, sin salida
```

### Nivel Moderado
```
quisiera no estar, pensamientos oscuros, no puedo más, agotado de vivir,
¿para qué seguir?
```

*(Lista completa implementada en `packages/ai-clinical/src/protocols/crisis-protocol.ts`)*

---

## 5. PROTOCOLO DE NOTIFICACIÓN AL PSICÓLOGO

### 5.1 Cuándo se notifica

| Nivel | Notificación | Canal |
|-------|-------------|-------|
| CRÍTICO | Inmediata (síncrona) | Email + (futuro: SMS) |
| ALTO | Inmediata (síncrona) | Email |
| MODERADO | Asíncrona | Email (resumen diario futuro) |
| BAJO | No | — |

### 5.2 Contenido de la notificación

El email al psicólogo incluye:
- Nivel de crisis detectado
- Nombre del usuario (no ID anónimo — el psicólogo necesita saber quién es)
- Fragmento anonimizado del texto detonante (sin datos identificadores adicionales)
- Timestamp del incidente
- Líneas de acción recomendadas

### 5.3 Responsabilidad del psicólogo al recibir notificación

El psicólogo debe:
1. Contactar al usuario dentro del tiempo objetivo según el nivel
2. Documentar la acción tomada en la plataforma
3. Si no puede contactar al usuario, escalar al equipo clínico de MindBridge
4. En caso de emergencia confirmada, orientar al usuario o familiares a llamar al 123

---

## 6. RECURSOS DE EMERGENCIA — COLOMBIA

| Línea | Número | Disponibilidad | Cobertura |
|-------|--------|---------------|-----------|
| Línea Salud Mental Bogotá | 106 | 24h, gratuita | Bogotá D.C. |
| Línea Nacional Salud Mental | 800-112-5555 | Horario extendido | Nacional |
| Línea 192 SISBEN | 192 | Horario hábil | Nacional |
| Emergencias | 123 | 24h | Nacional |
| Cruz Roja | 132 | 24h | Nacional |

**Nota:** La línea 106 es específica de Bogotá. Usuarios en otras ciudades deben usar la Línea Nacional (800-112-5555) o contactar a la Secretaría de Salud local.

### Líneas departamentales adicionales
- **Medellín:** Línea 106 Antioquia / 604 444 8080
- **Cali:** Secretaría de Salud Valle: 602 620 0000
- **Barranquilla:** Línea 106 local
- **Bucaramanga:** 607 643 6363

---

## 7. LIMITACIONES DEL SISTEMA AUTOMATIZADO

El sistema de detección de crisis de MindBridge:

1. **No reemplaza la evaluación clínica** — es un sistema de apoyo, no diagnóstico
2. **Puede generar falsos positivos** — palabras de crisis en contexto literario, histórico o referido
3. **Puede no detectar crisis implícitas** — silencio, cambios de tema, comunicación no verbal
4. **No llama servicios de emergencia** — el usuario debe hacerlo manualmente
5. **Depende del texto** — no percibe tono de voz, expresión facial ni lenguaje corporal
6. **Idioma principal:** Español colombiano — puede tener menor precisión en otros idiomas

---

## 8. PROTOCOLO DIARIO Y ESTADO DE ÁNIMO

### 8.1 Diario (API `/api/diario`)
- Todo contenido de diario pasa por `detectarNivelCrisis()` antes de guardarse
- Si nivel ≥ MODERADO: se registra incidente asíncrono
- Si nivel ≥ ALTO: se registra incidente síncrono y se notifica al psicólogo

### 8.2 Estado de ánimo (API `/api/animo`)
- Valor ≤ 2 (escala 1-10): activación de protocolo nivel MODERADO
- Valor = 1: activación de protocolo nivel ALTO
- Se combina con nota de texto si existe para refinamiento del nivel

---

## 9. AUDITORÍA Y MEJORA CONTINUA

- **Revisión mensual:** El Comité Clínico revisa todos los incidentes del mes anterior
- **Indicadores de calidad:**
  - Tasa de falsos positivos (objetivo: < 15%)
  - Tiempo de respuesta del psicólogo a notificaciones CRÍTICO/ALTO
  - Tasa de resolución sin escalada a emergencias
- **Actualización del protocolo:** Mínimo cada 6 meses o tras incidente crítico

---

## 10. FIRMAS Y APROBACIÓN

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Psicólogo/a Clínico/a Revisor/a | ⚑ | ___________ | ⚑ |
| Directora/Director Médico | ⚑ | ___________ | ⚑ |
| CEO MindBridge | ⚑ | ___________ | ⚑ |

---

*Versión 1.0 — MindBridge Colombia SAS — Borrador para aprobación clínica*
*Próxima revisión: 2026-11-21 (6 meses)*
