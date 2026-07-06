import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ScrollView, RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { diarioService, EntradaDiario } from '@/lib/api/diario';
import { LoadingSpinner, EmptyState } from '@/components';
import { useConfirmDialog, useDateFormat } from '@/hooks';

const EMOJIS = ['😢','😞','😕','😐','🙂','😊','😃','😄','🥰','🤩'];
const EMOCIONES = [
  { label: 'Ansioso', color: '#FEF3C7', text: '#D97706' },
  { label: 'Triste', color: '#EFF6FF', text: '#2563EB' },
  { label: 'Enojado', color: '#FFF5F5', text: '#DC2626' },
  { label: 'Confundido', color: '#F5F3FF', text: '#7C3AED' },
  { label: 'Tranquilo', color: '#F0FDF4', text: '#16A34A' },
  { label: 'Feliz', color: '#FFFBEB', text: '#D97706' },
  { label: 'Agradecido', color: '#FFF0F6', text: '#DB2777' },
  { label: 'Esperanzado', color: '#ECFDF5', text: '#059669' },
  { label: 'Cansado', color: '#F1F5F9', text: '#475569' },
  { label: 'Orgulloso', color: '#F0FDF4', text: '#15803D' },
];

type Paso = 'animo' | 'emociones' | 'escribir';

export default function DiarioScreen() {
  const [entradas, setEntradas] = useState<EntradaDiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [paso, setPaso] = useState<Paso>('animo');
  const [contenido, setContenido] = useState('');
  const [animo, setAnimo] = useState(5);
  const [emocionesSeleccionadas, setEmocionesSeleccionadas] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { confirmar } = useConfirmDialog();
  const { fecha, hora } = useDateFormat();

  useFocusEffect(useCallback(() => { cargarEntradas(); }, []));

  async function cargarEntradas() {
    try {
      const data = await diarioService.getEntradas();
      setEntradas(data.entradas);
    } catch (err: any) {
      console.warn('[Diario] Error cargando entradas:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function abrirModal() {
    setPaso('animo');
    setAnimo(5);
    setEmocionesSeleccionadas([]);
    setContenido('');
    setModalVisible(true);
  }

  function toggleEmocion(e: string) {
    setEmocionesSeleccionadas(prev =>
      prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]
    );
  }

  function retroceder() {
    if (paso === 'emociones') setPaso('animo');
    else if (paso === 'escribir') setPaso('emociones');
  }

  function avanzar() {
    if (paso === 'animo') setPaso('emociones');
    else if (paso === 'emociones') setPaso('escribir');
  }

  async function confirmarEliminar(id: string) {
    const ok = await confirmar({
      titulo: 'Eliminar entrada',
      mensaje: '¿Estás seguro? Esta acción no se puede deshacer.',
      textoConfirmar: 'Eliminar',
      destructivo: true,
    });
    if (!ok) return;
    try {
      await diarioService.eliminarEntrada(id);
      setEntradas(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      console.warn('[Diario] Error eliminando entrada:', err?.message);
    }
  }

  async function guardarEntrada() {
    if (!contenido.trim()) return;
    setGuardando(true);
    try {
      await diarioService.crearEntrada({ contenido, animo, emociones: emocionesSeleccionadas });
      setModalVisible(false);
      cargarEntradas();
    } catch (err: any) {
      console.warn('[Diario] Error guardando entrada:', err?.message);
    } finally { setGuardando(false); }
  }

  const PASOS: Paso[] = ['animo', 'emociones', 'escribir'];
  const pasoIdx = PASOS.indexOf(paso);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Diario</Text>
          <Text style={styles.subtitulo}>{entradas.length} entrada{entradas.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.nuevoBtn} onPress={abrirModal}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : entradas.length === 0 ? (
        <EmptyState
          icono="book-outline"
          titulo="Tu diario está vacío"
          descripcion="Escribir sobre tus emociones ayuda a procesarlas y entenderte mejor."
          accionTexto="Primera entrada"
          onAccion={abrirModal}
        />
      ) : (
        <FlatList
          data={entradas}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargarEntradas(); }} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <View style={styles.entradaCard}>
              <View style={styles.entradaHeader}>
                <Text style={styles.entradaEmoji}>{EMOJIS[item.animo - 1]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.entradaFecha}>{fecha(item.creadaEn)}</Text>
                  <Text style={styles.entradaHora}>{hora(item.creadaEn)}</Text>
                </View>
                {item.esFavorita && <Ionicons name="heart" size={16} color={Colors.error} />}
                <TouchableOpacity onPress={() => confirmarEliminar(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="trash-outline" size={17} color={Colors.border} />
                </TouchableOpacity>
              </View>
              <Text style={styles.entradaContenido} numberOfLines={3}>
                {item.contenido}
              </Text>
              {item.emociones.length > 0 && (
                <View style={styles.emocionesRow}>
                  {item.emociones.slice(0, 4).map((e, i) => {
                    const ec = EMOCIONES.find(x => x.label.toLowerCase() === e.toLowerCase());
                    return (
                      <View key={`${e}-${i}`} style={[styles.emocionTag, ec && { backgroundColor: ec.color }]}>
                        <Text style={[styles.emocionText, ec && { color: ec.text }]}>{e}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        />
      )}

      {/* Modal nueva entrada */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          {/* Barra de progreso */}
          <View style={styles.modalHeaderTop}>
            <TouchableOpacity onPress={pasoIdx > 0 ? retroceder : () => setModalVisible(false)}>
              <Ionicons name={pasoIdx > 0 ? 'arrow-back' : 'close'} size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.progresoBar}>
              {PASOS.map((_, i) => (
                <View key={i} style={[styles.progresoDot, i <= pasoIdx && styles.progresoDotActive]} />
              ))}
            </View>
            {paso === 'escribir' ? (
              <TouchableOpacity onPress={guardarEntrada} disabled={guardando || !contenido.trim()}>
                <Text style={[styles.guardarBtn, !contenido.trim() && { opacity: 0.4 }]}>Guardar</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 60 }} />
            )}
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            {/* Paso 1: ánimo */}
            {paso === 'animo' && (
              <View style={styles.pasoCont}>
                <Text style={styles.pasoTitulo}>¿Cómo te sientes ahora?</Text>
                <Text style={styles.pasoDesc}>Selecciona el emoji que mejor describe tu estado de ánimo</Text>
                <Text style={styles.animoEmojiGrande}>{EMOJIS[animo - 1]}</Text>
                <View style={styles.emojiGrid}>
                  {EMOJIS.map((emoji, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setAnimo(i + 1)}
                      style={[styles.emojiBtn, animo === i + 1 && styles.emojiBtnSelected]}
                    >
                      <Text style={styles.emoji}>{emoji}</Text>
                      <Text style={styles.emojiNum}>{i + 1}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.animoScale}>
                  <Text style={styles.animoScaleText}>Muy mal</Text>
                  <Text style={styles.animoScaleText}>Excelente</Text>
                </View>
                <TouchableOpacity style={styles.nextBtn} onPress={avanzar}>
                  <Text style={styles.nextBtnText}>Continuar</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Paso 2: emociones */}
            {paso === 'emociones' && (
              <View style={styles.pasoCont}>
                <Text style={styles.pasoTitulo}>¿Qué emociones identificas?</Text>
                <Text style={styles.pasoDesc}>Puedes seleccionar varias — o saltar este paso</Text>
                <View style={styles.emocionesGrid}>
                  {EMOCIONES.map(e => (
                    <TouchableOpacity
                      key={e.label}
                      style={[
                        styles.emocionChip,
                        emocionesSeleccionadas.includes(e.label) && { backgroundColor: e.color, borderColor: e.text },
                      ]}
                      onPress={() => toggleEmocion(e.label)}
                    >
                      <Text style={[styles.emocionChipText, emocionesSeleccionadas.includes(e.label) && { color: e.text, fontWeight: '700' }]}>
                        {e.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {emocionesSeleccionadas.length > 0 && (
                  <Text style={styles.seleccionadas}>
                    {emocionesSeleccionadas.length} seleccionada{emocionesSeleccionadas.length !== 1 ? 's' : ''}
                  </Text>
                )}
                <TouchableOpacity style={styles.nextBtn} onPress={avanzar}>
                  <Text style={styles.nextBtnText}>
                    {emocionesSeleccionadas.length > 0 ? 'Continuar' : 'Saltar'}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Paso 3: escribir */}
            {paso === 'escribir' && (
              <View style={styles.pasoCont}>
                <Text style={styles.pasoTitulo}>¿Qué quieres expresar?</Text>
                <Text style={styles.pasoDesc}>Escribe con libertad — nadie más puede leer tus entradas</Text>
                <TextInput
                  style={styles.textarea}
                  multiline
                  placeholder="¿Qué pasó hoy? ¿Qué pensamientos tienes? ¿Qué te preocupa o alegra?..."
                  placeholderTextColor={Colors.textSecondary}
                  value={contenido}
                  onChangeText={setContenido}
                  textAlignVertical="top"
                  autoFocus
                />
                <Text style={styles.wordCount}>{contenido.trim().split(/\s+/).filter(Boolean).length} palabras</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 60, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  titulo: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  subtitulo: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  nuevoBtn: { backgroundColor: Colors.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  lista: { padding: 16 },
  entradaCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 10 },
  entradaHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  entradaEmoji: { fontSize: 28 },
  entradaFecha: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, textTransform: 'capitalize' },
  entradaHora: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  entradaContenido: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  emocionesRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  emocionTag: { backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  emocionText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  // Modal
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeaderTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 56, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  progresoBar: { flexDirection: 'row', gap: 6 },
  progresoDot: { width: 24, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  progresoDotActive: { backgroundColor: Colors.primary },
  guardarBtn: { fontSize: 15, color: Colors.primary, fontWeight: '700', width: 60, textAlign: 'right' },
  modalBody: { flex: 1 },
  pasoCont: { padding: 24, gap: 16 },
  pasoTitulo: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  pasoDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  animoEmojiGrande: { fontSize: 72, textAlign: 'center', marginVertical: 8 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  emojiBtn: { alignItems: 'center', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  emojiBtnSelected: { borderColor: Colors.primary, backgroundColor: '#F0FDF4' },
  emoji: { fontSize: 28 },
  emojiNum: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  animoScale: { flexDirection: 'row', justifyContent: 'space-between' },
  animoScaleText: { fontSize: 11, color: Colors.textSecondary },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 16, padding: 16, marginTop: 8 },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emocionesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emocionChip: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  emocionChipText: { fontSize: 14, color: Colors.textSecondary },
  seleccionadas: { fontSize: 13, color: Colors.primary, fontWeight: '600', textAlign: 'center' },
  textarea: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    fontSize: 15, color: Colors.textPrimary, minHeight: 200,
    borderWidth: 1, borderColor: Colors.border, lineHeight: 24,
  },
  wordCount: { fontSize: 12, color: Colors.textSecondary, textAlign: 'right' },
});
