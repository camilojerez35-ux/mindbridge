import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, ScrollView, Linking, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { api } from '@/lib/api/client';
import { Button } from '@/components';
import { useSecureToken } from '@/hooks';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🧠',
    titulo: 'Tu bienestar mental, inteligente',
    desc: 'MenteBridge combina IA clínica con psicólogos certificados para acompañarte 24/7.',
    bg: '#F0FDF4',
    accent: '#10B981',
  },
  {
    emoji: '💬',
    titulo: 'Habla cuando lo necesites',
    desc: 'Nuestra IA está disponible a cualquier hora. Sin juicios, solo apoyo real y empático.',
    bg: '#EFF6FF',
    accent: '#3B82F6',
  },
  {
    emoji: '📓',
    titulo: 'Conoce tus emociones',
    desc: 'Registra tu ánimo y escribe en tu diario. Entiende tus patrones y crece cada día.',
    bg: '#FFF7ED',
    accent: '#F59E0B',
  },
  {
    emoji: '👨‍⚕️',
    titulo: 'Psicólogos certificados',
    desc: 'Agenda citas con profesionales verificados cuando quieras ir más a fondo.',
    bg: '#FDF4FF',
    accent: '#A855F7',
  },
];

const VERSION = '1.0.0';

export default function OnboardingScreen() {
  const [indice, setIndice] = useState(0);
  const [enConsentimiento, setEnConsentimiento] = useState(false);
  const [privacidad, setPrivacidad] = useState(false);
  const [terminosUso, setTerminosUso] = useState(false);
  const [usaIA, setUsaIA] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const { valor: sessionToken } = useSecureToken('session_token');
  const { guardar: guardarConsentimiento } = useSecureToken('consentimiento_dado');
  const { guardar: guardarOnboarding } = useSecureToken('onboarding_done');

  function siguiente() {
    if (indice < SLIDES.length - 1) {
      const next = indice + 1;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setIndice(next);
    } else {
      setEnConsentimiento(true);
    }
  }

  function abrirUrl(url: string) {
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'No se pudo abrir el enlace')
    );
  }

  async function aceptarYContinuar() {
    if (!privacidad || !terminosUso || !usaIA) return;
    setGuardando(true);
    try {
      if (sessionToken) {
        await api.post('/consentimiento', {
          privacidad: true,
          terminosUso: true,
          usaIA: true,
          marketing,
          version: VERSION,
        }).catch(() => {}); // si falla en red, guardamos local y reintentamos en login
      }
      await guardarConsentimiento(VERSION);
      await guardarOnboarding('1');
      router.replace('/(auth)/login');
    } catch {
      Alert.alert('Error', 'No se pudo guardar el consentimiento. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  const puedeAceptar = privacidad && terminosUso && usaIA;

  if (enConsentimiento) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.consentContent}>
        {/* Header */}
        <View style={styles.consentHeader}>
          <View style={styles.consentIcono}>
            <Ionicons name="shield-checkmark" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.consentTitulo}>Antes de comenzar</Text>
          <Text style={styles.consentSubtitulo}>
            Para protegerte a ti y cumplir con la ley colombiana, necesitamos tu autorización.
          </Text>
        </View>

        {/* Aviso IA — especial */}
        <View style={styles.iaAviso}>
          <View style={styles.iaAvisoHeader}>
            <Ionicons name="warning-outline" size={18} color="#D97706" />
            <Text style={styles.iaAvisoTitulo}>Importante sobre la IA</Text>
          </View>
          <Text style={styles.iaAvisoTexto}>
            MenteBridge usa Inteligencia Artificial para acompañamiento emocional.{'\n\n'}
            <Text style={styles.iaAvisoNegrita}>✅ La IA puede:</Text> escucharte, enseñarte técnicas, detectar crisis y conectarte con ayuda.{'\n\n'}
            <Text style={styles.iaAvisoNegrita}>❌ La IA NO puede:</Text> diagnosticarte, prescribir medicamentos ni reemplazar a un psicólogo.{'\n\n'}
            En caso de emergencia: <Text style={styles.iaAvisoLink} onPress={() => Linking.openURL('tel:106')}>Línea 106</Text> · <Text style={styles.iaAvisoLink} onPress={() => Linking.openURL('tel:123')}>123</Text>
          </Text>
        </View>

        {/* Checkboxes */}
        <View style={styles.checksContainer}>
          <CheckItem
            checked={privacidad}
            onToggle={() => setPrivacidad(v => !v)}
            obligatorio
          >
            <Text style={styles.checkTexto}>
              Acepto la{' '}
              <Text style={styles.checkLink} onPress={() => abrirUrl('https://mentebridge.com/politica-privacidad')}>
                Política de Privacidad
              </Text>
              {' '}(Ley 1581/2012 · datos de salud mental)
            </Text>
          </CheckItem>

          <CheckItem
            checked={terminosUso}
            onToggle={() => setTerminosUso(v => !v)}
            obligatorio
          >
            <Text style={styles.checkTexto}>
              Acepto los{' '}
              <Text style={styles.checkLink} onPress={() => abrirUrl('https://mentebridge.com/terminos-uso')}>
                Términos de Uso
              </Text>
              {' '}del servicio
            </Text>
          </CheckItem>

          <CheckItem
            checked={usaIA}
            onToggle={() => setUsaIA(v => !v)}
            obligatorio
          >
            <Text style={styles.checkTexto}>
              Entiendo que MenteBridge usa IA y acepto el{' '}
              <Text style={styles.checkLink} onPress={() => abrirUrl('https://mentebridge.com/aviso-ia')}>
                Aviso de Uso de IA
              </Text>
              {' '}(Resolución 2654/2019)
            </Text>
          </CheckItem>

          <CheckItem
            checked={marketing}
            onToggle={() => setMarketing(v => !v)}
            obligatorio={false}
          >
            <Text style={styles.checkTexto}>
              (Opcional) Acepto recibir contenido educativo y novedades de MenteBridge
            </Text>
          </CheckItem>
        </View>

        {/* Nota legal */}
        <Text style={styles.notaLegal}>
          Tus datos de salud mental son tratados con cifrado AES-256 y máxima confidencialidad según la Ley 1581/2012. Puedes retirar tu consentimiento en cualquier momento desde Configuración.
        </Text>

        {/* Botón aceptar */}
        <Button
          onPress={aceptarYContinuar}
          cargando={guardando}
          disabled={!puedeAceptar}
          variante="primary"
        >
          Aceptar y comenzar
        </Button>

        {!puedeAceptar && (
          <Text style={styles.faltaTexto}>
            Debes aceptar los 3 campos obligatorios para continuar
          </Text>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={() => setEnConsentimiento(true)}>
        <Text style={styles.skipText}>Omitir</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width, backgroundColor: item.bg }]}>
            <Text style={styles.slideEmoji}>{item.emoji}</Text>
            <Text style={styles.slideTitulo}>{item.titulo}</Text>
            <Text style={styles.slideDesc}>{item.desc}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === indice && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.btn} onPress={siguiente}>
          <Text style={styles.btnText}>
            {indice < SLIDES.length - 1 ? 'Siguiente' : 'Ver condiciones'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CheckItem({
  checked, onToggle, obligatorio, children,
}: {
  checked: boolean;
  onToggle: () => void;
  obligatorio: boolean;
  children: React.ReactNode;
}) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <View style={styles.checkContent}>
        {obligatorio && (
          <Text style={styles.checkObligatorio}>OBLIGATORIO</Text>
        )}
        {children}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Slides
  skipBtn: { position: 'absolute', top: 56, right: 24, zIndex: 10 },
  skipText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, paddingTop: 100 },
  slideEmoji: { fontSize: 80, marginBottom: 32 },
  slideTitulo: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: 16, lineHeight: 34 },
  slideDesc: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  footer: { padding: 24, paddingBottom: 48, backgroundColor: Colors.background, gap: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { width: 24, backgroundColor: Colors.primary },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Consentimiento
  consentContent: { padding: 24, paddingTop: 60, paddingBottom: 48 },
  consentHeader: { alignItems: 'center', marginBottom: 24 },
  consentIcono: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  consentTitulo: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  consentSubtitulo: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: 8 },

  iaAviso: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FDE68A', marginBottom: 24 },
  iaAvisoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  iaAvisoTitulo: { fontSize: 14, fontWeight: '700', color: '#D97706' },
  iaAvisoTexto: { fontSize: 13, color: '#78350F', lineHeight: 20 },
  iaAvisoNegrita: { fontWeight: '700' },
  iaAvisoLink: { color: Colors.error, fontWeight: '700', textDecorationLine: 'underline' },

  checksContainer: { gap: 16, marginBottom: 24 },
  checkRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center', marginTop: 2, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkContent: { flex: 1, gap: 3 },
  checkObligatorio: { fontSize: 10, color: Colors.primary, fontWeight: '700', letterSpacing: 0.5 },
  checkTexto: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  checkLink: { color: Colors.primary, fontWeight: '600', textDecorationLine: 'underline' },

  notaLegal: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, textAlign: 'center', marginBottom: 24, backgroundColor: Colors.surface, borderRadius: 12, padding: 14 },
  faltaTexto: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: 12 },
});
