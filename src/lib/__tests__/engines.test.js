import { describe, it, expect } from 'vitest';
import { calculateWarmupSets, roundToNearest } from '../warmup.js';
import {
  calculateLinearProgression,
  calculateGreyskullProgression,
  calculateDoubleProgression,
  checkRpeNudge,
  detectPlateauDeload
} from '../progression.js';
import { calculateOneRm, getTrainingPercentages } from '../onerm.js';
import { calculatePlates } from '../plates.js';
import { calculateWeeklyMuscleVolume, calculateMuscleRecovery } from '../recovery.js';
import { calculateWeightEma, calculateWeightTrend } from '../bodyweight.js';
import { getNextRestTimer, calculateTimeSaved } from '../supersets.js';
import { findSubstitutes, calculateEquivalentWeight } from '../substitutions.js';
import { generateDropSet, calculateWorkingVolume } from '../setTypes.js';
import { evaluateAchievements } from '../achievements.js';

describe('1. Warmup Set Calculator', () => {
  it('generates progressive warm-up sets up to target weight', () => {
    const warmups = calculateWarmupSets(100, 8, 20, 2.5);
    expect(warmups.length).toBe(4);
    expect(warmups[0].weight).toBe(20); // Empty bar
    expect(warmups[1].weight).toBe(50); // 50%
    expect(warmups[2].weight).toBe(70); // 70%
    expect(warmups[3].weight).toBe(85); // 85%
    expect(warmups.every(s => s.type === 'W')).toBe(true);
  });

  it('clamps correctly when target is near or below bar weight', () => {
    const warmups = calculateWarmupSets(20, 10, 20, 2.5);
    expect(warmups.length).toBe(1);
    expect(warmups[0].weight).toBe(20);
  });
});

describe('2. Progression Engine', () => {
  it('increments weight on successful linear progression', () => {
    const result = calculateLinearProgression({
      currentWeight: 80,
      targetReps: 8,
      targetSets: 3,
      recentCompletedSets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }],
      consecutiveFailures: 0,
      isLowerBody: false
    });
    expect(result.status).toBe('progressed');
    expect(result.nextWeight).toBe(82.5);
  });

  it('triggers 10% deload after 3 consecutive failures', () => {
    const result = calculateLinearProgression({
      currentWeight: 100,
      targetReps: 8,
      targetSets: 3,
      recentCompletedSets: [{ reps: 6 }, { reps: 5 }, { reps: 4 }],
      consecutiveFailures: 2,
      isLowerBody: false
    });
    expect(result.status).toBe('deload');
    expect(result.nextWeight).toBe(90);
  });

  it('handles Greyskull AMRAP double increment when doubling reps', () => {
    const result = calculateGreyskullProgression({
      currentWeight: 60,
      targetReps: 5,
      completedSets: [{ reps: 5 }, { reps: 5 }, { reps: 10 }],
      isLowerBody: false
    });
    expect(result.status).toBe('double_progressed');
    expect(result.nextWeight).toBe(65); // +5kg (double standard 2.5kg)
  });

  it('handles Double Progression within rep range', () => {
    // When sets are below max reps
    const repPhase = calculateDoubleProgression({
      currentWeight: 30,
      minReps: 8,
      maxReps: 12,
      completedSets: [{ reps: 10 }, { reps: 9 }, { reps: 8 }]
    });
    expect(repPhase.status).toBe('rep_progression');
    expect(repPhase.nextWeight).toBe(30);

    // When all sets hit 12 reps
    const weightPhase = calculateDoubleProgression({
      currentWeight: 30,
      minReps: 8,
      maxReps: 12,
      completedSets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }]
    });
    expect(weightPhase.status).toBe('weight_progressed');
    expect(weightPhase.nextWeight).toBe(32.5);
    expect(weightPhase.targetReps).toBe(8);
  });

  it('nudges when RPE <= 6', () => {
    const nudge = checkRpeNudge(5);
    expect(nudge.nudge).toBe(true);
    expect(nudge.suggestedAdd).toBe(2.5);
  });
});

describe('3. 1RM Estimations', () => {
  it('calculates Epley 1RM accurately', () => {
    const oneRm = calculateOneRm(100, 10, 'epley');
    // 100 * (1 + 10/30) = 133.33 -> 133.3
    expect(oneRm).toBe(133.3);
  });

  it('returns exact weight for 1 rep', () => {
    expect(calculateOneRm(140, 1)).toBe(140);
  });

  it('generates training zones matrix', () => {
    const zones = getTrainingPercentages(100);
    expect(zones.find(z => z.percentage === 85)?.weight).toBe(85);
    expect(zones.find(z => z.percentage === 75)?.weight).toBe(75);
  });
});

describe('4. Barbell Plate Calculator', () => {
  it('calculates correct plate breakdown for 100kg total with 20kg bar', () => {
    const result = calculatePlates(100, 20, [25, 20, 15, 10, 5, 2.5, 1.25]);
    expect(result.perSideLoad).toBe(40);
    expect(result.totalAchieved).toBe(100);
    expect(result.exactMatch).toBe(true);
    // 40kg per side = 1x 25kg + 1x 15kg
    expect(result.plates).toEqual([
      { plate: 25, count: 1 },
      { plate: 15, count: 1 }
    ]);
  });
});

describe('5. Supersets Engine', () => {
  it('triggers short transition timer for first exercise and full rest for last', () => {
    const exA1 = { id: 'ex_1', name: 'Bench Press', supersetGroup: 'A1', restSec: 120 };
    const exA2 = { id: 'ex_2', name: 'Barbell Row', supersetGroup: 'A2', restSec: 120 };
    const all = [exA1, exA2];

    const timerA1 = getNextRestTimer({
      currentExercise: exA1,
      allExercises: all,
      defaultRestSec: 120,
      transitionSec: 30
    });
    expect(timerA1.timerType).toBe('superset_transition');
    expect(timerA1.durationSec).toBe(30);

    const timerA2 = getNextRestTimer({
      currentExercise: exA2,
      allExercises: all,
      defaultRestSec: 120,
      transitionSec: 30
    });
    expect(timerA2.timerType).toBe('superset_full_rest');
    expect(timerA2.durationSec).toBe(120);
  });

  it('calculates gym time saved with supersets', () => {
    const exA1 = { id: '1', supersetGroup: 'A1', targetSets: 4 };
    const exA2 = { id: '2', supersetGroup: 'A2', targetSets: 4 };
    const saved = calculateTimeSaved([exA1, exA2], 90, 30);
    // 4 rounds * (90 - 30) = 240 seconds = 4 minutes
    expect(saved.minutesSaved).toBe(4);
  });
});

describe('6. Substitutions & Strength Transfer', () => {
  it('calculates dumbbell equivalent from barbell bench press', () => {
    // 100kg barbell -> 40kg per dumbbell
    const dbWeight = calculateEquivalentWeight('barbell', 'dumbbell', 100);
    expect(dbWeight).toBe(40);
  });
});

describe('7. Set Types & Volume Exclusions', () => {
  it('generates drop set with 20% reduction', () => {
    const parent = { id: 's1', weight: 80, reps: 8 };
    const drop = generateDropSet(parent, 20);
    expect(drop.weight).toBe(65); // 80 - 16 = 64 -> round to 65
    expect(drop.type).toBe('D');
  });

  it('excludes warmups from total hypertrophy volume', () => {
    const sets = [
      { weight: 20, reps: 10, completed: true, type: 'W' }, // Warmup 200kg ignored
      { weight: 50, reps: 5, completed: true, type: 'W' },  // Warmup 250kg ignored
      { weight: 100, reps: 8, completed: true, type: 'N' }, // 800kg
      { weight: 100, reps: 8, completed: true, type: 'N' }  // 800kg
    ];
    expect(calculateWorkingVolume(sets)).toBe(1600);
  });
});

describe('8. Gamification & Achievements', () => {
  it('unlocks First Blood on 1st workout and Century Club for 100kg bench', () => {
    const history = [
      {
        exercises: [
          {
            id: 'barbell_bench_press',
            name: 'Barbell Bench Press',
            sets: [{ weight: 100, reps: 5, completed: true, type: 'N' }]
          }
        ]
      }
    ];
    const unlocked = evaluateAchievements(history, []);
    expect(unlocked).toContain('first_workout');
    expect(unlocked).toContain('century_club_bench');
  });
});
