# Phase 2C-1 smoke fix — Studio handoff UX + Content Idea slug generation

日付: 2026-05-21

## 背景

Phase 2C-1 (Structured Content Idea promote helper) を boss が smoke test。 全体は動作 PASS だったが 2 件の改善要望:

### Issue 1: Studio deeplink が unreliable

以前の実装は単一の deeplink:
```
http://localhost:3333/structure/contentIdea;new
```

boss が click したところ Studio の右 pane が **blank** で開いた。 Studio 本体は起動しているが、 `;new` の document-ID intent が Studio の structure config に依存しており、 default config では空 pane を render するだけ。 boss が「左 pane から手動で Content Ideas を選んで New を押す」 を毎回踏むしかなく、 dashboard が deeplink を出す意味が薄かった。

### Issue 2: Content Idea slug の auto-generation がない

boss request:
- Content Idea 作成時に **URL slug が必要** だが、 Sanity Studio の slug input は手動 + click で auto-generate する設計
- dashboard が contentIdea draft を準備するなら **slug も deterministic に生成して見せる** べき
- これは将来 contentIdea / campaignSlug / generation paths / platform outputs / publish-package paths を 1 本に揃えるための共通 identifier になる

boss workflow の natural pre-requisite として slug を上流で確定したい。

## 決定・変更

### 更新 (3 ファイル)

- `dashboard/src/lib/ideaJobs/contentIdeaMapper.ts`
  - `CONTENT_IDEA_STUDIO_FIELDS` に `'slug'` を追加 (12 → 13 field)
  - 新型 `ContentIdeaSlugDraft = {_type: 'slug', current: string}` (Sanity slug field の正式 shape)
  - 新型 `ContentIdeaSlugSource = 'proposedTitle' | 'rawTitle' | 'ideaSlug' | 'fallback'`
  - `ContentIdeaStudioDraft.slug: ContentIdeaSlugDraft` を field 追加
  - `MappedContentIdea.slugSource` で source を UI に exposure
  - 新 export `deriveContentIdeaSlug({proposedTitle, rawTitle, ideaSlug, timestamp})` — 4 段階 fallback (proposedTitle → rawTitle → ideaSlug → `content-idea-<timestamp>`)
  - 既存 Phase 2C-0 helper (`slugifyTitle` + `validateIdeaSlug`) を再利用、 新 dependency なし
  - `fieldClipboards.slug = slug.current` (Studio の slug input は string を accept する慣習)
  - field-level warning: `ideaSlug` fallback と `fallback` sentinel に対して別 message
- `dashboard/src/lib/actions/prepareContentIdeaFromResult.ts`
  - 単一 `studioNewContentIdeaUrl: string` を削除
  - 新 struct `studioLinks: {primary, byType, intentExperimental}` を導入
    - **primary**: `${studioBaseUrl}/structure` (Studio root、 boss が左 pane から手動操作する安全な entry)
    - **byType**: `${studioBaseUrl}/structure/contentIdea` (Content Ideas 一覧、 Studio config が標準なら動く)
    - **intentExperimental**: `${studioBaseUrl}/intent/create/template=contentIdea;type=contentIdea` (intent API、 experimental flag つき)
  - 加えて `studioBaseUrl: string` も別 field として export (UI debug 用)
  - 既存の `enableLocalFsRoutes` gate / metadata-only log は維持
- `dashboard/src/components/ideas/ContentIdeaPromotePanel.tsx`
  - 操作の流れカード を **「Sanity Studio で Content Idea を手動作成」** に書き換え、 5 step + amber 警告 (「Phase 2C-1 では自動作成しません / Phase 2C-1B 候補」) を明示
  - **「Studio handoff リンク」** カードを新規、 3 段階 Studio link を `<StudioLinkRow>` で並べる (primary は青 button、 他 2 件は outline button、 intent は amber `experimental` chip 付き)
  - **「slug.current」** 専用 emerald カード を新規、 mono font で slug 値表示 + 「slug.current をコピー」 button + source explanation ("AI 提案タイトルから生成" / "ideaSlug 流用" / "sentinel — Studio で必ず書き換え") + 将来の用途説明 (campaignSlug / generation paths / publish-package paths との共通 identifier)
  - field-by-field 11 行 → 12 行に拡張 (`slug` row を `title` の直下に追加、 `FieldRow` で表示 + 「slug.current をコピー」 button)
  - `FIELD_LABEL` / `FIELD_TONE` に `slug: 'slug.current'` / `'URL slug (lowercase、 ascii、 - 区切り、 max 80)'` を追加
  - `SLUG_SOURCE_LABEL` (4 値 → 日本語ラベル) を新規、 emerald カードと field warning で使用
  - Source ファイル details の `Studio deeplink` 行を `Studio base URL` に変更
  - `<StudioLinkRow>` helper component を末尾に追加 (primary tone vs outline tone + experimental chip)

### 触らない

- Sanity schema / Sanity write / Phase 2B 既存 server action / `tools/` / `assets/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) — 全 touch なし
- 外部 LLM API client 追加なし、 shell execution なし
- result.json read 動作 / field mapping / Recent Idea Jobs list / Phase 2C-0 + 2C-0.1 動作 — 全て不変
- 既存 11 field の clipboard / preview / warnings — 不変
- `enableLocalFsRoutes` env gate のみで動く読み取り専用 helper — 不変

### 既存 24 routes 不変、 build green、 TypeScript clean

## 理由

### なぜ Studio link を 3 段階にするか (1 つの primary に絞らないのはなぜか)

Studio config / version / boss の Studio mental model によって最適 link が変わる:
- **`/structure`** (primary): どんな Studio config でも左 pane から手動でドリルダウン可、 一番安全
- **`/structure/contentIdea`** (byType): 多くの config で Content Ideas 一覧を直接開く、 boss が新規作成までの click を 1 回減らせる、 ただし structure config に依存
- **`/intent/create/template=...`** (intentExperimental): intent API で新規 doc を template から開く、 Sanity の document templates 機能を有効化していれば動く、 default config では 404 / blank 可能性

boss が「primary で十分」 / 「byType まで」 / 「intent でも試したい」 を選べる構造に。 各 link の URL は code 表示 + experimental chip で「これは default config で動かないかも」 を明示 → 期待値管理。

これは Phase 2B-3 の Visual Register CLI HTTP bridge と同様の「**dashboard が 1 つの完璧な URL を出す**」 から「**dashboard が選択肢を提示 + risk を ラベリング**」 にシフトする design discipline。

### なぜ slug を mapper で生成するか (UI 側で生成せず)

理由:
1. **server side で deterministic**: 同じ input (result.json + rawIdea + timestamp) からいつも同じ slug が出る、 client/server で divergence しない
2. **既存 helper を再利用**: `slugifyTitle` (Phase 2C-0 paths.ts) は ASCII normalize + `[a-z0-9-]` regex + 80 char cap + `^-+/-+$` trim + `-{2,}` 折りたたみを全部やってくれる、 新 dependency 不要
3. **`validateIdeaSlug` regex 厳守**: 生成された slug は Phase 2C-0 と同じ `^[a-z0-9][a-z0-9-]{0,79}$` を満たす、 future の Phase 2C-2 generation paths / Phase 2C-3 platform output paths でも同 regex を再利用できる
4. **fallback chain が clear**: priority 1 → 2 → 3 → 4、 boss が「source: proposedTitle」 / 「source: ideaSlug」 を UI で見て「AI が weak タイトル返したな」 と判断できる
5. **`copyableJsonText` に自動包含**: studioDraft の他 field と同じ JSON blob 中、 別途 wire する必要なし

UI 側 (client) で slug を生成すると:
- AI 結果 paste → preview → 別 textarea で boss が slug 編集 → 反映、 という余分な state machine
- server/client 二重実装 (Phase 2C-1B 自動作成 server action を作る時 mapper を再利用したいが、 client logic を呼べない)
- regex / NFKD normalize の boundary が UI に散る

mapper で確定し、 UI は「表示 + copy + warning」 だけする方が clean。

### なぜ CJK 自動 transliteration を実装しないか

選択肢:
1. **kuroshiro / wanakana / 他 npm package を追加** → boss の Hard Rule「Do NOT add packages」 違反
2. **手書きの kana→ASCII table** → 60-200 行のコード、 maintenance burden、 漢字は未対応
3. **既存 `slugifyTitle` の ASCII fallback を信頼** → Phase 2C-0 で確立済の挙動を踏襲、 「CJK title なら ideaSlug fallback」 が deterministic + 説明可能

選択肢 3 を採用。 boss が「Obsidianなど」 のような mixed text を入力した場合:
- `Obsidianなど` → NFKD normalize → ASCII filter で `obsidian` だけ残る → `obsidian` が slug
- 完全 CJK タイトル → ASCII 抽出が空 → `slugifyTitle('', '')` が `''` を返す → mapper が `ideaSlug` fallback
- ideaSlug も無効な異常事態 → `content-idea-<timestamp>` sentinel

Phase 2C 全体の「dashboard が AI の不確実性を design discipline で吸収する」 pattern の一例。

### なぜ Sanity slug field を `{_type: 'slug', current: '...'}` で出すか

これは Sanity の **schema 規定の正式 shape**。 schemas/contentIdea.ts:
```ts
defineField({
  name: 'slug',
  title: 'スラッグ（Slug）',
  type: 'slug',
  options: {source: 'title'},
  validation: (Rule) => Rule.required(),
}),
```

Sanity の `slug` type は内部的に `{_type: 'slug', current: string}` で storage。 dashboard が「Edit as JSON」 view 経由で paste する case を想定するなら正式 shape で出すのが安全。

ただし Studio の slug **input field** に直接 paste する case (boss が field 別 copy button を使う) では文字列だけが期待される → そこで:
- `studioDraft.slug` (full JSON) は `{_type: 'slug', current: '...'}` shape
- `fieldClipboards.slug` (field 別 copy) は `current` の string だけ

両方の usage を carry できる。

### なぜ slug field を専用 emerald カードでも出すか (field-by-field の単純 row だけでなく)

slug は他の field と性質が違う:
- **将来の共通 identifier**: campaignSlug / generation paths / platform outputs / publish-package paths との繋がりを boss が意識する必要
- **source の visibility**: 「これは ASCII 化されたものか / fallback か」 を boss が見ないと、 後で「なぜこの slug なのか」 を辿れない
- **書き換える可能性が高い**: title から slug を生成しただけだと boss が好む slug でないケース、 Studio で書き換える前提

そこで emerald カード で「value + source + 将来の用途」 を強調 + 通常の field-by-field 行にも入れて「コピーする時の一貫操作」 を維持。 boss が選べる。

### なぜ field-by-field を 12 行に拡張するか (slug を別カードに分けるなら field-by-field から外してもいい)

維持理由:
- boss が「全 field を 1 列で見渡す」 mental model を保つ
- copy button が field-by-field section に集中していれば「Studio で開く → field を順に paste」 の linear flow に合う
- slug 専用カードは「ハイライト」、 field-by-field の slug 行は「他 field と一緒の操作 surface」

両方あっても情報重複は少ない (slug 専用カードは説明 + source、 field-by-field の slug 行は preview + copy)。

### なぜ「Phase 2C-1B 候補」 という言葉を amber 警告に書いたか

将来 boss が「自動作成したい」 と感じた時に検討する path を **明示的に named**:
- Phase 2C-1: 手動 Studio handoff (現状)
- Phase 2C-1B: 自動 createContentIdea server action (boss が要求した時に起こす)
- Phase 2C-1B prerequisite: tone の auto-completion 戦略 (brandProfile / 既存 contentIdea 参照)、 schema validation の再実装、 conflict handling

これにより:
- boss が今 amber 警告を見て「将来 1 click で作れるかも」 と認識
- Claude Code が future batch を起こす時 spec から phase 名で参照可
- Q-2B3.1-7「dashboard が doc create しない」 原則を Phase 2C-1B で **明示的に judgement する** 期待値

### なぜ `studioNewContentIdeaUrl` field を削除して `studioBaseUrl + studioLinks` 構造に置き換えるか

shape の変更 = breaking change だが:
- Phase 2C-1 は本 batch (handoff/0201) で land したばかり、 caller は ContentIdeaPromotePanel だけ
- boss feedback で「単一 deeplink は機能不足」 が確定、 早期に構造を直す方が後の Phase 2C-2 / 2C-3 で多数の caller が依存する前に修正できる
- 新 struct `studioLinks` は future expansion (例えば `byCampaign: '/structure/campaignPlan'`) に open

migration cost が boss smoke 直後の今が一番低い、 今直すのが pragmatic。

## 影響

- リポジトリ:
  - `dashboard/src/lib/ideaJobs/contentIdeaMapper.ts` (更新: slug type + deriveContentIdeaSlug + studioDraft.slug + slugSource + fieldClipboards.slug + 2 warnings、 約 90 行 net add)
  - `dashboard/src/lib/actions/prepareContentIdeaFromResult.ts` (更新: studioLinks struct + StudioHandoffLink type + 3 link build + return shape 変更、 約 30 行 net add)
  - `dashboard/src/components/ideas/ContentIdeaPromotePanel.tsx` (更新: 手動 handoff card 書き換え + studio link 3 段 row + slug 専用 emerald カード + field-by-field に slug 行 + StudioLinkRow helper + SLUG_SOURCE_LABEL、 約 130 行 net add)
  - docs/devlog/0191 + docs/handoff/0202 + docs/handoff/latest.md
  - schemas / tools / assets / patches / publish-package / package.json: touch なし
- ワークフロー:
  - boss が `/ideas` で Content Idea promote helper を開くと:
    1. 「Sanity Studio で Content Idea を手動作成」 5 step card
    2. 3 段階 Studio link (primary = `/structure`、 byType = `/structure/contentIdea`、 intent = experimental)
    3. slug.current 専用 emerald card with source + 将来用途説明
    4. field-by-field 12 行 (title → slug → summary → coreThesis → audience → audiencePain → claims → objections → examples → platformAngles → tone → rawInput → personalContext)
  - Studio で右 pane が空のまま開いても boss が「左から手動」 で recover できる動線が UI に組み込まれた
  - 共通 slug が確定、 Phase 2C-2 (generation packages) で同じ slug を campaign / output / publish-package と揃える前提が出揃った
  - 24 routes 不変、 build green、 TypeScript clean
- スキーマ: 不変 (Sanity slug の `{_type, current}` shape は schema **規定の既存** shape、 schema 変更ではない)
- プロダクト方針:
  - 「dashboard が単一 deeplink に賭ける」 → 「dashboard が選択肢を提示 + risk ラベリング」 という UI design discipline へ
  - slug が共通 identifier として確立、 Phase 2C 系全体で「**1 slug が contentIdea + campaign + generation + publish package を貫く**」 architecture に必要な前提が出揃った
  - Phase 2C-1B (自動作成) を named candidate として明文化、 boss が要求した時に起こす ready state

## 次の一手

**Option A (推奨) — boss smoke (差分のみ)**

boss が手元で:
1. `cd dashboard && npm run dev` (`.env.local` で `ENABLE_LOCAL_FS_ROUTES=true`)
2. `/ideas` → 既存 `obsidian-ai-sanity-3 / 20260521-124748` の「Content Idea化を準備」 click
3. 「Sanity Studio で Content Idea を手動作成」 5 step card 表示確認
4. **3 段階 Studio link** 表示確認 → primary click → Studio root が開くことを確認 → 左 pane で Content Ideas → New を踏める
5. byType link click → Content Ideas 一覧が直接開くか確認 (Studio config 次第)
6. intent (experimental) link click → 動けば new doc form が開く、 動かなくても amber chip で「experimental」 と告知済なので boss が驚かない
7. **slug.current 専用 emerald カード** の value 確認 (`obsidian-ai-sanity-3` 等)、 source 表示確認 (`Phase 2C-0 で生成済の ideaSlug を流用 (CJK title fallback)`)
8. 「slug.current をコピー」 button → clipboard に `obsidian-ai-sanity-3` (1 行 string)
9. field-by-field の **slug 行** 表示確認、 同じ value、 copy button 動作
10. 「Content Idea 用 JSON をコピー (全体)」 → clipboard に `{studioDraft: {..., slug: {_type: 'slug', current: 'obsidian-ai-sanity-3'}, ...}, extended, provenance}` の JSON
11. Studio で contentIdea を手動 new、 slug field に貼り付け → Sanity slug input が「URL slug」 として accept するか確認 (validation 通過)
12. (optional) AI 結果に `proposedTitle: "なぜ Sanity も含めた 3 つの組み合わせが最強なのか"` のような CJK 含む title がある場合、 slug source が `ideaSlug` fallback になることを emerald カードで確認
13. (optional) result.json を 1 個コピーして `proposedTitle: "Why Sanity + Obsidian + AI"` のような ASCII title に差し替え → preview 再読み込み → slug source が `proposedTitle` に切り替わり、 slug 値も `why-sanity-obsidian-ai` 等に変わることを確認
14. Phase 2B-1〜2B-3.1 + Phase 2C-0 + 2C-0.1 動作 regression なし
15. Sanity Studio で contentIdea / 他 doc が 0 件新規追加 (dashboard が doc create していない)
16. DevTools network で外部 LLM API 通信 0 件

問題なければ smoke PASS を docs に記録 → Phase 2C-2 (Generation Prompt Package) または **試運転 idea を実 Studio に投入 + 発信** に進む。

**Option B — Phase 2C-1B (auto-create Content Idea)**

boss が「手動 handoff の摩擦より自動作成の摩擦の方が低い」 と判断した場合、 Phase 2C-1B を spec + implement:
- Sanity write server action (Phase 2B 共通 pattern、 `enableWriteActions` + `SANITY_WRITE_TOKEN` 要求)
- tone の auto-completion 戦略 (brandProfile から copy、 既存 contentIdea から推測)
- schema validation の事前 check + boss confirm
- conflict handling (slug 既存 / doc 既存)

新規 ~4 + 更新 ~2 = ~6 ファイル想定、 1 PR 完結可能。

**Option C — Phase 2C-2 (Generation Prompt Package)**

Phase 2C-1 smoke fix を完了したら自然な next step。 `/configurator` 拡張で:
- platform 別 generation prompt を `generation-jobs/<campaignSlug>/<platform>/<ts>/` に書き出し
- 本 batch で確立した slug を campaignSlug と統一する path を design

発信ネタ案:
- 「Studio deeplink を 1 つの URL に賭けるのをやめた design 判断 — 3 段階 fallback + risk ラベリング」
- 「dashboard が Sanity slug を deterministic に生成する pragmatism — 既存 slugifyTitle を再利用して新 dependency ゼロ」
- 「CJK title は ideaSlug fallback で受ける design discipline — npm package 追加なしで 100% deterministic」
- 「`{_type: 'slug', current: '...'}` 正式 shape vs Studio input への string — 2 つの clipboard を提供する pattern」
- 「Phase 2C-1B を named candidate にする意味 — 自動作成への進化 path を boss に明示的に提示する」
- 「slug を 1 本の共通 identifier として確立 — contentIdea / campaign / generation / publish-package を貫く architecture」
