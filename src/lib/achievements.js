/**
 * Client-Side Achievement Badges & Milestones
 * Fully offline gamification engine.
 */

export const ACHIEVEMENTS_LIST = [
  {
    id: 'first_workout',
    title: 'First Blood',
    emoji: '🩸',
    description: 'Logged your first completed workout.',
    category: 'consistency'
  },
  {
    id: 'century_club_bench',
    title: 'Century Club',
    emoji: '🏋️‍♂️',
    description: 'Bench pressed 100 kg (225 lb) or more.',
    category: 'strength'
  },
  {
    id: 'two_plate_squat',
    title: 'Two-Plate Squat',
    emoji: '🦵',
    description: 'Back Squat 140 kg (315 lb) or more.',
    category: 'strength'
  },
  {
    id: 'three_plate_deadlift',
    title: 'Three-Plate Deadlift',
    emoji: '🧱',
    description: 'Deadlift 180 kg (405 lb) or more.',
    category: 'strength'
  },
  {
    id: 'overhead_warrior',
    title: 'Overhead Warrior',
    emoji: '⚔️',
    description: 'Strict Overhead Press 60 kg (135 lb) or more.',
    category: 'strength'
  },
  {
    id: 'ten_ton_session',
    title: '10-Ton Titan',
    emoji: '🐘',
    description: 'Lifted over 10,000 kg total volume in a single session.',
    category: 'volume'
  },
  {
    id: 'millionaire_club',
    title: 'Millionaire Club',
    emoji: '🏆',
    description: 'Moved over 1,000,000 kg of cumulative lifetime volume.',
    category: 'volume'
  },
  {
    id: 'iron_will',
    title: 'Iron Will',
    emoji: '🔥',
    description: 'Completed 30 lifetime workouts.',
    category: 'consistency'
  },
  {
    id: 'century_workout',
    title: 'Century Workout',
    emoji: '⚡',
    description: 'Completed 100 total workout sessions.',
    category: 'consistency'
  }
];

/**
 * Evaluates user workout history against all achievements and returns newly unlocked IDs.
 */
export function evaluateAchievements(workoutHistory = [], alreadyUnlocked = []) {
  const unlockedSet = new Set(alreadyUnlocked);
  const newlyUnlocked = [];

  const completedCount = workoutHistory.length;
  if (completedCount >= 1 && !unlockedSet.has('first_workout')) {
    newlyUnlocked.push('first_workout');
  }
  if (completedCount >= 30 && !unlockedSet.has('iron_will')) {
    newlyUnlocked.push('iron_will');
  }
  if (completedCount >= 100 && !unlockedSet.has('century_workout')) {
    newlyUnlocked.push('century_workout');
  }

  let totalLifetimeVolume = 0;

  for (const workout of workoutHistory) {
    let sessionVolume = 0;

    for (const ex of workout.exercises || []) {
      const exId = (ex.id || '').toLowerCase();
      const exName = (ex.name || '').toLowerCase();

      for (const set of ex.sets || []) {
        if (!set.completed) continue;
        const w = Number(set.weight) || 0;
        const r = Number(set.reps) || 0;

        if (set.type !== 'W') {
          sessionVolume += w * r;
          totalLifetimeVolume += w * r;
        }

        // Strength checks
        if ((exId.includes('bench_press') || exName.includes('bench press')) && w >= 100) {
          if (!unlockedSet.has('century_club_bench') && !newlyUnlocked.includes('century_club_bench')) {
            newlyUnlocked.push('century_club_bench');
          }
        }

        if ((exId.includes('squat') || exName.includes('squat')) && w >= 140) {
          if (!unlockedSet.has('two_plate_squat') && !newlyUnlocked.includes('two_plate_squat')) {
            newlyUnlocked.push('two_plate_squat');
          }
        }

        if ((exId.includes('deadlift') || exName.includes('deadlift')) && w >= 180) {
          if (!unlockedSet.has('three_plate_deadlift') && !newlyUnlocked.includes('three_plate_deadlift')) {
            newlyUnlocked.push('three_plate_deadlift');
          }
        }

        if ((exId.includes('overhead_press') || exName.includes('overhead press') || exName.includes('military press')) && w >= 60) {
          if (!unlockedSet.has('overhead_warrior') && !newlyUnlocked.includes('overhead_warrior')) {
            newlyUnlocked.push('overhead_warrior');
          }
        }
      }
    }

    if (sessionVolume >= 10000 && !unlockedSet.has('ten_ton_session') && !newlyUnlocked.includes('ten_ton_session')) {
      newlyUnlocked.push('ten_ton_session');
    }
  }

  if (totalLifetimeVolume >= 1000000 && !unlockedSet.has('millionaire_club') && !newlyUnlocked.includes('millionaire_club')) {
    newlyUnlocked.push('millionaire_club');
  }

  return newlyUnlocked;
}
