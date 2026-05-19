# Handoff: Japanese-First Editorial Visual Generation Quality Upgrade

Date: 2026-05-18
Status: **design + prompt-system upgrade complete / 0 image generation / 0 schema change / 0 sanity write / 0 deploy / 0 candidate PNG modified / phase-admin-2a-1 still in place**

## 1. Task Goal

`note-inline-content-os-flow-v1` の v001 / v002 / v003 は構造的に正しいが editorial としては弱い（boxes-and-lines、英語ラベル偏重、icon ゼロ、reader outcome 欠如）。本 batch で **画像を生成せず、prompt-system 側を Japanese-first / editorial 品質契約に upgrade**。次バッチ以降のすべての visual 生成に当てる reusable Prompt Block v1 を docs/66 に固定し、note-inline 用の revised plan (v004) を prompt.md に append する。

## 2. Constraints Followed

- 画像生成: **0**（本 batch では v004 を作らない、契約だけ書く）
- candidate PNG 編集 / 削除 / 上書き: **0**（既存 6 件全て byte-identical）
- `assets/visuals/` / `patches/` / Sanity: **不変**
- 新規パッケージ追加: **0**
- production env vars / Vercel UI / deploy: **0**
- dashboard runtime / schemas / sanity.config: **不変**
- Visual Register `tools/visual-register/`: **不変**
- prompt.md 既存 frontmatter + v001/v002/v003 variant 節: **完全保存**（append のみ）
- review.md: **本 batch では非編集**
- `.env*` を inspect / 出力: **0**
- secret 値を log / docs に書き残し: **0**
- Codex CLI 起動: **0**

## 3. Changed Files

### Added — `docs/`

- `docs/66-japanese-visual-generation-quality-upgrade.md` — main design doc（13 sections）
- `docs/devlog/0114-japanese-visual-generation-quality-upgrade.md`
- `docs/handoff/0125-japanese-visual-generation-quality-upgrade.md` (本ファイル)

### Modified — `docs/`

- `docs/handoff/latest.md` — mirror 0125

### Modified — `assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/`

- `prompt.md` — append 2 new sections（`## Japanese Editorial Diagram Prompt Block v1`, `## v004 — Japanese editorial v1 (planned, not yet generated)`）。YAML frontmatter + v001/v002/v003 既存節は完全保存

### Confirmed unchanged

- candidate PNG bytes（全 6 件）:

  | File | Bytes |
  | --- | --- |
  | threads-support-diagram-v1/v001.png | 1,117,386 |
  | threads-support-diagram-v1/v002.png | 1,170,769 |
  | threads-support-diagram-v1/v003.png | 1,155,943 |
  | note-inline-content-os-flow-v1/v001.png | 1,019,508 |
  | note-inline-content-os-flow-v1/v002.png | 1,234,530 |
  | note-inline-content-os-flow-v1/v003.png | 1,078,958 |

- `assets/visuals/` / `patches/` / `seed/` / `outputs/` / `publish-packages/` / `private/`
- schemas / sanity.config / structure / proxy.ts / featureFlags / dashboard/src/
- root + dashboard `package.json` / `package-lock.json`
- review.md（note-inline）
- Sanity dataset / Vercel project / DNS / production env vars
- POTA_Empire/.git / 兄弟 POTA project
- `dashboard/public/activity-snapshot.json`

## 4. Current candidate critique（要約）

| Candidate | issue 1 | issue 2 | issue 3 |
| --- | --- | --- | --- |
| v001 (diagram-first) | English labels 中心（日本語 2 箇所のみ） | icon / illustration 0 | flat visual hierarchy |
| v002 (typography-hybrid) | 上部 Japanese 良いが下部 pipeline は英語 | icon / illustration 0 | reader outcome なし |
| v003 (metaphor-mix dashboard) | column header 全 English / card label 全 English | icon / illustration 0 | dashboard 比喩は強いが本体ラベルで翻訳負荷 |

共通: **boxes-and-lines + English-first + icon ゼロ + reader outcome 欠如**。

詳細は [docs/66 §1](../66-japanese-visual-generation-quality-upgrade.md#1-なぜ現-candidates-が不十分か) を参照。

## 5. New Japanese-first rules

### 5.1 主従の原則

- **主言語**: 日本語（headline / subhead / 主要 label / reader outcome）
- **補助言語**: 英語（tag / chip / meta / brand mark のみ）

### 5.2 Term replacement table（canonical）

| 内部 system 用語 | 読者語彙（**正典**） | 補助英語タグ |
| --- | --- | --- |
| Content Idea | **発信のタネ** | Content Idea |
| Text Drafts | **投稿文・記事下書き** | Drafts |
| Visual Assets | **図解・画像素材** | Visuals |
| Publish Package | **公開用パッケージ** | Package |
| Human Edit | **人間が整える** | Edit |
| Visual Review | **図解を選ぶ** | Review |
| Manual Publish | **最後は手動公開** | Publish |
| automation later | **自動化は最後** | — |

詳細は [docs/66 §3.3](../66-japanese-visual-generation-quality-upgrade.md#33-term-replacement-tablecanonical)。

## 6. Visual richness requirements（7 必須）

1. headline（日本語）
2. subhead / support line（日本語）
3. 3+ visual modules（cards / lanes / chips / panels、同じ形に倒れない）
4. 3+ icons / illustrations
5. connectors / arrows with meaning
6. highlight badge（principle、例: 「自動化は最後」）
7. reader outcome box（読者の変化、例: 「発信作業が毎回の頑張りから仕組みに変わる」）

加えて、4-level 視覚階層（hero > primary > supporting > meta）、十分な whitespace、warm accent 1 色 (#D08A3C-like) を 2-4 箇所に意図的配置。

## 7. Pre-generation Visual Rough step（必須）

image_gen を呼ぶ **前に**、agent は Visual Rough（11 fields）を 1 度書き、7-point self-check を通す:

| Self-check | 判定基準 |
| --- | --- |
| 1 | japaneseLabels ≥ englishLabels |
| 2 | visualModules ≥ 3 |
| 3 | iconsOrIllustrations ≥ 3 |
| 4 | readerOutcomeBox に読者の変化が書いてある |
| 5 | layoutPattern が preferred list から選ばれている |
| 6 | whyBetterThanPlainNodes に納得理由 |
| 7 | forbidden patterns に該当なし |

1 つでも fail なら rough をやり直す。Phase 2A 中は prompt.md 内に手書き、Phase 2B 以降の dashboard で form 化候補。

詳細は [docs/66 §5](../66-japanese-visual-generation-quality-upgrade.md#5-pre-generation-visual-rough-step)。

## 8. Japanese Editorial Diagram Prompt Block v1

**Reusable な prompt 骨格**。今後すべての visual 生成 prompt は本 block を冒頭に貼り、asset-specific 詳細を続ける。

- Reader-first framing（日本語第一、reader vocabulary、reader outcome box）
- Visual richness 7 必須（§6）
- Forbidden 12 条件（boxes-only / title-card-only / English-first / generic dev arch / plain flowchart / random decoration / robot-brain-AI cliche / neon-glass / unreadable tiny / face-avatar / recognizable logos / secrets-IDs）
- Style guard（white bg, deep navy, ONE warm amber accent, sans-serif Noto Sans JP, thin lines, no shadows）
- Layout pattern from preferred list（§9）
- Self-review rubric（7 axes × 1-5 = 35 点 threshold 24 / 18）
- Pre-generation Visual Rough mandatory

全文 + 使い方は [docs/66 §7](../66-japanese-visual-generation-quality-upgrade.md#7-japanese-editorial-diagram-prompt-block-v1).

## 9. Preferred / avoid layout patterns

### Preferred 9 種

Before / After、Editorial explainer、Dashboard workflow、Pipeline with checkpoints、4-step transformation、Media distribution map、Human review journey、Checklist infographic、Problem-to-system diagram

### Avoid 5 種

generic hub-and-spoke（default 使用）、raw node graph、developer architecture diagram、pure UI mockup with no reader benefit、centered single-headline title card

## 10. note-inline v004 revised plan（画像未生成）

| 項目 | 値 |
| --- | --- |
| variant id | `v004` |
| variant label | `japanese-editorial-v1` |
| theme | 「毎回ゼロから発信を作る」から「発信のタネが複数媒体へ育つ仕組み」へ |
| layoutPattern | **Before / After + Pipeline** |
| metaphor | 種 (seed) → 公開用パッケージ (fruit) への transformation |
| japaneseLabels | 13 件（発信のタネ / AI 下書き / 人間が整える / 図解を選ぶ / 公開用パッケージ / X / Threads / note / Substack / YouTube / Shorts / 最後は手動公開 / 自動化は最後 / reader outcome / Before label / After label） |
| englishLabels | 1 件（Hitori Media OS brand mark） |
| icons / illustrations | 8 種（seed / document / edit pencil / check / image thumbnail / package / hand / lock + loop arrow） |
| readerOutcome | 「発信作業が、毎回の頑張りから仕組みに変わる。」 |
| self-check | **7/7 Pass**（[docs/66 §8.3](../66-japanese-visual-generation-quality-upgrade.md#83-§52-self-checkv004-rough-採点)） |
| 期待 dimensions | 1600 × 900 (16:9) |
| 期待 file size | ~1.0-1.3 MB |
| 生成タイミング | **次の human GO 後の別 batch**（本 batch では未生成） |

Visual Rough 全文は [docs/66 §8.2](../66-japanese-visual-generation-quality-upgrade.md#82-visual-roughv004-用51-format) と prompt.md の v004 セクションに記録済み。

## 11. Validation results

実行結果（2026-05-18 JST）:

| Check | Result |
| --- | --- |
| `npm run local:check` | **17 ok / 0 fail** |
| root `npm run build`（Sanity Studio） | **green** |
| `cd dashboard && npm run build` | **green**（既存 12 page + 5 API route + Proxy、Phase 2A-1 routes 不変） |
| YAML frontmatter parse on note-inline prompt.md | **pass、13 keys、candidateStrategy length=3（v001/v002/v003 既存維持）** |
| `git diff --stat`（schemas / dashboard / tools / proxy.ts） | **0 件**（本 batch は docs + 1 prompt.md append のみ） |
| direct Sanity write grep | **0 hits** |
| paid LLM / image API SDK grep | **0 hits** |
| 新規 package | **0 件** |
| candidate PNG byte size unchanged (6 件) | **6/6 confirmed** |

詳細は本 handoff §14 で実行ログを記録。

## 12. Important Decisions

- **画像を生成する前に prompt-system を直す**（v004 を勢いで作っても同じ品質に倒れる）
- **Japanese-first を明文化**（term replacement table を canonical 化）
- **Visual richness 7 必須** を最低ラインに
- **Pre-generation Visual Rough step** を agent の自己約束として導入
- **9 layout pattern を preferred、5 layout を avoid**
- **Japanese Editorial Diagram Prompt Block v1** を全 platform 共通の reusable 骨格に
- **既存 candidate PNG / 既存 prompt.md variant 節を保存**（append のみ）
- **本 batch では画像を生成しない**、v004 は次バッチ
- **他 asset への適用は段階的**（次バッチ以降）

## 13. Human Review Questions

- 本 prompt-system upgrade（docs/66）を **canonical** として承認するか？ 修正点はあるか？
- term replacement table（§5.2）の翻訳語彙は妥当か？ より良い読者語彙の提案はあるか？
  - 例: `発信のタネ` を `企画の種` / `主張の核` に変える等
- preferred 9 / avoid 5 layout の選別は妥当か？ 追加 / 削除する layout はあるか？
- v004 Visual Rough（§10）の方向性は採用してよいか？ それとも別 metaphor に振り直すか？
- v004 生成を次バッチで実行するか、それとも先に他 asset（threads-support / x-hook / substack-header 等）にも本契約を適用するか？
- 既存 candidate PNG (v001-v003) を historical record として残す方針は OK か？ deprecate / archive に移すか？

## 14. Local validation runs

実行結果（2026-05-18 JST）:

- `npm run local:check`: **17 ok / 0 fail**
- root `npm run build`（Sanity Studio）: **green**
- `cd dashboard && npm run build`: **green**（既存 12 page + 5 API route + Proxy、Phase 2A-1 routes 不変）
- YAML frontmatter parse on prompt.md after append: **pass**（13 top-level keys、candidateStrategy length=3、既存 v001/v002/v003 sections 維持確認）
- prompt.md sanity:
  - YAML fence count: 2（expect 2）
  - `## v001 — diagram-first` section: 1
  - `## v002 — typography-hybrid` section: 1
  - `## v003 — metaphor-mix` section: 1
  - new block references "Japanese Editorial Diagram Prompt Block v1": 3
- candidate PNG byte size (6 file): **6/6 unchanged** (1117386 / 1170769 / 1155943 / 1019508 / 1234530 / 1078958)

## 15. Recommended Next Step

### Immediate (this batch)

本 batch を commit + push（前のバッチの uncommitted docs と一緒にまとめてもよい）:

```bash
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os

git status --short
git add docs/66-japanese-visual-generation-quality-upgrade.md \
        docs/devlog/0114-japanese-visual-generation-quality-upgrade.md \
        docs/handoff/0125-japanese-visual-generation-quality-upgrade.md \
        docs/handoff/latest.md \
        assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/prompt.md

git diff --staged --stat
git commit -m "prompt-system: Japanese-first editorial diagram upgrade"
git push
```

candidate PNG は untracked のまま（本 batch でも触っていない、commit 対象は判断分かれ）。

### Next Implementation Batch — 候補

| 候補 | 内容 |
| --- | --- |
| **A. Regenerate note-inline v004 using upgraded prompt** ✓ 推奨 | 本 doc の Japanese Editorial Diagram Prompt Block v1 + v004 Visual Rough（prompt.md 内）を input に Codex exec を起動。5 min cap、1 candidate のみ、既存 PNG 上書きなし |
| **B. Apply upgrade to other assets** | threads-support-diagram-v1 / x-hook-main-v1 / 将来 asset の prompt.md にも Block v1 を append（再生成は別 batch） |
| **C. Phase 2A-2 implementation** | candidate detail panel + review rubric panel + prompt summary + 6 components + `/visual-review/*` pages |
| **D. ContentPackage / VisualPackage proposed schema sketch** | active 化なし、sketch のみ |
| **E. Auth Migration Design (docs/67)** | Phase 2C 着手前に必須 |

推奨優先: **A**（本 batch の契約を実 1 件で検証）→ **B**（成果が良ければ他 asset にも展開）。

### Deferred（永続）

- paid LLM / image API integration
- auto-posting
- AI auto-approval
- multi-user collaboration（Phase 2D 以降）
- billing / paid tier

## 16. Exact Next Prompt

### Option A: Regenerate note-inline v004 with upgraded prompt

```text
Generate note-inline-content-os-flow-v1 v004 only.

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

Target:
- assetSlug: note-inline-content-os-flow-v1
- candidate: v004.png
- variant: japanese-editorial-v1
- platform: note
- assetPurpose: inline-diagram
- aspectRatio: 16:9
- pixelSize: 1600x900

Use:
- docs/66-japanese-visual-generation-quality-upgrade.md §7 (Japanese Editorial Diagram Prompt Block v1)
- assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/prompt.md
  (v004 section + Japanese Editorial Diagram Prompt Block v1)
- Visual Rough is already filled and passed 7/7 self-check; use it directly.

Output path:
- assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/v004.png

After generation:
1. Confirm v004 dimensions / file size / accent color.
2. Confirm dashboard candidate API can see candidates=4.
3. Confirm assets/visuals / patches / Sanity / docs untouched.
4. Compare v004 against v001/v002/v003 on the 7 self-rubric axes.
5. Recommend whether to adopt or regenerate.
```

### Option B: Apply upgrade to other assets

```text
Apply Japanese Editorial Diagram Prompt Block v1 to other existing asset prompt.md files.

Hard Rules:
- Do NOT generate images in this batch.
- Do NOT modify candidate PNGs / final assets / patches / Sanity / deploy.
- Append the Block v1 section to each prompt.md (preserve existing YAML frontmatter
  and existing variant sections).

Target assets:
- assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/prompt.md
- assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/prompt.md (if exists)
- assets/inbox/generated/building-hitori-media-os/note-hero-v1/prompt.md (if exists)

For each asset, fill a Visual Rough specific to that asset using docs/66 §5.1 format,
pass the 7-point self-check, and append the block + rough as a new variant section
named `vNNN — japanese-editorial-v1 (planned, not yet generated)`.

Output: docs/devlog/0115-*, docs/handoff/0126-*.
```

## 17. Is the prompt-system upgrade complete?

**Yes (this design batch)**:

- 13 sections の design doc が docs/66 に揃っている
- Japanese-first 6 原則 + term replacement table canonical
- Visual richness 7 必須 + forbidden 12 条件
- Pre-generation Visual Rough format + 7-point self-check
- Preferred 9 layout + Avoid 5 layout
- Japanese Editorial Diagram Prompt Block v1 全文
- note-inline v004 用 Visual Rough（7/7 self-check pass）prompt.md に記録済
- 全 validation green、既存 6 PNG byte-identical、frontmatter 整合

**Prompt-system upgrade は本 batch で完了**。次の implementation batch（v004 actual generation）で実 1 件検証へ。

## 18. 連番について

- docs: 65 → **66**（Auth migration design は docs/67 候補へ繰り下げ）
- devlog: 0113 → **0114**
- handoff: 0124 → **0125**
