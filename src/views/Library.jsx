import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Camera,
  Plus,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import exercisesCatalog from '../data/exercises.json';
import BodyMap from '../components/BodyMap.jsx';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { showLibraryBanner, hideBanner } from '../lib/admob.js';
import { useGymStore } from '../store/useGymStore.js';

const MUSCLE_FILTERS = [
  { id: 'all', label: 'All Muscles' },
  { id: 'chest', label: 'Chest' },
  { id: 'lats', label: 'Lats & Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'quadriceps', label: 'Quadriceps' },
  { id: 'hamstrings', label: 'Hamstrings' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'calves', label: 'Calves' },
  { id: 'abs', label: 'Abs / Core' }
];

export default function Library() {
  const { adsRemoved } = useGymStore();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [showBodyMap, setShowBodyMap] = useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);
  const [customExercises, setCustomExercises] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Custom Exercise Form State
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState('chest');
  const [customEquipment, setCustomEquipment] = useState('dumbbell');
  const [customPhotoUri, setCustomPhotoUri] = useState(null);

  // AdMob Library Banner
  useEffect(() => {
    showLibraryBanner(adsRemoved);
    return () => {
      hideBanner();
    };
  }, [adsRemoved]);

  const handleCapturePhoto = async () => {
    if (!Capacitor.isNativePlatform()) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => setCustomPhotoUri(re.target.result);
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    try {
      const image = await CapCamera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      if (image?.webPath) {
        setCustomPhotoUri(image.webPath);
      }
    } catch (err) {
      console.warn('Camera capture cancelled or failed:', err);
    }
  };

  const handleSaveCustomExercise = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newEx = {
      id: `custom_${Date.now()}`,
      name: customName,
      bodyPart: customMuscle === 'chest' ? 'chest' : customMuscle === 'quadriceps' ? 'legs' : 'arms',
      targetMuscle: customMuscle,
      secondaryMuscles: [],
      equipment: customEquipment,
      category: 'hypertrophy',
      tier: 'isolation',
      photoUri: customPhotoUri,
      instructions: ['Custom user-defined exercise motion.'],
      substitutes: []
    };

    setCustomExercises([newEx, ...customExercises]);
    setCustomName('');
    setCustomPhotoUri(null);
    setShowCreateModal(false);
  };

  const allExercises = [...customExercises, ...exercisesCatalog];

  const filteredExercises = allExercises.filter(ex => {
    const matchesSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(search.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(search.toLowerCase());

    const matchesMuscle =
      selectedMuscle === 'all' ||
      ex.targetMuscle === selectedMuscle ||
      (selectedMuscle === 'lats' && (ex.targetMuscle === 'lats' || ex.targetMuscle === 'upper_back'));

    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-black text-white">EXERCISE LIBRARY</h1>
          <p className="page-subtitle">250+ Clean-room biomechanical exercises</p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5"
        >
          <Plus size={15} />
          <span>Custom</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 bg-[#12151f] border border-white/10 rounded-2xl px-3.5 py-2.5">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search by exercise name, muscle, or equipment..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-white outline-none"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="text-slate-400">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Anatomical Body Map Toggle Button */}
      <button
        type="button"
        onClick={() => setShowBodyMap(!showBodyMap)}
        className="w-full bg-black/40 border border-white/10 rounded-2xl p-2.5 px-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-all"
      >
        <span className="flex items-center gap-2">
          <Sparkles size={15} className="text-[#a3e635]" />
          <span>Interactive Anatomical Body Map</span>
        </span>
        <span className="text-[#a3e635] text-[11px] font-bold">
          {showBodyMap ? 'Hide Model' : 'View Silhouette'}
        </span>
      </button>

      {/* Interactive Vector Anatomical Body Map */}
      {showBodyMap && (
        <div className="glass-panel p-4 flex flex-col items-center animate-fadeIn">
          <BodyMap
            activeMuscles={selectedMuscle !== 'all' ? [selectedMuscle] : []}
            onSelectMuscle={(m) => setSelectedMuscle(m)}
          />
        </div>
      )}

      {/* Horizontal Muscle Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {MUSCLE_FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSelectedMuscle(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedMuscle === f.id
                ? 'bg-[#a3e635] text-black shadow-md'
                : 'bg-[#12151f] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Exercises Catalogue List */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
          Showing {filteredExercises.length} Exercises
        </div>

        {filteredExercises.map(ex => {
          const isExpanded = expandedExerciseId === ex.id;

          return (
            <div
              key={ex.id}
              className="glass-card p-3.5 flex flex-col gap-2 border border-white/5"
            >
              <div
                onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#a3e635]">
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{ex.name}</span>
                      {ex.photoUri && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-400">
                          Photo
                        </span>
                      )}
                    </h3>
                    <div className="text-[10px] text-slate-400 capitalize mt-0.5">
                      {ex.equipment} · <span className="text-[#a3e635] font-semibold">{ex.targetMuscle}</span>
                    </div>
                  </div>
                </div>

                <div className="text-slate-500">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Expanded Instructions and Substitutes */}
              {isExpanded && (
                <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex flex-col gap-2 mt-1 animate-fadeIn">
                  {ex.photoUri && (
                    <img
                      src={ex.photoUri}
                      alt={ex.name}
                      className="w-full h-36 object-cover rounded-lg border border-white/10 mb-1"
                    />
                  )}

                  <div className="text-[11px] text-slate-300">
                    <span className="font-bold text-white block mb-1">Biomechanics & Cueing:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                      {(ex.instructions || []).map((ins, i) => (
                        <li key={i}>{ins}</li>
                      ))}
                    </ul>
                  </div>

                  {ex.substitutes && ex.substitutes.length > 0 && (
                    <div className="pt-1 text-[11px] text-slate-400 border-t border-white/5">
                      <span className="font-bold text-slate-300">Biomechanical Substitutes: </span>
                      <span className="capitalize">{ex.substitutes.join(', ').replace(/_/g, ' ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Exercise Creator Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCustomExercise}
            className="bg-[#0f121b] border border-white/10 rounded-3xl w-full max-w-sm p-5 flex flex-col gap-3 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Create Custom Exercise</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                Exercise Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Incline Cable Press"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Target Muscle
                </label>
                <select
                  value={customMuscle}
                  onChange={e => setCustomMuscle(e.target.value)}
                  className="w-full bg-[#161a26] border border-white/10 rounded-xl px-2 py-2 text-xs text-white outline-none capitalize"
                >
                  {MUSCLE_FILTERS.filter(f => f.id !== 'all').map(f => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Equipment
                </label>
                <select
                  value={customEquipment}
                  onChange={e => setCustomEquipment(e.target.value)}
                  className="w-full bg-[#161a26] border border-white/10 rounded-xl px-2 py-2 text-xs text-white outline-none capitalize"
                >
                  <option value="barbell">Barbell</option>
                  <option value="dumbbell">Dumbbell</option>
                  <option value="machine">Machine</option>
                  <option value="cable">Cable</option>
                  <option value="bodyweight">Bodyweight</option>
                  <option value="smith_machine">Smith Machine</option>
                </select>
              </div>
            </div>

            {/* Camera Photo Attachment */}
            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                Equipment Photo (Optional)
              </label>
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 hover:bg-white/10"
              >
                <Camera size={16} className="text-[#a3e635]" />
                <span>{customPhotoUri ? 'Retake Photo' : 'Capture Equipment Photo'}</span>
              </button>
              {customPhotoUri && (
                <img
                  src={customPhotoUri}
                  alt="Preview"
                  className="w-full h-24 object-cover rounded-xl mt-2 border border-white/10"
                />
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
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
