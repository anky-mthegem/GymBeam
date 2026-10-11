import React, { useState, useEffect } from 'react';
import {
  Flame,
  Dumbbell,
  Calendar,
  BookOpen,
  BarChart2,
  Settings as SettingsIcon
} from 'lucide-react';
import Home from './views/Home.jsx';
import Workout from './views/Workout.jsx';
import Plan from './views/Plan.jsx';
import Library from './views/Library.jsx';
import Stats from './views/Stats.jsx';
import Settings from './views/Settings.jsx';
import { useGymStore } from './store/useGymStore.js';
import { initializeAdMob } from './lib/admob.js';
import { loadStateFromDevice } from './lib/storage.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { activeWorkout } = useGymStore();

  useEffect(() => {
    // 1. Initialize AdMob for monetization
    initializeAdMob();

    // 2. Load durable state mirror if available
    loadStateFromDevice().then(savedState => {
      if (savedState) {
        useGymStore.setState(savedState);
      }
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white select-none">
      {/* Main View Area */}
      <main className="flex-1 w-full max-w-[520px] mx-auto overflow-y-auto">
        {activeTab === 'home' && (
          <Home
            onNavigateToWorkout={() => setActiveTab('workout')}
            onNavigateToPlan={() => setActiveTab('plan')}
          />
        )}
        {activeTab === 'workout' && (
          <Workout
            onFinishSession={() => setActiveTab('home')}
          />
        )}
        {activeTab === 'plan' && (
          <Plan
            onStartWorkout={() => setActiveTab('workout')}
          />
        )}
        {activeTab === 'library' && <Library />}
        {activeTab === 'stats' && <Stats />}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* Floating Active Workout Quick Indicator (Docked above bottom nav, never overlaps header!) */}
      {activeWorkout && activeTab !== 'workout' && (
        <div
          onClick={() => setActiveTab('workout')}
          className="active-session-bar"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a3e635] animate-ping" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{activeWorkout.title}</span>
                <span>{activeWorkout.emoji}</span>
              </div>
              <div className="text-[10px] text-[#a3e635] font-semibold">
                Session Active · Tap to Resume
              </div>
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[#a3e635] text-black text-xs font-black shadow-sm">
            Resume
          </div>
        </div>
      )}

      {/* Persistent Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
        >
          <Flame size={20} />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workout')}
          className={`nav-tab relative ${activeTab === 'workout' ? 'active' : ''}`}
        >
          <Dumbbell size={20} />
          <span>Workout</span>
          {activeWorkout && (
            <span className="absolute top-1 right-5 w-2 h-2 rounded-full bg-[#a3e635] shadow-[0_0_6px_#a3e635]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          className={`nav-tab ${activeTab === 'plan' ? 'active' : ''}`}
        >
          <Calendar size={20} />
          <span>Plan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`nav-tab ${activeTab === 'library' ? 'active' : ''}`}
        >
          <BookOpen size={20} />
          <span>Library</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`nav-tab ${activeTab === 'stats' ? 'active' : ''}`}
        >
          <BarChart2 size={20} />
          <span>Stats</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <SettingsIcon size={20} />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}
