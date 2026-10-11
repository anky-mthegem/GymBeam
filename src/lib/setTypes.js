/**
 * Set Type Tagging & Drop Set Auto-Cloner
 * Normal ('N'), Warmup ('W'), Drop Set ('D'), Rest-Pause ('RP'), AMRAP/Failure ('+')
 */

export const SET_TYPES = {
  N: { label: 'Normal', badge: 'N', color: '#64748b', isWorking: true },
  W: { label: 'Warmup', badge: 'W', color: '#eab308', isWorking: false },
  D: { label: 'Drop Set', badge: 'D', color: '#ec4899', isWorking: true },
  RP: { label: 'Rest-Pause', badge: 'RP', color: '#8b5cf6', isWorking: true },
  '+': { label: 'AMRAP / Failure', badge: '+', color: '#ef4444', isWorking: true }
};

/**
 * Generates an automatic drop set with 20% or 25% weight reduction.
 */
export function generateDropSet(parentSet, dropPercent = 20, step = 2.5) {
  const currentWeight = Number(parentSet?.weight) || 0;
  const reduction = currentWeight * (dropPercent / 100);
  const rawTarget = Math.max(0, currentWeight - reduction);
  const droppedWeight = Math.round(rawTarget / step) * step;

  return {
    id: `set_${Date.now()}_drop`,
    weight: Math.max(step, droppedWeight),
    reps: parentSet?.reps || 8,
    type: 'D',
    parentSetId: parentSet?.id || null,
    completed: false,
    rpe: null
  };
}

/**
 * Calculates total working volume for an exercise or workout,
 * strictly excluding warmups ('W').
 */
export function calculateWorkingVolume(sets = []) {
  return sets
    .filter(s => s.completed && s.type !== 'W')
    .reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
}

/**
 * Counts direct working sets, excluding warmups.
 */
export function countWorkingSets(sets = []) {
  return sets.filter(s => s.completed && s.type !== 'W').length;
}
