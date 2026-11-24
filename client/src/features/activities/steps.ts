import type { ActivityType } from '../../lib/types';

/** Ejemplo ilustrado de cada tipo de actividad (HU-01): máximo 3 pasos con dibujo. */
export const STEPS: Record<ActivityType, { image: string; title: string; text: string }[]> = {
  identifica: [
    { image: 'm1a1q1', title: 'Mira la escena', text: 'Observa la cara y lo que está pasando.' },
    { image: 'emo_alegria', title: 'Elige una emoción', text: 'Toca una cara. También puedes usar las teclas 1, 2 o 3.' },
    { image: 'estrella_llena', title: 'Toca Comprobar', text: 'Si no aciertas, puedes intentarlo otra vez.' },
  ],
  observa: [
    { image: 'm1a2q1', title: 'Mira la cara', text: 'Usa el botón Ver más grande para mirar de cerca.' },
    { image: 'sticker_estrella', title: 'Fíjate en las cejas y la boca', text: 'Ellas te dicen qué siente la persona.' },
    { image: 'estrella_llena', title: 'Elige y comprueba', text: 'Toca una emoción y luego Comprobar.' },
  ],
  escucha: [
    { image: 'sticker_escuchar', title: 'Escucha la historia', text: 'Nubi te la cuenta. También está escrita.' },
    { image: 'sticker_idea', title: 'Piensa en la pregunta', text: 'Puedes escucharla otra vez cuando quieras.' },
    { image: 'estrella_llena', title: 'Elige y comprueba', text: 'Toca una respuesta y luego Comprobar.' },
  ],
  une: [
    { image: 'picto_nino', title: 'Toca una situación', text: 'Lee o escucha qué le pasó a alguien.' },
    { image: 'emo_sorpresa', title: 'Toca su emoción', text: 'También puedes arrastrar la cara hasta la situación.' },
    { image: 'sticker_nubi', title: 'Une todas y comprueba', text: 'Las parejas correctas se quedan fijas.' },
  ],
  que_harias: [
    { image: 'm3a2q1', title: 'Lee la situación', text: 'Imagina que te pasa a ti.' },
    { image: 'sticker_idea', title: 'Elige una idea', text: 'Hay más de una idea que puede ayudar.' },
    { image: 'estrella_llena', title: 'Descubre qué pasa', text: 'Nubi te cuenta qué efecto tiene cada idea.' },
  ],
  respira: [
    { image: 'modulo_calmarme', title: 'Ponte cómodo', text: 'Siéntate derecho y suelta los hombros.' },
    { image: 'sticker_respira', title: 'Inhala cuando crece', text: 'Llena tu barriga de aire como un globo.' },
    { image: 'mascota_nubi', title: 'Exhala cuando baja', text: 'Suelta el aire despacio. Puedes pausar cuando quieras.' },
  ],
  expreso: [
    { image: 'emo_alegria', title: 'Elige cómo te sientes', text: 'Toca la cara que se parece a lo que sientes.' },
    { image: 'icono_escuela', title: 'Elige por qué', text: 'Toca el dibujo de lo que pasó.' },
    { image: 'sticker_voz', title: 'Elige cuánto', text: 'Un poquito, algo o mucho. ¡Todas las respuestas valen!' },
  ],
};
