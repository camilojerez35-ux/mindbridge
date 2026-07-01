'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Brain, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface ValidationState {
  nombre: { value: string; error: string; touched: boolean };
  apellido: { value: string; error: string; touched: boolean };
  email: { value: string; error: string; touched: boolean };
  password: { value: string; error: string; touched: boolean; strength: 'weak' | 'medium' | 'strong' };
  fechaNacimiento: { value: string; error: string; touched: boolean };
  aceptaPoliticaPrivacidad: { value: boolean; error: string; touched: boolean };
  aceptaUsoIA: { value: boolean; error: string; touched: boolean };
  aceptaMarketing: { value: boolean; error: string; touched: boolean };
}

const initialState: ValidationState = {
  nombre: { value: '', error: '', touched: false },
  apellido: { value: '', error: '', touched: false },
  email: { value: '', error: '', touched: false },
  password: { value: '', error: '', touched: false, strength: 'weak' },
  fechaNacimiento: { value: '', error: '', touched: false },
  aceptaPoliticaPrivacidad: { value: false, error: '', touched: false },
  aceptaUsoIA: { value: false, error: '', touched: false },
  aceptaMarketing: { value: false, error: '', touched: false },
};

// Fecha máxima para tener 18 años cumplidos hoy
function maxFechaNacimiento(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split('T')[0];
}

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState<ValidationState>(initialState);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Validation functions
  const validateNombre = useCallback((value: string) => {
    if (!value.trim()) return 'El nombre es requerido';
    if (value.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (value.length > 50) return 'El nombre es demasiado largo';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El nombre solo puede contener letras';
    return '';
  }, []);

  const validateApellido = useCallback((value: string) => {
    if (!value.trim()) return 'El apellido es requerido';
    if (value.length < 2) return 'El apellido debe tener al menos 2 caracteres';
    if (value.length > 50) return 'El apellido es demasiado largo';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El apellido solo puede contener letras';
    return '';
  }, []);

  const validateEmail = useCallback((value: string) => {
    if (!value.trim()) return 'El correo es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Ingresa un correo electrónico válido';
    if (value.length > 255) return 'El correo es demasiado largo';
    return '';
  }, []);

  const validateFechaNacimiento = useCallback((value: string) => {
    if (!value) return 'La fecha de nacimiento es requerida';
    const nacimiento = new Date(value);
    if (isNaN(nacimiento.getTime())) return 'Fecha inválida';
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const cumple = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
    if (hoy < cumple) edad--;
    if (edad < 18) return 'Debes ser mayor de 18 años para registrarte';
    if (edad > 120) return 'Fecha de nacimiento inválida';
    return '';
  }, []);

  const validatePassword = useCallback((value: string) => {
    if (!value) return 'La contraseña es requerida';
    if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (value.length > 128) return 'La contraseña es demasiado larga';
    if (!/[A-Z]/.test(value)) return 'La contraseña debe contener al menos una mayúscula';
    if (!/[a-z]/.test(value)) return 'La contraseña debe contener al menos una minúscula';
    if (!/[0-9]/.test(value)) return 'La contraseña debe contener al menos un número';
    if (!/[^A-Za-z0-9]/.test(value)) return 'La contraseña debe contener al menos un carácter especial';
    return '';
  }, []);

  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (!password) return 'weak';
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;
    
    if (score >= 5) return 'strong';
    if (score >= 3) return 'medium';
    return 'weak';
  };

  const updateField = useCallback((field: keyof ValidationState, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value: value as string | boolean,
        ...(field === 'nombre' || field === 'apellido' || field === 'email' || field === 'password'
          ? { error: '' }
          : {}),
      },
    }));
  }, []);

  const touchField = useCallback((field: keyof ValidationState) => {
    setForm(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched: true,
        error: field === 'nombre' ? validateNombre(prev[field].value as string) :
               field === 'apellido' ? validateApellido(prev[field].value as string) :
               field === 'email' ? validateEmail(prev[field].value as string) :
               field === 'password' ? validatePassword(prev[field].value as string) :
               field === 'fechaNacimiento' ? validateFechaNacimiento(prev[field].value as string) :
               '',
      },
    }));
  }, [validateNombre, validateApellido, validateEmail, validatePassword, validateFechaNacimiento]);

  // Real-time validation
  useEffect(() => {
    if (form.fechaNacimiento.touched) {
      setForm(prev => ({ ...prev, fechaNacimiento: { ...prev.fechaNacimiento, error: validateFechaNacimiento(prev.fechaNacimiento.value) } }));
    }
  }, [form.fechaNacimiento.value, validateFechaNacimiento]);

  useEffect(() => {
    if (form.nombre.touched) {
      setForm(prev => ({ ...prev, nombre: { ...prev.nombre, error: validateNombre(prev.nombre.value) } }));
    }
  }, [form.nombre.value, validateNombre]);

  useEffect(() => {
    if (form.apellido.touched) {
      setForm(prev => ({ ...prev, apellido: { ...prev.apellido, error: validateApellido(prev.apellido.value) } }));
    }
  }, [form.apellido.value, validateApellido]);

  useEffect(() => {
    if (form.email.touched) {
      setForm(prev => ({ ...prev, email: { ...prev.email, error: validateEmail(prev.email.value) } }));
    }
  }, [form.email.value, validateEmail]);

  useEffect(() => {
    if (form.password.touched) {
      setForm(prev => ({ 
        ...prev, 
        password: { 
          ...prev.password, 
          error: validatePassword(prev.password.value),
          strength: getPasswordStrength(prev.password.value)
        } 
      }));
    }
  }, [form.password.value, validatePassword]);

  const isFormValid = form.nombre.value && form.apellido.value && form.email.value && form.password.value &&
    form.fechaNacimiento.value &&
    !form.nombre.error && !form.apellido.error && !form.email.error && !form.password.error && !form.fechaNacimiento.error &&
    form.aceptaPoliticaPrivacidad.value && form.aceptaUsoIA.value;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Touch all fields
    setForm(prev => ({
      ...prev,
      nombre: { ...prev.nombre, touched: true, error: validateNombre(prev.nombre.value) },
      apellido: { ...prev.apellido, touched: true, error: validateApellido(prev.apellido.value) },
      email: { ...prev.email, touched: true, error: validateEmail(prev.email.value) },
      password: { ...prev.password, touched: true, error: validatePassword(prev.password.value) },
      fechaNacimiento: { ...prev.fechaNacimiento, touched: true, error: validateFechaNacimiento(prev.fechaNacimiento.value) },
      aceptaPoliticaPrivacidad: { ...prev.aceptaPoliticaPrivacidad, touched: true, error: prev.aceptaPoliticaPrivacidad.value ? '' : 'Debes aceptar la Política de Privacidad' },
      aceptaUsoIA: { ...prev.aceptaUsoIA, touched: true, error: prev.aceptaUsoIA.value ? '' : 'Debes autorizar el uso de IA' },
    }));

    if (!isFormValid) {
      setError('Por favor completa todos los campos requeridos correctamente');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.value,
          apellido: form.apellido.value,
          email: form.email.value,
          password: form.password.value,
          fechaNacimiento: form.fechaNacimiento.value,
          aceptaPoliticaPrivacidad: form.aceptaPoliticaPrivacidad.value,
          aceptaUsoIA: form.aceptaUsoIA.value,
          aceptaMarketing: form.aceptaMarketing.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error en el registro');
        return;
      }

      setSuccess('¡Registro exitoso! Revisa tu correo para verificar tu cuenta.');
      
      // Redirect after delay
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 3000);
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrengthColor = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  const passwordStrengthText = {
    weak: 'Débil',
    medium: 'Media',
    strong: 'Fuerte',
  };

  return (
    <div className="min-h-screen bg-[#0d1a12] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
              MindBridge
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Crear tu cuenta</h1>
          <p className="text-gray-400 text-sm">
            Únete a la plataforma de bienestar emocional con IA
          </p>
        </div>

        {/* Error/Success messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.nombre.value}
                onChange={(e) => updateField('nombre', e.target.value)}
                onBlur={() => touchField('nombre')}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${
                  form.nombre.touched && form.nombre.error ? 'border-red-500/50' : 'border-white/10'
                }`}
                placeholder="Juan"
              />
              {form.nombre.touched && form.nombre.error && (
                <p className="text-xs text-red-400 mt-1">{form.nombre.error}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Apellido <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.apellido.value}
                onChange={(e) => updateField('apellido', e.target.value)}
                onBlur={() => touchField('apellido')}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${
                  form.apellido.touched && form.apellido.error ? 'border-red-500/50' : 'border-white/10'
                }`}
                placeholder="Pérez"
              />
              {form.apellido.touched && form.apellido.error && (
                <p className="text-xs text-red-400 mt-1">{form.apellido.error}</p>
              )}
            </div>
          </div>

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

          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Fecha de nacimiento <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.fechaNacimiento.value}
              onChange={(e) => updateField('fechaNacimiento', e.target.value)}
              onBlur={() => touchField('fechaNacimiento')}
              max={maxFechaNacimiento()}
              min="1900-01-01"
              className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all [color-scheme:dark] ${
                form.fechaNacimiento.touched && form.fechaNacimiento.error ? 'border-red-500/50' : 'border-white/10'
              }`}
            />
            {form.fechaNacimiento.touched && form.fechaNacimiento.error && (
              <p className="text-xs text-red-400 mt-1">{form.fechaNacimiento.error}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              MindBridge es una plataforma para mayores de 18 años (Ley 1581/2012).
            </p>
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
            {form.password.value && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  <div className={`h-1 flex-1 rounded-full ${form.password.strength === 'weak' ? 'bg-red-500' : form.password.strength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div className={`h-1 flex-1 rounded-full ${form.password.strength === 'medium' || form.password.strength === 'strong' ? 'bg-yellow-500' : 'bg-white/10'}`} />
                  <div className={`h-1 flex-1 rounded-full ${form.password.strength === 'strong' ? 'bg-green-500' : 'bg-white/10'}`} />
                </div>
                <p className="text-xs text-gray-400">
                  Fortaleza: <span className={form.password.strength === 'strong' ? 'text-green-400' : form.password.strength === 'medium' ? 'text-yellow-400' : 'text-red-400'}>
                    {passwordStrengthText[form.password.strength]}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Legal checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.aceptaPoliticaPrivacidad.value}
                onChange={(e) => updateField('aceptaPoliticaPrivacidad', e.target.checked)}
                onBlur={() => touchField('aceptaPoliticaPrivacidad')}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500/50"
              />
              <span className="text-sm text-gray-400 group-hover:text-gray-300">
                Acepto la{' '}
                <button type="button" onClick={() => setShowPrivacy(true)} className="text-teal-400 hover:underline">
                  Política de Privacidad
                </button>{' '}
                y autorizo el tratamiento de mis datos personales según la{' '}
                <strong className="text-gray-300">Ley 1581 de 2012</strong> <span className="text-red-400">*</span>
              </span>
            </label>
            {form.aceptaPoliticaPrivacidad.touched && form.aceptaPoliticaPrivacidad.error && (
              <p className="text-xs text-red-400 -mt-2">{form.aceptaPoliticaPrivacidad.error}</p>
            )}

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.aceptaUsoIA.value}
                onChange={(e) => updateField('aceptaUsoIA', e.target.checked)}
                onBlur={() => touchField('aceptaUsoIA')}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500/50"
              />
              <span className="text-sm text-gray-400 group-hover:text-gray-300">
                Autorizo el uso de inteligencia artificial para mi acompañamiento emocional según la{' '}
                <strong className="text-gray-300">Resolución 2654/2019</strong> del Ministerio de Salud <span className="text-red-400">*</span>
              </span>
            </label>
            {form.aceptaUsoIA.touched && form.aceptaUsoIA.error && (
              <p className="text-xs text-red-400 -mt-2">{form.aceptaUsoIA.error}</p>
            )}

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.aceptaMarketing.value}
                onChange={(e) => updateField('aceptaMarketing', e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500/50"
              />
              <span className="text-sm text-gray-400 group-hover:text-gray-300">
                Deseo recibir comunicaciones de marketing y novedades (opcional)
              </span>
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creando cuenta...
              </span>
            ) : (
              'Crear cuenta gratis'
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-teal-400 hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>

        <p className="text-center text-sm text-gray-500 mt-3">
          ¿Eres psicólogo?{' '}
          <Link href="/registro-psicologo" className="text-teal-400 hover:underline font-medium">
            Únete como profesional
          </Link>
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
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </button>
          </div>
        </div>

        {/* Privacy notice */}
        <p className="text-xs text-gray-600 text-center mt-6 leading-relaxed">
          Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad.
          Tus datos están protegidos según la Ley 1581/2012 y la Resolución 2654/2019.
        </p>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2e1f] rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Política de Privacidad</h2>
              <button onClick={() => setShowPrivacy(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-300 space-y-4">
              <p><strong>1. Responsable del tratamiento:</strong> MindBridge S.A.S., Colombia</p>
              <p><strong>2. Datos recogidos:</strong> Nombre, apellido, correo electrónico, datos de salud emocional, historial de uso.</p>
              <p><strong>3. Finalidad:</strong> Prestar servicios de bienestar emocional, mejorar la experiencia del usuario, cumplir con obligaciones legales.</p>
              <p><strong>4. Base legal:</strong> Consentimiento del usuario (Ley 1581/2012), interés legítimo, cumplimiento de obligaciones legales.</p>
              <p><strong>5. Derechos:</strong> Acceso, rectificación, cancelación, oposición, portabilidad de datos.</p>
              <p><strong>6. Seguridad:</strong> Encriptación de extremo a extremo, acceso restringido, auditorías periódicas.</p>
              <p><strong>7. Contacto:</strong> privacidad@mindbridge.co</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
