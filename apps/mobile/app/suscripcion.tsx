import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Modal, Linking, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { authService } from '@/lib/api/auth';
import { suscripcionService } from '@/lib/api/suscripcion';

const PLANES = [
  {
    id: 'GRATIS' as const,
    nombre: 'Gratis',
    precio: 0,
    color: '#94A3B8',
    features: ['5 sesiones de chat IA/mes', 'Diario emocional', 'Tests básicos'],
  },
  {
    id: 'PLUS' as const,
    nombre: 'Plus',
    precio: 49900,
    color: '#10B981',
    popular: true,
    features: ['Chat IA ilimitado', 'Diario emocional', 'Todos los tests', '1 cita con psicólogo/mes', 'Análisis de progreso'],
  },
  {
    id: 'FAMILIA' as const,
    nombre: 'Familia',
    precio: 89900,
    color: '#3B82F6',
    features: ['Todo lo de Plus', 'Hasta 4 miembros', '3 citas/mes por miembro', 'Sesiones grupales'],
  },
];

const METODOS_PAGO = [
  { id: 'PSE' as const, label: 'PSE', icono: 'business-outline' as const },
  { id: 'NEQUI' as const, label: 'Nequi', icono: 'phone-portrait-outline' as const },
  { id: 'TARJETA' as const, label: 'Tarjeta', icono: 'card-outline' as const },
  { id: 'DAVIPLATA' as const, label: 'Daviplata', icono: 'wallet-outline' as const },
];

type MetodoPago = 'PSE' | 'NEQUI' | 'TARJETA' | 'DAVIPLATA';
type PlanId = 'PLUS' | 'FAMILIA';

export default function SuscripcionScreen() {
  const [planActual, setPlanActual] = useState('GRATIS');
  const [loading, setLoading] = useState(true);
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanId | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('PSE');
  const [modalVisible, setModalVisible] = useState(false);
  const [procesando, setProcesando] = useState(false);

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
      const resultado = await suscripcionService.iniciarPago(planSeleccionado, metodoPago);
      const url = suscripcionService.construirUrlCheckout(resultado.datosWidget);
      const puedeAbrir = await Linking.canOpenURL(url);
      if (!puedeAbrir) {
        Alert.alert('Error', 'No se pudo abrir la pasarela de pagos.');
        return;
      }
      setModalVisible(false);
      await Linking.openURL(url);
    } catch (error: any) {
      Alert.alert('Error', error?.mensaje || 'No se pudo iniciar el pago. Intenta de nuevo.');
    } finally {
      setProcesando(false);
    }
  }

  function abrirModal(planId: PlanId) {
    setPlanSeleccionado(planId);
    setModalVisible(true);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Suscripción</Text>
        <View style={{ width: 24 }} />
      </View>

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
                {plan.precio === 0 ? 'Gratis' : `$${plan.precio.toLocaleString('es-CO')} COP/mes`}
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
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Método de pago</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Selecciona cómo quieres pagar el plan{' '}
              <Text style={{ fontWeight: '700' }}>
                {PLANES.find(p => p.id === planSeleccionado)?.nombre}
              </Text>
            </Text>

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

            <TouchableOpacity
              style={[styles.pagarBtn, procesando && styles.pagarBtnDisabled]}
              onPress={iniciarUpgrade}
              disabled={procesando}
            >
              {procesando
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Ionicons name="lock-closed" size={18} color="#fff" />
                    <Text style={styles.pagarBtnText}>Ir a pagar con Wompi</Text>
                  </>
              }
            </TouchableOpacity>

            <Text style={styles.seguridadNota}>
              Pago seguro procesado por Wompi · SSL cifrado
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  titulo: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitulo: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  modalSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  metodosGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  metodoBtn: { flex: 1, alignItems: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.surface },
  metodoBtnActivo: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  metodoLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  metodoLabelActivo: { color: Colors.primary },
  pagarBtn: { backgroundColor: Colors.primary, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  pagarBtnDisabled: { backgroundColor: Colors.border },
  pagarBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  seguridadNota: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', marginTop: 12 },
});
