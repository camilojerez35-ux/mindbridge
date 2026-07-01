import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, TextInput,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { psicologosService, Psicologo } from '@/lib/api/psicologos';
import { LoadingSpinner, EmptyState, ErrorState, Avatar, Badge, FilterChips } from '@/components';
import { useCurrencyFormat } from '@/hooks';

const ESPECIALIDADES = ['Todas', 'Ansiedad', 'Depresión', 'Pareja', 'Trauma', 'TCC', 'Infancia', 'Laboral'];

export default function PsicologosScreen() {
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [filtrados, setFiltrados] = useState<Psicologo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [especialidad, setEspecialidad] = useState('Todas');
  const { cop } = useCurrencyFormat();

  useFocusEffect(useCallback(() => { cargar(); }, []));

  async function cargar() {
    try {
      setError('');
      const data = await psicologosService.getPsicologos();
      setPsicologos(data);
      setFiltrados(data);
    } catch {
      setError('No se pudieron cargar los psicólogos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function aplicarFiltros(texto: string, esp: string) {
    let resultado = psicologos;
    if (esp !== 'Todas') {
      resultado = resultado.filter(p =>
        p.especialidades.some(e => e.toLowerCase().includes(esp.toLowerCase()))
      );
    }
    if (texto.trim()) {
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(texto.toLowerCase()) ||
        p.especialidades.some(e => e.toLowerCase().includes(texto.toLowerCase()))
      );
    }
    setFiltrados(resultado);
  }

  function handleBusqueda(t: string) {
    setBusqueda(t);
    aplicarFiltros(t, especialidad);
  }

  function handleEspecialidad(e: string) {
    setEspecialidad(e);
    aplicarFiltros(busqueda, e);
  }

  function renderEstrellas(cal: number) {
    const llenas = Math.round(cal);
    return '★'.repeat(llenas) + '☆'.repeat(Math.max(0, 5 - llenas));
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Psicólogos</Text>
        <Text style={styles.subtitulo}>Profesionales verificados en Colombia</Text>
      </View>

      {!loading && !error && (
        <>
          {/* Buscador */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o especialidad..."
              placeholderTextColor={Colors.textSecondary}
              value={busqueda}
              onChangeText={handleBusqueda}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => handleBusqueda('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filtros de especialidad */}
          <View style={styles.filtrosWrapper}>
            <FilterChips
              items={ESPECIALIDADES}
              seleccionado={especialidad}
              onChange={handleEspecialidad}
            />
          </View>
        </>
      )}

      {loading ? (
        <LoadingSpinner texto="Buscando profesionales..." />
      ) : error ? (
        <ErrorState mensaje={error} onReintentar={cargar} />
      ) : filtrados.length === 0 ? (
        <EmptyState
          icono="people-outline"
          titulo={psicologos.length === 0 ? 'Sin psicólogos disponibles' : 'Sin resultados'}
          descripcion={psicologos.length === 0 ? 'Pronto habrá profesionales disponibles' : 'Prueba con otra especialidad o nombre'}
          accionTexto={psicologos.length > 0 ? 'Ver todos' : undefined}
          onAccion={psicologos.length > 0 ? () => { handleBusqueda(''); handleEspecialidad('Todas'); } : undefined}
        />
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={Colors.primary} />}
          ListHeaderComponent={
            <Text style={styles.resultados}>{filtrados.length} profesional{filtrados.length !== 1 ? 'es' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Avatar nombre={item.nombre} size={50} color={Colors.primary} />
                <View style={styles.cardInfo}>
                  <View style={styles.nombreRow}>
                    <Text style={styles.nombre} numberOfLines={1}>{item.nombre}</Text>
                    {item.tarjetaVerificada && (
                      <View style={styles.colpsicBadge}>
                        <Ionicons name="checkmark-circle" size={11} color="#4ade80" />
                        <Text style={styles.colpsicText}>COLPSIC</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.estrellas, { color: item.calificacionPromedio >= 4 ? '#F59E0B' : Colors.textSecondary }]}>
                    {renderEstrellas(item.calificacionPromedio)} {item.calificacionPromedio.toFixed(1)}
                  </Text>
                  <Text style={styles.tarifa}>
                    {cop(item.tarifaSesion)} / sesión
                  </Text>
                </View>
              </View>

              {item.especialidades.length > 0 && (
                <View style={styles.tagsRow}>
                  {item.especialidades.slice(0, 4).map(e => (
                    <Badge
                      key={e}
                      texto={e}
                      color={especialidad !== 'Todas' && e.toLowerCase().includes(especialidad.toLowerCase()) ? Colors.primary : Colors.textSecondary}
                      variante={especialidad !== 'Todas' && e.toLowerCase().includes(especialidad.toLowerCase()) ? 'soft' : 'soft'}
                    />
                  ))}
                </View>
              )}

              {item.bio && (
                <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>
              )}

              {item.modalidades.length > 0 && (
                <View style={styles.modalidadesRow}>
                  {item.modalidades.map(m => {
                    const esVideo = m.toUpperCase().includes('VIDEO');
                    const esTelef = m.toUpperCase().includes('TELEF') || m.toUpperCase().includes('PHONE');
                    const esChat = m.toUpperCase().includes('CHAT') || m.toUpperCase().includes('TEXTO');
                    const label = esVideo ? 'Video' : esTelef ? 'Llamada' : esChat ? 'Chat texto' : m;
                    const icon = esVideo ? 'videocam-outline' : esTelef ? 'call-outline' : 'chatbubble-outline';
                    return (
                      <View key={m} style={styles.modalidadChip}>
                        <Ionicons name={icon as any} size={11} color={Colors.secondary} />
                        <Text style={styles.modalidadText}>{label}</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.botonesRow}>
                <TouchableOpacity
                  style={styles.verPerfilBtn}
                  onPress={() => router.push(`/psicologo/${item.id}` as any)}
                >
                  <Text style={styles.verPerfilBtnText}>Ver perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.agendarBtn}
                  onPress={() => router.push({
                    pathname: '/agendar/[psicologoId]',
                    params: { psicologoId: item.id, nombre: item.nombre, tarifa: String(item.tarifaSesion) },
                  })}
                >
                  <Ionicons name="calendar-outline" size={15} color="#fff" />
                  <Text style={styles.agendarBtnText}>Agendar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: 20, paddingTop: 60, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  titulo: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  subtitulo: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: 14, padding: 12,
    margin: 12, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  filtrosWrapper: { height: 48 },
  lista: { padding: 12, paddingTop: 8 },
  resultados: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  card: { backgroundColor: Colors.surface, borderRadius: 18, padding: 16, marginBottom: 12, elevation: 1 },
  cardHeader: { flexDirection: 'row', marginBottom: 12, gap: 12 },
  cardInfo: { flex: 1 },
  nombreRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  nombre: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flexShrink: 1 },
  colpsicBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(74,222,128,0.12)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2 },
  colpsicText: { fontSize: 9, fontWeight: '800', color: '#4ade80' },
  estrellas: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  tarifa: { fontSize: 13, color: Colors.primary, fontWeight: '700', marginTop: 2 },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  bio: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 10 },
  modalidadesRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  modalidadChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  modalidadText: { fontSize: 12, color: Colors.secondary, fontWeight: '500' },
  botonesRow: { flexDirection: 'row', gap: 8 },
  verPerfilBtn: { flex: 1, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  verPerfilBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  agendarBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  agendarBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
