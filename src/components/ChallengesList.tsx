import { useState } from 'react';
import type { Challenge } from '../types/Challenge';
import { ChallengeCard } from './ChallengeCard';
import { dailyMeditations } from '../data/dailyMeditations';

// Define the interface for DailyMeditation
interface DailyMeditation {
  id?: string;
  title?: string;
  description?: string;
  type?: "meditation" | "inquiry" | "contemplation";
  days?: number;
  progress?: number;
  isActive?: boolean;
}

// Mapping function to convert DailyMeditation to Challenge
const mapDailyMeditationToChallenge = (meditation: DailyMeditation): Challenge => ({
  id: meditation.id ?? 'default-id',
  title: meditation.title ?? 'Default Title',
  description: meditation.description ?? 'Default Description',
  type: meditation.type ?? 'meditation',
  days: meditation.days ?? 30,
  progress: meditation.progress ?? 0,
  isActive: meditation.isActive ?? true,
});

export const ChallengesList = () => {
  const [challenges] = useState<Challenge[]>(Object.values(dailyMeditations).map((meditation) => mapDailyMeditationToChallenge(meditation)));

  const handleUpdateProgress = (id: string) => {
    console.log(`Updating progress for challenge with id: ${id}`);
    // Implement actual progress update logic here
  };

  return (
    <div>
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} onUpdateProgress={() => handleUpdateProgress(challenge.id)} />
      ))}
    </div>
  );
};
