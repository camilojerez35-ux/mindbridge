import { createHash } from 'crypto';

export function generarFirmaIntegridad(params: {
  referencia: string;
  amountInCents: number;
  currency: string;
}): string {
  const secret = process.env.WOMPI_EVENTS_SECRET ?? '';
  if (!secret) return '';
  const data = `${params.referencia}${params.amountInCents}${params.currency}${secret}`;
  return createHash('sha256').update(data).digest('hex');
}
