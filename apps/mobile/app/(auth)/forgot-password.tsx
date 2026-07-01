import { useState } from 'react';
import {
  View, Text, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { api } from '@/lib/api/client';
import { Button, ScreenHeader } from '@/components';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  async function handleEnviar() {
    if (!email.trim()) { setError('Ingresa tu correo'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setEnviado(true);
    } catch (e: any) {
      setError(e?.mensaje || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <ScreenHeader titulo="" onVolver={() => router.back()} />

        {enviado ? (
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>📧</Text>
            <Text style={styles.successTitulo}>Revisa tu correo</Text>
            <Text style={styles.successDesc}>
              Enviamos un enlace a {email} para restablecer tu contraseña. Puede tardar unos minutos.
            </Text>
            <Button onPress={() => router.replace('/(auth)/login')} variante="primary">
              Volver al login
            </Button>
          </View>
        ) : (
          <>
            <Text style={styles.titulo}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitulo}>Ingresa tu correo y te enviaremos un enlace para restablecerla.</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button onPress={handleEnviar} cargando={loading} variante="primary">
              Enviar enlace
            </Button>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 24, paddingTop: 60 },
  titulo: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  subtitulo: { fontSize: 15, color: Colors.textSecondary, marginBottom: 28, lineHeight: 22 },
  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: Colors.error, fontSize: 14 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  input: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, fontSize: 16, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, marginBottom: 24 },
  successBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, gap: 16 },
  successEmoji: { fontSize: 64, marginBottom: 20 },
  successTitulo: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  successDesc: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
});
