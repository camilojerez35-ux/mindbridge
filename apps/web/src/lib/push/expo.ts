// Envío de push notifications via Expo Push API
// Docs: https://docs.expo.dev/push-notifications/sending-notifications/

export interface PushMessage {
  to: string;          // ExponentPushToken[xxx]
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

export interface PushResult {
  enviados: number;
  errores: number;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export async function enviarPush(mensajes: PushMessage[]): Promise<PushResult> {
  if (!mensajes.length) return { enviados: 0, errores: 0 };

  // Expo acepta hasta 100 mensajes por batch
  const batches: PushMessage[][] = [];
  for (let i = 0; i < mensajes.length; i += 100) {
    batches.push(mensajes.slice(i, i + 100));
  }

  let enviados = 0;
  let errores = 0;

  for (const batch of batches) {
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(batch),
      });

      if (!res.ok) { errores += batch.length; continue; }

      const { data } = await res.json() as { data: { status: string }[] };
      for (const ticket of data) {
        if (ticket.status === 'ok') enviados++;
        else errores++;
      }
    } catch {
      errores += batch.length;
    }
  }

  return { enviados, errores };
}

export async function enviarPushUno(token: string, titulo: string, cuerpo: string, data?: Record<string, string>) {
  return enviarPush([{ to: token, title: titulo, body: cuerpo, data, sound: 'default', channelId: 'default' }]);
}
