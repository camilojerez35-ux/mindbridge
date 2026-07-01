import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { citasService } from '@/lib/api/citas';
import { Avatar, ScreenHeader, Button } from '@/components';
import { useCurrencyFormat, useDateFormat } from '@/hooks';

const METODOS = [
  { id: 'NEQUI', label: 'Nequi', icono: '📱' },
  { id: 'PSE', label: 'PSE', icono: '🏦' },
  { id: 'TARJETA', label: 'Tarjeta', icono: '💳' },
  { id: 'DAVIPLATA', label: 'Daviplata', icono: '💜' },
] as const;

const HORARIOS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

function getFechasDisponibles() {
  const fechas = [];
  const hoy = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    if (d.getDay() !== 0 && d.getDay() !== 6) fechas.push(d);
  }
  return fechas;
}

export default function AgendarCitaScreen() {
  const { psicologoId, nombre, tarifa } = useLocalSearchParams<{
    psicologoId: string; nombre: string; tarifa: string;
  }>();
  const { cop } = useCurrencyFormat();

  const fechas = getFechasDisponibles();
  const [fechaIdx, setFechaIdx] = useState(0);
  const [hora, setHora] = useState('');
  const [metodo, setMetodo] = useState<'PSE' | 'TARJETA' | 'NEQUI' | 'DAVIPLATA'>('NEQUI');
  const [loading, setLoading] = useState(false);

  async function confirmar() {
    if (!hora) {
      Alert.alert('Selecciona un horario', 'Elige la hora para tu cita.');
      return;
    }
    const fecha = new Date(fechas[fechaIdx]);
    const [h, m] = hora.split(':');
    fecha.setHours(parseInt(h), parseInt(m), 0, 0);

    setLoading(true);
    try {
      await citasService.agendarCita({
        psicologoId,
        fechaHora: fecha.toISOString(),
        metodoPago: metodo,
      });
      Alert.alert(
        '¡Cita agendada!',
        `Tu cita con ${nombre} fue registrada. Recibirás confirmación por email.`,
        [{ text: 'Ver mis citas', onPress: () => router.replace('/citas' as any) }]
      );
    } catch (e: any) {
      Alert.alert('Error', e?.mensaje || 'No se pudo agendar la cita. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader titulo="Agendar cita" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.psicCard}>
          <Avatar nombre={nombre ?? ''} size={52} color={Colors.primary} />
          <View>
            <Text style={styles.psicNombre}>{nombre}</Text>
            <Text style={styles.psicTarifa}>{cop(tarifa ?? '0')} / sesión</Text>
          </View>
        </View>

        <Text style={styles.seccion}>Selecciona la fecha</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fechasScroll}>
          {fechas.map((f, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.fechaBtn, fechaIdx === i && styles.fechaBtnActive]}
              onPress={() => { setFechaIdx(i); setHora(''); }}
            >
              <Text style={[styles.fechaDia, fechaIdx === i && styles.fechaTextActive]}>
                {f.toLocaleDateString('es-CO', { weekday: 'short' })}
              </Text>
              <Text style={[styles.fechaNum, fechaIdx === i && styles.fechaTextActive]}>
                {f.getDate()}
              </Text>
              <Text style={[styles.fechaMes, fechaIdx === i && styles.fechaTextActive]}>
                {f.toLocaleDateString('es-CO', { month: 'short' })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.seccion}>Selecciona el horario</Text>
        <View style={styles.horariosGrid}>
          {HORARIOS.map(h => (
            <TouchableOpacity
              key={h}
              style={[styles.horarioBtn, hora === h && styles.horarioBtnActive]}
              onPress={() => setHora(h)}
            >
              <Text style={[styles.horarioText, hora === h && styles.horarioTextActive]}>{h}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.seccion}>Método de pago</Text>
        <View style={styles.metodoGrid}>
          {METODOS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.metodoBtn, metodo === m.id && styles.metodoBtnActive]}
              onPress={() => setMetodo(m.id)}
            >
              <Text style={styles.metodoIcono}>{m.icono}</Text>
              <Text style={[styles.metodoLabel, metodo === m.id && styles.metodoLabelActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.resumen}>
          <Text style={styles.resumenTitulo}>Resumen</Text>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Fecha</Text>
            <Text style={styles.resumenValor}>
              {fechas[fechaIdx]?.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Hora</Text>
            <Text style={styles.resumenValor}>{hora || '—'}</Text>
          </View>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Duración</Text>
            <Text style={styles.resumenValor}>45 minutos</Text>
          </View>
          <View style={[styles.resumenRow, { marginTop: 4 }]}>
            <Text style={[styles.resumenLabel, { fontWeight: '700' }]}>Total</Text>
            <Text style={[styles.resumenValor, { color: Colors.primary, fontWeight: '700', fontSize: 16 }]}>
              {cop(tarifa ?? '0')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button onPress={confirmar} cargando={loading} variante="primary">
          Confirmar cita
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 100 },
  psicCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 8 },
  psicNombre: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  psicTarifa: { fontSize: 14, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  seccion: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 20, marginBottom: 10 },
  fechasScroll: { marginBottom: 4 },
  fechaBtn: { alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, marginRight: 8, minWidth: 58, backgroundColor: Colors.surface },
  fechaBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  fechaDia: { fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase', fontWeight: '600' },
  fechaNum: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginVertical: 2 },
  fechaMes: { fontSize: 11, color: Colors.textSecondary },
  fechaTextActive: { color: '#fff' },
  horariosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  horarioBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  horarioBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  horarioText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  horarioTextActive: { color: '#fff' },
  metodoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metodoBtn: { flex: 1, minWidth: '45%', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  metodoBtnActive: { borderColor: Colors.primary, backgroundColor: '#F0FDF4' },
  metodoIcono: { fontSize: 24, marginBottom: 4 },
  metodoLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  metodoLabelActive: { color: Colors.primary },
  resumen: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginTop: 20 },
  resumenTitulo: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  resumenRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resumenLabel: { fontSize: 14, color: Colors.textSecondary },
  resumenValor: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
});
