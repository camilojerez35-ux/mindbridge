import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  texto?: string;
}

export function LoadingSpinner({ texto }: Props) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {texto && <Text style={styles.texto}>{texto}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  texto: { fontSize: 14, color: Colors.textSecondary },
});
