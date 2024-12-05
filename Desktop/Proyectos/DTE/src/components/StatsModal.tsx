import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import type { Practice } from '../types/Habit';
import { PracticeStats } from './PracticeStats';
import { ProgressCharts } from './ProgressCharts';

const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 }
};

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  practices: Practice[];
}

export function StatsModal({ isOpen, onClose, practices }: StatsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          as={motion.div}
          variants={modalBackdrop}
          initial="initial"
          animate="animate"
          exit="exit"
          open={isOpen}
          onClose={onClose}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70" aria-hidden="true" />
            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

            <motion.div
              variants={modalContent}
              className="inline-block w-full max-w-4xl my-8 text-left align-middle bg-white dark:bg-gray-800 rounded-2xl shadow-xl transform transition-all relative overflow-hidden"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 px-8 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <Dialog.Title as="h3" className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Estadísticas Detalladas
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/70">
                    <PracticeStats practices={practices} />
                  </div>

                  {practices.length > 0 && (
                    <div className="space-y-6">
                      <ProgressCharts practices={practices} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
