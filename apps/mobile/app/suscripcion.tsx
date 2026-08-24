import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { authService } from '@/lib/api/auth';
import { suscripcionService } from '@/lib/api/suscripcion';
import { LoadingSpinner, ScreenHeader, BottomSheetModal, Button } from '@/components';
import { useModal, useCurrencyFormat } from '@/hooks';

const PLANES = [
  {
    id: 'GRATIS' as const,
    nombre: 'Gratis',
    precio: 0,
    color: '#94A3B8',
    features: ['5 chats IA/mes', '1 test PHQ-9', 'Diario básico'],
  },
  {
    id: 'BASICO' as const,
    nombre: 'Básico',
    precio: 14900,
    color: '#5EEAD4',
    features: ['Chat IA ilimitado', 'Diario completo', 'Todos los tests'],
  },
  {
    id: 'PLUS' as const,
    nombre: 'Plus',
    precio: 25900,
    precioAnual: 259000,
    color: '#10B981',
    popular: true,
    features: ['Todo lo de Básico', 'Resumen IA semanal', 'Ejercicios personalizados', 'Prioridad en respuestas'],
  },
  {
    id: 'FAMILIA' as const,
    nombre: 'Familia',
    precio: 44900,
    color: '#3B82F6',
    features: ['Todo lo de Plus', 'Hasta 5 miembros', 'Dashboard familiar'],
  },
];

const METODOS_PAGO = [
  { id: 'PSE' as const, label: 'PSE', icono: 'business-outline' as const },
  { id: 'NEQUI' as const, label: 'Nequi', icono: 'phone-portrait-outline' as const },
  { id: 'TARJETA' as const, label: 'Tarjeta', icono: 'card-outline' as const },
  { id: 'DAVIPLATA' as const, label: 'Daviplata', icono: 'wallet-outline' as const },
];

type MetodoPago = 'PSE' | 'NEQUI' | 'TARJETA' | 'DAVIPLATA';
type PlanId = 'BASICO' | 'PLUS' | 'FAMILIA';
type Ciclo = 'MENSUAL' | 'ANUAL';

export default function SuscripcionScreen() {
  const [planActual, setPlanActual] = useState('GRATIS');
  const [loading, setLoading] = useState(true);
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanId | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('PSE');
  const [ciclo, setCiclo] = useState<Ciclo>('MENSUAL');
  const [procesando, setProcesando] = useState(false);
  const pagoModal = useModal();
  const { cop } = useCurrencyFormat();

  useEffect(() => {
    authService.getUsuario()
      .then(u => setPlanActual(u.plan))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function iniciarUpgrade() {
    if (!planSeleccionado) return;
    setProcesando(true);
    try {
      const resultado = await suscripcionService.iniciarPago(planSeleccionado, metodoPago, ciclo);
      const url = suscripcionService.construirUrlCheckout(resultado.datosWidget);
      const puedeAbrir = await Linking.canOpenURL(url);
      if (!puedeAbrir) {
        Alert.alert('Error', 'No se pudo abrir la pasarela de pagos.');
        return;
      }
      pagoModal.cerrar();
      await Linking.openURL(url);
    } catch (error: any) {
      Alert.alert('Error', error?.mensaje || 'No se pudo iniciar el pago. Intenta de nuevo.');
    } finally {
      setProcesando(false);
    }
  }

  function abrirModal(planId: PlanId) {
    setPlanSeleccionado(planId);
    setCiclo('MENSUAL');
    pagoModal.abrir();
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader titulo="Suscripción" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Tu plan actual: <Text style={{ color: Colors.primary, fontWeight: '700' }}>{planActual}</Text>
        </Text>

        {PLANES.map(plan => {
          const esActual = plan.id === planActual;
          return (
            <View key={plan.id} style={[styles.planCard, esActual && styles.planCardActual, { borderColor: esActual ? plan.color : Colors.border }]}>
              {plan.popular && (
                <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                  <Text style={styles.popularText}>Más popular</Text>
                </View>
              )}
              <View style={styles.planTop}>
                <Text style={[styles.planNombre, { color: plan.color }]}>{plan.nombre}</Text>
                {esActual && (
                  <View style={[styles.actualBadge, { backgroundColor: plan.color + '20' }]}>
                    <Text style={[styles.actualText, { color: plan.color }]}>Plan actual</Text>
                  </View>
                )}
              </View>
              <Text style={styles.planPrecio}>
                {plan.precio === 0 ? 'Gratis' : `${cop(plan.precio)}/mes`}
              </Text>
              <View style={styles.featuresList}>
                {plan.features.map(f => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={plan.color} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              {!esActual && plan.precio > 0 && (
                <TouchableOpacity
                  style={[styles.upgradeBtn, { backgroundColor: plan.color }]}
                  onPress={() => abrirModal(plan.id as PlanId)}
                >
                  <Ionicons name="arrow-up-circle-outline" size={18} color="#fff" />
                  <Text style={styles.upgradeBtnText}>Cambiar a {plan.nombre}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <Text style={styles.nota}>
          Los planes se cobran mensualmente. Puedes cancelar en cualquier momento.
          Precios en pesos colombianos (COP) incluyen IVA.
        </Text>
      </ScrollView>

      {/* Modal de selección de método de pago */}
      <BottomSheetModal
        visible={pagoModal.visible}
        titulo="Método de pago"
        onCerrar={pagoModal.cerrar}
      >
        <Text style={styles.modalSub}>
          Selecciona cómo quieres pagar el plan{' '}
          <Text style={{ fontWeight: '700' }}>
            {PLANES.find(p => p.id === planSeleccionado)?.nombre}
          </Text>
        </Text>

        {PLANES.find(p => p.id === planSeleccionado)?.precioAnual && (
          <View style={styles.cicloGrid}>
            <TouchableOpacity
              style={[styles.cicloBtn, ciclo === 'MENSUAL' && styles.cicloBtnActivo]}
              onPress={() => setCiclo('MENSUAL')}
            >
              <Text style={[styles.cicloLabel, ciclo === 'MENSUAL' && styles.cicloLabelActivo]}>Mensual</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cicloBtn, ciclo === 'ANUAL' && styles.cicloBtnActivo]}
              onPress={() => setCiclo('ANUAL')}
            >
              <Text style={[styles.cicloLabel, ciclo === 'ANUAL' && styles.cicloLabelActivo]}>Anual · 2 meses gratis</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.metodosGrid}>
          {METODOS_PAGO.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.metodoBtn, metodoPago === m.id && styles.metodoBtnActivo]}
              onPress={() => setMetodoPago(m.id)}
            >
              <Ionicons
                name={m.icono}
                size={24}
                color={metodoPago === m.id ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.metodoLabel, metodoPago === m.id && styles.metodoLabelActivo]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button onPress={iniciarUpgrade} cargando={procesando} variante="primary">
          {(() => {
            const p = PLANES.find(pl => pl.id === planSeleccionado);
            const monto = ciclo === 'ANUAL' && p?.precioAnual ? p.precioAnual : p?.precio ?? 0;
            return `Pagar ${cop(monto)} con Wompi`;
          })()}
        </Button>

        <Text style={styles.seguridadNota}>
          Pago seguro procesado por Wompi · SSL cifrado
        </Text>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  intro: { fontSize: 15, color: Colors.textSecondary, marginBottom: 20, textAlign: 'center' },
  planCard: { backgroundColor: Colors.surface, borderRadius: 18, padding: 20, marginBottom: 14, borderWidth: 2 },
  planCardActual: { elevation: 3 },
  popularBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  popularText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  planNombre: { fontSize: 20, fontWeight: '800' },
  actualBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  actualText: { fontSize: 12, fontWeight: '600' },
  planPrecio: { fontSize: 15, color: Colors.textSecondary, marginBottom: 16 },
  featuresList: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, color: Colors.textPrimary },
  upgradeBtn: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  nota: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  modalSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  cicloGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  cicloBtn: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.surface },
  cicloBtnActivo: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  cicloLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  cicloLabelActivo: { color: Colors.primary },
  metodosGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  metodoBtn: { flex: 1, alignItems: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.surface },
  metodoBtnActivo: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  metodoLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  metodoLabelActivo: { color: Colors.primary },
  seguridadNota: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', marginTop: 12 },
});
