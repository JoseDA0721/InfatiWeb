/**
 * Contenido educativo del prototipo (secciones 9 y 10 del documento de contexto).
 * Cantidades por módulo: 5, 4, 5 y 5 actividades. Ningún módulo repite el mismo
 * tipo de actividad en actividades consecutivas (HU-07).
 */

export type Emotion = 'alegria' | 'tristeza' | 'enojo' | 'miedo' | 'sorpresa';
export type Skill = 'reconocimiento' | 'comprension' | 'regulacion' | 'expresion';
export type ActivityType = 'identifica' | 'une' | 'que_harias' | 'respira' | 'expreso' | 'observa' | 'escucha';

export const EMOTION_LABEL: Record<Emotion, string> = {
  alegria: 'Alegría',
  tristeza: 'Tristeza',
  enojo: 'Enojo',
  miedo: 'Miedo',
  sorpresa: 'Sorpresa',
};

interface OptionDef {
  label: string;
  emotion?: Emotion;
  image?: string;
  correct?: boolean;
  feedback?: string;
}

interface QuestionDef {
  prompt: string;
  story?: string;
  scene?: string;
  sceneAlt?: string;
  hint1?: string;
  hint2?: string;
  explanation: string;
  options?: OptionDef[];
  pairs?: { label: string; emotion: Emotion }[];
  reasons?: { label: string; image: string }[];
}

interface ActivityDef {
  type: ActivityType;
  title: string;
  instruction: string;
  emotion?: Emotion;
  sticker: string;
  minutes: number;
  questions: QuestionDef[];
}

interface ModuleDef {
  code: string;
  title: string;
  world: string;
  skill: Skill;
  icon: string;
  activities: ActivityDef[];
}

const emo = (code: Emotion, correct = false): OptionDef => ({
  label: EMOTION_LABEL[code],
  emotion: code,
  image: `emo_${code}`,
  correct,
});

const helps = (label: string, feedback: string): OptionDef => ({ label, correct: true, feedback });
const effect = (label: string, feedback: string): OptionDef => ({ label, correct: false, feedback });

const REASONS_DAY = [
  { label: 'Pasó algo en la escuela', image: 'icono_escuela' },
  { label: 'Pasó algo en casa', image: 'icono_casa' },
  { label: 'Jugué con mis amigos', image: 'icono_amigos' },
  { label: 'Estaba cansado o cansada', image: 'icono_cansado' },
];

export const MODULES: ModuleDef[] = [
  {
    code: 'reconociendo',
    title: 'Reconociendo emociones',
    world: 'Conozco mis emociones',
    skill: 'reconocimiento',
    icon: 'modulo_reconociendo',
    activities: [
      {
        type: 'identifica',
        title: 'Detective de la alegría',
        instruction: 'Mira la escena y elige cómo se siente.',
        emotion: 'alegria',
        sticker: 'sticker_alegria',
        minutes: 3,
        questions: [
          {
            scene: 'm1a1q1',
            sceneAlt: 'Sofía sonríe feliz en su fiesta de cumpleaños mientras recibe un regalo, con globos y un pastel',
            prompt: 'Es el cumpleaños de Sofía y recibe un regalo. ¿Cómo se siente?',
            hint1: 'Mira su sonrisa y la fiesta.',
            hint2: 'Cuando celebramos algo bonito, sonreímos y queremos saltar.',
            explanation: 'Sofía siente alegría porque celebra y recibe un regalo.',
            options: [emo('alegria', true), emo('tristeza'), emo('enojo')],
          },
          {
            scene: 'm1a1q2',
            sceneAlt: 'Tomás y su mejor amigo juegan con una pelota en el parque y se ríen',
            prompt: 'Tomás juega en el parque con su mejor amigo. ¿Cómo se siente?',
            hint1: 'Está jugando con alguien que quiere mucho.',
            hint2: 'Mira su boca: está sonriendo.',
            explanation: 'Tomás siente alegría porque comparte un juego con su amigo.',
            options: [emo('miedo'), emo('alegria', true), emo('tristeza')],
          },
          {
            scene: 'm1a1q3',
            sceneAlt: 'La abuela de Lía le sirve su comida favorita y Lía junta las manos con alegría',
            prompt: 'La abuela de Lía preparó su comida favorita. ¿Cómo se siente Lía?',
            hint1: 'Es su comida favorita y la hizo alguien que la quiere.',
            hint2: 'Cuando alguien nos cuida, sentimos algo bonito.',
            explanation: 'Lía siente alegría porque su abuela pensó en ella.',
            options: [emo('enojo'), emo('miedo'), emo('alegria', true)],
          },
        ],
      },
      {
        type: 'observa',
        title: 'Caras tristes',
        instruction: 'Observa la cara y elige la emoción.',
        emotion: 'tristeza',
        sticker: 'sticker_tristeza',
        minutes: 3,
        questions: [
          {
            scene: 'm1a2q1',
            sceneAlt: 'Cara de un niño con las cejas caídas, la boca hacia abajo y una lágrima',
            prompt: 'Mira esta cara. ¿Qué emoción muestra?',
            hint1: 'Mira la boca: va hacia abajo.',
            hint2: 'Sus ojos y sus cejas se ven caídos.',
            explanation: 'Es tristeza: la boca baja y la mirada se ve caída.',
            options: [emo('tristeza', true), emo('alegria'), emo('sorpresa')],
          },
          {
            scene: 'm1a2q2',
            sceneAlt: 'Luis, sentado en el suelo, mira su robot de juguete roto en dos partes',
            prompt: 'A Luis se le rompió su juguete favorito. ¿Cómo se siente?',
            hint1: 'Su juguete ya no funciona.',
            hint2: 'Perder algo que queremos mucho nos pone…',
            explanation: 'Luis siente tristeza porque perdió algo que quería mucho.',
            options: [emo('sorpresa'), emo('tristeza', true), emo('alegria')],
          },
          {
            scene: 'm1a2q3',
            sceneAlt: 'Martina, con impermeable, mira por la ventana la lluvia que cae sobre su bicicleta',
            prompt: 'Martina quería salir a jugar, pero llueve mucho. ¿Cómo se siente?',
            hint1: 'No puede hacer lo que quería.',
            hint2: 'Mira su boca y cómo mira por la ventana.',
            explanation: 'Martina siente tristeza porque no puede salir a jugar hoy.',
            options: [emo('alegria'), emo('enojo'), emo('tristeza', true)],
          },
        ],
      },
      {
        type: 'escucha',
        title: 'Escucha a Leo',
        instruction: 'Escucha lo que pasó y elige la emoción.',
        emotion: 'enojo',
        sticker: 'sticker_enojo',
        minutes: 3,
        questions: [
          {
            scene: 'm1a3q1',
            sceneAlt: 'El hermanito de Leo empuja su torre de bloques y Leo frunce el ceño con los puños apretados',
            story: 'Leo estaba armando una torre de bloques. Su hermano la empujó y la torre se cayó.',
            prompt: '¿Cómo se siente Leo?',
            hint1: 'Alguien rompió lo que Leo estaba haciendo.',
            hint2: 'Cuando algo nos parece injusto, sentimos calor en la cara.',
            explanation: 'Leo siente enojo porque destruyeron su torre.',
            options: [emo('alegria'), emo('enojo', true), emo('miedo')],
          },
          {
            scene: 'm1a3q2',
            sceneAlt: 'En el recreo un niño se lleva la pelota de Sara y ella frunce el ceño con las manos en la cintura',
            story: 'En el recreo, alguien tomó la pelota de Sara sin pedirla.',
            prompt: '¿Cómo se siente Sara?',
            hint1: 'Le quitaron algo sin preguntar.',
            hint2: 'Es una emoción que nos hace apretar los puños.',
            explanation: 'Sara siente enojo porque no respetaron sus cosas.',
            options: [emo('enojo', true), emo('sorpresa'), emo('alegria')],
          },
          {
            scene: 'm1a3q3',
            sceneAlt: 'Diego espera en la fila del columpio con los brazos cruzados mientras otro niño se sube antes',
            story: 'Diego esperó su turno en el columpio, pero otro niño se coló.',
            prompt: '¿Cómo se siente Diego?',
            hint1: 'Diego hizo la fila y alguien no la respetó.',
            hint2: 'Cuando no es justo, podemos sentir enojo.',
            explanation: 'Diego siente enojo porque no respetaron su turno.',
            options: [emo('tristeza'), emo('alegria'), emo('enojo', true)],
          },
        ],
      },
      {
        type: 'identifica',
        title: 'Ruidos en la noche',
        instruction: 'Mira la escena y elige cómo se siente.',
        emotion: 'miedo',
        sticker: 'sticker_miedo',
        minutes: 3,
        questions: [
          {
            scene: 'm1a4q1',
            sceneAlt: 'Ana, en su cama de noche, se tapa con la cobija y mira asustada hacia la puerta del armario',
            prompt: 'Ana oye un ruido en su cuarto oscuro. ¿Cómo se siente?',
            hint1: 'Está oscuro y no ve bien.',
            hint2: 'No sabe qué hizo el ruido y quiere taparse con la cobija.',
            explanation: 'Ana siente miedo porque no puede ver qué sucede.',
            options: [emo('miedo', true), emo('alegria'), emo('enojo')],
          },
          {
            scene: 'm1a4q2',
            sceneAlt: 'Pablo, con su mochila, se queda en la puerta de un salón nuevo con cara de nervios',
            prompt: 'Es el primer día de Pablo en una escuela nueva y no conoce a nadie. ¿Cómo se siente?',
            hint1: 'Todo es nuevo y no conoce a nadie.',
            hint2: 'Su corazón late rápido y tiene un poco de nervios.',
            explanation: 'Pablo siente miedo porque todo es desconocido. ¡Es normal sentirlo!',
            options: [emo('alegria'), emo('miedo', true), emo('enojo')],
          },
          {
            scene: 'm1a4q3',
            sceneAlt: 'Ema se tapa los oídos abrazada a un cojín mientras cae un rayo afuera',
            prompt: 'Durante la tormenta, Ema oye un trueno muy fuerte. ¿Cómo se siente?',
            hint1: 'El trueno sonó muy fuerte y de repente.',
            hint2: 'Ema quiere abrazar a alguien para sentirse segura.',
            explanation: 'Ema siente miedo porque el trueno la asustó.',
            options: [emo('sorpresa'), emo('alegria'), emo('miedo', true)],
          },
        ],
      },
      {
        type: 'une',
        title: 'Une las sorpresas',
        instruction: 'Une cada situación con su emoción.',
        emotion: 'sorpresa',
        sticker: 'sticker_sorpresa',
        minutes: 4,
        questions: [
          {
            prompt: 'Une cada situación con la emoción que provoca.',
            hint1: '¿Cuál de estas cosas pasó sin esperarla?',
            hint2: 'Ganar algo da alegría; perder algo que queremos da tristeza.',
            explanation: 'La fiesta sorpresa da sorpresa, perder la gorra da tristeza y ganar la carrera da alegría.',
            pairs: [
              { label: '¡Una fiesta sorpresa al abrir la puerta!', emotion: 'sorpresa' },
              { label: 'Se perdió su gorra favorita', emotion: 'tristeza' },
              { label: 'Ganó la carrera de la escuela', emotion: 'alegria' },
            ],
          },
          {
            prompt: 'Une cada situación con la emoción que provoca.',
            hint1: 'Un truco de magia pasa de repente y no lo esperamos.',
            hint2: 'Un perro grande que ladra cerca puede asustar.',
            explanation: 'La magia da sorpresa, el perro que ladra da miedo y romper un dibujo a propósito da enojo.',
            pairs: [
              { label: 'Un mago saca un conejo del sombrero', emotion: 'sorpresa' },
              { label: 'Un perro grande le ladra muy cerca', emotion: 'miedo' },
              { label: 'Alguien rompe su dibujo a propósito', emotion: 'enojo' },
            ],
          },
          {
            prompt: 'Une cada situación con la emoción que provoca.',
            hint1: 'Encontrar un regalo que no esperabas es…',
            hint2: 'Cuando un amigo se va lejos, lo extrañamos.',
            explanation: 'El regalo inesperado da sorpresa, la mudanza del amigo da tristeza y los pasos en la oscuridad dan miedo.',
            pairs: [
              { label: 'Encuentra un regalo sobre su almohada', emotion: 'sorpresa' },
              { label: 'Su mejor amigo se muda lejos', emotion: 'tristeza' },
              { label: 'Oye pasos en la oscuridad', emotion: 'miedo' },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'comprendiendo',
    title: 'Comprendiendo lo que siento',
    world: 'Entiendo lo que siento',
    skill: 'comprension',
    icon: 'modulo_comprendiendo',
    activities: [
      {
        type: 'identifica',
        title: '¿Por qué me siento así?',
        instruction: 'Piensa en lo que pasó y elige la emoción.',
        sticker: 'sticker_estrella',
        minutes: 3,
        questions: [
          {
            scene: 'm2a1q1',
            sceneAlt: 'La maestra muestra el dibujo de Nico a la clase y Nico sonríe orgulloso mientras todos aplauden',
            prompt: 'La maestra felicita a Nico por su dibujo frente a la clase. ¿Qué siente Nico?',
            hint1: 'Alguien reconoció su esfuerzo.',
            hint2: 'Cuando nos felicitan, sonreímos.',
            explanation: 'Nico siente alegría porque reconocieron su esfuerzo.',
            options: [emo('alegria', true), emo('miedo'), emo('enojo')],
          },
          {
            scene: 'm2a1q2',
            sceneAlt: 'Tres niñas juegan juntas mientras Clara las mira sola, con la cabeza baja',
            prompt: 'Clara no fue invitada a jugar con sus amigas. ¿Qué siente Clara?',
            hint1: 'Se quedó fuera del juego.',
            hint2: 'Sentirse sola o dejada de lado nos pone…',
            explanation: 'Clara siente tristeza porque se sintió dejada de lado.',
            options: [emo('sorpresa'), emo('tristeza', true), emo('alegria')],
          },
          {
            scene: 'm2a1q3',
            sceneAlt: 'El hermano de Juan se relame junto al plato vacío del pastel y Juan frunce el ceño',
            prompt: 'Su hermano se comió el último pedazo de pastel que Juan guardaba. ¿Qué siente Juan?',
            hint1: 'Juan lo estaba guardando para él.',
            hint2: 'Cuando algo nos parece injusto, sentimos…',
            explanation: 'Juan siente enojo porque no respetaron lo que guardaba.',
            options: [emo('alegria'), emo('miedo'), emo('enojo', true)],
          },
        ],
      },
      {
        type: 'escucha',
        title: 'Mi cuerpo me avisa',
        instruction: 'Escucha cómo se siente el cuerpo y elige la emoción.',
        sticker: 'sticker_corazon',
        minutes: 4,
        questions: [
          {
            scene: 'm2a2q1',
            sceneAlt: 'Una niña se esconde detrás del sofá con la mano en el pecho y las piernas temblando',
            story: 'El corazón me late rápido, me tiemblan las piernas y quiero esconderme.',
            prompt: '¿Qué emoción es?',
            hint1: 'Esconderse es lo que hacemos cuando algo nos asusta.',
            hint2: 'El cuerpo se prepara para alejarse del peligro.',
            explanation: 'Es miedo: el cuerpo se prepara para protegerse.',
            options: [emo('alegria'), emo('miedo', true), emo('tristeza')],
          },
          {
            scene: 'm2a2q2',
            sceneAlt: 'Un niño con la cara roja, los puños apretados y la boca abierta, como a punto de gritar',
            story: 'Siento la cara caliente, aprieto los puños y quiero gritar.',
            prompt: '¿Qué emoción es?',
            hint1: 'Apretar los puños es una señal de esta emoción.',
            hint2: 'Pasa cuando algo nos parece injusto.',
            explanation: 'Es enojo: la cara se calienta y los músculos se ponen duros.',
            options: [emo('enojo', true), emo('sorpresa'), emo('alegria')],
          },
          {
            scene: 'm2a2q3',
            sceneAlt: 'Una niña abraza sus rodillas, se toca la garganta y tiene los ojos llenos de lágrimas',
            story: 'Siento un nudo en la garganta y tengo ganas de llorar.',
            prompt: '¿Qué emoción es?',
            hint1: 'Las lágrimas aparecen con esta emoción.',
            hint2: 'Pasa cuando extrañamos a alguien o perdemos algo.',
            explanation: 'Es tristeza: a veces se siente como un nudo en la garganta.',
            options: [emo('alegria'), emo('enojo'), emo('tristeza', true)],
          },
          {
            scene: 'm2a2q4',
            sceneAlt: 'Un niño da un saltito hacia atrás con los ojos muy abiertos y la boca redonda',
            story: 'Abro mucho los ojos y la boca. ¡No me lo esperaba!',
            prompt: '¿Qué emoción es?',
            hint1: 'Algo pasó de repente.',
            hint2: 'Los ojos muy abiertos muestran esta emoción.',
            explanation: 'Es sorpresa: aparece cuando algo pasa sin avisar.',
            options: [emo('sorpresa', true), emo('miedo'), emo('tristeza')],
          },
        ],
      },
      {
        type: 'observa',
        title: 'Lo que sienten los demás',
        instruction: 'Observa la cara de tu amigo y elige la emoción.',
        sticker: 'sticker_amigos',
        minutes: 3,
        questions: [
          {
            scene: 'm2a3q1',
            sceneAlt: 'Cara de Beto con las cejas juntas hacia abajo y la boca apretada',
            prompt: 'Así se ve la cara de tu amigo Beto. ¿Qué siente?',
            hint1: 'Mira las cejas: están juntas y hacia abajo.',
            hint2: 'Su cara está roja y la boca apretada.',
            explanation: 'Beto siente enojo: cejas juntas y boca apretada.',
            options: [emo('enojo', true), emo('alegria'), emo('tristeza')],
          },
          {
            scene: 'm2a3q2',
            sceneAlt: 'Cara de Paula con los ojos muy abiertos, las cejas levantadas y la boca temblorosa',
            prompt: 'Así se ve la cara de tu amiga Paula. ¿Qué siente?',
            hint1: 'Mira los ojos: están muy abiertos.',
            hint2: 'La boca tiembla un poco.',
            explanation: 'Paula siente miedo: ojos muy abiertos y boca temblorosa.',
            options: [emo('alegria'), emo('miedo', true), emo('enojo')],
          },
          {
            scene: 'm2a3q3',
            sceneAlt: 'Cara de Simón con las cejas muy arriba y la boca abierta como una O',
            prompt: 'Así se ve la cara de tu primo Simón. ¿Qué siente?',
            hint1: 'Mira la boca: está abierta como una O.',
            hint2: 'Las cejas están muy arriba.',
            explanation: 'Simón siente sorpresa: boca en forma de O y cejas arriba.',
            options: [emo('tristeza'), emo('enojo'), emo('sorpresa', true)],
          },
        ],
      },
      {
        type: 'une',
        title: 'Emociones parecidas',
        instruction: 'Une cada palabra con la emoción parecida.',
        sticker: 'sticker_nubi',
        minutes: 4,
        questions: [
          {
            prompt: 'Une cada palabra con su emoción parecida.',
            hint1: '«Contento» se parece a sentirse feliz.',
            hint2: '«Furioso» es un enojo muy grande.',
            explanation: 'Contento es como alegría, furioso es como enojo y asustado es como miedo.',
            pairs: [
              { label: 'Contento', emotion: 'alegria' },
              { label: 'Furioso', emotion: 'enojo' },
              { label: 'Asustado', emotion: 'miedo' },
            ],
          },
          {
            prompt: 'Une cada palabra con su emoción parecida.',
            hint1: '«Asombrado» es cuando algo nos sorprende mucho.',
            hint2: '«Desanimado» es cuando tenemos poca energía y estamos tristes.',
            explanation: 'Desanimado es como tristeza, asombrado es como sorpresa y feliz es como alegría.',
            pairs: [
              { label: 'Desanimado', emotion: 'tristeza' },
              { label: 'Asombrado', emotion: 'sorpresa' },
              { label: 'Feliz', emotion: 'alegria' },
            ],
          },
          {
            prompt: 'Une cada palabra con su emoción parecida.',
            hint1: '«Nervioso» se siente parecido al miedo.',
            hint2: '«Molesto» es un enojo pequeño.',
            explanation: 'Nervioso es como miedo, molesto es como enojo y apenado es como tristeza.',
            pairs: [
              { label: 'Nervioso', emotion: 'miedo' },
              { label: 'Molesto', emotion: 'enojo' },
              { label: 'Apenado', emotion: 'tristeza' },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'calmarme',
    title: 'Aprendiendo a calmarme',
    world: 'Encuentro mi calma',
    skill: 'regulacion',
    icon: 'modulo_calmarme',
    activities: [
      {
        type: 'respira',
        title: 'Respira conmigo',
        instruction: 'Respira con Nubi: inhala cuando crece y exhala cuando baja.',
        sticker: 'sticker_respira',
        minutes: 2,
        questions: [],
      },
      {
        type: 'que_harias',
        title: 'Contar hasta diez',
        instruction: 'Lee la situación y elige qué te ayudaría.',
        sticker: 'sticker_diez',
        minutes: 3,
        questions: [
          {
            scene: 'm3a2q1',
            sceneAlt: 'Un hermanito abraza un dinosaurio de juguete y su hermana, enojada, respira con los ojos cerrados y cuenta con los dedos',
            prompt: 'Tu hermano tomó tu juguete y sientes mucho enojo. ¿Qué podrías hacer?',
            hint1: 'Busca una idea que te dé tiempo para calmarte.',
            hint2: 'Contar despacio ayuda a que el enojo baje.',
            explanation: 'Contar hasta diez te da tiempo para calmarte antes de actuar.',
            options: [
              helps('Contar hasta diez despacio', 'Contar te da tiempo para que el enojo baje antes de actuar.'),
              effect('Gritarle muy fuerte', 'Gritar puede hacer que los dos se enojen más. ¿Qué idea te ayudaría a calmarte primero?'),
              helps('Pedirle con calma que te lo devuelva', 'Hablar con calma ayuda a que tu hermano te escuche.'),
            ],
          },
          {
            scene: 'm3a2q2',
            sceneAlt: 'Alrededor de un juego de mesa una niña celebra que ganó y un niño frustrado levanta el pie hacia la mesa',
            prompt: 'Perdiste en un juego y te dan ganas de patear la mesa. ¿Qué podrías hacer?',
            hint1: 'Busca algo que te ayude sin lastimar a nadie.',
            hint2: 'Alejarte un momento y contar puede ayudarte.',
            explanation: 'Contar o respirar un momento ayuda a que la frustración baje.',
            options: [
              effect('Patear la mesa', 'Al patear te puedes lastimar y el juego se acaba para todos. Piensa en otra idea.'),
              helps('Contar hasta diez y respirar', 'Contar y respirar ayudan a que el cuerpo se calme.'),
              helps('Decir «me siento frustrado»', 'Poner nombre a lo que sientes ayuda a que los demás te entiendan.'),
            ],
          },
          {
            scene: 'm3a2q3',
            sceneAlt: 'Una niña abraza su caja de colores y no quiere prestarlos a su compañera',
            prompt: 'Tu amiga no quiere prestarte sus colores. ¿Qué podrías hacer?',
            hint1: 'Busca una idea en la que las dos puedan estar bien.',
            hint2: 'Preguntar es mejor que tomar sin permiso.',
            explanation: 'Preguntar y esperar ayuda a cuidar la amistad.',
            options: [
              helps('Preguntar si los pueden compartir después', 'Preguntar con amabilidad abre la puerta a compartir.'),
              effect('Quitárselos sin permiso', 'Quitar las cosas hace que tu amiga se enoje y se rompa la confianza. ¿Qué otra idea tienes?'),
              helps('Contar hasta diez y usar otros colores', 'Calmarte primero te ayuda a encontrar otra solución.'),
            ],
          },
        ],
      },
      {
        type: 'expreso',
        title: 'Un abrazo ayuda',
        instruction: 'Elige cómo te sientes, por qué y cuánto.',
        sticker: 'sticker_abrazo',
        minutes: 3,
        questions: [
          {
            prompt: 'Piensa en un día difícil. ¿Cómo te sentiste?',
            explanation: 'Contar cómo te sientes es el primer paso para pedir un abrazo.',
            reasons: REASONS_DAY,
          },
          {
            prompt: '¿Cómo te sientes en este momento?',
            explanation: 'Si lo necesitas, puedes pedir un abrazo a alguien de confianza.',
            reasons: REASONS_DAY,
          },
          {
            prompt: 'Imagina que alguien que quieres te da un abrazo. ¿Cómo te sentirías?',
            explanation: 'Un abrazo puede ayudar a que el cuerpo se sienta más tranquilo.',
            reasons: [
              { label: 'Alguien me acompaña', image: 'icono_compania' },
              { label: 'Estoy en un lugar seguro', image: 'icono_seguro' },
              { label: 'Sé que me quieren', image: 'icono_querido' },
              { label: 'Necesito un momento a solas', image: 'icono_solo' },
            ],
          },
        ],
      },
      {
        type: 'escucha',
        title: 'Muévete y suelta',
        instruction: 'Escucha la historia y elige la respuesta.',
        sticker: 'sticker_mover',
        minutes: 3,
        questions: [
          {
            scene: 'm3a4q1',
            sceneAlt: 'Sami salta en el parque como un canguro, con los brazos arriba',
            story: 'Cuando Sami siente enojo, salta como canguro diez veces y luego respira hondo.',
            prompt: '¿Qué hizo Sami para calmarse?',
            hint1: 'Usó su cuerpo y después su respiración.',
            hint2: 'Saltó como un canguro.',
            explanation: 'Sami saltó y respiró: mover el cuerpo ayuda a soltar el enojo.',
            options: [
              { label: 'Saltó y respiró hondo', correct: true },
              { label: 'Se fue a dormir', correct: false },
              { label: 'Rompió un juguete', correct: false },
            ],
          },
          {
            scene: 'm3a4q2',
            sceneAlt: 'Mía sacude los brazos sueltos como fideos, con una sonrisa tranquila',
            story: 'Mía sacude los brazos como un fideo suave cuando se siente nerviosa.',
            prompt: '¿Cómo mueve Mía los brazos?',
            hint1: 'Piensa en un fideo cocido.',
            hint2: 'Es un movimiento suave y relajado.',
            explanation: 'Mía mueve los brazos como un fideo suave para soltar los nervios.',
            options: [
              { label: 'Muy rápido y duro', correct: false },
              { label: 'Como un fideo suave', correct: true },
              { label: 'No los mueve', correct: false },
            ],
          },
          {
            scene: 'm3a4q3',
            sceneAlt: 'Al fondo Ian corre en el patio y adelante respira tranquilo con las manos en la barriga',
            story: 'Ian estaba molesto. Corrió un poco en el patio y después se sintió más tranquilo.',
            prompt: '¿Cómo se sintió Ian después de moverse?',
            hint1: 'Escucha el final de la historia.',
            hint2: 'Después de correr, su enojo bajó.',
            explanation: 'Ian se sintió más tranquilo: moverse ayuda a calmar el cuerpo.',
            options: [
              { label: 'Más enojado', correct: false },
              { label: 'Con mucho sueño', correct: false },
              { label: 'Más tranquilo', correct: true },
            ],
          },
        ],
      },
      {
        type: 'que_harias',
        title: 'Pienso qué puedo hacer',
        instruction: 'Lee la situación y elige qué te ayudaría.',
        sticker: 'sticker_idea',
        minutes: 3,
        questions: [
          {
            scene: 'm3a5q1',
            sceneAlt: 'Una niña se rasca la cabeza frente a un cuaderno con una tarea difícil',
            prompt: 'No te sale una tarea difícil. ¿Qué podrías hacer?',
            hint1: 'Busca una idea que te ayude a seguir intentando.',
            hint2: 'Pedir ayuda o descansar un poco son buenas ideas.',
            explanation: 'Pedir ayuda o tomar un descanso te ayudan a volver a intentarlo.',
            options: [
              helps('Pedir ayuda a un adulto', 'Pedir ayuda es de valientes: juntos es más fácil.'),
              helps('Descansar un poco y volver a intentar', 'Un descanso corto te ayuda a pensar con más calma.'),
              effect('Romper la hoja', 'Al romper la hoja pierdes lo que ya hiciste. Busca una idea que te ayude a seguir.'),
            ],
          },
          {
            scene: 'm3a5q2',
            sceneAlt: 'Un niño en su cama de noche, con una lucecita encendida y un adulto en la puerta',
            prompt: 'Tienes miedo antes de dormir. ¿Qué podrías hacer?',
            hint1: 'Busca una idea que te ayude a sentirte seguro.',
            hint2: 'Contarlo a alguien de confianza ayuda.',
            explanation: 'Hablar con un adulto o usar una lucecita te ayuda a sentirte seguro.',
            options: [
              helps('Contárselo a un adulto de confianza', 'Contar lo que sientes hace que el miedo sea más pequeño.'),
              effect('Quedarte callado toda la noche', 'Guardar el miedo hace que dure más. Contarlo ayuda.'),
              helps('Pedir una lucecita encendida', 'Una luz suave ayuda a que el cuarto se sienta seguro.'),
            ],
          },
          {
            scene: 'm3a5q3',
            sceneAlt: 'En el pasillo de la escuela un niño se burla de una niña que se siente mal',
            prompt: 'Un compañero se burla de ti. ¿Qué podrías hacer?',
            hint1: 'Busca una idea que te cuide a ti y no lastime a nadie.',
            hint2: 'Decirlo con calma o contarlo a un adulto son buenas ideas.',
            explanation: 'Decir con calma que no te gusta o buscar a un adulto te ayudan a cuidarte.',
            options: [
              effect('Burlarte tú también', 'Si te burlas también, la pelea crece y nadie se siente bien. ¿Qué otra idea tienes?'),
              helps('Decirle con calma que no te gusta', 'Decirlo con calma muestra cómo te sientes sin pelear.'),
              helps('Contárselo a la maestra', 'Un adulto puede ayudar a que se detengan las burlas.'),
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'relaciones',
    title: 'Mis relaciones con otros',
    world: 'Expreso lo que siento',
    skill: 'expresion',
    icon: 'modulo_relaciones',
    activities: [
      {
        type: 'expreso',
        title: 'Digo cómo me siento',
        instruction: 'Arma tu frase: cómo te sientes, por qué y cuánto.',
        sticker: 'sticker_voz',
        minutes: 3,
        questions: [
          {
            prompt: 'Hoy en la escuela me sentí…',
            explanation: 'Decir cómo te sientes ayuda a que te entiendan.',
            reasons: [
              { label: 'Aprendí algo nuevo', image: 'icono_aprender' },
              { label: 'Jugué en el recreo', image: 'icono_recreo' },
              { label: 'Algo no me salió bien', image: 'icono_error' },
              { label: 'Extrañé a mi familia', image: 'icono_extranar' },
            ],
          },
          {
            prompt: 'Cuando juego con mi familia me siento…',
            explanation: 'Contar lo que sientes con tu familia los ayuda a acompañarte.',
            reasons: [
              { label: 'Jugamos juntos', image: 'icono_jugar' },
              { label: 'Comemos juntos', image: 'icono_comer' },
              { label: 'Celebramos algo', image: 'icono_celebrar' },
              { label: 'No me prestan atención', image: 'icono_ignorado' },
            ],
          },
          {
            prompt: 'Cuando algo no sale como quiero me siento…',
            explanation: 'Todas las emociones están bien; lo importante es decirlas con respeto.',
            reasons: [
              { label: 'Me equivoqué', image: 'icono_equivocar' },
              { label: 'Se rompió algo', image: 'icono_roto' },
              { label: 'No pude salir a jugar', image: 'icono_lluvia' },
              { label: 'Perdí en un juego', image: 'icono_perder' },
            ],
          },
        ],
      },
      {
        type: 'que_harias',
        title: 'Pido ayuda',
        instruction: 'Lee la situación y elige qué te ayudaría.',
        sticker: 'sticker_ayuda',
        minutes: 3,
        questions: [
          {
            scene: 'm4a2q1',
            sceneAlt: 'Una niña se cayó en el recreo y se toca la rodilla; un amigo corre a avisar a la maestra',
            prompt: 'Te caes en el recreo y te duele la rodilla. ¿Qué podrías hacer?',
            hint1: 'Busca a alguien que pueda cuidarte.',
            hint2: 'Avisar a un adulto es una buena idea.',
            explanation: 'Avisar a un adulto o pedir compañía te ayuda a recibir cuidado.',
            options: [
              helps('Avisar a la maestra', 'La maestra puede revisar tu rodilla y cuidarte.'),
              effect('Esconderte para que nadie te vea', 'Si te escondes, nadie puede ayudarte con el dolor. ¿A quién podrías avisar?'),
              helps('Pedir a un amigo que te acompañe', 'Un amigo puede acompañarte a buscar ayuda.'),
            ],
          },
          {
            scene: 'm4a2q2',
            sceneAlt: 'Un niño mayor le quita la gorra a un niño más pequeño en el parque; una adulta está en una banca',
            prompt: 'Un niño mayor te molesta todos los días. ¿Qué podrías hacer?',
            hint1: 'Esto es algo para contarle a alguien grande.',
            hint2: 'Un adulto de confianza puede ayudarte.',
            explanation: 'Contarlo a un adulto de confianza es la mejor forma de cuidarte.',
            options: [
              helps('Contárselo a un adulto de confianza', 'Un adulto puede ayudar a que se detenga.'),
              helps('Alejarte y buscar a un adulto', 'Alejarte te cuida y buscar ayuda resuelve el problema.'),
              effect('No decir nada', 'Si no lo cuentas, puede seguir pasando. Contarlo te protege.'),
            ],
          },
          {
            scene: 'm4a2q3',
            sceneAlt: 'Unos niños juegan un juego de mesa y una niña mira la tarjeta de reglas sin entender',
            prompt: 'No entiendes las instrucciones de un juego. ¿Qué podrías hacer?',
            hint1: 'Busca una idea para entender mejor.',
            hint2: 'Preguntar está muy bien.',
            explanation: 'Preguntar o pedir que te lo expliquen otra vez te ayuda a jugar mejor.',
            options: [
              effect('Adivinar y enojarte si sale mal', 'Adivinar puede salir mal y hacerte sentir peor. ¿Qué podrías preguntar?'),
              helps('Preguntar cómo se juega', 'Preguntar te ayuda a entender y a disfrutar el juego.'),
              helps('Pedir que te lo expliquen otra vez', 'Pedir otra explicación es una forma valiente de aprender.'),
            ],
          },
        ],
      },
      {
        type: 'escucha',
        title: 'Digo lo que necesito',
        instruction: 'Escucha la historia y elige la respuesta.',
        sticker: 'sticker_escuchar',
        minutes: 3,
        questions: [
          {
            scene: 'm4a3q1',
            sceneAlt: 'Ana, después de jugar, recibe un vaso de agua de su papá',
            story: 'Ana tiene sed después de jugar. Le dice a su papá: «¿Me das agua, por favor?».',
            prompt: '¿Qué necesitaba Ana?',
            hint1: 'Escucha lo que pidió.',
            hint2: 'Tenía sed.',
            explanation: 'Ana necesitaba agua y lo pidió con amabilidad.',
            options: [
              { label: 'Agua', correct: true },
              { label: 'Un juguete', correct: false },
              { label: 'Dormir', correct: false },
            ],
          },
          {
            scene: 'm4a3q2',
            sceneAlt: 'Bruno bosteza y le dice a su mamá que necesita descansar, señalando el sofá',
            story: 'Bruno está muy cansado y le dice a su mamá: «Necesito descansar un ratito».',
            prompt: '¿Qué hizo Bruno?',
            hint1: 'Bruno usó palabras.',
            hint2: 'Dijo lo que le pasaba a su cuerpo.',
            explanation: 'Bruno dijo lo que necesitaba con palabras claras.',
            options: [
              { label: 'Se enojó sin decir nada', correct: false },
              { label: 'Dijo lo que necesitaba', correct: true },
              { label: 'Siguió jugando', correct: false },
            ],
          },
          {
            scene: 'm4a3q3',
            sceneAlt: 'Lucía se acerca con una sonrisa a unos niños que juegan con un aro y una cuerda',
            story: 'Lucía quiere jugar también y pregunta: «¿Puedo jugar con ustedes?».',
            prompt: '¿Cómo pidió Lucía jugar?',
            hint1: 'Escucha sus palabras.',
            hint2: 'Hizo una pregunta.',
            explanation: 'Lucía preguntó con amabilidad: así es más fácil que digan que sí.',
            options: [
              { label: 'Empujó a los demás', correct: false },
              { label: 'Se quedó mirando', correct: false },
              { label: 'Preguntó con amabilidad', correct: true },
            ],
          },
        ],
      },
      {
        type: 'que_harias',
        title: 'Expreso mi enojo con respeto',
        instruction: 'Lee la situación y elige qué te ayudaría.',
        sticker: 'sticker_respeto',
        minutes: 3,
        questions: [
          {
            scene: 'm4a4q1',
            sceneAlt: 'Un amigo se tapa la boca después de romper sin querer el dibujo de su compañera',
            prompt: 'Tu amigo rompió tu dibujo sin querer. ¿Qué podrías hacer?',
            hint1: 'Fue sin querer. Busca una idea que cuide la amistad.',
            hint2: 'Decir lo que sientes con calma ayuda.',
            explanation: 'Decir lo que sientes con calma ayuda a que tu amigo entienda.',
            options: [
              helps('Decir «me siento triste porque se rompió»', 'Usar «me siento…» ayuda a que tu amigo entienda sin pelear.'),
              effect('Romper algo de él', 'Romper algo suyo hace que los dos se sientan mal. ¿Qué otra idea tienes?'),
              helps('Respirar y después hablar', 'Respirar primero te ayuda a decirlo con calma.'),
            ],
          },
          {
            scene: 'm4a4q2',
            sceneAlt: 'La hermana sostiene el control de la tele y su hermano la mira molesto con los brazos cruzados',
            prompt: 'Tu hermana no te deja ver tu programa favorito. ¿Qué podrías hacer?',
            hint1: 'Busca una idea en la que los dos ganen algo.',
            hint2: 'Turnarse es una buena idea.',
            explanation: 'Proponer turnos o pedir ayuda a un adulto ayuda a ponerse de acuerdo.',
            options: [
              helps('Proponer turnos', 'Los turnos permiten que los dos vean lo que les gusta.'),
              effect('Gritar hasta que te deje', 'Gritar hace que la pelea crezca. ¿Qué idea los ayudaría a los dos?'),
              helps('Pedir ayuda a un adulto si no se ponen de acuerdo', 'Un adulto puede ayudarlos a encontrar una solución.'),
            ],
          },
          {
            scene: 'm4a4q3',
            sceneAlt: 'Un niño celebra que ganó el juego y su compañera le tiende la mano para felicitarlo',
            prompt: 'Pierdes en un juego de mesa. ¿Qué podrías hacer?',
            hint1: 'Busca una idea para seguir disfrutando el juego.',
            hint2: 'Felicitar o decir lo que sientes son buenas ideas.',
            explanation: 'Felicitar al ganador o decir «me siento frustrado» son formas respetuosas de expresarte.',
            options: [
              effect('Tirar las fichas', 'Tirar las fichas termina el juego para todos. ¿Qué podrías decir en lugar de eso?'),
              helps('Felicitar a quien ganó', 'Felicitar muestra que eres buen compañero de juego.'),
              helps('Decir «me siento frustrado»', 'Decir lo que sientes ayuda a que los demás te entiendan.'),
            ],
          },
        ],
      },
      {
        type: 'identifica',
        title: 'Me pongo en tu lugar',
        instruction: 'Mira la escena y elige cómo se siente.',
        sticker: 'sticker_familia',
        minutes: 3,
        questions: [
          {
            scene: 'm4a5q1',
            sceneAlt: 'Un niño llora junto a su perrito enfermo y su amigo le pone la mano en el hombro',
            prompt: 'Tu amigo llora porque su perrito está enfermo. ¿Cómo se siente?',
            hint1: 'Alguien que quiere mucho no está bien.',
            hint2: 'Llorar es una señal de esta emoción.',
            explanation: 'Tu amigo siente tristeza. Puedes acompañarlo y preguntarle cómo está.',
            options: [emo('tristeza', true), emo('alegria'), emo('enojo')],
          },
          {
            scene: 'm4a5q2',
            sceneAlt: 'Ema recibe una medalla de su maestra y sonríe mientras sus compañeros aplauden',
            prompt: 'A Ema le dieron un premio en la escuela. ¿Cómo se siente?',
            hint1: 'Recibió algo por su esfuerzo.',
            hint2: 'Cuando nos reconocen, sonreímos.',
            explanation: 'Ema siente alegría. Puedes felicitarla.',
            options: [emo('miedo'), emo('alegria', true), emo('tristeza')],
          },
          {
            scene: 'm4a5q3',
            sceneAlt: 'Un hermanito asustado abraza su conejo de peluche en la cama mientras afuera hay tormenta',
            prompt: 'Tu hermanito no puede dormir porque escucha truenos. ¿Cómo se siente?',
            hint1: 'Los truenos suenan fuerte en la noche.',
            hint2: 'Quiere que alguien lo acompañe.',
            explanation: 'Tu hermanito siente miedo. Puedes acompañarlo un rato.',
            options: [emo('alegria'), emo('enojo'), emo('miedo', true)],
          },
        ],
      },
    ],
  },
];

/** Opciones de emoción para «Expreso lo que siento». */
export const EXPRESO_EMOTIONS: OptionDef[] = (Object.keys(EMOTION_LABEL) as Emotion[]).map((code) => emo(code));

export const BADGES = [
  { code: 'primer_paso', title: 'Primer paso', condition: 'Completa tu primera actividad.', icon: 'insignia_primer_paso' },
  { code: 'detective_alegria', title: 'Detective de la alegría', condition: 'Acierta 3 veces con la emoción alegría.', icon: 'insignia_detective_alegria' },
  { code: 'detective_tristeza', title: 'Detective de la tristeza', condition: 'Acierta 3 veces con la emoción tristeza.', icon: 'insignia_detective_tristeza' },
  { code: 'detective_enojo', title: 'Detective del enojo', condition: 'Acierta 3 veces con la emoción enojo.', icon: 'insignia_detective_enojo' },
  { code: 'detective_miedo', title: 'Detective del miedo', condition: 'Acierta 3 veces con la emoción miedo.', icon: 'insignia_detective_miedo' },
  { code: 'detective_sorpresa', title: 'Detective de la sorpresa', condition: 'Acierta 3 veces con la emoción sorpresa.', icon: 'insignia_detective_sorpresa' },
  { code: 'calma', title: 'Calma total', condition: 'Completa «Respira conmigo».', icon: 'insignia_calma' },
  { code: 'valiente', title: 'Valiente', condition: 'Termina una actividad después de intentarlo otra vez.', icon: 'insignia_valiente' },
  { code: 'constancia', title: 'Constancia', condition: 'Completa tu meta semanal.', icon: 'insignia_constancia' },
];

export const STICKERS = [
  { code: 'sticker_alegria', title: 'Sol sonriente', image: 'sticker_alegria' },
  { code: 'sticker_tristeza', title: 'Nube con paraguas', image: 'sticker_tristeza' },
  { code: 'sticker_enojo', title: 'Volcán gruñón', image: 'sticker_enojo' },
  { code: 'sticker_miedo', title: 'Tortuga tímida', image: 'sticker_miedo' },
  { code: 'sticker_sorpresa', title: 'Caja sorpresa', image: 'sticker_sorpresa' },
  { code: 'sticker_estrella', title: 'Lupa del corazón', image: 'sticker_estrella' },
  { code: 'sticker_corazon', title: 'Corazón valiente', image: 'sticker_corazon' },
  { code: 'sticker_amigos', title: 'Abrazo de amigos', image: 'sticker_amigos' },
  { code: 'sticker_nubi', title: 'Piezas que encajan', image: 'sticker_nubi' },
  { code: 'sticker_respira', title: 'Molinete de viento', image: 'sticker_respira' },
  { code: 'sticker_diez', title: 'Ábaco de colores', image: 'sticker_diez' },
  { code: 'sticker_abrazo', title: 'Osito abrazador', image: 'sticker_abrazo' },
  { code: 'sticker_mover', title: 'Canguro saltarín', image: 'sticker_mover' },
  { code: 'sticker_idea', title: 'Bombilla de ideas', image: 'sticker_idea' },
  { code: 'sticker_voz', title: 'Globo de palabras', image: 'sticker_voz' },
  { code: 'sticker_ayuda', title: 'Mano amiga', image: 'sticker_ayuda' },
  { code: 'sticker_escuchar', title: 'Conejo que escucha', image: 'sticker_escuchar' },
  { code: 'sticker_respeto', title: 'Pajarito de la calma', image: 'sticker_respeto' },
  { code: 'sticker_familia', title: 'En tus zapatos', image: 'sticker_familia' },
];

export const RECOMMENDATIONS = [
  {
    skill: 'reconocimiento',
    title: 'Adivinen la cara',
    body: 'Pueden turnarse para poner una cara de emoción frente al espejo y adivinar cuál es.',
    minutes: 5,
  },
  {
    skill: 'reconocimiento',
    title: 'Emociones en el cuento',
    body: 'Al leer un cuento, pueden detenerse y preguntar: «¿Cómo crees que se siente este personaje?».',
    minutes: 10,
  },
  {
    skill: 'reconocimiento',
    title: 'Detectives en la calle',
    body: 'Durante un paseo, pueden buscar juntos personas que parezcan alegres, sorprendidas o tranquilas.',
    minutes: 5,
  },
  {
    skill: 'comprension',
    title: 'El momento de las emociones',
    body: 'Durante la cena, cada persona puede contar una emoción que sintió hoy y qué la causó.',
    minutes: 5,
  },
  {
    skill: 'comprension',
    title: '¿Dónde lo siento?',
    body: 'Pueden conversar sobre en qué parte del cuerpo se siente cada emoción: la barriga, el pecho o la cara.',
    minutes: 5,
  },
  {
    skill: 'comprension',
    title: 'Dibujo de mi día',
    body: 'Pueden dibujar juntos algo que pasó en el día y ponerle el color de la emoción que sintieron.',
    minutes: 10,
  },
  {
    skill: 'regulacion',
    title: 'Respiren como Nubi',
    body: 'Inhalen juntos mientras cuentan hasta cuatro y exhalen lentamente. Repitan tres veces.',
    minutes: 3,
  },
  {
    skill: 'regulacion',
    title: 'Rincón de la calma',
    body: 'Pueden armar juntos un rincón tranquilo con un cojín y un peluche para usar cuando haga falta.',
    minutes: 10,
  },
  {
    skill: 'regulacion',
    title: 'Contar hasta diez',
    body: 'Pueden practicar contar despacio hasta diez en un momento tranquilo, para usarlo cuando llegue el enojo.',
    minutes: 3,
  },
  {
    skill: 'expresion',
    title: 'Frase del día',
    body: 'Pueden completar juntos la frase «Hoy me sentí… porque…» antes de dormir.',
    minutes: 5,
  },
  {
    skill: 'expresion',
    title: 'Pedir lo que necesito',
    body: 'Pueden jugar a pedir cosas con «por favor» y «necesito…», turnándose los papeles.',
    minutes: 5,
  },
  {
    skill: 'expresion',
    title: 'Termómetro de emociones',
    body: 'Pueden dibujar un termómetro y marcar cuánto sintieron una emoción: un poquito, algo o mucho.',
    minutes: 10,
  },
];
