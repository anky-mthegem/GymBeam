# Mandatory Rule: Android APK Revisioning & Distribution Policy

## Core Instruction
Whenever you create, build, or package an Android APK (`.apk`) for the GymBeam project:
1. **NEVER overwrite an existing revision APK file.**
2. **ALWAYS assign a new incremental revision number (`rev1`, `rev2`, `rev3`, etc.).**
3. **Save all APK artifacts in the `distribution-apk/` directory** (accessible also via alias `distribution apk/`).
4. **Naming Convention:**
   ```
   GymBeam-v<Version>-rev<RevisionNumber>-<Descriptor>.apk
   ```
   Where:
   - `<Version>` is the current version in `package.json` (e.g. `1.0.0`).
   - `<RevisionNumber>` is `N+1` where `N` is the highest revision number currently existing in `distribution-apk/`.
   - `<Descriptor>` is a concise kebab-cased summary of changes (e.g. `ui-overhaul`, `bugfix-timer`).
5. **Update `GymBeam-latest.apk`:**
   Always copy or update `distribution-apk/GymBeam-latest.apk` to mirror the latest created revision.
6. **Update Ledger:**
   Record the new revision in `distribution-apk/REVISIONS.md` with:
   - Revision ID (`revN`)
   - Filename
   - Build Date
   - File Size
   - SHA-256 Checksum
   - Summary of changes
7. **Use the Automation Script:**
   Whenever possible, invoke `npm run package:apk` or `.\scripts\package-apk.ps1` to execute the build and archive process automatically.
