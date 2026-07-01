import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

interface Props {
  icono: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descripcion?: string;
  accionTexto?: string;
  onAccion?: () => void;
}

export function EmptyState({ icono, titulo, descripcion, accionTexto, onAccion }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icono} size={64} color={Colors.border} />
      <Text style={styles.titulo}>{titulo}</Text>
      {descripcion && <Text style={styles.desc}>{descripcion}</Text>}
      {accionTexto && onAccion && (
        <TouchableOpacity style={styles.btn} onPress={onAccion}>
          <Text style={styles.btnText}>{accionTexto}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12 },
  titulo: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  desc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  btn: { marginTop: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
