import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Activity,
  Camera,
  Layers,
  Sparkles,
  Zap,
  Info,
  Calendar,
  Flame
} from 'lucide-react';
import { useGymStore } from '../store/useGymStore.js';
import { calculateWeeklyMuscleVolume, calculateMuscleRecovery } from '../lib/recovery.js';
import { calculateOneRm, getTrainingPercentages } from '../lib/onerm.js';
import { ACHIEVEMENTS_LIST } from '../lib/achievements.js';
import BodyMap from '../components/BodyMap.jsx';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export default function Stats() {
  const { workoutHistory, unlockedAchievements, unit, progressPhotos } = useGymStore();
  const [activeTab, setActiveTab] = useState('hypertrophy');

  // 1RM test calculation state
  const [calcWeight, setCalcWeight] = useState(100);
  const [calcReps, setCalcReps] = useState(8);

  // Calculations
  const weeklyVolume = calculateWeeklyMuscleVolume(workoutHistory);
  const recoveryData = calculateMuscleRecovery(workoutHistory);
  const estimatedOneRm = calculateOneRm(calcWeight, calcReps, 'epley');
  const trainingZones = getTrainingPercentages(estimatedOneRm);

  const [localPhotos, setLocalPhotos] = useState(progressPhotos || []);

  const handleCaptureProgressPhoto = async () => {
    if (!Capacitor.isNativePlatform()) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            const newPhoto = {
              id: `photo_${Date.now()}`,
              date: new Date().toISOString().slice(0, 10),
              uri: re.target.result
            };
            setLocalPhotos([newPhoto, ...localPhotos]);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    try {
      const photo = await CapCamera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      if (photo?.webPath) {
        const newPhoto = {
          id: `photo_${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          uri: photo.webPath
        };
        setLocalPhotos([newPhoto, ...localPhotos]);
      }
    } catch {}
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-black text-white">ANALYTICS & RECOVERY</h1>
          <p className="page-subtitle">Biomechanical landmarks & strength progression</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-[#12151f] p-1 rounded-2xl border border-white/10 gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'hypertrophy', label: 'Hypertrophy Volume' },
          { id: 'recovery', label: 'Muscle Recovery' },
          { id: 'onerm', label: '1RM Zones' },
          { id: 'achievements', label: 'Badges' },
          { id: 'photos', label: 'Progress Photos' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#a3e635] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. HYPERTROPHY VOLUME LANDMARKS (MV, MEV, MAV, MRV) */}
      {activeTab === 'hypertrophy' && (
        <div className="flex flex-col gap-3">
          <div className="glass-panel p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Weekly Hypertrophy Landmarks
              </span>
              <span className="text-[10px] text-[#a3e635] font-semibold font-mono">
                Optimal: 10–16 Sets
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Direct working sets logged across the last 7 days vs. evidence-based volume landmarks:
            </p>

            <div className="flex flex-col gap-3">
              {Object.entries(weeklyVolume).map(([muscle, data]) => (
                <div key={muscle} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white capitalize">{muscle.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-bold text-[#a3e635]">{data.directSets} sets</span>
                      <span className="text-[10px] text-slate-500">({data.status})</span>
                    </div>
                  </div>

                  {/* Multi-segment volume bar */}
                  <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (data.directSets / 20) * 100)}%`,
                        backgroundColor: data.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. EXPONENTIAL MUSCLE RECOVERY MAP */}
      {activeTab === 'recovery' && (
        <div className="flex flex-col gap-3">
          <div className="glass-panel p-4 flex flex-col items-center">
            <span className="text-xs font-bold text-white uppercase tracking-wider mb-1">
              Muscle Recovery Status (48–72h Decay Model)
            </span>
            <p className="text-[11px] text-slate-400 mb-3 text-center">
              Modeled using physiological exponential fatigue decay <span className="font-mono text-xs">e^(-λt)</span>:
            </p>

            <BodyMap muscleStatus={recoveryData} />

            {/* Muscle Breakdown Grid */}
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              {Object.entries(recoveryData).map(([muscle, rec]) => (
                <div
                  key={muscle}
                  className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white capitalize">
                      {muscle.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {rec.hoursSinceLastWorkout !== null ? `${rec.hoursSinceLastWorkout}h ago` : 'Fresh'}
                    </div>
                  </div>
                  <div
                    className="text-xs font-mono font-extrabold"
                    style={{ color: rec.statusColor }}
                  >
                    {rec.recoveredPercent}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. 1RM ESTIMATIONS & PERCENTAGE MATRIX */}
      {activeTab === 'onerm' && (
        <div className="flex flex-col gap-3">
          <div className="glass-panel p-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
              1RM Calculator & Training Zones
            </span>

            {/* Input Controls */}
            <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-2xl border border-white/5 mb-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Weight Lifted</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="2.5"
                    value={calcWeight}
                    onChange={e => setCalcWeight(Number(e.target.value))}
                    className="set-input w-full text-left"
                  />
                  <span className="text-xs text-slate-500 font-bold">{unit}</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Reps Performed</label>
                <input
                  type="number"
                  max="12"
                  value={calcReps}
                  onChange={e => setCalcReps(Number(e.target.value))}
                  className="set-input w-full text-left"
                />
              </div>
            </div>

            {/* Estimated 1RM Banner */}
            <div className="bg-[#a3e635]/15 border border-[#a3e635]/30 rounded-2xl p-3.5 text-center mb-4">
              <span className="text-[10px] font-bold text-[#a3e635] uppercase tracking-wider">
                ESTIMATED ONE REP MAX (EPLEY)
              </span>
              <div className="text-3xl font-black font-mono text-white mt-1">
                {estimatedOneRm} <span className="text-base text-[#a3e635]">{unit}</span>
              </div>
            </div>

            {/* Training Zones Matrix */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300">Prescribed Training Zones:</span>
              {trainingZones.map(zone => (
                <div
                  key={zone.percentage}
                  className="bg-black/40 border border-white/5 rounded-xl p-3 flex justify-between items-center"
                >
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="text-[#a3e635] font-mono">{zone.percentage}%</span>
                      <span>{zone.zone}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Target: {zone.reps} · {zone.purpose}
                    </div>
                  </div>
                  <div className="text-sm font-extrabold font-mono text-white">
                    {zone.weight} {unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. CLIENT-SIDE GAMIFICATION BADGES */}
      {activeTab === 'achievements' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2.5">
            {ACHIEVEMENTS_LIST.map(badge => {
              const isUnlocked = unlockedAchievements.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                    isUnlocked
                      ? 'bg-[#121622] border-[#a3e635]/40 shadow-[0_0_15px_rgba(163,230,53,0.1)]'
                      : 'bg-black/40 border-white/5 opacity-40'
                  }`}
                >
                  <div className="text-3xl mb-2">{badge.emoji}</div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{badge.title}</span>
                      {isUnlocked && <span className="text-[#a3e635] text-[10px]">✓</span>}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. PROGRESS PHOTOS (GHOST-OVERLAY CAPABLE) */}
      {activeTab === 'photos' && (
        <div className="flex flex-col gap-3">
          <div className="glass-panel p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Ghost-Overlay Progress Photos
                </span>
                <span className="text-[10px] text-slate-400">
                  Stored 100% locally on your device for absolute privacy
                </span>
              </div>
              <button
                type="button"
                onClick={handleCaptureProgressPhoto}
                className="btn-primary py-2 px-3 text-xs font-bold flex items-center gap-1"
              >
                <Camera size={14} />
                <span>Snap Photo</span>
              </button>
            </div>

            {localPhotos.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
                No progress photos logged yet. Take a progress photo to track visual physique changes!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 mt-2">
                {localPhotos.map(photo => (
                  <div
                    key={photo.id}
                    className="relative rounded-xl overflow-hidden border border-white/10 bg-black/60 group"
                  >
                    <img
                      src={photo.uri}
                      alt="Progress"
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-2 text-[10px] font-bold text-white">
                      {photo.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
