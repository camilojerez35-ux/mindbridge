# MindBridge Android — API y Autenticación

## 1. URL Base

```kotlin
// En local (emulador → localhost de la máquina host)
const val BASE_URL_DEBUG = "http://10.0.2.2:3000/api/"

// En producción
const val BASE_URL_PROD = "https://mindbridge.vercel.app/api/"
```

---

## 2. Autenticación JWT (NextAuth)

MindBridge usa **NextAuth.js con cookies de sesión** (no Bearer token puro).  
La estrategia para Android es:

1. Hacer login via `POST /api/auth/callback/credentials`
2. NextAuth devuelve cookies `next-auth.session-token` y `next-auth.csrf-token`
3. Guardar esas cookies en `EncryptedSharedPreferences`
4. Adjuntarlas en cada request con un `CookieJar` de OkHttp

### Flujo alternativo más simple: Custom API endpoint
Para Android, lo más práctico es crear un endpoint propio de login que devuelva un JWT simple. Si no existe, usar el flujo de cookies con OkHttp.

### Interceptor de autenticación
```kotlin
class AuthInterceptor(
    private val sessionStore: SessionStore
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = sessionStore.getToken() ?: return chain.proceed(chain.request())
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer $token")
            .addHeader("Content-Type", "application/json")
            .build()
        return chain.proceed(request)
    }
}
```

### SessionStore (DataStore)
```kotlin
class SessionStore(private val dataStore: DataStore<Preferences>) {
    companion object {
        val TOKEN_KEY = stringPreferencesKey("session_token")
        val USER_ID_KEY = stringPreferencesKey("user_id")
        val USER_PLAN_KEY = stringPreferencesKey("user_plan")
        val USER_ROL_KEY = stringPreferencesKey("user_rol")
    }

    val token: Flow<String?> = dataStore.data.map { it[TOKEN_KEY] }

    fun getToken(): String? = runBlocking { dataStore.data.first()[TOKEN_KEY] }

    suspend fun saveSession(token: String, userId: String, plan: String, rol: String) {
        dataStore.edit {
            it[TOKEN_KEY] = token
            it[USER_ID_KEY] = userId
            it[USER_PLAN_KEY] = plan
            it[USER_ROL_KEY] = rol
        }
    }

    suspend fun clearSession() {
        dataStore.edit { it.clear() }
    }
}
```

---

## 3. Interfaces Retrofit

### AuthApi
```kotlin
interface AuthApi {
    // Registro de usuario
    @POST("auth/registro")
    suspend fun registro(@Body body: RegistroRequest): Response<RegistroResponse>

    // Login con credenciales (devuelve token de sesión)
    @POST("auth/signin")
    suspend fun login(@Body body: LoginRequest): Response<LoginResponse>

    // Solicitar reset de contraseña
    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body body: ForgotPasswordRequest): Response<MessageResponse>

    // Reset de contraseña con token
    @POST("auth/reset-password")
    suspend fun resetPassword(@Body body: ResetPasswordRequest): Response<MessageResponse>

    // Verificar email
    @POST("auth/verificar-email")
    suspend fun verificarEmail(@Body body: VerificarEmailRequest): Response<MessageResponse>

    // Reenviar verificación
    @POST("auth/reenviar-verificacion")
    suspend fun reenviarVerificacion(@Body body: EmailRequest): Response<MessageResponse>
}

// Request/Response DTOs
data class RegistroRequest(
    val nombre: String,
    val email: String,
    val password: String,
    val telefono: String? = null,
    val ciudad: String? = null
)
data class RegistroResponse(val mensaje: String, val usuario: UsuarioDto)

data class LoginRequest(val email: String, val password: String)
data class LoginResponse(val token: String, val usuario: UsuarioDto)

data class ForgotPasswordRequest(val email: String)
data class ResetPasswordRequest(val token: String, val password: String)
data class VerificarEmailRequest(val token: String)
data class EmailRequest(val email: String)
data class MessageResponse(val mensaje: String)
```

### UsuarioApi
```kotlin
interface UsuarioApi {
    @GET("usuarios")
    suspend fun getPerfil(): Response<UsuarioDto>

    @PATCH("usuarios/password")
    suspend fun cambiarPassword(@Body body: CambiarPasswordRequest): Response<MessageResponse>

    @GET("usuarios/plan")
    suspend fun getPlan(): Response<PlanResponse>

    @POST("usuarios/consentimiento")
    suspend fun registrarConsentimiento(@Body body: ConsentimientoRequest): Response<MessageResponse>
}

data class CambiarPasswordRequest(val passwordActual: String, val passwordNuevo: String)
data class PlanResponse(val plan: String, val suscripcion: SuscripcionDto?)
data class ConsentimientoRequest(val tipo: String, val version: String, val aceptado: Boolean)
```

### ChatApi
```kotlin
interface ChatApi {
    @GET("chat/sesiones")
    suspend fun getSesiones(): Response<List<SesionChatDto>>

    @POST("chat/sesiones")
    suspend fun crearSesion(@Body body: CrearSesionRequest): Response<SesionChatDto>

    @GET("chat/sesiones/{id}")
    suspend fun getSesion(@Path("id") id: String): Response<SesionChatConMensajesDto>

    @POST("ai/chat")
    suspend fun enviarMensaje(@Body body: MensajeChatRequest): Response<RespuestaChatDto>
}

data class CrearSesionRequest(val titulo: String? = null)
data class MensajeChatRequest(
    val mensaje: String,
    val sesionId: String,
    val contextoPractica: String? = null
)
data class RespuestaChatDto(
    val respuesta: String,
    val sesionId: String,
    val mensajeId: String,
    val crisis: Boolean,
    val nivel: String,
    val recursos: List<String>?,
    val tokensUsados: Int
)
data class SesionChatConMensajesDto(
    val sesion: SesionChatDto,
    val mensajes: List<MensajeChatDto>
)
```

### DiarioApi
```kotlin
interface DiarioApi {
    @GET("diario")
    suspend fun getEntradas(
        @Query("pagina") pagina: Int = 1,
        @Query("limite") limite: Int = 20
    ): Response<EntradasDiarioResponse>

    @POST("diario")
    suspend fun crearEntrada(@Body body: CrearEntradaRequest): Response<EntradaDiarioDto>

    @GET("diario/{id}")
    suspend fun getEntrada(@Path("id") id: String): Response<EntradaDiarioDto>

    @PATCH("diario/{id}")
    suspend fun actualizarEntrada(
        @Path("id") id: String,
        @Body body: ActualizarEntradaRequest
    ): Response<EntradaDiarioDto>
}

data class EntradasDiarioResponse(
    val entradas: List<EntradaDiarioDto>,
    val total: Int,
    val pagina: Int,
    val totalPaginas: Int
)
data class CrearEntradaRequest(
    val contenido: String,
    val animo: Int,
    val emociones: List<String> = emptyList(),
    val etiquetas: List<String> = emptyList(),
    val esPrivada: Boolean = false
)
data class ActualizarEntradaRequest(
    val contenido: String? = null,
    val esFavorita: Boolean? = null
)
```

### AnimoApi
```kotlin
interface AnimoApi {
    @POST("animo")
    suspend fun registrarAnimo(@Body body: RegistrarAnimoRequest): Response<RegistroAnimoDto>
}

data class RegistrarAnimoRequest(
    val valor: Int,                  // 1-10
    val nota: String? = null,
    val contexto: String? = null,    // MANANA, TARDE, NOCHE, EVENTO_ESPECIFICO
    val emociones: List<String> = emptyList()
)
```

### PsicologosApi
```kotlin
interface PsicologosApi {
    @GET("psicologos")
    suspend fun getPsicologos(
        @Query("ciudad") ciudad: String? = null,
        @Query("especialidad") especialidad: String? = null,
        @Query("modalidad") modalidad: String? = null
    ): Response<List<PsicologoDto>>
}
```

### CitasApi
```kotlin
interface CitasApi {
    @GET("citas")
    suspend fun getCitas(): Response<List<CitaDto>>

    @POST("citas")
    suspend fun crearCita(@Body body: CrearCitaRequest): Response<CrearCitaResponse>
}

data class CrearCitaRequest(
    val psicologoId: String,
    val fechaHora: String,           // ISO 8601: "2024-07-15T10:00:00-05:00"
    val tipo: String,                // PRIMERA_CONSULTA, SEGUIMIENTO, URGENTE
    val modalidad: String            // VIDEOLLAMADA
)
data class CrearCitaResponse(
    val cita: CitaDto,
    val pago: PagoWidgetDto?         // datos para el widget de Wompi
)
data class PagoWidgetDto(
    val publicKey: String,
    val referencia: String,
    val monto: Long,                 // en centavos
    val moneda: String,
    val redirectUrl: String
)
```

### ConsejoDiaApi
```kotlin
interface ConsejoDiaApi {
    @GET("consejo-dia")
    suspend fun getConsejo(): Response<ConsejoDiarioDto>

    @PATCH("consejo-dia")
    suspend fun calificarConsejo(@Body body: CalificarConsejoRequest): Response<MessageResponse>
}

data class CalificarConsejoRequest(val calificacion: Int)  // 1-5
```

### TestsApi
```kotlin
interface TestsApi {
    @GET("tests")
    suspend fun getTests(): Response<List<TestPsicologicoDto>>

    @POST("tests/resultado")
    suspend fun enviarResultado(@Body body: ResultadoTestRequest): Response<ResultadoTestDto>
}

data class ResultadoTestRequest(
    val testId: String,
    val respuestas: Map<String, Int>  // preguntaId -> valor
)
```

### ResenasApi
```kotlin
interface ResenasApi {
    @GET("resenas")
    suspend fun getResenas(): Response<List<ResenaDto>>

    @POST("resenas")
    suspend fun crearResena(@Body body: CrearResenaRequest): Response<ResenaDto>
}

data class CrearResenaRequest(
    val citaId: String,
    val calificacion: Int,           // 1-5
    val comentario: String? = null
)
```

---

## 4. Módulo Retrofit (Hilt)

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor
    ): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG)
                HttpLoggingInterceptor.Level.BODY
            else
                HttpLoggingInterceptor.Level.NONE
        })
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)   // chat IA puede tardar
        .build()

    @Provides
    @Singleton
    fun provideRetrofit(client: OkHttpClient): Retrofit = Retrofit.Builder()
        .baseUrl(if (BuildConfig.DEBUG) BASE_URL_DEBUG else BASE_URL_PROD)
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    @Provides @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi = retrofit.create(AuthApi::class.java)

    @Provides @Singleton
    fun provideChatApi(retrofit: Retrofit): ChatApi = retrofit.create(ChatApi::class.java)

    @Provides @Singleton
    fun provideDiarioApi(retrofit: Retrofit): DiarioApi = retrofit.create(DiarioApi::class.java)

    @Provides @Singleton
    fun provideCitasApi(retrofit: Retrofit): CitasApi = retrofit.create(CitasApi::class.java)

    @Provides @Singleton
    fun providePsicologosApi(retrofit: Retrofit): PsicologosApi = retrofit.create(PsicologosApi::class.java)

    @Provides @Singleton
    fun provideAnimoApi(retrofit: Retrofit): AnimoApi = retrofit.create(AnimoApi::class.java)

    @Provides @Singleton
    fun provideTestsApi(retrofit: Retrofit): TestsApi = retrofit.create(TestsApi::class.java)

    @Provides @Singleton
    fun provideResenasApi(retrofit: Retrofit): ResenasApi = retrofit.create(ResenasApi::class.java)
}
```

---

## 5. Manejo de errores de API

```kotlin
sealed class ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>()
    data class Error(val code: Int, val mensaje: String) : ApiResult<Nothing>()
    object Loading : ApiResult<Nothing>()
}

// Extension para Response<T>
suspend fun <T> safeApiCall(call: suspend () -> Response<T>): ApiResult<T> {
    return try {
        val response = call()
        if (response.isSuccessful) {
            ApiResult.Success(response.body()!!)
        } else {
            val errorBody = response.errorBody()?.string()
            val mensaje = try {
                Gson().fromJson(errorBody, ErrorResponse::class.java).mensaje
            } catch (e: Exception) {
                "Error del servidor: ${response.code()}"
            }
            ApiResult.Error(response.code(), mensaje)
        }
    } catch (e: IOException) {
        ApiResult.Error(-1, "Sin conexión a internet")
    } catch (e: Exception) {
        ApiResult.Error(-2, "Error inesperado: ${e.message}")
    }
}

data class ErrorResponse(val mensaje: String, val error: String? = null)
```

---

## 6. Códigos de error importantes

| Código | Significado | Acción en app |
|--------|-------------|---------------|
| 401 | No autenticado / sesión expirada | Redirigir a login |
| 403 | Sin permisos (ej: plan insuficiente) | Mostrar upgrade a PLUS |
| 429 | Rate limit excedido (chat IA: 10/min) | Mostrar timer countdown |
| 402 | Pago requerido | Abrir flujo de pago Wompi |
| 400 | Datos inválidos | Mostrar mensaje de error específico |
| 500 | Error servidor | Mostrar error genérico + botón reintentar |

---

## 7. Google Sign-In (OAuth)

```kotlin
// En build.gradle.kts
implementation("com.google.android.gms:play-services-auth:21.1.0")

// Configuración en Activity
val googleSignInOptions = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
    .requestIdToken("TU_GOOGLE_CLIENT_ID_WEB")  // del dashboard de Google Cloud
    .requestEmail()
    .build()

val googleSignInClient = GoogleSignIn.getClient(this, googleSignInOptions)

// Lanzar intent
val signInIntent = googleSignInClient.signInIntent
startActivityForResult(signInIntent, RC_SIGN_IN)

// Manejar resultado
val task = GoogleSignIn.getSignedInAccountFromIntent(data)
val account = task.getResult(ApiException::class.java)
val idToken = account.idToken
// Enviar idToken al backend para crear sesión NextAuth
```

---

## 8. Pago con Wompi (WebView)

Wompi no tiene SDK Android oficial. Se usa un **WebView** con la URL del widget:

```kotlin
@Composable
fun PagoWompiScreen(pagoData: PagoWidgetDto, onPagoCompletado: () -> Unit) {
    val context = LocalContext.current
    val url = buildWompiUrl(pagoData)

    AndroidView(factory = {
        WebView(it).apply {
            settings.javaScriptEnabled = true
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    val urlStr = request?.url?.toString() ?: return false
                    if (urlStr.contains("pago-exitoso") || urlStr.contains("redirect")) {
                        onPagoCompletado()
                        return true
                    }
                    return false
                }
            }
            loadUrl(url)
        }
    })
}

fun buildWompiUrl(data: PagoWidgetDto): String {
    return "https://checkout.wompi.co/p/?" +
        "public-key=${data.publicKey}" +
        "&currency=COP" +
        "&amount-in-cents=${data.monto}" +
        "&reference=${data.referencia}" +
        "&redirect-url=${data.redirectUrl}"
}
```
