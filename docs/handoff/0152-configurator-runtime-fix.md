# Handoff: /configurator runtime fix

Date: 2026-05-19

## 1. Task Goal

Phase UI-fidelity-5 で実装した `/configurator` を boss が実機確認した際に発生した 2 つの runtime エラー（`bulletList items.map is not a function` / Sidebar hydration mismatch）の修正のみ。他の feature work（Visual Review fidelity 等）は **scope 外**。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ package 追加なし
- ✅ `/publish-package/[slug]` v0.2 unchanged
- ✅ 23 routes 動作維持
- ✅ `/configurator` UI 挙動は bug fix 以外変更なし
- ✅ OpenAI / Anthropic API 連携なし

## 3. Changed Files

### 更新 (4)

- `dashboard/src/lib/configurator/promptBuilder.ts`
  - 新規 export `normalizeTextList(value: unknown): string[]`
  - `bulletList` の引数を `string[] | undefined` → **`unknown`** に変更、内部で normalize
  - `buildPrompt` の audience / audiencePain ハンドリングを normalize 経由に
- `dashboard/src/lib/groq/configurator.ts`
  - `ContentIdeaOption.audience` を `string[]` → `unknown`
  - `ContentIdeaOption.audiencePain` を `string[]` → `unknown`（schema 上は `text` の単一 string）
- `dashboard/src/components/configurator/ContentIdeaSelectorCard.tsx`
  - audience / audiencePain を component 内で `normalizeTextList` 通して算出 → length 判定 + map
- `dashboard/src/components/app-shell/Sidebar.tsx`
  - `usePathname() ?? ''` で defensive 化
  - header className は完全 static である旨を file-level comment で明示

### 新規 docs

- `docs/devlog/0141-configurator-runtime-fix.md`
- `docs/handoff/0152-configurator-runtime-fix.md`（本ファイル）
- `docs/handoff/latest.md`（mirror）

## 4. Summary of Changes

### 4-1. Root cause: promptBuilder

`contentIdea.audiencePain` の **Sanity schema は `type: 'text'`（単一 string）** だが、GROQ クエリ / TypeScript 型 / promptBuilder は **`string[]` 前提**で書かれていた。boss が contentIdea を選択するとそこが `bulletList(string)` で呼ばれ、内部の `string.map` が無いので TypeError。

### 4-2. Root cause: Sidebar hydration mismatch

報告された className 差分:
- server: `flex h-16 items-center gap-2.5 bg-slate-900 px-5`
- client: `flex h-16 items-center gap-2 px-5`

source code は **新しい dark navy header**（gap-2.5 + bg-slate-900）と一致。これは **HMR cache** で boss のブラウザに Phase UI-2.5 以前の bundle が残っていた case。**dev server 再起動が必要**。

source 側の修正は不要だが、念のため `usePathname() ?? ''` で defensive 化 + ヘッダーが完全 static である旨を file-level comment で明示。

### 4-3. normalizeTextList 仕様

`normalizeTextList(value: unknown): string[]`:

| 入力 | 出力 |
|---|---|
| `undefined` / `null` | `[]` |
| `""` (空 / 空白のみ) | `[]` |
| `"single text"` | `["single text"]` |
| `42`, `true` | `["42"]`, `["true"]` |
| `["a", "b"]` | `["a", "b"]` |
| `["a", null, "", {title:"c"}]` | `["a", "c"]` |
| `[{title:"a"}, {text:"b"}]` | `["a", "b"]` |
| `[{_key:"x"}]` | `["x"]` |
| `[{children:[{text:"a"},{text:"b"}]}]` | `["ab"]`（Portable Text 風） |
| 認識できない object | `[]` |

オブジェクトから text を引く際の優先順位: `title` > `text` > `value` > `name` > `label` > `claim` > `objection` > `description` > `_key`。

`bulletList(items: unknown): string` は normalize 後 `[]` なら `"  (未設定)"`、それ以外は `  - <item>` 改行区切り。

### 4-4. ContentIdeaSelectorCard

`audiencePain` を `.map` していたのが promptBuilder と同じ理由で潜在 TypeError。next-step の規模に応じて normalize に揃えた。

### 4-5. Builds

```
cd dashboard && npm run build  → ✓ 23 routes (unchanged)
npm run build (sanity)         → ✓ Build Sanity Studio (7921ms)
```

### 4-6. normalizeTextList behavior check

`node --input-type=module -e '...'` ワンライナーで 10 ケース全 PASS:

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
--- 10 passed, 0 failed
```

test framework は追加しない（CLAUDE.md 方針）。devlog 0141 にも結果を記録。

## 5. Key Decisions

- **`unknown` + normalize at boundary**: contentIdea の audience / audiencePain は schema 上 `array of string` / `text`（単一 string）と異なる。さらに dataset が時間と共に schema 変更を受ける可能性もあるため、TypeScript 型を `unknown` で受けて UI / prompt builder 境界で normalize、という形に
- **Portable Text 風サポート**: 将来 schema を `block` 型に変えても落ちないよう `children[].text` を結合するパターンも入れた。費用は数行
- **Sidebar source は無変更で十分**: HMR cache が原因のため source code 変更は不要。defensive な `?? ''` と comment のみ追加し、boss に dev server restart を依頼
- **test framework 追加せず**: inline node ワンライナーで挙動確認。CLAUDE.md「明示的に依頼されるまで足場を追加しない」方針に整合
- **ContentIdeaSelectorCard も同期**: promptBuilder だけ直しても、preview card 側で同じ TypeError が起きる潜在バグだったので 1 batch で揃えた

## 6. Human Review Questions

1. **dev server 再起動後にも hydration mismatch が残るか?** → 残れば別の hydration source（layout / globals.css）を疑う必要あり
2. **`audience` の dataset 実態**: 既存 building-hitori-media-os の `audience` は `string[]`、`audiencePain` は単一 string か。一度 boss の手元で値を見て normalize が機能していることを確認できると安心
3. **normalize の object キー優先順位**: `title` > `text` > `value` > ... の順で OK か。boss が特定の field 順を望むなら microbatch
4. **未来の schema 変更**: audiencePain を array 化する選択肢があるか（spec によっては悩みを複数 bullet にしたい）。schema 変更は本 batch scope 外
5. **Sidebar comment**: file-level に書いた静的 className 注意書きは過剰でないか

## 7. Risks or Uncertainties

- **HMR cache の再発**: boss の dev server を kill しても DevTools / Service Worker cache が残ると同じ症状が続く可能性。ハードリロード（Cmd-Shift-R）を案内
- **`unknown` 型の伝播**: ContentIdeaOption を import している他箇所が今後増えると、`audience` を string[] と思って .map する新コードを書ける。コメントで normalize 経由を案内したが、lint rule 化はしていない
- **Portable Text サポートの過剰さ**: 現在 schema は `text` / `array of string` で block 型は使っていない。children パターンは保険であり、現在動かないことは確認していない（ただし unit-like check で機能することは確認）
- **`normalizeTextList` の名前**: 「text list」とした方が「全部 string になる」を表現できるかどうか。`coerceToStringList` でも良かったが、現状で違和感を boss が感じたら rename microbatch

## 8. Recommended Next Step

1. **boss が dev server を完全再起動**:
   ```
   # 既存 dev server を Ctrl-C で停止
   cd dashboard && npm run dev
   # ブラウザでハードリロード (Cmd-Shift-R)
   ```
2. `/configurator` を再確認:
   - contentIdea を切り替えてもエラー出ない
   - 右側の preview が更新される
   - audience / audiencePain の chip / bullet が出る（dataset に値があれば）
   - 「プロンプトをコピー」が動く
3. 5 page 巡回で Sidebar hydration mismatch が再発しないことを確認:
   - `/` / `/campaigns/building-hitori-media-os` / `/outputs` / `/publish` / `/configurator`
4. 問題なければ次の選択肢（前 handoff §8 と同じ）:
   - **Visual Review fidelity spec** (`13_02_43 (6).png` → docs/77)
   - **Dashboard `ContentOutputConfiguratorCard` cleanup**
   - **promptTemplate dataset 投入**
   - **Phase UI-4 P2 (実 generation) 議論**

## 9. Exact Codex Prompt for "Visual Review fidelity spec"

```text
Create fidelity spec for /visual-assets and /visual-assets/[assetId]/candidates (Visual Review) pages.

Inputs:
- Ideal screenshot: docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (6).png
- Current state:
  - dashboard/src/app/visual-assets/page.tsx (asset list)
  - dashboard/src/app/visual-assets/[assetId]/page.tsx (asset detail)
  - dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx (candidate comparison)
- Reference docs:
  - docs/68 (design system)
  - docs/69 (implementation plan)
  - docs/handoff/0152 (latest after configurator runtime fix)

Hard Rules (audit + spec docs only):
- Do NOT modify code in this batch.
- Do NOT modify Sanity schema.
- Do NOT add packages.
- Do NOT modify other pages.
- Audit-only docs deliverable.

Tasks:

1. Analyze ideal screenshot and identify:
   - page structure (3 connected routes)
   - components (candidate thumbnail / approval workflow / status pipeline / etc)
   - color tones
   - missing data sources

2. Compare with current state:
   - audit existing /visual-assets implementation
   - list components that need replacement vs reuse

3. Create docs:
   - docs/77-visual-review-fidelity-spec.md
   - docs/devlog/<番号>-visual-review-fidelity-spec.md
   - docs/handoff/<番号>-visual-review-fidelity-spec.md
   - docs/handoff/latest.md (mirror)

4. Exact Codex prompt for Phase UI-fidelity-6 (Visual Review implementation) included in handoff §9.

Validation:
- npm run build
- cd dashboard && npm run build
(docs-only, both builds remain unchanged)
```
