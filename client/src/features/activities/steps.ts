import type { ActivityType } from '../../lib/types';

/** Ejemplo ilustrado de cada tipo de actividad (HU-01): máximo 3 pasos con dibujo. */
export const STEPS: Record<ActivityType, { image: string; title: string; text: string }[]> = {
  identifica: [
    { image: 'escena_cumple', title: 'Mira la escena', text: 'Observa la cara y lo que está pasando.' },
    { image: 'emo_alegria', title: 'Elige una emoción', text: 'Toca una cara. También puedes usar las teclas 1, 2 o 3.' },
    { image: 'estrella_llena', title: 'Toca Comprobar', text: 'Si no aciertas, puedes intentarlo otra vez.' },
  ],
  observa: [
    { image: 'emo_tristeza', title: 'Mira la cara', text: 'Usa el botón Ver más grande para mirar de cerca.' },
    { image: 'picto_ayuda', title: 'Fíjate en las cejas y la boca', text: 'Ellas te dicen qué siente la persona.' },
    { image: 'estrella_llena', title: 'Elige y comprueba', text: 'Toca una emoción y luego Comprobar.' },
  ],
  escucha: [
    { image: 'picto_escuchar', title: 'Escucha la historia', text: 'Nubi te la cuenta. También está escrita.' },
    { image: 'picto_nino', title: 'Piensa en la pregunta', text: 'Puedes escucharla otra vez cuando quieras.' },
    { image: 'estrella_llena', title: 'Elige y comprueba', text: 'Toca una respuesta y luego Comprobar.' },
  ],
  une: [
    { image: 'picto_letra', title: 'Toca una situación', text: 'Lee o escucha qué le pasó a alguien.' },
    { image: 'emo_sorpresa', title: 'Toca su emoción', text: 'También puedes arrastrar la cara hasta la situación.' },
    { image: 'estrella_llena', title: 'Une todas y comprueba', text: 'Las parejas correctas se quedan fijas.' },
  ],
  que_harias: [
    { image: 'picto_nino', title: 'Lee la situación', text: 'Imagina que te pasa a ti.' },
    { image: 'picto_ayuda', title: 'Elige una idea', text: 'Hay más de una idea que puede ayudar.' },
    { image: 'estrella_llena', title: 'Descubre qué pasa', text: 'Nubi te cuenta qué efecto tiene cada idea.' },
  ],
  respira: [
    { image: 'picto_respira', title: 'Ponte cómodo', text: 'Siéntate derecho y suelta los hombros.' },
    { image: 'mascota_nubi', title: 'Inhala cuando crece', text: 'Llena tu barriga de aire como un globo.' },
    { image: 'estrella_llena', title: 'Exhala cuando baja', text: 'Suelta el aire despacio. Puedes pausar cuando quieras.' },
  ],
  expreso: [
    { image: 'emo_alegria', title: 'Elige cómo te sientes', text: 'Toca la cara que se parece a lo que sientes.' },
    { image: 'escena_escuela', title: 'Elige por qué', text: 'Toca el dibujo de lo que pasó.' },
    { image: 'picto_escuchar', title: 'Elige cuánto', text: 'Un poquito, algo o mucho. ¡Todas las respuestas valen!' },
  ],
};
