# Antigravity IDE Master Prompt: Build "GymBeam" — Standalone, Ad-Supported Mobile Gym Tracker

> **Instructions for Antigravity IDE:**  
> Use this prompt file as the authoritative specification to architect, scaffold, and implement a commercial-ready, standalone mobile gym workout and body-weight tracking app.  
> **Clean-Room & Legal Mandate:** This app is completely original. Do **NOT** use any code from openGym (AGPL) or any images/GIFs from Gym Visual. All algorithms, schemas, styling, and exercise datasets are clean-room implemented from scratch.

---

## 1. Project Vision & Business Model

Build **GymBeam**: a fast, offline-first gym tracking mobile app for Android (and iOS) published on the Google Play Store.

### Key Differentiators:
1. **$0 Server Costs for Owner:** All user workouts, routines, PRs, and body-weight logs are stored **100% locally on the user's mobile device**. You never pay for cloud servers, hosted databases, or bandwidth.
2. **Passive Ad Revenue & Optional Pro Upgrade:**
   - **Google AdMob** (`@capacitor-community/admob`): Banner ads on Library/Plan, High-eCPM Interstitial ads on the "Workout Completed" celebration screen, and Rewarded Video ads to unlock bonus perks (e.g., custom themes or extra routine slots).
   - Optional **One-Time $4.99 "Lifetime Remove Ads"** In-App Purchase for power users.
3. **Gym-Floor Performance & Zero Friction:** 
   - Operates completely offline without reception.
   - **Screen Wake-Lock** (`@capacitor-community/keep-awake`): Keeps screen awake during workout sessions so lifters don't have to unlock sweaty phones with their thumb.
   - **Previous Session Ghost Logging:** Displays faint ghost placeholders of the exact weight & reps lifted in the last session for instant reference.
   - **"Equipment Busy" 1-Tap Swapper:** Instantly suggests biomechanically equivalent exercises targeting the identical muscle group when gym machines are taken.
   - **Supersets & Giant Sets:** Links antagonistic exercises with smart alternating transition timers.
4. **100% Offline Push Notifications:** Local reminders (`@capacitor/local-notifications`) for workout times and streak saver alerts with **$0 cloud/server cost**.
5. **Organic Viral Growth:** Generates beautiful dark-mode **Social "Flex Cards"** (Instagram Story / WhatsApp) with the GymBeam watermark whenever users break PRs or finish workouts.
6. **No Copyright Risks:** Built with clean-room code (MIT / Proprietary), custom SVG anatomical body highlighters, and a clean royalty-free exercise database.

---

## 2. Technology Stack & Zero-Cost Infrastructure

Every tool and library selected below is **100% Free and Open Source (FOSS)** under permissive MIT or Apache 2.0 licenses:

| Component | Selected Technology | Licensing / Cost |
|---|---|---|
| **App Shell & Native APIs** | **Capacitor 7** (`@capacitor/core`, `@capacitor/android`, appId: `com.gymbeam.app`) | 100% Free (Apache 2.0). Wraps web app into native Android APK / AAB. |
| **Frontend Framework** | **React 19**, **Vite** | 100% Free (MIT). Ultra-fast compilation and runtime. |
| **State Management** | **Zustand 5** (`zustand/middleware` with persistence) | 100% Free (MIT). Micro-store with zero boilerplate. |
| **Mobile Persistence** | **`@capacitor/filesystem`** + **`localStorage` / IndexedDB** | 100% Free. Mirrors state to durable native phone storage to prevent Android WebView cache eviction. |
| **Ad Monetization** | **`@capacitor-community/admob`** | 100% Free plugin. Connects to your free Google AdMob account. |
| **Screen Wake-Lock** | **`@capacitor-community/keep-awake`** | 100% Free (MIT). Keeps the screen illuminated during workouts. |
| **Local Push Notifications** | **`@capacitor/local-notifications`** | 100% Free (Apache 2.0). Local scheduled workout & streak reminders without servers. |
| **Camera & Photos** | **`@capacitor/camera`** | 100% Free. Takes local custom exercise and ghost-overlay progress photos. |
| **Share & Social Cards** | **`@capacitor/share`**, **HTML5 Canvas / SVG rendering** | 100% Free. Generates image cards for Instagram Stories and WhatsApp. |
| **Haptics & Audio** | **`@capacitor/haptics`**, **Web Audio API** | 100% Free. Physical vibration and sound chimes with music ducking. |
| **Visual Effects** | **`canvas-confetti`** | 100% Free (ISC). Celebratory confetti on personal records (PRs) and achievements. |
| **Icons & Visuals** | **Lucide React** or **Custom Clean SVGs** | 100% Free (ISC / MIT). Clean procedural vector graphics. |
| **Testing** | **Vitest** + **Happy DOM** | 100% Free (MIT). Rigorous unit testing for all mathematical training engines. |
| **Google Play Publishing** | **Google Play Console** | **One-time $25 USD registration fee** to Google (no recurring server bills). |

---

## 3. Clean-Room Exercise Library & Vector Visuals (Zero Copyright Risk)

To ensure zero copyright claims from Gym Visual or proprietary fitness media:

### 1. Vector Anatomical Body Map (SVG)
- Implement an interactive, lightweight vector SVG human silhouette (Front & Back).
- Highlight anatomical muscle groups procedurally using CSS classes (`fill: var(--accent-color)`) based on targeted muscles:
  - *Chest (Pectorals), Upper Back (Lats, Rhomboids, Traps), Shoulders (Deltoids), Arms (Biceps, Triceps, Forearms), Core (Abs, Obliques), Legs (Quadriceps, Hamstrings, Glutes, Calves).*

### 2. Built-In 250+ Clean-Room Exercise Dataset (`src/data/exercises.json`)
Structure exercises using standard, non-copyrightable generic biomechanical names:
```json
[
  {
    "id": "barbell_bench_press",
    "name": "Barbell Bench Press",
    "bodyPart": "chest",
    "targetMuscle": "pectoralis_major",
    "secondaryMuscles": ["anterior_deltoid", "triceps_brachii"],
    "equipment": "barbell",
    "category": "strength",
    "tier": "compound",
    "instructions": [
      "Lie flat on the bench with eyes beneath the bar.",
      "Grip the bar slightly wider than shoulder width.",
      "Unrack and lower with control to the mid-chest.",
      "Press upward forcefully until arms are extended."
    ],
    "substitutes": ["dumbbell_bench_press", "machine_chest_press", "weighted_chest_dips"]
  },
  {
    "id": "barbell_back_squat",
    "name": "Barbell Back Squat",
    "bodyPart": "legs",
    "targetMuscle": "quadriceps",
    "secondaryMuscles": ["glutes", "hamstrings", "lower_back"],
    "equipment": "barbell",
    "category": "strength",
    "tier": "compound",
    "instructions": [
      "Rest the bar on your upper traps or rear delts.",
      "Descend by breaking at the hips and knees until thighs are parallel.",
      "Drive through the mid-foot to return to standing."
    ],
    "substitutes": ["leg_press", "hack_squat", "dumbbell_goblet_squat"]
  }
]
```
3. **Custom Exercise Creator:** Allow users to take photos with their phone camera (`@capacitor/camera`) to attach their own gym equipment images directly to their local device.

---

## 4. Local-Only Storage & File Mirror Architecture

Because there is no backend server, the app stores state directly on the device using a two-tier persistent strategy:

```
[ Zustand Store in Memory ]
       |
       +---> [ 1. Fast Browser localStorage: 'gymbeam_state_v1' ]
       |
       +---> [ 2. Durable Phone Mirror: @capacitor/filesystem ('gymbeam_backup.json') ]
```

### 1. State Schema (`src/types/store.js`)
```javascript
export const DEFAULT_STATE = {
  unit: 'kg', // 'kg' or 'lb'
  restSec: 90,
  transitionSec: 30, // For supersets
  soundEnabled: true,
  hapticsEnabled: true,
  timerFlash: false,
  workoutView: 'cards', // 'cards' | 'list' | 'compact'
  keepAwakeDuringWorkout: true, // Screen wake-lock toggle
  amoledBlackTheme: true, // True #000000 OLED theme
  
  // Notification preferences (100% offline local notifications)
  notifications: {
    enabled: true,
    reminderHour: 18,
    reminderMinute: 0,
    streakAlerts: true
  },

  // User routines (Push, Pull, Legs, Upper, Lower, etc.)
  routines: [
    {
      id: "routine_1",
      name: "Push Day",
      emoji: "🔥",
      exercises: [
        {
          id: "barbell_bench_press",
          sets: 3,
          reps: 8,
          weight: 60,
          inc: 2.5,
          restSec: 120,
          policy: "linear",
          supersetGroup: null // e.g. "A1", "A2"
        }
      ]
    }
  ],
  
  // Schedule Engine:
  // type: 'calendar' (Fixed days 0-6) OR 'cycle' (Rolling X on, Y off)
  scheduleType: 'calendar',
  weekSchedule: { "1": "routine_1", "3": "routine_2", "5": "routine_3" },
  cycleSchedule: {
    currentIndex: 0,
    sequence: ["routine_1", "routine_2", "routine_3", "REST"]
  },
  
  // Logged completed workouts
  workoutHistory: [],
  
  // Active in-flight workout session (null when idle)
  activeWorkout: null,
  
  // Bodyweight records: [{ d: '2026-10-10', w: 78.5, id: 'bw_1' }]
  bodyweightLogs: [],
  targetWeight: null,
  
  // Confirmed working weights per exercise: { [exerciseId]: { w: 60, r: 8, d: '2026-10-10' } }
  confirmedWeights: {},

  // User notes per exercise (e.g. seat notch, pin height)
  exerciseNotes: {},
  
  // Plate inventory for automatic plate calculator
  plateInventory: {
    barbellWeight: 20,
    availablePlates: [25, 20, 15, 10, 5, 2.5, 1.25]
  },
  
  // Progress photo records stored on local device: [{ d: '2026-10-10', path: '...' }]
  progressPhotos: [],

  // Gamification & Badges unlocked locally
  unlockedAchievements: [],
  
  // Ad & Monetization State
  adsRemoved: false // toggled if user purchases 'Remove Ads'
};
```

### 2. Native Storage Mirroring (`src/lib/storage.js`)
```javascript
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const STORAGE_KEY = 'gymbeam_state_v1';
const FILE_NAME = 'gymbeam_state_mirror.json';

export async function saveStateToDevice(state) {
  const json = JSON.stringify(state);
  // 1. Write to web storage
  localStorage.setItem(STORAGE_KEY, json);
  
  // 2. Write to native Android storage (immune to WebView cleanup)
  try {
    await Filesystem.writeFile({
      path: FILE_NAME,
      data: json,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
  } catch (err) {
    console.warn('Native filesystem mirror skipped on web preview:', err);
  }
}

export async function loadStateFromDevice() {
  // Try native file mirror first
  try {
    const file = await Filesystem.readFile({
      path: FILE_NAME,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
    if (file?.data) return JSON.parse(file.data);
  } catch {
    // Fallback to web localStorage
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return JSON.parse(local);
  }
  return null;
}
```

### 3. Full Data Backup & Export (Zero Lock-In)
Provide **Settings → Export Data** to export the entire workout database as a `.json` or `.csv` file via `@capacitor/share`, and **Import Data** to restore it anytime on any phone.

---

## 5. Monetization Engine (AdMob + In-App Purchase)

Implement `@capacitor-community/admob` with a user-friendly placement strategy designed specifically for workout tracking:

```javascript
import { AdMob, BannerAdPosition, BannerAdSize, RewardAdPluginEvents } from '@capacitor-community/admob';

const AD_UNITS = {
  BANNER: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
  INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ',
  REWARDED: 'ca-app-pub-XXXXXXXXXXXXXXXX/WWWWWWWWWW'
};

export async function initializeAdMob() {
  try {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: ['EMULATOR_OR_TEST_DEVICE_ID'], // Use test mode during dev
      initializeForTesting: true
    });
  } catch (err) {
    console.error('AdMob init error:', err);
  }
}

// 1. Non-Intrusive Banner Ad (Shown on Library and Plan screens)
export async function showLibraryBanner(adsRemoved = false) {
  if (adsRemoved) return;
  try {
    await AdMob.showBanner({
      adId: AD_UNITS.BANNER,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 64 // Sits comfortably above the bottom navigation bar
    });
  } catch (err) {
    console.warn('Banner ad load failed:', err);
  }
}

export async function hideBanner() {
  try {
    await AdMob.hideBanner();
  } catch {}
}

// 2. High-eCPM Interstitial Ad on "Finish Workout"
// Shown ONLY after user checks off their last set and taps "Finish Workout"
export async function showWorkoutFinishedAd(adsRemoved = false) {
  if (adsRemoved) return;
  try {
    await AdMob.prepareInterstitial({ adId: AD_UNITS.INTERSTITIAL });
    await AdMob.showInterstitial();
  } catch (err) {
    console.warn('Interstitial ad failed or dismissed:', err);
  }
}

// 3. Rewarded Ad to Unlock Bonus Themes or Advanced Analytics for 7 Days
export async function showRewardedUnlockAd(onSuccess) {
  try {
    await AdMob.prepareRewardVideoAd({ adId: AD_UNITS.REWARDED });
    const listener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
      onSuccess(reward);
      listener.remove();
    });
    await AdMob.showRewardVideoAd();
  } catch (err) {
    console.warn('Rewarded ad failed:', err);
  }
}
```

### Strict UX Rules for Monetization:
- **NEVER show popups or ads during an active set or while the rest timer is ticking.** Users lifting heavy weights must never be interrupted.
- Offer an optional one-time **$4.99 "Lifetime Remove Ads"** purchase toggle in Settings.

---

## 6. Core Mathematical & Domain Training Engines (`src/lib/`)

Write these as pure, 100% deterministic functions with adjacent Vitest tests:

### 1. Automatic Warm-Up Set Calculator (`src/lib/warmup.js`)
Automatically generates progressive warm-up ramping sets based on target working weight $W_{\text{target}}$:
- **Set 1:** Empty Bar ($20\text{ kg}$) $\times 10$ reps (Joint lubrication & movement patterning).
- **Set 2:** $\text{roundToPlate}(W_{\text{target}} \times 0.50) \times 5$ reps (50% warm-up).
- **Set 3:** $\text{roundToPlate}(W_{\text{target}} \times 0.70) \times 3$ reps (70% neuromuscular potentiation).
- **Set 4:** $\text{roundToPlate}(W_{\text{target}} \times 0.85) \times 1$ rep (85% acclimation single).
- **Working Sets:** $W_{\text{target}} \times R_{\text{target}}$.
- *Warm-up sets are automatically tagged with `type: 'W'` and excluded from total hypertrophy volume statistics.*

### 2. Automatic Progression Engine (`src/lib/progression.js`)
Calculates next target weights and reps from workout performance:
- **Linear Progression:**
  - If all sets hit prescribed reps $\rightarrow$ add $+2.5\text{ kg}$ (upper body) or $+5.0\text{ kg}$ (lower body).
  - If reps fail across **3 consecutive workouts** of that exercise $\rightarrow$ trigger **Automatic Deload**:
    $$\text{weight}_{\text{next}} = \text{round}\left(\text{weight}_{\text{prev}} \times 0.90\right)$$
- **Greyskull LP:**
  - 2 straight sets + 1 final AMRAP (As Many Reps As Possible) set.
  - Beat AMRAP target reps $\rightarrow$ increment weight.
  - Double AMRAP target reps $\rightarrow$ double the increment.
  - A single session failure triggers an immediate 10% deload.
- **Double Progression (Rep Ranges):**
  - Athlete trains within a rep range (e.g. 8–12 reps).
  - Weight stays constant while reps increase from 8 up to 12.
  - When all sets hit 12 reps $\rightarrow$ add weight and reset reps to 8.
- **Smart RPE/RIR Auto-Nudge:**
  - If user logs a set with $\text{RPE} \le 6$ ($\ge 4\text{ RIR}$), show an actionable prompt: *"Felt easy! Add +2.5 kg for next set?"*
- **Smart Deload Detector:**
  - Detects plateau if an athlete fails to progress on compound lifts for 3 consecutive weeks; suggests a 1-week deload at 70% intensity.

### 3. 1RM Estimations & Rep Percentage Matrix (`src/lib/onerm.js`)
Given weight $w$ and reps $r$ (with strict cap $r \le 12$):
- **Epley (Default):** $1\text{RM} = w \cdot \left(1 + \frac{r}{30}\right)$
- **Brzycki:** $1\text{RM} = w \cdot \left(\frac{36}{37 - r}\right)$
- **Lombardi:** $1\text{RM} = w \cdot r^{0.10}$
- **Percentage Matrix Generator:** Generates training zones from estimated 1RM:
  - $95\%$: Heavy Single / Overload
  - $85\%$: 5RM Strength Zone
  - $75\%$: 8–10 Rep Hypertrophy Target
  - $65\%$: 12–15 Rep Endurance / Pump Zone

### 4. Barbell Plate Calculator (`src/lib/plates.js`)
Calculates plates to slide on each side of the bar:
$$\text{Per Side Load} = \frac{\text{Target Weight} - \text{Bar Weight}}{2}$$
- Greedy change-making algorithm against user's inventory (e.g. $[25, 20, 15, 10, 5, 2.5, 1.25]$ kg).
- Renders an interactive visual diagram of the barbell sleeve showing the exact plates.

### 5. Hypertrophy Volume Landmarks & Muscle Recovery (`src/lib/recovery.js`)
- Maps exercises to muscles with primary (1.0) and secondary (0.5) fatigue weights.
- Tracks weekly direct sets per muscle group against hypertrophy benchmarks:
  - **< 6 sets:** Maintenance Volume (MV)
  - **10–16 sets:** Optimal Growth Zone (MAV - Maximum Adaptive Volume)
  - **> 20 sets:** High Volume / Approaching Recovery Ceiling (MRV)
- Models exponential fatigue decay over 48 to 96 hours post-workout:
  $$\text{Fatigue}(t) = \text{Sets} \cdot e^{-\lambda t}$$

### 6. Bodyweight Moving Average Smoothing (`src/lib/bodyweight.js`)
- Daily scale weight fluctuates due to sodium and water retention.
- Computes an **Exponential 7-Day Moving Average** (EMA) alongside raw daily weigh-ins to show genuine fat loss or muscle gain trends without water weight panic.

### 7. Supersets & Giant Sets Engine (`src/lib/supersets.js`)
- Groups exercises into pairs or trios (`A1/A2`, `B1/B2/B3`).
- **Alternating Timer Logic:**
  - Finishing set of `A1` $\rightarrow$ triggers a short transition timer (e.g. $30\text{--}45\text{s}$) to reach `A2`.
  - Finishing set of `A2` $\rightarrow$ triggers the full rest timer (e.g. $90\text{--}120\text{s}$) before returning to `A1`.
- Displays time saved by supersetting vs straight sets (e.g. *"Saved 16 minutes today"*).

### 8. "Equipment Busy" 1-Tap Exercise Swapper (`src/lib/substitutions.js`)
- Solves crowded gym delays.
- Queries `exercises.json` for biomechanically equivalent exercises matching the identical `targetMuscle` and motion category:
  - Example: *Barbell Bench Press* $\rightarrow$ *Dumbbell Flat Press*, *Chest Press Machine*, or *Weighted Dips*.
  - Example: *Lat Pulldown* $\rightarrow$ *Pull-ups*, *Chest Supported Row*, or *Meadows Row*.
- Pre-fills target weight by transferring 1RM strength ratios between barbell, dumbbell, and machine modalities.

### 9. Set Type Tagging & Drop Set Auto-Cloner (`src/lib/setTypes.js`)
- Supports set indicators: Normal (`N`), Warmup (`W`), Drop Set (`D`), Myo-Rep / Rest-Pause (`RP`), Failure/AMRAP (`+`).
- **Drop Set Helper:** When logging a Drop Set, immediately spawns an linked sub-set with pre-calculated $-20\%$ or $-25\%$ weight reduction.
- Warm-up sets are automatically flagged so they do not pollute total hypertrophy volume metrics.

---

## 7. Frontend UI/UX Architecture & Views (`src/views/`)

### Design Aesthetic (Amoled Dark Mode & Gym-Floor Ergonomics)
- **Backgrounds:** True OLED Black (`#000000`) and Deep Slate (`#0f1117`, `#181b24`) to conserve mobile battery during 90-minute workouts.
- **Accents:** Electric Lime (`#a3e635`) or Cyber Cyan (`#06b6d4`).
- **Surface:** Glassmorphism cards with crisp 1px borders (`rgba(255, 255, 255, 0.08)`).
- **Wake-Lock Integration:** Screen automatically stays awake (`@capacitor-community/keep-awake`) when an active workout is in progress; releases lock when workout finishes.
- **Micro-Interactions:** Subtle haptic ticks (`@capacitor/haptics`) upon checking off sets and rest timer completion.

### View Hierarchy:

1. **`Home.jsx`:**
   - "Start Today's Workout" prominent quick-action card.
   - 365-day GitHub-style consistency streak heatmap.
   - 7-day smoothed body-weight trend chart with goal line.
   - Quick glance at recent PRs and weekly volume completion.

2. **`Workout.jsx` (Live Training Screen):**
   - **View Switcher:** Toggle between **Cards View** (focus on current exercise), **List View** (all exercises in order), and **Compact View** (fast data grid).
   - **Previous Session Ghost Placeholders:** Inputs show faint grey ghost text of what the lifter lifted last time (e.g., `80 kg × 8`) so no guesswork is needed.
   - **Sticky Rest Timer Bar:** Persistent floating bar with live countdown, $+30\text{s}$ button, pause/skip, and audio beeps that duck background music cleanly.
   - **Set Type Badges:** 1-tap toggling between Normal, Warmup (`W`), Drop Set (`D`), or AMRAP (`+`).
   - **Auto Warm-up Button:** One-tap generated warm-up ramping sets.
   - **Equipment Notes:** Quick note icon to save seat height, pin notch, or grip width (e.g., *"Seat #4, Incline notch 3"*).
   - **Swap Exercise Button:** 1-tap substitute selector if equipment is taken.

3. **`Plan.jsx` & `RoutineEdit.jsx`:**
   - **Schedule Mode Switch:**
     - **Calendar Mode:** Fixed weekdays (Mon = Push, Wed = Pull, Fri = Legs).
     - **Rolling Cycle Mode:** Asynchronous cycle (Push $\rightarrow$ Pull $\rightarrow$ Legs $\rightarrow$ Rest $\rightarrow$ Repeat) advancing automatically regardless of the day of the week.
   - Starter template library (PPL, Upper/Lower, Arnold Split, 5x5, Full Body).
   - Superset group linker (`A1` / `A2` badges) and drag-and-drop reordering.

4. **`Library.jsx`:**
   - Searchable catalogue of 250+ built-in clean-room exercises with anatomical filter chips.
   - Custom exercise creator with camera photo upload (`@capacitor/camera`).
   - Banner ad at the bottom.

5. **`Stats.jsx`:**
   - Muscle Volume Progress Bars (Weekly sets vs Optimal Hypertrophy zone).
   - 1RM progression charts and volume load trends over time.
   - Interactive SVG muscle recovery map (decaying over 48-72h).
   - **Ghost-Overlay Progress Photos:** Camera view with transparent overlay of previous photo to match lighting and pose.

6. **`Settings.jsx`:**
   - Plate inventory configuration, unit switch (`kg`/`lb`), rest timer sound/vibration toggles.
   - Screen Keep-Awake toggle.
   - Notification schedule preferences (offline local push notifications).
   - Backup Export/Import (JSON/CSV) via native share dialog.
   - "Remove Ads" upgrade option.

---

## 8. Gamification, Streaks & Local Offline Notifications

To drive long-term user retention without any server overhead:

### 1. 100% Offline Local Push Notifications (`src/lib/notifications.js`)
Implemented with `@capacitor/local-notifications`:
- **Daily Workout Reminder:** Fires at user's configured hour (e.g., 6:00 PM) on scheduled training days: *"Time to train! Today is Push Day 🔥"*.
- **Streak Protector:** Fires at 8:00 PM if scheduled workout wasn't logged: *"Don't break your 3-week streak! Get a quick session in 💪"*.
- **Rest Timer Background Notification:** If the user switches to another app (e.g. Instagram or Spotify), fires a notification when rest is over: *"Rest over! Get to your next set ⏱️"*.

### 2. Client-Side Achievement Badges (`src/lib/achievements.js`)
Milestone badges unlocked locally with celebratory confetti (`canvas-confetti`):
- **Strength Milestones:**
  - 🏋️‍♂️ *Century Club:* Bench Press $\ge 100\text{ kg}$ ($225\text{ lb}$)
  - 🦵 *Two-Plate Squat:* Back Squat $\ge 140\text{ kg}$ ($315\text{ lb}$)
  - 🧱 *Three-Plate Deadlift:* Deadlift $\ge 180\text{ kg}$ ($405\text{ lb}$)
- **Volume & Consistency:**
  - 🏆 *Millionaire Club:* $1,000,000\text{ kg}$ cumulative lifetime volume moved.
  - 🔥 *Iron Will:* 30 workouts completed with $\ge 80\%$ schedule consistency.
  - ⚡ *Century Workout:* 100 total completed sessions.

---

## 9. Viral Growth & Social "Flex Card" Generator (`src/lib/shareCard.js`)

To drive free organic app installs from social media:
- When a user finishes a workout or breaks a PR:
  1. Trigger celebratory **Confetti Animation** (`canvas-confetti`) and gold badge.
  2. Generate a sleek, high-resolution dark-mode **"Flex Card"** rendered via HTML Canvas:
     - Card details: `Bench Press PR: 100 kg × 5`, `Total Volume: 8,450 kg`, `Duration: 52 min`, date stamp.
     - Branded footer watermark: **"Tracked with GymBeam · Available on Google Play"**.
  3. One-tap share button invokes `@capacitor/share` to post directly to Instagram Stories, WhatsApp status, or Twitter.

---

## 10. Google Play Store Publishing Checklist

Prepare the application for direct Play Store publication:

1. **Android App Bundle (`.aab`):**
   - Built via `cd android && ./gradlew bundleRelease`.
2. **Keystore Signing:**
   - Generate release keystore: `keytool -genkey -v -keystore gymbeam-release.keystore -alias gymbeam -keyalg RSA -keysize 2048 -validity 10000`.
3. **Google Play Console Requirements:**
   - One-time **$25 USD** developer account registration.
   - Free hosted Privacy Policy (can be hosted on free GitHub Pages or Vercel).
   - Target Android SDK 34+ (Android 14/15) in `variables.gradle`.
4. **AdMob `app-ads.txt`:**
   - Host `app-ads.txt` on a free custom domain or GitHub Pages for Google AdMob crawler verification.

---

## 11. Antigravity IDE Implementation Roadmap

Follow this exact 6-step implementation sequence:

```
[ Step 1: Project Scaffolding & Native Plugins ]
  `--> Vite + React 19 + Zustand + Capacitor 7 + Plugins:
       @capacitor/filesystem, @capacitor-community/admob, @capacitor-community/keep-awake,
       @capacitor/local-notifications, @capacitor/haptics, @capacitor/share, @capacitor/camera,
       lucide-react, canvas-confetti.

[ Step 2: Pure Domain Logic & Engines ]
  `--> src/lib/onerm.js, progression.js, plates.js, recovery.js, warmup.js, bodyweight.js,
       supersets.js, substitutions.js, setTypes.js, achievements.js, notifications.js
       + Full Vitest test suites.

[ Step 3: Local Storage & Exercise Data ]
  `--> 250+ clean-room exercise catalog (exercises.json) + storage.js (Zustand + Capacitor Filesystem mirror).

[ Step 4: AdMob, Notifications & Social Sharing ]
  `--> admob.js setup (banner, interstitial, rewarded) + notifications.js + shareCard.js (Canvas Flex Card).

[ Step 5: High-Performance UI Views ]
  `--> Home (Streak Heatmap), Workout (Cards/List/Compact + Rest Timer + Warmups + Swapper + Wake-Lock),
       Plan (Calendar & Rolling Cycle modes), Library, Stats, Settings.

[ Step 6: Native Android Packaging ]
  `--> npx cap add android -> Configure permissions, App Bundle (.aab), and release build.
```

i have android studio also installed in laptop. we will build app in antigravity ide and test on android studio imulator
