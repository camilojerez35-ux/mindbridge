import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { api } from '@/lib/api/client';
import { LoadingSpinner, ScreenHeader, Avatar, Button } from '@/components';

interface UsuarioEditable {
  nombre: string;
  apellido: string;
  telefono: string;
  ciudadColombia: string;
  email: string;
}

export default function EditarPerfilScreen() {
  const [datos, setDatos] = useState<UsuarioEditable>({ nombre: '', apellido: '', telefono: '', ciudadColombia: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Cambio de contraseña
  const [showPwd, setShowPwd] = useState(false);
  const [pwdActual, setPwdActual] = useState('');
  const [pwdNueva, setPwdNueva] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [cambiandoPwd, setCambiandoPwd] = useState(false);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const r = await api.get<{ usuario: any }>('/usuarios');
      const u = r.usuario;
      setDatos({
        nombre: u.nombre ?? '',
        apellido: u.apellido ?? '',
        telefono: u.telefono ?? '',
        ciudadColombia: u.ciudadColombia ?? '',
        email: u.email ?? '',
      });
    } catch {
      Alert.alert('Error', 'No se pudo cargar tu perfil');
    } finally {
      setLoading(false);
    }
  }

  async function guardar() {
    if (!datos.nombre.trim()) {
      Alert.alert('Campo requerido', 'El nombre es obligatorio');
      return;
    }
    setGuardando(true);
    try {
      await api.patch('/usuarios', {
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim() || null,
        telefono: datos.telefono.trim() || null,
        ciudadColombia: datos.ciudadColombia.trim() || null,
      });
      Alert.alert('¡Listo!', 'Perfil actualizado correctamente', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('Error', e?.mensaje || 'No se pudo actualizar el perfil');
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarPassword() {
    if (!pwdActual || !pwdNueva || !pwdConfirm) {
      Alert.alert('Campos requeridos', 'Completa todos los campos');
      return;
    }
    if (pwdNueva !== pwdConfirm) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }
    if (pwdNueva.length < 8) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    setCambiandoPwd(true);
    try {
      await api.post('/usuarios/password', { passwordActual: pwdActual, passwordNueva: pwdNueva });
      Alert.alert('¡Listo!', 'Contraseña actualizada correctamente');
      setPwdActual(''); setPwdNueva(''); setPwdConfirm('');
      setShowPwd(false);
    } catch (e: any) {
      Alert.alert('Error', e?.mensaje || 'No se pudo cambiar la contraseña');
    } finally {
      setCambiandoPwd(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <ScreenHeader titulo="Editar perfil" />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.avatarBox}>
            <Avatar nombre={[datos.nombre, datos.apellido].filter(Boolean).join(' ') || 'U'} size={72} color={Colors.primary} />
            <Text style={styles.email}>{datos.email}</Text>
          </View>

          <Text style={styles.seccion}>Información personal</Text>

          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            value={datos.nombre}
            onChangeText={v => setDatos(d => ({ ...d, nombre: v }))}
            placeholder="Tu nombre"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={styles.input}
            value={datos.apellido}
            onChangeText={v => setDatos(d => ({ ...d, apellido: v }))}
            placeholder="Tu apellido"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={datos.telefono}
            onChangeText={v => setDatos(d => ({ ...d, telefono: v }))}
            placeholder="Ej: 3001234567"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Ciudad</Text>
          <TextInput
            style={styles.input}
            value={datos.ciudadColombia}
            onChangeText={v => setDatos(d => ({ ...d, ciudadColombia: v }))}
            placeholder="Ej: Bogotá"
            placeholderTextColor={Colors.textSecondary}
          />

          <Button onPress={guardar} cargando={guardando} variante="primary" style={{ marginTop: 20 }}>
            Guardar cambios
          </Button>

          {/* Cambio de contraseña */}
          <TouchableOpacity style={styles.pwdToggle} onPress={() => setShowPwd(v => !v)}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.primary} />
            <Text style={styles.pwdToggleText}>Cambiar contraseña</Text>
            <Ionicons name={showPwd ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          {showPwd && (
            <View style={styles.pwdBox}>
              <Text style={styles.label}>Contraseña actual</Text>
              <TextInput
                style={styles.input}
                value={pwdActual}
                onChangeText={setPwdActual}
                secureTextEntry
                placeholder="Contraseña actual"
                placeholderTextColor={Colors.textSecondary}
              />
              <Text style={styles.label}>Nueva contraseña</Text>
              <TextInput
                style={styles.input}
                value={pwdNueva}
                onChangeText={setPwdNueva}
                secureTextEntry
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor={Colors.textSecondary}
              />
              <Text style={styles.label}>Confirmar nueva contraseña</Text>
              <TextInput
                style={styles.input}
                value={pwdConfirm}
                onChangeText={setPwdConfirm}
                secureTextEntry
                placeholder="Repite la nueva contraseña"
                placeholderTextColor={Colors.textSecondary}
              />
              <Button onPress={cambiarPassword} cargando={cambiandoPwd} variante="secondary" style={{ marginTop: 8 }}>
                Actualizar contraseña
              </Button>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 48 },
  avatarBox: { alignItems: 'center', marginBottom: 24, gap: 8 },
  email: { fontSize: 14, color: Colors.textSecondary },
  seccion: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    fontSize: 15, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border,
  },
  pwdToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border,
  },
  pwdToggleText: { flex: 1, fontSize: 15, color: Colors.primary, fontWeight: '600' },
  pwdBox: { marginTop: 12 },
});
