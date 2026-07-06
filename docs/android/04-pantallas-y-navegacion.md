# MindBridge Android — Pantallas y Navegación

## 1. Mapa de navegación completo

```
SplashScreen
│
├── [No autenticado]
│   ├── OnboardingScreen (3 slides)
│   ├── LoginScreen
│   │   ├── ForgotPasswordScreen
│   │   └── GoogleSignIn
│   └── RegistroScreen
│       └── VerificarEmailScreen
│
└── [Autenticado] → MainNavHost (BottomNav)
    ├── 🏠 Inicio (HomeScreen)
    │   ├── ConsejoDiaCard
    │   ├── RegistroAnimoRapido
    │   └── AccesosRapidos
    │
    ├── 💬 Chat IA (ChatListScreen)
    │   └── ChatSesionScreen
    │       └── CrisisAlertaDialog
    │
    ├── 📓 Diario (DiarioListScreen)
    │   ├── NuevaEntradaScreen
    │   └── EntradaDetalleScreen
    │
    ├── 🧑‍⚕️ Psicólogos (PsicologosListScreen)
    │   ├── PsicologoPerfilScreen
    │   └── ReservarCitaScreen
    │       └── PagoWompiScreen (WebView)
    │
    └── 👤 Perfil (PerfilScreen)
        ├── MisCitasScreen
        │   ├── CitaDetalleScreen
        │   └── ResenaScreen
        ├── TestsScreen
        │   └── TestDetalleScreen
        ├── SuscripcionScreen
        ├── ExportarDatosScreen
        └── ConfiguracionScreen
```

---

## 2. Rutas de navegación

```kotlin
// navigation/Routes.kt
sealed class Route(val path: String) {
    object Splash : Route("splash")
    object Onboarding : Route("onboarding")
    object Login : Route("login")
    object Registro : Route("registro")
    object VerificarEmail : Route("verificar-email")
    object ForgotPassword : Route("forgot-password")

    // Main (con bottom nav)
    object Home : Route("home")
    object ChatList : Route("chat/lista")
    object ChatSesion : Route("chat/sesion/{sesionId}") {
        fun withId(id: String) = "chat/sesion/$id"
    }
    object DiarioList : Route("diario/lista")
    object NuevaEntrada : Route("diario/nueva")
    object EntradaDetalle : Route("diario/{entradaId}") {
        fun withId(id: String) = "diario/$id"
    }
    object PsicologosList : Route("psicologos/lista")
    object PsicologoPerfil : Route("psicologos/{psicologoId}") {
        fun withId(id: String) = "psicologos/$id"
    }
    object ReservarCita : Route("citas/reservar/{psicologoId}") {
        fun withId(id: String) = "citas/reservar/$id"
    }
    object PagoWompi : Route("pago/wompi")
    object Perfil : Route("perfil")
    object MisCitas : Route("perfil/citas")
    object CitaDetalle : Route("perfil/citas/{citaId}") {
        fun withId(id: String) = "perfil/citas/$id"
    }
    object Resena : Route("perfil/resena/{citaId}") {
        fun withId(id: String) = "perfil/resena/$id"
    }
    object Tests : Route("perfil/tests")
    object TestDetalle : Route("perfil/tests/{testId}") {
        fun withId(id: String) = "perfil/tests/$id"
    }
    object Suscripcion : Route("perfil/suscripcion")
    object Configuracion : Route("perfil/configuracion")
}
```

---

## 3. NavHost principal

```kotlin
@Composable
fun MindBridgeNavHost() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = Route.Splash.path) {
        composable(Route.Splash.path) {
            SplashScreen(
                onAutenticado = { navController.navigate(Route.Home.path) { popUpTo(0) } },
                onNoAutenticado = { navController.navigate(Route.Onboarding.path) { popUpTo(0) } }
            )
        }

        composable(Route.Onboarding.path) {
            OnboardingScreen(
                onIrALogin = { navController.navigate(Route.Login.path) },
                onIrARegistro = { navController.navigate(Route.Registro.path) }
            )
        }

        composable(Route.Login.path) {
            LoginScreen(
                onLoginExitoso = { navController.navigate(Route.Home.path) { popUpTo(0) } },
                onIrARegistro = { navController.navigate(Route.Registro.path) },
                onForgotPassword = { navController.navigate(Route.ForgotPassword.path) }
            )
        }

        composable(Route.Registro.path) {
            RegistroScreen(
                onRegistroExitoso = { navController.navigate(Route.VerificarEmail.path) },
                onIrALogin = { navController.popBackStack() }
            )
        }

        composable(Route.Home.path) {
            MainScaffold(navController = navController)
        }

        // ... resto de rutas dentro de MainScaffold
    }
}

@Composable
fun MainScaffold(navController: NavController) {
    val bottomNavController = rememberNavController()

    Scaffold(
        bottomBar = { MindBridgeBottomNav(navController = bottomNavController) }
    ) { padding ->
        NavHost(
            navController = bottomNavController,
            startDestination = Route.Home.path,
            modifier = Modifier.padding(padding)
        ) {
            composable(Route.Home.path) { HomeScreen(navController = bottomNavController) }
            composable(Route.ChatList.path) { ChatListScreen(navController = bottomNavController) }
            composable(Route.DiarioList.path) { DiarioListScreen(navController = bottomNavController) }
            composable(Route.PsicologosList.path) { PsicologosListScreen(navController = bottomNavController) }
            composable(Route.Perfil.path) { PerfilScreen(navController = bottomNavController) }

            // Rutas hijas
            composable("chat/sesion/{sesionId}") { backStack ->
                ChatSesionScreen(
                    sesionId = backStack.arguments?.getString("sesionId") ?: "",
                    onBack = { bottomNavController.popBackStack() }
                )
            }
            // ... etc.
        }
    }
}
```

---

## 4. Bottom Navigation Bar

```kotlin
@Composable
fun MindBridgeBottomNav(navController: NavController) {
    val items = listOf(
        BottomNavItem("Inicio", Route.Home.path, Icons.Default.Home),
        BottomNavItem("Chat IA", Route.ChatList.path, Icons.Default.Chat),
        BottomNavItem("Diario", Route.DiarioList.path, Icons.Default.Book),
        BottomNavItem("Psicólogos", Route.PsicologosList.path, Icons.Default.Person),
        BottomNavItem("Perfil", Route.Perfil.path, Icons.Default.AccountCircle)
    )

    val navBackStack by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStack?.destination?.route

    NavigationBar {
        items.forEach { item ->
            NavigationBarItem(
                icon = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label, style = MaterialTheme.typography.labelSmall) },
                selected = currentRoute == item.route,
                onClick = {
                    navController.navigate(item.route) {
                        popUpTo(navController.graph.startDestinationId) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }
    }
}

data class BottomNavItem(val label: String, val route: String, val icon: ImageVector)
```

---

## 5. Pantallas principales — estructura

### SplashScreen
```kotlin
@Composable
fun SplashScreen(onAutenticado: () -> Unit, onNoAutenticado: () -> Unit) {
    val viewModel: AuthViewModel = hiltViewModel()
    val sessionState by viewModel.sessionState.collectAsState()

    LaunchedEffect(sessionState) {
        when (sessionState) {
            is SessionState.Autenticado -> onAutenticado()
            is SessionState.NoAutenticado -> onNoAutenticado()
            else -> {}
        }
    }

    Box(
        modifier = Modifier.fillMaxSize().background(PrimaryGreen),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Image(painter = painterResource(R.drawable.logo_mindbridge), contentDescription = null)
            Spacer(Modifier.height(16.dp))
            Text("MindBridge", style = MaterialTheme.typography.headlineLarge, color = Color.White)
            Text("Tu bienestar mental, siempre contigo",
                style = MaterialTheme.typography.bodyMedium, color = Color.White.copy(alpha = 0.8f))
        }
    }
}
```

### LoginScreen
```kotlin
@Composable
fun LoginScreen(
    onLoginExitoso: () -> Unit,
    onIrARegistro: () -> Unit,
    onForgotPassword: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.loginState.collectAsState()

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text("Bienvenido de nuevo", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(32.dp))

        OutlinedTextField(
            value = viewModel.email,
            onValueChange = viewModel::onEmailChange,
            label = { Text("Correo electrónico") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(16.dp))

        OutlinedTextField(
            value = viewModel.password,
            onValueChange = viewModel::onPasswordChange,
            label = { Text("Contraseña") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        TextButton(onClick = onForgotPassword) {
            Text("¿Olvidaste tu contraseña?")
        }
        Spacer(Modifier.height(24.dp))

        Button(
            onClick = { viewModel.login(onSuccess = onLoginExitoso) },
            modifier = Modifier.fillMaxWidth().height(52.dp),
            enabled = uiState !is LoginState.Loading
        ) {
            if (uiState is LoginState.Loading)
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White)
            else
                Text("Iniciar sesión")
        }

        if (uiState is LoginState.Error) {
            Spacer(Modifier.height(8.dp))
            Text((uiState as LoginState.Error).mensaje, color = MaterialTheme.colorScheme.error)
        }

        Spacer(Modifier.height(24.dp))
        Row(horizontalArrangement = Arrangement.Center, modifier = Modifier.fillMaxWidth()) {
            Text("¿No tienes cuenta? ")
            TextButton(onClick = onIrARegistro) { Text("Regístrate") }
        }
    }
}
```

### HomeScreen
```kotlin
@Composable
fun HomeScreen(navController: NavController, viewModel: HomeViewModel = hiltViewModel()) {
    val consejo by viewModel.consejo.collectAsState()
    val usuario by viewModel.usuario.collectAsState()

    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        item {
            Text("Hola, ${usuario?.nombre?.split(" ")?.first() ?: ""} 👋",
                style = MaterialTheme.typography.headlineSmall)
            Text("¿Cómo te sientes hoy?", style = MaterialTheme.typography.bodyLarge,
                color = TextSecondary)
            Spacer(Modifier.height(16.dp))
        }

        // Widget registro de ánimo
        item {
            AnimoRapidoCard(onAnimoRegistrado = { valor -> viewModel.registrarAnimo(valor) })
            Spacer(Modifier.height(16.dp))
        }

        // Consejo del día
        item {
            consejo?.let { ConsejoDiaCard(consejo = it, onCalificar = viewModel::calificarConsejo) }
            Spacer(Modifier.height(16.dp))
        }

        // Acceso rápido a chat IA
        item {
            AccesoRapidoCard(
                titulo = "Hablar con IA",
                descripcion = "Apoyo emocional disponible 24/7",
                icono = Icons.Default.Psychology,
                onClick = { navController.navigate(Route.ChatList.path) }
            )
            Spacer(Modifier.height(8.dp))
        }

        // Acceso a psicólogos
        item {
            AccesoRapidoCard(
                titulo = "Ver psicólogos",
                descripcion = "Consultas con profesionales verificados",
                icono = Icons.Default.MedicalServices,
                onClick = { navController.navigate(Route.PsicologosList.path) }
            )
        }
    }
}
```

### ChatSesionScreen
```kotlin
@Composable
fun ChatSesionScreen(
    sesionId: String,
    onBack: () -> Unit,
    viewModel: ChatViewModel = hiltViewModel()
) {
    val mensajes by viewModel.mensajes.collectAsState()
    val enviando by viewModel.enviando.collectAsState()
    val crisisDetectada by viewModel.crisisDetectada.collectAsState()
    var texto by remember { mutableStateOf("") }

    if (crisisDetectada) {
        CrisisAlertaDialog(
            onDismiss = viewModel::limpiarCrisis,
            onLlamarLinea = { /* Intent tel:106 */ }
        )
    }

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(title = { Text("Chat con IA") }, navigationIcon = {
            IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, null) }
        })

        LazyColumn(
            modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
            reverseLayout = false
        ) {
            items(mensajes) { mensaje ->
                MensajeBubble(mensaje = mensaje)
                Spacer(Modifier.height(8.dp))
            }
        }

        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = texto,
                onValueChange = { texto = it },
                placeholder = { Text("Escribe cómo te sientes…") },
                modifier = Modifier.weight(1f),
                maxLines = 4
            )
            Spacer(Modifier.width(8.dp))
            IconButton(
                onClick = {
                    if (texto.isNotBlank()) {
                        viewModel.enviarMensaje(sesionId, texto)
                        texto = ""
                    }
                },
                enabled = !enviando
            ) {
                if (enviando)
                    CircularProgressIndicator(modifier = Modifier.size(24.dp))
                else
                    Icon(Icons.Default.Send, null, tint = PrimaryGreen)
            }
        }
    }
}

@Composable
fun MensajeBubble(mensaje: MensajeChat) {
    val esUsuario = mensaje.rol == RolMensaje.USER
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (esUsuario) Arrangement.End else Arrangement.Start
    ) {
        Card(
            modifier = Modifier.widthIn(max = 280.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (esUsuario) PrimaryGreen else Color(0xFFF1F5F9)
            ),
            shape = RoundedCornerShape(
                topStart = 16.dp, topEnd = 16.dp,
                bottomStart = if (esUsuario) 16.dp else 4.dp,
                bottomEnd = if (esUsuario) 4.dp else 16.dp
            )
        ) {
            Text(
                text = mensaje.contenido,
                modifier = Modifier.padding(12.dp),
                color = if (esUsuario) Color.White else TextPrimary
            )
        }
    }
}
```

### CrisisAlertaDialog
```kotlin
@Composable
fun CrisisAlertaDialog(onDismiss: () -> Unit, onLlamarLinea: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFFFEF2F2),
        icon = { Icon(Icons.Default.Warning, null, tint = CrisisRed) },
        title = { Text("¿Necesitas ayuda inmediata?", color = CrisisRed) },
        text = {
            Text(
                "Detectamos que podrías estar pasando por un momento difícil. " +
                "Recuerda que hay ayuda disponible ahora mismo.",
                textAlign = TextAlign.Center
            )
        },
        confirmButton = {
            Button(
                onClick = onLlamarLinea,
                colors = ButtonDefaults.buttonColors(containerColor = CrisisRed)
            ) {
                Icon(Icons.Default.Phone, null)
                Spacer(Modifier.width(4.dp))
                Text("Llamar Línea 106")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Continuar") }
        }
    )
}
```

---

## 6. ViewModels

### AuthViewModel
```kotlin
@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val sessionStore: SessionStore
) : ViewModel() {

    var email by mutableStateOf("")
    var password by mutableStateOf("")

    private val _loginState = MutableStateFlow<LoginState>(LoginState.Idle)
    val loginState: StateFlow<LoginState> = _loginState

    private val _sessionState = MutableStateFlow<SessionState>(SessionState.Verificando)
    val sessionState: StateFlow<SessionState> = _sessionState

    init {
        checkSession()
    }

    private fun checkSession() {
        viewModelScope.launch {
            val token = sessionStore.getToken()
            _sessionState.value = if (token != null) SessionState.Autenticado else SessionState.NoAutenticado
        }
    }

    fun onEmailChange(value: String) { email = value }
    fun onPasswordChange(value: String) { password = value }

    fun login(onSuccess: () -> Unit) {
        viewModelScope.launch {
            _loginState.value = LoginState.Loading
            when (val result = authRepository.login(email, password)) {
                is ApiResult.Success -> {
                    sessionStore.saveSession(
                        token = result.data.token,
                        userId = result.data.usuario.id,
                        plan = result.data.usuario.plan,
                        rol = result.data.usuario.rol
                    )
                    _loginState.value = LoginState.Exito
                    onSuccess()
                }
                is ApiResult.Error -> {
                    _loginState.value = LoginState.Error(result.mensaje)
                }
                else -> {}
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            sessionStore.clearSession()
            _sessionState.value = SessionState.NoAutenticado
        }
    }
}

sealed class LoginState {
    object Idle : LoginState()
    object Loading : LoginState()
    object Exito : LoginState()
    data class Error(val mensaje: String) : LoginState()
}

sealed class SessionState {
    object Verificando : SessionState()
    object Autenticado : SessionState()
    object NoAutenticado : SessionState()
}
```

### ChatViewModel
```kotlin
@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository
) : ViewModel() {

    private val _mensajes = MutableStateFlow<List<MensajeChat>>(emptyList())
    val mensajes: StateFlow<List<MensajeChat>> = _mensajes

    private val _enviando = MutableStateFlow(false)
    val enviando: StateFlow<Boolean> = _enviando

    private val _crisisDetectada = MutableStateFlow(false)
    val crisisDetectada: StateFlow<Boolean> = _crisisDetectada

    fun cargarMensajes(sesionId: String) {
        viewModelScope.launch {
            when (val result = chatRepository.getSesion(sesionId)) {
                is ApiResult.Success -> _mensajes.value = result.data.mensajes.map { it.toDomain() }
                else -> {}
            }
        }
    }

    fun enviarMensaje(sesionId: String, texto: String) {
        viewModelScope.launch {
            _enviando.value = true

            // Agregar mensaje del usuario inmediatamente (optimistic UI)
            val mensajeUsuario = MensajeChat(
                id = "temp-${System.currentTimeMillis()}",
                sesionId = sesionId,
                rol = RolMensaje.USER,
                contenido = texto,
                esCrisis = false,
                nivelCrisis = NivelCrisis.NINGUNO,
                creadoEn = ""
            )
            _mensajes.value = _mensajes.value + mensajeUsuario

            when (val result = chatRepository.enviarMensaje(sesionId, texto)) {
                is ApiResult.Success -> {
                    val respuesta = MensajeChat(
                        id = result.data.mensajeId,
                        sesionId = sesionId,
                        rol = RolMensaje.ASSISTANT,
                        contenido = result.data.respuesta,
                        esCrisis = result.data.crisis,
                        nivelCrisis = NivelCrisis.valueOf(result.data.nivel),
                        creadoEn = ""
                    )
                    _mensajes.value = _mensajes.value + respuesta
                    if (result.data.crisis) _crisisDetectada.value = true
                }
                is ApiResult.Error -> {
                    // Remover mensaje optimista en caso de error
                    _mensajes.value = _mensajes.value.filter { it.id != mensajeUsuario.id }
                }
                else -> {}
            }
            _enviando.value = false
        }
    }

    fun limpiarCrisis() { _crisisDetectada.value = false }
}
```

---

## 7. Componentes reutilizables

```kotlin
// AnimoSlider — para seleccionar valor 1-10
@Composable
fun AnimoSlider(valor: Int, onCambio: (Int) -> Unit) {
    Column {
        val emojis = listOf("😢","😞","😕","😐","🙂","😊","😃","😄","🥰","🤩")
        Text(text = emojis.getOrNull(valor - 1) ?: "😐",
            style = MaterialTheme.typography.displayMedium,
            modifier = Modifier.align(Alignment.CenterHorizontally))
        Slider(
            value = valor.toFloat(),
            onValueChange = { onCambio(it.roundToInt()) },
            valueRange = 1f..10f,
            steps = 8,
            colors = SliderDefaults.colors(thumbColor = PrimaryGreen, activeTrackColor = PrimaryGreen)
        )
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Muy mal", style = MaterialTheme.typography.labelSmall)
            Text("Excelente", style = MaterialTheme.typography.labelSmall)
        }
    }
}

// EstrellaCalificacion — para reseñas
@Composable
fun EstrellaCalificacion(calificacion: Int, onSeleccionar: (Int) -> Unit, modifier: Modifier = Modifier) {
    Row(modifier = modifier) {
        (1..5).forEach { estrella ->
            IconButton(onClick = { onSeleccionar(estrella) }) {
                Icon(
                    imageVector = if (estrella <= calificacion) Icons.Default.Star else Icons.Default.StarOutline,
                    contentDescription = null,
                    tint = if (estrella <= calificacion) WarningAmber else TextSecondary
                )
            }
        }
    }
}

// PlanBadge — insignia de plan del usuario
@Composable
fun PlanBadge(plan: PlanSuscripcion) {
    val (color, texto) = when (plan) {
        PlanSuscripcion.GRATIS -> Pair(Color(0xFF94A3B8), "Gratis")
        PlanSuscripcion.PLUS -> Pair(PrimaryGreen, "Plus")
        PlanSuscripcion.FAMILIA -> Pair(SecondaryBlue, "Familia")
        PlanSuscripcion.EMPRESARIAL -> Pair(Color(0xFF8B5CF6), "Empresarial")
    }
    Surface(shape = RoundedCornerShape(12.dp), color = color.copy(alpha = 0.15f)) {
        Text(text = texto, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            color = color, style = MaterialTheme.typography.labelSmall)
    }
}
```

---

## 8. Permisos de videollamada

La videollamada usa **Daily.co** en un WebView (igual que Wompi):

```kotlin
@Composable
fun VideollamadaScreen(citaId: String, roomUrl: String) {
    val cameraPermission = rememberPermissionState(Manifest.permission.CAMERA)
    val audioPermission = rememberPermissionState(Manifest.permission.RECORD_AUDIO)

    LaunchedEffect(Unit) {
        cameraPermission.launchPermissionRequest()
        audioPermission.launchPermissionRequest()
    }

    if (cameraPermission.status.isGranted && audioPermission.status.isGranted) {
        AndroidView(factory = { ctx ->
            WebView(ctx).apply {
                settings.apply {
                    javaScriptEnabled = true
                    mediaPlaybackRequiresUserGesture = false
                    allowFileAccess = true
                }
                webChromeClient = object : WebChromeClient() {
                    override fun onPermissionRequest(request: PermissionRequest) {
                        request.grant(request.resources)
                    }
                }
                loadUrl(roomUrl)
            }
        })
    } else {
        // Mostrar explicación de permisos
        Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(Icons.Default.VideocamOff, null, modifier = Modifier.size(64.dp))
            Text("Se necesitan permisos de cámara y micrófono")
            Button(onClick = { cameraPermission.launchPermissionRequest() }) {
                Text("Conceder permisos")
            }
        }
    }
}
```

---

## 9. Orden de implementación sugerido

| Fase | Funcionalidad | Prioridad |
|------|---------------|-----------|
| 1 | Auth (login, registro, sesión) | Crítica |
| 2 | Home + Registro de ánimo | Alta |
| 3 | Chat IA + detección de crisis | Alta |
| 4 | Diario emocional | Media |
| 5 | Listado de psicólogos + perfil | Media |
| 6 | Reserva de citas + Wompi WebView | Media |
| 7 | Perfil + Mis citas | Media |
| 8 | Tests psicológicos | Baja |
| 9 | Videollamada WebView | Baja |
| 10 | Push notifications (FCM) | Baja |
