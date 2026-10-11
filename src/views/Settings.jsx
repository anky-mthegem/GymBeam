import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Volume2,
  Vibrate,
  Smartphone,
  Bell,
  Download,
  Upload,
  Check,
  Disc,
  ShieldCheck,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useGymStore } from '../store/useGymStore.js';
import { requestNotificationPermission, scheduleDailyWorkoutReminder } from '../lib/notifications.js';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export default function Settings() {
  const {
    unit,
    setUnit,
    soundEnabled,
    hapticsEnabled,
    keepAwakeDuringWorkout,
    toggleSetting,
    plateInventory,
    updatePlateInventory,
    notifications,
    exportData,
    importData
  } = useGymStore();

  const [importStatus, setImportStatus] = useState(null);

  const handleToggleNotification = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      toggleSetting('notifications');
      scheduleDailyWorkoutReminder(notifications.reminderHour, notifications.reminderMinute);
    }
  };

  const handleExportJson = async () => {
    const jsonStr = exportData();
    const fileName = `GymBeam_Backup_${new Date().toISOString().slice(0, 10)}.json`;

    if (Capacitor.isNativePlatform()) {
      try {
        const file = await Filesystem.writeFile({
          path: fileName,
          data: jsonStr,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        await Share.share({
          title: 'GymBeam Data Backup',
          url: file.uri,
          dialogTitle: 'Export GymBeam Backup'
        });
        return;
      } catch (err) {
        console.warn('Native export skipped:', err);
      }
    }

    // Web download fallback
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const success = importData(content);
        setImportStatus(success ? 'success' : 'error');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-black text-white">APP SETTINGS</h1>
          <p className="page-subtitle">Preferences & local storage control</p>
        </div>
      </div>

      {/* 100% Free Forever Block */}
      <div className="glass-panel p-4 border border-[#a3e635]/35 shadow-[0_0_24px_rgba(163,230,53,0.12)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#a3e635]" size={20} />
            <h3 className="text-sm font-extrabold text-white">100% Free Forever</h3>
          </div>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30 tracking-wider">
            FREE ACCESS
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-3 leading-relaxed">
          GymBeam is completely free with zero ads, zero paywalls, and zero subscriptions. All workout tracking, muscle analytics, and routines are permanently unlocked for everyone.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex items-center gap-2">
            <ShieldCheck size={15} className="text-[#a3e635] shrink-0" />
            <span className="text-[11px] font-bold text-slate-200">No Paywalls</span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex items-center gap-2">
            <Check size={15} className="text-[#a3e635] shrink-0" />
            <span className="text-[11px] font-bold text-slate-200">No Subscriptions</span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex items-center gap-2">
            <Check size={15} className="text-[#06b6d4] shrink-0" />
            <span className="text-[11px] font-bold text-slate-200">100% Offline</span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex items-center gap-2">
            <Check size={15} className="text-[#a855f7] shrink-0" />
            <span className="text-[11px] font-bold text-slate-200">Zero Tracking</span>
          </div>
        </div>
      </div>

      {/* Unit Switcher & Display */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-white">
          Lifting Units
        </span>

        <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
          <span className="text-xs text-slate-300 font-medium">Weight Unit</span>
          <div className="flex bg-[#12151f] p-1 rounded-xl border border-white/10 gap-1">
            <button
              type="button"
              onClick={() => setUnit('kg')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                unit === 'kg' ? 'bg-[#a3e635] text-black shadow-sm' : 'text-slate-400'
              }`}
            >
              Kilograms (kg)
            </button>
            <button
              type="button"
              onClick={() => setUnit('lb')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                unit === 'lb' ? 'bg-[#a3e635] text-black shadow-sm' : 'text-slate-400'
              }`}
            >
              Pounds (lb)
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Ergonomics & Gym-Floor Settings with Modern Toggle Switches */}
      <div className="glass-panel p-4 flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-white mb-1">
          Gym-Floor Ergonomics
        </span>

        {/* Screen Keep-Awake Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Smartphone size={16} className="text-[#a3e635]" />
            <div>
              <div className="text-xs font-bold text-white">Screen Keep-Awake</div>
              <div className="text-[10px] text-slate-400">Keeps phone awake during active workouts</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={keepAwakeDuringWorkout}
              onChange={() => toggleSetting('keepAwakeDuringWorkout')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Sound Effects */}
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Volume2 size={16} className="text-[#06b6d4]" />
            <div>
              <div className="text-xs font-bold text-white">Rest Timer Audio Chimes</div>
              <div className="text-[10px] text-slate-400">Countdown beeps with background music ducking</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={() => toggleSetting('soundEnabled')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Haptics */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <Vibrate size={16} className="text-amber-400" />
            <div>
              <div className="text-xs font-bold text-white">Tactile Haptic Feedback</div>
              <div className="text-[10px] text-slate-400">Physical vibration on set checks and timer completion</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={hapticsEnabled}
              onChange={() => toggleSetting('hapticsEnabled')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* 100% Offline Push Notifications */}
      <div className="glass-panel p-4 flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-white mb-1">
          Local Offline Reminders ($0 Server Cost)
        </span>

        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Bell size={16} className="text-[#a3e635]" />
            <div>
              <div className="text-xs font-bold text-white">Scheduled Workout Reminders</div>
              <div className="text-[10px] text-slate-400">Fires at 6:00 PM on training days</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications?.enabled || false}
              onChange={handleToggleNotification}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <Bell size={16} className="text-amber-400" />
            <div>
              <div className="text-xs font-bold text-white">Streak Saver Alerts</div>
              <div className="text-[10px] text-slate-400">Alerts at 8:00 PM if scheduled workout wasn't logged</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications?.streakAlerts || false}
              onChange={() => toggleSetting('notifications')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Data Backup & Portability */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-white">
          Data Portability & Zero Lock-In
        </span>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your entire workout history and routines are stored locally. Export a JSON backup to move to any phone:
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="btn-secondary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Download size={15} />
            <span>Export Backup</span>
          </button>

          <label className="btn-secondary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
            <Upload size={15} />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>

        {importStatus === 'success' && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-2 text-xs text-emerald-300 font-semibold text-center">
            ✓ Workout data restored successfully!
          </div>
        )}
        {importStatus === 'error' && (
          <div className="bg-rose-500/20 border border-rose-500/40 rounded-xl p-2 text-xs text-rose-300 font-semibold text-center">
            ⚠️ Invalid backup file format.
          </div>
        )}
      </div>

      {/* Footer / Attribution */}
      <div className="pt-8 pb-32 text-center flex flex-col items-center justify-center gap-1.5">
        <p className="text-sm font-extrabold tracking-wide text-white">
          Made With &lt;3 By <span className="text-[#a3e635]">Anky Singh</span>
        </p>
        <p className="text-[11px] text-slate-400 font-medium tracking-wider">
          GymBeam • Pure Offline Fitness Tracker
        </p>
      </div>
    </div>
  );
}
