export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'inquiry' | 'contemplation';
  days: number;
  startDate?: string;
  endDate?: string;
  progress: number;
  isActive: boolean;
}

export interface ChallengeDay {
  day: number;
  isCompleted: boolean;
  reflection?: {
    insights: string;
    experience: string;
    notes: string;
  };
  date?: string;
}
