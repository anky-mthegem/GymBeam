/**
 * Automatic Progression Engine
 * Pure deterministic algorithms for:
 * - Linear Progression (Upper body +2.5kg, Lower body +5kg, 3 consecutive session failure deload)
 * - Greyskull LP (Straight sets + AMRAP, double increment on 2x reps, single failure 10% deload)
 * - Double Progression (Rep range window, e.g. 8-12 reps)
 * - Smart RPE/RIR Auto-Nudge (RPE <= 6 -> propose +2.5kg for next set)
 * - Smart Deload Detector (Detects 3-week plateaus -> 70% intensity deload week)
 */

export function roundWeight(val, step = 2.5) {
  if (!step || step <= 0) return Math.round(val * 10) / 10;
  return Math.round(val / step) * step;
}

/**
 * Calculates next session targets for Linear Progression.
 * @param {Object} params
 * @param {number} params.currentWeight
 * @param {number} params.targetReps
 * @param {number} params.targetSets
 * @param {Array<{reps: number, completed: boolean}>} params.recentCompletedSets
 * @param {number} params.consecutiveFailures - Count of past consecutive sessions where target reps were missed
 * @param {boolean} params.isLowerBody - Lower body uses larger increment (+5kg vs +2.5kg)
 * @param {number} params.customIncrement
 */
export function calculateLinearProgression({
  currentWeight,
  targetReps,
  targetSets,
  recentCompletedSets = [],
  consecutiveFailures = 0,
  isLowerBody = false,
  customIncrement = null
}) {
  const inc = customIncrement !== null ? customIncrement : (isLowerBody ? 5.0 : 2.5);
  const setsCount = recentCompletedSets.length;
  const allHit = setsCount >= targetSets && recentCompletedSets.every(s => s.reps >= targetReps);

  if (allHit) {
    return {
      nextWeight: roundWeight(currentWeight + inc, inc >= 2.5 ? 2.5 : 0.5),
      nextReps: targetReps,
      status: 'progressed',
      consecutiveFailures: 0,
      message: `Target achieved! Increased weight by +${inc}kg.`
    };
  }

  const newFailCount = consecutiveFailures + 1;
  if (newFailCount >= 3) {
    // 3 consecutive failures -> 10% deload
    const deloadWeight = roundWeight(currentWeight * 0.90, 2.5);
    return {
      nextWeight: Math.max(20, deloadWeight),
      nextReps: targetReps,
      status: 'deload',
      consecutiveFailures: 0,
      message: `Missed targets for 3 sessions. Automatic 10% deload to ${deloadWeight}kg to break plateau.`
    };
  }

  return {
    nextWeight: currentWeight,
    nextReps: targetReps,
    status: 'maintain',
    consecutiveFailures: newFailCount,
    message: `Missed target reps (${newFailCount}/3). Maintain ${currentWeight}kg for next session.`
  };
}

/**
 * Calculates next session targets for Greyskull LP.
 * Expects 2 straight sets + 1 final AMRAP set.
 */
export function calculateGreyskullProgression({
  currentWeight,
  targetReps = 5,
  completedSets = [],
  isLowerBody = false
}) {
  const baseInc = isLowerBody ? 5.0 : 2.5;
  if (completedSets.length < 3) {
    return {
      nextWeight: currentWeight,
      nextReps: targetReps,
      status: 'maintain',
      message: 'Incomplete session logged.'
    };
  }

  const straightSets = completedSets.slice(0, 2);
  const amrapSet = completedSets[2];
  const straightPassed = straightSets.every(s => s.reps >= targetReps);

  if (!straightPassed || amrapSet.reps < targetReps) {
    // Immediate 10% deload on failure
    const deloadWeight = roundWeight(currentWeight * 0.90, 2.5);
    return {
      nextWeight: Math.max(20, deloadWeight),
      nextReps: targetReps,
      status: 'deload',
      message: `Failed target reps. Greyskull 10% reset to ${deloadWeight}kg to rebuild momentum.`
    };
  }

  // Check if AMRAP doubled target reps (e.g. 10+ reps on 5 rep target)
  if (amrapSet.reps >= targetReps * 2) {
    const doubleInc = baseInc * 2;
    return {
      nextWeight: roundWeight(currentWeight + doubleInc, 2.5),
      nextReps: targetReps,
      status: 'double_progressed',
      message: `Crushed AMRAP with ${amrapSet.reps} reps! Double weight increment (+${doubleInc}kg).`
    };
  }

  return {
    nextWeight: roundWeight(currentWeight + baseInc, 2.5),
    nextReps: targetReps,
    status: 'progressed',
    message: `Target met! Weight increased by +${baseInc}kg.`
  };
}

/**
 * Calculates next session for Double Progression within rep range (e.g. 8-12 reps).
 */
export function calculateDoubleProgression({
  currentWeight,
  minReps = 8,
  maxReps = 12,
  completedSets = [],
  increment = 2.5
}) {
  if (!completedSets.length) {
    return { nextWeight: currentWeight, targetReps: minReps, status: 'maintain' };
  }

  const allHitMax = completedSets.every(s => s.reps >= maxReps);
  if (allHitMax) {
    return {
      nextWeight: roundWeight(currentWeight + increment, 2.5),
      targetReps: minReps,
      status: 'weight_progressed',
      message: `All sets hit top of rep range (${maxReps} reps)! Weight increased to ${currentWeight + increment}kg, reset to ${minReps} reps.`
    };
  }

  const averageReps = completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length;
  return {
    nextWeight: currentWeight,
    targetReps: Math.min(maxReps, Math.ceil(averageReps) + 1),
    status: 'rep_progression',
    message: `Keep weight at ${currentWeight}kg. Aim for +1 rep across sets next time.`
  };
}

/**
 * Smart RPE / RIR Auto-Nudge for in-workout adjustments.
 */
export function checkRpeNudge(rpe, rir = null) {
  const effectiveRpe = rpe !== null && rpe !== undefined ? Number(rpe) : (rir !== null ? 10 - Number(rir) : null);
  if (effectiveRpe !== null && effectiveRpe <= 6) {
    return {
      nudge: true,
      message: `Felt easy (RPE ${effectiveRpe})! Add +2.5 kg for your next set?`,
      suggestedAdd: 2.5
    };
  }
  return { nudge: false, suggestedAdd: 0 };
}

/**
 * Smart Deload Detector
 * Evaluates past session history for plateaus.
 */
export function detectPlateauDeload(sessionHistory = [], exerciseId, windowSessions = 3) {
  if (sessionHistory.length < windowSessions) return { suggestDeload: false };

  const exerciseLogs = sessionHistory
    .map(w => w.exercises?.find(e => e.id === exerciseId))
    .filter(Boolean)
    .slice(-windowSessions);

  if (exerciseLogs.length < windowSessions) return { suggestDeload: false };

  // If max weight lifted did not increase or declined over window
  const weights = exerciseLogs.map(e => Math.max(...(e.sets?.map(s => s.weight) || [0])));
  const isStagnant = weights.every((w, _, arr) => w <= arr[0]);

  if (isStagnant) {
    return {
      suggestDeload: true,
      deloadIntensity: 0.70,
      reason: `No strength progress across last ${windowSessions} sessions. Suggested 1-week deload at 70% volume/intensity.`
    };
  }

  return { suggestDeload: false };
}
