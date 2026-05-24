# Handoff: Codex independent code review for UI fidelity cycle

Date: 2026-05-20

## 1. Task Goal

Phase UI-fidelity-1〜10 + cleanup 完了後の **独立 reviewer pass**。Codex CLI を read-only sandbox で走らせ、6 review scope (architecture / fidelity / security / TypeScript / a11y / maintainability) に対する findings を A/B/C/D/E バケットで分類。Review-only、コード変更ゼロ。

## 2. Constraints Followed

- ✅ Review only、コード変更なし
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ package 追加なし
- ✅ 23 routes 動作維持 (build green、unchanged)
- ✅ Codex は `--sandbox read-only` で実行、write 不可

## 3. Changed Files

### 新規 docs (3)

- `docs/devlog/0155-codex-code-review-ui-fidelity.md`
- `docs/handoff/0166-codex-code-review-ui-fidelity.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (なし)

dashboard / Sanity Studio / tools / schemas いずれも touch なし。

## 4. Summary of Changes

### 4-1. Codex review command used

```bash
# Prompt drafted to /tmp/codex-review-prompt.md (76 行、6 scope + A/B/C/D/E 構造)
codex exec -m gpt-5.4 --sandbox read-only --skip-git-repo-check - < /tmp/codex-review-prompt.md
```

- **CLI**: `codex-cli 0.120.0`
- **model**: `gpt-5.4` (default `gpt-5.5` は CLI 0.120.0 で互換性エラー、フォールバック)
- **sandbox**: `read-only` (Codex は write 不可)
- **skip-git-repo-check**: uncommitted 大量差分 (37 modified + 184 untracked) を許容
- **output**: 10,652 行 (大半は Codex の grep/read 動作ログ)、最終 review report は末尾 65 行に markdown 形式

### 4-2. Codex review summary

| Bucket | 件数 | Severity 内訳 |
|---|---|---|
| A. Blocking issues | **0** | — |
| B. High-priority fixes | **3** | high × 3 |
| C. Medium-priority improvements | **3** | medium × 3 |
| D. Future considerations | 5 | Phase 2B × 3 / Analytics × 1 / Write-actions prep × 1 |
| E. Explicitly OK | 8 | — |

### 4-3. Blocking issues

**None.** ✓ 23 routes が production deploy 安全な状態。

### 4-4. High-priority fixes (B)

| # | File | Issue | Safe to patch now |
|---|---|---|---|
| B1 | `dashboard/src/app/page.tsx:45` | Home CTA / task links が `building-hitori-media-os` 直書き、他 dataset で broken nav | yes |
| B2 | `dashboard/src/app/publish/page.tsx:25` | `/publish` の `DEFAULT_SLUG = 'building-hitori-media-os'` 直書き、record 不在で degrade | yes |
| B3 | `dashboard/src/app/settings/page.tsx:71` | `/settings` から `/diagnostics` への link が、`ENABLE_DIAGNOSTICS=false` 時に 404 を保証する | yes |

**共通テーマ**: production deploy で boss 以外の workspace を見るときに UI が壊れる "demo data hardcoding" 問題。即対応推奨 (Codex が 3 件すべてに "Safe to patch now: yes" を立てている)。

### 4-5. Medium-priority improvements (C)

| # | File | Issue | Safe to patch now |
|---|---|---|---|
| C1 | `dashboard/src/components/visual-review/VisualAssetsFilterBar.tsx:39` | bucket pills が `role="tablist" / role="tab"` だが tabpanel / aria-controls / keyboard roving 不在 | yes |
| C2 | `dashboard/src/app/analytics/page.tsx:154` + `activity-log/page.tsx:53` | devlog frontmatter parsing + excerpt build logic が 2 page で重複 | yes |
| C3 | `dashboard/src/components/CampaignStatusCard.tsx:4` + `WorkingPipelineStatus.tsx:38` | import 0 の可能性 (dead code candidate)、要再 grep | yes (after final import check) |

C3 は Phase Admin 1 Batch A/B/C 時代 component audit の入口、boss が以前 §9 で挙げていた candidate list と重複。

### 4-6. Future considerations (D)

1. **Hardcoded localhost tool URLs を config に集約** — `http://localhost:3333` / `3334` を env に。Phase 2B
2. **Shared table helper** — 各 table の caption / scope / action column を共通化。Phase 2B
3. **Visual-review filter state schema 統一** — URL-driven filter が複数 page に増えたときの drift 防止。Phase 2B
4. **Schema-enum unknown fallback の formalization** — Sanity schema 追加時の安全性向上。Analytics / Generation
5. **Read-only contract test coverage** — write controls が disabled placeholder 以外で render されないこと + secret 非表示を自動テスト。Write-actions prep

### 4-7. Explicitly OK (E) — 8 件 verified

- `/api/asset-thumb/route.ts` — Prefix allowlist / traversal rejection / extension whitelist / 8MB cap / FS flag gating
- `lib/inboxReader.ts` — Slug validation + inbox-root containment
- `common/Tabs.tsx` — Shared tabs primitive の ARIA + keyboard
- `app-shell/AppShell.tsx + Sidebar.tsx + Topbar.tsx` — shell 構造の一貫性
- `app-shell/ReadOnlyPill.tsx` — 旧 full-width banner regression なし
- `settings/FeatureFlagsCard.tsx` — env name + on/off のみ、secret 漏洩なし
- `app/publish-package/[slug]/page.tsx` — 740 行だが security / runtime bug なし (boss-protected layout 維持で OK)
- `docs/handoff/latest.md` — mirror が ReadOnlyBanner cleanup と整合

### 4-8. Build validation

```
cd dashboard && npm run build  → ✓ TypeScript clean, 23 routes (unchanged)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (unchanged)
```

両 build とも前 batch (handoff/0165) 完了時から不変、review-only batch であることを確認。

## 5. Key Decisions

- **Codex CLI を `--sandbox read-only` で**: Codex が誤って `apply` で patch しないよう安全側、review-only を CLI レベルで強制
- **`-m gpt-5.4` フォールバック**: CLI 0.120.0 の default `gpt-5.5` は API 側で「newer CLI required」エラー。boss が image generation で使ってきた gpt-5.4 にフォールバックして成功
- **A/B/C/D/E 強制 bucket**: Codex の自由形式 review より、構造化されたほうが boss が即「fix する / 後回し」判断しやすい
- **「Safe to patch now?」フィールド**: 各 finding に boss action の意思決定情報を Codex に書かせた
- **/publish-package/[slug] の boss-protected 旨を prompt で明示**: 740 行を refactor する noise 提案を防止、Codex は適切に「concrete bug なし」と判定
- **shadcn 禁止 + Phase 2B scope 外を prompt で明示**: Codex の training data からのノイズ提案を防止
- **Codex はあくまで independent reviewer、findings の取捨選択は boss + Claude Code**: dual-reviewer pattern の原則 (handoff/0152 §3)

## 6. Human Review Questions

1. **B 3 件すべて即対応するか?** すべて "Safe to patch now: yes"、次 microbatch 候補
2. **B1 / B2 の対応戦略**:
   - Option A: 「最初の campaign」を server-side で fetch して default に
   - Option B: dataset が空のとき empty state に分岐
   - Option C: building-hitori-media-os が存在しない workspace で boss が deploy しない前提なら現状維持
3. **B3 の対応**: `enableDiagnostics` で /settings の link を gate (推奨) か、disabled state でも常時表示か
4. **C1 (FilterBar a11y) の修正方針**: `common/Tabs.tsx` に full 移行 / plain buttons in list に simplify、どちらが UX 望ましいか
5. **C2 (devlog reader 共通化)**: `lib/devlog/readDocs.ts` に extract で OK か
6. **C3 (dead code candidates)**: 本 batch で grep 確認するか、Phase Admin 1 component audit batch でまとめて確認するか
7. **D 5 件**: いずれも Phase 2B / Analytics / Write-actions prep tagged、本 batch では deferred で良いか

## 7. Risks or Uncertainties

- **Codex `gpt-5.4` の品質**: gpt-5.5 が使えなかったため最新 model ではない、ただし review report は具体的で file/line 引用も正確。判断材料として十分
- **Codex の `--sandbox read-only` 動作**: read-only でも grep / read は可能、本来の review に必要な動作はカバーされた
- **review output が 10,652 行と長い**: 末尾 65 行が実 report、他は Codex の動作ログ。devlog / handoff には report 部分のみ転記
- **Codex の dead code 判定**: `CampaignStatusCard` / `WorkingPipelineStatus` のみ言及、boss が以前挙げた 12 件 list の他は触れず。次 audit batch で全 12 件を確認推奨
- **「Safe to patch now: yes」を Codex が立てたが**: 実装時に副作用がないか Claude Code (or boss) で再確認推奨。例えば B1 の修正は Home page の他箇所への波及がある可能性

## 8. Remaining Gaps

- B 3 件、C 3 件の修正 — 次 microbatch
- D 5 件 — Phase 2B 議論時に再評価
- 上記以外の Phase Admin 1 Batch A/B/C component audit (CampaignStatusCard 以外も含む 12 件 list)
- dashboard/README.md 全体書き直し
- Phase 2B 実 write actions の方針確定

## 9. Recommended Next Microbatch

**Option A (推奨) — Fix B 3 件 microbatch**

```text
Apply Codex high-priority fixes (B1, B2, B3).

Use:
- docs/handoff/0166-codex-code-review-ui-fidelity.md (Codex findings)
- handoff §4-4 で詳細 file/line + recommended fix

Hard Rules:
- Do NOT modify Sanity schema / publish-package / assets/visuals / patches
- Do NOT add packages, no deploy
- 23 routes 動作維持

Tasks:
1. B1 (page.tsx:45): Derive Home CTA / task links from fetched data (例: 最初の active campaign)、building-hitori-media-os hardcoding を排除
2. B2 (publish/page.tsx:25): Default slug を campaignListQuery results から選ぶ、または slug 未指定時に redirect
3. B3 (settings/page.tsx:71): /diagnostics link を enableDiagnostics で gate、off 時は disabled copy
4. cd dashboard && npm run build (23 routes 維持)
5. npm run build (Sanity Studio clean)
6. docs/devlog/0156-codex-b-fixes-applied.md + docs/handoff/0167 + latest mirror
```

**Option B — C 3 件 microbatch を先 / B と同時**

C1 (FilterBar a11y) + C2 (devlog reader 共通化) + C3 (dead code 確認) を独立 PR で、or B と同 PR で。

**Option C — Phase Admin 1 Batch A/B/C component audit (C3 含む拡張)**

Codex が言及した 2 件 + boss が以前挙げた 10 件 list を一括 grep audit。

**Option D — Phase 2B 議論**

D 5 件 + 実 write actions の方針確定。
