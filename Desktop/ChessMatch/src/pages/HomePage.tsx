import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Board from '@/components/Board/Board'
import CreateChallengeModal from '@/components/CreateChallengeModal/CreateChallengeModal'
import { auth } from '@/config/firebase'
import {
  TrophyIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  FireIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

const stats = {
  victories: 75,
  challengesSent: 120,
  challengesCompleted: 95,
  playingNow: 42
}

export default function HomePage() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-forest font-roboto">
      <header className="bg-black/30 backdrop-blur-sm shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8 sm:h-10 sm:w-10 text-golden" />
              <div className="flex flex-col leading-none">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight font-montserrat">
                  <span className="text-white drop-shadow-md block leading-none">Chess</span>
                  <span className="text-golden drop-shadow-md block leading-none">Match</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {auth.currentUser ? (
                <button
                  onClick={() => auth.signOut()}
                  className="rounded bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition-colors inline-flex items-center"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
                  Sign Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="rounded bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition-colors inline-flex items-center"
                  >
                    <UserPlusIcon className="h-4 w-4 mr-1.5" />
                    Sign Up
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="rounded bg-golden/10 px-3 py-1.5 text-sm font-medium text-golden hover:bg-golden/20 transition-colors inline-flex items-center"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Estadísticas y botones */}
          <div className="space-y-6">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-golden/20">
              <h2 className="text-xl font-semibold text-white mb-6 font-montserrat flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2 text-golden" />
                Your Statistics
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-black/20 rounded-lg p-4 border border-golden/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrophyIcon className="h-5 w-5 text-golden mr-2" />
                      <p className="text-sm text-gray-300 font-roboto">Victories</p>
                    </div>
                    <p className="text-2xl font-bold text-golden">{stats.victories}</p>
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-4 border border-golden/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FireIcon className="h-5 w-5 text-golden mr-2" />
                      <p className="text-sm text-gray-300 font-roboto">Challenges Sent</p>
                    </div>
                    <p className="text-2xl font-bold text-golden">{stats.challengesSent}</p>
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-4 border border-golden/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-golden mr-2" />
                      <p className="text-sm text-gray-300 font-roboto">Completed</p>
                    </div>
                    <p className="text-2xl font-bold text-golden">{stats.challengesCompleted}</p>
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-4 border border-golden/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-golden mr-2" />
                      <p className="text-sm text-gray-300 font-roboto">Playing Now</p>
                    </div>
                    <p className="text-2xl font-bold text-golden">{stats.playingNow}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-golden/20 space-y-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full rounded-lg bg-forest/10 hover:bg-forest/20 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors inline-flex items-center justify-center"
              >
                <FireIcon className="h-6 w-6 mr-2" />
                Create Challenge
              </button>
              <CreateChallengeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreateChallenge={(data) => {
                  console.log('Challenge data:', data)
                  // Aquí implementaremos la lógica para crear el reto
                  setIsModalOpen(false)
                }}
              />
              <div className="grid grid-cols-2 gap-4">
                <button className="w-full bg-forest/10 text-white rounded-lg py-3 font-medium hover:bg-forest/20 transition-colors font-montserrat inline-flex items-center justify-center">
                  <GlobeAltIcon className="h-5 w-5 mr-2" />
                  Play Online
                </button>
                <button className="w-full bg-white/10 text-forest rounded-lg py-3 font-medium hover:bg-white/20 transition-colors font-montserrat inline-flex items-center justify-center">
                  <ComputerDesktopIcon className="h-5 w-5 mr-2" />
                  vs CPU
                </button>
              </div>
            </div>
          </div>

          {/* Columna central - Tablero */}
          <div className="lg:col-span-2">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-golden/20">
              <Board />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
