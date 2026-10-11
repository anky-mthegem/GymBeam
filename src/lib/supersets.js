/**
 * Supersets & Giant Sets Engine
 * Logic for paired antagonistic training (A1/A2, B1/B2/B3) with alternating timers
 * and time-saved calculations.
 */

/**
 * Determines the next timer duration after completing a set.
 * If the exercise is part of a superset group (e.g. "A1"):
 * - If it's not the final exercise in the group, trigger short transition timer (e.g. 30s)
 * - If it is the final exercise in the group, trigger full rest timer (e.g. 90s)
 * 
 * @param {Object} currentExercise
 * @param {Array<Object>} allExercises
 * @param {number} defaultRestSec - Full rest duration (e.g. 90-120s)
 * @param {number} transitionSec - Short transition duration (e.g. 30-45s)
 */
export function getNextRestTimer({
  currentExercise,
  allExercises = [],
  defaultRestSec = 90,
  transitionSec = 30
}) {
  const group = currentExercise?.supersetGroup;
  if (!group) {
    return {
      durationSec: currentExercise?.restSec || defaultRestSec,
      timerType: 'standard_rest',
      message: 'Rest between sets',
      nextExerciseId: null
    };
  }

  // Parse group prefix (e.g. 'A' from 'A1' or 'A2')
  const groupLetter = group.charAt(0).toUpperCase();
  const siblings = allExercises.filter(e =>
    e.supersetGroup && e.supersetGroup.charAt(0).toUpperCase() === groupLetter
  );

  if (siblings.length <= 1) {
    return {
      durationSec: currentExercise?.restSec || defaultRestSec,
      timerType: 'standard_rest',
      message: 'Rest between sets',
      nextExerciseId: null
    };
  }

  // Sort siblings by group order ('A1', 'A2', 'A3')
  const sorted = [...siblings].sort((a, b) => (a.supersetGroup || '').localeCompare(b.supersetGroup || ''));
  const currentIndex = sorted.findIndex(e => e.id === currentExercise.id);
  const isLastInCycle = currentIndex === sorted.length - 1;

  if (isLastInCycle) {
    // Finished last exercise of the superset round -> Full rest before repeating
    const nextEx = sorted[0];
    return {
      durationSec: currentExercise?.restSec || defaultRestSec,
      timerType: 'superset_full_rest',
      message: `Full rest before Round 2 · Next: ${nextEx?.name || 'Round start'}`,
      nextExerciseId: nextEx?.id
    };
  } else {
    // Move quickly to partner exercise
    const nextEx = sorted[currentIndex + 1];
    return {
      durationSec: transitionSec,
      timerType: 'superset_transition',
      message: `Quick transition (${transitionSec}s) · Next: ${nextEx?.name || 'Partner exercise'}`,
      nextExerciseId: nextEx?.id
    };
  }
}

/**
 * Calculates estimated gym time saved by supersetting vs traditional straight sets.
 * In straight sets: Each exercise set rests full restSec.
 * In superset: alternating sets use transitionSec.
 * Time saved = sets * (restSec - transitionSec)
 */
export function calculateTimeSaved(exercises = [], defaultRestSec = 90, transitionSec = 30) {
  let savedSeconds = 0;

  // Group by superset letter
  const groups = {};
  for (const ex of exercises) {
    if (ex.supersetGroup) {
      const letter = ex.supersetGroup.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(ex);
    }
  }

  for (const letter in groups) {
    const groupExercises = groups[letter];
    if (groupExercises.length >= 2) {
      // Find number of paired rounds
      const minSets = Math.min(...groupExercises.map(e => (e.sets?.length || e.targetSets || 3)));
      // In each round, (length - 1) transitions replace full rests
      const transitionsPerRound = groupExercises.length - 1;
      const restDelta = Math.max(0, defaultRestSec - transitionSec);
      savedSeconds += minSets * transitionsPerRound * restDelta;
    }
  }

  const minutesSaved = Math.round(savedSeconds / 60);
  return {
    savedSeconds,
    minutesSaved,
    formatted: minutesSaved > 0 ? `Saved ~${minutesSaved} mins today with supersets` : null
  };
}
