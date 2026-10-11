import React from 'react';
import { X, RefreshCw, ArrowRight } from 'lucide-react';
import { findSubstitutes, calculateEquivalentWeight } from '../lib/substitutions.js';
import exercisesCatalog from '../data/exercises.json';
import { useGymStore } from '../store/useGymStore.js';

export default function ExerciseSwapperModal({
  currentExercise,
  exerciseIndex,
  onClose
}) {
  const { swapExerciseInActiveWorkout, unit } = useGymStore();
  const currentWeight = currentExercise?.sets?.[0]?.weight || 60;
  const substitutes = findSubstitutes(currentExercise, exercisesCatalog);

  const handleSwap = (targetExercise) => {
    const equivalentWeight = calculateEquivalentWeight(
      currentExercise.equipment,
      targetExercise.equipment,
      currentWeight
    );
    swapExerciseInActiveWorkout(exerciseIndex, targetExercise, equivalentWeight);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0f121b] border border-white/10 rounded-3xl w-full max-w-md p-5 flex flex-col gap-4 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <RefreshCw className="text-[#a3e635]" size={20} />
            <span>Equipment Busy? Swap Now</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-black/40 p-3 rounded-2xl border border-white/5 text-xs">
          <span className="text-slate-400">Current Exercise: </span>
          <span className="text-white font-bold">{currentExercise?.name}</span>
          <div className="text-slate-500 mt-1">
            Target: <span className="text-[#a3e635] font-semibold">{currentExercise?.targetMuscle}</span> · {currentWeight} {unit}
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          Select a biomechanically equivalent substitute. Target weights are pre-calculated using modality transfer ratios:
        </p>

        <div className="flex flex-col gap-2">
          {substitutes.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500">
              No direct substitutes found. Try browsing the exercise library.
            </div>
          ) : (
            substitutes.map((sub) => {
              const eqWeight = calculateEquivalentWeight(
                currentExercise.equipment,
                sub.equipment,
                currentWeight
              );

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSwap(sub)}
                  className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between transition-all active:scale-[0.98]"
                >
                  <div className="flex-1 pr-2">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{sub.name}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span className="capitalize px-1.5 py-0.5 rounded bg-white/5 text-[10px]">
                        {sub.equipment}
                      </span>
                      <span>Target: {sub.targetMuscle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-[#a3e635]">
                        ~{eqWeight} {unit}
                      </div>
                      <div className="text-[10px] text-slate-500">Suggested</div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
