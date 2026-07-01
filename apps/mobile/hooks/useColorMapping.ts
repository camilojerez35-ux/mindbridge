const MAPAS: Record<string, Record<string, string>> = {
  plan: {
    GRATIS: '#94A3B8',
    PLUS: '#10B981',
    FAMILIA: '#3B82F6',
    PROFESIONAL: '#8B5CF6',
  },
  estado_cita: {
    PENDIENTE: '#F59E0B',
    CONFIRMADA: '#10B981',
    EN_CURSO: '#3B82F6',
    COMPLETADA: '#6B7280',
    CANCELADA: '#EF4444',
    NO_ASISTIO: '#DC2626',
  },
  animo: {
    '1': '#EF4444',
    '2': '#F97316',
    '3': '#F59E0B',
    '4': '#84CC16',
    '5': '#10B981',
  },
};

export function useColorMapping() {
  function color(tipo: keyof typeof MAPAS, valor: string, fallback = '#94A3B8'): string {
    return MAPAS[tipo]?.[valor] ?? fallback;
  }

  return { color };
}
