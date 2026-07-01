import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { authService } from '@/lib/api/auth';
import { LoadingSpinner, Avatar, Badge } from '@/components';
import { useFetchData, useColorMapping } from '@/hooks';

interface Usuario {
  nombre: string;
  email: string;
  plan: string;
}

export default function PerfilScreen() {
  const { datos: usuario, cargando } = useFetchData<Usuario>(async () => {
    const data = await authService.getUsuario();
    return { nombre: data.nombre, email: data.email, plan: data.plan };
  });
  const { color } = useColorMapping();

  async function handleLogout() {
    await authService.logout();
    router.replace('/(auth)/login');
  }

  if (cargando) {
    return <LoadingSpinner />;
  }

  const planColor = color('plan', usuario?.plan ?? 'GRATIS');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <Avatar nombre={usuario?.nombre ?? 'U'} size={80} color={Colors.primary} />
        <Text style={styles.nombre}>{usuario?.nombre}</Text>
        <Text style={styles.email}>{usuario?.email}</Text>
        <Badge texto={`Plan ${usuario?.plan}`} color={planColor} variante="soft" />
      </View>

      {/* Opciones */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Mi cuenta</Text>

        <TouchableOpacity style={styles.opcion} onPress={() => router.push('/editar-perfil' as any)}>
          <Ionicons name="person" size={20} color={Colors.primary} />
          <Text style={styles.opcionTexto}>Editar perfil</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.opcion} onPress={() => router.push('/estadisticas')}>
          <Ionicons name="bar-chart" size={20} color={Colors.primary} />
          <Text style={styles.opcionTexto}>Mi progreso</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.opcion} onPress={() => router.push('/citas')}>
          <Ionicons name="calendar" size={20} color={Colors.primary} />
          <Text style={styles.opcionTexto}>Mis citas</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.opcion} onPress={() => router.push('/tests')}>
          <Ionicons name="clipboard" size={20} color={Colors.primary} />
          <Text style={styles.opcionTexto}>Tests psicológicos</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.opcion} onPress={() => router.push('/suscripcion')}>
          <Ionicons name="card" size={20} color={Colors.primary} />
          <Text style={styles.opcionTexto}>Suscripción</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Configuración</Text>

        <TouchableOpacity style={styles.opcion}>
          <Ionicons name="notifications" size={20} color={Colors.textSecondary} />
          <Text style={styles.opcionTexto}>Notificaciones</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.opcion}>
          <Ionicons name="lock-closed" size={20} color={Colors.textSecondary} />
          <Text style={styles.opcionTexto}>Privacidad</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingTop: 70, paddingBottom: 28, backgroundColor: Colors.surface, gap: 8 },
  nombre: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  email: { fontSize: 14, color: Colors.textSecondary },
  seccion: { margin: 16, marginBottom: 0 },
  seccionTitulo: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  opcion: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 2,
  },
  opcionTexto: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  logoutBtn: {
    margin: 16, marginTop: 24, backgroundColor: '#FEF2F2', borderRadius: 12,
    padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.error },
});
