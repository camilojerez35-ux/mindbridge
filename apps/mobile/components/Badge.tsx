import { View, Text, StyleSheet } from 'react-native';

interface Props {
  texto: string;
  color: string;
  variante?: 'filled' | 'soft';
}

export function Badge({ texto, color, variante = 'soft' }: Props) {
  const bg = variante === 'filled' ? color : color + '20';
  const textColor = variante === 'filled' ? '#fff' : color;

  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text style={[styles.texto, { color: textColor }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  texto: { fontSize: 12, fontWeight: '600' },
});
