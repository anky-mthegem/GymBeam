import React, { useState } from 'react';
import { X, Disc } from 'lucide-react';
import BarbellSleeve from './BarbellSleeve.jsx';
import { calculatePlates } from '../lib/plates.js';
import { useGymStore } from '../store/useGymStore.js';

export default function PlateCalculatorModal({
  initialWeight = 60,
  onClose
}) {
  const { unit, plateInventory } = useGymStore();
  const [weight, setWeight] = useState(initialWeight);
  const [barWeight, setBarWeight] = useState(plateInventory?.barbellWeight || 20);

  const breakdown = calculatePlates(
    weight,
    barWeight,
    plateInventory?.availablePlates || [25, 20, 15, 10, 5, 2.5, 1.25]
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0f121b] border border-white/10 rounded-3xl w-full max-w-md p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Disc className="text-[#a3e635]" size={22} />
            <span>Plate Calculator</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Target Weight Controls */}
        <div className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-white/5">
          <span className="text-sm text-slate-400 font-medium">Target Load</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWeight(Math.max(barWeight, weight - 2.5))}
              className="w-8 h-8 rounded-xl bg-white/10 text-white font-bold text-base flex items-center justify-center"
            >
              -
            </button>
            <input
              type="number"
              step="2.5"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-20 text-center bg-transparent text-xl font-extrabold font-mono text-[#a3e635] outline-none"
            />
            <span className="text-xs text-slate-400 font-semibold">{unit}</span>
            <button
              type="button"
              onClick={() => setWeight(weight + 2.5)}
              className="w-8 h-8 rounded-xl bg-white/10 text-white font-bold text-base flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Barbell Weight Selection */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Barbell Type:</span>
          <div className="flex gap-1.5">
            {[20, 15, 10].map(bw => (
              <button
                key={bw}
                type="button"
                onClick={() => setBarWeight(bw)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  barWeight === bw
                    ? 'bg-[#a3e635] text-black shadow-sm'
                    : 'bg-white/5 text-slate-300'
                }`}
              >
                {bw} {unit}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Sleeve Component */}
        <BarbellSleeve
          plateBreakdown={breakdown}
          unit={unit}
          targetWeight={weight}
          barWeight={barWeight}
        />

        <button
          type="button"
          onClick={onClose}
          className="btn-primary w-full py-3 text-sm mt-1"
        >
          Done
        </button>
      </div>
    </div>
  );
}
