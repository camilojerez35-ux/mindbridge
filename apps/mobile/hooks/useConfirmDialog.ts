import { Alert } from 'react-native';

interface Opciones {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textosCancelar?: string;
  destructivo?: boolean;
}

export function useConfirmDialog() {
  function confirmar(opciones: Opciones): Promise<boolean> {
    return new Promise(resolve => {
      Alert.alert(
        opciones.titulo,
        opciones.mensaje,
        [
          { text: opciones.textosCancelar ?? 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          {
            text: opciones.textoConfirmar ?? 'Confirmar',
            style: opciones.destructivo ? 'destructive' : 'default',
            onPress: () => resolve(true),
          },
        ]
      );
    });
  }

  return { confirmar };
}
