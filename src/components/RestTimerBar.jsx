import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Plus, SkipForward, Timer, X } from 'lucide-react';
import { playCountdownTick, playRestCompleteSound } from '../lib/audio.js';
import { scheduleRestTimerNotification, cancelRestTimerNotification } from '../lib/notifications.js';

export default function RestTimerBar({
  initialSeconds = 90,
  label = 'Rest Period',
  nextExerciseName = null,
  onComplete,
  onClose
}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Sync background notification
  useEffect(() => {
    scheduleRestTimerNotification(secondsLeft);
    return () => {
      cancelRestTimerNotification();
    };
  }, []);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          playRestCompleteSound();
          if (onComplete) onComplete();
          return 0;
        }

        // 3-2-1 countdown ticks
        if (prev <= 4 && prev > 1) {
          playCountdownTick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, onComplete]);

  const addThirtySeconds = () => {
    setSecondsLeft(prev => prev + 30);
    setTotalSeconds(prev => prev + 30);
    scheduleRestTimerNotification(secondsLeft + 30);
  };

  const skipTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    cancelRestTimerNotification();
    if (onComplete) onComplete();
    if (onClose) onClose();
  };

  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / Math.max(1, totalSeconds)) * 100));

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="sticky-rest-bar p-3.5 flex flex-col gap-2">
      {/* Progress Line */}
      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#a3e635] transition-all duration-1000 ease-linear rounded-full shadow-[0_0_8px_#a3e635]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        {/* Left: Time & Label */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#a3e635]/15 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635]">
            <Timer size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight font-mono text-[#a3e635]">
              {formatTime(secondsLeft)}
            </div>
            <div className="text-[11px] text-slate-300 font-medium truncate max-w-[180px]">
              {nextExerciseName ? `Next: ${nextExerciseName}` : label}
            </div>
          </div>
        </div>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addThirtySeconds}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1 active:scale-95 transition-all"
          >
            <Plus size={14} /> 30s
          </button>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white active:scale-95 transition-all"
          >
            {isPaused ? <Play size={16} fill="white" /> : <Pause size={16} fill="white" />}
          </button>

          <button
            type="button"
            onClick={skipTimer}
            className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <SkipForward size={16} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-300 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
