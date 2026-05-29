'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Brain, Eye, EyeOff, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [recordarme, setRecordarme] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [touched, setTouched]   = useState({ email: false, password: false });


  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  // Mostrar mensaje de registro exitoso
  useEffect(() => {
    if (searchParams.get('registered')) {
      setError('Cuenta creada. Revisa tu correo para verificarla antes de iniciar sesión.');
    }
  }, [searchParams]);

  // Verificar lockout guardado
  useEffect(() => {
    const stored = localStorage.getItem('mb_lockout');
    if (stored) {
      const until = parseInt(stored);
      if (Date.now() < until) setLockoutUntil(until);
      else localStorage.removeItem('mb_lockout');
    }
  }, []);

  const minutosRestantes = lockoutUntil
    ? Math.max(1, Math.ceil((lockoutUntil - Date.now()) / 60_000))
    : null;

  const emailError = touched.email && !email.trim()
    ? 'El correo es requerido'
    : touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? 'Correo inválido'
    : '';

  const passwordError = touched.password && !password
    ? 'La contraseña es requerida'
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) return;
    if (minutosRestantes) {
      setError(`Demasiados intentos. Espera ${minutosRestantes} minutos.`);
      return;
    }

    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (!result) {
      setError('Error de conexión. Intenta nuevamente.');
      return;
    }

    if (result.error === 'CredentialsSignin') {
      setError('Correo o contraseña incorrectos, o email no verificado.');
      return;
    }

    if (result.error === 'TooManyRequests') {
      const until = Date.now() + 15 * 60_000;
      localStorage.setItem('mb_lockout', String(until));
      setLockoutUntil(until);
      setError('Demasiados intentos. Espera 15 minutos.');
      return;
    }

    if (result.error) {
      setError('Error en el inicio de sesión. Intenta nuevamente.');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  const handleGoogle = () => {
    signIn('google', { callbackUrl });
  };


  return (
    <div className="min-h-screen bg-[#0d1a12] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
              MindBridge
            </span>
          </a>
          <h1 className="text-2xl font-bold text-white mb-2">Bienvenido de vuelta</h1>
          <p className="text-gray-400 text-sm">Inicia sesión para continuar tu camino de bienestar</p>
        </div>

        {/* Error / success */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Correo electrónico <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${emailError ? 'border-red-500/50' : 'border-white/10'}`}
                placeholder="tu@correo.com"
                autoComplete="email"
              />
              {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Contraseña <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${passwordError ? 'border-red-500/50' : 'border-white/10'}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && <p className="text-xs text-red-400 mt-1">{passwordError}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={e => setRecordarme(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500/50"
                />
                <span className="text-sm text-gray-400">Recordarme (30 días)</span>
              </label>
              <a href="/forgot-password" className="text-sm text-teal-400 hover:underline font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading || !!minutosRestantes}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : 'Iniciar sesión'}
            </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿No tienes cuenta?{' '}
          <a href="/registro" className="text-teal-400 hover:underline font-medium">Regístrate gratis</a>
        </p>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0d1a12] text-gray-400">O continúa con</span>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-600 text-center mt-6 leading-relaxed">
          Al iniciar sesión, aceptas nuestros{' '}
          <a href="/terminos" className="underline hover:text-gray-400">Términos de Servicio</a> y{' '}
          <a href="/privacidad" className="underline hover:text-gray-400">Política de Privacidad</a>.
          Tus datos están protegidos según la Ley 1581/2012.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d1a12] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
