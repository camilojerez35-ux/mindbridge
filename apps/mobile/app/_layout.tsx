import { useEffect, Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { configurarListeners, manejarTapNotificacion } from '@/lib/notifications';
import { useAppStore } from '@/store';
import { OfflineBanner } from '@/components';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Algo salió mal</Text>
          <Text style={styles.errorMsg}>La aplicación encontró un error inesperado.</Text>
          <TouchableOpacity style={styles.errorBtn} onPress={() => this.setState({ error: null })}>
            <Text style={styles.errorBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

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
    }).catch((err) => {
      console.warn('[Layout] Error configurando notificaciones:', err?.message);
    });

    return () => {
      active = false;
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 8 },
  errorMsg: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  errorBtn: { backgroundColor: '#10B981', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  errorBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
