import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { configurarListeners, manejarTapNotificacion } from '@/lib/notifications';
import { useAppStore } from '@/store';

export default function RootLayout() {

  useEffect(() => {
    const limpiar = configurarListeners(
      (notif) => {
        const data = notif.request.content.data as Record<string, string>;
        if (data?.tipo === 'chat') useAppStore.getState().incrementarNoLeidos();
      },
      manejarTapNotificacion,
    );
    return limpiar;
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </>
  );
}
