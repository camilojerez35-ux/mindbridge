# MindBridge Android — Arquitectura y Modelos de Datos

## 1. Arquitectura recomendada

**Patrón:** MVVM + Clean Architecture  
**UI:** Jetpack Compose  
**Lenguaje:** Kotlin

```
app/
├── data/
│   ├── remote/          # Retrofit API calls
│   │   ├── api/         # Interfaces de API
│   │   ├── dto/         # Data Transfer Objects (respuestas JSON)
│   │   └── interceptors/
│   ├── local/           # Room DB (caché offline)
│   │   ├── dao/
│   │   └── entities/
│   └── repository/      # Implementaciones de repositorios
├── domain/
│   ├── model/           # Modelos de dominio (Kotlin data classes)
│   ├── repository/      # Interfaces de repositorios
│   └── usecase/         # Casos de uso
├── presentation/
│   ├── ui/
│   │   ├── auth/        # Login, registro
│   │   ├── chat/        # Chat IA
│   │   ├── diario/      # Diario emocional
│   │   ├── animo/       # Registro de ánimo
│   │   ├── citas/       # Reserva de citas
│   │   ├── psicologos/  # Listado de psicólogos
│   │   ├── perfil/      # Perfil de usuario
│   │   └── tests/       # Tests psicológicos
│   ├── viewmodel/
│   └── navigation/
├── di/                  # Hilt modules
└── util/
```

---

## 2. Dependencias Gradle (build.gradle.kts — app)

```kotlin
dependencies {
    // Jetpack Compose BOM
    val composeBom = platform("androidx.compose:compose-bom:2024.05.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    debugImplementation("androidx.compose.ui:ui-tooling")

    // Navigation Compose
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // ViewModel + LiveData
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")

    // Hilt (DI)
    implementation("com.google.dagger:hilt-android:2.51")
    kapt("com.google.dagger:hilt-compiler:2.51")
    implementation("androidx.hilt:hilt-navigation-compose:1.2.0")

    // Retrofit + OkHttp + Gson
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Room (caché local)
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")

    // DataStore (preferencias, tokens)
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")

    // Coil (imágenes)
    implementation("io.coil-kt:coil-compose:2.6.0")

    // Accompanist (permisos, etc.)
    implementation("com.google.accompanist:accompanist-permissions:0.34.0")

    // Splash Screen API
    implementation("androidx.core:core-splashscreen:1.0.1")

    // Security (EncryptedSharedPreferences)
    implementation("androidx.security:security-crypto:1.1.0-alpha06")

    // Google Sign-In (OAuth)
    implementation("com.google.android.gms:play-services-auth:21.1.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
}
```

**build.gradle.kts (project level):**
```kotlin
plugins {
    id("com.google.dagger.hilt.android") version "2.51" apply false
}
```

**gradle.properties:**
```
android.useAndroidX=true
kotlin.kapt.generateStubs=true
```

---

## 3. Modelos de Dominio (Kotlin)

### Usuario
```kotlin
data class Usuario(
    val id: String,
    val nombre: String,
    val email: String,
    val telefono: String?,
    val ciudad: String?,
    val rol: Rol,
    val plan: PlanSuscripcion,
    val emailVerificado: Boolean,
    val consentimientoDatos: Boolean,
    val consentimientoIA: Boolean,
    val estado: EstadoUsuario,
    val creadoEn: String
)

enum class Rol { USUARIO, PSICOLOGO, ADMIN, SUPERADMIN }
enum class PlanSuscripcion { GRATIS, PLUS, FAMILIA, EMPRESARIAL }
enum class EstadoUsuario { ACTIVO, SUSPENDIDO, ELIMINADO, PENDIENTE_VERIFICACION }
```

### Psicologo
```kotlin
data class Psicologo(
    val id: String,
    val usuarioId: String,
    val nombre: String,
    val foto: String?,
    val bio: String?,
    val especialidades: List<String>,
    val enfoquesTerapeuticos: List<String>,
    val numeroCOLPSIC: String,
    val verificado: Boolean,
    val tarifaSesion: Double,         // en COP
    val calificacionPromedio: Double,
    val totalSesiones: Int,
    val modalidades: List<Modalidad>,
    val ciudades: List<String>
)

enum class Modalidad { VIDEOLLAMADA, TELEFONICA, PRESENCIAL }
```

### Cita
```kotlin
data class Cita(
    val id: String,
    val usuarioId: String,
    val psicologoId: String,
    val psicologo: Psicologo?,
    val fechaHora: String,           // ISO 8601
    val duracion: Int,               // minutos
    val tipo: TipoCita,
    val modalidad: Modalidad,
    val estado: EstadoCita,
    val monto: Double,               // COP
    val pagado: Boolean,
    val referenciaPago: String?,
    val salaVideollamada: String?,
    val motivoCancelacion: String?,
    val creadaEn: String
)

enum class TipoCita { PRIMERA_CONSULTA, SEGUIMIENTO, URGENTE }
enum class EstadoCita {
    PENDIENTE, CONFIRMADA, EN_CURSO, COMPLETADA,
    CANCELADA_USUARIO, CANCELADA_PSICOLOGO, NO_ASISTIO
}
```

### Chat IA
```kotlin
data class SesionChat(
    val id: String,
    val titulo: String?,
    val estado: EstadoSesion,
    val animoAntes: Int?,
    val animoDespues: Int?,
    val esCrisis: Boolean,
    val resumen: String?,
    val creadaEn: String
)

data class MensajeChat(
    val id: String,
    val sesionId: String,
    val rol: RolMensaje,
    val contenido: String,
    val esCrisis: Boolean,
    val nivelCrisis: NivelCrisis,
    val creadoEn: String
)

enum class EstadoSesion { ACTIVA, CERRADA, ARCHIVADA }
enum class RolMensaje { USER, ASSISTANT, SYSTEM }
enum class NivelCrisis { NINGUNO, BAJO, MODERADO, ALTO, CRITICO }
```

### Diario Emocional
```kotlin
data class EntradaDiario(
    val id: String,
    val contenido: String,
    val animo: Int,                  // 1-10
    val emociones: List<String>,
    val etiquetas: List<String>,
    val analisisIA: String?,
    val esFavorita: Boolean,
    val esPrivada: Boolean,
    val creadaEn: String
)
```

### Registro de Ánimo
```kotlin
data class RegistroAnimo(
    val id: String,
    val valor: Int,                  // 1-10
    val nota: String?,
    val contexto: ContextoAnimo?,
    val emociones: List<String>,
    val fecha: String
)

enum class ContextoAnimo { MANANA, TARDE, NOCHE, EVENTO_ESPECIFICO }
```

### Suscripción
```kotlin
data class Suscripcion(
    val id: String,
    val plan: PlanSuscripcion,
    val estado: EstadoSuscripcion,
    val monto: Double,
    val fechaInicio: String,
    val fechaVencimiento: String,
    val metodoPago: MetodoPago?
)

enum class EstadoSuscripcion { ACTIVA, VENCIDA, CANCELADA, PAUSADA, PRUEBA }
enum class MetodoPago { PSE, NEQUI, TARJETA }
```

### Consejo Diario
```kotlin
data class ConsejoDiario(
    val id: String,
    val categoria: String,
    val icono: String,
    val titulo: String,
    val contenido: String,
    val calificacion: Int?           // 1-5 si el usuario lo calificó
)
```

### Test Psicológico
```kotlin
data class TestPsicologico(
    val id: String,                  // phq9, gad7, dass21
    val nombre: String,
    val descripcion: String,
    val preguntas: List<PreguntaTest>
)

data class PreguntaTest(
    val id: String,
    val texto: String,
    val opciones: List<OpcionTest>
)

data class OpcionTest(val valor: Int, val etiqueta: String)

data class ResultadoTest(
    val testId: String,
    val puntajeTotal: Int,
    val titulo: String,
    val descripcion: String,
    val creadoEn: String
)
```

### Reseña
```kotlin
data class Resena(
    val id: String,
    val citaId: String,
    val psicologoId: String,
    val calificacion: Int,           // 1-5
    val comentario: String?,
    val creadaEn: String
)
```

---

## 4. DTOs (respuestas JSON de la API)

Los DTOs mapean 1:1 con el JSON. Ejemplo:

```kotlin
// data/remote/dto/UsuarioDto.kt
data class UsuarioDto(
    val id: String,
    val nombre: String,
    val email: String,
    val telefono: String?,
    val ciudad: String?,
    val rol: String,
    val plan: String,
    val emailVerificado: Boolean,
    val consentimientoDatos: Boolean,
    val consentimientoIA: Boolean,
    val estado: String,
    val creadoEn: String
)

fun UsuarioDto.toDomain() = Usuario(
    id = id,
    nombre = nombre,
    email = email,
    telefono = telefono,
    ciudad = ciudad,
    rol = Rol.valueOf(rol),
    plan = PlanSuscripcion.valueOf(plan),
    emailVerificado = emailVerificado,
    consentimientoDatos = consentimientoDatos,
    consentimientoIA = consentimientoIA,
    estado = EstadoUsuario.valueOf(estado),
    creadoEn = creadoEn
)
```

---

## 5. Room — Entidades para caché offline

```kotlin
// Caché de mensajes de chat para offline reading
@Entity(tableName = "mensajes_chat")
data class MensajeChatEntity(
    @PrimaryKey val id: String,
    val sesionId: String,
    val rol: String,
    val contenido: String,
    val esCrisis: Boolean,
    val nivelCrisis: String,
    val creadoEn: String
)

// Caché del perfil del usuario
@Entity(tableName = "usuario")
data class UsuarioEntity(
    @PrimaryKey val id: String,
    val nombre: String,
    val email: String,
    val plan: String,
    val rol: String,
    val emailVerificado: Boolean
)

// Caché de entradas del diario
@Entity(tableName = "entradas_diario")
data class EntradaDiarioEntity(
    @PrimaryKey val id: String,
    val contenido: String,
    val animo: Int,
    val emociones: String,   // JSON string
    val etiquetas: String,   // JSON string
    val creadaEn: String
)
```
