// Rutina 6 días — Calistenia progresiva + Piernas + Escalada + Movilidad

export type Target =
  | { kind: 'reps'; min: number; max: number; perSide?: boolean; weight?: boolean }
  | { kind: 'seconds'; min: number; max: number; perSide?: boolean }
  | { kind: 'minutes'; min: number; max: number }
  /** Serie compuesta (ej: plancha + dead bug): solo se marca como hecha */
  | { kind: 'check'; label: string }
  /** Máximas repeticiones/series en un tiempo fijo */
  | { kind: 'amrap'; minutes: number; unit: string }
  /** Cada minuto, X repeticiones; descansa lo que sobra del minuto */
  | { kind: 'emom'; minutes: number; reps: string; unit: string }
  /** Trabajo/descanso por rondas */
  | { kind: 'tabata'; rounds: number; work: number; rest: number; unit: string }

export type Guide = {
  steps: string[]
  /** Texto a buscar en YouTube */
  video: string
  /** Carpeta en public/exercises (free-exercise-db, dominio público) */
  image?: string
  imageNote?: string
}

export type Exercise = {
  id: string
  name: string
  sets: number
  target: Target
  /** Descanso entre series, en segundos (0 = sin descanso) */
  rest: number
  note?: string
  /** Bloque dentro de la sesión (días en casa) */
  block?: string
  /** Texto que reemplaza al formato automático de series x reps */
  display?: string
  /** Variantes que se alternan semana a semana */
  alternates?: [string, string]
  /** Qué anotar como "variante" para medir la progresión */
  levelHint?: string
  guide: Guide
  /** Nombre del ejercicio original cuando este es un reemplazo elegido */
  swappedFrom?: string
}

/** Ejercicio equivalente para cuando falta material o está ocupado (hereda series, reps y descanso) */
export type Alternative = {
  id: string
  name: string
  note?: string
  /** Fuerza a registrar (o no) kg */
  weight?: boolean
  guide: Guide
}

type M1Id = 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6'
type M2Id = 'm2d1' | 'm2d2' | 'm2d3' | 'm2d4' | 'm2d5'
export type SessionId = M1Id | M2Id

export type Session = {
  id: SessionId
  name: string
  place: 'Gimnasio' | 'Casa'
  estimate: string
  warmup: string[]
  /** Título del calentamiento (por defecto "Calentamiento (10')") */
  warmupTitle?: string
  intro?: string
  exercises: Exercise[]
}

const GYM_WARMUP = [
  'Movilidad de tobillo',
  'Movilidad de cadera',
  'Movilidad de hombro',
  '1-2 series de aproximación del primer ejercicio',
]

const HOME_INTRO =
  'No es descanso pasivo: movilidad de cadera y hombro (zonas clave en escalada), estiramiento y algo de calistenia sin equipo para no perder frecuencia de práctica.'

const smithSquat = (id: string, sets: number, min: number, max: number, rest: number, note: string): Exercise => ({
  id,
  name: 'Sentadilla Smith (90°)',
  sets,
  target: { kind: 'reps', min, max, weight: true },
  rest,
  note,
  guide: {
    steps: [
      'Barra apoyada sobre la parte alta de la espalda (trapecios), no sobre el cuello.',
      'Pies un poco adelantados respecto a la barra, al ancho de hombros.',
      'Baja hasta 90° de rodilla (muslos paralelos al suelo) con el pecho arriba.',
      'Sube empujando con todo el pie. Tope de la máquina: 90 kg.',
    ],
    video: 'sentadilla en multipower smith técnica',
    image: 'Smith_Machine_Squat',
  },
})

const hamstringStretch: Guide = {
  steps: [
    'Sentado con una pierna estirada y la otra doblada (o de pie con el talón sobre un apoyo bajo).',
    'Inclínate desde la cadera con la espalda recta hasta sentir el estiramiento detrás del muslo.',
    'Mantén respirando, sin rebotar.',
  ],
  video: 'estiramiento de isquiotibiales sentado',
  image: 'Seated_Floor_Hamstring_Stretch',
}

const adductorStretch: Guide = {
  steps: [
    'Mariposa: sentado, plantas de los pies juntas, rodillas hacia afuera; empuja suave las rodillas hacia el suelo.',
    'O sentadilla sumo sostenida: pies muy abiertos, baja y empuja las rodillas hacia afuera con los codos.',
    'Espalda recta, respira profundo.',
  ],
  video: 'estiramiento de aductores mariposa',
  image: 'Groin_and_Back_Stretch',
  imageNote: 'La imagen muestra la mariposa llevando el tronco hacia adelante.',
}

/** Mes 1 — Rutina 6 días (se conserva para el historial y por si se quiere volver) */
const M1: Record<M1Id, Session> = {
  d1: {
    id: 'd1',
    name: 'Día 1 — Piernas + Tracción + Core',
    place: 'Gimnasio',
    estimate: '~55\'',
    warmup: GYM_WARMUP,
    exercises: [
      smithSquat('d1-smith', 4, 8, 10, 120, 'Progresión de carga hacia el tope de 90 kg'),
      {
        id: 'bulgara-mancuernas',
        name: 'Zancada búlgara con mancuernas',
        sets: 3,
        target: { kind: 'reps', min: 10, max: 10, perSide: true, weight: true },
        rest: 90,
        note: 'Pie trasero en banco',
        guide: {
          steps: [
            'De espaldas al banco, apoya el empeine del pie trasero sobre él. Una mancuerna en cada mano.',
            'Baja recto hasta que la rodilla trasera casi toque el suelo; la rodilla delantera sigue la línea del pie.',
            'Sube empujando con el talón delantero. Todas las reps de una pierna y luego cambia.',
          ],
          video: 'sentadilla búlgara con mancuernas técnica',
          image: 'Split_Squat_with_Dumbbells',
        },
      },
      {
        id: 'dominadas',
        name: 'Dominadas (BW o lastradas)',
        sets: 4,
        target: { kind: 'reps', min: 5, max: 8, weight: true },
        rest: 120,
        note: 'Si con el peso corporal es fácil, agregar lastre (anota los kg extra)',
        guide: {
          steps: [
            'Agarre prono (palmas hacia adelante), un poco más ancho que los hombros.',
            'Empieza colgado con los brazos estirados y los hombros activos (lejos de las orejas).',
            'Sube hasta pasar la barbilla sobre la barra, sin balanceo, y baja controlado.',
          ],
          video: 'dominadas técnica correcta',
          image: 'Pullups',
        },
      },
      {
        id: 'rdl-mancuernas',
        name: 'Peso muerto rumano con mancuernas',
        sets: 3,
        target: { kind: 'reps', min: 10, max: 10, weight: true },
        rest: 90,
        note: 'Controlar bajada, foco isquios/glúteo',
        guide: {
          steps: [
            'De pie, mancuernas delante de los muslos, rodillas ligeramente flexionadas.',
            'Lleva la cadera hacia atrás bajando las mancuernas pegadas a las piernas, espalda neutra.',
            'Baja hasta sentir tensión en isquios (más o menos mitad de la tibia) y sube apretando glúteos.',
          ],
          video: 'peso muerto rumano con mancuernas técnica',
          image: 'Stiff-Legged_Dumbbell_Deadlift',
          imageNote: 'En el rumano las rodillas van un poco más flexionadas que en la imagen.',
        },
      },
      {
        id: 'pantorrillas-mancuernas',
        name: 'Pantorrillas de pie con mancuernas',
        sets: 4,
        target: { kind: 'reps', min: 15, max: 20, weight: true },
        rest: 45,
        note: 'Pausa arriba 1-2"',
        guide: {
          steps: [
            'De pie con una mancuerna en cada mano (puntas sobre un disco o escalón para más rango).',
            'Sube en puntas lo más alto posible y pausa 1-2".',
            'Baja lento hasta estirar la pantorrilla.',
          ],
          video: 'elevación de talones de pie con mancuernas',
          image: 'Standing_Dumbbell_Calf_Raise',
        },
      },
      {
        id: 'plancha-deadbug',
        name: 'Plancha + Dead bug',
        sets: 3,
        target: { kind: 'check', label: '30" plancha + 10 dead bug por lado' },
        display: '3 x (30" plancha + 10 por lado)',
        rest: 60,
        note: 'Core anti-extensión',
        guide: {
          steps: [
            'Plancha 30": antebrazos y puntas de pie, cuerpo en línea, glúteos y abdomen apretados.',
            'Sin descanso, dead bug: boca arriba, brazos al techo y rodillas a 90°.',
            'Espalda baja pegada al suelo; estira brazo y pierna contrarios, alterna 10 por lado.',
          ],
          video: 'plancha y dead bug core',
          image: 'Plank',
        },
      },
    ],
  },
  d2: {
    id: 'd2',
    name: 'Día 2 — Empuje + Tracción + Hip Thrust',
    place: 'Gimnasio',
    estimate: '~58\'',
    warmup: GYM_WARMUP,
    exercises: [
      {
        id: 'archer-amrap',
        name: 'Push up Archer',
        sets: 1,
        target: { kind: 'amrap', minutes: 12, unit: 'series totales' },
        display: 'AMRAP 12\', alternando brazos',
        rest: 0,
        note: 'Registro anterior: 22 series x 2 rep por brazo. Anotar series totales.',
        guide: {
          steps: [
            'Manos muy abiertas (el doble del ancho de hombros), dedos hacia afuera.',
            'Baja hacia un lado doblando ese brazo mientras el otro queda casi estirado.',
            'Empuja, vuelve al centro y alterna. Haz series cortas con buena técnica durante los 12\'.',
          ],
          video: 'archer push up flexiones arquero tutorial',
        },
      },
      {
        id: 'hip-thrust-smith',
        name: 'Hip Thrust en Smith',
        sets: 4,
        target: { kind: 'reps', min: 10, max: 10, weight: true },
        rest: 90,
        note:
          'Espalda alta en banco, barra sobre la cadera. Si molesta (antecedente de dolor lumbar), cambiar a mancuerna.',
        guide: {
          steps: [
            'Espalda alta (bajo los omóplatos) apoyada en el banco, barra sobre la cadera con almohadilla.',
            'Pies apoyados al ancho de caderas, de modo que arriba las tibias queden verticales.',
            'Sube empujando con los talones hasta alinear rodillas-cadera-hombros, sin arquear la zona lumbar.',
            'Pausa arriba apretando glúteos y baja controlado.',
          ],
          video: 'hip thrust en smith técnica',
          image: 'Barbell_Hip_Thrust',
          imageNote: 'La imagen usa barra libre; tú lo haces en la Smith.',
        },
      },
      {
        id: 'fondos-banco',
        name: 'Fondos en banco',
        sets: 4,
        target: { kind: 'reps', min: 8, max: 12 },
        rest: 90,
        note: 'Sustituto de paralelas, rango corto',
        guide: {
          steps: [
            'Manos en el borde del banco detrás de ti, dedos hacia adelante; piernas estiradas o dobladas.',
            'Baja doblando los codos hacia atrás (no hacia afuera) hasta unos 90°, rango corto.',
            'Empuja hasta estirar los brazos sin encoger los hombros.',
          ],
          video: 'fondos en banco tríceps técnica',
          image: 'Bench_Dips',
        },
      },
      {
        id: 'remo-mancuerna',
        name: 'Remo con mancuerna a una mano',
        sets: 4,
        target: { kind: 'reps', min: 10, max: 10, perSide: true, weight: true },
        rest: 90,
        note: 'Apoyo en banco',
        guide: {
          steps: [
            'Rodilla y mano del mismo lado apoyadas en el banco, espalda plana.',
            'Tira de la mancuerna hacia la cadera llevando el codo pegado al cuerpo.',
            'Baja controlado estirando el brazo. Todas las reps y cambia de lado.',
          ],
          video: 'remo con mancuerna a una mano técnica',
          image: 'One-Arm_Dumbbell_Row',
        },
      },
      {
        id: 'goblet-squat',
        name: 'Goblet Squat con kettlebell',
        sets: 3,
        target: { kind: 'reps', min: 12, max: 15, weight: true },
        rest: 90,
        note: 'Volumen extra de pierna, pecho arriba',
        guide: {
          steps: [
            'Sostén la kettlebell pegada al pecho con ambas manos.',
            'Baja profundo entre las piernas manteniendo el pecho arriba y los codos dentro de las rodillas.',
            'Sube empujando el suelo con todo el pie.',
          ],
          video: 'goblet squat kettlebell técnica',
          image: 'Goblet_Squat',
        },
      },
      {
        id: 'face-pull-banda',
        name: 'Face pull con banda elástica',
        sets: 3,
        target: { kind: 'reps', min: 15, max: 15 },
        rest: 45,
        note: 'Compensatorio de hombro',
        levelHint: 'Banda (ej: liviana, media)',
        guide: {
          steps: [
            'Ancla la banda a la altura de la cara y tómala con ambas manos, palmas hacia abajo.',
            'Tira hacia la cara separando las manos y llevando los codos altos y atrás.',
            'Termina con los pulgares apuntando atrás (rotación externa) y vuelve lento.',
          ],
          video: 'face pull con banda elástica',
          image: 'Face_Pull',
          imageNote: 'La imagen usa polea; tú lo haces con banda.',
        },
      },
    ],
  },
  d3: {
    id: 'd3',
    name: 'Día 3 — Calistenia técnica + Piernas + Core',
    place: 'Gimnasio',
    estimate: '~55\'',
    warmup: GYM_WARMUP,
    exercises: [
      {
        id: 'front-lever-negativas',
        name: 'Front lever tuck negativas (barra)',
        sets: 6,
        target: { kind: 'reps', min: 1, max: 1, perSide: true },
        display: '6 x (1 izq + 1 der) = 12 reps',
        rest: 75,
        note: 'Descanso 1\'-1\'30". Progresión según vienes trabajando.',
        levelHint: 'Variante (ej: tuck, advanced tuck)',
        guide: {
          steps: [
            'Colgado de la barra, sube a la posición alta (cadera a la altura de la barra) con rodillas recogidas al pecho.',
            'Baja lo más lento posible manteniendo el cuerpo horizontal y los brazos estirados.',
            'Escápulas deprimidas y retraídas todo el tiempo. Calidad sobre cantidad.',
          ],
          video: 'front lever tuck negativas tutorial',
        },
      },
      {
        id: 'dominadas-emom',
        name: 'Dominadas variadas (prona/supina)',
        sets: 1,
        target: { kind: 'emom', minutes: 10, reps: '6-8', unit: 'reps totales' },
        display: 'EMOM 10\', 6-8 rep',
        rest: 0,
        note: 'Al inicio de cada minuto, 6-8 dominadas; descansa lo que sobre. Anotar reps totales.',
        guide: {
          steps: [
            'Alterna cada minuto entre agarre prono (palmas adelante) y supino (palmas hacia ti).',
            'Haz las reps al empezar el minuto y descansa el resto hasta el siguiente aviso.',
            'Si no llegas a 6, baja a las que puedas con buena técnica.',
          ],
          video: 'dominadas prono y supino diferencias técnica',
          image: 'Chin-Up',
          imageNote: 'La imagen muestra el agarre supino (chin-up).',
        },
      },
      smithSquat('d3-smith', 3, 12, 12, 90, 'Más reps, menos carga que Día 1 (variación de estímulo)'),
      {
        id: 'tabata-saltos',
        name: 'Squat jump + Zancada jump',
        sets: 1,
        target: { kind: 'tabata', rounds: 8, work: 20, rest: 20, unit: 'reps totales' },
        display: 'Tabata 20"/20" x 8 rondas',
        rest: 0,
        note: 'Máximas reps posibles por bloque',
        guide: {
          steps: [
            'Alterna rondas: sentadilla con salto (baja y salta explosivo) y zancada con salto (cambia de pierna en el aire).',
            '20" a máxima intensidad, 20" de descanso, 8 rondas.',
            'Aterriza suave, con las rodillas siguiendo la línea de los pies.',
          ],
          video: 'squat jump y jumping lunge técnica',
          image: 'Freehand_Jump_Squat',
        },
      },
      {
        id: 'curl-fitball',
        name: 'Curl femoral en fitball',
        sets: 3,
        target: { kind: 'reps', min: 12, max: 12 },
        rest: 60,
        note: 'Talones sobre la pelota, elevar cadera y flexionar',
        guide: {
          steps: [
            'Boca arriba con los talones sobre el fitball y los brazos en el suelo.',
            'Eleva la cadera hasta alinear el cuerpo.',
            'Sin bajar la cadera, flexiona las rodillas acercando la pelota a los glúteos y vuelve lento.',
          ],
          video: 'curl femoral en fitball técnica',
          image: 'Ball_Leg_Curl',
        },
      },
      {
        id: 'plancha-dinamica-balon',
        name: 'Plancha dinámica con pelota medicinal',
        sets: 3,
        target: { kind: 'reps', min: 10, max: 10 },
        rest: 60,
        note: 'Core + estabilidad de hombro',
        guide: {
          steps: [
            'Plancha alta con las manos en el suelo y la pelota medicinal al lado.',
            'Pasa la pelota de un lado al otro con una mano (o lleva una mano a la pelota y vuelve) sin rotar la cadera.',
            'Cuerpo en línea y abdomen firme todo el tiempo.',
          ],
          video: 'plancha con balón medicinal core estabilidad',
        },
      },
    ],
  },
  d4: {
    id: 'd4',
    name: 'Día 4 — Fuerza + Piernas + Empuje',
    place: 'Gimnasio',
    estimate: '~58\'',
    warmup: GYM_WARMUP,
    exercises: [
      {
        id: 'dominadas-lastre',
        name: 'Dominadas con lastre',
        sets: 4,
        target: { kind: 'reps', min: 6, max: 6, weight: true },
        rest: 120,
        note: 'Progresión real de carga, estilo fuerza de escalada (anota los kg de lastre)',
        guide: {
          steps: [
            'Cinturón de lastre o mancuerna entre los pies.',
            'Desde brazos estirados y hombros activos, sube hasta la barbilla sobre la barra.',
            'Baja controlado. Sube el lastre solo si completas las 6 reps con técnica limpia.',
          ],
          video: 'dominadas con lastre técnica',
          image: 'Weighted_Pull_Ups',
        },
      },
      smithSquat('d4-smith', 4, 6, 6, 120, 'Carga más alta, menos reps que Día 1 y 3'),
      {
        id: 'pike-explosivo-emom',
        name: 'Pike push up / Push up explosivo',
        sets: 1,
        target: { kind: 'emom', minutes: 10, reps: '4-6', unit: 'reps totales' },
        display: 'EMOM 10\', 4-6 rep',
        alternates: ['Pike push up', 'Push up explosivo'],
        rest: 0,
        note: 'Alternar cuál de los dos semana a semana',
        guide: {
          steps: [
            'Pike: cadera alta en "V" invertida, baja la cabeza entre las manos y empuja.',
            'Explosivo: flexión normal empujando tan fuerte que las manos despeguen del suelo; aterriza suave.',
            'Al inicio de cada minuto 4-6 reps; descansa lo que sobre.',
          ],
          video: 'pike push up y flexiones explosivas tutorial',
          image: 'Plyo_Push-up',
          imageNote: 'La imagen muestra el push up explosivo.',
        },
      },
      {
        id: 'press-militar',
        name: 'Press militar con mancuernas',
        sets: 4,
        target: { kind: 'reps', min: 8, max: 8, weight: true },
        rest: 90,
        note: 'Progresión lineal',
        guide: {
          steps: [
            'Mancuernas a la altura de los hombros, palmas hacia adelante, abdomen y glúteos firmes.',
            'Empuja hacia arriba hasta casi estirar los brazos sin arquear la espalda.',
            'Baja controlado hasta los hombros.',
          ],
          video: 'press militar con mancuernas técnica',
          image: 'Dumbbell_Shoulder_Press',
        },
      },
      {
        id: 'zancada-salto',
        name: 'Zancada con salto',
        sets: 3,
        target: { kind: 'reps', min: 10, max: 10, perSide: true },
        rest: 90,
        note: 'Explosivo, aterrizaje suave',
        guide: {
          steps: [
            'Desde posición de zancada, salta explosivo y cambia de pierna en el aire.',
            'Aterriza suave con la rodilla delantera sobre el pie y baja directo a la siguiente zancada.',
            'Tronco erguido. 10 por pierna.',
          ],
          video: 'zancada con salto jumping lunge técnica',
          image: 'Split_Jump',
        },
      },
      {
        id: 'rotacion-core',
        name: 'Rotación de core con banda/polea',
        sets: 3,
        target: { kind: 'reps', min: 12, max: 12, perSide: true },
        rest: 60,
        note: 'Anti-rotación',
        guide: {
          steps: [
            'De lado a la polea o banda anclada a la altura del pecho, tómala con ambas manos.',
            'Estira los brazos al frente resistiendo que te gire (o gira el tronco de forma controlada).',
            'Cadera fija y abdomen firme. Todas las reps y cambia de lado.',
          ],
          video: 'pallof press con rotación polea banda',
          image: 'Pallof_Press_With_Rotation',
        },
      },
    ],
  },
  d5: {
    id: 'd5',
    name: 'Día 5 — Movilidad de cadera + Calistenia ligera',
    place: 'Casa',
    estimate: '~45\'',
    warmup: [],
    intro: HOME_INTRO,
    exercises: [
      {
        id: 'rotaciones-pierna',
        block: 'Movilidad cadera',
        name: 'Rotaciones de pierna estirada (interna/externa)',
        sets: 2,
        target: { kind: 'reps', min: 8, max: 8, perSide: true },
        rest: 0,
        guide: {
          steps: [
            'Boca arriba con una pierna estirada.',
            'Gira toda la pierna hacia adentro y hacia afuera desde la cadera (la punta del pie marca el giro).',
            'Movimiento lento y en el mayor rango cómodo.',
          ],
          video: 'rotación interna y externa de cadera pierna estirada',
        },
      },
      {
        id: 'fire-hydrants',
        block: 'Movilidad cadera',
        name: 'Fire hydrants',
        sets: 2,
        target: { kind: 'reps', min: 12, max: 12, perSide: true },
        rest: 0,
        note: 'Fortalece abductores',
        guide: {
          steps: [
            'En cuadrupedia: manos bajo los hombros, rodillas bajo la cadera.',
            'Abre una rodilla hacia el costado (como un perro en un hidrante) sin rotar el tronco.',
            'Baja controlado. Todas las reps y cambia de lado.',
          ],
          video: 'fire hydrant ejercicio cadera',
        },
      },
      {
        id: 'rana-rotaciones',
        block: 'Movilidad cadera',
        name: 'Estiramiento de rana con rotaciones',
        sets: 2,
        target: { kind: 'seconds', min: 30, max: 30 },
        rest: 0,
        note: 'Apertura de cadera',
        guide: {
          steps: [
            'En cuadrupedia, abre las rodillas todo lo que puedas con los tobillos alineados con las rodillas.',
            'Lleva la cadera hacia atrás lentamente hasta sentir los aductores.',
            'Agrega pequeñas rotaciones/balanceos adelante-atrás.',
          ],
          video: 'frog stretch estiramiento de rana cadera',
        },
      },
      {
        id: 'malasana',
        block: 'Movilidad cadera',
        name: 'Postura Malasana (sentadilla profunda sostenida)',
        sets: 2,
        target: { kind: 'seconds', min: 30, max: 45 },
        rest: 0,
        note: 'Apertura de cadera en rango profundo (compensa el Smith limitado a 90°)',
        guide: {
          steps: [
            'Pies un poco más abiertos que la cadera, puntas hacia afuera.',
            'Baja a la sentadilla más profunda posible con los talones apoyados.',
            'Manos juntas al pecho, codos empujando las rodillas hacia afuera, pecho arriba.',
          ],
          video: 'malasana postura sentadilla profunda yoga',
        },
      },
      {
        id: 'bulgara-bw',
        block: 'Calistenia BW',
        name: 'Sentadilla búlgara sin peso o salto en banco bajo/step',
        sets: 3,
        target: { kind: 'reps', min: 12, max: 12, perSide: true },
        rest: 60,
        note: 'Adaptar a lo que tengas en casa',
        guide: {
          steps: [
            'Pie trasero sobre una silla o sofá, el delantero un paso largo adelante.',
            'Baja recto hasta que la rodilla trasera casi toque el suelo y sube con el talón delantero.',
            'Todas las reps de una pierna y luego cambia.',
          ],
          video: 'sentadilla búlgara sin peso en casa',
          image: 'Split_Squat_with_Dumbbells',
          imageNote: 'La imagen usa mancuernas; en casa se hace sin peso.',
        },
      },
      {
        id: 'plancha-lateral',
        block: 'Calistenia BW',
        name: 'Plancha + Plancha lateral',
        sets: 3,
        target: { kind: 'check', label: '20" plancha + 20" lateral por lado' },
        display: '3 x (20" + 20" por lado)',
        rest: 45,
        note: 'Progresión desde los registros de escalada',
        guide: {
          steps: [
            'Plancha frontal 20": antebrazos y puntas de pie, cuerpo en línea.',
            'Gira a plancha lateral 20" sobre un antebrazo, cadera arriba; luego 20" del otro lado.',
            'No dejes caer la cadera.',
          ],
          video: 'plancha frontal y plancha lateral técnica',
          image: 'Side_Bridge',
        },
      },
      {
        id: 'puente-gluteos',
        block: 'Calistenia BW',
        name: 'Puente de glúteos (hip thrust BW)',
        sets: 3,
        target: { kind: 'reps', min: 15, max: 15 },
        rest: 45,
        note: 'Pausa 1-2" arriba',
        guide: {
          steps: [
            'Boca arriba, rodillas dobladas y pies apoyados.',
            'Sube la cadera empujando con los talones hasta alinear rodillas-cadera-hombros.',
            'Pausa 1-2" apretando glúteos, sin arquear la zona lumbar, y baja lento.',
          ],
          video: 'puente de glúteos en el suelo técnica',
          image: 'Butt_Lift_Bridge',
        },
      },
      {
        id: 'd5-isquios',
        block: 'Estiramiento final',
        name: 'Isquiotibiales (de pie o sentado, pierna extendida)',
        sets: 2,
        target: { kind: 'seconds', min: 30, max: 30, perSide: true },
        rest: 0,
        guide: hamstringStretch,
      },
      {
        id: 'd5-aductores',
        block: 'Estiramiento final',
        name: 'Aductores (mariposa o sentadilla sumo sostenida)',
        sets: 2,
        target: { kind: 'seconds', min: 30, max: 45 },
        rest: 0,
        guide: adductorStretch,
      },
      {
        id: 'gato-camello-nino',
        block: 'Estiramiento final',
        name: 'Espalda (gato-camello + estiramiento de niño)',
        sets: 1,
        target: { kind: 'minutes', min: 2, max: 2 },
        rest: 0,
        guide: {
          steps: [
            'Gato-camello: en cuadrupedia, alterna redondear la espalda (mirando al ombligo) y arquearla suave (mirando al frente).',
            'Niño: siéntate sobre los talones y estira los brazos al frente con la frente en el suelo.',
            'Respira lento; reparte el tiempo entre ambos.',
          ],
          video: 'gato camello y postura del niño estiramiento espalda',
          image: 'Cat_Stretch',
        },
      },
    ],
  },
  d6: {
    id: 'd6',
    name: 'Día 6 — Movilidad de hombro + Core + Estiramiento',
    place: 'Casa',
    estimate: '~42\'',
    warmup: [],
    intro: HOME_INTRO,
    exercises: [
      {
        id: 'lateral-pared',
        block: 'Movilidad hombro',
        name: 'Estiramiento lateral asistido en pared (dorsal/tríceps)',
        sets: 2,
        target: { kind: 'seconds', min: 30, max: 30, perSide: true },
        rest: 0,
        note: 'Fuente: Lacrux, 8 ejercicios para el hombro',
        guide: {
          steps: [
            'De lado a la pared, apoya el antebrazo por encima de la cabeza con el codo doblado.',
            'Inclina el tronco y empuja suave el pecho hacia la pared hasta sentir el dorsal y el tríceps.',
            'Mantén y cambia de lado.',
          ],
          video: 'estiramiento dorsal en pared escalada hombro',
        },
      },
      {
        id: 'sleeper-stretch',
        block: 'Movilidad hombro',
        name: 'Sleeper stretch (acostado, codo 90°)',
        sets: 2,
        target: { kind: 'seconds', min: 30, max: 30, perSide: true },
        rest: 0,
        note: 'Movilidad posterior de hombro',
        guide: {
          steps: [
            'Acostado de lado sobre el hombro a estirar, brazo al frente y codo doblado a 90° (mano al techo).',
            'Con la otra mano empuja suave el antebrazo hacia el suelo.',
            'Estiramiento en la parte de atrás del hombro, nunca dolor punzante.',
          ],
          video: 'sleeper stretch hombro',
        },
      },
      {
        id: 'pectoral-pared',
        block: 'Movilidad hombro',
        name: 'Estiramiento de pectoral en pared',
        sets: 2,
        target: { kind: 'seconds', min: 30, max: 30, perSide: true },
        rest: 0,
        guide: {
          steps: [
            'Apoya el antebrazo en el marco de una puerta o pared, codo a la altura del hombro.',
            'Gira el cuerpo hacia el lado contrario hasta sentir el pecho.',
            'Mantén y cambia de lado.',
          ],
          video: 'estiramiento de pectoral en pared',
        },
      },
      {
        id: 'rotacion-banda',
        block: 'Movilidad hombro',
        name: 'Rotación externa/interna con banda elástica',
        sets: 3,
        target: { kind: 'reps', min: 12, max: 12, perSide: true },
        rest: 30,
        note: 'Fortalecimiento de manguito rotador (banda liviana)',
        guide: {
          steps: [
            'Banda anclada a la altura del codo; codo pegado al cuerpo y doblado a 90°.',
            'Externa: lleva el antebrazo hacia afuera. Interna: hacia el abdomen.',
            'Movimiento lento, solo gira el antebrazo; el codo no se despega.',
          ],
          video: 'rotación externa e interna de hombro con banda',
          image: 'External_Rotation_with_Band',
        },
      },
      {
        id: 'l-sit',
        block: 'Calistenia BW',
        name: 'L-sit a una pierna o Tuck L-sit en suelo',
        sets: 5,
        target: { kind: 'seconds', min: 4, max: 10 },
        rest: 45,
        note: 'Progresión lineal: suma 1-2" por semana',
        levelHint: 'Variante (ej: tuck, una pierna)',
        guide: {
          steps: [
            'Sentado, manos apoyadas junto a la cadera (sobre puños o paralelas bajas si tienes).',
            'Empuja el suelo, despega la cadera y recoge las rodillas al pecho (tuck) o estira una pierna.',
            'Hombros abajo, lejos de las orejas. Mantén el tiempo indicado.',
          ],
          video: 'tuck l-sit en el suelo progresión',
        },
      },
      {
        id: 'pushup-amrap2',
        block: 'Calistenia BW',
        name: 'Push up estándar o Archer BW',
        sets: 3,
        target: { kind: 'reps', min: 1, max: 99 },
        display: '3 x AMRAP-2 (dejar 2 en reserva)',
        rest: 60,
        note: 'Sin cronometrar, volumen técnico',
        levelHint: 'Variante (estándar / archer)',
        guide: {
          steps: [
            'Manos al ancho de hombros (o abiertas para archer), cuerpo en línea.',
            'Baja el pecho cerca del suelo con los codos a unos 45° y empuja.',
            'Para cuando sientas que te quedan 2 reps buenas en reserva.',
          ],
          video: 'flexiones técnica correcta',
          image: 'Pushups',
        },
      },
      {
        id: 'deadbug-pallof',
        block: 'Core',
        name: 'Dead bug + Pallof press improvisado (mochila o banda)',
        sets: 3,
        target: { kind: 'reps', min: 10, max: 10, perSide: true },
        rest: 45,
        guide: {
          steps: [
            'Dead bug: boca arriba, espalda baja pegada al suelo, estira brazo y pierna contrarios alternando.',
            'Pallof: banda anclada a un costado a la altura del pecho; estira los brazos al frente sin dejar que te gire.',
            '10 por lado de cada uno.',
          ],
          video: 'dead bug y pallof press con banda en casa',
          image: 'Dead_Bug',
        },
      },
      {
        id: 'd6-isquios-aductores',
        block: 'Estiramiento final',
        name: 'Isquiotibiales + aductores (igual que Día 5)',
        sets: 2,
        target: { kind: 'check', label: '30" isquios + 30" aductores' },
        display: '2 x 30" cada uno',
        rest: 0,
        guide: {
          ...hamstringStretch,
          steps: [...hamstringStretch.steps, ...adductorStretch.steps.slice(0, 1)],
        },
      },
      {
        id: 'espalda-baja',
        block: 'Estiramiento final',
        name: 'Espalda baja (rodillas al pecho + torsión supina)',
        sets: 1,
        target: { kind: 'minutes', min: 2, max: 2 },
        rest: 0,
        guide: {
          steps: [
            'Boca arriba, abraza las rodillas al pecho y balancéate suave.',
            'Torsión: brazos en cruz, deja caer ambas rodillas hacia un lado mirando al lado contrario; luego cambia.',
            'Respira lento; reparte el tiempo entre ambos.',
          ],
          video: 'estiramiento espalda baja rodillas al pecho torsión supina',
          image: 'Hug_Knees_To_Chest',
        },
      },
    ],
  },
}

/** Toma un ejercicio del Mes 1 (mismo id, así "Última vez" y el peso pasan al Mes 2) y le aplica cambios */
function reuse(id: string, patch: Partial<Exercise>): Exercise {
  for (const session of Object.values(M1)) {
    const ex = session.exercises.find((e) => e.id === id)
    if (ex) return { ...ex, alternates: undefined, display: undefined, ...patch }
  }
  throw new Error(`Ejercicio del Mes 1 no encontrado: ${id}`)
}

const M2_WARMUP = [
  'Shinbox, rotación interna a externa — 8 por lado',
  'Sentadilla profunda a estiramiento de isquios — 12',
  'Elevaciones de pierna en mariposa — 8 por lado',
  'Balanceos en sentadilla (squat rocks) — 12',
  'Sentadilla profunda a sentadilla cosaca — 4 por lado',
]
const M2_WARMUP_BAR = [...M2_WARMUP, 'Movilidad de hombros y muñecas antes de la barra — 2\'']
const M2_WARMUP_TITLE = 'Calentamiento dinámico (~8\', 2 rondas)'

const calfSingle = (id: string, sets: number, weight: boolean, note?: string): Exercise => ({
  id,
  name: weight ? 'Pantorrilla a una pierna con mancuerna' : 'Pantorrilla a una pierna, sin peso',
  sets,
  target: weight ? { kind: 'reps', min: 12, max: 15, perSide: true, weight: true } : { kind: 'reps', min: 1, max: 99, perSide: true },
  display: weight ? undefined : `${sets} x al fallo por pierna`,
  rest: 45,
  note,
  guide: {
    steps: [
      'De pie sobre una pierna, puntas sobre un disco o escalón; apóyate con una mano para equilibrio.',
      weight ? 'Mancuerna en la mano del mismo lado de la pierna que trabaja.' : 'Sin peso: llega al fallo con buena técnica.',
      'Sube en puntas lo más alto posible, pausa 1-2" y baja lento hasta estirar.',
    ],
    video: 'elevación de talón a una pierna técnica',
    image: 'Standing_Dumbbell_Calf_Raise',
    imageNote: 'La imagen es a dos piernas; tú a una.',
  },
})

/** Mes 2 — Semana tipo v3: hipertrofia de pierna + muscle-up + split + movilidad */
const M2: Record<M2Id, Session> = {
  m2d1: {
    id: 'm2d1',
    name: 'Día 1 — Muscle-up A + Cuádriceps',
    place: 'Gimnasio',
    estimate: '~57\'',
    warmup: M2_WARMUP_BAR,
    warmupTitle: M2_WARMUP_TITLE,
    exercises: [
      {
        id: 'dominadas-explosivas',
        name: 'Dominadas explosivas, pecho a la barra',
        sets: 3,
        target: { kind: 'reps', min: 4, max: 6 },
        rest: 120,
        note: 'Subida rápida, bajada controlada. "Romper la barra" (rotación externa de hombros)',
        guide: {
          steps: [
            'Agarre prono algo más ancho que los hombros, hombros activos.',
            'Sube lo más rápido posible buscando llevar el pecho a la barra.',
            'Baja controlado. Piensa en "romper la barra" girando los hombros hacia afuera.',
          ],
          video: 'dominadas explosivas pecho a la barra muscle up progresión',
          image: 'Pullups',
        },
      },
      {
        id: 'colgado-agarre-falso',
        name: 'Colgado con agarre falso',
        sets: 2,
        target: { kind: 'seconds', min: 15, max: 20 },
        rest: 60,
        guide: {
          steps: [
            'Agarre falso: la muñeca por encima de la barra, la palma apoyada en ella (no solo los dedos).',
            'Cuélgate con los brazos estirados manteniendo ese agarre.',
            'Mantén el tiempo indicado; si se escapa el agarre, acorta la serie.',
          ],
          video: 'false grip hang muscle up agarre falso',
        },
      },
      smithSquat(
        'd1-smith',
        4,
        8,
        10,
        120,
        'Última marca: 95 kg x 10 x 4. Si la Smith no admite más carga: bajada de 3" y pausa de 1" abajo',
      ),
      reuse('bulgara-mancuernas', { note: 'Última marca: 16 kg x 10 x 3. Probar 18 kg' }),
      calfSingle('pantorrilla-una-pierna-mancuerna', 3, true, 'Mancuerna de 20 kg. Pausa 1-2" arriba'),
    ],
  },
  m2d2: {
    id: 'm2d2',
    name: 'Día 2 — Isquio + Glúteo + Empuje',
    place: 'Gimnasio',
    estimate: '~57\'',
    warmup: M2_WARMUP,
    warmupTitle: M2_WARMUP_TITLE,
    intro:
      'Si escalas este día: escalar primero. En el gimnasio, sacar RDL a una pierna y pantorrilla sentado, y Archer AMRAP 8\'. (Escalada: moderada, técnica o volumen, nada máximo).',
    exercises: [
      reuse('rdl-mancuernas', { sets: 4, note: 'Mancuernas de 20 kg. Bajada 3", espalda neutra' }),
      reuse('curl-fitball', { sets: 4 }),
      {
        id: 'rdl-una-pierna-mancuerna',
        name: 'RDL a una pierna con mancuerna',
        sets: 2,
        target: { kind: 'reps', min: 10, max: 10, perSide: true, weight: true },
        rest: 90,
        guide: {
          steps: [
            'De pie sobre una pierna con la rodilla un poco flexionada, mancuerna en la mano contraria.',
            'Inclina el tronco hacia adelante mientras la otra pierna va hacia atrás, espalda neutra y cadera nivelada.',
            'Baja hasta sentir los isquios y vuelve apretando el glúteo. Todas las reps y cambia.',
          ],
          video: 'peso muerto rumano a una pierna con mancuerna',
          image: 'Kettlebell_One-Legged_Deadlift',
          imageNote: 'La imagen usa kettlebell.',
        },
      },
      reuse('face-pull-banda', { note: 'Hacerlo antes del Archer, no al final' }),
      reuse('archer-amrap', { display: 'AMRAP 12\', alternando brazos', note: 'Última marca: 25 series. Objetivo: 26' }),
      {
        id: 'pantorrilla-sentado',
        name: 'Pantorrilla sentado (mancuerna sobre la rodilla)',
        sets: 2,
        target: { kind: 'reps', min: 15, max: 15, weight: true },
        rest: 45,
        guide: {
          steps: [
            'Sentado en el banco, puntas de los pies sobre un disco y la mancuerna apoyada sobre la rodilla.',
            'Sube los talones lo más alto posible y pausa 1".',
            'Baja lento hasta estirar.',
          ],
          video: 'elevación de talones sentado con mancuerna',
          image: 'Dumbbell_Seated_One-Leg_Calf_Raise',
        },
      },
    ],
  },
  m2d3: {
    id: 'm2d3',
    name: 'Día 3 — Muscle-up B + Front lever + Cuádriceps',
    place: 'Gimnasio',
    estimate: '~57\'',
    warmup: M2_WARMUP_BAR,
    warmupTitle: M2_WARMUP_TITLE,
    exercises: [
      {
        id: 'transiciones-banda',
        name: 'Transiciones asistidas con banda',
        sets: 3,
        target: { kind: 'reps', min: 5, max: 5 },
        rest: 90,
        note: 'Codos hacia atrás, no hacia los lados',
        levelHint: 'Banda (ej: gruesa, media)',
        guide: {
          steps: [
            'Banda colgada de la barra, rodillas o pies dentro de la banda.',
            'Desde la parte alta de la dominada, pasa el pecho por encima de la barra llevando los codos hacia atrás.',
            'Termina en apoyo arriba de la barra y baja controlado.',
          ],
          video: 'muscle up transición asistida con banda',
          image: 'Muscle_Up',
          imageNote: 'La imagen muestra el muscle-up completo, sin banda.',
        },
      },
      {
        id: 'muscle-up-negativas',
        name: 'Muscle-up negativas (barra)',
        sets: 3,
        target: { kind: 'reps', min: 3, max: 5 },
        rest: 120,
        note: 'Bajada lenta, codos pegados al cuerpo',
        guide: {
          steps: [
            'Empieza en apoyo arriba de la barra (subiendo con salto o desde un banco).',
            'Baja lo más lento posible pasando por la transición con los codos pegados al cuerpo.',
            'Termina colgado con los brazos estirados.',
          ],
          video: 'muscle up negativas tutorial',
          image: 'Muscle_Up',
        },
      },
      {
        id: 'fondos-barras',
        name: 'Fondos en barras',
        sets: 2,
        target: { kind: 'reps', min: 6, max: 10 },
        rest: 90,
        note: 'Hombro abajo. Llegar a 3 x 10 antes de agregar lastre',
        guide: {
          steps: [
            'Sostente en las barras con los brazos estirados y los hombros abajo, lejos de las orejas.',
            'Baja doblando los codos hasta unos 90°.',
            'Empuja hasta estirar los brazos.',
          ],
          video: 'fondos en paralelas técnica',
          image: 'Dips_-_Triceps_Version',
        },
      },
      reuse('front-lever-negativas', {
        sets: 4,
        display: '4 x (1 izq + 1 der) = 8 reps',
        note: 'Descanso 1\'-1\'30". Cuando salgan con brazos estirados y línea estable, alargar la bajada.',
      }),
      reuse('goblet-squat', { note: 'Kettlebell de 24 kg. Última marca: 22 kg x 15 x 2 (la primera serie con 20 kg)' }),
      calfSingle('pantorrilla-una-pierna-bw', 2, false),
    ],
  },
  m2d4: {
    id: 'm2d4',
    name: 'Día 4 — Posterior + Glúteo + Empuje',
    place: 'Gimnasio',
    estimate: '~59\'',
    warmup: M2_WARMUP,
    warmupTitle: M2_WARMUP_TITLE,
    exercises: [
      reuse('zancada-salto', {}),
      {
        id: 'hip-thrust-una-pierna',
        name: 'Hip Thrust a una pierna (kettlebell 24 kg + mancuerna 20 kg)',
        sets: 4,
        target: { kind: 'reps', min: 8, max: 12, perSide: true, weight: true },
        rest: 90,
        note: 'Cadera nivelada, pausa 2" arriba. Última marca bilateral: 20 kg x 10 x 4 (en Smith: 95 kg)',
        guide: {
          steps: [
            'Espalda alta apoyada en el banco, peso sobre la cadera, un solo pie apoyado.',
            'Sube empujando con el talón hasta alinear rodilla-cadera-hombros, sin que la cadera se incline.',
            'Pausa 2" arriba y baja controlado. Todas las reps y cambia.',
            'Si 12 salen con 3 o más en reserva: pausa de 3" y bajada de 3"; después, pies sobre un step.',
          ],
          video: 'hip thrust a una pierna con peso',
          image: 'Barbell_Hip_Thrust',
          imageNote: 'La imagen es a dos piernas con barra.',
        },
      },
      {
        id: 'curl-fitball-una-pierna',
        name: 'Curl femoral en fitball a una pierna',
        sets: 3,
        target: { kind: 'reps', min: 10, max: 10, perSide: true },
        rest: 60,
        guide: {
          steps: [
            'Boca arriba con un talón sobre el fitball y la otra pierna en el aire.',
            'Eleva la cadera y, sin bajarla, acerca la pelota con el talón hacia el glúteo.',
            'Vuelve despacio. Todas las reps y cambia.',
          ],
          video: 'curl femoral en fitball a una pierna',
          image: 'Ball_Leg_Curl',
          imageNote: 'La imagen es a dos piernas.',
        },
      },
      {
        id: 'nordico-asistido',
        name: 'Nórdico de isquios asistido',
        sets: 2,
        target: { kind: 'reps', min: 6, max: 8 },
        rest: 90,
        note: 'Bajada lenta, las manos ayudan',
        guide: {
          steps: [
            'De rodillas sobre una colchoneta, tobillos sujetos (bajo un mueble, banco o compañero).',
            'Cuerpo recto de rodillas a cabeza: baja hacia adelante lo más lento posible.',
            'Frena con las manos al final y empuja para volver a subir.',
          ],
          video: 'nordic curl asistido isquiotibiales principiantes',
          image: 'Natural_Glute_Ham_Raise',
        },
      },
      reuse('press-militar', { sets: 3, note: 'Última marca: 16 kg x 8 x 3. Probar 18 kg' }),
      reuse('rotacion-core', { sets: 2 }),
      {
        id: 'final-split-d4',
        name: 'Final: half split + paloma elevada',
        sets: 2,
        target: { kind: 'check', label: 'half split 30" por lado + paloma elevada 30" por lado' },
        display: '2 x (half split 30" + paloma 30", por lado) ~4\'',
        rest: 0,
        guide: {
          steps: [
            'Half split: rodilla trasera apoyada, pierna delantera estirada; lleva la cadera atrás con la espalda recta.',
            'Paloma elevada: pierna delantera doblada sobre el banco y la otra atrás; inclínate hacia adelante.',
            'Caderas cuadradas, sin rebotes. 30" por lado cada uno.',
          ],
          video: 'half split y paloma elevada estiramiento',
        },
      },
    ],
  },
  m2d5: {
    id: 'm2d5',
    name: 'Día 5 — Movilidad + Split + Core',
    place: 'Casa',
    estimate: '~60\'',
    warmup: [],
    intro:
      'El mejor día para escalar fuerte. Si escalas este día: escalar primero; después solo el circuito dinámico y los bloques de split frontal y lateral.',
    exercises: [
      {
        id: 'circuito-cadera-tobillo',
        block: 'Dinámico',
        name: 'Circuito de cadera y tobillo (calentamiento dinámico)',
        sets: 2,
        target: { kind: 'check', label: '1 ronda' },
        display: '2 rondas (~6\')',
        rest: 0,
        guide: {
          steps: M2_WARMUP,
          video: 'movilidad de cadera shinbox sentadilla cosaca rutina',
        },
      },
      reuse('bulgara-bw', {
        block: 'Pierna',
        name: 'Sentadilla búlgara sin peso',
        sets: 2,
        target: { kind: 'reps', min: 8, max: 10, perSide: true },
        note: 'Última marca: 6 reps en una serie',
      }),
      {
        id: 'puente-isometrico-una-pierna',
        block: 'Pierna',
        name: 'Puente de glúteo unilateral isométrico',
        sets: 2,
        target: { kind: 'seconds', min: 15, max: 30, perSide: true },
        rest: 30,
        note: 'Sin bajar la cadera, apoyando la punta del pie',
        guide: {
          steps: [
            'Boca arriba, un pie apoyado (en punta) y la otra pierna estirada o recogida.',
            'Sube la cadera y mantenla arriba, nivelada, apretando el glúteo.',
            'Mantén el tiempo indicado y cambia de lado.',
          ],
          video: 'puente de glúteo a una pierna isométrico',
          image: 'Single_Leg_Glute_Bridge',
        },
      },
      { ...calfSingle('pantorrilla-una-pierna-bw', 3, false), block: 'Pierna' },
      {
        id: 'split-frontal',
        block: 'Split frontal',
        name: 'Flexor de cadera, half split, cuádriceps y paloma elevada',
        sets: 3,
        target: { kind: 'check', label: '1 ronda: 6-8 reps + sostener 10-30" cada uno' },
        display: '3 rondas: 6-8 reps + sostener 10-30" cada uno (~15\')',
        rest: 0,
        note: 'Caderas cuadradas, sin rebotes. Avanzar cuando se sostenga con respiración normal, no por calendario',
        guide: {
          steps: [
            'Flexor de cadera: zancada con rodilla trasera apoyada, empuja la cadera hacia adelante.',
            'Half split: lleva la cadera atrás estirando la pierna delantera.',
            'Cuádriceps: desde la zancada, toma el pie trasero y llévalo hacia el glúteo.',
            'Paloma elevada: pierna delantera doblada sobre un apoyo, inclínate hacia adelante.',
            'En cada uno: 6-8 repeticiones suaves entrando y saliendo, y después sostener 10-30".',
          ],
          video: 'rutina split frontal principiantes flexor de cadera half split',
        },
      },
      {
        id: 'split-lateral',
        block: 'Split lateral',
        name: 'Rana con rotaciones, mariposa y sentadilla cosaca sostenida',
        sets: 2,
        target: { kind: 'check', label: '30" cada una' },
        display: '2 x 30" cada una',
        rest: 0,
        note: 'Rodillas sin girar hacia el suelo',
        guide: {
          steps: [
            'Rana: en cuadrupedia con las rodillas abiertas, lleva la cadera atrás con pequeñas rotaciones.',
            'Mariposa: sentado, plantas juntas, empuja suave las rodillas hacia el suelo.',
            'Cosaca sostenida: pies muy abiertos, baja hacia un lado con la otra pierna estirada y mantén.',
          ],
          video: 'split lateral rana mariposa sentadilla cosaca',
        },
      },
      {
        id: 'hombro-estiramientos',
        block: 'Hombro',
        name: 'Estiramiento lateral en pared + sleeper stretch',
        sets: 2,
        target: { kind: 'check', label: '30" por lado cada uno' },
        display: '2 x 30" por lado cada uno',
        rest: 0,
        guide: {
          steps: [
            'Lateral en pared: antebrazo apoyado por encima de la cabeza, inclina el tronco hasta sentir dorsal y tríceps.',
            'Sleeper: acostado de lado, brazo al frente con el codo a 90°; empuja suave el antebrazo hacia el suelo.',
            '30" por lado cada uno.',
          ],
          video: 'estiramiento dorsal en pared y sleeper stretch',
        },
      },
      reuse('rotacion-banda', { block: 'Hombro', sets: 2 }),
      reuse('l-sit', { block: 'Calistenia', sets: 4, note: 'Sumar 1-2" por semana' }),
      reuse('deadbug-pallof', { block: 'Core', sets: 2 }),
    ],
  },
}

export const SESSIONS: Record<SessionId, Session> = { ...M1, ...M2 }

export type DayPlan = { session?: SessionId; restLabel?: string }

/** Índice por día de la semana: 0 = domingo … 6 = sábado */
export const SCHEDULE: DayPlan[] = [
  { restLabel: 'Descanso completo' },
  { session: 'd1' },
  { session: 'd2' },
  { session: 'd3' },
  { session: 'd4' },
  { session: 'd5' },
  { session: 'd6' },
]

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/** Récords y notas del plan (Mes 1) */
const RECORDS_M1 = [
  'Back Squat: ~125 kg estimado (test 100 kg x 8, promedio Epley/Brzycki). Ya no aplica directo: ahora es Smith a 90°.',
  'Hip Thrust: sin confirmar. El test de 130 kg x 4 se descartó por posible falla técnica (dolor lumbar); pendiente repetir con carga más controlada.',
  'Push up Archer (AMRAP 12\'): 22 series x 2 rep por brazo (rutina anterior).',
]

const SCHEDULE_M2: DayPlan[] = [
  { restLabel: 'Descanso' },
  { session: 'm2d1' },
  { session: 'm2d2' },
  { restLabel: 'Recuperación (opcional: caminata 20-30\' y movilidad suave 10-15\')' },
  { session: 'm2d3' },
  { session: 'm2d4' },
  { session: 'm2d5' },
]

export type ProgramId = 'm1' | 'm2'

export type Program = {
  id: ProgramId
  name: string
  description: string
  /** Orden de las sesiones al elegir días */
  order: SessionId[]
  /** Plan por defecto: índice 0 = domingo … 6 = sábado */
  schedule: DayPlan[]
  /** Nota sobre qué priorizar si se cae un día */
  priority?: string
  records: string[]
  progressions: string[]
}

export const PROGRAMS: Record<ProgramId, Program> = {
  m1: {
    id: 'm1',
    name: 'Mes 1',
    description: '6 días: calistenia progresiva + piernas + escalada + movilidad',
    order: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'],
    schedule: SCHEDULE,
    records: RECORDS_M1,
    progressions: [],
  },
  m2: {
    id: 'm2',
    name: 'Mes 2',
    description: '5 días: hipertrofia de pierna + muscle-up + split + movilidad',
    order: ['m2d1', 'm2d2', 'm2d3', 'm2d4', 'm2d5'],
    schedule: SCHEDULE_M2,
    priority: 'Si un día se cae, el orden de prioridad es: Día 1, Día 4, Día 3, Día 2, Día 5.',
    records: [
      'Sentadilla Smith: 95 kg x 10 x 4 (23 oct) · 95 kg x 12 x 3 (21 oct)',
      'Zancada búlgara: 16 kg x 10 x 3 (23 oct)',
      'Peso muerto rumano: 20 kg x 10 x 3 (23 oct)',
      'Pantorrillas de pie: 20 kg x 20 x 4 (6 oct)',
      'Dominadas con lastre: 10 kg x 8 x 4 (23 oct)',
      'Dominadas EMOM 10\': 43 reps (21 oct)',
      'Push up Archer AMRAP 12\': 25 series (15 oct)',
      'Hip Thrust: 95 kg x 10 x 4 (Smith, 7 oct) · 20 kg x 10 x 4 (15 oct)',
      'Fondos en banco: 12 x 4 (15 oct)',
      'Remo con mancuerna: 20 kg x 10 x 2 (7 oct)',
      'Goblet Squat: 22 kg x 15 x 2 (15 oct)',
      'Press militar: 16 kg x 8 x 3 (5 oct)',
      'Push up explosivo EMOM 10\': 60 reps (5 oct)',
      'Front lever tuck negativas: 6 x (1+1) (21 oct)',
    ],
    progressions: [
      'Regla general: al completar todas las series en el tope del rango, la próxima vez subir la carga mínima. En el máximo del equipo (mancuernas 20 kg, kettlebell 24 kg): bajada de 3-4", pausa de 2" en el punto más difícil, a una pierna o más reps.',
      'Piernas: semanas 1-2 dejar 2-3 reps en reserva; semanas 3-4, 1-2 en reserva; semana 5 descarga (mitad de series).',
      'Sentadilla Smith: si el equipo permite más carga, subir de a 2,5 kg hasta volver a 10 reps; si no, bajada de 3-4" y pausa abajo.',
      'Muscle-up: etapa 1 (semanas 1-4) como figura en Día 1 y Día 3. Pasar a etapa 2 tras 2 sesiones seguidas con técnica limpia y sin dolor de hombro o codo: menos banda, dominadas explosivas con lastre, negativas más lentas. Si aparece dolor, sumar días de descanso.',
      'Archer AMRAP: +1 serie cada semana o dos. Fondos en barras: llegar a 3 x 10 antes de agregar lastre.',
      'Split: avanzar de etapa cuando se sostenga con caderas cuadradas y respiración normal, no por calendario. Estiramientos largos después de la fuerza, no antes.',
    ],
  },
}

/** Programa que se usa si no se eligió otro */
export const DEFAULT_PROGRAM: ProgramId = 'm2'

/** Semana ISO del año, para alternar variantes semana a semana */
export function isoWeek(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
}

export function alternateFor(ex: Exercise, date: Date) {
  return ex.alternates ? ex.alternates[isoWeek(date) % 2] : undefined
}

export function formatTarget(ex: Exercise) {
  if (ex.display) return ex.display
  const t = ex.target
  const sets = ex.sets
  switch (t.kind) {
    case 'reps': {
      const r = t.min === t.max ? `${t.min}` : `${t.min}-${t.max}`
      return `${sets} x ${r}${t.perSide ? ' por lado' : ''}`
    }
    case 'seconds': {
      const s = t.min === t.max ? `${t.min}"` : `${t.min}-${t.max}"`
      return `${sets} x ${s}${t.perSide ? ' por lado' : ''}`
    }
    case 'minutes':
      return t.min === t.max ? `${t.min}'` : `${t.min}-${t.max}'`
    case 'check':
      return `${sets} x (${t.label})`
    case 'amrap':
      return `AMRAP ${t.minutes}'`
    case 'emom':
      return `EMOM ${t.minutes}', ${t.reps} rep`
    case 'tabata':
      return `Tabata ${t.work}"/${t.rest}" x ${t.rounds}`
  }
}

/** Duración del bloque cronometrado (AMRAP/EMOM/Tabata), en segundos */
export function blockPhases(t: Target): { label: string; seconds: number }[] | undefined {
  switch (t.kind) {
    case 'amrap':
      return [{ label: `AMRAP ${t.minutes}'`, seconds: t.minutes * 60 }]
    case 'emom':
      return Array.from({ length: t.minutes }, (_, i) => ({ label: `Minuto ${i + 1} de ${t.minutes}`, seconds: 60 }))
    case 'tabata':
      return Array.from({ length: t.rounds }, (_, i) => [
        { label: `Ronda ${i + 1}/${t.rounds} — ¡Trabajo!`, seconds: t.work },
        { label: `Ronda ${i + 1}/${t.rounds} — Descanso`, seconds: t.rest },
      ]).flat()
    default:
      return undefined
  }
}

// ─── Reemplazos de ejercicios ────────────────────────────────────────────────

const ALT = {
  sentadillaMancuernas: {
    id: 'alt-sentadilla-mancuernas',
    name: 'Sentadilla con mancuernas a los lados',
    note: 'Si la Smith está ocupada. Misma profundidad (90°).',
    weight: true,
    guide: {
      steps: [
        'De pie, una mancuerna en cada mano a los lados del cuerpo, pies al ancho de hombros.',
        'Baja hasta 90° de rodilla con el pecho arriba y la espalda neutra.',
        'Sube empujando con todo el pie.',
      ],
      video: 'sentadilla con mancuernas técnica',
      image: 'Dumbbell_Squat',
    },
  },
  gobletPesada: {
    id: 'alt-goblet-pesada',
    name: 'Sentadilla goblet pesada (kettlebell o mancuerna)',
    weight: true,
    guide: {
      steps: [
        'Sostén la kettlebell o mancuerna pegada al pecho con ambas manos.',
        'Baja con el pecho arriba y los codos dentro de las rodillas.',
        'Sube empujando el suelo con todo el pie.',
      ],
      video: 'goblet squat pesada técnica',
      image: 'Goblet_Squat',
    },
  },
  zancadaAtras: {
    id: 'alt-zancada-atras',
    name: 'Zancada atrás con mancuernas',
    weight: true,
    guide: {
      steps: [
        'De pie con una mancuerna en cada mano.',
        'Da un paso largo hacia atrás y baja hasta que la rodilla trasera casi toque el suelo.',
        'Vuelve empujando con el talón de la pierna delantera. Todas las reps de un lado y cambia.',
      ],
      video: 'zancada hacia atrás con mancuernas técnica',
      image: 'Dumbbell_Rear_Lunge',
    },
  },
  bulgaraKettlebell: {
    id: 'alt-bulgara-kettlebell',
    name: 'Zancada búlgara con kettlebells',
    weight: true,
    guide: {
      steps: [
        'Pie trasero sobre el banco, una kettlebell en cada mano (o una en goblet al pecho).',
        'Baja recto hasta que la rodilla trasera casi toque el suelo.',
        'Sube con el talón delantero. Todas las reps de una pierna y cambia.',
      ],
      video: 'sentadilla búlgara con kettlebell',
      image: 'Split_Squat_with_Dumbbells',
      imageNote: 'La imagen usa mancuernas.',
    },
  },
  jalonPecho: {
    id: 'alt-jalon-pecho',
    name: 'Jalón al pecho en polea alta',
    note: 'Si la barra de dominadas está ocupada',
    weight: true,
    guide: {
      steps: [
        'Sentado en la polea alta con los muslos bajo el soporte, agarre prono algo más ancho que los hombros.',
        'Tira de la barra hacia la parte alta del pecho llevando los codos abajo y atrás.',
        'Sube controlado hasta estirar los brazos sin soltar la tensión.',
      ],
      video: 'jalón al pecho polea técnica',
      image: 'Wide-Grip_Lat_Pulldown',
    },
  },
  rdlKettlebell: {
    id: 'alt-rdl-kettlebell',
    name: 'Peso muerto rumano con kettlebells',
    weight: true,
    guide: {
      steps: [
        'De pie con una kettlebell en cada mano delante de los muslos, rodillas un poco flexionadas.',
        'Lleva la cadera atrás bajando las pesas pegadas a las piernas, espalda neutra.',
        'Sube apretando glúteos.',
      ],
      video: 'peso muerto rumano con kettlebell',
      image: 'Stiff-Legged_Dumbbell_Deadlift',
      imageNote: 'La imagen usa mancuernas.',
    },
  },
  rdlSmith: {
    id: 'alt-rdl-smith',
    name: 'Peso muerto rumano en Smith',
    weight: true,
    guide: {
      steps: [
        'Barra de la Smith a media altura del muslo, agarre al ancho de hombros.',
        'Rodillas un poco flexionadas: lleva la cadera atrás bajando la barra pegada a las piernas.',
        'Baja hasta sentir los isquios y sube apretando glúteos.',
      ],
      video: 'peso muerto rumano en multipower smith',
      image: 'Smith_Machine_Stiff-Legged_Deadlift',
    },
  },
  pantorrillaSmith: {
    id: 'alt-pantorrilla-smith',
    name: 'Pantorrillas de pie en Smith',
    weight: true,
    guide: {
      steps: [
        'Puntas de los pies sobre un disco o escalón, barra de la Smith sobre los trapecios.',
        'Sube en puntas lo más alto posible y pausa 1-2".',
        'Baja lento hasta estirar la pantorrilla.',
      ],
      video: 'elevación de talones en smith',
      image: 'Smith_Machine_Calf_Raise',
    },
  },
  hipThrustMancuerna: {
    id: 'alt-hip-thrust-mancuerna',
    name: 'Hip Thrust con mancuerna',
    note: 'La opción indicada en la rutina si la Smith molesta en la zona lumbar',
    weight: true,
    guide: {
      steps: [
        'Espalda alta apoyada en el banco, mancuerna sobre la cadera sujeta con ambas manos.',
        'Sube empujando con los talones hasta alinear rodillas-cadera-hombros, sin arquear la zona lumbar.',
        'Pausa arriba apretando glúteos y baja controlado.',
      ],
      video: 'hip thrust con mancuerna técnica',
      image: 'Barbell_Hip_Thrust',
      imageNote: 'La imagen usa barra; tú con una mancuerna sobre la cadera.',
    },
  },
  fondosParalelas: {
    id: 'alt-fondos-paralelas',
    name: 'Fondos en paralelas',
    guide: {
      steps: [
        'Sostente en las paralelas con los brazos estirados y el cuerpo vertical.',
        'Baja doblando los codos hacia atrás hasta unos 90°.',
        'Empuja hasta estirar los brazos sin encoger los hombros.',
      ],
      video: 'fondos en paralelas tríceps técnica',
      image: 'Dips_-_Triceps_Version',
    },
  },
  tricepsPolea: {
    id: 'alt-triceps-polea',
    name: 'Extensión de tríceps en polea alta',
    weight: true,
    guide: {
      steps: [
        'Frente a la polea alta, codos pegados al cuerpo.',
        'Empuja hacia abajo hasta estirar los brazos; solo se mueven los antebrazos.',
        'Vuelve despacio hasta 90°.',
      ],
      video: 'extensión de tríceps en polea alta',
      image: 'Triceps_Pushdown',
    },
  },
  remoPoleaUnaMano: {
    id: 'alt-remo-polea-una-mano',
    name: 'Remo en polea baja a una mano',
    weight: true,
    guide: {
      steps: [
        'Sentado frente a la polea baja con un agarre simple.',
        'Tira hacia la cadera llevando el codo pegado al cuerpo, sin girar el tronco.',
        'Vuelve estirando el brazo. Todas las reps y cambia de lado.',
      ],
      video: 'remo en polea baja a una mano',
      image: 'Seated_One-arm_Cable_Pulley_Rows',
    },
  },
  remoKettlebell: {
    id: 'alt-remo-kettlebell',
    name: 'Remo con kettlebell a una mano',
    weight: true,
    guide: {
      steps: [
        'Mano libre apoyada en el banco, espalda plana, kettlebell en la otra mano.',
        'Tira de la kettlebell hacia la cadera con el codo pegado al cuerpo.',
        'Baja controlado. Todas las reps y cambia de lado.',
      ],
      video: 'remo con kettlebell a una mano',
      image: 'One-Arm_Kettlebell_Row',
    },
  },
  facePullPolea: {
    id: 'alt-face-pull-polea',
    name: 'Face pull en polea',
    weight: true,
    guide: {
      steps: [
        'Polea a la altura de la cara con cuerda.',
        'Tira hacia la cara separando las manos, codos altos y atrás.',
        'Termina con rotación externa (pulgares atrás) y vuelve lento.',
      ],
      video: 'face pull en polea técnica',
      image: 'Face_Pull',
    },
  },
  pajarosMancuernas: {
    id: 'alt-pajaros-mancuernas',
    name: 'Pájaros con mancuernas (apoyo de pecho en banco inclinado)',
    weight: true,
    guide: {
      steps: [
        'Pecho apoyado en un banco inclinado, una mancuerna liviana en cada mano.',
        'Abre los brazos hacia los lados con los codos apenas flexionados, apretando omóplatos.',
        'Baja controlado.',
      ],
      video: 'pájaros con mancuernas en banco inclinado',
      image: 'Reverse_Flyes',
    },
  },
  curlToalla: {
    id: 'alt-curl-toalla',
    name: 'Curl femoral deslizando talones (toalla o discos deslizantes)',
    guide: {
      steps: [
        'Boca arriba con los talones sobre una toalla en suelo liso.',
        'Eleva la cadera y desliza los talones hacia los glúteos sin bajarla.',
        'Vuelve a estirar despacio.',
      ],
      video: 'curl femoral deslizante con toalla',
    },
  },
  planchaToques: {
    id: 'alt-plancha-toques',
    name: 'Plancha alta con toques de hombro',
    guide: {
      steps: [
        'Plancha alta con las manos bajo los hombros y los pies algo separados.',
        'Lleva una mano al hombro contrario sin rotar la cadera y vuelve. Alterna.',
        'Abdomen y glúteos firmes todo el tiempo.',
      ],
      video: 'plancha con toques de hombro',
      image: 'Plank',
      imageNote: 'La imagen muestra la plancha en antebrazos; tú en plancha alta.',
    },
  },
  pressKettlebell: {
    id: 'alt-press-kettlebell',
    name: 'Press militar con kettlebells',
    weight: true,
    guide: {
      steps: [
        'Kettlebells en posición de rack (a la altura de los hombros), abdomen y glúteos firmes.',
        'Empuja hacia arriba hasta estirar los brazos sin arquear la espalda.',
        'Baja controlado al rack.',
      ],
      video: 'press militar con kettlebells',
      image: 'Two-Arm_Kettlebell_Military_Press',
    },
  },
  pressSmith: {
    id: 'alt-press-smith',
    name: 'Press militar en Smith (sentado)',
    weight: true,
    guide: {
      steps: [
        'Banco con respaldo bajo la Smith; barra a la altura de la barbilla.',
        'Empuja hacia arriba hasta casi estirar los brazos.',
        'Baja controlado sin adelantar la cabeza.',
      ],
      video: 'press militar en multipower smith sentado',
      image: 'Smith_Machine_Overhead_Shoulder_Press',
    },
  },
  rotacionMancuerna: {
    id: 'alt-rotacion-mancuerna',
    name: 'Rotación externa con mancuerna liviana (tumbado de lado)',
    weight: true,
    guide: {
      steps: [
        'Tumbado de lado, codo de arriba pegado al costado y doblado a 90°, mancuerna muy liviana.',
        'Gira el antebrazo hacia arriba sin despegar el codo.',
        'Baja lento. Todas las reps y cambia de lado.',
      ],
      video: 'rotación externa de hombro con mancuerna tumbado de lado',
      image: 'External_Rotation',
    },
  },
} satisfies Record<string, Alternative>

/**
 * Alternativas por ejercicio. Los ejercicios del mismo grupo comparten la elección
 * (por ejemplo, las tres sentadillas Smith de los días 1, 3 y 4).
 */
const ALTERNATIVES: Record<string, { group: string; options: Alternative[] }> = {
  'd1-smith': { group: 'smith', options: [ALT.sentadillaMancuernas, ALT.gobletPesada] },
  'd3-smith': { group: 'smith', options: [ALT.sentadillaMancuernas, ALT.gobletPesada] },
  'd4-smith': { group: 'smith', options: [ALT.sentadillaMancuernas, ALT.gobletPesada] },
  'bulgara-mancuernas': { group: 'bulgara', options: [ALT.bulgaraKettlebell, ALT.zancadaAtras] },
  dominadas: { group: 'dominadas', options: [ALT.jalonPecho] },
  'dominadas-lastre': { group: 'dominadas-lastre', options: [ALT.jalonPecho] },
  'dominadas-emom': { group: 'dominadas-emom', options: [ALT.jalonPecho] },
  'rdl-mancuernas': { group: 'rdl', options: [ALT.rdlKettlebell, ALT.rdlSmith] },
  'pantorrillas-mancuernas': { group: 'pantorrillas', options: [ALT.pantorrillaSmith] },
  'hip-thrust-smith': { group: 'hip-thrust', options: [ALT.hipThrustMancuerna] },
  'fondos-banco': { group: 'fondos', options: [ALT.fondosParalelas, ALT.tricepsPolea] },
  'remo-mancuerna': { group: 'remo', options: [ALT.remoPoleaUnaMano, ALT.remoKettlebell] },
  'face-pull-banda': { group: 'face-pull', options: [ALT.facePullPolea, ALT.pajarosMancuernas] },
  'curl-fitball': { group: 'curl-femoral', options: [ALT.curlToalla] },
  'plancha-dinamica-balon': { group: 'plancha-dinamica', options: [ALT.planchaToques] },
  'press-militar': { group: 'press-militar', options: [ALT.pressKettlebell, ALT.pressSmith] },
  'rotacion-banda': { group: 'rotacion-hombro', options: [ALT.rotacionMancuerna] },
}

/** Elección del usuario por grupo: id de la alternativa */
export type Swaps = Record<string, string>

function toExercise(slot: Exercise, alt: Alternative): Exercise {
  const target = alt.weight !== undefined && slot.target.kind === 'reps' ? { ...slot.target, weight: alt.weight } : slot.target
  return {
    ...slot,
    id: alt.id,
    name: alt.name,
    note: alt.note,
    target,
    levelHint: undefined,
    alternates: undefined,
    guide: alt.guide,
    swappedFrom: slot.name,
  }
}

/** Opciones para un ejercicio: el original primero y luego sus alternativas */
export function swapOptions(slot: Exercise) {
  const entry = ALTERNATIVES[slot.id]
  if (!entry) return undefined
  return { group: entry.group, options: [slot, ...entry.options.map((a) => toExercise(slot, a))] }
}

/** Ejercicios de la sesión con los reemplazos elegidos aplicados */
export function resolveSession(session: Session, swaps: Swaps = {}) {
  return session.exercises.map((slot) => {
    const sw = swapOptions(slot)
    const chosen = sw && swaps[sw.group]
    return (chosen && sw.options.find((o) => o.id === chosen)) || slot
  })
}

/** Busca el ejercicio (original o reemplazo) dentro de una sesión */
export function findInSession(session: Session, exerciseId: string) {
  for (const slot of session.exercises) {
    const swap = swapOptions(slot)
    if (slot.id === exerciseId) return { slot, exercise: slot, swap }
    const exercise = swap?.options.find((o) => o.id === exerciseId)
    if (exercise) return { slot, exercise, swap }
  }
  return undefined
}

export function alternativeName(id: string) {
  return Object.values(ALT).find((a) => a.id === id)?.name
}

export function groupName(group: string) {
  const slotId = Object.entries(ALTERNATIVES).find(([, v]) => v.group === group)?.[0]
  for (const session of Object.values(SESSIONS)) {
    const ex = session.exercises.find((e) => e.id === slotId)
    if (ex) return ex.name
  }
  return group
}

// ─── Días de entrenamiento por semana ────────────────────────────────────────

export const DAY_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

const REST_CUSTOM = 'Descanso'

/** Lunes de la semana de una fecha, como 'AAAA-MM-DD' (clave del plan semanal) */
export function weekKey(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Plan de la semana: reparte las sesiones del programa en orden en los días elegidos; sin elección usa el plan por defecto */
export function planWeek(program: Program, days?: number[]): DayPlan[] {
  if (!days) return program.schedule
  const plan: DayPlan[] = Array.from({ length: 7 }, () => ({ restLabel: REST_CUSTOM }))
  const sorted = [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
  sorted.slice(0, program.order.length).forEach((d, i) => (plan[d] = { session: program.order[i] }))
  return plan
}

/** Sesiones que no entran en los días elegidos */
export function missingSessions(program: Program, days?: number[]) {
  if (!days) return []
  return program.order.slice(days.length)
}
