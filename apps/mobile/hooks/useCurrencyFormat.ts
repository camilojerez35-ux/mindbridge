export function useCurrencyFormat() {
  function cop(valor: number | string): string {
    const n = typeof valor === 'string' ? parseInt(valor, 10) : valor;
    return `$${n.toLocaleString('es-CO')} COP`;
  }

  function copCorto(valor: number | string): string {
    const n = typeof valor === 'string' ? parseInt(valor, 10) : valor;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
    return `$${n}`;
  }

  return { cop, copCorto };
}
