import { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import * as SecureStore from 'expo-secure-store';

export default function SplashScreen() {
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const [token, onboardingDone] = await Promise.all([
      SecureStore.getItemAsync('session_token'),
      SecureStore.getItemAsync('onboarding_done'),
    ]);
    if (token) {
      router.replace('/(tabs)/home');
    } else if (!onboardingDone) {
      router.replace('/onboarding' as any);
    } else {
      router.replace('/(auth)/login');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoPlaceholder} />
        {/* Reemplaza con tu logo real después */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
