/**
 * Automatic Warm-Up Set Calculator
 * Clean-room implementation based on progressive neuromuscular potentiation.
 */

export function roundToNearest(val, step = 2.5) {
  if (step <= 0) return val;
  return Math.round(val / step) * step;
}

/**
 * Generates progressive warmup sets based on target working weight.
 * Set 1: Empty Bar (20kg) x 10 reps (Joint lubrication & movement patterning)
 * Set 2: 50% target x 5 reps
 * Set 3: 70% target x 3 reps
 * Set 4: 85% target x 1 rep
 * Warmup sets are tagged with type: 'W'.
 */
export function calculateWarmupSets(targetWeight, targetReps = 8, barWeight = 20, plateStep = 2.5) {
  const target = Number(targetWeight) || 0;
  const bar = Number(barWeight) || 20;

  if (target <= bar) {
    return [
      {
        setNumber: 1,
        weight: bar,
        reps: 10,
        type: 'W',
        percentage: 100,
        label: 'Movement Prep'
      }
    ];
  }

  const rawSteps = [
    { pct: 0, reps: 10, label: 'Bar Warmup / Lubrication', forcedWeight: bar },
    { pct: 0.50, reps: 5, label: '50% Acclimation' },
    { pct: 0.70, reps: 3, label: '70% Neuromuscular Priming' },
    { pct: 0.85, reps: 1, label: '85% Heavy Acclimation Single' }
  ];

  const warmups = [];
  let setIdx = 1;

  for (const step of rawSteps) {
    let calcWeight = step.forcedWeight !== undefined
      ? step.forcedWeight
      : roundToNearest(target * step.pct, plateStep);

    // Clamp between bar and target weight
    calcWeight = Math.max(bar, Math.min(calcWeight, target));

    // Avoid duplicate weights in consecutive warmup sets
    const prevWeight = warmups.length > 0 ? warmups[warmups.length - 1].weight : null;
    if (prevWeight !== null && Math.abs(calcWeight - prevWeight) < 0.1 && calcWeight < target) {
      continue;
    }

    warmups.push({
      setNumber: setIdx++,
      weight: calcWeight,
      reps: step.reps,
      type: 'W',
      percentage: Math.round((calcWeight / target) * 100),
      label: step.label
    });
  }

  return warmups;
}
