import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { api } from '@/lib/api/client';

interface SalaData {
  url: string;
  token: string;
  nombreSala: string;
  expiraEn: string;
  rol: 'paciente' | 'psicologo';
}

export default function VideollamadaScreen() {
  const { citaId } = useLocalSearchParams<{ citaId: string }>();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sala, setSala] = useState<SalaData | null>(null);
  const [tiempoEspera, setTiempoEspera] = useState(0);
  const [micActivo, setMicActivo] = useState(true);
  const [camaraActiva, setCamaraActiva] = useState(true);
  const intervalo = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!citaId) return;
    api.get<SalaData>(`/citas/${citaId}/sala`)
      .then(data => {
        setSala(data);
        intervalo.current = setInterval(() => setTiempoEspera(t => t + 1), 1000);
      })
      .catch(err => setError(err?.mensaje || 'No se pudo preparar la videollamada.'))
      .finally(() => setCargando(false));

    return () => {
      if (intervalo.current) clearInterval(intervalo.current);
    };
  }, [citaId]);

  function formatTiempo(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  async function unirseALlamada() {
    if (!sala) return;
    const urlConToken = `${sala.url}?t=${sala.token}`;
    const puedeAbrir = await Linking.canOpenURL(urlConToken);
    if (!puedeAbrir) {
      Alert.alert('Error', 'No se pudo abrir la videollamada.');
      return;
    }
    await Linking.openURL(urlConToken);
  }

  function salir() {
    Alert.alert(
      'Salir de la sesión',
      '¿Estás seguro de que quieres abandonar la videollamada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => router.back() },
      ]
    );
  }

  if (cargando) {
    return (
      <View style={styles.conectando}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.conectandoText}>Preparando tu sesión…</Text>
        <Text style={styles.conectandoSub}>Asegúrate de tener buena conexión a internet</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.conectando}>
        <Ionicons name="warning-outline" size={48} color="#F59E0B" />
        <Text style={styles.conectandoText}>No se puede iniciar</Text>
        <Text style={styles.conectandoSub}>{error}</Text>
        <TouchableOpacity style={styles.volverBtn} onPress={() => router.back()}>
          <Text style={styles.volverBtnText}>Volver a mis citas</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Área principal */}
      <View style={styles.camaraRemota}>
        <View style={styles.avatarRemoto}>
          <Ionicons name="person" size={64} color="rgba(255,255,255,0.4)" />
        </View>
        <Text style={styles.esperandoText}>Sala lista · Esperando conexión…</Text>
        <Text style={styles.timerText}>{formatTiempo(tiempoEspera)}</Text>

        {/* Botón principal: unirse */}
        <TouchableOpacity style={styles.unirseBtn} onPress={unirseALlamada}>
          <Ionicons name="videocam" size={22} color="#fff" />
          <Text style={styles.unirseBtnText}>Unirse a la videollamada</Text>
        </TouchableOpacity>

        {sala && (
          <Text style={styles.salaInfo}>
            Sala: {sala.nombreSala} · Rol: {sala.rol}
          </Text>
        )}
      </View>

      {/* Cámara propia (miniatura visual) */}
      <View style={[styles.camaraPropia, !camaraActiva && styles.camaraPropiaOff]}>
        {camaraActiva
          ? <Ionicons name="person" size={24} color="rgba(255,255,255,0.6)" />
          : <Ionicons name="videocam-off" size={24} color="rgba(255,255,255,0.3)" />
        }
      </View>

      {/* Controles */}
      <View style={styles.controles}>
        <TouchableOpacity
          style={[styles.controlBtn, !micActivo && styles.controlBtnOff]}
          onPress={() => setMicActivo(v => !v)}
        >
          <Ionicons name={micActivo ? 'mic' : 'mic-off'} size={24} color="#fff" />
          <Text style={styles.controlLabel}>{micActivo ? 'Micrófono' : 'Sin mic'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlBtn, styles.colgarBtn]} onPress={salir}>
          <Ionicons name="call" size={28} color="#fff" />
          <Text style={styles.controlLabel}>Colgar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, !camaraActiva && styles.controlBtnOff]}
          onPress={() => setCamaraActiva(v => !v)}
        >
          <Ionicons name={camaraActiva ? 'videocam' : 'videocam-off'} size={24} color="#fff" />
          <Text style={styles.controlLabel}>{camaraActiva ? 'Cámara' : 'Sin cámara'}</Text>
        </TouchableOpacity>
      </View>

      {sala && (
        <View style={styles.aviso}>
          <Ionicons name="information-circle" size={16} color="rgba(255,255,255,0.5)" />
          <Text style={styles.avisoText}>
            Sesión ID: {citaId?.slice(-8)} · Expira: {new Date(sala.expiraEn).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  conectando: {
    flex: 1, backgroundColor: '#1E293B',
    justifyContent: 'center', alignItems: 'center', gap: 16, padding: 32,
  },
  conectandoText: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  conectandoSub: { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center' },
  volverBtn: { marginTop: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  volverBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  container: { flex: 1, backgroundColor: '#0F172A' },
  camaraRemota: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  avatarRemoto: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  esperandoText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  timerText: { color: '#fff', fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },

  unirseBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primary, borderRadius: 16,
    paddingHorizontal: 24, paddingVertical: 14, marginTop: 8,
  },
  unirseBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  salaInfo: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 },

  camaraPropia: {
    position: 'absolute', top: 60, right: 16,
    width: 80, height: 110, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
  },
  camaraPropiaOff: { backgroundColor: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.1)' },

  controles: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingVertical: 24, paddingHorizontal: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlBtn: { alignItems: 'center', gap: 6 },
  controlBtnOff: { opacity: 0.5 },
  controlLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  colgarBtn: {
    backgroundColor: '#EF4444', width: 64, height: 64,
    borderRadius: 32, justifyContent: 'center', alignItems: 'center',
  },
  aviso: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'center', paddingBottom: 24,
  },
  avisoText: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
});
