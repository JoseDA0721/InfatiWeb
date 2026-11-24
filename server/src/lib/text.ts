/** Normaliza nombres de usuario: sin mayúsculas, sin tildes y sin espacios extra. */
export function normalizeUsername(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function normalizeAnswer(value: string): string {
  return normalizeUsername(value);
}
