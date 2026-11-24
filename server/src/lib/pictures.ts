/** Imágenes disponibles para la clave con imágenes (se eligen 3 en orden). */
export const PICTURE_KEYS = [
  'nubi',
  'estrella',
  'alegria',
  'sorpresa',
  'tristeza',
  'respira',
  'escuchar',
  'familia',
  'inicio',
] as const;

export type PictureKey = (typeof PICTURE_KEYS)[number];

export const pictureKeyString = (keys: readonly string[]) => keys.join('-');
