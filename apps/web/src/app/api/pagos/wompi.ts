// src/lib/pagos/wompi.ts
// RUTA: Importado por /api/pagos/* y /api/citas
// Instalar: npm install crypto (nativo en Node.js)
// Documentación: https://docs.wompi.co

export interface PagoParams {
  montoCOP: number;          // En pesos colombianos (ej: 25000)
  referencia: string;        // Única por transacción
  descripcion: string;
  emailUsuario: string;
  nombreUsuario: string;
  redirectUrl: string;       // URL de retorno después del pago
}

export interface ResultadoPago {
  aprobado: boolean;
  referencia: string;
  idTransaccion?: string;
  estado?: string;
  mensaje?: string;
  respuestaCompleta?: object;
}

// ── Configuración ──────────────────────────────────────────────
const WOMPI_BASE = process.env.WOMPI_SANDBOX === 'true'
  ? 'https://sandbox.wompi.co/v1'
  : 'https://production.wompi.co/v1';

const PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY || '';
const PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || '';
const EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET || '';

// ── Generar firma de integridad ────────────────────────────────
// Requerida por Wompi para verificar la autenticidad de las transacciones
export async function generarFirmaIntegridad(referencia: string, montoCentavos: number, moneda = 'COP'): Promise<string> {
  const cadena = `${referencia}${montoCentavos}${moneda}${EVENTS_SECRET}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(cadena);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Crear transacción via API de Wompi ────────────────────────
export async function crearTransaccion(params: PagoParams & {
  tokenTarjeta?: string;
  tipoPago: 'PSE' | 'NEQUI' | 'TARJETA' | 'DAVIPLATA';
  bancoId?: string;           // Para PSE
  telefonoNequi?: string;     // Para Nequi
}): Promise<ResultadoPago> {
  const montoCentavos = params.montoCOP * 100;

  try {
    const body: Record<string, unknown> = {
      amount_in_cents: montoCentavos,
      currency: 'COP',
      customer_email: params.emailUsuario,
      reference: params.referencia,
      redirect_url: params.redirectUrl,
      customer_data: {
        full_name: params.nombreUsuario,
        phone_number: '',
      },
    };

    // Agregar método de pago según tipo
    if (params.tipoPago === 'PSE') {
      body.payment_method = {
        type: 'PSE',
        user_type: 0,
        user_legal_id_type: 'CC',
        user_legal_id: '0000000000',
        financial_institution_code: params.bancoId || '0',
        payment_description: params.descripcion,
      };
    } else if (params.tipoPago === 'NEQUI') {
      body.payment_method = {
        type: 'NEQUI',
        phone_number: params.telefonoNequi || '',
      };
    } else if (params.tipoPago === 'TARJETA' && params.tokenTarjeta) {
      body.payment_method = {
        type: 'CARD',
        token: params.tokenTarjeta,
        installments: 1,
      };
    }

    const response = await fetch(`${WOMPI_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRIVATE_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return { aprobado: false, referencia: params.referencia, mensaje: data.error?.reason || 'Error en la pasarela de pagos', respuestaCompleta: data };
    }

    const transaccion = data.data;
    return {
      aprobado: transaccion.status === 'APPROVED',
      referencia: params.referencia,
      idTransaccion: transaccion.id,
      estado: transaccion.status,
      mensaje: transaccion.status_message,
      respuestaCompleta: data,
    };

  } catch (error: any) {
    console.error('[WOMPI ERROR]', error);
    return { aprobado: false, referencia: params.referencia, mensaje: 'Error de conexión con la pasarela de pagos' };
  }
}

// ── Consultar estado de una transacción ───────────────────────
export async function consultarTransaccion(idTransaccion: string) {
  const response = await fetch(`${WOMPI_BASE}/transactions/${idTransaccion}`, {
    headers: { 'Authorization': `Bearer ${PRIVATE_KEY}` },
  });
  return response.json();
}

// ── Verificar firma de webhook ─────────────────────────────────
// Wompi envía x-event-checksum = SHA-256(payload + eventsSecret), NO HMAC.
export async function verificarWebhook(payload: string, firma: string): Promise<boolean> {
  if (!EVENTS_SECRET) return false;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(payload + EVENTS_SECRET));
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const { timingSafeEqual } = await import('crypto');
  const recibidoBuf = Buffer.from(firma, 'hex');
  const esperadoBuf = Buffer.from(hashHex, 'hex');
  if (recibidoBuf.length !== esperadoBuf.length) return false;
  return timingSafeEqual(recibidoBuf, esperadoBuf);
}

// ── Obtener lista de bancos PSE ────────────────────────────────
export async function obtenerBancosPSE() {
  const response = await fetch(`${WOMPI_BASE}/pse/financial_institutions`, {
    headers: { 'Authorization': `Bearer ${PUBLIC_KEY}` },
  });
  const data = await response.json();
  return data.data || [];
}
