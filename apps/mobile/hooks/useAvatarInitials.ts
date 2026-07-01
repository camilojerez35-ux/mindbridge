export function useAvatarInitials() {
  function iniciales(nombre: string, limite = 2): string {
    return nombre
      .trim()
      .split(/\s+/)
      .map(n => n[0])
      .join('')
      .slice(0, limite)
      .toUpperCase();
  }

  return { iniciales };
}
