export type PracticeType = 'meditation' | 'selfInquiry' | 'contemplation' | string;
export type PracticeDuration = 30 | 60 | 90;

export type HabitCategory = 'health' | 'work' | 'learning' | 'social' | 'personal' | 'other';

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  customDays?: number[];
  completedDates: string[];
  progress: number;
  currentStreak: number;
  longestStreak: number;
  observations?: string;
}

export interface Practice {
  id: string;
  type: PracticeType;
  name: string;
  description?: string;
  color: string;
  progress: number;
  completedDates: string[];
  reflections?: {
    [date: string]: {
      practiceId: string;
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
      isEmpty: boolean;
    };
  };
  currentStreak: number;
  longestStreak: number;
  duration: PracticeDuration;
  startDate: string;
  observations?: string;
}

export interface PracticeStatus {
  completed: boolean;
  date: string;
}

export interface NewPracticeForm {
  name: string;
  description: string;
  type: string;
  duration: PracticeDuration;
  observations?: string;
}