# MindBridge Android — Índice de documentación

Guía completa para construir la app Android de MindBridge en Android Studio.

## Documentos

| # | Archivo | Contenido |
|---|---------|-----------|
| 1 | [01-arquitectura-y-modelos.md](./01-arquitectura-y-modelos.md) | Estructura de carpetas, dependencias Gradle, modelos de dominio, DTOs, Room |
| 2 | [02-api-y-autenticacion.md](./02-api-y-autenticacion.md) | URL base, autenticación JWT, interfaces Retrofit, manejo de errores, Wompi WebView |
| 3 | [03-configuracion-android-studio.md](./03-configuracion-android-studio.md) | Crear proyecto, build.gradle, AndroidManifest, tema Material 3, Hilt |
| 4 | [04-pantallas-y-navegacion.md](./04-pantallas-y-navegacion.md) | Mapa de navegación, NavHost, BottomNav, pantallas, ViewModels, componentes |

## Resumen del proyecto

**MindBridge** es una plataforma SaaS de salud mental colombiana con:
- Chat de IA (Claude) con detección de crisis
- Red de psicólogos verificados (COLPSIC)
- Citas de telemedicina con pago via Wompi
- Diario emocional y seguimiento de ánimo
- Tests psicológicos (PHQ-9, GAD-7, DASS-21)
- Cumplimiento legal colombiano (Ley 1581, 2460, Res. 2654)

## Stack backend (al que se conecta la app)

| Tecnología | Uso |
|------------|-----|
| Next.js 14 | API REST en `/api/*` |
| PostgreSQL + Prisma | Base de datos |
| NextAuth.js | Autenticación (JWT + Google OAuth) |
| Anthropic Claude | Chat IA |
| Wompi | Pagos (PSE, NEQUI, tarjeta) |
| Daily.co | Videollamadas WebRTC |
| SendGrid | Emails transaccionales |

## Stack Android recomendado

| Tecnología | Uso |
|------------|-----|
| Jetpack Compose | UI declarativa |
| Kotlin | Lenguaje |
| MVVM + Clean Architecture | Patrón |
| Hilt | Inyección de dependencias |
| Retrofit + OkHttp | HTTP client |
| Room | Caché local |
| DataStore | Preferencias y tokens |
| Material 3 | Design system |
| Navigation Compose | Navegación |

## Variables de entorno necesarias del backend

Para que la app funcione, el backend debe tener configuradas:

```
DATABASE_URL=          # Supabase PostgreSQL
NEXTAUTH_SECRET=       # Secret para JWT
NEXTAUTH_URL=          # URL del backend
ANTHROPIC_API_KEY=     # Para chat IA
WOMPI_PUBLIC_KEY=      # Pagos
WOMPI_PRIVATE_KEY=
SENDGRID_API_KEY=      # Emails
```

La app Android solo necesita la URL del backend en `build.gradle.kts`:
```kotlin
buildConfigField("String", "API_BASE_URL", "\"https://tu-dominio.com/api/\"")
```
