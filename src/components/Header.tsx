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

  const menuItems = [
    {
      icon: <ChartBarIcon className="h-5 w-5" />,
      label: 'Estadísticas',
      onClick: onShowStats,
      primary: true
    },
    {
      icon: <Plus className="h-5 w-5" />,
      label: 'Nueva Práctica',
      onClick: onNewPractice,
      primary: true
    },
    {
      icon: theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />,
      label: theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro',
      onClick: toggleTheme
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Configuración',
      onClick: () => setIsConfigOpen(true)
    },
    {
      icon: <RotateCcw className="h-5 w-5" />,
      label: 'Reiniciar',
      onClick: handleReset,
      danger: true
    }
  ];

  return (
    <header className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-8 w-8 text-white" />
                <h1 className="ml-3 text-xl sm:text-2xl font-bold text-white">
                  DTE
                  <span className="block text-xs sm:text-sm font-medium text-indigo-100 opacity-90">
                    Disolución del Ego
                  </span>
                </h1>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <ChallengesMenu onCreateChallenge={handleCreateChallenge} />
              </div>

              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden p-2 rounded-lg text-indigo-100 hover:bg-white/10 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Desktop navigation */}
              <nav className="hidden sm:flex items-center space-x-2">
                {menuItems.map((item, index) => (
                  <button 
                    key={index}
                    onClick={item.onClick}
                    className={`
                      flex items-center px-3 py-2 rounded-lg
                      ${item.primary ? 'bg-white/10' : ''}
                      ${item.danger ? 'hover:bg-red-500/20' : 'hover:bg-white/20'}
                      text-indigo-100 hover:text-white transition-colors
                    `}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Mobile navigation */}
            {isMenuOpen && (
              <nav className="sm:hidden mt-4 pb-4 space-y-2">
                {menuItems.map((item, index) => (
                  <button 
                    key={index}
                    onClick={() => {
                      item.onClick();
                      setIsMenuOpen(false);
                    }}
                    className={`
                      flex items-center w-full px-3 py-2 rounded-lg
                      ${item.primary ? 'bg-white/10' : ''}
                      ${item.danger ? 'hover:bg-red-500/20' : 'hover:bg-white/20'}
                      text-indigo-100 hover:text-white transition-colors
                    `}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>

      <ConfigurationModal 
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </header>
  );
}