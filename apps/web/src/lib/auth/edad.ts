export const EDAD_MINIMA = 18;

export function calcularEdad(fechaNacimiento: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const cumpleaniosEsteAnio = new Date(hoy.getFullYear(), fechaNacimiento.getMonth(), fechaNacimiento.getDate());
  if (hoy < cumpleaniosEsteAnio) edad--;
  return edad;
}
