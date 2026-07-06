export const TAGS_SENTIMIENTOS = [
  { id: 'satisfecho',  emoji: '😊', texto: 'Satisfecho'  },
  { id: 'seguro',      emoji: '💪', texto: 'Seguro'       },
  { id: 'tranquilo',   emoji: '😌', texto: 'Tranquilo'   },
  { id: 'feliz',       emoji: '😄', texto: 'Feliz'        },
  { id: 'agradecido',  emoji: '🙏', texto: 'Agradecido'  },
  { id: 'motivado',    emoji: '🔥', texto: 'Motivado'     },
  { id: 'ansioso',     emoji: '😰', texto: 'Ansioso'      },
  { id: 'triste',      emoji: '😢', texto: 'Triste'       },
  { id: 'frustrado',   emoji: '😤', texto: 'Frustrado'    },
  { id: 'agotado',     emoji: '🥱', texto: 'Agotado'      },
  { id: 'irritado',    emoji: '😠', texto: 'Irritado'     },
  { id: 'abrumado',    emoji: '😵', texto: 'Abrumado'     },
  { id: 'solo',        emoji: '🫥', texto: 'Solo'         },
  { id: 'confundido',  emoji: '😕', texto: 'Confundido'   },
  { id: 'esperanzado', emoji: '🌱', texto: 'Esperanzado'  },
] as const;

export const TAGS_INFLUIDO_POR = [
  { id: 'casa',          emoji: '🏠',          texto: 'Casa'                    },
  { id: 'trabajo',       emoji: '💼',          texto: 'Trabajo'                 },
  { id: 'pareja',        emoji: '❤️',          texto: 'Pareja'                  },
  { id: 'familia',       emoji: '👨‍👩‍👧',        texto: 'Familia'                 },
  { id: 'amigos',        emoji: '🧑‍🤝‍🧑',        texto: 'Amigos'                  },
  { id: 'salud',         emoji: '🩺',          texto: 'Salud'                   },
  { id: 'dinero',        emoji: '💰',          texto: 'Dinero'                  },
  { id: 'pasatiempos',   emoji: '🎨',          texto: 'Pasatiempos & Actividades'},
  { id: 'sueno',         emoji: '😴',          texto: 'Sueño'                   },
  { id: 'ejercicio',     emoji: '🏃',          texto: 'Ejercicio'               },
  { id: 'redes_sociales',emoji: '📱',          texto: 'Redes Sociales'          },
  { id: 'clima',         emoji: '🌦️',          texto: 'Clima'                   },
] as const;

export type TagSentimiento = typeof TAGS_SENTIMIENTOS[number]['id'];
export type TagInfluidoPor = typeof TAGS_INFLUIDO_POR[number]['id'];
