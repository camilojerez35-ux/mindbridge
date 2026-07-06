# MindBridge Android — Configuración de Android Studio

## 1. Requisitos previos

| Herramienta | Versión mínima |
|-------------|----------------|
| Android Studio | Hedgehog (2023.1.1) o superior |
| JDK | 17 |
| Kotlin | 2.0.0 |
| Gradle | 8.6 |
| Android Gradle Plugin | 8.3.0 |
| Min SDK | API 26 (Android 8.0) |
| Target SDK | API 35 (Android 15) |
| Compile SDK | 35 |

---

## 2. Creación del proyecto en Android Studio

1. **File → New → New Project**
2. Seleccionar: **Empty Activity (Compose)**
3. Configurar:
   - **Name:** MindBridge
   - **Package name:** com.mindbridge.app
   - **Save location:** (tu ruta)
   - **Language:** Kotlin
   - **Minimum SDK:** API 26
4. Click **Finish**

---

## 3. build.gradle.kts (Project)

```kotlin
// build.gradle.kts (raíz del proyecto)
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.hilt) apply false
    alias(libs.plugins.ksp) apply false
}
```

## 4. libs.versions.toml (Version Catalog)

Crea o reemplaza `gradle/libs.versions.toml`:

```toml
[versions]
agp = "8.3.2"
kotlin = "2.0.0"
coreKtx = "1.13.1"
lifecycleRuntimeKtx = "2.8.0"
activityCompose = "1.9.0"
composeBom = "2024.05.00"
navigationCompose = "2.7.7"
hilt = "2.51.1"
hiltNavigationCompose = "1.2.0"
room = "2.6.1"
datastore = "1.1.1"
retrofit = "2.11.0"
okhttp = "4.12.0"
coil = "2.6.0"
coroutines = "1.8.0"
securityCrypto = "1.1.0-alpha06"
googlePlayServicesAuth = "21.1.0"
accompanistPermissions = "0.34.0"
splashscreen = "1.0.1"
ksp = "2.0.0-1.0.21"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-runtime-compose = { group = "androidx.lifecycle", name = "lifecycle-runtime-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-compiler", version.ref = "hilt" }
hilt-navigation-compose = { group = "androidx.hilt", name = "hilt-navigation-compose", version.ref = "hiltNavigationCompose" }
room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }
retrofit = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }
retrofit-gson = { group = "com.squareup.retrofit2", name = "converter-gson", version.ref = "retrofit" }
okhttp = { group = "com.squareup.okhttp3", name = "okhttp", version.ref = "okhttp" }
okhttp-logging = { group = "com.squareup.okhttp3", name = "logging-interceptor", version.ref = "okhttp" }
coil-compose = { group = "io.coil-kt", name = "coil-compose", version.ref = "coil" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }
security-crypto = { group = "androidx.security", name = "security-crypto", version.ref = "securityCrypto" }
play-services-auth = { group = "com.google.android.gms", name = "play-services-auth", version.ref = "googlePlayServicesAuth" }
accompanist-permissions = { group = "com.google.accompanist", name = "accompanist-permissions", version.ref = "accompanistPermissions" }
splashscreen = { group = "androidx.core", name = "core-splashscreen", version.ref = "splashscreen" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
```

## 5. build.gradle.kts (App module)

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.mindbridge.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.mindbridge.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        debug {
            isDebuggable = true
            buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:3000/api/\"")
        }
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            buildConfigField("String", "API_BASE_URL", "\"https://TU-DOMINIO.com/api/\"")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.activity.compose)

    val composeBom = platform(libs.androidx.compose.bom)
    implementation(composeBom)
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    debugImplementation(libs.androidx.ui.tooling)

    implementation(libs.androidx.navigation.compose)

    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.hilt.navigation.compose)

    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)

    implementation(libs.datastore.preferences)

    implementation(libs.retrofit)
    implementation(libs.retrofit.gson)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)

    implementation(libs.coil.compose)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.security.crypto)
    implementation(libs.play.services.auth)
    implementation(libs.accompanist.permissions)
    implementation(libs.splashscreen)
}
```

---

## 6. AndroidManifest.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permisos de red -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Para notificaciones push (futuro) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Para videollamadas -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />

    <application
        android:name=".MindBridgeApp"
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="false"
        android:theme="@style/Theme.MindBridge"
        android:usesCleartextTraffic="true">  <!-- Solo para desarrollo local -->

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.MindBridge.SplashScreen">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Google Sign-In -->
        <meta-data
            android:name="com.google.android.gms.version"
            android:value="@integer/google_play_services_version" />
    </application>
</manifest>
```

> **Nota:** Quitar `android:usesCleartextTraffic="true"` en producción. Para debug con localhost, es necesario.

---

## 7. Clase Application (Hilt)

```kotlin
// app/src/main/java/com/mindbridge/app/MindBridgeApp.kt
@HiltAndroidApp
class MindBridgeApp : Application()
```

---

## 8. MainActivity

```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        val splashScreen = installSplashScreen()
        super.onCreate(savedInstanceState)

        enableEdgeToEdge()

        setContent {
            MindBridgeTheme {
                MindBridgeNavHost()
            }
        }
    }
}
```

---

## 9. Tema (Material 3 — colores de MindBridge)

```kotlin
// ui/theme/Color.kt
val PrimaryGreen = Color(0xFF10B981)      // verde teal (color principal)
val PrimaryGreenDark = Color(0xFF059669)
val SecondaryBlue = Color(0xFF3B82F6)
val BackgroundLight = Color(0xFFF8FAFC)
val SurfaceLight = Color(0xFFFFFFFF)
val TextPrimary = Color(0xFF1E293B)
val TextSecondary = Color(0xFF64748B)
val ErrorRed = Color(0xFFEF4444)
val WarningAmber = Color(0xFFF59E0B)
val CrisisRed = Color(0xFFDC2626)

// ui/theme/Theme.kt
@Composable
fun MindBridgeTheme(content: @Composable () -> Unit) {
    val colorScheme = lightColorScheme(
        primary = PrimaryGreen,
        onPrimary = Color.White,
        primaryContainer = Color(0xFFD1FAE5),
        secondary = SecondaryBlue,
        background = BackgroundLight,
        surface = SurfaceLight,
        error = ErrorRed
    )

    MaterialTheme(
        colorScheme = colorScheme,
        typography = MindBridgeTypography,
        content = content
    )
}
```

---

## 10. Hilt — Módulo de DataStore

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object DataModule {

    @Provides
    @Singleton
    fun provideDataStore(@ApplicationContext context: Context): DataStore<Preferences> =
        PreferenceDataStoreFactory.create(
            produceFile = { context.preferencesDataStoreFile("mindbridge_prefs") }
        )

    @Provides
    @Singleton
    fun provideSessionStore(dataStore: DataStore<Preferences>): SessionStore =
        SessionStore(dataStore)
}
```

---

## 11. Proguard (release)

Agrega a `proguard-rules.pro`:

```
# Retrofit
-keepattributes Signature
-keepattributes *Annotation*
-keep class retrofit2.** { *; }
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}

# Gson
-keep class com.google.gson.** { *; }
-keep class com.mindbridge.app.data.remote.dto.** { *; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# Hilt
-keep class dagger.hilt.** { *; }
```

---

## 12. Strings importantes (res/values/strings.xml)

```xml
<resources>
    <string name="app_name">MindBridge</string>
    <string name="slogan">Tu bienestar mental, siempre contigo</string>

    <!-- Auth -->
    <string name="login_titulo">Bienvenido de nuevo</string>
    <string name="registro_titulo">Crea tu cuenta</string>
    <string name="email_hint">Correo electrónico</string>
    <string name="password_hint">Contraseña</string>

    <!-- Chat IA -->
    <string name="chat_placeholder">Escribe cómo te sientes…</string>
    <string name="crisis_alerta">Detectamos que podrías necesitar ayuda inmediata</string>
    <string name="linea_crisis">Línea 106 — Salud Mental Colombia</string>

    <!-- Ánimo -->
    <string name="animo_pregunta">¿Cómo te sientes hoy?</string>

    <!-- Planes -->
    <string name="plan_gratis">Gratis</string>
    <string name="plan_plus">Plus</string>
    <string name="plan_familia">Familia</string>
    <string name="plan_empresarial">Empresarial</string>
</resources>
```
