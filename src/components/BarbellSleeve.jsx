import React from 'react';
import { PLATE_COLORS, LB_PLATE_COLORS } from '../lib/plates.js';

export default function BarbellSleeve({
  plateBreakdown,
  unit = 'kg',
  targetWeight = 0,
  barWeight = 20
}) {
  const isLb = unit === 'lb';
  const colorMap = isLb ? LB_PLATE_COLORS : PLATE_COLORS;

  const plates = plateBreakdown?.plates || [];
  const perSideLoad = plateBreakdown?.perSideLoad || 0;
  const remainder = plateBreakdown?.remainder || 0;

  // Flatten plate counts into an ordered sequence for rendering on the sleeve
  // (Heaviest plates placed closest to the inside collar)
  const plateStack = [];
  plates.forEach(({ plate, count }) => {
    for (let i = 0; i < count; i++) {
      plateStack.push(plate);
    }
  });

  return (
    <div className="bg-[#12151f] border border-white/10 rounded-2xl p-4 flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-3 text-xs">
        <span className="text-slate-400 font-medium">Barbell Load Visualizer</span>
        <span className="text-[#a3e635] font-bold">
          {perSideLoad} {unit} / side (+ {barWeight} {unit} bar)
        </span>
      </div>

      {/* SVG Barbell Sleeve Diagram */}
      <div className="w-full h-32 bg-black/40 rounded-xl flex items-center justify-center p-2 overflow-x-auto border border-white/5">
        <svg viewBox="0 0 460 120" className="h-full max-w-full">
          {/* Shaft (Left) */}
          <rect x="0" y="52" width="70" height="16" fill="#64748b" rx="2" />
          <line x1="10" y1="52" x2="60" y2="52" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />

          {/* Inner Collar (Stopper) */}
          <rect x="70" y="30" width="18" height="60" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" rx="3" />
          <rect x="88" y="50" width="10" height="20" fill="#334155" />

          {/* Sleeve Shaft */}
          <rect x="98" y="48" width="320" height="24" fill="#94a3b8" rx="2" />
          <line x1="98" y1="60" x2="418" y2="60" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Plates Stack (Loaded from Collar Outwards) */}
          {plateStack.map((plateWeight, idx) => {
            const config = colorMap[plateWeight] || { bg: '#475569', text: '#fff' };
            // Height proportional to plate diameter
            const plateHeight = Math.max(48, Math.min(108, 50 + (plateWeight / (isLb ? 45 : 25)) * 58));
            const plateWidth = Math.max(14, Math.min(24, 12 + (plateWeight / 5) * 2));
            const xOffset = 98 + idx * (plateWidth + 3);
            const yOffset = 60 - plateHeight / 2;

            return (
              <g key={idx}>
                {/* Plate Body */}
                <rect
                  x={xOffset}
                  y={yOffset}
                  width={plateWidth}
                  height={plateHeight}
                  fill={config.bg}
                  stroke="#111827"
                  strokeWidth="1.5"
                  rx="3"
                />
                {/* Weight Text */}
                <text
                  x={xOffset + plateWidth / 2}
                  y={64}
                  fill={config.text}
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform={`rotate(-90 ${xOffset + plateWidth / 2} 60)`}
                >
                  {plateWeight}
                </text>
              </g>
            );
          })}

          {/* Spring Collar Clip (after the last plate) */}
          {plateStack.length > 0 && (
            <g transform={`translate(${98 + plateStack.length * 19 + 6}, 42)`}>
              <rect x="0" y="8" width="8" height="20" fill="#e2e8f0" stroke="#000" rx="2" />
              <circle cx="4" cy="4" r="5" fill="none" stroke="#e2e8f0" strokeWidth="2" />
            </g>
          )}

          {/* Sleeve End Cap */}
          <rect x="418" y="46" width="10" height="28" fill="#475569" rx="3" />
        </svg>
      </div>

      {/* Plate Counts Chips */}
      <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
        {plates.length === 0 ? (
          <span className="text-xs text-slate-500">Empty Bar ({barWeight} {unit})</span>
        ) : (
          plates.map(({ plate, count }, idx) => {
            const config = colorMap[plate] || { bg: '#475569', text: '#fff' };
            return (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-white/10"
                style={{ backgroundColor: `${config.bg}22`, color: config.bg === '#f8fafc' ? '#f8fafc' : config.bg }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: config.bg }}
                ></span>
                <span>{count}× {plate} {unit}</span>
              </div>
            );
          })
        )}
      </div>

      {remainder > 0 && (
        <p className="text-[11px] text-amber-400 mt-2 font-medium">
          ⚠️ Remainder {remainder} {unit} cannot be loaded with available plates.
        </p>
      )}
    </div>
  );
}
