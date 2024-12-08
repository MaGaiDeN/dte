import { Sparkles, Settings, RotateCcw, Moon, Sun, Menu, Plus, ChartBarIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import { ConfigurationModal } from './ConfigurationModal';
import { ChallengesMenu } from './ChallengesMenu';
import type { Challenge } from '../types/Challenge';

interface HeaderProps {
  onReset: () => void;
  onNewPractice: () => void;
  onShowStats: () => void;
  onCreateChallenge?: (type: Challenge['type']) => void;
}

// Define a type for Menu Items
interface MenuItem {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
  className?: string;
}

export function Header({ onReset, onNewPractice, onShowStats, onCreateChallenge }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar todas las prácticas a su estado inicial? Esta acción no se puede deshacer.')) {
      onReset();
    }
  };

  const handleCreateChallenge = (type: Challenge['type']) => {
    onCreateChallenge?.(type);
  };

  const menuItems: MenuItem[] = [
    {
      icon: <ChartBarIcon className="h-5 w-5" />, 
      label: 'Estadísticas',
      onClick: onShowStats,
      primary: true,
      className: '' // Optional className
    },
    {
      icon: <Plus className="h-5 w-5" />,
      label: 'Nueva Práctica',
      onClick: onNewPractice,
      primary: true,
      className: '' // Optional className
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Configuración',
      onClick: () => setIsConfigOpen(true),
      className: '' // Optional className
    },
    {
      icon: <RotateCcw className="h-5 w-5" />,
      label: 'Reiniciar',
      onClick: handleReset,
      danger: true,
      className: '' // Optional className
    }
  ];

  return (
    <header className="bg-indigo-600 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-4 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div className="flex items-center">
            <Sparkles className="h-8 w-8 text-white" />
            <h1 className="ml-3 text-xl sm:text-2xl font-bold text-white">
              DTE
              <span className="block text-xs sm:text-sm font-medium text-indigo-100 opacity-90">
                Disolución del Ego
              </span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            <ChallengesMenu onCreateChallenge={handleCreateChallenge} />
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`
                  inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                  ${item.danger 
                    ? 'text-red-100 hover:text-white hover:bg-red-500' 
                    : item.primary
                      ? 'text-indigo-100 hover:text-white hover:bg-white/20'
                      : 'text-indigo-100 hover:text-white hover:bg-white/20'
                  }
                  transition-colors
                  ${item.className || ''}
                `}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </button>
            ))}
            <button
              onClick={toggleTheme}
              className="p-2 text-indigo-100 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              className="p-2 text-indigo-100 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4">
            <div className="flex flex-col space-y-2">
              <ChallengesMenu onCreateChallenge={handleCreateChallenge} />
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsMenuOpen(false);
                  }}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm
                    ${item.danger 
                      ? 'text-red-100 hover:text-white hover:bg-red-500' 
                      : 'text-indigo-100 hover:text-white hover:bg-white/20'
                    }
                    transition-colors
                    ${item.className || ''}
                  `}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMenuOpen(false);
                }}
                className="flex items-center px-3 py-2 text-indigo-100 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="ml-2">Cambiar tema</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Configuration Modal */}
      {isConfigOpen && (
        <ConfigurationModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
        />
      )}
    </header>
  );
}