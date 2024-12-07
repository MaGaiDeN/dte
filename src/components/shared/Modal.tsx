import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 p-6">
              <motion.h2
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </motion.h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto max-h-[calc(85vh-8rem)]">
            {children}
          </div>

          {footer && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-6">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
