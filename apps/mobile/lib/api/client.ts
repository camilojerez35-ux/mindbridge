import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const API_URL = __DEV__
  ? 'http://10.0.2.2:3000/api'
  : (process.env.EXPO_PUBLIC_API_URL ?? (() => {
      console.error('[API] EXPO_PUBLIC_API_URL no está configurada — usando fallback');
      return 'https://mentebridge.com/api';
    })());

async function getToken() {
  return SecureStore.getItemAsync('session_token');
}

async function manejarSesionExpirada() {
  await SecureStore.deleteItemAsync('session_token');
  await SecureStore.deleteItemAsync('user_id');
  await SecureStore.deleteItemAsync('user_plan');
  // Importación dinámica para evitar ciclo de dependencia con useAuthStore
  try {
    const { useAuthStore } = await import('../../store/useAuthStore');
    useAuthStore.setState({ usuario: null, token: null });
  } catch {}
  router.replace('/(auth)/login');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await manejarSesionExpirada();
    throw { status: 401, mensaje: 'Sesión expirada. Por favor inicia sesión de nuevo.' };
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ mensaje: 'Error del servidor' }));
    throw { status: response.status, mensaje: error.mensaje || error.error || 'Error del servidor' };
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
