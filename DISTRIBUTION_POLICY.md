# GymBeam APK Distribution & Version Revision Policy

## 1. Core Mandate
Whenever a new Android APK (`.apk`) is built or generated for the GymBeam project, **it MUST be created and archived as a new, immutable revision**. Existing APK files must **NEVER** be overwritten or deleted.

---

## 2. Directory Structure
All distributable build artifacts are permanently housed in:
- `distribution-apk/` (and its directory alias `distribution apk/`)

### Current Distribution Artifacts:
- **`GymBeam-v{Major}.{Minor}.{Patch}-rev{N}-{descriptor}.apk`**: Permanent, immutable snapshot of Revision `N`.
- **`GymBeam-latest.apk`**: A convenient symbolic copy pointing to the most recently generated stable revision for quick deployment/testing.
- **`REVISIONS.md`**: The official ledger logging every build revision, build timestamp, SHA-256 checksum, file size, and change notes.

---

## 3. Revision Naming Specification

Every build artifact must adhere to the standard format:
```
GymBeam-v<Version>-rev<RevisionNumber>-<Descriptor>.apk
```

### Format Breakdown:
| Token | Meaning | Example |
| :--- | :--- | :--- |
| `GymBeam` | Application Name | `GymBeam` |
| `v<Version>` | Semantic version from `package.json` | `v1.0.0` |
| `rev<RevisionNumber>` | Strictly monotonic, incremental integer (`1, 2, 3, ...`) | `rev1`, `rev2`, `rev3` |
| `<Descriptor>` | Brief kebab-case description of primary additions/fixes | `initial`, `ui-overhaul`, `bugfix-timer` |

### Examples:
- `GymBeam-v1.0.0-rev1-initial.apk`
- `GymBeam-v1.0.0-rev2-ui-overhaul.apk`
- `GymBeam-v1.0.0-rev3-cloud-sync.apk`

---

## 4. Operational Rules

1. **Strict Immutability**:
   - Once a revision APK (`revN`) is saved to `distribution-apk/`, it must **never** be edited, replaced, or deleted.
   - Any code changes, bugfixes, UI polishes, or configuration updates require incrementing the revision counter (`N+1`).

2. **Automated Registration**:
   - Every new revision must have its SHA-256 hash, file size, and changelog entry logged in `distribution-apk/REVISIONS.md`.

3. **Latest Pointer Synchronization**:
   - Concurrently with creating `GymBeam-v*-rev{N}-*.apk`, an identical copy named `GymBeam-latest.apk` must be created or replaced in `distribution-apk/` to allow automated deployment scripts (`adb install -r ...`) to always pull the latest build without changing paths.

4. **Agent Compliance**:
   - AI agents, developers, and CI/CD pipelines must consult `.agents/rules/apk_distribution_policy.md` and use the automated packaging script `npm run package:apk` (or `powershell -File ./scripts/package-apk.ps1`) to ensure compliance with this policy.

---

## 5. Automated Build & Revision Workflow

To create a compliant new revision, run:
```bash
npm run package:apk -- -Description "your-feature-description"
```
or via PowerShell directly:
```powershell
.\scripts\package-apk.ps1 -Description "your-feature-description"
```

The script will automatically:
1. Scan `distribution-apk/` to detect the highest existing revision number.
2. Increment the revision number to `rev{N+1}`.
3. Build the frontend web bundle (`vite build`).
4. Synchronize native Android assets (`npx cap sync android`).
5. Compile the Android debug/release APK via Gradle.
6. Copy and rename the binary to `distribution-apk/GymBeam-v<version>-rev<N+1>-<description>.apk`.
7. Refresh `distribution-apk/GymBeam-latest.apk`.
8. Calculate the SHA-256 checksum and append a release record to `distribution-apk/REVISIONS.md`.
