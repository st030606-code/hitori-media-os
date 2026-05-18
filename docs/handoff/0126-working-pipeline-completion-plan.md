# Handoff: Hitori Media OS Working Pipeline Completion Plan (plan only)

Date: 2026-05-18
Status: **plan-only / 0 image generation / 0 schema change / 0 sanity write / 0 deploy / 0 candidate PNG modified / phase-admin-2a-1 still in place**

## 1. Task Goal

visual quality 改善ループから抜け、**Hitori Media OS の publish pipeline を 1 周通して完走** させる計画を固定する。candidate generation → review → approve/register → Sanity 反映 → publish package → manual publish 準備までの exact チェックリストを書き、boss が次の implementation batch から無迷いで進められる状態にする。

## 2. Constraints Followed

- 画像生成: **0**
- candidate PNG 編集 / 削除 / 上書き: **0**（既存 7 件全て byte-identical）
- prompt.md / review.md 編集: **0**
- review-manifest.json 編集: **0**
- `assets/visuals/` / `patches/` / Sanity / publish-packages: **不変**
- schema / sanity.config / dashboard runtime / proxy.ts: **不変**
- 新規パッケージ追加: **0**
- production env vars / Vercel UI / deploy: **0**
- Codex CLI 起動 / paid LLM-image API client: **0**
- Auth 実装 / 変更: **0**
- `.env*` を inspect / 出力: **0**
- secret 値を log / docs に書き残し: **0**

## 3. Changed Files

### Added — `docs/`

- `docs/67-hitori-media-os-working-pipeline-completion-plan.md`（15 sections、working pipeline 完成計画本体）
- `docs/devlog/0115-working-pipeline-completion-plan.md`
- `docs/handoff/0126-working-pipeline-completion-plan.md`（本ファイル）

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0126 のミラー）

### Confirmed unchanged

- candidate PNG bytes（既存 7 件）:

  | File | Bytes |
  | --- | --- |
  | threads-support-diagram-v1/v001.png | 1,117,386 |
  | threads-support-diagram-v1/v002.png | 1,170,769 |
  | threads-support-diagram-v1/v003.png | 1,155,943 |
  | note-inline-content-os-flow-v1/v001.png | 1,019,508 |
  | note-inline-content-os-flow-v1/v002.png | 1,234,530 |
  | note-inline-content-os-flow-v1/v003.png | 1,078,958 |
  | note-inline-content-os-flow-v1/v004.png | 1,234,240 |

- すべての prompt.md / review.md / review-manifest.json（本 batch では非編集）
- schemas / sanity.config / structure / proxy.ts / featureFlags / dashboard/src/
- root + dashboard `package.json` / `package-lock.json`
- `assets/visuals/`（`shared/campaign-hero-v1.png` + `x/hook/x-hook-main-v1.png` のみ）
- `patches/visual-assets/`（`note-hero-v1.json` + `x-hook-main-v1.json` のみ）
- `seed/` / `outputs/` / `publish-packages/` / `private/`
- Sanity dataset / Vercel project / DNS / production env vars
- POTA_Empire/.git / 兄弟 POTA project
- `dashboard/public/activity-snapshot.json`

## 4. Working pipeline 定義

"Working" = 「Hitori Media OS の 1 campaign が **実際に publish できる** 状態」。7 必須条件:

1. 全 9 visualAssetPlan が `saved` か `skipped`（Sanity）
2. 各 saved の `localAssetPath` が実在 `assets/visuals/.../*.png` を指す
3. `patches/visual-assets/.../*.json` 全件揃う
4. `npm run publish:package -- building-hitori-media-os` が dry-run + actual 成功
5. `publish-packages/<platform>/.../` に X / note / Substack / Threads 4 platform 分の image + text 揃う
6. release-review 5 markdown 更新済
7. `final-human-checklist.md` に boss 署名 + 公開予定日

採用ライン: self-rubric **24 / 35**（35/35 必須でない）。

## 5. Deferred visual quality improvements（明示繰り下げ）

| 項目 | 次の phase |
| --- | --- |
| プロ illustrator 品質 | Visual Engine Improvement Phase |
| Design Profile system（schema 化） | Phase 2C / 2D |
| advanced layout selector（dashboard UI） | Phase 2B |
| image model / provider 最適化 | Visual Engine Improvement Phase |
| SaaS-grade generation engine | Phase 2D |
| AI auto-approval / auto-review | 永続 deferred |
| auto-posting / 半自動 publish | 永続 deferred |
| paid LLM / image API integration | 永続 deferred |
| Auth migration（Basic → real） | Phase 2C 着手前、docs/68 候補 |

## 6. Remaining visual assets（9 record、本フェーズ後ターゲット状態）

| _id | 期待 status | 期待 localAssetPath | 経路 |
| --- | --- | --- | --- |
| note-hero-v1 | saved | shared/campaign-hero-v1.png | Sanity 反映のみ（PNG + patch 既存） |
| substack-header-v1 | saved | shared/campaign-hero-v1.png（共有） | Visual Register で patch 生成 → Sanity 反映 |
| x-hook-main-v1 | saved | x/hook/x-hook-main-v1.png | Sanity 反映のみ |
| threads-support-diagram-v1 | saved | threads/support/threads-support-diagram-v1.png | **v004 生成** → approve → Sanity 反映 |
| note-inline-content-os-flow-v1 | saved | note/inline/note-inline-content-os-flow-v1.png | 既存 **v004** を approve → Sanity 反映 |
| note-inline-human-judgment-v1 | saved | note/inline/note-inline-human-judgment-v1.png | **v001 生成** → approve → Sanity 反映 |
| note-inline-manual-vs-automation-v1 | **skipped** | （無し） | Sanity Studio で status のみ更新 |
| note-inline-publish-package-folder-v1 | **skipped** | （無し） | 同上 |
| substack-inline-reader-system-v1 | saved | substack/inline/substack-inline-reader-system-v1.png | **v001 生成** → approve → Sanity 反映 |

→ 7 saved + 2 skipped = pipeline working state。

## 7. Generation sequence (A → B → C)

### A. threads-support-diagram-v1 v004 only

- platform: threads, aspect 4:5, pixelSize 1080 × 1350
- variant: japanese-editorial-v1
- recommended layout: Problem-to-system or Editorial explainer
- Japanese-first labels: 発信のタネ / 仕組み / 自動化は最後 / 発信を頑張るより、仕組みを作る / X / note / Substack / Threads
- 出力 path: `assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/v004.png`
- 既存 v001/v002/v003 上書き禁止
- 5 min cap、1 candidate のみ
- prompt.md / review.md 既存（frontmatter contract 適用済）

### B. note-inline-human-judgment-v1 v001 only

- platform: note, aspect 16:9, pixelSize 1600 × 900
- variant: japanese-editorial-v1
- recommended layout: Human review journey or Before/After
- Japanese-first labels: AI下書き / 人間が整える / 図解を選ぶ / 最後は手動公開 / 人間が選ぶ / 自動化は最後
- reader outcome 候補: 「AIに任せきりにせず、人間判断を残す。」
- 出力 path: `assets/inbox/generated/building-hitori-media-os/note-inline-human-judgment-v1/v001.png`
- 5 min cap、1 candidate のみ
- prompt.md / review.md は **未存在** → 生成 batch 内で frontmatter contract に準拠して作成

### C. substack-inline-reader-system-v1 v001 only

- platform: substack, aspect 16:9, pixelSize 1600 × 900
- variant: japanese-editorial-v1
- recommended layout: Reader-list funnel or Media distribution map
- Japanese-first labels: 発見の場 / 購読のリスト / 蓄積のアーカイブ / X・Threads / Substack / note / 読者を捕まえる導線
- reader outcome 候補: 「発信先を役割で分けると、購読が積み上がる。」
- 出力 path: `assets/inbox/generated/building-hitori-media-os/substack-inline-reader-system-v1/v001.png`
- 5 min cap、1 candidate のみ
- prompt.md / review.md は **未存在** → 生成 batch 内で frontmatter contract に準拠して作成

### 各 candidate の共通 hard rules

- 1 candidate のみ
- 5 分上限
- 既存 PNG 上書き禁止
- `assets/visuals/` 書き込み禁止 / `patches/` 書き込み禁止 / Sanity write 禁止
- deploy / auto-post / paid API 禁止
- 生成後 dashboard `/visual-assets/<id>/candidates` で表示確認
- 生成後 `git diff --stat` で `assets/inbox/...` 以外不変を確認
- [docs/66 §5](../66-japanese-visual-generation-quality-upgrade.md#5-pre-generation-visual-rough-step) Visual Rough を 1 度書き、7-point self-check pass 後に image_gen

## 8. Approve / Register sequence

Visual Register（`npm run visual:register`、localhost:3334）で 5 件 approve（共有 1 件含む）:

| 順 | Asset | 採用候補 | 出力 patch | 出力 final |
| --- | --- | --- | --- | --- |
| 1 | note-inline-content-os-flow-v1 | **v004** | `patches/.../note-inline-content-os-flow-v1.json` | `assets/visuals/.../note/inline/note-inline-content-os-flow-v1.png` |
| 2 | threads-support-diagram-v1 | v004 ※生成後判定 | `patches/.../threads-support-diagram-v1.json` | `assets/visuals/.../threads/support/threads-support-diagram-v1.png` |
| 3 | note-inline-human-judgment-v1 | v001 ※生成後判定 | `patches/.../note-inline-human-judgment-v1.json` | `assets/visuals/.../note/inline/note-inline-human-judgment-v1.png` |
| 4 | substack-inline-reader-system-v1 | v001 ※生成後判定 | `patches/.../substack-inline-reader-system-v1.json` | `assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png` |
| 5 | substack-header-v1（共有） | `campaign-hero-v1.png` 流用 | `patches/.../substack-header-v1.json` | shared/campaign-hero-v1.png（既存、新規コピーなし） |

各 step 後の verify:

- final PNG 存在 + size > 0
- patch JSON の `.set.localAssetPath` が期待 path
- `review-manifest.json` で該当 candidate が `reviewStatus: registered`
- dashboard `/visual-assets/<id>` で "current final path" 表示
- `/api/asset-thumb?path=<final path>` が 200 image/png

## 9. Sanity reflection checklist（手動、boss が Sanity Studio で実行）

各 visualAssetPlan で更新する fields:

```yaml
localAssetPath: <final path>
status: saved   # または skipped (2 record のみ)
reviewNotes: |
  <Codex self-review score + 採用理由 / または "本フェーズでは保留、Visual Engine Improvement Phase で再評価">
updatedAt: <ISO 8601 timestamp>
```

更新対象 9 record:

- saved: note-hero-v1 / substack-header-v1 / x-hook-main-v1 / threads-support-diagram-v1 / note-inline-content-os-flow-v1 / note-inline-human-judgment-v1 / substack-inline-reader-system-v1
- skipped: note-inline-manual-vs-automation-v1 / note-inline-publish-package-folder-v1

更新後の確認:

- Sanity Studio listing で全 9 record の status / localAssetPath 反映
- dashboard `/visual-assets` listing で Done バケット 7 件 + Skipped 2 件表示

**本 batch では Sanity write しない**、boss が手動で Studio 編集。

## 10. Publish-package checklist

### dry-run

```bash
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os
npm run publish:package -- building-hitori-media-os --dry-run
```

期待: image copy 計画 7 件 + text draft markdown copy 計画。skipped 2 件は除外される。

### actual

```bash
npm run publish:package -- building-hitori-media-os
```

期待:

- `publish-packages/note/building-hitori-media-os/images/` に hero + 2 inline
- `publish-packages/substack/building-hitori-media-os/images/` に header (shared) + 1 inline
- `publish-packages/x/building-hitori-media-os/images/` に x-hook-main-v1
- `publish-packages/threads/building-hitori-media-os/images/` に threads-support-diagram-v1
- 各 platform に text draft markdown copy

dry-run vs actual で不一致があれば Sanity 反映ミスを疑う、再 publish-package 実行。

## 11. Release review checklist updates

### 11.1 5 file 更新

| File | 主な更新 |
| --- | --- |
| `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md` | 全 visualAssetPlan 採用済 + publish-package 配布済 + 公開 readiness 全 check |
| `x-final-review.md` | x-hook-main-v1 採用済、hook copy 最終確認、X main + thread 最終確認 |
| `threads-final-review.md` | threads-support-diagram-v1 採用済（v004 採用 + reason）、Threads main + replies 最終確認 |
| `note-final-review.md` | note-hero + 2 inline 採用済（保留 2 件は明記）、本文最終確認 |
| `substack-final-review.md` | substack-header（master sharing） + 1 inline 採用済、essay 最終確認 |

### 11.2 各 file の 3 軸 checklist

```markdown
## Visual assets
- [x] hero / header / inline 採用済
- [x] localAssetPath が assets/visuals/... を指す
- [x] publish-packages/... に copy 済
- [x] Codex self-review ≥ 24/35

## Text draft
- [x] outputs/<platform>/...md 確定
- [x] redact 必要なし
- [x] reader 視点で読み返し済

## Manual publish readiness
- [x] アカウント open
- [x] 公開日時の予定
- [x] post-publication-log-template.md 準備済
```

### 11.3 final-human-checklist の最終 OK

`final-human-checklist.md` に boss が手書き署名 + 公開予定日。その時点で **"working pipeline complete"**。

## 12. Validation Results

実行結果（2026-05-18 JST）:

| Check | Result |
| --- | --- |
| `npm run local:check` | **17 ok / 0 fail** |
| root `npm run build`（Sanity Studio） | **green** |
| `cd dashboard && npm run build` | **green**（12 page + 5 API route + Proxy、Phase 2A-1 routes 不変） |
| `git diff --stat`（schemas / dashboard / tools / proxy.ts / patches / Sanity） | **0 件**（本 batch は docs のみ） |
| direct Sanity write grep | **0 hits** |
| paid LLM / image API SDK grep | **0 hits** |
| 新規 package | **0 件** |
| candidate PNG byte size 不変 | **7/7 confirmed** |
| 既存 prompt.md / review.md 不変 | **4 file × 2 type すべて touched 0 回** |

詳細は本 handoff §17 で実行ログを記録。

## 13. Important Decisions

- **visual 品質より pipeline 完走を優先**（採用ライン 24/35）
- 保留 2 record（manual-vs-automation, publish-package-folder）を `skipped` で公開許容
- 採用済 5 record（note-hero, substack-header, x-hook-main, note-inline-content-os-flow v004, master shared）は **再生成しない**
- 残り 3 record を 1 candidate / 5 min cap で生成（A: threads-support v004, B: note-inline-human-judgment v001, C: substack-inline-reader-system v001）
- ループ禁止: 1 asset に 5 candidate 上限、無限改善ループ防止
- Sanity 反映は **手動チェックリスト**（dashboard write は Phase 2B / 2C）
- publish-package は dry-run → actual の 2 段
- release-review 5 file を 3 軸 checklist で完結、boss 署名で working pipeline complete
- Visual Engine Improvement / Phase 2B / Auth migration / SaaS は明示繰り下げ

## 14. Human Review Questions

- Working pipeline 完成計画（docs/67）の方針は OK か？
- 保留 2 record（manual-vs-automation / publish-package-folder）を `skipped` 扱いで本 campaign を公開する判断で良いか？
- 生成シーケンス A → B → C の順序は妥当か？（推奨は dashboard 内で見比べやすい threads-support から）
- 採用ライン 24/35 で十分か？ もっと高くする必要があるか？
- 保留 2 record を **後で必ず作る** という宿題リストに残すか、completely defer か？
- Visual Engine Improvement Phase の trigger 条件は何にするか？（例: 「1 campaign 完走後 + boss が 1 ヶ月運用」）
- Auth migration design (docs/68 候補) を Visual Engine Improvement Phase の前後どちらに置くか？

## 15. Next Exact Prompt（次のバッチ）

```text
Generate threads-support-diagram-v1 v004 only.

Hard Rules:
- Generate only 1 candidate in this batch.
- Do NOT overwrite v001.png / v002.png / v003.png.
- Do NOT write directly to assets/visuals/.
- Do NOT create patches.
- Do NOT write to Sanity.
- Do NOT mutate Sanity data.
- Do NOT deploy.
- Do NOT modify production env vars.
- Do NOT modify dashboard runtime behavior.
- Do NOT fake placeholder images.
- Do NOT auto-post.
- Do NOT add paid API integrations.
- Stop if generation hangs for more than 5 minutes.
- Do NOT proceed to v005 or approval/register without human instruction.

Target:
- assetSlug: threads-support-diagram-v1
- candidate: v004.png
- variant: japanese-editorial-v1
- platform: threads
- assetPurpose: paired-post-visual
- aspectRatio: 4:5
- pixelSize: 1080x1350

Use:
- docs/66-japanese-visual-generation-quality-upgrade.md §7 (Japanese Editorial Diagram Prompt Block v1)
- docs/67-hitori-media-os-working-pipeline-completion-plan.md §5.1.A
- assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/prompt.md (existing frontmatter)
- assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png (style anchor)
- assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png (style anchor)

Theme:
「発信を頑張るより、仕組みを作る。」
Threads main post 用、4:5 portrait の縦長 supporting visual。

Required Japanese labels (Japanese-first, English supporting tags only):
- 発信のタネ
- 仕組み（または 仕組みを作る）
- 自動化は最後
- 「発信を頑張るより、仕組みを作る。」 (headline 2-line)
- 媒体名 (X / note / Substack / Threads)

Required visual elements:
- headline + subhead 日本語
- ≥ 3 visual modules
- ≥ 3 icons / illustrations
- connectors / arrows
- principle badge 「自動化は最後」
- reader outcome box (e.g. 「発信が、毎回の頑張りから仕組みに変わる。」)
- whitespace + 4-level hierarchy
- ONE warm amber accent

Recommended layout: Problem-to-system or Editorial explainer
(縦長 portrait に適した、上部主張 + 中部 / 下部に小さめの構造図)

Output path:
- assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/v004.png

Before image_gen:
1. Write a Visual Rough (docs/66 §5.1 11-field format)
2. Pass the 7-point self-check (docs/66 §5.2)
3. Only then call image_gen

After generation:
1. Confirm v004.png exists.
2. Report dimensions / file size / accent color.
3. Visual description.
4. Japanese-first check: japanese >> english labels.
5. Visual richness check (7 must-haves).
6. Compare against v001/v002/v003 on the 7-rubric axes.
7. Confirm dashboard candidate API can see candidates=4 at:
   /api/visual-review/assets/visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1/candidates
8. Confirm candidate page renders v001/v002/v003/v004.
9. Confirm assets/visuals / patches / Sanity / docs untouched.
10. Recommend: adopt v004, regenerate, or keep an earlier candidate.
11. Update prompt.md `candidateStrategy` to append v004 entry (minimal generation result record).
```

## 16. Is the working pipeline completion plan ready?

**Yes**:

- 15 sections の plan doc が docs/67 に揃っている
- "Working" 7 必須条件 + 採用ライン 24/35
- 9 record の本フェーズ後ターゲット状態 table
- 3 件の generation sequence + 各 hard rules
- approve / register / Sanity reflect / publish-package / release-review の全 checklist
- Out of scope（defer 9 項目）を明示
- 完了基準 10 件
- Next exact prompt (§15)

**Working pipeline 完成計画は本 batch で確定**。次のバッチで A (threads-support v004) から実行。

## 17. Local validation runs

実行結果（2026-05-18 JST）:

- `npm run local:check`: **17 ok / 0 fail**
- root `npm run build`（Sanity Studio）: **green** (7389ms)
- `cd dashboard && npm run build`: **green**（12 page + 5 API route + Proxy middleware、Phase 2A-1 routes 不変）
- candidate PNG byte size 不変: **7/7 confirmed**
- `assets/visuals/` 変更: **0**
- `patches/visual-assets/` 変更: **0**
- prompt.md / review.md / review-manifest.json 変更: **0**
- 新規 package: **0**
- direct Sanity write grep: **0 hits**
- paid LLM/image API SDK grep: **0 hits**

## 18. Recommended Next Step

### Immediate (this batch)

本 batch を commit + push:

```bash
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os

git status --short
git add docs/67-hitori-media-os-working-pipeline-completion-plan.md \
        docs/devlog/0115-working-pipeline-completion-plan.md \
        docs/handoff/0126-working-pipeline-completion-plan.md \
        docs/handoff/latest.md

git diff --staged --stat
git commit -m "plan: working pipeline completion (visual quality vs publish)"
git push
```

### Next Implementation Batch

**A. Generate threads-support-diagram-v1 v004 only** ✓ 最優先

- 本 doc §15 の exact prompt をそのまま使う
- 5 min cap、1 candidate のみ
- 既存 v001-v003 上書き禁止
- 生成後 dashboard で 4 candidates 並びを確認、採用判断

その後の順序:

1. **B. note-inline-human-judgment-v1 v001 only**（A 採用後）
2. **C. substack-inline-reader-system-v1 v001 only**（B 採用後）
3. **D. Visual Register で 5 件 approve & register**（boss 手動）
4. **E. Sanity Studio で 9 record 反映**（boss 手動）
5. **F. publish-package dry-run + actual**（boss CLI）
6. **G. release-review 5 markdown 更新 + final-human-checklist 署名**（boss 手動）

### Deferred（永続）

- paid LLM / image API integration
- auto-posting
- AI auto-approval
- multi-user collaboration（Phase 2D 以降）
- billing / paid tier

## 19. 連番について

- docs: 66 → **67**（Auth migration design は docs/68 候補へ繰り下げ）
- devlog: 0114 → **0115**
- handoff: 0125 → **0126**
