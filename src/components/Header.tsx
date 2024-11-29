import { Sparkles, Settings, RotateCcw, Moon, Sun, Menu, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

interface HeaderProps {
  onReset: () => void;
  onNewPractice: () => void;
}

export function Header({ onReset, onNewPractice }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar todas las prácticas a su estado inicial? Esta acción no se puede deshacer.')) {
      onReset();
    }
  };

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

              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden p-2 rounded-lg text-indigo-100 hover:bg-white/10 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Desktop navigation */}
              <nav className="hidden sm:flex items-center space-x-4">
                <button 
                  onClick={onNewPractice}
                  className="flex items-center px-3 py-2 rounded-lg text-indigo-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span className="ml-2">Nueva Práctica</span>
                </button>
                <button 
                  onClick={handleReset}
                  className="flex items-center px-3 py-2 rounded-lg text-indigo-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span className="ml-2">Reiniciar</span>
                </button>
                <button 
                  onClick={toggleTheme}
                  className="flex items-center px-3 py-2 rounded-lg text-indigo-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-5 w-5" />
                      <span className="ml-2">Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      <span className="ml-2">Modo Oscuro</span>
                    </>
                  )}
                </button>
                <button className="flex items-center px-3 py-2 rounded-lg text-indigo-100 hover:text-white hover:bg-white/10 transition-colors">
                  <Settings className="h-5 w-5" />
                  <span className="ml-2">Configuración</span>
                </button>
              </nav>
            </div>

            {/* Mobile navigation */}
            {isMenuOpen && (
              <nav className="sm:hidden mt-4 pb-4 space-y-2">
                <button 
                  onClick={onNewPractice}
                  className="flex w-full items-center px-3 py-2 rounded-lg text-indigo-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span className="ml-2">Nueva Práctica</span>
                </button>
                <button 
                  onClick={handleReset}
                  className="flex w-full items-center px-3 py-2 rounded-lg text-indigo-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span className="ml-2">Reiniciar</span>
                </button>
                <button 
                  onClick={toggleTheme}
                  className="flex w-full items-center px-3 py-2 rounded-lg text-indigo-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-5 w-5" />
                      <span className="ml-2">Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      <span className="ml-2">Modo Oscuro</span>
                    </>
                  )}
                </button>
                <button className="flex w-full items-center px-3 py-2 rounded-lg text-indigo-100 hover:text-white hover:bg-white/10 transition-colors">
                  <Settings className="h-5 w-5" />
                  <span className="ml-2">Configuración</span>
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </header>
  );
}