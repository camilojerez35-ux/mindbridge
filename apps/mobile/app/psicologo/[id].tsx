import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { psicologosService, Psicologo } from '@/lib/api/psicologos';
import { LoadingSpinner, ScreenHeader, Avatar, Badge, Button } from '@/components';
import { useCurrencyFormat } from '@/hooks';

export default function DetallePsicologoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [psicologo, setPsicologo] = useState<Psicologo | null>(null);
  const [loading, setLoading] = useState(true);
  const { cop } = useCurrencyFormat();

  useEffect(() => { cargar(); }, [id]);

  async function cargar() {
    try {
      const data = await psicologosService.getPsicologo(id!);
      setPsicologo(data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el perfil', [{ text: 'Volver', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!psicologo) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.textSecondary }}>Psicólogo no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: Colors.primary }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader titulo="Perfil del psicólogo" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <Avatar nombre={psicologo.nombre} size={80} color={Colors.primary} />
          <View style={styles.nombreRow}>
            <Text style={styles.nombre}>{psicologo.nombre}</Text>
            {psicologo.verificado && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            )}
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={15} color="#F59E0B" />
            <Text style={styles.rating}>{psicologo.calificacionPromedio.toFixed(1)}</Text>
            <Text style={styles.ratingTotal}>· {psicologo.totalSesiones} sesiones</Text>
          </View>
          <Text style={styles.tarifa}>
            {cop(psicologo.tarifaSesion)} / sesión
          </Text>
        </View>

        {/* Especialidades */}
        {psicologo.especialidades.length > 0 && (
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Especialidades</Text>
            <View style={styles.tagsWrap}>
              {psicologo.especialidades.map(e => (
                <Badge key={e} texto={e} color={Colors.primary} variante="soft" />
              ))}
            </View>
          </View>
        )}

        {/* Modalidades */}
        {psicologo.modalidades.length > 0 && (
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Modalidades de atención</Text>
            <View style={styles.modalidadesRow}>
              {psicologo.modalidades.includes('VIDEOLLAMADA') && (
                <View style={styles.modalidadChip}>
                  <Ionicons name="videocam" size={16} color={Colors.primary} />
                  <Text style={styles.modalidadText}>Videollamada</Text>
                </View>
              )}
              {psicologo.modalidades.includes('PRESENCIAL') && (
                <View style={styles.modalidadChip}>
                  <Ionicons name="location" size={16} color={Colors.primary} />
                  <Text style={styles.modalidadText}>Presencial</Text>
                </View>
              )}
              {psicologo.modalidades.includes('CHAT') && (
                <View style={styles.modalidadChip}>
                  <Ionicons name="chatbubbles" size={16} color={Colors.primary} />
                  <Text style={styles.modalidadText}>Chat</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Sobre mí */}
        {psicologo.bio && (
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Sobre mí</Text>
            <Text style={styles.bio}>{psicologo.bio}</Text>
          </View>
        )}

        {/* Info adicional */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>Psicólogo verificado por MindBridge</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="lock-closed" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>Sesiones 100% confidenciales</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>Duración: 45 minutos por sesión</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          onPress={() => router.push({
            pathname: '/agendar/[psicologoId]',
            params: { psicologoId: psicologo.id, nombre: psicologo.nombre, tarifa: String(psicologo.tarifaSesion) },
          })}
          variante="primary"
        >
          Agendar cita
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 100 },
  hero: { alignItems: 'center', marginBottom: 24, gap: 6 },
  nombreRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nombre: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  ratingTotal: { fontSize: 14, color: Colors.textSecondary },
  tarifa: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  seccion: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 12 },
  seccionTitulo: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalidadesRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  modalidadChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FDF4', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  modalidadText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  bio: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  infoCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, color: Colors.textPrimary },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border,
  },
});
