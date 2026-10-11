import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Layers } from 'lucide-react';
import exercisesCatalog from '../data/exercises.json';

export default function RoutineEditModal({ routine, onSave, onClose }) {
  const [name, setName] = useState(routine.name || 'Custom Routine');
  const [emoji, setEmoji] = useState(routine.emoji || '🔥');
  const [exercises, setExercises] = useState(routine.exercises || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  const handleAddExercise = (catalogEx) => {
    const newEx = {
      id: catalogEx.id,
      name: catalogEx.name,
      bodyPart: catalogEx.bodyPart,
      targetMuscle: catalogEx.targetMuscle,
      equipment: catalogEx.equipment,
      targetSets: 3,
      reps: 8,
      weight: 50,
      inc: 2.5,
      restSec: 90,
      policy: 'linear',
      supersetGroup: null
    };
    setExercises([...exercises, newEx]);
    setShowAddModal(false);
  };

  const handleRemoveExercise = (idx) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleMove = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= exercises.length) return;
    const copy = [...exercises];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setExercises(copy);
  };

  const updateExField = (idx, field, val) => {
    const copy = [...exercises];
    copy[idx] = { ...copy[idx], [field]: val };
    setExercises(copy);
  };

  const toggleSupersetGroup = (idx) => {
    const current = exercises[idx].supersetGroup;
    const next = current === null ? 'A1' : current === 'A1' ? 'A2' : current === 'A2' ? 'B1' : current === 'B1' ? 'B2' : null;
    updateExField(idx, 'supersetGroup', next);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      ...routine,
      name,
      emoji,
      exercises
    });
  };

  const filteredCatalog = exercisesCatalog
    .filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.targetMuscle.includes(search.toLowerCase()))
    .slice(0, 30);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
      <div className="bg-[#0f121b] border border-white/10 rounded-3xl w-full max-w-lg p-5 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-extrabold text-white">Edit Routine</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title and Emoji */}
        <div className="flex gap-2">
          <input
            type="text"
            value={emoji}
            onChange={e => setEmoji(e.target.value)}
            className="w-14 text-center bg-black/40 border border-white/10 rounded-xl text-xl outline-none"
            title="Emoji"
          />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Routine Name"
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none"
          />
        </div>

        {/* Exercises List in Routine */}
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs font-bold text-slate-400 uppercase">
            Exercises ({exercises.length})
          </span>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold text-[#a3e635] flex items-center gap-1 hover:underline"
          >
            <Plus size={14} /> Add Exercise
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {exercises.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
              No exercises added yet. Tap "+ Add Exercise" to build your routine.
            </div>
          ) : (
            exercises.map((ex, idx) => (
              <div
                key={ex.id + idx}
                className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-500">{idx + 1}.</span>
                    <span className="text-sm font-bold text-white">{ex.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleSupersetGroup(idx)}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all ${
                        ex.supersetGroup
                          ? 'bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/40'
                          : 'bg-white/5 text-slate-500 border-white/10'
                      }`}
                      title="Tap to toggle Superset Group (A1, A2, B1, B2)"
                    >
                      {ex.supersetGroup ? `Superset ${ex.supersetGroup}` : '+ Link Superset'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      className="p-1 rounded bg-white/5 text-slate-400 disabled:opacity-20"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === exercises.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      className="p-1 rounded bg-white/5 text-slate-400 disabled:opacity-20"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="p-1 rounded bg-white/5 text-rose-400 hover:bg-rose-500/20 ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Exercise Configurations */}
                <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-400">
                  <div>
                    <label className="block text-[10px] text-slate-500">Sets</label>
                    <input
                      type="number"
                      value={ex.targetSets || 3}
                      onChange={e => updateExField(idx, 'targetSets', Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-center text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Target Reps</label>
                    <input
                      type="number"
                      value={ex.reps || 8}
                      onChange={e => updateExField(idx, 'reps', Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-center text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Weight</label>
                    <input
                      type="number"
                      step="2.5"
                      value={ex.weight || 50}
                      onChange={e => updateExField(idx, 'weight', Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-center text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Rest (s)</label>
                    <input
                      type="number"
                      step="15"
                      value={ex.restSec || 90}
                      onChange={e => updateExField(idx, 'restSec', Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-center text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1 py-3 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary flex-1 py-3 text-xs font-bold"
          >
            Save Routine
          </button>
        </div>
      </div>

      {/* Exercise Catalog Picker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f121b] border border-white/10 rounded-3xl w-full max-w-md p-5 flex flex-col gap-3 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Select Exercise</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search exercise..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />

            <div className="flex flex-col gap-2 overflow-y-auto">
              {filteredCatalog.map(ex => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleAddExercise(ex)}
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
    </div>
  );
}
