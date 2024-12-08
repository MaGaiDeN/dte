import { useState } from 'react';
import type { Challenge } from '../types/Challenge';
import { ChallengeCard } from './ChallengeCard';
import { dailyMeditations } from '../data/dailyMeditations';
import { dailyContemplations } from '../data/dailyContemplations';

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
const mapDailyMeditationToChallenge = (meditation: DailyMeditation, type: "meditation" | "contemplation"): Challenge => ({
  id: meditation.id ?? `${type}-challenge`,
  title: meditation.title ?? 'Default Title',
  description: meditation.description ?? 'Default Description',
  type: type,
  days: 30,
  progress: 0,
  isActive: true
});

export const ChallengesList = () => {
  const [challenges] = useState<Challenge[]>([
    ...Object.values(dailyMeditations).map(meditation => 
      mapDailyMeditationToChallenge(meditation, "meditation")
    ),
    ...Object.values(dailyContemplations).map(contemplation => 
      mapDailyMeditationToChallenge(contemplation, "contemplation")
    )
  ]);

  const handleUpdateProgress = (id: string, progress: number) => {
    console.log(`Updating progress for challenge with id: ${id}, new progress: ${progress}%`);
    // Implement actual progress update logic here
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {challenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          onUpdateProgress={(progress) => handleUpdateProgress(challenge.id, progress)}
        />
      ))}
    </div>
  );
};
