import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nombre: string;
  size?: number;
  color?: string;
}

export function Avatar({ nombre, size = 48, color = Colors.primary }: Props) {
  const iniciales = nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={[
      styles.base,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '20' },
    ]}>
      <Text style={[styles.texto, { color, fontSize: size * 0.35 }]}>{iniciales}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { justifyContent: 'center', alignItems: 'center' },
  texto: { fontWeight: '700' },
});
