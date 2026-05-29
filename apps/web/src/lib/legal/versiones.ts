export const VERSIONES_DOCUMENTOS = {
  POLITICA_PRIVACIDAD: '1.0.0',
  TERMINOS_USO: '1.0.0',
  AVISO_IA: '1.0.0',
} as const;

export type VersionDocumento = typeof VERSIONES_DOCUMENTOS[keyof typeof VERSIONES_DOCUMENTOS];
