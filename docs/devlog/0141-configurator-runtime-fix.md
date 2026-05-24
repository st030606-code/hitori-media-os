# Devlog 0141 — Configurator runtime fix

日付: 2026-05-19

## 背景

Phase UI-fidelity-5 で `/configurator` を本実装した直後、boss が `localhost:3000/configurator` を実機確認したところ 2 つの runtime エラー:

1. **Hydration mismatch in Sidebar.tsx**
   - 報告された差分: server `flex h-16 items-center gap-2.5 bg-slate-900 px-5` vs client `flex h-16 items-center gap-2 px-5`
2. **TypeError: items.map is not a function** in `lib/configurator/promptBuilder.ts` `bulletList(items)` (contentIdea 選択時)

## 決定・変更

### 1. promptBuilder の Sanity-tolerant 化

- 新規 export: `normalizeTextList(value: unknown): string[]`
  - `null / undefined / ""` → `[]`
  - `string` → `[trim]`
  - `number / boolean` → `[String(v)]`
  - `string[]` → そのまま（trim + filter empty）
  - `object[]` with `title / text / value / name / label / claim / objection / description / _key` → string
  - Portable Text-like block `{children:[{text}]}` → children.text を結合
  - mixed array は再帰 normalize
- `bulletList` の signature を `string[] | undefined` → **`unknown`** に変更し、内部で `normalizeTextList` 経由
- `buildPrompt` の `audience` / `audiencePain` 呼び出しを `normalizeTextList` を通して長さ判定するように
- `ContentIdeaOption` 型の `audience` / `audiencePain` を `string[]` → **`unknown`** に変更（コメントで「schema は text / array of string、データセット移行で混在し得るので unknown + normalize」を明記）

### 2. ContentIdeaSelectorCard の同期

- audiencePain は Sanity schema 上 `type: 'text'`（**単一 string**）なのに rendering で `.map` を直接呼んでいたため、`promptBuilder` を直す前は preview card 側でも次の選択で同じ TypeError が起きる潜在バグだった
- `audienceList = normalizeTextList(selected.audience)` / `audiencePainList = normalizeTextList(selected.audiencePain)` を component 内で 1 度算出して、両 list で `.length > 0` 判定 + `.map` を使う形に修正

### 3. Sidebar ハードニング

- 報告された className 差分（client が `gap-2`, server が `gap-2.5 bg-slate-900`）は **HMR cache** が原因（source code は既に新しい dark-navy ヘッダー）。Phase UI-2.5 で sidebar header が変わったとき、boss の dev server が古い bundle を保持していた
- 念のため `usePathname() ?? ''` で defensive 化（Next 16 で usePathname が null を返すケースに備える）
- header の className は意図的に **完全 static**。`gap-2.5 bg-slate-900 px-5` はファイル上で hardcoded、SSR / hydration とも同一を保証
- ファイル先頭にコメントで「className は完全 static、ヘッダーは pathname に依存しない」と明記
- AppNav は deprecated コメント付きで残置（import 元なし）、AppShell は Sidebar を 1 度だけ render しているのを再確認

### 4. 動作確認用 inline スクリプト

テスト framework は追加しない。`normalizeTextList` の挙動確認に node ワンライナーで 10 ケースを通した（全 PASS）:

```
PASS bulletList(undefined) => []
PASS bulletList(null) => []
PASS bulletList("") => []
PASS bulletList("single text") => ["single text"]
PASS bulletList(["a","b"]) => ["a","b"]
PASS bulletList([{title:"a"},{text:"b"}]) => ["a","b"]
PASS bulletList([{children:[{text:"a"},{text:"b"}]}]) => ["ab"]
PASS bulletList(["a", null, "", {title:"c"}]) => ["a","c"]
PASS bulletList([{_key:"x"}]) => ["x"]
PASS bulletList(42) => ["42"]
```

## 理由

- **schema 真実主義**: contentIdea.audiencePain は schema 上 `type: 'text'`、`audience` は `array of string`。GROQ もそのまま返すので、TypeScript の型を「全部 string[]」と決め打ちしていたのが破綻の根本原因
- **normalize at the boundary**: Sanity の dataset は schema 変更で形が変わることがある（特に audiencePain は将来 array 化される可能性も）。型を `unknown` にして、UI / prompt builder の境界で 1 度だけ正規化することで、データセット側の揺れに耐える
- **Sidebar は source code 問題ではない**: hydration mismatch の class 差分は古い HMR bundle。source は正しい。dev server 再起動で解決する。ただし `usePathname() ?? ''` の defensive 化は将来の同種事故予防として安価
- **テスト framework 追加しない**: CLAUDE.md「明示的に依頼されるまで足場を追加しない」方針に沿って、inline node ワンライナーで挙動確認

## 影響

- `/configurator` で contentIdea を選んだ瞬間の crash は解消
- audience / audiencePain が string / array / object[] / null どの形でも UI が落ちない
- TypeScript 型が schema 真実と整合（`unknown` + normalize）
- Sidebar の HMR cache 問題は **boss の dev server 再起動が必要**（source 側は OK）
- 23 routes 動作維持、Sanity Studio 7.9s clean
- Sanity 書き込みなし / API 連携追加なし / 依存追加なし

## 次の一手

1. **boss に dev server 再起動を依頼**: `Ctrl-C` → `cd dashboard && npm run dev` で HMR cache クリア
2. 再起動後 `/configurator` を再確認:
   - contentIdea を切り替えてもエラー出ない
   - 右側の preview が更新される
   - 「プロンプトをコピー」がクリックできる
3. Sidebar hydration mismatch が再発しないことを 5 page 巡回で確認（/ /campaigns/[slug] /outputs /publish /configurator）
4. 問題なければ Visual Review fidelity spec（docs/77）に進む

## 発信ネタ候補

- 「型を信じすぎた話」: TypeScript で `string[]` と書くと「絶対 array」と仮定して `.map` を呼んでしまうが、外部データ source（Sanity / API）は型を保証しない。`unknown` + normalize at the boundary が結局頑健
- 「HMR cache が嘘をついた日」: hydration mismatch の class 差分が source code に存在しない時、それは古いブラウザ bundle。dev server 再起動で 1 秒で直る話
- 「`audiencePain` は string だったか array だったか」: Sanity schema を信じてないコードが救う
