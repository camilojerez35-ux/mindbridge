import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Animated, Dimensions
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { api } from '@/lib/api/client';
import { LoadingSpinner, ScreenHeader } from '@/components';

const { width } = Dimensions.get('window');

interface Pregunta {
  id: string;
  texto: string;
  opciones: { valor: number; texto: string }[];
}

interface Test {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
  preguntas: Pregunta[];
}

interface Resultado {
  titulo: string;
  descripcion: string;
  puntajeTotal: number;
  puntajeMaximo: number;
  porcentaje: number;
}

export default function TestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [progreso] = useState(new Animated.Value(0));

  useEffect(() => { cargarTest(); }, [id]);

  useEffect(() => {
    if (!test) return;
    Animated.timing(progreso, {
      toValue: (preguntaIdx / test.preguntas.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [preguntaIdx, test]);

  async function cargarTest() {
    try {
      const data = await api.get<{ test: Test }>(`/tests?id=${id}`);
      setTest(data.test);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el test', [{ text: 'Volver', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  }

  function responder(preguntaId: string, valor: number) {
    const nuevas = { ...respuestas, [preguntaId]: valor };
    setRespuestas(nuevas);

    setTimeout(() => {
      if (preguntaIdx < (test?.preguntas.length ?? 0) - 1) {
        setPreguntaIdx(i => i + 1);
      } else {
        enviarResultado(nuevas);
      }
    }, 300);
  }

  async function enviarResultado(resp: Record<string, number>) {
    setEnviando(true);
    try {
      const data = await api.post<{ resultado: Resultado }>('/tests/resultado', {
        testId: id,
        respuestas: resp,
      });
      setResultado(data.resultado);
    } catch (e: any) {
      Alert.alert('Error', e?.mensaje || 'No se pudo guardar el resultado');
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!test) return null;

  // Pantalla de resultado
  if (resultado) {
    const color = resultado.porcentaje >= 70 ? Colors.primary : resultado.porcentaje >= 40 ? Colors.warning : Colors.error;
    return (
      <View style={styles.container}>
        <ScreenHeader titulo={test.titulo} />
        <ScrollView contentContainerStyle={styles.resultadoContent}>
          <Text style={styles.resultadoEmoji}>{test.icono}</Text>
          <Text style={styles.resultadoTitulo}>{resultado.titulo}</Text>

          <View style={styles.porcentajeBox}>
            <View style={styles.porcentajeBar}>
              <View style={[styles.porcentajeFill, { width: `${resultado.porcentaje}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.porcentajeNum, { color }]}>{resultado.porcentaje}%</Text>
          </View>

          <View style={styles.resultadoCard}>
            <Text style={styles.resultadoDesc}>{resultado.descripcion}</Text>
          </View>

          <View style={styles.puntajeRow}>
            <Text style={styles.puntajeLabel}>Puntaje obtenido</Text>
            <Text style={styles.puntajeVal}>{resultado.puntajeTotal} / {resultado.puntajeMaximo}</Text>
          </View>

          <TouchableOpacity style={[styles.volverBtn, { backgroundColor: color }]} onPress={() => router.back()}>
            <Text style={styles.volverBtnText}>Ver todos los tests</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Pantalla de carga enviando
  if (enviando) {
    return <LoadingSpinner texto="Analizando tus respuestas…" />;
  }

  const pregunta = test.preguntas[preguntaIdx];
  const respondida = respuestas[pregunta.id];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (preguntaIdx > 0) setPreguntaIdx(i => i - 1);
          else router.back();
        }}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>{test.titulo}</Text>
        <Text style={styles.contador}>{preguntaIdx + 1}/{test.preguntas.length}</Text>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progresoBar}>
        <Animated.View style={[styles.progresoFill, {
          width: progreso.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
          backgroundColor: test.color,
        }]} />
      </View>

      <ScrollView contentContainerStyle={styles.preguntaContent}>
        <View style={[styles.iconoBox, { backgroundColor: test.color + '20' }]}>
          <Text style={styles.icono}>{test.icono}</Text>
        </View>

        <Text style={styles.preguntaNum}>Pregunta {preguntaIdx + 1}</Text>
        <Text style={styles.preguntaTexto}>{pregunta.texto}</Text>

        <View style={styles.opcionesLista}>
          {(pregunta.opciones ?? []).map(opcion => {
            const seleccionada = respondida === opcion.valor;
            return (
              <TouchableOpacity
                key={opcion.valor}
                style={[
                  styles.opcionBtn,
                  seleccionada && { borderColor: test.color, backgroundColor: test.color + '15' }
                ]}
                onPress={() => responder(pregunta.id, opcion.valor)}
                activeOpacity={0.7}
              >
                <View style={[styles.opcionCirculo, seleccionada && { backgroundColor: test.color, borderColor: test.color }]}>
                  {seleccionada && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={[styles.opcionTexto, seleccionada && { color: test.color, fontWeight: '600' }]}>
                  {opcion.texto}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 56, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitulo: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, flex: 1, textAlign: 'center' },
  contador: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  progresoBar: { height: 4, backgroundColor: Colors.border },
  progresoFill: { height: '100%', borderRadius: 2 },
  preguntaContent: { padding: 24, paddingBottom: 40 },
  iconoBox: { width: 64, height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 24, alignSelf: 'center' },
  icono: { fontSize: 32 },
  preguntaNum: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, textAlign: 'center' },
  preguntaTexto: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', lineHeight: 28, marginBottom: 32 },
  opcionesLista: { gap: 10 },
  opcionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 2, borderColor: Colors.border,
  },
  opcionCirculo: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  opcionTexto: { fontSize: 15, color: Colors.textPrimary, flex: 1 },
  resultadoContent: { padding: 24, alignItems: 'center', paddingBottom: 48 },
  resultadoEmoji: { fontSize: 72, marginBottom: 16, marginTop: 20 },
  resultadoTitulo: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: 24 },
  porcentajeBox: { width: '100%', marginBottom: 24 },
  porcentajeBar: { height: 10, backgroundColor: Colors.border, borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  porcentajeFill: { height: '100%', borderRadius: 5 },
  porcentajeNum: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  resultadoCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, width: '100%', marginBottom: 20 },
  resultadoDesc: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24, textAlign: 'center' },
  puntajeRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 28 },
  puntajeLabel: { fontSize: 14, color: Colors.textSecondary },
  puntajeVal: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  volverBtn: { borderRadius: 14, padding: 16, width: '100%', alignItems: 'center' },
  volverBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
