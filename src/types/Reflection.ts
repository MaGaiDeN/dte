export interface Reflection {
  id: string;
  date: string;
  event: {
    description: string;
    emotionalResponse: string;
  };
  beliefs: {
    self: string[];
    others: string[];
    life: string[];
  };
  contemplation: {
    level: 'superficial' | 'deep';
    insights: string;
    question: string;
  };
  transformation: {
    limitingBelief: string;
    newPerspective: string;
    doorMoment?: string;
  };
  practices: {
    breathingExercise: boolean;
    witnessPresence: boolean;
    mentalClearing: boolean;
    selfInquiry: boolean;
  };
}

export interface TransformationShortcut {
  type: 'breathing' | 'witness' | 'inquiry' | 'clearing';
  name: string;
  description: string;
}

export const TRANSFORMATION_SHORTCUTS: TransformationShortcut[] = [
  {
    type: 'breathing',
    name: 'Respiración Consciente',
    description: 'Detente 3 segundos, respira profundamente, observa sin juzgar'
  },
  {
    type: 'witness',
    name: 'Práctica del Testigo',
    description: 'Observa tus pensamientos como nubes, sin identificarte con ellos'
  },
  {
    type: 'inquiry',
    name: 'Pregunta Transformadora',
    description: '¿Quién está observando este pensamiento?'
  },
  {
    type: 'clearing',
    name: 'Vaciado Mental',
    description: 'Escribe todos tus pensamientos y suéltalos en el papel'
  }
];

export const LIMITING_BELIEFS = {
  self: [
    'No soy suficientemente bueno',
    'Nunca lograré mis metas',
    'No merezco ser feliz',
    'Tengo que defenderme siempre',
    'Necesito ser perfecto',
  ],
  others: [
    'La gente no es de confianza',
    'Todos me van a decepcionar',
    'El mundo es un lugar peligroso',
    'Nadie me entiende realmente',
    'Debo complacer a todos',
  ],
  life: [
    'El éxito es solo para algunos privilegiados',
    'La felicidad es temporal',
    'Siempre tendré que luchar',
    'La vida es sufrimiento',
    'Todo está predestinado',
  ]
};

export const CONTEMPLATION_QUESTIONS = {
  superficial: [
    '¿Qué emociones estoy experimentando ahora?',
    '¿De dónde vienen mis miedos?',
    '¿Qué me impide estar en paz?',
    '¿Qué patrones se repiten en mi vida?',
  ],
  deep: [
    '¿Quién soy más allá de mis pensamientos?',
    '¿Qué permanece cuando los pensamientos se detienen?',
    '¿Cuál es mi verdadera naturaleza?',
    '¿Quién es el que observa?',
  ]
};

export interface MindfulnessStats {
  totalReflections: number;
  transformedBeliefs: number;
  contemplationStreak: number;
  deepPractices: number;
}