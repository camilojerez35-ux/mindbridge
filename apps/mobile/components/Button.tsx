import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

type Variante = 'primary' | 'secondary' | 'destructive' | 'outline';

interface Props {
  onPress: () => void;
  children: string;
  variante?: Variante;
  cargando?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const BG: Record<Variante, string> = {
  primary: Colors.primary,
  secondary: Colors.secondary ?? '#3B82F6',
  destructive: Colors.error,
  outline: 'transparent',
};

export function Button({ onPress, children, variante = 'primary', cargando, disabled, style, fullWidth = true }: Props) {
  const bg = BG[variante];
  const isOutline = variante === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: bg },
        isOutline && styles.outline,
        fullWidth && styles.fullWidth,
        (disabled || cargando) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || cargando}
      activeOpacity={0.75}
    >
      {cargando
        ? <ActivityIndicator color={isOutline ? Colors.primary : '#fff'} size="small" />
        : <Text style={[styles.texto, isOutline && styles.textoOutline]}>{children}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 14, padding: 15, alignItems: 'center', justifyContent: 'center' },
  fullWidth: { alignSelf: 'stretch' },
  outline: { borderWidth: 1.5, borderColor: Colors.primary },
  disabled: { opacity: 0.5 },
  texto: { color: '#fff', fontSize: 15, fontWeight: '700' },
  textoOutline: { color: Colors.primary },
});
