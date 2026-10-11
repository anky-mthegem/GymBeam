# GymBeam Build Revisions Ledger

This document tracks all Android APK revisions generated for GymBeam. In accordance with [DISTRIBUTION_POLICY.md](../DISTRIBUTION_POLICY.md), build artifacts in this directory are immutable. Each new build must be assigned a new incremental revision.

---

## Revision History

| Revision | File Name | Build Date | Size | SHA-256 Checksum | Description / Key Highlights |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **rev1** | [`GymBeam-v1.0.0-rev1-initial.apk`](./GymBeam-v1.0.0-rev1-initial.apk) | 2026-10-11 | 13.2 MB (13,240,589 B) | `48D85A4BF2BEE40F20718614089E4A5208BA46DDA9940F6972B428ACAB6B2A21` | Initial Android build featuring clean-room workout tracker engine, Zustand state store, and standard screens. |
| **rev2** | [`GymBeam-v1.0.0-rev2-ui-overhaul.apk`](./GymBeam-v1.0.0-rev2-ui-overhaul.apk) | 2026-10-11 | 13.2 MB (13,240,589 B) | `48D85A4BF2BEE40F20718614089E4A5208BA46DDA9940F6972B428ACAB6B2A21` | Major UI/UX overhaul: Dark obsidian theme, electric neon accents, glassmorphic cards, polished rest timer bar, dynamic muscle heatmaps, and Confetti celebrations. |
| **rev3** | [`GymBeam-v1.0.0-rev3-settings-free-block-and-author-attribution.apk`](./GymBeam-v1.0.0-rev3-settings-free-block-and-author-attribution.apk) | 2026-10-11 | 12.6 MB (13,240,591 B) | `6196BF6EE0AE1EF1E0BFD33FCB12FAB687E82E572CE57A1E813EB3A2044223F2` | Settings tab customization: Removed monetization block and added 100% Free Forever block. |
| **rev4** | [`GymBeam-v1.0.0-rev4-settings-author-attribution-and-free-block.apk`](./GymBeam-v1.0.0-rev4-settings-author-attribution-and-free-block.apk) | 2026-10-11 | 12.6 MB (13,238,907 B) | `7E8D514FB5A519DAC67626E6DC8C646E5AD6F4540AC6F353C217B7E3C4ED41FD` | Added generous bottom scroll padding and enhanced styling for "Made With <3 By Anky Singh" attribution footer. |

---

## Latest Active Build Pointer
The file [`GymBeam-latest.apk`](./GymBeam-latest.apk) is a duplicate of the latest verified revision (**rev4**). For fast testing or automated sideloading via ADB, run:

```bash
adb install -r "distribution-apk/GymBeam-latest.apk"
```
or
```bash
adb install -r "distribution apk/GymBeam-latest.apk"
```
