# Handoff: Phase 2B-1 reactionNotes write implementation

Date: 2026-05-20

## 1. Task Goal

handoff/0177 (devlog 0166) で Phase 2B-1 spec が finalized になった。次は実装。`/analytics` 上で `manualPublishingStatus[].reactionNotes` を inline 編集する **Hitori Media OS 初の controlled Sanity write surface** を導入する。

Constraints はすべて遵守: Sanity schema 不変、publish-package / assets / patches / package.json touch なし。書き込みは `enableWriteActions` flag + `SANITY_WRITE_TOKEN` の AND-gate で local/dev のみ発火、production permanently disabled。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし、shadcn 追加なし (native HTML + Tailwind)
- ✅ Visual Register write actions 未実装
- ✅ promptTemplate save 未実装
- ✅ audit-log schema 未実装 (Q-6 confirmed: in-memory + 10秒 toast undo のみ)
- ✅ 自動 devlog 生成なし (Q-10 confirmed: server `console.log` のみ for local debugging)
- ✅ 23 routes すべて intact (build 確認済)
- ✅ writes は `enableWriteActions` + `SANITY_WRITE_TOKEN` 両方が揃ったときのみ発火
- ✅ Production / preview / development scope (Vercel) には env を設定しない原則を README に明示

## 3. Changed Files

### 新規ファイル (3)

| File | 役割 | 行数 |
|---|---|---|
| [dashboard/src/lib/actions/sanityWriteClient.ts](dashboard/src/lib/actions/sanityWriteClient.ts) | token-bearing Sanity write client factory (lazy init, returns null when token missing) | 46 |
| [dashboard/src/lib/actions/updateReactionNotes.ts](dashboard/src/lib/actions/updateReactionNotes.ts) | `'use server'` action — 4 layer safety + 9 step flow + dry-run / execute、`expectedRevision` required | 269 |
| [dashboard/src/components/analytics/ReactionNoteEditor.tsx](dashboard/src/components/analytics/ReactionNoteEditor.tsx) | `'use client'` inline editor — read / edit / saving / saved / error / undo / conflict-reload / disabled の 8 state、textarea max 2000 字、10秒 toast undo | 280 |

### 更新ファイル (6)

| File | 主要変更 |
|---|---|
| [dashboard/src/lib/featureFlags.ts](dashboard/src/lib/featureFlags.ts) | `enableWriteActions` export 追加 — opt-in 設計、dev default `false`、`ENABLE_WRITE_ACTIONS=true` でのみ true |
| [dashboard/src/lib/groq/outputs.ts](dashboard/src/lib/groq/outputs.ts) | `campaignPlan` projection に `_rev` 追加、`CampaignWithPublishingRaw._rev?` field 追加 |
| [dashboard/src/app/analytics/page.tsx](dashboard/src/app/analytics/page.tsx) | `enableWriteActions` import、`hasWriteToken = Boolean(process.env.SANITY_WRITE_TOKEN)` server-side check、`buildReactionRows` / `buildPendingRows` で `campaignId` / `campaignRev` / `itemKey` thread-through、両 card に新 props |
| [dashboard/src/components/analytics/ReactionNotesCard.tsx](dashboard/src/components/analytics/ReactionNotesCard.tsx) | `ReactionNoteRow` に identity fields 追加、`<ReactionNoteEditor variant="filled">` 統合、header text に「編集可」追記 (writeReady 時) |
| [dashboard/src/components/analytics/PendingMonitoringCard.tsx](dashboard/src/components/analytics/PendingMonitoringCard.tsx) | 同上 + writeReady 時は inline editor、disabled 時は元の「記入」 link 動作維持、`variant="empty"` |
| [dashboard/README.md](dashboard/README.md) | Feature flags 表に `ENABLE_WRITE_ACTIONS` 行追加、Environment 注意書きに `SANITY_WRITE_TOKEN` を追記 (Vercel 禁止)、新規セクション 「Phase 2B-1 write actions」 追加 (enablement / safety layers / out of scope) |

### コード変更 (合計 9 ファイル / 1 PR 完結規模)

`schemas/` / `tools/` / `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `package.json` / config files いずれも touch なし。

## 4. Summary of Changes

### 4-1. Feature flag behavior

```
ENABLE_WRITE_ACTIONS unset             → enableWriteActions = false
ENABLE_WRITE_ACTIONS=true              → enableWriteActions = true
ENABLE_WRITE_ACTIONS=false             → enableWriteActions = false
NODE_ENV=production + ENABLE_WRITE_ACTIONS=true (anti-pattern boss は設定しない約束)
                                       → enableWriteActions = true だが
                                          Vercel に SANITY_WRITE_TOKEN を入れない契約で
                                          server action は missing-token で abort
```

既存 flag (`ENABLE_DIAGNOSTICS` / `ENABLE_LOCAL_FS_ROUTES`) は dev default `true` だが、`ENABLE_WRITE_ACTIONS` は **opt-in** (dev でも default `false`)。書き込みを「うっかり enable」させない設計。

### 4-2. Write client behavior

- `getSanityWriteClient()` は `process.env.SANITY_WRITE_TOKEN` を read time で参照
- token 無し → `null` 返却 (write client は作らない)
- token あり → `@sanity/client` の `createClient({useCdn: false, perspective: 'published', token})` を返却
- 同 module は **server-only** に閉じる (`'use server'` の `updateReactionNotes.ts` からのみ import される)
- token 値は client bundle に inline されない (Next.js は `NEXT_PUBLIC_*` prefix なしの env を server に閉じる)

### 4-3. Server action behavior (`updateReactionNotes`)

**Input** (`UpdateReactionNotesInput`):
```ts
{
  campaignId: string         // CAMPAIGN_ID_RE: /^[a-zA-Z0-9_.-]{4,200}$/
  itemKey: string            // ITEM_KEY_RE: /^[a-zA-Z0-9_-]{4,64}$/
  platform: string           // PLATFORM_RE: /^[a-zA-Z0-9_-]{1,32}$/
  newReactionNotes: string   // ≤ 2000 chars
  expectedRevision: string   // REVISION_RE: /^[a-zA-Z0-9_-]{4,64}$/ — REQUIRED
  mode: 'dry-run' | 'execute'
}
```

**9 step flow** (in order, fail-fast):

1. `enableWriteActions` check → `write-disabled` if false
2. `SANITY_WRITE_TOKEN` check via `getSanityWriteClient()` → `missing-token` if absent
3. Input validation (regex + length + mode enum) → `validation` if any field bad
4. Fetch target doc with `*[_id == $id && _type == "campaignPlan"][0]{_id, _rev, manualPublishingStatus[]{_key, platform, reactionNotes}}`
5. `not-found` if doc absent
6. `conflict` if `doc._rev !== expectedRevision` (server-side re-check)
7. `not-found` if no item matches `_key === itemKey`
8. `validation` if item.platform !== requested platform (defense-in-depth)
9. Dry-run: return preview / Execute: `client.patch(id, {ifRevisionID: expectedRevision}).set({['manualPublishingStatus[_key=="..."].reactionNotes']: newValue})` inside a transaction with `autoGenerateArrayKeys: false`

**Output** (`UpdateReactionNotesResult`):
```ts
| {ok: true; mode: 'dry-run'; campaignId; itemKey; previousValue; newValue; currentRevision}
| {ok: true; mode: 'execute'; campaignId; itemKey; previousValue; newValue; newRevision; committedAt}
| {ok: false; error: 'validation' | 'missing-token' | 'write-disabled' | 'permission' | 'not-found' | 'conflict' | 'unknown'; message}
```

**Server console.log** (Q-10 confirmed, local debugging only):
- stage: `start`, `rejected`, `dry-run-ok`, `execute-ok`, `conflict`, `permission`, `error`
- metadata only: `mode`, `campaignId`, `itemKey`, `platform`, `newLength` (length, NOT content), `elapsedMs`, `newRevision`
- **token never logged**, **new value content never logged**

### 4-4. Conflict handling (Q-8 confirmed)

両方の防御:
1. Server: 再 fetch して `doc._rev !== expectedRevision` で 409 を **commit 前に検知** → `error: 'conflict'`
2. Sanity API: `ifRevisionID` を patch options に渡し、Sanity 側でも reject 強制

UI 側:
- 受信した `error: 'conflict'` → rose banner「他で編集された可能性があります。画面を更新してください」 + 「更新」 button
- click → `router.refresh()` で server component を再描画 (新しい `_rev` を取得)
- 3-way merge UI / last-write-wins は **実装しない** (spec §8 厳守)

### 4-5. Undo behavior (Q-6 confirmed)

- execute 成功時、server response に `previousValue` を含める → client state に保持
- emerald toast「保存しました — <platform>」 + 「元に戻す」 button + 閉じる button
- 「元に戻す」 click → server action を `mode: 'execute'` + `newReactionNotes = previousValue` + **freshly-acquired `newRevision`** で再 invoke
- toast は `setTimeout(10_000)` で自動消滅、消滅と同時に status を `read` に遷移
- page reload / navigate away で undo 履歴 **消失** (in-memory only)
- multiple undo / redo / history なし
- audit-log schema / persistent log なし

### 4-6. UI behavior

**`<ReactionNotesCard>`** (filled rows, max 8):
- read mode: line-clamp-2 + 「編集」 button (writeReady=true) または disabled「編集」 button (writeReady=false)
- edit mode: textarea (rows=3, maxLength=2000) + 文字数カウンター + 「保存」 / 「キャンセル」
- saving: spinner + textarea readOnly + `aria-busy`
- saved: 10秒 emerald undo toast
- error: rose banner with recovery hint (`conflict` 時は「更新」 button)
- writeReady=false: 全部 read-only、編集 button は disabled + tooltip 表示

**`<PendingMonitoringCard>`** (pending rows, max 6, 24h+ age):
- writeReady=false: 既存の「記入」 link が `/publish-package/[slug]#<platform>` に飛ぶ (旧動作完全維持)
- writeReady=true: 「記入」 link 非表示、各 li の下に `<ReactionNoteEditor variant="empty">` を inline 展開、初期 textarea は空
- 保存後は revalidate で row が消える (24h+ で reactionNotes 未記入 という条件を満たさなくなる)

### 4-7. Header text 更新

両 card の header description に writeReady=true 時のみ「· 編集可」「· その場で記入可」を追記して boss が「今 enable されているか」が一目で分かるようにした。

## 5. Key Decisions

- **Write client を `lib/actions/sanityWriteClient.ts` に物理分離**: `lib/sanity.ts` (read) と混ざらない、誤 import 防止、token lookup を lazy 化
- **`expectedRevision` を required**: optional のままだと「未指定で last-write-wins 化」する path が残る、Q-8「no last-write-wins」を厳密化
- **Server で `_rev` を再 verify**: Sanity の `ifRevisionID` だけに頼らず、`client.fetch` で `doc._rev` を read してから比較。Sanity の network failure / API change への防御
- **`platform` 一致を server で verify**: payload tampering 防御。client が `_key` を改竄しても、`_key` と `platform` の組合せが一致しない `manualPublishingStatus` 要素は reject
- **Pending card の writeReady=false fallback を維持**: 既存 link が消えると古い UX が壊れる、writeReady=true 時のみ inline editor、それ以外は元の link 動作
- **Header に「編集可」 indicator**: boss が「flag が効いている」のを毎回確認しやすい、debugging 中の認知負荷削減
- **`useTransition` で server action 呼び出し**: React の標準パターン (Next.js docs `mutating-data.md` に従う)、`isPending` / `aria-busy` を自然に表現
- **Undo の `setTimeout` を `useRef` に保持**: cleanup を unmount + 新規 save で重複 timer を防ぐ
- **`router.refresh()` を execute 後にも呼ぶ**: KPI count / pending list の数字を即更新
- **Defensive log の構造化 prefix**: `[updateReactionNotes:stage]` で grep しやすい、boss が dev server stdout で trace を追える

## 6. Human Review Questions

### Smoke test (boss が localhost で確認すべき項目)

1. `.env.local` に `ENABLE_WRITE_ACTIONS=true` + `SANITY_WRITE_TOKEN=<Editor>` 設定 → `npm run dev` → `/analytics` で「編集可」 indicator が出るか?
2. `<ReactionNotesCard>` の row で「編集」 click → textarea 展開 → 文字入力 → 保存 → Sanity Studio で diff 確認?
3. 10秒以内に「元に戻す」 click → 旧値が復元されるか?
4. Sanity Studio で同 record を編集 → dashboard で再保存 → `conflict` banner + 「更新」 button が出るか?
5. `ENABLE_WRITE_ACTIONS=false` に戻して再起動 → 「編集」 button が disabled + tooltip 表示?
6. `SANITY_WRITE_TOKEN` だけ削除 → 同上?
7. `<PendingMonitoringCard>` の inline editor 動作?

### 設計判断 review (boss が「これで良い」と感じるか)

8. **「編集可」 indicator の位置**: header の subtitle に出している。boss が「もっと目立たせる / 控えめに」希望があれば調整
9. **textarea maxLength 2000**: 1500 / 3000 等の調整余地
10. **Undo toast の 10 秒**: 5 秒 / 15 秒の調整余地
11. **disabled 編集 button の tooltip**: 「編集は ENABLE_WRITE_ACTIONS=true かつ SANITY_WRITE_TOKEN 設定時のみ」が長い、もう少し短く?
12. **Pending card の writeReady=false fallback**: 既存「記入」 link を残したが、boss が「flag off ならボタン全部消す」希望なら変更可
13. **Server console log の出力量**: stage ごとに log を吐いている、boss が「verbose すぎ」感じれば error / conflict のみに削減可

## 7. Risks or Uncertainties

- **`_rev` を GROQ で fetch する cache 動作**: `force-dynamic` + `revalidate: 0` なので毎回 fresh fetch だが、CDN / build cache の影響を未確認。Production deploy では write が走らないので問題が顕在化しない、localhost で発見されにくい cache layer がある可能性
- **`@sanity/client` の transaction return shape**: spec通り `returnDocuments: true` で commit して新 `_rev` を抜き出しているが、`@sanity/client` のバージョン (7.22.0) と return shape の整合は実 write で確認するまで断言できない。ローカル test 推奨
- **Server action via React 19 / Next.js 16**: `'use server'` directive と `useTransition` の組合せは新 (React 19) で、edge case で 「server action が二重発火」 する可能性が theoretical にあり (boss confirm まで unverified)
- **Undo の cross-tab 動作**: 別 tab で同 record を編集していると undo が想定外の上書きをする可能性。`expectedRevision` で防御されるが、user が「undo を押したら conflict が出た」UX を経験する可能性
- **Empty reactionNotes 削除**: `set: ''` で空文字を保存できる (spec §4-4 通り)。Sanity Studio の `manualPublishingStatus[].reactionNotes` が `string` (空文字 OK) で `unset` ではない。schema 上 optional なので空文字保存は安全だが、boss UX の好みで「空文字保存禁止」も検討余地
- **`/analytics` 以外の surface 上の boss workflow**: `/publish-package/[slug]` の reactionNotes は依然編集できない。boss が「両方で編集したい」と判断すれば Phase 2B-1.1 batch で `<ReactionNoteEditor>` を再利用展開
- **Smoke test 未実施 (Claude Code 側)**: 本 batch は build green のみで実 write を走らせていない。boss の手元で write が初めて発火する。これは boss preference に従った設計

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- **Smoke test 結果反映**: boss が試した結果、cache / `@sanity/client` return shape / edge case で問題があれば microbatch で fix
- **`DeferredActionButton` の partial 削除**: `/analytics` 以外で残っている `<DeferredActionButton>` は次の 2B-2 (W5 humanReviewGate state) で順次削除予定。Phase 2B-1 では `<DeferredActionButton>` を import しない / 触らないで通過

### 中期 (Phase 2B-2 関連)

- **Phase 2B-2 spec batch (W5 humanReviewGate state)**: 同じ 4 layer safety + 9 step flow + 8 UI state template を W5 に転用
- **`ReactionNoteEditor` の generalize**: W5 で state dropdown を作る時に「edit UI primitive」として共通化検討 (現状は inline 専用)

### 長期

- **Audit log schema (Q-4) 確定後**: 永続 undo / 詳細 audit を入れたい場合に再評価
- **`/publish-package/[slug]` 上の reactionNotes 編集**: boss workflow 次第で展開可

## 9. Next Recommended Step

**Phase 2B-1 manual smoke test on localhost**

実装は build green、`.next/static/` の token leak audit も clean。次は boss が手元で実際に 1 件 write を流して挙動を verify する段。

```
1. cd dashboard
2. Add to .env.local:
     ENABLE_WRITE_ACTIONS=true
     SANITY_WRITE_TOKEN=<editor-role-from-sanity-manage>
3. npm run dev
4. http://localhost:3000/analytics
5. Verify:
   - "編集可" indicator on both cards
   - <ReactionNotesCard> "編集" button → textarea → 保存 → Sanity Studio で diff
   - 10秒以内に「元に戻す」 → 復元
   - Sanity Studio で並行編集 → dashboard で save → conflict banner
   - ENABLE_WRITE_ACTIONS=false (再起動) → disabled state
   - SANITY_WRITE_TOKEN 削除 (再起動) → disabled state
6. Server stdout で [updateReactionNotes:stage] log を確認 (token / new value 本文が出ていないことを目視)
```

問題があれば microbatch で fix。問題なければ **Phase 2B-2 spec batch (W5 humanReviewGate state)** に進む。

---

### Exact prompt for next Claude Code session (Phase 2B-2 spec batch、smoke test OK 前提)

```
Phase 2B-2 W5 humanReviewGate state update の detail spec を docs-only で起こしてください。

入力:
- docs/specs/phase-2b-write-actions.md (parent spec、§0.5 で Phase 2B-2 = W5 確定)
- docs/specs/phase-2b-1-reaction-notes.md (Phase 2B-1 spec、template 元)
- docs/handoff/0178-phase-2b-1-reaction-notes-implementation.md (2B-1 実装の学び)

スコープ:
W5 = humanReviewGates[].state を /human-review-gates から更新可能にする。
state は controlled vocabulary (pending-review / in-progress / done / blocked) なので dropdown UI、テキスト入力ではない。
4 layer safety + 9 step flow + 8 UI state template を W5 に転用。

Open question 候補:
- 複数 gate を 1 commit で更新するか (現状の patch 1 件 / commit 1 件原則維持か)
- "blocked" 遷移時に reason 入力を要求するか
- undo 戦略 (Q-6 を W5 でも採用するか、別判断か)

constraints は 2B-1 と同じ:
- Sanity schema 変更なし、Sanity 書き込みなし (spec のみ)
- publish-package / assets/visuals / patches 不変
- package 追加なし
- 23 routes 維持
```

## 10. Build validation summary

```
$ cd dashboard && npm run build
✓ Compiled successfully in 1410ms
  Finished TypeScript in 2.1s
✓ Generating static pages using 13 workers (3/3) in 65ms

Routes: 18 page routes + 5 API routes = 23 total (unchanged from prior batch)

$ npm run build  (repo root, sanity studio)
✔ Build Sanity Studio (7636ms)

$ grep "SANITY_WRITE_TOKEN" dashboard/.next/static/
→ 1 hit: error message string "SANITY_WRITE_TOKEN が設定されていません"
  (env var NAME in i18n string, not the token VALUE)
→ no token value leakage
```

Token value reads (only 2 sites):
- `src/lib/actions/sanityWriteClient.ts:29` — actual `process.env.SANITY_WRITE_TOKEN` read in server-only module
- `src/app/analytics/page.tsx:251` — `Boolean(process.env.SANITY_WRITE_TOKEN)` in Server Component (returns boolean, not value, never reaches client)

Production write path verification:
- `enableWriteActions` defaults to `false` even in dev (opt-in flag) — production deploy without env var stays disabled
- `getSanityWriteClient()` returns `null` when token absent — server action returns `missing-token` before any Sanity call
- AND-gate: even with flag forced on, missing token still aborts; even with token present, missing flag still aborts
