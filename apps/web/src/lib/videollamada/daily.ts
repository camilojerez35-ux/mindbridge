interface CrearSalaParams {
  nombre: string;
  expiraEn: Date;
}

interface SalaCreada {
  url: string;
  tokenPsicologo: string;
  tokenUsuario: string;
}

async function dailyFetch(path: string, body: Record<string, unknown>) {
  const DAILY_API_KEY = process.env.DAILY_API_KEY ?? '';
  const res = await fetch(`https://api.daily.co/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => '');
    throw new Error(`Daily.co API error (${res.status}): ${detalle}`);
  }

  return res.json();
}

export async function crearSala({ nombre, expiraEn }: CrearSalaParams): Promise<SalaCreada> {
  const expTs = Math.floor(expiraEn.getTime() / 1000);

  const room = await dailyFetch('rooms', {
    name: nombre,
    privacy: 'private',
    properties: {
      exp: expTs,
      enable_chat: false,
      enable_screenshare: true,
      enable_recording: 'cloud',
      eject_at_room_exp: true,
    },
  });

  const [tokenPsicologoRes, tokenUsuarioRes] = await Promise.all([
    dailyFetch('meeting-tokens', {
      properties: { room_name: nombre, user_name: 'psicologo', exp: expTs, is_owner: true },
    }),
    dailyFetch('meeting-tokens', {
      properties: { room_name: nombre, user_name: 'paciente', exp: expTs, is_owner: false },
    }),
  ]);

  return {
    url: room.url,
    tokenPsicologo: tokenPsicologoRes.token,
    tokenUsuario: tokenUsuarioRes.token,
  };
}
