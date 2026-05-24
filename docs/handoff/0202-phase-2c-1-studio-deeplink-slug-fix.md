# Handoff: Phase 2C-1 smoke fix — Studio handoff UX + Content Idea slug generation

Date: 2026-05-21

## 1. Task Goal

Phase 2C-1 (Structured Content Idea promote helper、 handoff/0201) boss smoke test 後の 2 件改善:

### Issue 1: Studio deeplink unreliable

旧実装 `http://localhost:3333/structure/contentIdea;new` で Studio 右 pane が **blank** で開く現象。 Studio config に依存する intent route だったため、 default config では空 pane が render される。 boss が「左 pane から手動」 を毎回踏むしかなく、 deeplink が機能していなかった。

### Issue 2: Content Idea slug の auto-generation がない

dashboard が contentIdea draft を準備するなら slug も **deterministic に生成して見せる** べき、 と boss request。 slug は将来 contentIdea / campaignSlug / generation paths / platform outputs / publish-package paths を貫く **共通 identifier** になる。

本 batch は:
1. Studio deeplink を **3 段階 fallback** に置き換え (primary = `/structure`、 byType = `/structure/contentIdea`、 intent = experimental flag つき)
2. **手動 Studio handoff** UX を 5 step card で明示、 amber 警告で「Phase 2C-1 自動作成しない / Phase 2C-1B 候補」 を告知
3. **slug deterministic 生成** を mapper に実装 (4 段階 fallback: proposedTitle → rawTitle → ideaSlug → `content-idea-<timestamp>` sentinel)
4. slug.current 専用 emerald カード + field-by-field の slug 行 + 全体 JSON 包含
5. CJK transliteration は実装しない (boss の Hard Rule「Do NOT add packages」 維持)

doc-only / Sanity write 0 / 外部 API 0 / shell exec 0 / schema 変更 0 を維持。 24 routes 不変、 build green。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ contentIdea doc を **自動作成しない** (Q-2B3.1-7 + Q-2C-8 維持)
- ✅ 外部 LLM API client 追加なし
- ✅ npm package 追加なし (CJK transliteration を実装しない理由)
- ✅ shell execution なし (`child_process` / `spawn` / `exec*` 0 hits)
- ✅ `tools/`, `assets/`, `patches/`, `publish-package/` 触らず
- ✅ deploy なし
- ✅ `package.json` (root + dashboard) 追加なし
- ✅ 24 routes すべて build green
- ✅ filesystem write 0 件 (本 sub-batch も read-only helper)
- ✅ Phase 2B-1 〜 2B-3.1 / Phase 2C-0 / 2C-0.1 動作不変
- ✅ result.json read / field mapping / Recent Idea Jobs list / 既存 field copy / full JSON copy — 振る舞い不変
- ✅ Production write 永久 disabled

## 3. Changed Files

### 更新 (3 ファイル)

- [dashboard/src/lib/ideaJobs/contentIdeaMapper.ts](dashboard/src/lib/ideaJobs/contentIdeaMapper.ts)
  - `CONTENT_IDEA_STUDIO_FIELDS` に `'slug'` を追加 (13 field)
  - 新型 `ContentIdeaSlugDraft = {_type: 'slug', current: string}` (Sanity slug schema 規定の shape)
  - 新型 `ContentIdeaSlugSource = 'proposedTitle' | 'rawTitle' | 'ideaSlug' | 'fallback'`
  - `ContentIdeaStudioDraft.slug` を field 追加
  - `MappedContentIdea.slugSource` で source を UI に exposure
  - 新 export `deriveContentIdeaSlug({proposedTitle, rawTitle, ideaSlug, timestamp})` — 4 段階 fallback
  - 既存 `slugifyTitle` (Phase 2C-0) + `validateIdeaSlug` を再利用、 新 dependency なし
  - `fieldClipboards.slug = slug.current` (Studio slug input は string accept)
  - field warning: `ideaSlug` fallback と `fallback` sentinel に対して別 message
- [dashboard/src/lib/actions/prepareContentIdeaFromResult.ts](dashboard/src/lib/actions/prepareContentIdeaFromResult.ts)
  - 単一 `studioNewContentIdeaUrl: string` を削除
  - 新 struct `studioLinks: {primary, byType, intentExperimental}` を導入
    - **primary**: `${studioBaseUrl}/structure` (Studio root、 安全)
    - **byType**: `${studioBaseUrl}/structure/contentIdea` (一覧)
    - **intentExperimental**: `${studioBaseUrl}/intent/create/template=contentIdea;type=contentIdea` (experimental)
  - 新型 `StudioHandoffLink = {url, label, kind, experimental}`
  - 加えて `studioBaseUrl` を別 field として exposure
  - 既存 `enableLocalFsRoutes` gate / metadata-only log は維持
- [dashboard/src/components/ideas/ContentIdeaPromotePanel.tsx](dashboard/src/components/ideas/ContentIdeaPromotePanel.tsx)
  - 「操作の流れ」 → 「**Sanity Studio で Content Idea を手動作成**」 5 step card に書き換え、 amber 警告 (「Phase 2C-1 自動作成しない / Phase 2C-1B 候補」) を明示
  - 「**Studio handoff リンク**」 カードを新規、 3 段階 link を `<StudioLinkRow>` で並べる
  - 「**slug.current**」 専用 emerald カード を新規、 value + source + 「コピー」 button + 将来用途説明
  - field-by-field 11 行 → **12 行** に拡張 (`slug` row を `title` 直下に追加)
  - `FIELD_LABEL` + `FIELD_TONE` に slug 行追加
  - `SLUG_SOURCE_LABEL` を新規 (4 source → 日本語)
  - Source details の `Studio deeplink` 行 → `Studio base URL` に置換
  - 末尾に `<StudioLinkRow>` helper component 追加

### 触らない

- `schemas/` / `dashboard/src/lib/sanity*` / Phase 2B 既存 server action / Phase 2C-0 / 2C-0.1 server action / Phase 2C-1 IdeaJobList.tsx / reader.ts / RawIdeaBuilder.tsx / `tools/` / `assets/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) すべて touch なし

## 4. New Studio handoff behavior

### Old (handoff/0201)

```
[ Studio で開く ] →  http://localhost:3333/structure/contentIdea;new
                     ↳ Studio config 次第で右 pane blank
```

### New (本 batch)

```
[Card] Sanity Studio で Content Idea を手動作成
       1. Studio を開く
       2. 左ペインの Content Ideas を選ぶ
       3. New / Create / ＋ から新規作成
       4. 下の field 別 copy で各 field を貼り付け
       5. 必要なら full JSON を参照

[Card] Studio handoff リンク
       [ Studio を開く (左ペインから Content Ideas を選ぶ) ]  ← primary (blue button)
         http://localhost:3333/structure
       [ Content Ideas 一覧を開く ]                        ← byType (outline)
         http://localhost:3333/structure/contentIdea
       [ (experimental) intent で新規作成を試す ]            ← intentExperimental
         http://localhost:3333/intent/create/template=contentIdea;type=contentIdea
         [experimental]

       [ Content Idea 用 JSON をコピー (全体) ]
       13 fields / NNN bytes

[Card] slug.current
       obsidian-ai-sanity-3                                ← mono font
       [ slug.current をコピー ]
       source: Phase 2C-0 で生成済の ideaSlug を流用 (CJK title fallback)
       (将来 campaignSlug / generation paths / publish-package paths と
        共通 identifier として使う説明)
```

3 段階 link で:
- **primary** (青 button): Studio root を開く → boss が左 pane から手動操作 → どんな config でも動く
- **byType**: Content Ideas 一覧を直接 → standard config で 1 click 削減
- **intentExperimental**: intent API、 動けば便利、 amber chip で「experimental」 を boss に告知

## 5. Slug behavior added

### Derivation priority (4 fallback)

| Order | Source | Rule |
|---|---|---|
| 1 | `proposedTitle` (AI 提案) | `slugifyTitle()` で ASCII normalize → 結果が非空ならこれを採用 |
| 2 | `rawTitle` (boss が手入力) | 同上 |
| 3 | `ideaSlug` (Phase 2C-0 生成済) | すでに `[a-z0-9][a-z0-9-]{0,79}$` を満たす、 そのまま採用 |
| 4 | `content-idea-${timestamp}` | sentinel、 例: `content-idea-20260521-124748` (28 文字、 unique-per-job) |

### CJK fallback

- `Obsidianなど` → ASCII filter で `obsidian` → priority 1/2 で採用
- 完全 CJK タイトル → ASCII 抽出が空 → ideaSlug fallback (priority 3)
- ideaSlug 異常時 → sentinel (priority 4)

CJK 自動 transliteration は **実装しない**: npm package 追加が boss の Hard Rule 違反、 手書き kana→ASCII table は maintenance burden、 既存 ideaSlug fallback で deterministic に handle。

### Slug shape in copy

- `studioDraft.slug` (full JSON): `{_type: 'slug', current: 'obsidian-ai-sanity-3'}` — Sanity slug schema 規定
- `fieldClipboards.slug` (field 別 copy): `'obsidian-ai-sanity-3'` — Studio slug input は string accept

両方の usage に対応。 boss が「Edit as JSON」 view で全体 JSON を paste するか、 slug input field に 1 行 paste するか、 どちらでも動く。

### UI exposure

| Surface | Content |
|---|---|
| slug 専用 emerald カード | value + source label + 「slug.current をコピー」 + 将来用途説明 |
| field-by-field 行 | mono font value + `FIELD_LABEL` = `'slug.current'` + `FIELD_TONE` = `'URL slug (lowercase、 ascii、 - 区切り、 max 80)'` + 通常の copy button + warning (fallback 時) |
| 「Content Idea 用 JSON をコピー (全体)」 | studioDraft 内に `{_type: 'slug', current: '...'}` を含む |

source は SLUG_SOURCE_LABEL で日本語ラベル化:
- `proposedTitle` → `'AI 提案タイトル (proposedTitle) から生成'`
- `rawTitle` → `'元メモのタイトル (rawTitle) から生成'`
- `ideaSlug` → `'Phase 2C-0 で生成済の ideaSlug を流用 (CJK title fallback)'`
- `fallback` → `'sentinel (content-idea-<timestamp>) — Studio で必ず書き換えてください'`

## 6. Build validation

```
> dashboard@0.1.0 build
> next build

▲ Next.js 16.2.6 (Turbopack)
✓ Compiled successfully in 1502ms
  Finished TypeScript in 2.3s
✓ Generating static pages using 13 workers (3/3) in 63ms

Route (app)
├ ƒ /ideas
... 24 routes (unchanged)
```

TypeScript clean。 Turbopack pre-existing 警告 (handoff/0192 以前から、 本 batch 無関係)。

## 7. Security checks

| Check | Result |
|---|---|
| 外部 LLM API client 追加 | ✅ 0 hits (grep `openai\|anthropic`) |
| `child_process` / `spawn` / `exec*` 使用 | ✅ 0 hits |
| Shell execution | ✅ none |
| Sanity write | ✅ 0 hits (`getSanityWriteClient` / `sanityWriteClient`) |
| Filesystem write | ✅ 0 hits in updated files (read-only helper) |
| npm package 追加 | ✅ none |
| Token / 本文 log | ✅ metadata only (byte size / field count / warning count / slugSource / elapsed) |
| Production behavior | ✅ `enableLocalFsRoutes=false` で disabled (既存 Phase 2C-1 動作維持) |

## 8. Manual smoke checklist

Boss が手元で実行:

| # | シナリオ | 期待結果 |
|---|---|---|
| 1 | `.env.local` で `ENABLE_LOCAL_FS_ROUTES=true` 確認 | OK |
| 2 | `cd dashboard && npm run dev` → `/ideas` アクセス | PageHeader + RawIdeaBuilder + Recent Idea Jobs |
| 3 | `obsidian-ai-sanity-3 / 20260521-124748` の「Content Idea化を準備」 click | ContentIdeaPromotePanel が展開 |
| 4 | 「Sanity Studio で Content Idea を手動作成」 5 step card 表示 + amber 警告表示 | OK |
| 5 | Studio handoff リンクカードに 3 段階 link 表示 | primary (青 button) + byType + intent (amber experimental chip) |
| 6 | primary link click → `http://localhost:3333/structure` が new tab で開く | Studio root、 左 pane で Content Ideas を選んで New を踏める |
| 7 | byType link click → `http://localhost:3333/structure/contentIdea` | Content Ideas 一覧 (Studio config 次第) |
| 8 | intent (experimental) link click | 動けば new doc form、 動かなくても amber chip で告知済 |
| 9 | **slug.current 専用 emerald カード** 表示 | value = `obsidian-ai-sanity-3`、 source = `Phase 2C-0 で生成済の ideaSlug を流用 (CJK title fallback)` |
| 10 | 「slug.current をコピー」 button → clipboard | `obsidian-ai-sanity-3` (1 行 string) |
| 11 | field-by-field の slug 行 | title 直下、 mono value、 copy button 動作 |
| 12 | 「Content Idea 用 JSON をコピー (全体)」 | clipboard に `{studioDraft: {..., slug: {_type: 'slug', current: 'obsidian-ai-sanity-3'}, ...}, extended, provenance}` |
| 13 | Studio で contentIdea を手動 new、 slug field に `obsidian-ai-sanity-3` を paste | Sanity slug input が accept、 validation 通過 |
| 14 | result.json に ASCII title (`proposedTitle: "Why Sanity + Obsidian + AI"`) を持つ別 job がある場合、 「Content Idea化を準備」 → slug source が `proposedTitle` 表示、 slug 値が `why-sanity-obsidian-ai` 等 | OK |
| 15 | result.json に CJK title (`proposedTitle: "なぜ Sanity + Obsidian + AI"`) → 「Content Idea化を準備」 → slug source が `ideaSlug` (or `proposedTitle` if 「Sanity」 部分が拾えた場合)、 amber warning 表示 | OK |
| 16 | Phase 2B-1 〜 2B-3.1 / Phase 2C-0 / 2C-0.1 動作不変 | regression なし |
| 17 | Sanity Studio で contentIdea / 他 doc が新規作成 0 件 (dashboard が doc create していない) | OK |
| 18 | DevTools network で外部 LLM API 通信 0 件 | OK |
| 19 | env flag `ENABLE_LOCAL_FS_ROUTES=false` → 再起動 → `/ideas` → 「ENABLE_LOCAL_FS_ROUTES が必要」 panel | OK (既存 Phase 2C-1 動作維持) |

Negative tests:
- slug source が `fallback` (sentinel) 表示時に amber warning「Studio で必ず書き換え」 表示
- result.json が見つからない job で「Content Idea化を準備」 button が disable (既存 Phase 2C-1 動作維持)

## 9. Remaining issues

- **byType link が Studio config 依存**: `/structure/contentIdea` が boss の Studio で動くかは structure config 次第。 動かない場合は primary link を踏む。 dashboard 側で「これは絶対動く」 link を 1 本に絞らない判断は本 batch 後の boss feedback で再評価
- **intent API のドキュメント化**: `intent/create/template=...` は Sanity の document templates feature を有効化すると動く、 boss が「これを動かしたい」 と判断したら別 spec で Studio config を変更する path がある
- **slug generation の boss override**: 現状 dashboard 側で slug を変更する UI なし。 boss が「dashboard で slug を編集してから copy したい」 と感じたら Phase 2C-1B / 別 microbatch で input + revalidate UI を追加
- **`provenance` に slug を別途含めない**: provenance は path 群を保持、 slug は `studioDraft.slug` にあるため重複保存しない。 boss が「provenance に slug history を残したい」 と感じたら schema 拡張時に検討
- **CJK title の AI 結果が来た時の slug 候補**: 「ASCII portion を抽出して slug 化」 が ideaSlug fallback と同じ挙動なので一致するが、 boss が「title が日本語のままで slug は別途英語で」 と期待する場面では手動編集が必要
- **`content-idea-<timestamp>` sentinel の visibility**: 実運用ではほぼ発生しない (proposedTitle / rawTitle / ideaSlug のいずれかが必ず非空) が、 boss が「これが出たら何かおかしい」 と debug する仕組みは warning だけ。 後日 boss feedback で再評価
- **Phase 2C-1B (auto-create) の前提整理は別 batch で**: tone auto-completion / brandProfile 選択 / schema validation 再実装 / conflict handling 等の design decision を spec batch で確定する必要、 boss が要求するまで定義しない (Q-2B3.1-7 / Q-2C-8 維持)
- **Turbopack pre-existing 警告** (本 batch 無関係)

## 10. Next Recommended Step

**Option A (推奨) — Boss smoke (差分確認)**

§8 の 19 step を boss が実施。 PASS なら spec smoke PASS 記録 batch を起こす:
- Phase 2C-1 spec header status を「smoke fix #1 ✅」 に拡張
- parent §0.5 Phase 2C entry に handoff/0202 link 追加
- devlog + handoff 1 ペア (smoke-pass 専用)

問題があれば smoke fix #2 microbatch。

**Option B — Phase 2C-1B (auto-create Content Idea) spec batch**

boss が「手動 handoff の摩擦より自動作成の摩擦の方が低い」 と判断したら:
- spec で auto-create scope を確定 (tone auto-completion 戦略 / Sanity write の安全層 / conflict handling / Studio validation 再実装範囲)
- 後 implementation batch で server action + UI 追加

**Option C — Phase 2C-2 (Generation Prompt Package)**

本 batch で確立した slug を campaignSlug と統一する path を Phase 2C-2 で design:
- `/configurator` 拡張で `generation-jobs/<campaignSlug>/<platform>/<ts>/{prompt.md, job.json}` を書き出し
- campaignSlug = contentIdea slug (本 batch の slug) を共通 identifier として再利用
- Phase 2C-0 path 安全層を再利用

新規 ~5 + 更新 ~2 = ~7 ファイル想定。

**Option D — 試運転 idea を実 Studio に投入 + 発信**

boss が `obsidian-ai-sanity-3` を実 Sanity Studio に投入 → contentIdea として登録 → 発信 (note / Substack / Threads) の draft 作成。

---

### Exact prompt for next Claude Code session (Phase 2C-1 smoke fix #1 PASS 記録 — Option A)

```
Record Phase 2C-1 smoke fix #1 (Studio deeplink + slug generation) PASS.

Reference:
- docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md
- docs/handoff/0202-phase-2c-1-studio-deeplink-slug-fix.md
- docs/specs/phase-2b-write-actions.md (parent §0.5 Phase 2C entry)

Boss smoke result (PASS、 evidence は boss が記入):
- 3 段階 Studio link 表示 + primary click で Studio root が開く
- byType / intent link も動作 (Studio config 次第)
- slug.current 専用 emerald カードに value + source 表示
- 「slug.current をコピー」 button + field-by-field slug 行 + 全体 JSON 中の slug shape 動作
- Studio で contentIdea を手動 new、 slug field に paste → schema validation 通過
- ASCII title / CJK title それぞれで slug source が正しく switch
- Phase 2B-1〜2B-3.1 + Phase 2C-0 + 2C-0.1 regression なし
- Sanity write 0 件 / 外部 LLM API 通信 0 件 / shell exec 0 件
- observed issues: [boss が記入]

Tasks (docs only):
1. Update docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md
   - Implementation progress table の Phase 2C-1 row を「✅ smoke PASS (handoff/<NNNN> + 0202 smoke fix #1)」 に拡張
2. Update docs/specs/phase-2b-write-actions.md §0.5 Phase 2C entry
   - handoff/0202 + smoke PASS handoff を追加
3. Create docs/devlog/<NNNN>-phase-2c-1-smoke-pass.md
4. Create docs/handoff/<NNNN>-phase-2c-1-smoke-pass.md
5. Mirror to docs/handoff/latest.md

Docs only。 dashboard/src, tools, schemas, assets, patches, publish-package, package.json 触らない。 build 不要。

End-of-run summary:
- Smoke PASS results recorded for 2C-1 (incl. smoke fix #1)
- Spec section updates
- Parent spec section update
- Next: Phase 2C-2 / 2C-1B / 発信タスク / 2B-4 Q 確定
```

## 11. Validation

```
=== A. Files changed in this batch (newer than handoff/0201) ===
dashboard/src/lib/ideaJobs/contentIdeaMapper.ts                (updated: slug derivation + slug field + slugSource exposure)
dashboard/src/lib/actions/prepareContentIdeaFromResult.ts      (updated: studioLinks struct + StudioHandoffLink type)
dashboard/src/components/ideas/ContentIdeaPromotePanel.tsx     (updated: handoff card rewrite + slug emerald card + slug FieldRow + StudioLinkRow helper)
docs/devlog/0191-phase-2c-1-studio-deeplink-slug-fix.md        (new)
docs/handoff/0202-phase-2c-1-studio-deeplink-slug-fix.md       (new, this file)
docs/handoff/latest.md                                          (mirror of 0202)

=== B. Out-of-scope (expect empty) ===
schemas / tools / assets / patches / publish-package: (empty)
package.json (root + dashboard): (empty)

=== C. Build ===
cd dashboard && npm run build
→ ✓ Compiled successfully in 1502ms
→ Finished TypeScript in 2.3s
→ 24 routes (no new route, no removed route)

=== D. Security audit (grep over updated files) ===
child_process / spawn / exec*: 0 hits
openai / anthropic / api.openai.com / api.anthropic.com: 0 hits
getSanityWriteClient / sanityWriteClient: 0 hits
writeFile / atomicWrite / mkdir / rename: 0 hits in updated files (read-only)
npm dependency 追加: 0 件
```

Build green。 No TypeScript errors。 No external LLM API client。 No shell execution。 No npm package additions。 Sanity schema 不変。 Phase 2B-1 〜 2B-3.1 / Phase 2C-0 / 2C-0.1 動作不変。 filesystem write 0 件。

Phase 2C-1 が smoke fix #1 で robust な Studio handoff + deterministic Content Idea slug を獲得。 共通 slug identifier が Phase 2C 全体で使える前提が確立。 boss smoke 待ち。
