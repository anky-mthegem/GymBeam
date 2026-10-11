import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Share2, CheckCircle2, Flame, Award } from 'lucide-react';
import { playPrFanfare } from '../lib/audio.js';
import { shareFlexCard } from '../lib/shareCard.js';
import { showWorkoutFinishedAd } from '../lib/admob.js';
import { ACHIEVEMENTS_LIST } from '../lib/achievements.js';
import { calculateWorkingVolume, countWorkingSets } from '../lib/setTypes.js';

export default function CelebrationModal({
  workout,
  newlyUnlocked = [],
  adsRemoved = false,
  unit = 'kg',
  onClose
}) {
  useEffect(() => {
    // 1. Celebratory Confetti blast
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a3e635', '#06b6d4', '#f59e0b', '#ffffff']
    });

    // 2. PR Fanfare sound
    playPrFanfare();

    // 3. Trigger Interstitial ad on workout finish screen
    showWorkoutFinishedAd(adsRemoved);
  }, []);

  const totalVolume = (workout?.exercises || []).reduce(
    (sum, ex) => sum + calculateWorkingVolume(ex.sets || []),
    0
  );

  const totalSets = (workout?.exercises || []).reduce(
    (sum, ex) => sum + countWorkingSets(ex.sets || []),
    0
  );

  const durationMinutes = workout?.startTime && workout?.endTime
    ? Math.max(1, Math.round((new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / 60000))
    : 45;

  const handleShareCard = async () => {
    await shareFlexCard({
      title: workout?.title || 'Workout Session',
      date: new Date().toLocaleDateString(),
      durationMinutes,
      totalVolume,
      unit,
      totalSets,
      prsBroken: [],
      streakDays: 14
    });
  };

  const unlockedBadgeDetails = ACHIEVEMENTS_LIST.filter(a => newlyUnlocked.includes(a.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0f121b] border border-[#a3e635]/40 rounded-3xl w-full max-w-md p-6 flex flex-col items-center gap-4 shadow-[0_0_50px_rgba(163,230,53,0.2)] text-center max-h-[90vh] overflow-y-auto">
        {/* Glowing Badge */}
        <div className="w-16 h-16 rounded-2xl bg-[#a3e635]/20 border border-[#a3e635] flex items-center justify-center text-[#a3e635] shadow-[0_0_30px_rgba(163,230,53,0.4)]">
          <Trophy size={32} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">WORKOUT CRUSHED!</h2>
          <p className="text-xs text-[#a3e635] font-semibold mt-1">
            {workout?.title || 'Session Complete'} · All sets logged locally
          </p>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-3 gap-2 w-full my-1">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">VOLUME</span>
            <span className="text-base font-extrabold font-mono text-[#a3e635] mt-1">
              {totalVolume.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">{unit}</span>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">DURATION</span>
            <span className="text-base font-extrabold font-mono text-white mt-1">
              {durationMinutes}
            </span>
            <span className="text-[10px] text-slate-500">mins</span>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">SETS</span>
            <span className="text-base font-extrabold font-mono text-white mt-1">
              {totalSets}
            </span>
            <span className="text-[10px] text-slate-500">checked</span>
          </div>
        </div>

        {/* Unlocked Badges */}
        {unlockedBadgeDetails.length > 0 && (
          <div className="w-full bg-[#a3e635]/10 border border-[#a3e635]/30 rounded-2xl p-3 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#a3e635]">
              <Award size={16} />
              <span>NEW ACHIEVEMENTS UNLOCKED!</span>
            </div>
            {unlockedBadgeDetails.map(badge => (
              <div key={badge.id} className="flex items-center gap-2 text-xs text-white">
                <span className="text-base">{badge.emoji}</span>
                <span className="font-bold">{badge.title}</span>
                <span className="text-slate-400">· {badge.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Social Flex Card Button */}
        <button
          type="button"
          onClick={handleShareCard}
          className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
        >
          <Share2 size={18} />
          <span>Share Social Flex Card</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="btn-secondary w-full py-3 text-sm text-slate-300 hover:text-white"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
