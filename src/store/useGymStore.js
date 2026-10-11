import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveStateToDevice, loadStateFromDevice } from '../lib/storage.js';
import { evaluateAchievements } from '../lib/achievements.js';
import { calculateLinearProgression, calculateGreyskullProgression, calculateDoubleProgression } from '../lib/progression.js';

export const STARTER_ROUTINES = [
  {
    id: "routine_ppl_push",
    name: "Push Day (Hypertrophy)",
    emoji: "🔥",
    exercises: [
      {
        id: "barbell_bench_press",
        name: "Barbell Bench Press",
        bodyPart: "chest",
        targetMuscle: "chest",
        equipment: "barbell",
        targetSets: 3,
        reps: 8,
        weight: 60,
        inc: 2.5,
        restSec: 120,
        policy: "linear",
        supersetGroup: null
      },
      {
        id: "incline_dumbbell_press",
        name: "Incline Dumbbell Press",
        bodyPart: "chest",
        targetMuscle: "chest",
        equipment: "dumbbell",
        targetSets: 3,
        reps: 10,
        weight: 24,
        inc: 2.0,
        restSec: 90,
        policy: "double",
        supersetGroup: null
      },
      {
        id: "barbell_overhead_press",
        name: "Standing Barbell Overhead Press",
        bodyPart: "shoulders",
        targetMuscle: "shoulders",
        equipment: "barbell",
        targetSets: 3,
        reps: 8,
        weight: 40,
        inc: 2.5,
        restSec: 90,
        policy: "linear",
        supersetGroup: null
      },
      {
        id: "tricep_rope_pushdown",
        name: "Tricep Rope Cable Pushdown",
        bodyPart: "arms",
        targetMuscle: "triceps",
        equipment: "cable",
        targetSets: 3,
        reps: 12,
        weight: 25,
        inc: 2.5,
        restSec: 60,
        policy: "double",
        supersetGroup: "A1"
      },
      {
        id: "dumbbell_lateral_raise",
        name: "Standing Dumbbell Lateral Raise",
        bodyPart: "shoulders",
        targetMuscle: "shoulders",
        equipment: "dumbbell",
        targetSets: 3,
        reps: 15,
        weight: 10,
        inc: 1.0,
        restSec: 60,
        policy: "double",
        supersetGroup: "A2"
      }
    ]
  },
  {
    id: "routine_ppl_pull",
    name: "Pull Day (Back & Biceps)",
    emoji: "⚡",
    exercises: [
      {
        id: "barbell_deadlift",
        name: "Conventional Barbell Deadlift",
        bodyPart: "upper_back",
        targetMuscle: "lats",
        equipment: "barbell",
        targetSets: 3,
        reps: 5,
        weight: 100,
        inc: 5.0,
        restSec: 150,
        policy: "linear",
        supersetGroup: null
      },
      {
        id: "barbell_bent_over_row",
        name: "Barbell Bent-Over Row",
        bodyPart: "upper_back",
        targetMuscle: "lats",
        equipment: "barbell",
        targetSets: 3,
        reps: 8,
        weight: 60,
        inc: 2.5,
        restSec: 90,
        policy: "linear",
        supersetGroup: null
      },
      {
        id: "lat_pulldown_wide",
        name: "Wide-Grip Lat Pulldown",
        bodyPart: "upper_back",
        targetMuscle: "lats",
        equipment: "cable",
        targetSets: 3,
        reps: 10,
        weight: 55,
        inc: 2.5,
        restSec: 90,
        policy: "double",
        supersetGroup: null
      },
      {
        id: "barbell_bicep_curl",
        name: "Standing Barbell Bicep Curl",
        bodyPart: "arms",
        targetMuscle: "biceps",
        equipment: "barbell",
        targetSets: 3,
        reps: 10,
        weight: 30,
        inc: 2.5,
        restSec: 60,
        policy: "double",
        supersetGroup: "B1"
      },
      {
        id: "face_pull_cable",
        name: "Cable Face Pull",
        bodyPart: "shoulders",
        targetMuscle: "shoulders",
        equipment: "cable",
        targetSets: 3,
        reps: 15,
        weight: 20,
        inc: 2.5,
        restSec: 60,
        policy: "double",
        supersetGroup: "B2"
      }
    ]
  },
  {
    id: "routine_ppl_legs",
    name: "Leg Day (Quads & Hams)",
    emoji: "🦵",
    exercises: [
      {
        id: "barbell_back_squat",
        name: "Barbell Back Squat",
        bodyPart: "legs",
        targetMuscle: "quadriceps",
        equipment: "barbell",
        targetSets: 3,
        reps: 8,
        weight: 80,
        inc: 5.0,
        restSec: 120,
        policy: "linear",
        supersetGroup: null
      },
      {
        id: "romanian_deadlift_barbell",
        name: "Barbell Romanian Deadlift (RDL)",
        bodyPart: "legs",
        targetMuscle: "hamstrings",
        equipment: "barbell",
        targetSets: 3,
        reps: 8,
        weight: 70,
        inc: 5.0,
        restSec: 120,
        policy: "linear",
        supersetGroup: null
      },
      {
        id: "leg_press_45_degree",
        name: "45-Degree Leg Press",
        bodyPart: "legs",
        targetMuscle: "quadriceps",
        equipment: "machine",
        targetSets: 3,
        reps: 12,
        weight: 120,
        inc: 10.0,
        restSec: 90,
        policy: "double",
        supersetGroup: null
      },
      {
        id: "lying_leg_curl_machine",
        name: "Lying Leg Curl Machine",
        bodyPart: "legs",
        targetMuscle: "hamstrings",
        equipment: "machine",
        targetSets: 3,
        reps: 12,
        weight: 45,
        inc: 2.5,
        restSec: 60,
        policy: "double",
        supersetGroup: null
      },
      {
        id: "standing_calf_raise_machine",
        name: "Standing Machine Calf Raise",
        bodyPart: "legs",
        targetMuscle: "calves",
        equipment: "machine",
        targetSets: 4,
        reps: 15,
        weight: 60,
        inc: 5.0,
        restSec: 60,
        policy: "double",
        supersetGroup: null
      }
    ]
  }
];

export const DEFAULT_STATE = {
  unit: 'kg',
  restSec: 90,
  transitionSec: 30,
  soundEnabled: true,
  hapticsEnabled: true,
  timerFlash: false,
  workoutView: 'cards', // 'cards' | 'list' | 'compact'
  keepAwakeDuringWorkout: true,
  amoledBlackTheme: true,

  notifications: {
    enabled: true,
    reminderHour: 18,
    reminderMinute: 0,
    streakAlerts: true
  },

  routines: STARTER_ROUTINES,

  scheduleType: 'calendar',
  weekSchedule: {
    "1": "routine_ppl_push", // Monday
    "3": "routine_ppl_pull", // Wednesday
    "5": "routine_ppl_legs"  // Friday
  },
  cycleSchedule: {
    currentIndex: 0,
    sequence: ["routine_ppl_push", "routine_ppl_pull", "routine_ppl_legs", "REST"]
  },

  workoutHistory: [],
  activeWorkout: null,

  bodyweightLogs: [
    { id: 'bw_1', date: new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10), weight: 78.4 },
    { id: 'bw_2', date: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10), weight: 78.2 },
    { id: 'bw_3', date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), weight: 77.9 },
    { id: 'bw_4', date: new Date().toISOString().slice(0, 10), weight: 77.8 }
  ],
  targetWeight: 75.0,

  confirmedWeights: {},
  exerciseNotes: {},

  plateInventory: {
    barbellWeight: 20,
    availablePlates: [25, 20, 15, 10, 5, 2.5, 1.25]
  },

  progressPhotos: [],
  unlockedAchievements: [],
  adsRemoved: true
};

export const useGymStore = create(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      // Workout Lifecycle Actions
      startWorkout: (routineId = null) => {
        const state = get();
        const routine = state.routines.find(r => r.id === routineId) || state.routines[0];

        const exercises = (routine?.exercises || []).map(ex => {
          const ghost = state.confirmedWeights[ex.id] || null;
          const initialWeight = ghost?.w || ex.weight || 40;
          const initialReps = ghost?.r || ex.reps || 8;

          const sets = Array.from({ length: ex.targetSets || 3 }, (_, idx) => ({
            id: `set_${Date.now()}_${idx}`,
            setNumber: idx + 1,
            weight: initialWeight,
            reps: initialReps,
            completed: false,
            type: 'N',
            rpe: null,
            ghostWeight: ghost?.w || ex.weight || null,
            ghostReps: ghost?.r || ex.reps || null
          }));

          return {
            ...ex,
            sets,
            notes: state.exerciseNotes[ex.id] || ''
          };
        });

        const activeWorkout = {
          id: `wo_${Date.now()}`,
          routineId: routine?.id || 'custom',
          title: routine?.name || 'Workout Session',
          emoji: routine?.emoji || '🔥',
          startTime: new Date().toISOString(),
          endTime: null,
          exercises
        };

        set({ activeWorkout });
        saveStateToDevice(get());
      },

      updateActiveSet: (exerciseIndex, setIndex, updates) => {
        set(state => {
          if (!state.activeWorkout) return state;
          const updatedExercises = [...state.activeWorkout.exercises];
          const ex = { ...updatedExercises[exerciseIndex] };
          const sets = [...ex.sets];
          sets[setIndex] = { ...sets[setIndex], ...updates };
          ex.sets = sets;
          updatedExercises[exerciseIndex] = ex;

          // If set completed, update confirmedWeights cache
          const confirmed = { ...state.confirmedWeights };
          if (updates.completed) {
            confirmed[ex.id] = {
              w: sets[setIndex].weight,
              r: sets[setIndex].reps,
              d: new Date().toISOString().slice(0, 10)
            };
          }

          return {
            activeWorkout: { ...state.activeWorkout, exercises: updatedExercises },
            confirmedWeights: confirmed
          };
        });
        saveStateToDevice(get());
      },

      addActiveSet: (exerciseIndex) => {
        set(state => {
          if (!state.activeWorkout) return state;
          const updatedExercises = [...state.activeWorkout.exercises];
          const ex = { ...updatedExercises[exerciseIndex] };
          const lastSet = ex.sets[ex.sets.length - 1];

          const newSet = {
            id: `set_${Date.now()}_${ex.sets.length}`,
            setNumber: ex.sets.length + 1,
            weight: lastSet ? lastSet.weight : 40,
            reps: lastSet ? lastSet.reps : 8,
            completed: false,
            type: 'N',
            rpe: null,
            ghostWeight: lastSet?.ghostWeight || null,
            ghostReps: lastSet?.ghostReps || null
          };

          ex.sets = [...ex.sets, newSet];
          updatedExercises[exerciseIndex] = ex;
          return { activeWorkout: { ...state.activeWorkout, exercises: updatedExercises } };
        });
        saveStateToDevice(get());
      },

      removeActiveSet: (exerciseIndex, setIndex) => {
        set(state => {
          if (!state.activeWorkout) return state;
          const updatedExercises = [...state.activeWorkout.exercises];
          const ex = { ...updatedExercises[exerciseIndex] };
          if (ex.sets.length <= 1) return state; // Keep at least 1 set

          ex.sets = ex.sets.filter((_, idx) => idx !== setIndex).map((s, idx) => ({
            ...s,
            setNumber: idx + 1
          }));

          updatedExercises[exerciseIndex] = ex;
          return { activeWorkout: { ...state.activeWorkout, exercises: updatedExercises } };
        });
        saveStateToDevice(get());
      },

      swapExerciseInActiveWorkout: (exerciseIndex, newExercise, newWeight = null) => {
        set(state => {
          if (!state.activeWorkout) return state;
          const updatedExercises = [...state.activeWorkout.exercises];
          const current = updatedExercises[exerciseIndex];

          const targetWeight = newWeight !== null
            ? newWeight
            : (state.confirmedWeights[newExercise.id]?.w || newExercise.weight || current.sets[0]?.weight || 40);

          const sets = current.sets.map(s => ({
            ...s,
            weight: targetWeight
          }));

          updatedExercises[exerciseIndex] = {
            ...newExercise,
            sets,
            supersetGroup: current.supersetGroup || null,
            targetSets: current.targetSets || 3,
            notes: state.exerciseNotes[newExercise.id] || ''
          };

          return { activeWorkout: { ...state.activeWorkout, exercises: updatedExercises } };
        });
        saveStateToDevice(get());
      },

      addExerciseToActiveWorkout: (exercise) => {
        set(state => {
          if (!state.activeWorkout) return state;
          const ghost = state.confirmedWeights[exercise.id] || null;
          const weight = ghost?.w || 40;
          const reps = ghost?.r || 8;

          const sets = Array.from({ length: 3 }, (_, idx) => ({
            id: `set_${Date.now()}_${idx}`,
            setNumber: idx + 1,
            weight,
            reps,
            completed: false,
            type: 'N',
            rpe: null,
            ghostWeight: ghost?.w || null,
            ghostReps: ghost?.r || null
          }));

          const newEx = {
            ...exercise,
            targetSets: 3,
            reps,
            weight,
            sets,
            notes: state.exerciseNotes[exercise.id] || ''
          };

          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: [...state.activeWorkout.exercises, newEx]
            }
          };
        });
        saveStateToDevice(get());
      },

      removeExerciseFromActiveWorkout: (exerciseIndex) => {
        set(state => {
          if (!state.activeWorkout) return state;
          const updatedExercises = state.activeWorkout.exercises.filter((_, idx) => idx !== exerciseIndex);
          return { activeWorkout: { ...state.activeWorkout, exercises: updatedExercises } };
        });
        saveStateToDevice(get());
      },

      finishWorkout: () => {
        const state = get();
        if (!state.activeWorkout) return null;

        const finalizedWorkout = {
          ...state.activeWorkout,
          endTime: new Date().toISOString()
        };

        const updatedHistory = [finalizedWorkout, ...state.workoutHistory];

        // Evaluate achievements
        const newlyUnlocked = evaluateAchievements(updatedHistory, state.unlockedAchievements);
        const allAchievements = [...state.unlockedAchievements, ...newlyUnlocked];

        // Advance cycle index if rolling cycle
        let nextCycleIndex = state.cycleSchedule.currentIndex;
        if (state.scheduleType === 'cycle') {
          nextCycleIndex = (state.cycleSchedule.currentIndex + 1) % state.cycleSchedule.sequence.length;
        }

        set({
          activeWorkout: null,
          workoutHistory: updatedHistory,
          unlockedAchievements: allAchievements,
          cycleSchedule: {
            ...state.cycleSchedule,
            currentIndex: nextCycleIndex
          }
        });

        saveStateToDevice(get());
        return { finalizedWorkout, newlyUnlocked };
      },

      cancelWorkout: () => {
        set({ activeWorkout: null });
        saveStateToDevice(get());
      },

      saveExerciseNote: (exerciseId, note) => {
        set(state => ({
          exerciseNotes: { ...state.exerciseNotes, [exerciseId]: note }
        }));
        saveStateToDevice(get());
      },

      // Routines & Schedule Management
      saveRoutine: (routine) => {
        set(state => {
          const exists = state.routines.some(r => r.id === routine.id);
          const routines = exists
            ? state.routines.map(r => r.id === routine.id ? routine : r)
            : [...state.routines, routine];
          return { routines };
        });
        saveStateToDevice(get());
      },

      deleteRoutine: (routineId) => {
        set(state => ({
          routines: state.routines.filter(r => r.id !== routineId)
        }));
        saveStateToDevice(get());
      },

      setScheduleType: (scheduleType) => {
        set({ scheduleType });
        saveStateToDevice(get());
      },

      updateWeekSchedule: (dayOfWeek, routineId) => {
        set(state => ({
          weekSchedule: { ...state.weekSchedule, [String(dayOfWeek)]: routineId }
        }));
        saveStateToDevice(get());
      },

      updateCycleSchedule: (sequence) => {
        set(state => ({
          cycleSchedule: { ...state.cycleSchedule, sequence }
        }));
        saveStateToDevice(get());
      },

      // Bodyweight Log
      logBodyweight: (weight, date = new Date().toISOString().slice(0, 10)) => {
        set(state => {
          const entry = { id: `bw_${Date.now()}`, date, weight: Number(weight) };
          return { bodyweightLogs: [...state.bodyweightLogs, entry] };
        });
        saveStateToDevice(get());
      },

      deleteBodyweight: (id) => {
        set(state => ({
          bodyweightLogs: state.bodyweightLogs.filter(b => b.id !== id)
        }));
        saveStateToDevice(get());
      },

      setTargetWeight: (targetWeight) => {
        set({ targetWeight: Number(targetWeight) });
        saveStateToDevice(get());
      },

      updatePlateInventory: (plateInventory) => {
        set({ plateInventory });
        saveStateToDevice(get());
      },

      setUnit: (unit) => {
        set({ unit });
        saveStateToDevice(get());
      },

      setWorkoutView: (workoutView) => {
        set({ workoutView });
        saveStateToDevice(get());
      },

      setAdsRemoved: (adsRemoved) => {
        set({ adsRemoved });
        saveStateToDevice(get());
      },

      toggleSetting: (key) => {
        set(state => ({ [key]: !state[key] }));
        saveStateToDevice(get());
      },

      // Full JSON Export / Import
      exportData: () => {
        return JSON.stringify(get(), null, 2);
      },

      importData: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (parsed && typeof parsed === 'object') {
            set({ ...DEFAULT_STATE, ...parsed });
            saveStateToDevice(get());
            return true;
          }
        } catch (err) {
          console.error('Import error:', err);
        }
        return false;
      }
    }),
    {
      name: 'gymbeam_state_v1'
    }
  )
);
