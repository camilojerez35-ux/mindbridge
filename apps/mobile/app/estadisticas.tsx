import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, Dimensions
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { statsService } from '@/lib/api/stats';
import { LoadingSpinner, ErrorState } from '@/components';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;

const EMOJIS = ['😢','😞','😕','😐','🙂','😊','😃','😄','🥰','🤩'];

function ColorBar({ valor, maxH = 100, barW = 20 }: { valor: number; maxH?: number; barW?: number }) {
  const h = Math.max(6, (valor / 10) * maxH);
  const color = valor <= 3 ? Colors.error : valor <= 6 ? Colors.warning : Colors.primary;
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <Text style={{ fontSize: 10 }}>{EMOJIS[valor - 1]}</Text>
      <View style={{ width: barW, height: maxH, justifyContent: 'flex-end' }}>
        <View style={{ height: h, backgroundColor: color, borderRadius: 3, width: barW }} />
      </View>
    </View>
  );
}

export default function EstadisticasScreen() {
  const [stats, setStats] = useState<any>(null);
  const [registros, setRegistros] = useState<{ valor: number; fecha: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [rango, setRango] = useState<7 | 14>(14);

  useFocusEffect(useCallback(() => { cargar(); }, []));

  async function cargar() {
    try {
      setError('');
      const [s, animo] = await Promise.all([
        statsService.getStats(),
        statsService.getAnimo(30),
      ]);
      setStats(s);
      setRegistros([...animo.registros].reverse());
    } catch {
      setError('No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (loading) {
    return <LoadingSpinner texto="Cargando tu progreso..." />;
  }

  const registrosFiltrados = registros.slice(-rango);
  const barW = registrosFiltrados.length > 0
    ? Math.max(8, Math.floor((CHART_WIDTH - registrosFiltrados.length * 3) / registrosFiltrados.length))
    : 20;

  // Estadísticas del período
  const animoPromNum = stats?.animoPromedio ? parseFloat(stats.animoPromedio) : null;
  const promEmoji = animoPromNum ? EMOJIS[Math.round(animoPromNum) - 1] : '—';
  const tendencia = registrosFiltrados.length >= 4
    ? registrosFiltrados.slice(-3).reduce((a, r) => a + r.valor, 0) / 3 -
      registrosFiltrados.slice(0, 3).reduce((a, r) => a + r.valor, 0) / 3
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={Colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Mi progreso</Text>
          <Text style={styles.subtitulo}>Tu bienestar en números</Text>
        </View>
        {animoPromNum && (
          <View style={styles.headerEmoji}>
            <Text style={styles.headerEmojiText}>{promEmoji}</Text>
          </View>
        )}
      </View>

      {error ? (
        <ErrorState mensaje={error} onReintentar={cargar} />
      ) : (
        <>
          {/* Grid de métricas */}
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.metricDestacada]}>
              <Ionicons name="sunny" size={18} color={Colors.primary} />
              <Text style={[styles.metricValue, { color: Colors.primary }]}>{stats?.diasActivo ?? 0}</Text>
              <Text style={styles.metricLabel}>Días activo</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="book-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.metricValue}>{stats?.entradasMes ?? 0}</Text>
              <Text style={styles.metricLabel}>Entradas este mes</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="chatbubbles-outline" size={18} color={Colors.secondary} />
              <Text style={[styles.metricValue, { color: Colors.secondary }]}>{stats?.sesionesIA ?? 0}</Text>
              <Text style={styles.metricLabel}>Sesiones con IA</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="heart-outline" size={18} color={Colors.error} />
              <Text style={[styles.metricValue, { color: animoPromNum && animoPromNum >= 7 ? Colors.primary : animoPromNum && animoPromNum >= 4 ? Colors.warning : Colors.error }]}>
                {animoPromNum ? animoPromNum.toFixed(1) : '—'}
              </Text>
              <Text style={styles.metricLabel}>Ánimo promedio</Text>
            </View>
          </View>

          {/* Tendencia */}
          {tendencia !== 0 && (
            <View style={[styles.tendenciaCard, { borderColor: tendencia > 0 ? '#BBF7D0' : '#FECACA' }]}>
              <Ionicons
                name={tendencia > 0 ? 'trending-up' : 'trending-down'}
                size={20}
                color={tendencia > 0 ? Colors.primary : Colors.error}
              />
              <Text style={[styles.tendenciaText, { color: tendencia > 0 ? Colors.primary : Colors.error }]}>
                {tendencia > 0 ? 'Tu ánimo está mejorando' : 'Tu ánimo ha bajado'} en los últimos días
              </Text>
            </View>
          )}

          {/* Gráfica de ánimo */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitulo}>Estado de ánimo</Text>
              <View style={styles.rangoBtns}>
                <TouchableOpacity
                  onPress={() => setRango(7)}
                  style={[styles.rangoBtn, rango === 7 && styles.rangoBtnActive]}
                >
                  <Text style={[styles.rangoBtnText, rango === 7 && styles.rangoBtnTextActive]}>7d</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setRango(14)}
                  style={[styles.rangoBtn, rango === 14 && styles.rangoBtnActive]}
                >
                  <Text style={[styles.rangoBtnText, rango === 14 && styles.rangoBtnTextActive]}>14d</Text>
                </TouchableOpacity>
              </View>
            </View>

            {registrosFiltrados.length === 0 ? (
              <View style={styles.emptyChart}>
                <Text style={{ fontSize: 32 }}>📊</Text>
                <Text style={styles.emptyChartText}>Sin registros aún</Text>
                <Text style={styles.emptyChartSub}>Registra tu ánimo desde la pantalla principal</Text>
              </View>
            ) : (
              <>
                <View style={[styles.chart, { height: 130 }]}>
                  {registrosFiltrados.map((r, i) => (
                    <ColorBar key={i} valor={r.valor} maxH={100} barW={barW} />
                  ))}
                </View>
                <View style={styles.chartLabels}>
                  {registrosFiltrados.map((r, i) => (
                    <Text key={i} style={[styles.barLabel, { width: barW + 3 }]}>
                      {new Date(r.fecha).toLocaleDateString('es-CO', { day: 'numeric' })}
                    </Text>
                  ))}
                </View>
                <View style={styles.legend}>
                  {[['error','Bajo (1-3)'],['warning','Medio (4-6)'],['primary','Alto (7-10)']].map(([k,l]) => (
                    <View key={k} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: Colors[k as keyof typeof Colors] as string }]} />
                      <Text style={styles.legendText}>{l}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Resumen del mes */}
          {stats?.entradasMes > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Este mes</Text>
              <View style={styles.resumenRow}>
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenNum}>{stats.entradasMes}</Text>
                  <Text style={styles.resumenLbl}>entradas en el diario</Text>
                </View>
                {animoPromNum && (
                  <View style={styles.resumenItem}>
                    <Text style={[styles.resumenNum, { color: Colors.primary }]}>{animoPromNum.toFixed(1)}</Text>
                    <Text style={styles.resumenLbl}>ánimo promedio / 10</Text>
                  </View>
                )}
              </View>
              {animoPromNum && (
                <View style={[styles.animoBanner, {
                  backgroundColor: animoPromNum >= 7 ? '#F0FDF4' : animoPromNum >= 4 ? '#FFFBEB' : '#FFF5F5',
                  borderColor: animoPromNum >= 7 ? '#BBF7D0' : animoPromNum >= 4 ? '#FDE68A' : '#FECACA',
                }]}>
                  <Text style={styles.animoBannerEmoji}>{promEmoji}</Text>
                  <Text style={[styles.animoBannerText, {
                    color: animoPromNum >= 7 ? Colors.primary : animoPromNum >= 4 ? Colors.warning : Colors.error,
                  }]}>
                    {animoPromNum >= 7 ? 'Tu bienestar va muy bien este mes 🎉'
                      : animoPromNum >= 4 ? 'Estás en un nivel estable. ¡Sigue así!'
                      : 'Este mes ha sido difícil. Considera hablar con alguien.'}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* CTA */}
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Continúa tu camino</Text>
            <Text style={styles.ctaDesc}>
              Registrar tu estado de ánimo diariamente te ayuda a identificar patrones y mejorar tu bienestar.
            </Text>
            <View style={styles.ctaTips}>
              <Text style={styles.ctaTip}>✍️ Escribe en tu diario hoy</Text>
              <Text style={styles.ctaTip}>🎯 Completa un ejercicio de mindfulness</Text>
              <Text style={styles.ctaTip}>💬 Habla con tu psicólogo si necesitas apoyo</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 60, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  titulo: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  subtitulo: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  headerEmoji: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center',
  },
  headerEmojiText: { fontSize: 26 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },
  metricCard: {
    flex: 1, minWidth: '44%', backgroundColor: Colors.surface,
    borderRadius: 16, padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  metricDestacada: { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' },
  metricValue: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  metricLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  tendenciaCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 4, borderRadius: 14,
    padding: 14, backgroundColor: Colors.surface, borderWidth: 1,
  },
  tendenciaText: { fontSize: 14, fontWeight: '600', flex: 1 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, margin: 16, marginTop: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitulo: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  rangoBtns: { flexDirection: 'row', gap: 4 },
  rangoBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  rangoBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  rangoBtnText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  rangoBtnTextActive: { color: '#fff' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  chartLabels: { flexDirection: 'row', gap: 3, marginTop: 4 },
  barLabel: { fontSize: 9, color: Colors.textSecondary, textAlign: 'center' },
  emptyChart: { alignItems: 'center', paddingVertical: 32, gap: 6 },
  emptyChartText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  emptyChartSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: Colors.textSecondary },
  resumenRow: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  resumenItem: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: Colors.background, borderRadius: 12 },
  resumenNum: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  resumenLbl: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },
  animoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 12, padding: 14, borderWidth: 1,
  },
  animoBannerEmoji: { fontSize: 32 },
  animoBannerText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 18 },
  ctaDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 14 },
  ctaTips: { gap: 8 },
  ctaTip: { fontSize: 14, color: Colors.textPrimary },
});
