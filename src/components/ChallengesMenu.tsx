import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Medal } from 'lucide-react';
import type { Challenge } from '../types/Challenge';
import { PRACTICE_TYPES } from '../constants/practices';

interface ChallengesMenuProps {
  onCreateChallenge: (type: Challenge['type']) => void;
}

export const ChallengesMenu = ({ onCreateChallenge }: ChallengesMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full gap-2 px-3 py-2 text-indigo-100 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
      >
        <Medal className="w-5 h-5" />
        <span>Reto 30 días</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-full sm:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          >
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Reto de 30 días
              </h3>
              <div className="space-y-4">
                {PRACTICE_TYPES.map((practice) => (
                  <div
                    key={practice.type}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {practice.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {practice.challengeDescription}
                    </p>
                    <button
                      onClick={() => {
                        onCreateChallenge(practice.type);
                        setIsOpen(false);
                      }}
                      className="mt-2 flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Comenzar Reto</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};
