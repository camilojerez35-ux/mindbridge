import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store';

export default function SplashScreen() {
  const { inicializar } = useAuthStore();

  useEffect(() => {
    inicializar();
  }, []);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
});
