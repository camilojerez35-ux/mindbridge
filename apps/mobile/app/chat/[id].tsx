import { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView,
  Platform, Alert, Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { chatService, Mensaje } from '@/lib/api/chat';
import { LoadingSpinner } from '@/components';
import { useSecureToken } from '@/hooks';

const DISCLAIMER_KEY = 'chat_disclaimer_dismissed';

export default function ChatSesionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { valor: disclaimerDismissed, guardar: guardarDisclaimer } = useSecureToken(DISCLAIMER_KEY);

  useEffect(() => {
    cargarMensajes();
  }, [id]);

  useEffect(() => {
    if (disclaimerDismissed === null) {
      // valor aún cargando
      return;
    }
    if (!disclaimerDismissed) setDisclaimerVisible(true);
  }, [disclaimerDismissed]);

  async function cerrarDisclaimer() {
    await guardarDisclaimer('1');
    setDisclaimerVisible(false);
  }

  async function cargarMensajes() {
    try {
      const data = await chatService.getSesion(id);
      setMensajes(data.mensajes);
    } catch (e) {
      console.log('Error:', e);
    } finally {
      setLoading(false);
    }
  }

  async function enviarMensaje() {
    if (!texto.trim() || enviando) return;
    const textoEnviar = texto.trim();
    setTexto('');
    setEnviando(true);

    const mensajeTemp: Mensaje = {
      id: `temp-${Date.now()}`,
      rol: 'USER',
      contenido: textoEnviar,
      esCrisis: false,
      nivelCrisis: 'NINGUNO',
      creadoEn: new Date().toISOString(),
    };
    setMensajes(prev => [...prev, mensajeTemp]);

    try {
      const respuesta = await chatService.enviarMensaje(id, textoEnviar);

      if (respuesta.crisis) {
        Alert.alert(
          '🆘 ¿Necesitas ayuda inmediata?',
          'Detectamos que podrías estar en un momento difícil. Recuerda que hay personas disponibles ahora para apoyarte.',
          [
            { text: 'Continuar el chat', style: 'cancel' },
            { text: 'Llamar Línea 106', style: 'destructive', onPress: () => Linking.openURL('tel:106') },
          ]
        );
      }

      const mensajeIA: Mensaje = {
        id: respuesta.mensajeId,
        rol: 'ASSISTANT',
        contenido: respuesta.respuesta,
        esCrisis: respuesta.crisis,
        nivelCrisis: respuesta.nivel,
        creadoEn: new Date().toISOString(),
      };
      setMensajes(prev => [...prev, mensajeIA]);
    } catch {
      setMensajes(prev => prev.filter(m => m.id !== mensajeTemp.id));
    } finally {
      setEnviando(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitulo}>Chat IA</Text>
          <View style={styles.headerBadge}>
            <View style={styles.headerBadgeDot} />
            <Text style={styles.headerBadgeText}>Apoyo emocional IA</Text>
          </View>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => setDisclaimerVisible(true)}
        >
          <Ionicons name="information-circle-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Disclaimer banner — visible hasta que el usuario lo cierra */}
      {disclaimerVisible && (
        <View style={styles.disclaimer}>
          <Ionicons name="warning-outline" size={16} color="#D97706" style={{ flexShrink: 0 }} />
          <Text style={styles.disclaimerTexto}>
            <Text style={styles.disclaimerNegrita}>IA de apoyo emocional</Text> — No diagnostica ni reemplaza psicoterapia.{' '}
            <Text style={styles.disclaimerLink} onPress={() => Linking.openURL('tel:106')}>Crisis: 106</Text>
          </Text>
          <TouchableOpacity onPress={cerrarDisclaimer} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={16} color="#D97706" />
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          ref={flatListRef}
          data={mensajes}
          keyExtractor={(item, index) => `msg-${item.id}-${index}`}
          contentContainerStyle={styles.mensajesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListHeaderComponent={
            // Aviso legal fijo al tope de la conversación (siempre visible en historial)
            <View style={styles.legalNote}>
              <Ionicons name="shield-checkmark-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.legalNoteText}>
                Conversación protegida · Res. 2654/2019 · Ley 1581/2012
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatEmoji}>🤗</Text>
              <Text style={styles.emptyChatText}>Hola, estoy aquí para escucharte.</Text>
              <Text style={styles.emptyChatSubtext}>¿Cómo te sientes hoy?</Text>
              <View style={styles.emptyChatSugerencias}>
                {['Me siento ansioso/a', 'Quiero hablar de algo', 'Necesito apoyo'].map(s => (
                  <TouchableOpacity key={s} style={styles.sugerencia} onPress={() => setTexto(s)}>
                    <Text style={styles.sugerenciaText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.burbuja,
                item.rol === 'USER' ? styles.burbujaUsuario : styles.burbujaIA,
                item.esCrisis && styles.burbujaCrisis,
              ]}
            >
              {item.esCrisis && (
                <View style={styles.crisisTag}>
                  <Ionicons name="warning" size={12} color={Colors.error} />
                  <Text style={styles.crisisTagText}>Momento difícil · Línea 106 disponible</Text>
                </View>
              )}
              <Text style={[
                styles.burbujaTexto,
                item.rol === 'USER' ? styles.burbujaTextoUsuario : styles.burbujaTextoIA,
              ]}>
                {item.contenido}
              </Text>
            </View>
          )}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe cómo te sientes…"
          placeholderTextColor={Colors.textSecondary}
          value={texto}
          onChangeText={setTexto}
          multiline
          maxLength={1000}
          onSubmitEditing={enviarMensaje}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!texto.trim() || enviando) && styles.sendBtnDisabled]}
          onPress={enviarMensaje}
          disabled={!texto.trim() || enviando}
        >
          {enviando
            ? <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
            : <Ionicons name="send" size={18} color="#fff" />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 56, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitulo: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  headerBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  headerBadgeText: { fontSize: 11, color: Colors.textSecondary },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFBEB', borderBottomWidth: 1, borderBottomColor: '#FDE68A',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  disclaimerTexto: { flex: 1, fontSize: 12, color: '#78350F', lineHeight: 17 },
  disclaimerNegrita: { fontWeight: '700' },
  disclaimerLink: { color: Colors.error, fontWeight: '700', textDecorationLine: 'underline' },

  // Lista mensajes
  mensajesList: { padding: 16, paddingBottom: 8 },
  legalNote: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, marginBottom: 16,
  },
  legalNoteText: { fontSize: 11, color: Colors.textSecondary },

  // Empty state
  emptyChat: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 16 },
  emptyChatEmoji: { fontSize: 48, marginBottom: 12 },
  emptyChatText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptyChatSubtext: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 24 },
  emptyChatSugerencias: { width: '100%', gap: 8 },
  sugerencia: {
    backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  sugerenciaText: { fontSize: 14, color: Colors.textPrimary },

  // Burbujas
  burbuja: { maxWidth: '82%', borderRadius: 18, padding: 12, marginBottom: 8 },
  burbujaUsuario: { backgroundColor: Colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  burbujaIA: { backgroundColor: Colors.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4, elevation: 1 },
  burbujaCrisis: { borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FFF5F5' },
  crisisTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  crisisTagText: { fontSize: 11, color: Colors.error, fontWeight: '600' },
  burbujaTexto: { fontSize: 15, lineHeight: 22 },
  burbujaTextoUsuario: { color: '#fff' },
  burbujaTextoIA: { color: Colors.textPrimary },

  // Input
  inputContainer: {
    flexDirection: 'row', padding: 12, backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: Colors.border, alignItems: 'flex-end', gap: 8,
  },
  input: {
    flex: 1, backgroundColor: Colors.background, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15,
    color: Colors.textPrimary, maxHeight: 120,
  },
  sendBtn: {
    backgroundColor: Colors.primary, width: 42, height: 42,
    borderRadius: 21, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
});
