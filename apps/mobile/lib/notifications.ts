import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { api } from './api/client';

// Comportamiento cuando llega una notificación con la app abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registrarPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null; // no funciona en simulador

  const { status: existente } = await Notifications.getPermissionsAsync();
  let status = existente;

  if (existente !== 'granted') {
    const { status: nuevo } = await Notifications.requestPermissionsAsync();
    status = nuevo;
  }

  if (status !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'MindBridge',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Registrar token en backend
  await api.post('/dispositivos', { pushToken: token }).catch(() => {});

  return token;
}

export function configurarListeners(
  onNotificacion: (notif: Notifications.Notification) => void,
  onTap: (respuesta: Notifications.NotificationResponse) => void,
) {
  const sub1 = Notifications.addNotificationReceivedListener(onNotificacion);
  const sub2 = Notifications.addNotificationResponseReceivedListener(onTap);
  return () => {
    sub1.remove();
    sub2.remove();
  };
}

// Navega a la pantalla correcta según el tipo de notificación
export function manejarTapNotificacion(respuesta: Notifications.NotificationResponse) {
  const data = respuesta.notification.request.content.data as Record<string, string>;

  if (data?.tipo === 'cita' && data?.citaId) {
    router.push('/citas');
  } else if (data?.tipo === 'videollamada' && data?.citaId) {
    router.push(`/videollamada/${data.citaId}` as any);
  } else if (data?.tipo === 'chat') {
    router.push('/(tabs)/chat');
  } else if (data?.tipo === 'diario') {
    router.push('/(tabs)/diario');
  }
}
