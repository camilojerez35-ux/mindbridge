import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { citasService } from '@/lib/api/citas';
import { psicologosService, SlotDisponible } from '@/lib/api/psicologos';
import { Avatar, ScreenHeader, Button, LoadingSpinner, ErrorState } from '@/components';
import { useCurrencyFormat } from '@/hooks';

const METODOS = [
  { id: 'NEQUI', label: 'Nequi', icono: '📱' },
  { id: 'PSE', label: 'PSE', icono: '🏦' },
  { id: 'TARJETA', label: 'Tarjeta', icono: '💳' },
  { id: 'DAVIPLATA', label: 'Daviplata', icono: '💜' },
] as const;

const DIAS_ES: Record<string, string> = {
  lunes: 'Lun', martes: 'Mar', miercoles: 'Mié',
  jueves: 'Jue', viernes: 'Vie',
};

export default function AgendarCitaScreen() {
  const { psicologoId, nombre, tarifa } = useLocalSearchParams<{
    psicologoId: string; nombre: string; tarifa: string;
  }>();
  const { cop } = useCurrencyFormat();

  const [slots, setSlots] = useState<SlotDisponible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [slotIdx, setSlotIdx] = useState(0);
  const [hora, setHora] = useState('');
  const [metodo, setMetodo] = useState<'PSE' | 'TARJETA' | 'NEQUI' | 'DAVIPLATA'>('NEQUI');
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    cargarSlots();
  }, [psicologoId]);

  async function cargarSlots() {
    try {
      setError('');
      const { slots: s } = await psicologosService.getPerfilConSlots(psicologoId);
      setSlots(s);
      setSlotIdx(0);
      setHora('');
    } catch {
      setError('No se pudo cargar la disponibilidad. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function confirmar() {
    if (!hora) {
      Alert.alert('Selecciona un horario', 'Elige la hora para tu cita.');
      return;
    }
    const slotActual = slots[slotIdx];
    const [h, m] = hora.split(':').map(Number);
    const fechaHora = new Date(`${slotActual.fecha}T${hora}:00`);
    fechaHora.setHours(h, m, 0, 0);

    setConfirmando(true);
    try {
      await citasService.agendarCita({
        psicologoId,
        fechaHora: fechaHora.toISOString(),
        metodoPago: metodo,
      });
      Alert.alert(
        '¡Cita agendada!',
        `Tu cita con ${nombre} fue registrada para el ${slotActual.fecha} a las ${hora}. Recibirás confirmación por email.`,
        [{ text: 'Ver mis citas', onPress: () => router.replace('/citas' as any) }]
      );
    } catch (e: any) {
      Alert.alert('Error', e?.mensaje || 'No se pudo agendar la cita. Intenta de nuevo.');
    } finally {
      setConfirmando(false);
    }
  }

  if (loading) return <LoadingSpinner texto="Cargando disponibilidad..." />;
  if (error) return <ErrorState mensaje={error} onReintentar={cargarSlots} />;

  const slotActual = slots[slotIdx];

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

        {slots.length === 0 ? (
          <View style={styles.sinDisponibilidad}>
            <Text style={styles.sinDisponibilidadEmoji}>📅</Text>
            <Text style={styles.sinDisponibilidadTitulo}>Sin disponibilidad</Text>
            <Text style={styles.sinDisponibilidadDesc}>
              Este psicólogo no tiene horarios disponibles para los próximos 14 días hábiles.
            </Text>
            <Button onPress={() => router.back()} variante="outline">
              Volver
            </Button>
          </View>
        ) : (
          <>
            <Text style={styles.seccion}>Selecciona la fecha</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fechasScroll}>
              {slots.map((slot, i) => {
                const [, , dia] = slot.fecha.split('-');
                return (
                  <TouchableOpacity
                    key={slot.fecha}
                    style={[styles.fechaBtn, slotIdx === i && styles.fechaBtnActive]}
                    onPress={() => { setSlotIdx(i); setHora(''); }}
                  >
                    <Text style={[styles.fechaDia, slotIdx === i && styles.fechaTextActive]}>
                      {DIAS_ES[slot.diaNombre] ?? slot.diaNombre.slice(0, 3)}
                    </Text>
                    <Text style={[styles.fechaNum, slotIdx === i && styles.fechaTextActive]}>
                      {parseInt(dia, 10)}
                    </Text>
                    <Text style={[styles.fechaDisp, slotIdx === i && styles.fechaTextActive]}>
                      {slot.horas.length}h
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.seccion}>Selecciona el horario</Text>
            {slotActual ? (
              <View style={styles.horariosGrid}>
                {slotActual.horas.map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.horarioBtn, hora === h && styles.horarioBtnActive]}
                    onPress={() => setHora(h)}
                  >
                    <Text style={[styles.horarioText, hora === h && styles.horarioTextActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

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
                  {slotActual
                    ? new Date(slotActual.fecha + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
                    : '—'}
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
          </>
        )}
      </ScrollView>

      {slots.length > 0 && (
        <View style={styles.footer}>
          <Button onPress={confirmar} cargando={confirmando} variante="primary">
            Confirmar cita
          </Button>
        </View>
      )}
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
  fechaDisp: { fontSize: 10, color: Colors.textSecondary },
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
  sinDisponibilidad: { alignItems: 'center', padding: 40, gap: 12, marginTop: 40 },
  sinDisponibilidadEmoji: { fontSize: 56 },
  sinDisponibilidadTitulo: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  sinDisponibilidadDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
