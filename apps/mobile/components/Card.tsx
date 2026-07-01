import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

interface Props {
  titulo: string;
  subtitulo?: string;
  izquierda?: React.ReactNode;
  derecha?: React.ReactNode;
  onPress?: () => void;
  mostrarChevron?: boolean;
}

export function Card({ titulo, subtitulo, izquierda, derecha, onPress, mostrarChevron = true }: Props) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {izquierda && <View style={styles.izquierda}>{izquierda}</View>}
      <View style={styles.contenido}>
        <Text style={styles.titulo} numberOfLines={1}>{titulo}</Text>
        {subtitulo && <Text style={styles.subtitulo} numberOfLines={1}>{subtitulo}</Text>}
      </View>
      {derecha
        ? <View style={styles.derecha}>{derecha}</View>
        : onPress && mostrarChevron && <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
      }
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 12 },
  izquierda: { flexShrink: 0 },
  contenido: { flex: 1 },
  titulo: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  subtitulo: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  derecha: { flexShrink: 0 },
});
