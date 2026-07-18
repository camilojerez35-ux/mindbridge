import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { api } from './api/client';

// expo-notifications throws on Android Expo Go since SDK 53.
// Skip entirely when running in Expo Go.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export async function registrarPushToken(): Promise<string | null> {
  if (isExpoGo) return null;

  const [{ default: Device }, Notifications] = await Promise.all([
    import('expo-device'),
    import('expo-notifications'),
  ]);

  if (!Device.isDevice) return null;

  const { status: existente } = await Notifications.getPermissionsAsync();
  let status = existente;
  if (existente !== 'granted') {
    const { status: nuevo } = await Notifications.requestPermissionsAsync();
    status = nuevo;
  }
  if (status !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'MenteBridge',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    });
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await api.post('/dispositivos', { pushToken: token }).catch((err) => {
      console.warn('[Notifications] Error registrando push token:', err?.message);
    });
    return token;
  } catch {
    return null;
  }
}

export async function configurarListeners(
  onNotificacion: (notif: any) => void,
  onTap: (respuesta: any) => void,
): Promise<(() => void) | null> {
  if (isExpoGo) return null;

  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const sub1 = Notifications.addNotificationReceivedListener(onNotificacion);
  const sub2 = Notifications.addNotificationResponseReceivedListener(onTap);
  return () => {
    sub1.remove();
    sub2.remove();
  };
}

export function manejarTapNotificacion(respuesta: any) {
  const data = respuesta?.notification?.request?.content?.data as Record<string, string> | undefined;
  if (!data || typeof data.tipo !== 'string') return;

  if (data.tipo === 'cita') {
    router.push('/citas');
  } else if (data.tipo === 'videollamada') {
    if (typeof data.citaId === 'string' && data.citaId) {
      router.push(`/videollamada/${data.citaId}` as any);
    }
  } else if (data.tipo === 'chat') {
    router.push('/(tabs)/chat');
  } else if (data.tipo === 'diario') {
    router.push('/(tabs)/diario');
  }
}
