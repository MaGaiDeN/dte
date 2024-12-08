export interface Challenge {
  id: string;
  title: string;
  description: string;
  name: string; // Added name property
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
  isClickable: boolean;  // Added this property
  reflection?: {
    insights: string;
    experience: string;
    notes: string;
  };
  date?: string;
}
