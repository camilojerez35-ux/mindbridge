import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

interface Props {
  titulo: string;
  onVolver?: () => void;
  derecha?: React.ReactNode;
}

export function ScreenHeader({ titulo, onVolver, derecha }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onVolver ?? (() => router.back())} hitSlop={8}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.titulo} numberOfLines={1}>{titulo}</Text>
      <View style={styles.derecha}>{derecha ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 56,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  titulo: { flex: 1, fontSize: 17, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', marginHorizontal: 8 },
  derecha: { width: 24, alignItems: 'flex-end' },
});
