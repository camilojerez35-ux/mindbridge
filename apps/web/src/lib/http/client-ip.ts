/**
 * IP del cliente. Next 15 eliminó `request.ip`; en Vercel la IP real llega como
 * primer valor de `x-forwarded-for` (el resto de la cadena son proxies).
 */
export function getClientIp(headers: Headers, fallback = 'unknown'): string {
  const reenviada = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return reenviada || headers.get('x-real-ip')?.trim() || fallback;
}
