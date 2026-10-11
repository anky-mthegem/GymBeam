# GymBeam - Premium Offline Fitness & Workout Tracking App

GymBeam is a high-performance, privacy-first Android workout tracking application built with React, Vite, Tailwind-grade custom Vanilla CSS design tokens, and Capacitor Android.

---

## 📱 Features

- **Obsidian Dark & Electric Neon UI**: Engineered for readability in high-contrast gym lighting.
- **Pure Offline Architecture**: 100% offline-first with LocalStorage & Capacitor Filesystem support (no accounts, no cloud dependencies).
- **Interactive Workout Logger**:
  - Live elapsed timer & auto rest-timer.
  - Previous set reference display (`Prev: 80 kg × 8`).
  - Warmup / Drop / Failure / Normal set tagging.
  - Plate calculator with custom bar weights.
  - 1RM estimations (Epley, Brzycki formulas).
  - Confetti animations on PR achievements.
- **Dynamic Muscle Heatmap & Analytics**:
  - 3D-styled SVG body map highlighting targeted muscle groups.
  - Volume, rep, and frequency tracking over time.
- **Custom Exercise & Routine Builder**:
  - Full exercise library with categorized equipment and targeted muscles.
  - Custom superset and drop-set support.
- **Backup & Restore**:
  - Complete JSON backup and restore capabilities for zero data loss.

---

## 📦 APK Distribution & Revision Policy

This project strictly adheres to the **[DISTRIBUTION_POLICY.md](./DISTRIBUTION_POLICY.md)**:

> **Mandatory Rule**: Whenever a new Android APK is generated, it **must always be created as a new incremental revision** (`rev1`, `rev2`, `rev3`, etc.). Existing revision APKs are permanent and immutable.

### Distribution Folders
All distribution APKs are stored in:
- [`distribution-apk/`](./distribution-apk) (and via junction alias [`distribution apk/`](./distribution%20apk))

### Active Revisions
Refer to **[`distribution-apk/REVISIONS.md`](./distribution-apk/REVISIONS.md)** for complete details, file hashes, and changelogs.

- **`GymBeam-v1.0.0-rev1-initial.apk`** — Initial clean-room engine & core tracking.
- **`GymBeam-v1.0.0-rev2-ui-overhaul.apk`** — High-end dark theme UI overhaul with neon accents.
- **`GymBeam-latest.apk`** — Convenience pointer always matching the latest stable revision.

### Automated Packaging Command
To build and automatically package the next revision:
```bash
npm run package:apk -- -Description "your-change-description"
```
Or with PowerShell:
```powershell
.\scripts\package-apk.ps1 -Description "your-change-description"
```

---

## 🛠️ Development & Building

### Prerequisites
- Node.js (v18+)
- Java JDK 21 (Microsoft OpenJDK or Eclipse Temurin)
- Android SDK (API 34+)

### Commands
```bash
# Start local Vite development server
npm run dev

# Run unit tests
npm run test

# Build production web bundle
npm run build

# Synchronize Capacitor native assets
npx cap sync android

# Build and create new revision APK
npm run package:apk
```

### Installing on Device / Emulator
```bash
adb install -r "distribution-apk/GymBeam-latest.apk"
```
