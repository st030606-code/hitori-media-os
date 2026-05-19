# Handoff: Inbox Candidate Frontmatter (Phase 2A prerequisite mini-batch)

Date: 2026-05-18
Status: **applied / 4 inbox markdown files updated / candidate PNG unchanged / 0 schema change / 0 sanity write / 0 deploy / phase-admin-1-still-in-production**

## 1. Task Goal

Phase Admin 2A の dashboard candidate review 実装着手前に、**既存 inbox の prompt.md / review.md に構造化 YAML frontmatter を加える** 前段 mini-batch。docs/65 に parser contract を確定し、Phase 2A-1 で実装される dashboard parser の **唯一の入力契約** にする。

## 2. Constraints Followed

- candidate PNG を編集していない、上書きしていない
- `assets/visuals/` (final asset paths) 不変
- `patches/visual-assets/` 不変
- Sanity mutation: 0
- 画像生成 / Codex CLI 起動: 0
- 新規パッケージ追加: 0
- dashboard runtime / route / API / component の変更: 0
- production env vars / Vercel UI 操作: 0
- schemas 変更 / activate: 0
- Visual Register / `tools/*` の挙動: 不変
- Auth 実装 / 変更: 0（Basic Auth のまま）
- `.env*` を inspect / 出力していない
- secret 値を log / docs に書き残していない

## 3. Changed Files

### Modified — `assets/inbox/generated/building-hitori-media-os/`

各ファイルの **本文（body）は完全保存**、frontmatter のみ先頭に prepend:

- `threads-support-diagram-v1/prompt.md`
- `threads-support-diagram-v1/review.md`
- `note-inline-content-os-flow-v1/prompt.md`
- `note-inline-content-os-flow-v1/review.md`

### Added — `docs/`

- `docs/65-inbox-candidate-frontmatter-contract.md`（parser contract、11 sections）
- `docs/devlog/0112-inbox-candidate-frontmatter.md`
- `docs/handoff/0123-inbox-candidate-frontmatter.md`（本ファイル）

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0123 のミラー）

### Confirmed unchanged

- candidate PNG: threads-support-diagram-v1/v001.png / v002.png / v003.png（byte size 不変）
- note-inline-content-os-flow-v1/ には PNG が **そもそも存在しない**（生成は別 batch、本 batch では作らない）
- schemas / dashboard / tools / sanity.config / structure / proxy.ts / featureFlags.ts
- assets/visuals / patches / seed / outputs / publish-packages / private
- Sanity dataset / Vercel project / DNS / production env vars
- POTA_Empire/.git / 兄弟 POTA project
- `dashboard/public/activity-snapshot.json`

## 4. Frontmatter Fields Added

### 4.1 `prompt.md` 共通スキーマ（必須）

| field | 値 |
| --- | --- |
| campaignSlug | `building-hitori-media-os` |
| assetSlug | folder 名と一致 |
| visualAssetPlanId | `visualAssetPlan.<campaign>.<asset>` |
| assetPurpose | asset 役割タグ |
| platform | `threads` / `note` 等 |
| aspectRatio | `4:5` / `16:9` |
| candidateStrategy | `[{id, variant}]` × 3 件 |

推奨 fields: `pixelSize`, `styleAnchors`, `layoutPatterns`, `requiredVisualModules`, `forbiddenPatterns`, `phase`.

### 4.2 `review.md` 共通スキーマ（必須）

| field | 値 |
| --- | --- |
| campaignSlug / assetSlug / visualAssetPlanId | 同上 |
| reviewStatus | `candidate-review` |
| rubricScale | `1-5` |
| rubricMaxScore | `35` |
| rubricAxes | 7 axes（camelCase） |
| candidateScores | `{v001, v002, v003}` object, each with variant/score/notes |

推奨 fields: `recommendedCandidate`, `humanDecision`, `phase`.

### 4.3 適用差分（asset 別）

| | threads-support-diagram-v1 | note-inline-content-os-flow-v1 |
| --- | --- | --- |
| platform | threads | note |
| aspectRatio | 4:5 | 16:9 |
| pixelSize | 1080x1350 | 1600x900 |
| assetPurpose | social-support-diagram | inline-diagram |
| layoutPatterns | centralHeroFourCards / hubAndSpoke / workflowPipeline | contentOSFlow / mediaDistributionMap / workflowPipeline / humanReviewFlow |
| requiredVisualModules | headline / centralNode / supportNodes / connectors / platformCards / summaryCopy | headline / centralNode / branchNodes / connectors / humanReviewCheckpoint / publishPackageBlock / principleBadge |

forbiddenPatterns 4 件は両 asset で共通。

## 5. Parser Contract — docs/65

[docs/65](../65-inbox-candidate-frontmatter-contract.md) で以下を確定:

- `prompt.md` frontmatter schema（§2、必須 7 + 推奨 6 + 任意 4 fields）
- `review.md` frontmatter schema（§3、必須 8 + 推奨 3 + 任意 2 fields）
- dashboard Phase 2A での parse 方法（§4、minimal splitter + YAML parse）
- graceful degrade ルール（§5、abort せず continue + warning）
- future `visualCandidate` schema との 1-to-1 mapping（§7）
- 適用ガイドライン（§8、新 asset 生成時の手順）

## 6. Candidate PNG / Assets / Patches — 不変確認

| 確認対象 | 結果 |
| --- | --- |
| `assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/v001.png` | 1,117,386 bytes（前 batch と同じ） |
| `assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/v002.png` | 1,170,769 bytes（前 batch と同じ） |
| `assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/v003.png` | 1,155,943 bytes（前 batch と同じ） |
| `assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/*.png` | 0 件のまま |
| `assets/visuals/building-hitori-media-os/` | shared / x のみ（変更なし） |
| `patches/visual-assets/building-hitori-media-os/` | note-hero-v1.json / x-hook-main-v1.json のみ |
| Sanity mutation | 0 件 |

→ 本 batch は **prompt.md / review.md の md ファイル 4 件だけ**を編集、それ以外は touch していない。

## 7. Validation Results

実行結果（2026-05-18 JST）:

| Check | Result |
| --- | --- |
| `npm run local:check` | **17 ok / 0 fail**（後段 §10 で実行） |
| root `npm run build`（Sanity Studio） | **green**（後段 §10 で実行） |
| `cd dashboard && npm run build` | **green**（後段 §10 で実行、既存 8 page route + asset-thumb + Proxy のみ） |
| YAML frontmatter parse（python3 yaml.safe_load × 4 file） | **all pass** |
| candidate PNG byte size 不変 | **3 件すべて不変** |
| `git diff --stat` の inbox 4 file 以外（コード / schema / assets/visuals / patches） | **0 件** |
| direct Sanity write grep | **0 hits** |
| paid LLM / image API SDK grep | **0 hits** |
| 新規 package | **0 件** |

→ 詳細は本 handoff §10 で実行ログを記録。

## 8. Important Decisions

- frontmatter は **Edit tool で prepend**（body 保存）、Write による file 再生成を避けた → git diff が "frontmatter 追加" だけに絞られる
- `null` を必須 fields に許容（`score`, `recommendedCandidate`, `humanDecision`）→ 未完了状態でも contract に整合
- `phase: phase-admin-2a-prep` field を入れた → 本 frontmatter の "最終 format 元 phase" を 1 行で残す
- graceful degrade ルール（§5）を parser 実装より先に固定 → 壊れた frontmatter で dashboard が壊れない不変条件
- contract（docs/65）を **dashboard parser 実装の唯一の reference** に → parser を後で書くとき contract を見るだけで実装できる
- Auth 設計（旧 docs/65 候補）は別 doc に繰り下げ → 本 doc が docs/65 を取った、Auth は docs/66 候補

## 9. Recommended Next Step

### Immediate (this batch)

本 batch を commit + push:

```bash
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os

git status --short
git add docs/65-inbox-candidate-frontmatter-contract.md \
        docs/devlog/0112-inbox-candidate-frontmatter.md \
        docs/handoff/0123-inbox-candidate-frontmatter.md \
        docs/handoff/latest.md \
        assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/prompt.md \
        assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/review.md \
        assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/prompt.md \
        assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/review.md

# inbox 配下のうち PNG / 残り file を add する必要がある場合は別判断（candidate PNG は 0 編集なので含める/含めないは選択）

git diff --staged --stat
git commit -m "docs+inbox: add candidate frontmatter contract"
git push
```

candidate PNG 自体は **本 batch で編集していない** が、untracked のままなので git status には `??` で出る。commit するかは別判断（手動レビュー前提なら untracked のまま、artifact として保存するなら add）。

### Next Implementation Batch — 候補

| 候補 | 内容 |
| --- | --- |
| **A. Phase 2A-1 implementation batch** | route + image preview + 4 API + 8 component を localhost で動かす。本 mini-batch の 4 file が test fixture として使える |
| **B. Production Visual Generation Batch（独立）** | `note-inline-content-os-flow-v1` の v001/v002/v003 を 1 candidate ずつ生成（既存 frontmatter に従う） |
| **C. ContentPackage / VisualPackage schemas/proposed/ sketch** | 提案 schema を sketch 化（active 化なし） |
| **D. Auth Migration Design** (`docs/66` に繰り下げ) | Phase 2C 着手 trigger 立つまで保留可能 |

推奨優先: **A**（dashboard 実装着手）または **B**（運用継続で frontmatter が次の candidate にも適用されるか実地確認）。

### Deferred（永続）

- paid LLM / image API integration
- auto-posting
- AI auto-approval
- multi-user collaboration（Phase 2D で初めて議論）
- billing / paid tier

## 10. Local validation runs

実行結果（2026-05-18 JST）:

- `npm run local:check`: **17 ok / 0 fail**
- root `npm run build`（Sanity Studio）: **green**
- `cd dashboard && npm run build`: **green**（既存 8 page route + `/api/asset-thumb` + Proxy middleware のみ、Phase 2A 候補 route は **未投入 → 不在を確認**）
- YAML frontmatter 妥当性（python3 yaml.safe_load）: **4/4 pass**
- candidate PNG byte size 不変: **3/3 確認**
- `git diff --stat` の対象は inbox 4 file + docs/ のみ
- direct Sanity write grep: 0 hits
- paid LLM / image API SDK grep: 0 hits

## 11. Exact Next Prompt

### Option A: Phase 2A-1 implementation batch

```text
Implement Phase Admin 2A Batch 1: read-only candidate route for localhost.

Hard Rules:
- Implement ONLY routes + API + components listed in docs/64 §12 Phase 2A-1.
- Do NOT add any write endpoint (no POST / PUT / DELETE).
- Do NOT add Sanity mutation.
- Do NOT generate images.
- Do NOT modify existing 8 page routes or /api/asset-thumb behavior.
- Do NOT modify proxy.ts logic.
- Do NOT deploy.
- Do NOT modify Visual Register.

Use:
- docs/64-admin-phase-2a-visual-review-wireframe.md (wireframe)
- docs/65-inbox-candidate-frontmatter-contract.md (parser contract)
- existing assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/{prompt,review}.md as fixture
- existing dashboard/src/app/visual-assets/page.tsx (reference)
- existing dashboard/src/lib/featureFlags.ts (reuse ENABLE_LOCAL_FS_ROUTES)

Tasks:
1. Add dashboard/src/lib/frontmatter.ts (minimal YAML splitter per docs/65 §4.2)
2. Add dashboard/src/lib/inboxReader.ts (filesystem reader, ENABLE_LOCAL_FS_ROUTES gated)
3. Add routes /visual-assets/[assetId] and /visual-assets/[assetId]/candidates
4. Add 4 API endpoints (inbox / candidates / image / manifest) per docs/64 §6
5. Add 8 components (VisualAssetHeader, CandidateGrid, CandidateCard, CandidatePreview, LocalModeBanner, EmptyCandidateState, CandidateStatusBadge, DeferredActionButton)
6. Run validation (local:check, root build, dashboard build)
7. Confirm production build does NOT expose candidate preview routes
8. Create docs/devlog/0113-* and docs/handoff/0124-*
```

### Option B: continue Production Visual Generation Batch for note-inline

```text
Resume Production Visual Generation Batch 2 for note-inline-content-os-flow-v1.

Hard Rules:
- 1 candidate per run, 5 min hard timeout.
- Do NOT generate candidates outside the inbox folder.
- Do NOT modify the frontmatter applied in docs/devlog/0112.
- Do NOT modify final asset paths.
- Do NOT modify patches.
- Do NOT write to Sanity.

Use:
- existing assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/prompt.md (with frontmatter)
- tasks/visuals/building-hitori-media-os/note-inline-content-os-flow-v1.md

Tasks:
1. Generate v001 (diagram-first), report dimensions / file size / accent color / git diff
2. Wait for human go-ahead before v002/v003
```

## 12. Is the prerequisite mini-batch complete?

**Yes**:

- 4 inbox file に frontmatter prepend 済（body 不変）
- docs/65 contract が確定
- docs/devlog/0112 + handoff/0123 + latest.md mirror
- validation 全 pass
- candidate PNG / assets / patches / Sanity / deploy / dashboard runtime すべて不変

→ Phase 2A-1 implementation batch 着手可能。

## 13. 連番について

- docs: 64 → **65**（Auth 設計は docs/66 候補へ繰り下げ）
- devlog: 0111 → **0112**
- handoff: 0122 → **0123**
