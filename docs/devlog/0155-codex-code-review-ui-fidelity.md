# Devlog 0155 — Codex independent code review for UI fidelity cycle

日付: 2026-05-20

## 背景

Phase UI-fidelity-1〜10 完了 + 全 cleanup microbatch (ReadOnlyBanner 削除を含む) 完了。Hitori Media OS UI fidelity cycle が一巡したのを機に、**Codex CLI を独立 reviewer として走らせる** batch。Phase Admin 1 (handoff/0152 §3) で boss が試みた dual-reviewer pattern の再実行。

本 batch は review-only。コード変更ゼロ、findings の分類のみ。

## 決定・変更

### Codex review コマンド

```bash
codex exec -m gpt-5.4 --sandbox read-only --skip-git-repo-check - < /tmp/codex-review-prompt.md
```

- model: `gpt-5.4` (default の `gpt-5.5` は CLI 0.120.0 で互換性エラー、boss が image generation で使ってきた gpt-5.4 にフォールバック)
- sandbox: `read-only` (Codex に修正させない、review-only 厳守)
- `--skip-git-repo-check` (uncommitted 大量差分を許可)
- prompt: 6 review scope (architecture / fidelity / security / TS / a11y / maintainability) + A/B/C/D/E bucket 構造を /tmp/codex-review-prompt.md に明文化

`codex review --uncommitted` も試したが `[PROMPT]` と排他なため `codex exec` を採用。
最初の試行は `gpt-5.5` モデル要求エラー (CLI 古い) → `-m gpt-5.4` で成功。

### Review output

10,652 行 (大半は Codex の grep / read 等の動作ログ)、最終 review report は output 末尾 65 行 (line 10588-10652) に markdown 形式で生成。本 devlog の §4 にそのまま転記。

### 結果サマリ (A/B/C/D/E バケット)

- **A. Blocking issues**: None
- **B. High-priority fixes**: 3 件
- **C. Medium-priority improvements**: 3 件
- **D. Future considerations**: 5 件
- **E. Explicitly OK**: 8 件

詳細は handoff/0166 §4。

## 理由

- **Codex を独立 reviewer に**: Claude Code が batch を書き続けていると blind spot が増える。Codex は独立 model で実装履歴を持たない、別目線で findings を抽出可能
- **`--sandbox read-only`**: review なので write は不要、誤って codex が `apply` で patch しないよう安全側
- **`gpt-5.4` フォールバック**: CLI 0.120.0 と互換性のある最新 model、Phase Admin 1 で boss が image generation に使った実績あり
- **A/B/C/D/E 強制 bucket**: Codex の自由形式 review より、structured で patch 判断しやすい
- **「Safe to patch now?」フィールド追加**: 後続 microbatch で boss が即対応 / 後回しを決めるための critical metadata
- **/publish-package/[slug] の boss-protected 旨を prompt で明示**: Codex が「740 行を refactor すべき」と提案して noise になるのを防ぐ
- **shadcn 禁止旨を prompt で明示**: Codex の training data から shadcn 提案が来ないように

## 影響

- code 変更ゼロ、23 routes 動作維持、build 不変
- Codex の高優先度指摘 3 件が確定 → 次の microbatch でまとめて修正可能
- maintainability の指摘 3 件 (Filter tablist a11y / devlog reader 重複 / CampaignStatusCard 等の dead code) も次 batch 候補

## 4. Codex review report (full, verbatim)

```markdown
# Codex Independent Review — Hitori Media OS UI fidelity

## A. Blocking issues
None.

## B. High-priority fixes
- **Severity**: high
- **File**: `dashboard/src/app/page.tsx:45`
- **Issue**: Home CTA and task links are still hard-wired to `building-hitori-media-os`, so the dashboard points to a specific campaign even when the active dataset does not contain that slug. The same file repeats the assumption in task links and quick links.
- **Why it matters**: correctness / UX. On a different dataset this produces broken navigation or misleading “next action” links from the main dashboard.
- **Recommended fix**: derive the target publish-package/campaign link from fetched data (for example first active campaign, latest campaign with publish package, or hide the CTA when none exists) instead of hardcoding the sample slug.
- **Safe to patch now?**: yes.

- **Severity**: high
- **File**: `dashboard/src/app/publish/page.tsx:25`
- **Issue**: `/publish` falls back to a hardcoded `DEFAULT_SLUG = 'building-hitori-media-os'`. If that record is absent, the page degrades to a “not found” state instead of selecting a real campaign from the current dataset.
- **Why it matters**: correctness / route consistency. This keeps one core route tied to seed/demo data instead of the actual workspace contents.
- **Recommended fix**: choose the default from `campaignListQuery` results, or require an explicit `slug` and redirect/select the first available campaign server-side.
- **Safe to patch now?**: yes.

- **Severity**: high
- **File**: `dashboard/src/app/settings/page.tsx:71`
- **Issue**: Settings always renders a link to `/diagnostics`, but `dashboard/src/app/diagnostics/page.tsx:104` returns `notFound()` when `ENABLE_DIAGNOSTICS` is off.
- **Why it matters**: UX / route consistency. The UI exposes a guaranteed 404 path in production-safe flag configurations.
- **Recommended fix**: gate the action with `enableDiagnostics`, or render disabled copy explaining that diagnostics is dev-only when the flag is off.
- **Safe to patch now?**: yes.

## C. Medium-priority improvements
- **Severity**: medium
- **File**: `dashboard/src/components/visual-review/VisualAssetsFilterBar.tsx:39`
- **Issue**: The bucket pills are marked up as `role="tablist"` / `role="tab"` but do not implement tab semantics fully: no keyboard roving, no `aria-controls`, and no corresponding tabpanels.
- **Why it matters**: accessibility. Screen readers and keyboard users get tab semantics that are only partially true.
- **Recommended fix**: either convert this to a real tabs primitive using the existing shared `common/Tabs.tsx`, or simplify it to plain buttons in a list without tab roles.
- **Safe to patch now?**: yes.

- **Severity**: medium
- **File**: `dashboard/src/app/analytics/page.tsx:154`, `dashboard/src/app/activity-log/page.tsx:53`
- **Issue**: Devlog/frontmatter parsing and excerpt-building logic is duplicated across `/analytics` and `/activity-log`.
- **Why it matters**: maintainability. Small parsing-rule changes will drift across pages, and the duplicate filesystem readers are already conceptually the same concern.
- **Recommended fix**: extract a shared server-only helper for markdown log reading/parsing and let both routes consume it with page-specific limits.
- **Safe to patch now?**: yes.

- **Severity**: medium
- **File**: `dashboard/src/components/CampaignStatusCard.tsx:4`, `dashboard/src/components/WorkingPipelineStatus.tsx:38`
- **Issue**: These components appear to be dead code; repo search shows only their own export sites and no imports.
- **Why it matters**: maintainability. Keeping obsolete Phase 1 artifacts around makes future review harder and increases uncertainty about the true component surface.
- **Recommended fix**: verify in git history/branches if they are intentionally parked; if not, remove them in a cleanup microbatch and note it in handoff/devlog.
- **Safe to patch now?**: yes, after one final import check.

## D. Future considerations
- **Replace hardcoded localhost tool URLs** — Several routes still embed `http://localhost:3333` / `3334` directly; centralize these in config/env before wider team or non-default local setups. `Phase 2B`
- **Normalize table semantics across shared tables** — Shared data tables work visually, but a single table helper could standardize captions, `scope`, and action-column labeling. `Phase 2B`
- **Move visual-review filter state normalization server/client into one contract** — Current filter parsing is reasonable, but one shared schema would reduce drift as URL-driven filters expand. `Phase 2B`
- **Schema-enum hardening** — Status-to-badge mapping is mostly tolerant today; formalizing unknown-enum fallbacks across pages would make future schema additions safer. `Analytics / Generation`
- **Read-only contract test coverage** — Add lightweight checks that dashboard routes never render mutation controls beyond disabled placeholders and never expose secrets. `Write-actions prep`

## E. Explicitly OK
- `dashboard/src/app/api/asset-thumb/route.ts` — Prefix allowlist, traversal rejection, extension whitelist, 8MB cap, and local-FS flag gate all look sound.
- `dashboard/src/lib/inboxReader.ts` — Slug validation and inbox-root containment are consistently enforced before filesystem reads.
- `dashboard/src/components/common/Tabs.tsx` — The shared tabs primitive itself has proper ARIA wiring and keyboard support.
- `dashboard/src/components/app-shell/AppShell.tsx`, `Sidebar.tsx`, `Topbar.tsx` — Shared shell structure is consistent and route-wide layout reuse is clean.
- `dashboard/src/components/app-shell/ReadOnlyPill.tsx` — Read-only state is surfaced compactly without the old full-width banner regression.
- `dashboard/src/components/settings/FeatureFlagsCard.tsx` — It exposes env names and on/off state only; no secret values are leaked.
- `dashboard/src/app/publish-package/[slug]/page.tsx` — Large file, but I did not see a concrete security or runtime bug that would justify touching the boss-protected layout.
- `docs/handoff/latest.md:1` — Handoff mirror is current and aligned with the final ReadOnlyBanner cleanup state.
```

## 次の一手

1. **boss が review report を読む**:
   - B 3 件 (hardcoded `building-hitori-media-os` × 2 + /settings → /diagnostics dead link) を即対応するか確認
   - C 3 件 (Filter tablist a11y / devlog reader 重複 / dead code candidates) の優先度を判断
2. boss OK → **次 microbatch で B 3 件をまとめて修正** (Codex の "Safe to patch now: yes" が立っているため即着手可能)
3. その後の選択肢:
   - C 3 件を別 microbatch で
   - D 5 件は Phase 2B 議論時に再評価
   - dashboard/README.md 全体書き直し

## 発信ネタ候補

- 「Codex を独立 reviewer に走らせる」: Phase UI-fidelity 一巡を機に、Claude Code とは別の model に独立 review してもらうメリット、blind spot を見つける方法
- 「hardcoded sample slug をリリース前に発見」: 「building-hitori-media-os」が main code に embed されていることを独立 reviewer の目で気付けた話
- 「Codex CLI 0.120.0 + gpt-5.4 でフォールバック」: 最新 CLI と最新 model のバージョン整合性に振り回されない実用 tip
