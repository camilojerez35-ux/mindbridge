'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, Eye, EyeOff, AlertCircle, CheckCircle, Lock } from 'lucide-react';

interface FormState {
  email: { value: string; error: string; touched: boolean };
  password: { value: string; error: string; touched: boolean };
  recordarme: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>({
    email: { value: '', error: '', touched: false },
    password: { value: '', error: '', touched: false },
    recordarme: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAError, setTwoFAError] = useState('');

  // Check for lockout
  useEffect(() => {
    const lockoutEnd = localStorage.getItem('mindbridge_lockout_end');
    if (lockoutEnd) {
      const remaining = parseInt(lockoutEnd) - Date.now();
      if (remaining > 0) {
        setLockoutTimer(Math.ceil(remaining / 1000 / 60)); // minutes
      } else {
        localStorage.removeItem('mindbridge_lockout_end');
      }
    }
  }, []);

  // Check for registration success
  useEffect(() => {
    if (searchParams.get('registered')) {
      setError('Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta.');
    }
  }, [searchParams]);

  const validateEmail = (value: string) => {
    if (!value.trim()) return 'El correo es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Ingresa un correo electrónico válido';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'La contraseña es requerida';
    return '';
  };

  const updateField = (field: keyof FormState, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const touchField = (field: keyof FormState) => {
    setForm(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched: true,
        error: field === 'email' ? validateEmail(prev.email.value) :
               field === 'password' ? validatePassword(prev.password.value) :
               '',
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTwoFAError('');

    // Touch all fields
    setForm(prev => ({
      ...prev,
      email: { ...prev.email, touched: true, error: validateEmail(prev.email.value) },
      password: { ...prev.password, touched: true, error: validatePassword(prev.password.value) },
    }));

    if (form.email.error || form.password.error) {
      return;
    }

    // Check lockout
    if (lockoutTimer) {
      setError(`Demasiados intentos. Espera ${lockoutTimer} minutos.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: form.email.value,
          password: form.password.value,
          recordarme: form.recordarme,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Set lockout
          const lockoutEnd = Date.now() + 15 * 60 * 1000;
          localStorage.setItem('mindbridge_lockout_end', lockoutEnd.toString());
          setLockoutTimer(15);
          setError(data.error || 'Demasiados intentos. Espera 15 minutos.');
        } else if (data.requires2FA) {
          setRequires2FA(true);
          setUserId(data.userId);
        } else {
          setError(data.error || 'Error en el inicio de sesión');
        }
        return;
      }

      // Success - redirect
      router.push('/chat');
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFAError('');

    if (twoFACode.length !== 6 || !/^\d{6}$/.test(twoFACode)) {
      setTwoFAError('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-2fa',
          userId,
          codigo: twoFACode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTwoFAError(data.error || 'Código inválido');
        return;
      }

      router.push('/chat');
    } catch (err) {
      setTwoFAError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-white mb-2">
            {requires2FA ? 'Verificación 2FA' : 'Bienvenido de vuelta'}
          </h1>
          <p className="text-gray-400 text-sm">
            {requires2FA ? 'Ingresa el código de tu aplicación autenticadora' : 'Inicia sesión para continuar tu camino de bienestar'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* 2FA Form */}
        {requires2FA ? (
          <form onSubmit={handle2FAVerify} className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-teal-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Código de verificación <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${
                  twoFAError ? 'border-red-500/50' : 'border-white/10'
                }`}
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
              {twoFAError && (
                <p className="text-xs text-red-400 mt-1">{twoFAError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || twoFACode.length !== 6}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </button>

            <p className="text-center text-sm text-gray-400">
              ¿No recibiste el código?{' '}
              <button type="button" className="text-teal-400 hover:underline font-medium">
                Reenviar
              </button>
            </p>
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Correo electrónico <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.email.value}
                onChange={(e) => updateField('email', e.target.value)}
                onBlur={() => touchField('email')}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${
                  form.email.touched && form.email.error ? 'border-red-500/50' : 'border-white/10'
                }`}
                placeholder="tu@correo.com"
              />
              {form.email.touched && form.email.error && (
                <p className="text-xs text-red-400 mt-1">{form.email.error}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Contraseña <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password.value}
                  onChange={(e) => updateField('password', e.target.value)}
                  onBlur={() => touchField('password')}
                  className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${
                    form.password.touched && form.password.error ? 'border-red-500/50' : 'border-white/10'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.password.touched && form.password.error && (
                <p className="text-xs text-red-400 mt-1">{form.password.error}</p>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.recordarme}
                  onChange={(e) => updateField('recordarme', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500/50"
                />
                <span className="text-sm text-gray-400">Recordarme (30 días)</span>
              </label>
              <a href="/forgot-password" className="text-sm text-teal-400 hover:underline font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || lockoutTimer !== null}
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
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        )}

        {/* Login link */}
        {!requires2FA && (
          <>
            <p className="text-center text-sm text-gray-400 mt-6">
              ¿No tienes cuenta?{' '}
              <a href="/registro" className="text-teal-400 hover:underline font-medium">
                Regístrate gratis
              </a>
            </p>

            {/* OAuth buttons */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0d1a12] text-gray-400">O continúa con</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
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
          </>
        )}

        {/* Privacy notice */}
        <p className="text-xs text-gray-600 text-center mt-6 leading-relaxed">
          Al iniciar sesión, aceptas nuestros Términos de Servicio y Política de Privacidad.
          Tus datos están protegidos según la Ley 1581/2012.
        </p>
      </div>
    </div>
  );
}
