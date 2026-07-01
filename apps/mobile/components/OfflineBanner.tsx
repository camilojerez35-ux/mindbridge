import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store';

export function OfflineBanner() {
  const sinConexion = useAppStore(s => s.sinConexion);
  const setSinConexion = useAppStore(s => s.setSinConexion);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setSinConexion(!(state.isConnected && state.isInternetReachable !== false));
    });
    return unsub;
  }, []);

  if (!sinConexion) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="wifi-outline" size={16} color="#fff" />
      <Text style={styles.texto}>Sin conexión a internet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  texto: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
