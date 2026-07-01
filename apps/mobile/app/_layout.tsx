import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { configurarListeners, manejarTapNotificacion } from '@/lib/notifications';
import { useAppStore } from '@/store';
import { OfflineBanner } from '@/components';

export default function RootLayout() {

  useEffect(() => {
    let active = true;
    let unsub: (() => void) | null = null;

    configurarListeners(
      (notif) => {
        const data = notif?.request?.content?.data as Record<string, string>;
        if (data?.tipo === 'chat') useAppStore.getState().incrementarNoLeidos();
      },
      manejarTapNotificacion,
    ).then((fn) => {
      if (active) unsub = fn;
    }).catch(() => {});

    return () => {
      active = false;
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </View>
  );
}
