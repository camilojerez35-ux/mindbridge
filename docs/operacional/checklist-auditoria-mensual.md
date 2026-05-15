# ✅ CHECKLIST DE AUDITORÍA MENSUAL — MindBridge Colombia
## Versión 1.0 | Aplicar el primer lunes de cada mes

---

## INSTRUCCIONES DE USO
1. Duplicar este archivo con el nombre: `auditoria-YYYY-MM.md`
2. Completar cada ítem con: ✅ APROBADO | ⚠️ OBSERVACIÓN | ❌ FALLO
3. Documentar observaciones y plan de acción para fallos
4. Firmar al final con nombres de los auditores
5. Archivar en: `docs/auditorias/YYYY/auditoria-YYYY-MM.md`

---

## ÁREA A1 — LEGAL Y NORMATIVA

| # | Criterio | Estado | Observación |
|---|----------|--------|-------------|
| A1.1 | Política de privacidad vigente y publicada en la web | | |
| A1.2 | Registro ante SIC activo (verificar en rnbd.sic.gov.co) | | |
| A1.3 | 100% de usuarios con consentimiento registrado en DB | | |
| A1.4 | Oficial de privacidad designado y operativo | | |
| A1.5 | Aviso de uso de IA visible en la interfaz (Res. 2654) | | |
| A1.6 | Responsable de plataforma IA identificado en la app | | |
| A1.7 | Plataforma posicionada como bienestar, no diagnóstico | | |
| A1.8 | Tarjetas COLPSIC de psicólogos vigentes (verificación masiva) | | |
| A1.9 | Contratos con psicólogos actualizados y firmados | | |
| A1.10 | Términos y condiciones sin cambios legales pendientes | | |

**Auditor:** _____________ **Fecha:** _____________

---

## ÁREA A2 — SEGURIDAD Y DATOS

| # | Criterio | Herramienta | Estado | Observación |
|---|----------|-------------|--------|-------------|
| A2.1 | TLS 1.3 activo — Score A+ en ssllabs.com | SSL Labs | | |
| A2.2 | Backups automáticos diarios funcionando | Panel DB | | |
| A2.3 | Restauración de backup probada exitosamente | Manual | | |
| A2.4 | Rate limiting activo en endpoints /api/ai/chat | Test k6 | | |
| A2.5 | Sin vulnerabilidades npm audit nivel HIGH/CRITICAL | npm audit | | |
| A2.6 | 2FA disponible y funcional para usuarios | Test manual | | |
| A2.7 | Logs de auditoría de acceso a datos sensibles | Sentry | | |
| A2.8 | Sin alertas de Sentry sin resolver >7 días | Sentry | | |
| A2.9 | Uptime del mes >99.5% | UptimeRobot | | |
| A2.10 | Sin brecha de datos reportada o detectada | Logs/monitoreo | | |

**Auditor:** _____________ **Fecha:** _____________

---

## ÁREA A3 — CALIDAD DE LA IA CLÍNICA

| # | Criterio | Método | Estado | Observación |
|---|----------|--------|--------|-------------|
| A3.1 | Tests clínicos automatizados: 100% pasando | CI/CD logs | | |
| A3.2 | Protocolo de crisis funcional (test con frases de riesgo) | Test manual | | |
| A3.3 | Recursos de crisis actualizados (Línea 106, 800-1222-5555) | Verificación | | |
| A3.4 | La IA no emitió diagnósticos en muestra de 50 sesiones | Revisión manual | | |
| A3.5 | La IA no recomendó medicamentos (muestra 50 sesiones) | Revisión manual | | |
| A3.6 | CSAT promedio de sesiones IA ≥4.0/5 | Dashboard | | |
| A3.7 | System prompt aprobado por psicólogo (sin cambios no autorizados) | Git diff | | |
| A3.8 | Costo promedio por sesión Claude API ≤$0.02 USD | Consola Anthropic | | |
| A3.9 | La IA sugirió agendar cita cuando correspondía | Revisión muestra | | |
| A3.10 | Disclaimer de IA presente cada 10 mensajes | Test manual | | |

**Psicólogo Auditor:** _____________ **Fecha:** _____________

---

## ÁREA A4 — PRODUCTO Y UX

| # | KPI | Meta | Valor Real | Estado |
|---|-----|------|------------|--------|
| A4.1 | Retención mensual | >70% | | |
| A4.2 | Completación de onboarding | >80% | | |
| A4.3 | NPS general | >55 | | |
| A4.4 | Tasa de cancelación de citas | <15% | | |
| A4.5 | Tiempo de carga Lighthouse (mobile) | >80 | | |
| A4.6 | Bugs críticos sin resolver | 0 | | |
| A4.7 | Tiempo medio resolución bugs críticos | <24h | | |
| A4.8 | Uptime del mes | >99.5% | | |
| A4.9 | Satisfacción psicólogos con plataforma | >4.0/5 | | |
| A4.10 | Tickets de soporte sin resolver >48h | 0 | | |

**Auditor:** _____________ **Fecha:** _____________

---

## ÁREA A5 — FINANCIERO

| # | KPI | Meta | Valor Real | Estado |
|---|-----|------|------------|--------|
| A5.1 | MRR (Ingresos recurrentes mensuales) | Según proyección | | |
| A5.2 | Churn mensual | <5% | | |
| A5.3 | CAC (Costo adquisición usuario) | <$15.000 COP | | |
| A5.4 | Tasa de pagos fallidos/rechazados | <3% | | |
| A5.5 | Comisiones de citas procesadas correctamente | 100% | | |
| A5.6 | Pagos a psicólogos en <72h hábiles | 100% | | |
| A5.7 | Runway financiero visible | ≥6 meses | | |
| A5.8 | Obligaciones DIAN al día | Sí | | |
| A5.9 | Registro contable al día (Siigo/Alegra) | Sí | | |
| A5.10 | Conciliación de pasarela de pagos completa | Sí | | |

**Auditor:** _____________ **Fecha:** _____________

---

## ÁREA A6 — RED DE PSICÓLOGOS

| # | Criterio | Estado | Observación |
|---|----------|--------|-------------|
| A6.1 | 100% de psicólogos con tarjeta COLPSIC vigente | | |
| A6.2 | Calificación promedio red de psicólogos ≥4.0/5 | | |
| A6.3 | Psicólogos activos (≥1 cita/mes) ≥70% de la red | | |
| A6.4 | Sin quejas formales sin resolver | | |
| A6.5 | Sin denuncias éticas ante COLPSIC | | |
| A6.6 | Pagos procesados a todos los psicólogos correctamente | | |
| A6.7 | Sin psicólogos con calificación <3.5 sin acción tomada | | |
| A6.8 | Nuevos psicólogos incorporados con proceso completo | | |

**Auditor:** _____________ **Fecha:** _____________

---

## ÁREA A7 — MARKETING Y ADQUISICIÓN

| # | KPI | Meta | Valor Real | Estado |
|---|-----|------|------------|--------|
| A7.1 | Nuevos usuarios registrados | Según proyección | | |
| A7.2 | Tasa conversión landing → registro | >8% | | |
| A7.3 | Artículos SEO posicionados (top 10 Google) | >5 | | |
| A7.4 | Open rate emails transaccionales | >25% | | |
| A7.5 | Crecimiento seguidores redes sociales | >5%/mes | | |
| A7.6 | Leads B2B activos en pipeline | >3 | | |
| A7.7 | Materiales de marketing sin lenguaje clínico inadecuado | Sí | | |
| A7.8 | Programa de referidos funcionando | Sí/No | | |

**Auditor:** _____________ **Fecha:** _____________

---

## ÁREA A8 — ÉTICA Y RESPONSABILIDAD CLÍNICA 🔴

| # | Criterio | Estado | Observación |
|---|----------|--------|-------------|
| A8.1 | **100% de alertas de crisis derivadas correctamente** | | |
| A8.2 | Tiempo activación protocolo crisis <30 seg (test) | | |
| A8.3 | La IA nunca diagnosticó (revisión 50 conversaciones) | | |
| A8.4 | La IA siempre sugirió profesional en casos complejos | | |
| A8.5 | Registro de incidentes clínicos completo y documentado | | |
| A8.6 | Reunión de supervisión clínica mensual realizada | | |
| A8.7 | Acta de reunión de supervisión archivada | | |
| A8.8 | Ningún incidente sin resolución documentada | | |

**Psicólogo Auditor:** _____________ **Fecha:** _____________

---

## RESUMEN EJECUTIVO DEL MES

**Período auditado:** _______________
**Fecha de auditoría:** _______________

### Conteo de estados:
- ✅ Aprobados: ___
- ⚠️ Con observación: ___
- ❌ Fallos: ___

### Fallos críticos identificados:
1. _______________
2. _______________

### Plan de acción:
| Fallo | Responsable | Fecha límite | Estado |
|-------|-------------|--------------|--------|
| | | | |

### Aprobación final:

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| CEO | | | |
| Psicólogo Co-Fundador | | | |
| Dev Lead | | | |
| Abogado Consultor | | | |

---

*MindBridge Colombia SAS — Checklist de Auditoría v1.0*
*Archivar en: docs/auditorias/[AÑO]/auditoria-[AÑO-MES].md*
