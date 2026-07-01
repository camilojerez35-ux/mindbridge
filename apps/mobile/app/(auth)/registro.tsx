import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { api } from '@/lib/api/client';
import * as SecureStore from 'expo-secure-store';
import { Button } from '@/components';

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegistro() {
    if (!nombre || !email || !password) {
      setError('Completa todos los campos');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.post<{ token: string; usuario: { id: string; nombre: string; email: string; plan: string; rol: string } }>(
        '/usuarios/registro',
        { nombre, email, password, consentimientoDatos: true }
      );
      await SecureStore.setItemAsync('session_token', data.token);
      await SecureStore.setItemAsync('user_id', data.usuario.id);
      await SecureStore.setItemAsync('user_plan', data.usuario.plan);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      setError(e?.mensaje || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>🧠</Text>
          <Text style={styles.titulo}>Crea tu cuenta</Text>
          <Text style={styles.subtitulo}>Comienza tu bienestar mental hoy</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor={Colors.textSecondary}
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />

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

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button onPress={handleRegistro} cargando={loading} variante="primary" style={{ marginTop: 24 }}>
            Crear cuenta
          </Button>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.back()}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? </Text>
            <Text style={[styles.linkText, styles.linkTextBold]}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 36 },
  logo: { fontSize: 56, marginBottom: 12 },
  titulo: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
  subtitulo: { fontSize: 15, color: Colors.textSecondary, marginTop: 6, textAlign: 'center' },
  form: { gap: 4 },
  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { color: Colors.error, fontSize: 14, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    fontSize: 16, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border,
  },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { fontSize: 14, color: Colors.textSecondary },
  linkTextBold: { color: Colors.primary, fontWeight: '600' },
});
