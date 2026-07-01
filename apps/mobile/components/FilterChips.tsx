import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  items: string[];
  seleccionado: string;
  onChange: (item: string) => void;
}

export function FilterChips({ items, seleccionado, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map(item => {
        const activo = item === seleccionado;
        return (
          <TouchableOpacity
            key={item}
            style={[styles.chip, activo && styles.chipActivo]}
            onPress={() => onChange(item)}
          >
            <Text style={[styles.texto, activo && styles.textoActivo]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border },
  chipActivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  texto: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  textoActivo: { color: '#fff' },
});
