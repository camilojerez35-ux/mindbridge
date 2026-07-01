import { api } from './client';
import * as SecureStore from 'expo-secure-store';

export interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    plan: string;
    rol: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await api.post<LoginResponse>('/auth/signin', { email, password });
    await SecureStore.setItemAsync('session_token', data.token);
    await SecureStore.setItemAsync('user_id', data.usuario.id);
    await SecureStore.setItemAsync('user_plan', data.usuario.plan);
    return data;
  },

  async logout() {
    await SecureStore.deleteItemAsync('session_token');
    await SecureStore.deleteItemAsync('user_id');
    await SecureStore.deleteItemAsync('user_plan');
  },

  async getUsuario() {
    const r = await api.get<{ usuario: { id: string; nombre: string; apellido: string | null; email: string; planActual: string; rol: string } }>('/usuarios');
    const u = r.usuario;
    return {
      id: u.id,
      nombre: [u.nombre, u.apellido].filter(Boolean).join(' '),
      email: u.email,
      plan: u.planActual,
      rol: u.rol,
    };
  },
};
