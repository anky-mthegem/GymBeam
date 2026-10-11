/**
 * 1RM Estimations & Rep Percentage Matrix
 * Pure deterministic algorithms:
 * - Epley: 1RM = w * (1 + r / 30)
 * - Brzycki: 1RM = w * (36 / (37 - r))
 * - Lombardi: 1RM = w * (r ^ 0.10)
 * - Percentage Matrix: 95%, 85%, 75%, 65%, 50%
 */

export function calculateOneRm(weight, reps, formula = 'epley') {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;

  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;

  // Cap reps at 12 for accuracy
  const effectiveReps = Math.min(12, Math.max(1, r));

  let estimated = 0;
  switch (formula.toLowerCase()) {
    case 'brzycki':
      estimated = w * (36 / (37 - effectiveReps));
      break;
    case 'lombardi':
      estimated = w * Math.pow(effectiveReps, 0.10);
      break;
    case 'epley':
    default:
      estimated = w * (1 + effectiveReps / 30);
      break;
  }

  return Math.round(estimated * 10) / 10;
}

export function getAllOneRmFormulas(weight, reps) {
  return {
    epley: calculateOneRm(weight, reps, 'epley'),
    brzycki: calculateOneRm(weight, reps, 'brzycki'),
    lombardi: calculateOneRm(weight, reps, 'lombardi')
  };
}

/**
 * Generates training zones and percentage matrix from estimated 1RM.
 */
export function getTrainingPercentages(oneRm, roundingStep = 2.5) {
  const base = Number(oneRm) || 0;
  const round = (val) => Math.round(val / roundingStep) * roundingStep;

  return [
    {
      percentage: 95,
      weight: round(base * 0.95),
      zone: 'Heavy Single / Neuromuscular Overload',
      reps: '1 rep',
      purpose: 'Max Effort'
    },
    {
      percentage: 85,
      weight: round(base * 0.85),
      zone: '5RM Strength Zone',
      reps: '3–5 reps',
      purpose: 'Power & Force Production'
    },
    {
      percentage: 75,
      weight: round(base * 0.75),
      zone: 'Hypertrophy Working Zone',
      reps: '8–10 reps',
      purpose: 'Optimal Muscle Growth'
    },
    {
      percentage: 65,
      weight: round(base * 0.65),
      zone: 'Endurance & Muscle Pump',
      reps: '12–15 reps',
      purpose: 'Metabolic Stress / Sarcoplasmic Hypertrophy'
    },
    {
      percentage: 50,
      weight: round(base * 0.50),
      zone: 'Speed & Dynamic Warmup',
      reps: '15+ reps',
      purpose: 'Joint Prep & Explosive Bar Speed'
    }
  ];
}
