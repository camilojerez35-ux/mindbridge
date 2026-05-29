// src/lib/videollamada/daily.ts
// RUTA: Importado por /api/citas y el componente de videollamada
// Instalar: npm install @daily-co/daily-js
// Documentación: https://docs.daily.co/reference/rest-api

const DAILY_API_KEY = process.env.DAILY_API_KEY || '';
const DAILY_DOMAIN = process.env.DAILY_DOMAIN || '';
const DAILY_BASE = 'https://api.daily.co/v1';

export interface SalaVideollamada {
  nombre: string;
  url: string;
  tokenUsuario: string;
  tokenPsicologo: string;
  expiraEn: Date;
}

// ── Crear sala de videollamada ─────────────────────────────────
export async function crearSala(params: {
  nombre: string;
  expiraEn: Date;
  maxParticipantes?: number;
}): Promise<SalaVideollamada> {
  const expiraTimestamp = Math.floor(params.expiraEn.getTime() / 1000);

  const response = await fetch(`${DAILY_BASE}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: params.nombre,
      privacy: 'private',
      properties: {
        exp: expiraTimestamp,
        max_participants: params.maxParticipantes || 2,
        enable_screenshare: true,
        enable_chat: true,
        enable_knocking: true,
        start_video_off: false,
        start_audio_off: false,
        lang: 'es',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error creando sala Daily.co: ${error.info}`);
  }

  const sala = await response.json();
  const url = `https://${DAILY_DOMAIN}/${params.nombre}`;

  // Crear tokens para usuario y psicólogo
  const [tokenUsuario, tokenPsicologo] = await Promise.all([
    crearToken(params.nombre, 'usuario', expiraTimestamp),
    crearToken(params.nombre, 'psicologo', expiraTimestamp, true),
  ]);

  return {
    nombre: params.nombre,
    url,
    tokenUsuario,
    tokenPsicologo,
    expiraEn: params.expiraEn,
  };
}

// ── Crear token de acceso ──────────────────────────────────────
async function crearToken(nombreSala: string, userName: string, exp: number, isOwner = false): Promise<string> {
  const response = await fetch(`${DAILY_BASE}/meeting-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: nombreSala,
        user_name: userName,
        exp,
        is_owner: isOwner,
        enable_screenshare: isOwner,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  });

  const data = await response.json();
  return data.token;
}

// ── Eliminar sala después de la cita ──────────────────────────
export async function eliminarSala(nombreSala: string) {
  await fetch(`${DAILY_BASE}/rooms/${nombreSala}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${DAILY_API_KEY}` },
  });
}
