import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
  TextInput, Alert,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { citasService, Cita } from '@/lib/api/citas';
import { resenasService } from '@/lib/api/resenas';
import { LoadingSpinner, EmptyState, ErrorState, Avatar, Badge, BottomSheetModal, Button } from '@/components';
import { useColorMapping, useDateFormat, useCurrencyFormat, useModal } from '@/hooks';

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  EN_CURSO: 'En curso',
  COMPLETADA: 'Completada',
  CANCELADA_USUARIO: 'Cancelada',
  CANCELADA_PSICOLOGO: 'Cancelada',
  NO_SHOW: 'No asistió',
};

export default function MisCitasScreen() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [resenaModal, setResenaModal] = useState<{ citaId: string; psicologo: string } | null>(null);
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviandoResena, setEnviandoResena] = useState(false);
  const { color } = useColorMapping();
  const { fecha, hora } = useDateFormat();
  const { cop } = useCurrencyFormat();
  const resenaModalState = useModal();

  useFocusEffect(useCallback(() => { cargar(); }, []));

  async function cargar() {
    try {
      setError('');
      const data = await citasService.getCitas();
      setCitas(data.citas ?? []);
    } catch {
      setError('No se pudieron cargar las citas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    cargar();
  }

  function abrirResena(citaId: string, psicologo: string) {
    setResenaModal({ citaId, psicologo });
    resenaModalState.abrir();
  }

  async function enviarResena() {
    if (!resenaModal) return;
    setEnviandoResena(true);
    try {
      await resenasService.crearResena(resenaModal.citaId, estrellas, comentario);
      resenaModalState.cerrar();
      setComentario('');
      setEstrellas(5);
      cargar();
      Alert.alert('¡Gracias!', 'Tu reseña fue enviada exitosamente.');
    } catch (e: any) {
      Alert.alert('Error', e?.mensaje || 'No se pudo enviar la reseña');
    } finally {
      setEnviandoResena(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis citas</Text>
      </View>

      {error ? (
        <ErrorState mensaje={error} onReintentar={cargar} />
      ) : citas.length === 0 ? (
        <EmptyState
          icono="calendar-outline"
          titulo="Sin citas agendadas"
          descripcion="Busca un psicólogo y agenda tu primera sesión"
        />
      ) : (
        <FlatList
          data={citas}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          renderItem={({ item }) => {
            const estadoColor = color('estado_cita', item.estado);
            const label = ESTADO_LABEL[item.estado] ?? item.estado;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Avatar nombre={item.psicologo.nombreCompleto} size={44} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.psicologoNombre}>{item.psicologo.nombreCompleto}</Text>
                    <Text style={styles.especialidad}>{item.psicologo.especialidades[0]}</Text>
                  </View>
                  <Badge texto={label} color={estadoColor} variante="soft" />
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBottom}>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={15} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>{fecha(item.fechaHora)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="time" size={15} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>
                      {hora(item.fechaHora)} · {item.duracionMinutos} min
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="videocam" size={15} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>{item.modalidad === 'VIDEOLLAMADA' ? 'Videollamada' : item.modalidad}</Text>
                  </View>
                  <Text style={styles.monto}>{cop(item.montoCOP)}</Text>
                  {(item.estado === 'CONFIRMADA' || item.estado === 'EN_CURSO') && (
                    <TouchableOpacity
                      style={styles.unirseBtn}
                      onPress={() => router.push(`/videollamada/${item.id}` as any)}
                    >
                      <Ionicons name="videocam" size={16} color="#fff" />
                      <Text style={styles.unirseBtnText}>Unirse a la sesión</Text>
                    </TouchableOpacity>
                  )}
                  {item.estado === 'COMPLETADA' && !item.resena && (
                    <TouchableOpacity style={styles.resenaBtn} onPress={() => abrirResena(item.id, item.psicologo.nombreCompleto)}>
                      <Ionicons name="star-outline" size={14} color={Colors.primary} />
                      <Text style={styles.resenaBtnText}>Calificar sesión</Text>
                    </TouchableOpacity>
                  )}
                  {item.resena && (
                    <View style={styles.resenaHecha}>
                      {[1,2,3,4,5].map(s => <Ionicons key={s} name="star" size={13} color={s <= item.resena!.calificacion ? '#F59E0B' : Colors.border} />)}
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Modal reseña */}
      <BottomSheetModal
        visible={resenaModalState.visible}
        titulo="Califica tu sesión"
        onCerrar={resenaModalState.cerrar}
      >
        <Text style={styles.modalSubtitulo}>con {resenaModal?.psicologo}</Text>
        <View style={styles.estrellasRow}>
          {[1,2,3,4,5].map(s => (
            <TouchableOpacity key={s} onPress={() => setEstrellas(s)}>
              <Ionicons name="star" size={36} color={s <= estrellas ? '#F59E0B' : Colors.border} />
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.comentarioInput}
          placeholder="Comentario opcional..."
          placeholderTextColor={Colors.textSecondary}
          value={comentario}
          onChangeText={setComentario}
          multiline
          maxLength={500}
        />
        <Button onPress={enviarResena} cargando={enviandoResena} variante="primary">
          Enviar reseña
        </Button>
        <TouchableOpacity style={styles.cancelarResenaBtn} onPress={resenaModalState.cerrar}>
          <Text style={styles.cancelarResenaText}>Cancelar</Text>
        </TouchableOpacity>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  titulo: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  lista: { padding: 16 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  psicologoNombre: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  especialidad: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  cardBottom: { gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: Colors.textSecondary },
  monto: { fontSize: 15, fontWeight: '700', color: Colors.primary, marginTop: 4 },
  unirseBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: '#3B82F6', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, alignSelf: 'flex-start' },
  unirseBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  resenaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: '#F0FDF4', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start' },
  resenaBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  resenaHecha: { flexDirection: 'row', gap: 2, marginTop: 8 },
  modalSubtitulo: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  estrellasRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  comentarioInput: { backgroundColor: Colors.background, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  cancelarResenaBtn: { alignItems: 'center', padding: 10, marginTop: 8 },
  cancelarResenaText: { color: Colors.textSecondary, fontSize: 15 },
});
