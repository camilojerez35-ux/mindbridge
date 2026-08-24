import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { homeService, RegistroAnimo } from '@/lib/api/home';

function calcularRacha(registros: RegistroAnimo[]): number {
  if (!registros.length) return 0;
  const diasConRegistro = new Set(registros.map(r => new Date(r.fecha).toDateString()));
  let racha = 0;
  const cursor = new Date();
  if (!diasConRegistro.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (diasConRegistro.has(cursor.toDateString())) {
    racha++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return racha;
}

function barColor(v: number): string {
  return v >= 7 ? Colors.primary : v >= 4 ? '#F59E0B' : '#EF4444';
}

export function RachaAnimo() {
  const [registros, setRegistros] = useState<RegistroAnimo[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    homeService.getHistorialAnimo(28)
      .then(setRegistros)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  if (cargando || registros.length === 0) return null;

  const racha = calcularRacha(registros);

  // Agrupar en 4 semanas (más antigua → más reciente) para caber en pantalla
  const semanas = Array.from({ length: 4 }, (_, i) => {
    const finSemana = new Date();
    finSemana.setHours(23, 59, 59, 999);
    finSemana.setDate(finSemana.getDate() - (3 - i) * 7);
    const inicioSemana = new Date(finSemana);
    inicioSemana.setDate(inicioSemana.getDate() - 6);
    inicioSemana.setHours(0, 0, 0, 0);

    const delRango = registros.filter(r => {
      const f = new Date(r.fecha);
      return f >= inicioSemana && f <= finSemana;
    });
    const promedio = delRango.length
      ? delRango.reduce((a, r) => a + r.valor, 0) / delRango.length
      : null;
    return { promedio, esActual: i === 3 };
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.rachaBox}>
          <Text style={styles.rachaEmoji}>{racha >= 7 ? '🔥' : racha >= 3 ? '⚡' : '💫'}</Text>
          <View>
            <Text style={styles.rachaNum}>{racha} día{racha !== 1 ? 's' : ''}</Text>
            <Text style={styles.rachaLbl}>de racha registrando ánimo</Text>
          </View>
        </View>
      </View>

      <Text style={styles.chartLbl}>Últimas 4 semanas</Text>
      <View style={styles.chart}>
        {semanas.map((s, i) => (
          <View key={i} style={styles.barCol}>
            <View style={styles.barTrack}>
              {s.promedio !== null && (
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max((s.promedio / 10) * 100, 6)}%`,
                      backgroundColor: barColor(s.promedio),
                      opacity: s.esActual ? 1 : 0.6,
                    },
                  ]}
                />
              )}
            </View>
            <Text style={styles.barValor}>{s.promedio !== null ? s.promedio.toFixed(1) : '—'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 18, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  header: { marginBottom: 14 },
  rachaBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rachaEmoji: { fontSize: 26 },
  rachaNum: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  rachaLbl: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  chartLbl: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  chart: { flexDirection: 'row', gap: 10, height: 60, alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 4 },
  barTrack: { width: '100%', height: 44, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4 },
  barValor: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600' },
});
