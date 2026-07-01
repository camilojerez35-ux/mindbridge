import { api } from './client';

export interface DatosWidget {
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  integritySignature: string;
  redirectUrl: string;
  customerData: { email: string; fullName: string };
}

export interface IniciarPagoResult {
  exito: boolean;
  referencia: string;
  datosWidget: DatosWidget;
  montoCOP: number;
  plan: string;
}

export const suscripcionService = {
  iniciarPago: (plan: 'PLUS' | 'FAMILIA', metodoPago: 'PSE' | 'NEQUI' | 'TARJETA' | 'DAVIPLATA') =>
    api.post<IniciarPagoResult>('/pagos', { plan, metodoPago }),

  cancelar: () =>
    api.delete<{ exito: boolean; mensaje: string }>('/pagos'),

  construirUrlCheckout: (widget: DatosWidget): string => {
    const params = new URLSearchParams({
      'public-key': widget.publicKey,
      'currency': widget.currency,
      'amount-in-cents': String(widget.amountInCents),
      'reference': widget.reference,
      'signature:integrity': widget.integritySignature,
      'redirect-url': widget.redirectUrl,
      'customer-data:email': widget.customerData.email,
      'customer-data:full-name': widget.customerData.fullName,
    });
    return `https://checkout.wompi.co/p/?${params.toString()}`;
  },
};
