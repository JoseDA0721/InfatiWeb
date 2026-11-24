/**
 * Imágenes indexadas por nombre de archivo sin extensión:
 * - assets/*.svg: vectores (caras, insignias, estrellas, pictogramas, Nubi).
 * - assets/ilustraciones/*.webp: ilustraciones de cuento (escenas por pregunta,
 *   portadas de módulo, stickers, avatares y tutorial).
 */
const files = import.meta.glob<string>(['../assets/*.svg', '../assets/ilustraciones/*.webp'], {
  eager: true,
  query: '?url',
  import: 'default',
});

const byName: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop()!.replace(/\.(svg|webp)$/, '');
  byName[name] = url;
}

export function asset(name: string | null | undefined): string | undefined {
  if (!name) return undefined;
  return byName[name];
}

export const avatarAsset = (id: number) => asset(`avatar_${id}`) ?? asset('avatar_1')!;

export const PICTURE_LABEL: Record<string, string> = {
  nubi: 'Nubi',
  estrella: 'Estrella',
  alegria: 'Cara feliz',
  sorpresa: 'Cara de sorpresa',
  tristeza: 'Cara triste',
  respira: 'Respira',
  escuchar: 'Parlante',
  familia: 'Familia',
  inicio: 'Casa',
};

const PICTURE_FILE: Record<string, string> = {
  nubi: 'mascota_nubi',
  estrella: 'estrella_llena',
  alegria: 'emo_alegria',
  sorpresa: 'emo_sorpresa',
  tristeza: 'emo_tristeza',
  respira: 'picto_respira',
  escuchar: 'picto_escuchar',
  familia: 'picto_familia',
  inicio: 'picto_inicio',
};

export const PICTURE_KEYS = Object.keys(PICTURE_FILE);

export const pictureAsset = (key: string) => asset(PICTURE_FILE[key]);
