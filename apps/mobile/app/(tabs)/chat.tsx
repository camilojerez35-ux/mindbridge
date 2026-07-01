import { useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { chatService, Sesion } from '@/lib/api/chat';
import { LoadingSpinner, EmptyState } from '@/components';
import { useFetchData, useDateFormat } from '@/hooks';

export default function ChatListScreen() {
  const { datos: sesiones, cargando, refrescar } = useFetchData<Sesion[]>(() => chatService.getSesiones());
  const { fechaCorta } = useDateFormat();

  useFocusEffect(useCallback(() => { refrescar(); }, []));

  async function nuevaSesion() {
    try {
      const sesion = await chatService.crearSesion();
      router.push(`/chat/${sesion.id}`);
    } catch (e) {
      console.log('Error creando sesión:', e);
    }
  }

  if (cargando) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Chat IA</Text>
        <TouchableOpacity style={styles.nuevoBtn} onPress={nuevaSesion}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {!sesiones || sesiones.length === 0 ? (
        <EmptyState
          icono="chatbubbles-outline"
          titulo="Sin conversaciones"
          descripcion="Inicia una nueva sesión para hablar con la IA"
          accionTexto="Nueva conversación"
          onAccion={nuevaSesion}
        />
      ) : (
        <FlatList
          data={sesiones}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.sesionCard}
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <View style={styles.sesionIcono}>
                <Ionicons name="chatbubble" size={20} color={Colors.primary} />
              </View>
              <View style={styles.sesionTexto}>
                <Text style={styles.sesionTitulo}>
                  {item.titulo || 'Conversación'}
                </Text>
                <Text style={styles.sesionFecha}>
                  {fechaCorta(item.creadaEn)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 60, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  titulo: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  nuevoBtn: {
    backgroundColor: Colors.primary, width: 40, height: 40,
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },
  lista: { padding: 16 },
  sesionCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1,
  },
  sesionIcono: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0FDF4',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  sesionTexto: { flex: 1 },
  sesionTitulo: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  sesionFecha: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
});
