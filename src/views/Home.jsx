import React, { useState } from 'react';
import { Play, Flame, Dumbbell, TrendingUp, Plus, Calendar, RotateCcw, ChevronRight, Scale } from 'lucide-react';
import { useGymStore } from '../store/useGymStore.js';
import { calculateWeightTrend, calculateWeightEma } from '../lib/bodyweight.js';
import { calculateWorkingVolume } from '../lib/setTypes.js';

export default function Home({ onNavigateToWorkout, onNavigateToPlan }) {
  const {
    routines,
    scheduleType,
    weekSchedule,
    cycleSchedule,
    workoutHistory,
    activeWorkout,
    bodyweightLogs,
    targetWeight,
    unit,
    logBodyweight,
    startWorkout
  } = useGymStore();

  const [weightInput, setWeightInput] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);

  // Determine today's workout
  const todayDay = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  let scheduledRoutine = null;

  if (scheduleType === 'calendar') {
    const routineId = weekSchedule[String(todayDay)];
    scheduledRoutine = routines.find(r => r.id === routineId) || null;
  } else {
    const currentSeqId = cycleSchedule.sequence[cycleSchedule.currentIndex];
    if (currentSeqId !== 'REST') {
      scheduledRoutine = routines.find(r => r.id === currentSeqId) || null;
    }
  }

  // Fallback to first routine if rest or none configured
  const featuredRoutine = scheduledRoutine || routines[0];

  // Calculate Streak & Totals
  const totalWorkouts = workoutHistory.length;
  const lifetimeVolume = workoutHistory.reduce((total, w) => {
    return total + (w.exercises || []).reduce((sum, ex) => sum + calculateWorkingVolume(ex.sets || []), 0);
  }, 0);

  // Weight Trend
  const weightTrend = calculateWeightTrend(bodyweightLogs);
  const smoothedSeries = calculateWeightEma(bodyweightLogs).slice(-7);

  // 12-week Heatmap Data (84 days = 12 weeks x 7 days)
  const today = new Date();
  const pastYearDates = [];
  const workoutDateSet = new Set(
    workoutHistory.map(w => (w.date || w.endTime || w.startTime || '').slice(0, 10))
  );

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const hasWorkout = workoutDateSet.has(dateStr);
    pastYearDates.push({ date: dateStr, count: hasWorkout ? 1 : 0 });
  }

  const handleStartToday = () => {
    if (activeWorkout) {
      onNavigateToWorkout();
    } else {
      startWorkout(featuredRoutine?.id);
      onNavigateToWorkout();
    }
  };

  const handleSaveWeight = (e) => {
    e.preventDefault();
    if (!weightInput) return;
    logBodyweight(Number(weightInput));
    setWeightInput('');
    setShowWeightModal(false);
  };

  // Sparkline coordinates for smoothed series
  const svgWidth = 280;
  const svgHeight = 44;
  let sparklinePath = '';
  let sparklineArea = '';
  let dataPoints = [];

  if (smoothedSeries.length >= 2) {
    const weights = smoothedSeries.map(s => s.smoothedWeight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = maxW - minW || 1;

    dataPoints = smoothedSeries.map((s, idx) => {
      const x = (idx / (smoothedSeries.length - 1)) * (svgWidth - 20) + 10;
      const y = svgHeight - 8 - ((s.smoothedWeight - minW) / range) * (svgHeight - 16);
      return { x, y, weight: s.smoothedWeight, date: s.date.slice(5) };
    });

    sparklinePath = `M ${dataPoints[0].x} ${dataPoints[0].y} ` + dataPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    sparklineArea = `${sparklinePath} L ${dataPoints[dataPoints.length - 1].x} ${svgHeight} L ${dataPoints[0].x} ${svgHeight} Z`;
  }

  return (
    <div className="page-container">
      {/* App Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white">GYMBEAM</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
              OFFLINE
            </span>
          </div>
          <p className="page-subtitle">Zero cloud overhead · 100% private</p>
        </div>

        {/* Lifetime Quick Stat */}
        <div className="flex items-center gap-2 bg-[#10131c] px-3 py-1.5 rounded-xl border border-white/10">
          <Flame size={16} className="text-[#a3e635]" />
          <span className="text-xs font-bold font-mono text-white">
            {totalWorkouts} Sessions
          </span>
        </div>
      </div>

      {/* Featured / In-Flight Workout Hero Card */}
      <div className="glass-panel p-5 relative overflow-hidden border border-[#a3e635]/35 shadow-[0_0_35px_rgba(163,230,53,0.12)]">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#a3e635]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a3e635] flex items-center gap-1.5">
              {activeWorkout ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  SESSION IN PROGRESS
                </>
              ) : scheduledRoutine ? (
                'TODAY\'S SCHEDULED WORKOUT'
              ) : (
                'SUGGESTED ROUTINE'
              )}
            </span>
            <h2 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2">
              <span>{activeWorkout ? activeWorkout.title : featuredRoutine?.name}</span>
              <span>{featuredRoutine?.emoji || '🔥'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeWorkout
                ? `${activeWorkout.exercises?.length} exercises · Live session active`
                : `${featuredRoutine?.exercises?.length || 0} exercises · ~50 min target`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartToday}
          className="btn-primary w-full mt-4 py-3.5 text-sm font-bold flex items-center justify-center gap-2"
        >
          <Play size={18} fill="black" />
          <span>{activeWorkout ? 'Resume Active Session' : 'Start Workout'}</span>
        </button>
      </div>

      {/* 12-Week Consistency Heatmap */}
      <div className="glass-panel p-4.5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#a3e635]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Consistency Streak (Last 12 Weeks)
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#a3e635] font-bold">
            {workoutHistory.length} completed
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="flex flex-wrap gap-1 justify-between bg-black/40 p-3 rounded-xl border border-white/5">
          {pastYearDates.map((item, idx) => (
            <div
              key={idx}
              title={`${item.date}: ${item.count ? 'Workout Logged' : 'Rest'}`}
              className={`heatmap-cell ${item.count > 0 ? 'level-4' : ''}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-2.5 text-[10px] text-slate-500 font-medium px-0.5">
          <span>Less active</span>
          <div className="flex gap-1.5 items-center">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#141824] inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-xs bg-[#a3e635] inline-block shadow-[0_0_6px_#a3e635]"></span>
          </div>
          <span>Workout completed</span>
        </div>
      </div>

      {/* Bodyweight 7-Day Trend Section */}
      <div className="glass-panel p-4.5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-[#06b6d4]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Bodyweight Trend (7-Day EMA)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowWeightModal(true)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1"
          >
            <Plus size={14} /> Log Scale
          </button>
        </div>

        <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black font-mono text-white">
              {weightTrend.currentAverage ? `${weightTrend.currentAverage} ${unit}` : 'No entries'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {weightTrend.message}
            </div>
          </div>
          {targetWeight && (
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Goal Target</span>
              <div className="text-sm font-bold font-mono text-[#a3e635]">
                {targetWeight} {unit}
              </div>
            </div>
          )}
        </div>

        {/* Smoothed Trend Sparkline SVG */}
        {dataPoints.length >= 2 ? (
          <div className="mt-3 pt-2">
            <div className="w-full flex justify-center">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-12 overflow-visible">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={sparklineArea} fill="url(#areaGradient)" />
                <path d={sparklinePath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {dataPoints.map((p, idx) => (
                  <circle key={idx} cx={p.x} cy={p.y} r="3" fill="#06b6d4" stroke="#000" strokeWidth="1.5" />
                ))}
              </svg>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1 px-1">
              {dataPoints.map((p, idx) => (
                <span key={idx}>{p.date}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-[11px] text-slate-500">
            Log at least 2 entries to display the 7-day EMA curve.
          </div>
        )}
      </div>

      {/* Lifetime Stats & Schedule Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel p-4 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-semibold">LIFETIME VOLUME</span>
          <div className="text-xl font-extrabold font-mono text-[#a3e635] mt-1.5">
            {(lifetimeVolume / 1000).toFixed(1)}k <span className="text-xs text-slate-400">{unit}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Excludes warm-up sets</span>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-semibold">SCHEDULE TYPE</span>
          <div className="text-sm font-extrabold text-white mt-1.5 capitalize">
            {scheduleType === 'calendar' ? 'Weekly Split' : 'Rolling Cycle'}
          </div>
          <button
            type="button"
            onClick={onNavigateToPlan}
            className="text-[10px] text-[#a3e635] font-bold mt-1.5 flex items-center gap-0.5 hover:underline"
          >
            <span>Configure Plan</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Log Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveWeight}
            className="bg-[#0f121b] border border-white/10 rounded-3xl w-full max-w-xs p-5 flex flex-col gap-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">Log Today's Scale Weight</h3>
            <div className="flex items-center gap-2 bg-black/50 p-3 rounded-2xl border border-white/10">
              <input
                type="number"
                step="0.1"
                autoFocus
                placeholder="e.g. 78.5"
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                className="w-full bg-transparent text-xl font-bold font-mono text-white outline-none"
              />
              <span className="text-xs text-slate-400 font-bold">{unit}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowWeightModal(false)}
                className="btn-secondary flex-1 py-2 text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 py-2 text-xs font-bold">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
