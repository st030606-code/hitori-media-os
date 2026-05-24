# Devlog 0229: Gitignore Local Generated Artifacts

Date: 2026-05-24

## Goal

Add small `.gitignore` rules for recurring local generated workflow artifacts and recovery backup PNGs.

This batch did not stage, commit, delete, move, or modify runtime files.

## Changed Files

- `.gitignore`
- `docs/devlog/0229-gitignore-local-generated-artifacts.md`
- `docs/handoff/0240-gitignore-local-generated-artifacts.md`
- `docs/handoff/latest.md`

## Ignore Rules Added

```gitignore
# Local Hitori Media OS generated workflow artifacts
idea-jobs/
generation-jobs/
*.recovery-backup-*.png
*.png.recovery-backup-*
```

The second recovery-backup pattern was added because the current backup file is named:

```text
campaign-hero-v1.png.recovery-backup-2026-05-18T12-01-45-584Z
```

That filename does not end with `.png`, so `*.recovery-backup-*.png` alone does not match it.

## Verification

Confirmed ignored:

- `idea-jobs/`
- `generation-jobs/`
- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png.recovery-backup-2026-05-18T12-01-45-584Z`

Confirmed not ignored:

- `docs/ui-design/ChatGPT Image 2026年5月19日 12_35_50.png`
- `patches/visual-assets/building-hitori-media-os/x-hook-main-v1.json`
- `publish-packages/campaigns/building-hitori-media-os-release-review/x-final-review.md`
- `assets/inbox/generated/building-hitori-media-os/review-manifest.json`

## Notes

- Already tracked files would not be affected by `.gitignore`.
- `idea-jobs/` and `generation-jobs/` had no tracked files.
- Existing files were not deleted.

## Next Step

Create a small staged preview for the `.gitignore` cleanup, likely including:

- `.gitignore`
- this devlog
- `docs/handoff/0240-gitignore-local-generated-artifacts.md`
- optionally `docs/handoff/latest.md`
