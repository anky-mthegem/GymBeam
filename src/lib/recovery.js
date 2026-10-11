/**
 * Hypertrophy Volume Landmarks & Muscle Recovery Engine
 * Pure mathematical modeling:
 * - Weekly direct sets: MV (<6), MEV (6-9), MAV (10-16), MRV (>20)
 * - Exponential decay model: Fatigue(t) = Sets * e^(-lambda * t)
 */

export const MUSCLE_GROUPS = [
  'chest',
  'lats',
  'upper_back',
  'lower_back',
  'shoulders',
  'biceps',
  'triceps',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'abs'
];

export const VOLUME_LANDMARKS = {
  MV: 6,    // Maintenance Volume
  MEV: 10,  // Minimum Effective Volume
  MAV: 16,  // Maximum Adaptive Volume (Sweet spot: 10-16 sets)
  MRV: 20   // Maximum Recoverable Volume
};

/**
 * Calculates weekly volume sets per muscle group from workout history.
 * @param {Array<Object>} workoutHistory
 * @param {number} daysWindow - default 7 days
 */
export function calculateWeeklyMuscleVolume(workoutHistory = [], daysWindow = 7) {
  const cutoffTime = Date.now() - daysWindow * 24 * 60 * 60 * 1000;
  const recentWorkouts = workoutHistory.filter(w => new Date(w.date || w.endTime || w.startTime).getTime() >= cutoffTime);

  const muscleVolumes = {};
  for (const m of MUSCLE_GROUPS) {
    muscleVolumes[m] = { directSets: 0, totalSets: 0 };
  }

  for (const workout of recentWorkouts) {
    for (const ex of workout.exercises || []) {
      // Exclude warm-up sets
      const workingSets = (ex.sets || []).filter(s => s.completed && s.type !== 'W').length;
      if (workingSets === 0) continue;

      const primary = ex.targetMuscle || ex.bodyPart;
      if (primary && muscleVolumes[primary]) {
        muscleVolumes[primary].directSets += workingSets;
        muscleVolumes[primary].totalSets += workingSets;
      }

      for (const sec of ex.secondaryMuscles || []) {
        if (muscleVolumes[sec]) {
          muscleVolumes[sec].totalSets += workingSets * 0.5;
        }
      }
    }
  }

  // Format with status flags
  const summary = {};
  for (const m of MUSCLE_GROUPS) {
    const sets = muscleVolumes[m].directSets;
    let status = 'Maintenance';
    let color = '#94a3b8'; // Grey

    if (sets < VOLUME_LANDMARKS.MV) {
      status = 'Below MV';
      color = '#64748b';
    } else if (sets < VOLUME_LANDMARKS.MEV) {
      status = 'Maintenance (MV)';
      color = '#38bdf8';
    } else if (sets <= VOLUME_LANDMARKS.MAV) {
      status = 'Optimal Growth (MAV)';
      color = '#a3e635'; // Lime green
    } else if (sets <= VOLUME_LANDMARKS.MRV) {
      status = 'High Volume';
      color = '#f59e0b'; // Amber
    } else {
      status = 'Overreaching (MRV)';
      color = '#ef4444'; // Red
    }

    summary[m] = {
      directSets: Math.round(sets * 10) / 10,
      totalEffectiveSets: Math.round(muscleVolumes[m].totalSets * 10) / 10,
      status,
      color,
      progressPercent: Math.min(100, Math.round((sets / VOLUME_LANDMARKS.MAV) * 100))
    };
  }

  return summary;
}

/**
 * Exponential fatigue decay model over 48 to 96 hours post workout.
 * Fatigue(t) = Sets * e^(-lambda * t)
 * Half-life approx 30 hours: lambda = ln(2) / 30 = 0.0231
 */
export function calculateMuscleRecovery(workoutHistory = [], now = Date.now()) {
  const LAMBDA = 0.0231; // 30-hour half-life
  const recoveryState = {};

  for (const m of MUSCLE_GROUPS) {
    recoveryState[m] = { fatigueScore: 0, lastWorkedHoursAgo: null };
  }

  // Process workouts within last 120 hours (5 days)
  const fiveDaysMs = 120 * 60 * 60 * 1000;
  const eligibleWorkouts = workoutHistory
    .filter(w => {
      const t = new Date(w.date || w.endTime || w.startTime).getTime();
      return (now - t) <= fiveDaysMs && (now - t) >= 0;
    })
    .sort((a, b) => new Date(b.date || b.endTime).getTime() - new Date(a.date || a.endTime).getTime());

  for (const workout of eligibleWorkouts) {
    const workoutTime = new Date(workout.date || workout.endTime || workout.startTime).getTime();
    const hoursElapsed = Math.max(0, (now - workoutTime) / (1000 * 60 * 60));

    for (const ex of workout.exercises || []) {
      const workingSets = (ex.sets || []).filter(s => s.completed && s.type !== 'W').length;
      if (workingSets === 0) continue;

      const primary = ex.targetMuscle || ex.bodyPart;
      if (primary && recoveryState[primary]) {
        const decayFactor = Math.exp(-LAMBDA * hoursElapsed);
        recoveryState[primary].fatigueScore += workingSets * decayFactor;

        if (recoveryState[primary].lastWorkedHoursAgo === null || hoursElapsed < recoveryState[primary].lastWorkedHoursAgo) {
          recoveryState[primary].lastWorkedHoursAgo = Math.round(hoursElapsed);
        }
      }

      for (const sec of ex.secondaryMuscles || []) {
        if (recoveryState[sec]) {
          const decayFactor = Math.exp(-LAMBDA * hoursElapsed);
          recoveryState[sec].fatigueScore += (workingSets * 0.5) * decayFactor;
          if (recoveryState[sec].lastWorkedHoursAgo === null || hoursElapsed < recoveryState[sec].lastWorkedHoursAgo) {
            recoveryState[sec].lastWorkedHoursAgo = Math.round(hoursElapsed);
          }
        }
      }
    }
  }

  // Convert fatigue score (0 to 12+) into recovery percentage (0 to 100%)
  const results = {};
  for (const m of MUSCLE_GROUPS) {
    const fatigue = recoveryState[m].fatigueScore;
    // 8 sets immediately post workout = 100% fatigue (0% recovered)
    const normalizedFatigue = Math.min(1.0, fatigue / 8.0);
    const recoveredPercent = Math.max(0, Math.min(100, Math.round((1 - normalizedFatigue) * 100)));

    let status = 'Fresh & Ready';
    let statusColor = '#a3e635'; // Lime

    if (recoveredPercent < 50) {
      status = 'Fatigued / In Recovery';
      statusColor = '#ef4444'; // Red
    } else if (recoveredPercent < 85) {
      status = 'Recovering';
      statusColor = '#f59e0b'; // Amber
    }

    results[m] = {
      recoveredPercent,
      status,
      statusColor,
      hoursSinceLastWorkout: recoveryState[m].lastWorkedHoursAgo
    };
  }

  return results;
}
