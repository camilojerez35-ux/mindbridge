import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { testsService, TestItem } from '@/lib/api/tests';
import { LoadingSpinner, ErrorState } from '@/components';

export default function TestsScreen() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [completados, setCompletados] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => { cargar(); }, []));

  async function cargar() {
    try {
      setError('');
      const data = await testsService.getTests();
      setTests(data.tests ?? []);
      setCompletados(data.completados ?? 0);
    } catch {
      setError('No se pudieron cargar los tests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Tests psicológicos</Text>
        <Text style={styles.subtitulo}>{completados} de {tests.length} completados</Text>
      </View>

      {error ? (
        <ErrorState mensaje={error} onReintentar={cargar} />
      ) : (
        <FlatList
          data={tests}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={Colors.primary} />}
          ListHeaderComponent={
            <View style={styles.progresoBanner}>
              <View style={styles.progresoBar}>
                <View style={[styles.progresoFill, { width: `${tests.length ? (completados / tests.length) * 100 : 0}%` }]} />
              </View>
              <Text style={styles.progresoText}>{Math.round(tests.length ? (completados / tests.length) * 100 : 0)}% completado</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, item.completado && styles.cardCompletado]}
              onPress={() => router.push(`/test/${item.id}` as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconoBox, { backgroundColor: item.color + '20' }]}>
                <Text style={styles.icono}>{item.icono}</Text>
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.cardTituloRow}>
                  <Text style={styles.cardTitulo}>{item.titulo}</Text>
                  {item.completado && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>
                <View style={styles.cardMeta}>
                  <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{item.duracionMin} min</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText}>{item.numPreguntas} preguntas</Text>
                </View>
                {item.completado && item.resultado && (
                  <View style={styles.resultadoBadge}>
                    <Text style={styles.resultadoText}>{item.resultado.resultadoTitulo}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  titulo: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  subtitulo: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  lista: { padding: 16 },
  progresoBanner: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 12 },
  progresoBar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  progresoFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  progresoText: { fontSize: 13, color: Colors.textSecondary, marginTop: 8, textAlign: 'right' },
  card: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, elevation: 1 },
  cardCompletado: { opacity: 0.85 },
  iconoBox: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  icono: { fontSize: 26 },
  cardInfo: { flex: 1 },
  cardTituloRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitulo: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  metaDot: { color: Colors.textSecondary },
  resultadoBadge: { backgroundColor: '#F0FDF4', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6, alignSelf: 'flex-start' },
  resultadoText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
});
