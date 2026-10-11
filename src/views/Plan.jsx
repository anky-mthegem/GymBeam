import React, { useState } from 'react';
import {
  Calendar,
  Repeat,
  Plus,
  Play,
  Edit2,
  Trash2,
  ChevronRight,
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import { useGymStore, STARTER_ROUTINES } from '../store/useGymStore.js';
import RoutineEditModal from './RoutineEdit.jsx';

const WEEKDAYS = [
  { id: '1', label: 'Mon' },
  { id: '2', label: 'Tue' },
  { id: '3', label: 'Wed' },
  { id: '4', label: 'Thu' },
  { id: '5', label: 'Fri' },
  { id: '6', label: 'Sat' },
  { id: '0', label: 'Sun' }
];

export default function Plan({ onStartWorkout }) {
  const {
    routines,
    scheduleType,
    setScheduleType,
    weekSchedule,
    updateWeekSchedule,
    cycleSchedule,
    updateCycleSchedule,
    deleteRoutine,
    saveRoutine,
    startWorkout
  } = useGymStore();

  const [editingRoutine, setEditingRoutine] = useState(null);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  const handleLaunchRoutine = (routineId) => {
    startWorkout(routineId);
    if (onStartWorkout) onStartWorkout();
  };

  const handleApplyTemplate = (template) => {
    const cloned = {
      ...template,
      id: `routine_${Date.now()}`,
      name: `${template.name} (Copy)`
    };
    saveRoutine(cloned);
    setShowTemplateLibrary(false);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-black text-white">TRAINING PLAN</h1>
          <p className="page-subtitle">Routines & schedule automation</p>
        </div>

        <button
          type="button"
          onClick={() => setShowTemplateLibrary(true)}
          className="btn-secondary py-2 px-3 text-xs font-bold flex items-center gap-1.5"
        >
          <Sparkles size={14} className="text-[#a3e635]" />
          <span>Templates</span>
        </button>
      </div>

      {/* Schedule Mode Switcher */}
      <div className="glass-panel p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Schedule Engine
          </span>
          <div className="flex bg-[#12151f] p-1 rounded-xl border border-white/10 gap-1">
            <button
              type="button"
              onClick={() => setScheduleType('calendar')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                scheduleType === 'calendar'
                  ? 'bg-[#a3e635] text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar size={13} />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setScheduleType('cycle')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                scheduleType === 'cycle'
                  ? 'bg-[#a3e635] text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Repeat size={13} />
              <span>Rolling Cycle</span>
            </button>
          </div>
        </div>

        {/* Calendar Mode: Weekday Matrix */}
        {scheduleType === 'calendar' ? (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-slate-400">
              Assign routines to fixed days of the week:
            </p>
            <div className="grid grid-cols-7 gap-1.5 mt-1">
              {WEEKDAYS.map((day) => {
                const assignedId = weekSchedule[day.id];
                const assignedRoutine = routines.find(r => r.id === assignedId);

                return (
                  <div
                    key={day.id}
                    className="flex flex-col items-center bg-black/40 border border-white/5 rounded-xl p-1.5 gap-1"
                  >
                    <span className="text-[10px] font-bold text-slate-400">{day.label}</span>
                    <select
                      value={assignedId || ''}
                      onChange={(e) => updateWeekSchedule(day.id, e.target.value || null)}
                      className="w-full bg-[#161a26] text-[10px] font-semibold text-center text-white border border-white/10 rounded-md py-1 outline-none truncate"
                    >
                      <option value="">Rest</option>
                      {routines.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Rolling Cycle Mode: Sequence */
          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-slate-400">
              Rolling rotation (advances each completed workout automatically regardless of weekday):
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {cycleSchedule.sequence.map((seqId, idx) => {
                const isCurrent = cycleSchedule.currentIndex === idx;
                const routine = routines.find(r => r.id === seqId);
                const isRest = seqId === 'REST';

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#a3e635]/20 border-[#a3e635] text-[#a3e635]'
                        : 'bg-black/40 border-white/10 text-slate-300'
                    }`}
                  >
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635]" />}
                    <span>{idx + 1}.</span>
                    <span>{isRest ? '🛌 REST DAY' : routine?.name || 'Workout'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Routines List */}
      <div className="flex justify-between items-center mt-1">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
          My Routines ({routines.length})
        </h2>
        <button
          type="button"
          onClick={() =>
            setEditingRoutine({
              id: `routine_${Date.now()}`,
              name: 'New Custom Routine',
              emoji: '⚡',
              exercises: []
            })
          }
          className="px-3 py-1.5 rounded-xl bg-[#a3e635]/15 border border-[#a3e635]/30 text-xs font-bold text-[#a3e635] flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>Create Routine</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {routines.map((routine) => (
          <div key={routine.id} className="glass-panel p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{routine.emoji || '🔥'}</span>
                <div>
                  <h3 className="text-base font-extrabold text-white">{routine.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {routine.exercises?.length || 0} exercises · Est. {Math.round((routine.exercises?.length || 4) * 11)} mins
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditingRoutine(routine)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300"
                  title="Edit Routine"
                >
                  <Edit2 size={15} />
                </button>
                {routines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete routine "${routine.name}"?`)) {
                        deleteRoutine(routine.id);
                      }
                    }}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-rose-400"
                    title="Delete Routine"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Exercise preview pills */}
            <div className="flex flex-wrap gap-1.5">
              {(routine.exercises || []).slice(0, 4).map((ex, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-black/40 border border-white/5 text-[10px] text-slate-300 font-medium truncate max-w-[140px]"
                >
                  {ex.name}
                </span>
              ))}
              {(routine.exercises?.length || 0) > 4 && (
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-500 font-medium">
                  +{routine.exercises.length - 4} more
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleLaunchRoutine(routine.id)}
              className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Play size={14} fill="black" />
              <span>Start Routine</span>
            </button>
          </div>
        ))}
      </div>

      {/* Routine Edit Modal */}
      {editingRoutine && (
        <RoutineEditModal
          routine={editingRoutine}
          onSave={(updated) => {
            saveRoutine(updated);
            setEditingRoutine(null);
          }}
          onClose={() => setEditingRoutine(null)}
        />
      )}

      {/* Starter Template Library Modal */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f121b] border border-white/10 rounded-3xl w-full max-w-md p-5 flex flex-col gap-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-[#a3e635]" />
                <span>Starter Split Templates</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTemplateLibrary(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Battle-tested hypertrophy and strength programs. Tap to add to your plan:
            </p>

            <div className="flex flex-col gap-2.5">
              {STARTER_ROUTINES.map(tpl => (
                <div
                  key={tpl.id}
                  className="bg-black/40 border border-white/10 rounded-2xl p-3.5 flex justify-between items-center"
                >
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{tpl.emoji}</span>
                      <span>{tpl.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {tpl.exercises?.length} exercises · PPL Hypertrophy Split
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-3 py-1.5 rounded-xl bg-[#a3e635] text-black font-bold text-xs active:scale-95 transition-all"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
