import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService } from '@/lib/api/auth';
import { api } from '@/lib/api/client';
import { router } from 'expo-router';
import { registrarPushToken } from '@/lib/notifications';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  plan: string;
  rol: string;
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  inicializado: boolean;

  // Acciones
  inicializar: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  actualizarUsuario: (datos: Partial<Usuario>) => void;
  recargarUsuario: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  usuario: null,
  token: null,
  cargando: false,
  inicializado: false,

  inicializar: async () => {
    const [token, onboardingDone] = await Promise.all([
      SecureStore.getItemAsync('session_token'),
      SecureStore.getItemAsync('onboarding_done'),
    ]);

    if (token) {
      set({ token });
      try {
        const usuario = await authService.getUsuario();
        if (!usuario?.id) throw new Error('Datos de usuario inválidos');
        set({ usuario, inicializado: true });
        router.replace('/(tabs)/home');
      } catch {
        await SecureStore.deleteItemAsync('session_token');
        set({ token: null, usuario: null, inicializado: true });
        router.replace('/(auth)/login');
      }
    } else if (!onboardingDone) {
      set({ inicializado: true });
      router.replace('/onboarding' as any);
    } else {
      set({ inicializado: true });
      router.replace('/(auth)/login');
    }
  },

  login: async (email, password) => {
    set({ cargando: true });
    try {
      const data = await authService.login(email, password);
      set({
        token: data.token,
        usuario: {
          id: data.usuario.id,
          nombre: data.usuario.nombre,
          email: data.usuario.email,
          plan: data.usuario.plan,
          rol: data.usuario.rol,
        },
        cargando: false,
      });
      registrarPushToken().catch((err) => console.warn('[Auth] Push token no registrado:', err?.message));
      router.replace('/(tabs)/home');
    } catch (e) {
      set({ cargando: false });
      throw e;
    }
  },

  logout: async () => {
    await api.delete('/dispositivos').catch((err) => console.warn('[Auth] Error eliminando dispositivo:', err?.message));
    await authService.logout();
    set({ usuario: null, token: null });
    router.replace('/(auth)/login');
  },

  actualizarUsuario: (datos) => {
    const actual = get().usuario;
    if (!actual) return;
    set({ usuario: { ...actual, ...datos } });
  },

  recargarUsuario: async () => {
    try {
      const usuario = await authService.getUsuario();
      if (usuario?.id) set({ usuario });
    } catch (err: any) {
      console.warn('[Auth] Error recargando usuario:', err?.message);
    }
  },
}));
