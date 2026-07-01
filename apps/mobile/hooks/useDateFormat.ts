const LOCALE = 'es-CO';

export function useDateFormat() {
  function fecha(iso: string) {
    return new Date(iso).toLocaleDateString(LOCALE, {
      weekday: 'long', day: 'numeric', month: 'long',
    });
  }

  function fechaCorta(iso: string) {
    return new Date(iso).toLocaleDateString(LOCALE, {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  function hora(iso: string) {
    return new Date(iso).toLocaleTimeString(LOCALE, {
      hour: '2-digit', minute: '2-digit',
    });
  }

  function fechaHora(iso: string) {
    return new Date(iso).toLocaleString(LOCALE, {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  }

  function relativo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Ahora';
    if (min < 60) return `Hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `Hace ${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `Hace ${d}d`;
    return fechaCorta(iso);
  }

  return { fecha, fechaCorta, hora, fechaHora, relativo };
}
