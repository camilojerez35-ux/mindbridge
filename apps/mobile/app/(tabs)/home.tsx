import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { homeService, ConsejoDiario } from '@/lib/api/home';
import { statsService } from '@/lib/api/stats';
import { LoadingSpinner, BottomSheetModal } from '@/components';
import { useModal } from '@/hooks';
import { useAuthStore } from '@/store';

const EMOJIS = ['😢','😞','😕','😐','🙂','😊','😃','😄','🥰','🤩'];

const RECURSOS_CRISIS = [
  { nombre: 'Línea 106 (Nacional)', numero: '106', icon: 'call' as const },
  { nombre: 'Emergencias', numero: '123', icon: 'medkit' as const },
  { nombre: 'Cruz Roja', numero: '132', icon: 'heart' as const },
];

export default function HomeScreen() {
  const { usuario } = useAuthStore();
  const nombre = usuario?.nombre.split(' ')[0] ?? '';
  const [consejo, setConsejo] = useState<ConsejoDiario | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [animoSeleccionado, setAnimoSeleccionado] = useState<number | null>(null);
  const [animoGuardado, setAnimoGuardado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const crisisModal = useModal();

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      const [consejoDia, statsData] = await Promise.all([
        homeService.getConsejo(),
        statsService.getStats().catch(() => null),
      ]);
      setConsejo(consejoDia);
      setStats(statsData);
    } catch {
      // carga parcial — no bloquea la pantalla
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleRegistrarAnimo(valor: number) {
    setAnimoSeleccionado(valor);
    try {
      await homeService.registrarAnimo(valor);
      setAnimoGuardado(true);
    } catch (err: any) {
      console.warn('[Home] Error registrando ánimo:', err?.message);
    }
  }

  function llamar(numero: string) {
    Linking.openURL(`tel:${numero}`);
  }

  if (loading) {
    return <LoadingSpinner texto="Cargando..." />;
  }

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargarDatos(); }} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{saludo}{nombre ? `, ${nombre}` : ''} 👋</Text>
            <Text style={styles.subtitle}>¿Cómo te sientes hoy?</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={crisisModal.abrir}>
            <Ionicons name="call" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>

        {/* Stats rápidas */}
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{stats.diasActivo}</Text>
              <Text style={styles.statLbl}>días activo</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{stats.entradasMes}</Text>
              <Text style={styles.statLbl}>entradas mes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: Colors.primary }]}>
                {stats.animoPromedio ? parseFloat(stats.animoPromedio).toFixed(1) : '—'}
              </Text>
              <Text style={styles.statLbl}>ánimo prom.</Text>
            </View>
          </View>
        )}

        {/* Registro de ánimo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tu ánimo de hoy</Text>
          {animoGuardado ? (
            <View style={styles.animoGuardado}>
              <Text style={styles.animoEmoji}>{EMOJIS[(animoSeleccionado ?? 5) - 1]}</Text>
              <Text style={styles.animoGuardadoText}>¡Registrado! Gracias por compartir.</Text>
              <TouchableOpacity onPress={() => router.push('/estadisticas' as any)}>
                <Text style={styles.verProgreso}>Ver mi progreso →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.animoHint}>Toca cómo te sientes ahora mismo</Text>
              <View style={styles.emojiRow}>
                {EMOJIS.map((emoji, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleRegistrarAnimo(i + 1)}
                    style={[styles.emojiBtn, animoSeleccionado === i + 1 && styles.emojiBtnSelected]}
                  >
                    <Text style={styles.emoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Consejo del día */}
        {consejo && (
          <View style={[styles.card, styles.consejoCard]}>
            <View style={styles.consejoHeader}>
              <Text style={styles.consejoIcono}>{consejo.icono}</Text>
              <View style={styles.consejoHeaderText}>
                <Text style={styles.consejoCategoria}>{consejo.categoria?.toUpperCase()}</Text>
                <Text style={styles.consejoTitulo}>{consejo.titulo}</Text>
              </View>
            </View>
            <Text style={styles.consejoContenido}>{consejo.contenido}</Text>
          </View>
        )}

        {/* Accesos rápidos */}
        <Text style={styles.seccionTitulo}>Acceso rápido</Text>

        <View style={styles.accesoGrid}>
          {[
            { icon: 'chatbubbles', color: '#EDE9FE', iconColor: '#7C3AED', titulo: 'Chat IA', desc: 'Apoyo 24/7', ruta: '/(tabs)/chat' },
            { icon: 'book', color: '#FEF3C7', iconColor: '#D97706', titulo: 'Diario', desc: 'Registra emociones', ruta: '/(tabs)/diario' },
            { icon: 'people', color: '#DCFCE7', iconColor: '#16A34A', titulo: 'Psicólogos', desc: 'Profesionales', ruta: '/(tabs)/psicologos' },
            { icon: 'bar-chart', color: '#EFF6FF', iconColor: '#2563EB', titulo: 'Progreso', desc: 'Tus estadísticas', ruta: '/estadisticas' },
          ].map(item => (
            <TouchableOpacity
              key={item.titulo}
              style={styles.accesoCard}
              onPress={() => router.push(item.ruta as any)}
            >
              <View style={[styles.accesoIcono, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
              </View>
              <Text style={styles.accesoTitulo}>{item.titulo}</Text>
              <Text style={styles.accesoDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Crisis banner */}
        <TouchableOpacity style={styles.crisisBanner} onPress={crisisModal.abrir}>
          <Ionicons name="heart-half" size={18} color={Colors.crisis} />
          <Text style={styles.crisisBannerText}>¿Estás en crisis? Líneas de ayuda disponibles ahora</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.crisis} />
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de crisis */}
      <BottomSheetModal
        visible={crisisModal.visible}
        titulo="🆘 Líneas de ayuda"
        onCerrar={crisisModal.cerrar}
      >
        <Text style={styles.crisisModalDesc}>
          Si estás viviendo una crisis emocional, hay personas disponibles ahora mismo para apoyarte. No estás solo/a.
        </Text>
        <View style={styles.crisisLineas}>
          {RECURSOS_CRISIS.map(r => (
            <TouchableOpacity key={r.numero} style={styles.crisisLinea} onPress={() => llamar(r.numero)}>
              <View style={styles.crisisLineaIcon}>
                <Ionicons name={r.icon} size={20} color={Colors.crisis} />
              </View>
              <View style={styles.crisisLineaTexto}>
                <Text style={styles.crisisLineaNombre}>{r.nombre}</Text>
                <Text style={styles.crisisLineaNum}>Llamar al {r.numero}</Text>
              </View>
              <Ionicons name="call-outline" size={18} color={Colors.crisis} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.crisisChatBtn} onPress={() => { crisisModal.cerrar(); router.push('/(tabs)/chat'); }}>
          <Ionicons name="chatbubbles" size={18} color="#fff" />
          <Text style={styles.crisisChatBtnText}>Hablar con la IA ahora</Text>
        </TouchableOpacity>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 32 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 60,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FECACA',
    justifyContent: 'center', alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  statLbl: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 18, marginHorizontal: 16, marginBottom: 12, elevation: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  animoHint: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emojiBtn: { padding: 5, borderRadius: 10 },
  emojiBtnSelected: { backgroundColor: '#F0FDF4' },
  emoji: { fontSize: 26 },
  animoGuardado: { alignItems: 'center', paddingVertical: 8, gap: 6 },
  animoEmoji: { fontSize: 52 },
  animoGuardadoText: { color: Colors.textSecondary, fontSize: 14 },
  verProgreso: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  consejoCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' },
  consejoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  consejoIcono: { fontSize: 30, marginRight: 12 },
  consejoHeaderText: { flex: 1 },
  consejoCategoria: { fontSize: 10, color: Colors.primary, fontWeight: '700', letterSpacing: 0.8 },
  consejoTitulo: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  consejoContenido: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  seccionTitulo: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginHorizontal: 16, marginBottom: 10 },
  accesoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  accesoCard: {
    width: '47%', backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    alignItems: 'flex-start', borderWidth: 1, borderColor: Colors.border,
  },
  accesoIcono: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  accesoTitulo: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  accesoDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  crisisBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, backgroundColor: '#FFF5F5', borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: '#FECACA',
  },
  crisisBannerText: { flex: 1, fontSize: 13, color: Colors.crisis, fontWeight: '500' },
  crisisModalDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 20 },
  crisisLineas: { gap: 10, marginBottom: 20 },
  crisisLinea: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFF5F5', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FECACA',
  },
  crisisLineaIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  crisisLineaTexto: { flex: 1 },
  crisisLineaNombre: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  crisisLineaNum: { fontSize: 12, color: Colors.crisis, fontWeight: '600', marginTop: 2 },
  crisisChatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#7C3AED', borderRadius: 14, padding: 14,
  },
  crisisChatBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
