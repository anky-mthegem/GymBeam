import React, { useState, useEffect } from 'react';
import {
  Check,
  Plus,
  Trash2,
  Disc,
  RefreshCw,
  FileText,
  Flame,
  LayoutGrid,
  List,
  Rows,
  ChevronLeft,
  ChevronRight,
  FlameKindling,
  Sparkles,
  Timer,
  X
} from 'lucide-react';
import { useGymStore } from '../store/useGymStore.js';
import { keepScreenAwake, allowScreenSleep } from '../lib/wakeLock.js';
import { triggerHapticTick, triggerHapticSuccess } from '../lib/audio.js';
import { calculateWarmupSets } from '../lib/warmup.js';
import { generateDropSet, SET_TYPES } from '../lib/setTypes.js';
import { getNextRestTimer } from '../lib/supersets.js';
import { checkRpeNudge } from '../lib/progression.js';

import RestTimerBar from '../components/RestTimerBar.jsx';
import PlateCalculatorModal from '../components/PlateCalculatorModal.jsx';
import ExerciseSwapperModal from '../components/ExerciseSwapperModal.jsx';
import CelebrationModal from '../components/CelebrationModal.jsx';
import exercisesCatalog from '../data/exercises.json';

export default function Workout({ onFinishSession }) {
  const {
    activeWorkout,
    workoutView,
    setWorkoutView,
    unit,
    updateActiveSet,
    addActiveSet,
    removeActiveSet,
    addExerciseToActiveWorkout,
    removeExerciseFromActiveWorkout,
    saveExerciseNote,
    finishWorkout,
    cancelWorkout,
    adsRemoved
  } = useGymStore();

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [restTimer, setRestTimer] = useState(null);
  const [plateCalcWeight, setPlateCalcWeight] = useState(null);
  const [swapperExercise, setSwapperExercise] = useState(null);
  const [noteModalExercise, setNoteModalExercise] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [showCelebration, setShowCelebration] = useState(null);
  const [nudgeAlert, setNudgeAlert] = useState(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [elapsedSec, setElapsedSec] = useState(0);

  // Screen Wake-Lock during workout
  useEffect(() => {
    keepScreenAwake();
    return () => {
      allowScreenSleep();
    };
  }, []);

  // Elapsed workout timer
  useEffect(() => {
    if (!activeWorkout?.startTime) return;
    const startMs = new Date(activeWorkout.startTime).getTime();
    const updateElapsed = () => {
      setElapsedSec(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout?.startTime]);

  if (!activeWorkout) {
    return (
      <div className="page-container flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
          <Flame size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">No Workout in Progress</h2>
          <p className="text-xs text-slate-400 mt-1">Start a routine from the Home or Plan screen.</p>
        </div>
      </div>
    );
  }

  const exercises = activeWorkout.exercises || [];

  const formatElapsed = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleSetComplete = (exIdx, setIdx, currentSet) => {
    const nextCompleted = !currentSet.completed;
    updateActiveSet(exIdx, setIdx, { completed: nextCompleted });

    if (nextCompleted) {
      triggerHapticSuccess();

      // Trigger rest timer
      const currentEx = exercises[exIdx];
      const timerInfo = getNextRestTimer({
        currentExercise: currentEx,
        allExercises: exercises,
        defaultRestSec: currentEx?.restSec || 90,
        transitionSec: 30
      });

      const nextExObj = timerInfo.nextExerciseId
        ? exercises.find(e => e.id === timerInfo.nextExerciseId)
        : null;

      setRestTimer({
        seconds: timerInfo.durationSec,
        label: timerInfo.message,
        nextEx: nextExObj?.name || null
      });

      // Check RPE Auto-nudge if logged
      if (currentSet.rpe) {
        const nudge = checkRpeNudge(currentSet.rpe);
        if (nudge.nudge) {
          setNudgeAlert({
            message: nudge.message,
            suggestedAdd: nudge.suggestedAdd,
            exIdx,
            setIdx: setIdx + 1
          });
        }
      }
    } else {
      triggerHapticTick();
    }
  };

  const handleCycleSetType = (exIdx, setIdx, currentType) => {
    triggerHapticTick();
    const sequence = ['N', 'W', 'D', '+', 'RP'];
    const nextIdx = (sequence.indexOf(currentType || 'N') + 1) % sequence.length;
    const nextType = sequence[nextIdx];
    updateActiveSet(exIdx, setIdx, { type: nextType });

    if (nextType === 'D') {
      const parentSet = exercises[exIdx].sets[setIdx];
      const dropChild = generateDropSet(parentSet, 20);
      addActiveSet(exIdx);
      setTimeout(() => {
        const newSetIdx = exercises[exIdx].sets.length;
        updateActiveSet(exIdx, newSetIdx, {
          weight: dropChild.weight,
          type: 'D'
        });
      }, 50);
    }
  };

  const handleAutoWarmup = (exIdx) => {
    const ex = exercises[exIdx];
    const workingWeight = ex.sets?.[0]?.weight || 60;
    const warmups = calculateWarmupSets(workingWeight, 8, 20, 2.5);

    const existingSets = ex.sets || [];
    const formattedWarmups = warmups.map((w, idx) => ({
      id: `set_warm_${Date.now()}_${idx}`,
      setNumber: idx + 1,
      weight: w.weight,
      reps: w.reps,
      completed: false,
      type: 'W',
      ghostWeight: w.weight,
      ghostReps: w.reps
    }));

    const renumberedExisting = existingSets.map((s, idx) => ({
      ...s,
      setNumber: formattedWarmups.length + idx + 1
    }));

    useGymStore.setState(state => {
      const updatedExercises = [...state.activeWorkout.exercises];
      updatedExercises[exIdx] = {
        ...ex,
        sets: [...formattedWarmups, ...renumberedExisting]
      };
      return { activeWorkout: { ...state.activeWorkout, exercises: updatedExercises } };
    });
    triggerHapticSuccess();
  };

  const handleFinish = () => {
    const result = finishWorkout();
    if (result) {
      setShowCelebration(result);
    }
  };

  const applyNudgeAdd = () => {
    if (!nudgeAlert) return;
    const { exIdx, setIdx, suggestedAdd } = nudgeAlert;
    const ex = exercises[exIdx];
    if (ex && ex.sets[setIdx]) {
      const currentW = ex.sets[setIdx].weight;
      updateActiveSet(exIdx, setIdx, { weight: currentW + suggestedAdd });
    }
    setNudgeAlert(null);
  };

  const filteredCatalog = exercisesCatalog
    .filter(e => e.name.toLowerCase().includes(addSearch.toLowerCase()) || e.targetMuscle.includes(addSearch.toLowerCase()))
    .slice(0, 25);

  return (
    <div className="page-container">
      {/* Top Header & View Switcher */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">{activeWorkout.title}</h1>
            <span className="text-lg">{activeWorkout.emoji}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-mono font-bold text-[#a3e635] flex items-center gap-1">
              <Timer size={13} />
              {formatElapsed(elapsedSec)}
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">{exercises.length} Exercises</span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex bg-[#12151f] p-1 rounded-xl border border-white/10 gap-1">
          <button
            type="button"
            onClick={() => setWorkoutView('list')}
            className={`p-1.5 rounded-lg transition-all ${
              workoutView === 'list' || !workoutView ? 'bg-[#a3e635] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="All Exercises List"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => setWorkoutView('cards')}
            className={`p-1.5 rounded-lg transition-all ${
              workoutView === 'cards' ? 'bg-[#a3e635] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Focus Cards View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setWorkoutView('compact')}
            className={`p-1.5 rounded-lg transition-all ${
              workoutView === 'compact' ? 'bg-[#a3e635] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Compact View"
          >
            <Rows size={16} />
          </button>
        </div>
      </div>

      {/* RPE Nudge Alert Banner */}
      {nudgeAlert && (
        <div className="bg-[#a3e635]/15 border border-[#a3e635]/40 rounded-2xl p-3 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 text-xs text-white">
            <Sparkles size={16} className="text-[#a3e635]" />
            <span>{nudgeAlert.message}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyNudgeAdd}
              className="px-2.5 py-1 rounded-lg bg-[#a3e635] text-black text-xs font-bold"
            >
              Add +{nudgeAlert.suggestedAdd}
            </button>
            <button
              type="button"
              onClick={() => setNudgeAlert(null)}
              className="px-2 py-1 text-slate-400 hover:text-white text-xs"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* 1. LIST VIEW (Recommended - All exercises in natural flow) */}
      {(workoutView === 'list' || !workoutView) && (
        <div className="flex flex-col gap-4">
          {exercises.map((exercise, exIdx) => (
            <ExerciseCardItem
              key={exercise.id + exIdx}
              exercise={exercise}
              exIndex={exIdx}
              unit={unit}
              onToggleSet={handleToggleSetComplete}
              onCycleSetType={handleCycleSetType}
              onUpdateSet={updateActiveSet}
              onAddSet={addActiveSet}
              onRemoveSet={removeActiveSet}
              onAutoWarmup={handleAutoWarmup}
              onOpenPlates={(w) => setPlateCalcWeight(w)}
              onOpenSwapper={(ex) => setSwapperExercise({ index: exIdx, exercise: ex })}
              onOpenNotes={(ex) => {
                setNoteModalExercise(ex);
                setNoteText(ex.notes || '');
              }}
            />
          ))}
        </div>
      )}

      {/* 2. CARDS VIEW (Focus on one exercise with stepper) */}
      {workoutView === 'cards' && (
        <div className="flex flex-col gap-3">
          {/* Stepper bar */}
          <div className="flex items-center justify-between px-1 bg-black/40 p-2 rounded-xl border border-white/5">
            <button
              type="button"
              disabled={activeCardIndex === 0}
              onClick={() => setActiveCardIndex(prev => Math.max(0, prev - 1))}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-20 text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-bold text-white">
              Exercise {activeCardIndex + 1} of {exercises.length}
            </span>
            <button
              type="button"
              disabled={activeCardIndex === exercises.length - 1}
              onClick={() => setActiveCardIndex(prev => Math.min(exercises.length - 1, prev + 1))}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-20 text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {exercises[activeCardIndex] && (
            <ExerciseCardItem
              exercise={exercises[activeCardIndex]}
              exIndex={activeCardIndex}
              unit={unit}
              onToggleSet={handleToggleSetComplete}
              onCycleSetType={handleCycleSetType}
              onUpdateSet={updateActiveSet}
              onAddSet={addActiveSet}
              onRemoveSet={removeActiveSet}
              onAutoWarmup={handleAutoWarmup}
              onOpenPlates={(w) => setPlateCalcWeight(w)}
              onOpenSwapper={(ex) => setSwapperExercise({ index: activeCardIndex, exercise: ex })}
              onOpenNotes={(ex) => {
                setNoteModalExercise(ex);
                setNoteText(ex.notes || '');
              }}
            />
          )}
        </div>
      )}

      {/* 3. COMPACT VIEW (Fast data entry table) */}
      {workoutView === 'compact' && (
        <div className="flex flex-col gap-3">
          {exercises.map((exercise, exIdx) => (
            <div key={exercise.id + exIdx} className="glass-panel p-3.5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-white">{exercise.name}</span>
                <span className="text-[11px] text-[#a3e635] font-semibold">{exercise.targetMuscle}</span>
              </div>
              <div className="flex flex-col gap-2">
                {(exercise.sets || []).map((s, sIdx) => (
                  <div key={s.id || sIdx} className="flex items-center justify-between text-xs bg-black/40 p-2 rounded-xl">
                    <span className="font-mono text-slate-400">Set {s.setNumber}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={s.weight}
                        placeholder={s.ghostWeight ? String(s.ghostWeight) : '0'}
                        onChange={e => updateActiveSet(exIdx, sIdx, { weight: Number(e.target.value) })}
                        className="set-input w-16"
                      />
                      <span className="text-slate-500 font-mono">×</span>
                      <input
                        type="number"
                        value={s.reps}
                        placeholder={s.ghostReps ? String(s.ghostReps) : '0'}
                        onChange={e => updateActiveSet(exIdx, sIdx, { reps: Number(e.target.value) })}
                        className="set-input w-14"
                      />
                      <button
                        type="button"
                        onClick={() => handleToggleSetComplete(exIdx, sIdx, s)}
                        className={`check-box ${s.completed ? 'checked' : ''}`}
                      >
                        {s.completed && <Check size={18} strokeWidth={3} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer: Add Exercise & Finish Workout */}
      <div className="flex gap-2.5 mt-2">
        <button
          type="button"
          onClick={() => setShowAddExerciseModal(true)}
          className="btn-secondary flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>Add Exercise</span>
        </button>

        <button
          type="button"
          onClick={handleFinish}
          className="btn-primary flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2"
        >
          <Check size={16} strokeWidth={3} />
          <span>Finish Workout</span>
        </button>
      </div>

      {/* Discard Session Button (Styled clean text button without white box) */}
      <div className="text-center pt-2 pb-4">
        <button
          type="button"
          onClick={() => {
            if (confirm('Cancel this in-flight workout session? Unsaved sets will be discarded.')) {
              cancelWorkout();
            }
          }}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold tracking-wider uppercase transition-colors"
        >
          Discard Session
        </button>
      </div>

      {/* Sticky Rest Timer Bar */}
      {restTimer && (
        <RestTimerBar
          initialSeconds={restTimer.seconds}
          label={restTimer.label}
          nextExerciseName={restTimer.nextEx}
          onClose={() => setRestTimer(null)}
          onComplete={() => setRestTimer(null)}
        />
      )}

      {/* Plate Calculator Modal */}
      {plateCalcWeight !== null && (
        <PlateCalculatorModal
          initialWeight={plateCalcWeight}
          onClose={() => setPlateCalcWeight(null)}
        />
      )}

      {/* 1-Tap Exercise Swapper Modal */}
      {swapperExercise && (
        <ExerciseSwapperModal
          currentExercise={swapperExercise.exercise}
          exerciseIndex={swapperExercise.index}
          onClose={() => setSwapperExercise(null)}
        />
      )}

      {/* Equipment Note Modal */}
      {noteModalExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f121b] border border-white/10 rounded-3xl w-full max-w-xs p-5 flex flex-col gap-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Equipment Setup Notes</h3>
            <p className="text-xs text-slate-400">Save pin height, seat notch, or bench angle for {noteModalExercise.name}:</p>
            <textarea
              rows={3}
              placeholder="e.g. Seat notch #4, Cable pin 6..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNoteModalExercise(null)}
                className="btn-secondary flex-1 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  saveExerciseNote(noteModalExercise.id, noteText);
                  setNoteModalExercise(null);
                }}
                className="btn-primary flex-1 py-2 text-xs font-bold"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f121b] border border-white/10 rounded-3xl w-full max-w-md p-5 flex flex-col gap-3 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Add Exercise to Session</h3>
              <button
                type="button"
                onClick={() => setShowAddExerciseModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search exercise or muscle..."
              value={addSearch}
              onChange={e => setAddSearch(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />

            <div className="flex flex-col gap-2 overflow-y-auto">
              {filteredCatalog.map(ex => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    addExerciseToActiveWorkout(ex);
                    setShowAddExerciseModal(false);
                  }}
                  className="text-left bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 flex justify-between items-center"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{ex.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 capitalize">
                      {ex.equipment} · {ex.targetMuscle}
                    </div>
                  </div>
                  <Plus size={16} className="text-[#a3e635]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Finish Workout Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          workout={showCelebration.finalizedWorkout}
          newlyUnlocked={showCelebration.newlyUnlocked}
          adsRemoved={adsRemoved}
          unit={unit}
          onClose={() => {
            setShowCelebration(null);
            if (onFinishSession) onFinishSession();
          }}
        />
      )}
    </div>
  );
}

// Extracted Subcomponent for each Exercise in the Active Workout
function ExerciseCardItem({
  exercise,
  exIndex,
  unit,
  onToggleSet,
  onCycleSetType,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onAutoWarmup,
  onOpenPlates,
  onOpenSwapper,
  onOpenNotes
}) {
  return (
    <div className="glass-panel p-4 flex flex-col gap-3">
      {/* Exercise Title & Fast Tools */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-white">{exercise.name}</h2>
            {exercise.supersetGroup && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/40 font-mono">
                {exercise.supersetGroup}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span className="capitalize">{exercise.equipment}</span>
            <span>·</span>
            <span className="capitalize text-[#a3e635] font-semibold">{exercise.targetMuscle}</span>
            {exercise.notes && (
              <>
                <span>·</span>
                <span className="text-slate-300 italic text-[11px] truncate max-w-[130px]">
                  "{exercise.notes}"
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1.5">
          {/* Notes Button */}
          <button
            type="button"
            onClick={() => onOpenNotes(exercise)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            title="Setup Notes"
          >
            <FileText size={15} />
          </button>

          {/* Barbell Plate Calc */}
          {exercise.equipment === 'barbell' && (
            <button
              type="button"
              onClick={() => onOpenPlates(exercise.sets?.[0]?.weight || 60)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#a3e635]"
              title="Plate Calculator"
            >
              <Disc size={15} />
            </button>
          )}

          {/* Equipment Swapper */}
          <button
            type="button"
            onClick={() => onOpenSwapper(exercise)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            title="Swap if Equipment Busy"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Sets Table Header */}
      <div className="set-table-row text-[10px] font-bold text-slate-500 uppercase px-1">
        <span>Set</span>
        <span className="text-center">Previous</span>
        <span className="text-center">{unit}</span>
        <span className="text-center">Reps</span>
        <span className="text-center">Done</span>
      </div>

      {/* Sets Rows */}
      <div className="flex flex-col gap-2">
        {(exercise.sets || []).map((set, sIdx) => {
          const typeMeta = SET_TYPES[set.type] || SET_TYPES.N;

          return (
            <div
              key={set.id || sIdx}
              className={`set-table-row p-2 rounded-xl transition-all ${
                set.completed ? 'bg-white/5 opacity-70' : 'bg-black/40 border border-white/5'
              }`}
            >
              {/* Set Type / Number Badge */}
              <button
                type="button"
                onClick={() => onCycleSetType(exIndex, sIdx, set.type)}
                className="w-7 h-7 rounded-lg text-[10px] font-extrabold flex items-center justify-center font-mono border transition-transform active:scale-95"
                style={{
                  backgroundColor: `${typeMeta.color}22`,
                  borderColor: `${typeMeta.color}55`,
                  color: typeMeta.color
                }}
                title={`Type: ${typeMeta.label} (Tap to change)`}
              >
                {typeMeta.badge === 'N' ? set.setNumber : typeMeta.badge}
              </button>

              {/* Ghost Placeholder Preview (Previous Weight & Reps) */}
              <div className="text-center text-[11px] font-mono text-slate-500 truncate">
                {set.ghostWeight ? `${set.ghostWeight} × ${set.ghostReps}` : '—'}
              </div>

              {/* Weight Input with Ghost Placeholder */}
              <div className="flex justify-center">
                <input
                  type="number"
                  step="0.5"
                  value={set.weight !== undefined && set.weight !== null ? set.weight : ''}
                  placeholder={set.ghostWeight ? String(set.ghostWeight) : '0'}
                  onChange={e => onUpdateSet(exIndex, sIdx, { weight: Number(e.target.value) })}
                  className="set-input"
                />
              </div>

              {/* Reps Input */}
              <div className="flex justify-center">
                <input
                  type="number"
                  value={set.reps !== undefined && set.reps !== null ? set.reps : ''}
                  placeholder={set.ghostReps ? String(set.ghostReps) : '0'}
                  onChange={e => onUpdateSet(exIndex, sIdx, { reps: Number(e.target.value) })}
                  className="set-input max-w-[54px]"
                />
              </div>

              {/* Completion Checkbox */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => onToggleSet(exIndex, sIdx, set)}
                  className={`check-box ${set.completed ? 'checked' : ''}`}
                >
                  {set.completed && <Check size={18} strokeWidth={3} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row Footer Actions (Auto Warmup & Add Set) */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          type="button"
          onClick={() => onAutoWarmup(exIndex)}
          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 active:scale-95"
        >
          <FlameKindling size={14} />
          <span>Auto Warm-up Sets</span>
        </button>

        <div className="flex gap-2">
          {exercise.sets?.length > 1 && (
            <button
              type="button"
              onClick={() => onRemoveSet(exIndex, exercise.sets.length - 1)}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-rose-400 text-xs font-semibold"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onAddSet(exIndex)}
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-1 active:scale-95"
          >
            <Plus size={14} /> Add Set
          </button>
        </div>
      </div>
    </div>
  );
}
