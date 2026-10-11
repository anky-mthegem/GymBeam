import React, { useState } from 'react';

/**
 * Interactive Vector Anatomical Body Map (Front & Back)
 * 100% Clean-Room original procedural SVG paths.
 * Highlights targeted muscles or recovery status.
 */
export default function BodyMap({
  activeMuscles = [],
  highlightColor = '#a3e635',
  muscleStatus = {},
  onSelectMuscle,
  className = ''
}) {
  const [view, setView] = useState('front'); // 'front' | 'back'

  const getMuscleFill = (muscleId) => {
    if (muscleStatus && muscleStatus[muscleId]) {
      return muscleStatus[muscleId].statusColor || muscleStatus[muscleId].color || highlightColor;
    }
    if (activeMuscles.includes(muscleId)) {
      return highlightColor;
    }
    return '#272b38'; // Neutral dark slate
  };

  const getMuscleOpacity = (muscleId) => {
    if (activeMuscles.includes(muscleId) || (muscleStatus && muscleStatus[muscleId])) {
      return 0.95;
    }
    return 0.45;
  };

  const handleClick = (muscleId) => {
    if (onSelectMuscle) onSelectMuscle(muscleId);
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Front / Back Toggle Buttons */}
      <div className="flex bg-[#12151f] p-1 rounded-xl border border-white/10 mb-3 gap-1">
        <button
          type="button"
          onClick={() => setView('front')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            view === 'front'
              ? 'bg-[#a3e635] text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Anterior (Front)
        </button>
        <button
          type="button"
          onClick={() => setView('back')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            view === 'back'
              ? 'bg-[#a3e635] text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Posterior (Back)
        </button>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-48 h-80 sm:w-56 sm:h-96 flex items-center justify-center">
        {view === 'front' ? (
          <svg
            viewBox="0 0 200 360"
            className="w-full h-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
          >
            {/* Base Silhouette Frame / Head */}
            <circle cx="100" cy="30" r="18" fill="#1e2230" stroke="#33384a" strokeWidth="1.5" />
            <path d="M94 48 L106 48 L104 60 L96 60 Z" fill="#1e2230" />

            {/* Deltoids / Shoulders Front */}
            <path
              id="shoulders-left"
              d="M65 65 C55 70 48 85 52 98 C56 94 65 82 72 75 Z"
              fill={getMuscleFill('shoulders')}
              fillOpacity={getMuscleOpacity('shoulders')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('shoulders')}
            />
            <path
              id="shoulders-right"
              d="M135 65 C145 70 152 85 148 98 C144 94 135 82 128 75 Z"
              fill={getMuscleFill('shoulders')}
              fillOpacity={getMuscleOpacity('shoulders')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('shoulders')}
            />

            {/* Chest / Pectorals */}
            <path
              id="chest-left"
              d="M72 75 C82 72 98 72 99 90 C99 105 85 110 70 102 C66 90 68 80 72 75 Z"
              fill={getMuscleFill('chest')}
              fillOpacity={getMuscleOpacity('chest')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('chest')}
            />
            <path
              id="chest-right"
              d="M128 75 C118 72 102 72 101 90 C101 105 115 110 130 102 C134 90 132 80 128 75 Z"
              fill={getMuscleFill('chest')}
              fillOpacity={getMuscleOpacity('chest')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('chest')}
            />

            {/* Biceps Front */}
            <path
              id="biceps-left"
              d="M50 100 C44 112 45 130 52 138 C56 135 60 120 58 105 Z"
              fill={getMuscleFill('biceps')}
              fillOpacity={getMuscleOpacity('biceps')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('biceps')}
            />
            <path
              id="biceps-right"
              d="M150 100 C156 112 155 130 148 138 C144 135 140 120 142 105 Z"
              fill={getMuscleFill('biceps')}
              fillOpacity={getMuscleOpacity('biceps')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('biceps')}
            />

            {/* Forearms Front */}
            <path
              d="M52 142 C46 155 48 178 54 190 C58 186 64 165 60 145 Z"
              fill="#272b38"
              fillOpacity="0.45"
              stroke="#3b4256"
              strokeWidth="1"
            />
            <path
              d="M148 142 C154 155 152 178 146 190 C142 186 136 165 140 145 Z"
              fill="#272b38"
              fillOpacity="0.45"
              stroke="#3b4256"
              strokeWidth="1"
            />

            {/* Abs & Core */}
            <path
              id="abs"
              d="M84 108 L116 108 L114 160 L86 160 Z"
              fill={getMuscleFill('abs')}
              fillOpacity={getMuscleOpacity('abs')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('abs')}
            />

            {/* Quadriceps (Front Thighs) */}
            <path
              id="quads-left"
              d="M72 170 C65 190 62 230 70 255 C82 255 94 235 95 180 C88 172 78 168 72 170 Z"
              fill={getMuscleFill('quadriceps')}
              fillOpacity={getMuscleOpacity('quadriceps')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('quadriceps')}
            />
            <path
              id="quads-right"
              d="M128 170 C135 190 138 230 130 255 C118 255 106 235 105 180 C112 172 122 168 128 170 Z"
              fill={getMuscleFill('quadriceps')}
              fillOpacity={getMuscleOpacity('quadriceps')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('quadriceps')}
            />

            {/* Calves Front */}
            <path
              id="calves-front-left"
              d="M70 265 C64 285 68 318 74 335 C80 332 86 305 84 270 Z"
              fill={getMuscleFill('calves')}
              fillOpacity={getMuscleOpacity('calves')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('calves')}
            />
            <path
              id="calves-front-right"
              d="M130 265 C136 285 132 318 126 335 C120 332 114 305 116 270 Z"
              fill={getMuscleFill('calves')}
              fillOpacity={getMuscleOpacity('calves')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('calves')}
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 200 360"
            className="w-full h-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
          >
            {/* Base Head Back */}
            <circle cx="100" cy="30" r="18" fill="#1e2230" stroke="#33384a" strokeWidth="1.5" />
            <path d="M94 48 L106 48 L104 60 L96 60 Z" fill="#1e2230" />

            {/* Upper Back / Traps */}
            <path
              id="upper-back-traps"
              d="M80 60 L120 60 L130 85 L100 115 L70 85 Z"
              fill={getMuscleFill('upper_back')}
              fillOpacity={getMuscleOpacity('upper_back')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('upper_back')}
            />

            {/* Lats (Left & Right Wings) */}
            <path
              id="lats-left"
              d="M68 85 C62 105 66 130 76 145 C86 142 90 125 88 105 Z"
              fill={getMuscleFill('lats')}
              fillOpacity={getMuscleOpacity('lats')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('lats')}
            />
            <path
              id="lats-right"
              d="M132 85 C138 105 134 130 124 145 C114 142 110 125 112 105 Z"
              fill={getMuscleFill('lats')}
              fillOpacity={getMuscleOpacity('lats')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('lats')}
            />

            {/* Triceps (Back Arms) */}
            <path
              id="triceps-left"
              d="M50 95 C44 110 46 130 52 138 C56 135 62 120 60 102 Z"
              fill={getMuscleFill('triceps')}
              fillOpacity={getMuscleOpacity('triceps')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('triceps')}
            />
            <path
              id="triceps-right"
              d="M150 95 C156 110 154 130 148 138 C144 135 138 120 140 102 Z"
              fill={getMuscleFill('triceps')}
              fillOpacity={getMuscleOpacity('triceps')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('triceps')}
            />

            {/* Lower Back */}
            <path
              id="lower-back"
              d="M84 142 L116 142 L114 165 L86 165 Z"
              fill={getMuscleFill('lower_back')}
              fillOpacity={getMuscleOpacity('lower_back')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('lower_back')}
            />

            {/* Glutes */}
            <path
              id="glutes"
              d="M72 168 C68 185 80 205 98 205 C100 205 102 205 102 205 C120 205 132 185 128 168 Z"
              fill={getMuscleFill('glutes')}
              fillOpacity={getMuscleOpacity('glutes')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('glutes')}
            />

            {/* Hamstrings */}
            <path
              id="hamstrings-left"
              d="M72 208 C66 225 65 245 74 260 C84 258 92 238 96 210 Z"
              fill={getMuscleFill('hamstrings')}
              fillOpacity={getMuscleOpacity('hamstrings')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('hamstrings')}
            />
            <path
              id="hamstrings-right"
              d="M128 208 C134 225 135 245 126 260 C116 258 108 238 104 210 Z"
              fill={getMuscleFill('hamstrings')}
              fillOpacity={getMuscleOpacity('hamstrings')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('hamstrings')}
            />

            {/* Calves Back (Gastrocnemius & Soleus) */}
            <path
              id="calves-back-left"
              d="M70 268 C62 288 66 322 74 336 C82 332 88 308 86 272 Z"
              fill={getMuscleFill('calves')}
              fillOpacity={getMuscleOpacity('calves')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('calves')}
            />
            <path
              id="calves-back-right"
              d="M130 268 C138 288 134 322 126 336 C118 332 112 308 114 272 Z"
              fill={getMuscleFill('calves')}
              fillOpacity={getMuscleOpacity('calves')}
              stroke="#3b4256"
              strokeWidth="1"
              className="cursor-pointer transition-colors"
              onClick={() => handleClick('calves')}
            />
          </svg>
        )}
      </div>

      {/* Legend & Help hint */}
      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
        <span className="w-2.5 h-2.5 rounded-full bg-[#a3e635] inline-block shadow-sm"></span>
        <span>Active / Targeted</span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#272b38] border border-white/20 inline-block ml-2"></span>
        <span>Resting</span>
      </div>
    </div>
  );
}
