import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

interface Props {
  mensaje: string;
  onReintentar?: () => void;
}

export function ErrorState({ mensaje, onReintentar }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
      <Text style={styles.mensaje}>{mensaje}</Text>
      {onReintentar && (
        <TouchableOpacity style={styles.btn} onPress={onReintentar}>
          <Ionicons name="refresh" size={16} color={Colors.primary} />
          <Text style={styles.btnText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12 },
  mensaje: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.primary },
  btnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
});
