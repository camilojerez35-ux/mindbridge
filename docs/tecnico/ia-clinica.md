# Documentación Técnica — Motor de IA Clínica
## MindBridge Colombia · packages/ai-clinical

---

## Resumen

El motor de IA clínica de MindBridge es el núcleo del producto. Convierte la API de Claude (Anthropic) en un asistente de bienestar emocional especializado, seguro y culturalmente adaptado para Colombia.

**Aprobación clínica:** Psicólogo Co-Fundador
**Versión del system prompt:** 1.0
**Última revisión clínica:** Mayo 2026

---

## Arquitectura del Motor IA

```
packages/ai-clinical/
├── src/
│   ├── prompts/
│   │   └── system-prompt.ts      ← System prompt clínico principal
│   ├── protocols/
│   │   └── crisis-protocol.ts    ← Detección y manejo de crisis
│   └── techniques/
│       ├── tcc.ts                ← Técnicas TCC
│       ├── act.ts                ← Técnicas ACT
│       └── mindfulness.ts        ← Ejercicios guiados
```

---

## Flujo de Procesamiento

```
Usuario envía mensaje
        │
        ▼
[1] Detección de Crisis (LOCAL — sin llamada a API)
        │
        ├──► Nivel CRÍTICO → Respuesta de protocolo directa → Registrar incidente
        │
        ├──► Nivel ALTO → Enriquecer system prompt + Claude API + Sugerir psicólogo
        │
        └──► Nivel BAJO/NINGUNO → Claude API con system prompt estándar
                                          │
                                          ▼
                                 [2] Claude Sonnet API
                                 (Streaming SSE)
                                          │
                                          ▼
                              [3] Postprocesamiento
                              - Agregar disclaimer cada 10 msgs
                              - Detectar sugerencias de cita
                                          │
                                          ▼
                              [4] Guardar en PostgreSQL
                              (cifrado, cumplimiento Ley 1581)
```

---

## Configuración del System Prompt

### Estructura del prompt (5 secciones principales)

1. **Identidad y Marco** — Quién es la IA, qué puede y no puede hacer
2. **Personalidad y Tono** — Empático, cálido, profesional, adaptativo
3. **Técnicas Clínicas** — TCC, ACT, respiración, grounding, mindfulness
4. **Protocolo de Crisis** — Máxima prioridad, activación y recursos
5. **Límites Absolutos** — 6 prohibiciones no negociables

### Modificación del system prompt

⚠️ **PROCESO OBLIGATORIO para cualquier cambio:**

1. Crear rama git: `feature/prompt-v{X}`
2. Documentar el cambio y justificación clínica
3. Revisión y aprobación del Psicólogo Co-Fundador (firma en PR)
4. Ejecutar `npm run audit:clinical` — debe pasar al 100%
5. Deploy a staging → revisión de 5 días mínimo
6. Deploy a producción con aprobación del CEO

---

## Protocolo de Crisis — Especificaciones Técnicas

### Niveles de Crisis

| Nivel | Descripción | Respuesta del sistema |
|-------|-------------|----------------------|
| `ninguno` | Sin indicadores | Sesión normal con Claude API |
| `bajo` | 1 indicador moderado | Apoyo estándar, sin cambios |
| `moderado` | 2+ indicadores moderados | Apoyo reforzado + sugerir cita |
| `alto` | 1+ indicadores altos | Enriquecer prompt + mostrar recursos |
| `critico` | Cualquier indicador crítico | BLOQUEAR Claude API + protocolo directo |

### Regla de oro: Falsos positivos > Falsos negativos

Es preferible activar el protocolo de crisis cuando no era necesario, que NO activarlo cuando sí era necesario. El sistema está calibrado para alta sensibilidad.

### Recursos de emergencia (Colombia)

Verificar vigencia mensualmente. Última verificación: Mayo 2026.

| Línea | Número | Estado |
|-------|--------|--------|
| Línea 106 Bogotá | 106 | ✅ Activa |
| Línea Nacional | 800-1222-5555 | ✅ Activa |
| Emergencias | 123 | ✅ Activa |

---

## Costos Estimados de API (Claude)

| Modelo | Tokens input (aprox/sesión) | Tokens output | Costo estimado |
|--------|---------------------------|---------------|----------------|
| claude-sonnet | 800 tokens | 400 tokens | ~$0.006 USD |
| claude-haiku (FAQ) | 200 tokens | 100 tokens | ~$0.0003 USD |

**Estrategia de costos:**
- Usar Sonnet para sesiones terapéuticas
- Usar Haiku para preguntas de información general
- Cachear respuestas de ejercicios guiados
- Limitar historial a últimos 10 mensajes (evitar context overflow)

---

## Tests Clínicos

Ubicación: `tests/ai-clinical/protocol-crisis-test.ts`

**Ejecutar:**
```bash
npm run audit:clinical
```

**Casos de test incluidos:**
- 5 casos críticos (ideación suicida, autolesión, plan con método)
- 3 casos de nivel alto (desesperanza, deseo de desaparecer)
- 2 casos moderados
- 4 casos sin crisis (incluye falsos positivos)

**Requisito de deploy:** 100% de casos críticos deben pasar.

---

## Registro de Cambios del System Prompt

| Versión | Fecha | Cambio | Aprobado por |
|---------|-------|--------|--------------|
| 1.0 | Mayo 2026 | Versión inicial | [Psicólogo Co-Fundador] |

---

*MindBridge Colombia SAS — Documentación Técnica IA Clínica v1.0*
