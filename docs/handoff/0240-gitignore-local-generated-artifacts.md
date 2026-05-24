# Handoff: Gitignore Local Generated Artifacts

Date: 2026-05-24

## 1. Task Goal

Add ignore rules for local generated workflow artifacts and recovery backup PNGs so recurring local files do not keep polluting `git status`.

## 2. Constraints Followed

- Did not stage files.
- Did not commit.
- Did not push.
- Did not delete files.
- Did not move files.
- Did not modify runtime code.
- Did not modify Sanity schema.
- Did not modify tools, assets, patches, or publish-packages.
- Did not reset, checkout, clean, stash, rebase, or run destructive commands.

## 3. Changed Files

- `.gitignore`
- `docs/devlog/0229-gitignore-local-generated-artifacts.md`
- `docs/handoff/0240-gitignore-local-generated-artifacts.md`
- `docs/handoff/latest.md`

## 4. Summary of Changes

Added root `.gitignore` rules:

```gitignore
# Local Hitori Media OS generated workflow artifacts
idea-jobs/
generation-jobs/
*.recovery-backup-*.png
*.png.recovery-backup-*
```

The extra `*.png.recovery-backup-*` pattern is necessary for the current backup filename shape.

## 5. Key Decisions

- Use the repo-root `.gitignore`, because these artifacts live at repo-root or under repo-level asset folders.
- Do not touch `dashboard/.gitignore`.
- Do not ignore `docs/ui-design/*.png` yet.
- Do not ignore `patches/`, `publish-packages/`, `assets/inbox/`, or `assets/visuals/` broadly.

## 6. Human Review Questions

- Should `.gitignore` cleanup be committed as a tiny maintenance commit?
- Should `docs/handoff/latest.md` be included in that commit or kept local?
- Should `docs/ui-design/*.png` be ignored later, or treated as canonical design references?

## 7. Risks or Uncertainties

- `*.png.recovery-backup-*` ignores PNG backup files even when the filename no longer ends in `.png`. This matches the current artifact and remains narrow to PNG backup naming.
- Raw `idea-jobs/` and `generation-jobs/` will stay local unless manually force-added or curated into examples later.

## 8. Recommended Next Step

Stage only the `.gitignore` cleanup files and produce a staged preview. Do not commit until boss approves.

## 9. Exact Prompt to Give Codex Next

```text
Stage .gitignore cleanup files only and produce staged preview.

Use:
- docs/handoff/0240-gitignore-local-generated-artifacts.md

Goal:
Stage the small .gitignore cleanup patch for local generated workflow artifacts.

Stage only:
- .gitignore
- docs/devlog/0229-gitignore-local-generated-artifacts.md
- docs/handoff/0240-gitignore-local-generated-artifacts.md

Do not stage docs/handoff/latest.md unless explicitly approved.
Do not stage generated jobs, docs/ui-design PNGs, recovery backup PNG, runtime code, tools, assets, patches, publish-packages, or commit planning docs.

Run:
- git diff --cached --name-status
- git diff --cached --check
- git check-ignore -v idea-jobs/ generation-jobs/ assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png.recovery-backup-2026-05-18T12-01-45-584Z
- git check-ignore -v docs/ui-design/ChatGPT\\ Image\\ 2026年5月19日\\ 12_35_50.png patches/visual-assets/building-hitori-media-os/x-hook-main-v1.json publish-packages/campaigns/building-hitori-media-os-release-review/x-final-review.md assets/inbox/generated/building-hitori-media-os/review-manifest.json

Report staged preview and commit readiness.
```
