/**
 * "Equipment Busy" 1-Tap Exercise Swapper & Modality Transfer Ratios
 * When a rack or machine is busy, finds biomechanically equivalent alternatives
 * and calculates appropriate starting weight based on strength transfer ratios.
 */

export const MODALITY_RATIOS = {
  // Transfer ratios relative to barbell standard (1.0)
  barbell: 1.0,
  dumbbell_per_hand: 0.40, // 100kg BB = ~40kg each DB
  machine: 1.10,          // Guided machine path provides stability bonus
  cable: 0.85,            // Cable friction and instability
  bodyweight: 0.70,
  smith_machine: 1.08
};

/**
 * Calculates converted working weight when swapping modalities.
 */
export function calculateEquivalentWeight(fromEquipment, toEquipment, weight, roundStep = 2.5) {
  const w = Number(weight) || 0;
  if (w <= 0) return 0;
  if (fromEquipment === toEquipment) return w;

  const getRatio = (eq) => {
    if (eq === 'dumbbell') return MODALITY_RATIOS.dumbbell_per_hand;
    if (eq === 'machine') return MODALITY_RATIOS.machine;
    if (eq === 'cable') return MODALITY_RATIOS.cable;
    if (eq === 'smith_machine') return MODALITY_RATIOS.smith_machine;
    return MODALITY_RATIOS.barbell;
  };

  const fromRatio = getRatio(fromEquipment);
  const toRatio = getRatio(toEquipment);

  // Convert to baseline barbell equivalent, then to target
  const barbellNorm = w / fromRatio;
  const targetWeight = barbellNorm * toRatio;

  const step = toEquipment === 'dumbbell' ? 2.0 : roundStep;
  return Math.round(targetWeight / step) * step;
}

/**
 * Finds top substitutes from the catalog matching identical primary target muscle
 * and compatible category.
 */
export function findSubstitutes(exercise, catalog = []) {
  if (!exercise || !catalog.length) return [];

  const explicitIds = exercise.substitutes || [];

  // Match explicit substitutes first
  const explicitMatches = catalog.filter(c => explicitIds.includes(c.id) && c.id !== exercise.id);

  // Match biomechanical peers (same targetMuscle and category)
  const peerMatches = catalog.filter(c =>
    c.id !== exercise.id &&
    !explicitIds.includes(c.id) &&
    c.targetMuscle === exercise.targetMuscle &&
    (c.equipment !== exercise.equipment || c.category === exercise.category)
  );

  return [...explicitMatches, ...peerMatches].slice(0, 6);
}
