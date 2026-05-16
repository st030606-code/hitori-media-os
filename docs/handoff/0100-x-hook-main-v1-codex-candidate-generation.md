# Handoff: x-hook-main-v1 Codex Candidate Generation (Codex image-gen unavailable, inbox ready)

Date: 2026-05-14
Status: **codex-image-gen-unavailable / inbox-ready / awaiting-human-chatgpt-generation**
Re-investigation: 2026-05-14 (2nd batch) — Codex CLI / Claude Code plugin / image bridge を audit し、ChatGPT 手動 fallback の維持を再決定。
Lock-in: 2026-05-14 (3rd batch) — community image plugin の見送り、Codex sudo upgrade 見送りを **standing policy** として確定（次の判断 trigger まで再評価しない）。

## 1. Task Goal

Claude Code 内から Codex を使って `x-hook-main-v1` の最初の production candidate 画像を生成し、inbox に保存する依頼を受けた。

**結論**: Codex CLI v1（`/usr/local/bin/codex`）には image generation サブコマンドが存在しないため、画像は生成していない。依頼書の Task 4（"If Codex image generation is unavailable: Do not fake the result. Do not create placeholder image files. Instead: stop, report, provide the exact final prompt for the human to paste into ChatGPT, keep the inbox path ready."）に従い、inbox の準備のみを実施。

## 2. Constraints Followed

- Next.jsを追加していない。
- paid LLM API integration を追加していない。
- OpenAI API / Anthropic API クライアントを repo に追加していない。
- external APIを呼んでいない。
- auto-postingを実装していない。
- Sanity direct write を実装していない（grep 0 hits 維持）。
- `seed --replace` を実行していない。
- Sanity CLI commands を自動実行していない。
- `assets/visuals/...` の final path に画像を保存していない。
- Visual Register Inbox Review を bypass していない。
- 既存 `campaign-hero-v1.png` を変更していない。
- 顔写真 / avatar / robot / AI brain icon / private path / paid PDF content / secret / 実 project ID を扱っていない。
- candidate 画像を **fake で埋めていない**（placeholder image 0 件）。

## 3. Changed Files

### Added

- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/`（フォルダ、画像 0 件）
- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/prompt.md`（paste-ready prompt + asset metadata + tone reference）
- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/review.md`（candidate v00X ごとのレビューメモ template）
- `docs/devlog/0089-x-hook-main-v1-codex-candidate-generation.md`
- `docs/handoff/0100-x-hook-main-v1-codex-candidate-generation.md`

### Modified

- `docs/handoff/latest.md`（本 handoff と同内容で上書き）

### Confirmed unchanged

- 既存スキーマ全般 / `schemas/index.ts` / `sanity.config.ts` / `structure/index.ts`
- `tools/visual-register/` / `tools/publish-package-builder/` / `tools/local-check.mjs`
- 既存 outputs / publish-packages（前バッチで配布した `campaign-hero-v1.png` を含む）
- 既存 seed
- `private/`
- ai-blog-db 関連すべて
- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`（前バッチで作成、不可侵）
- `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` → **未作成のまま**（確認済み）

## 4. Summary of Changes

### A. Codex Image Generation Capability Check

```bash
$ which codex
/usr/local/bin/codex

$ codex --help
Codex CLI
...
Commands:
  exec         Run Codex non-interactively
  review       Run a code review non-interactively
  login        Manage login
  logout       Remove stored authentication credentials
  mcp          Manage external MCP servers for Codex
  mcp-server   Start Codex as an MCP server
  app-server   [experimental] Run the app server or related tooling
  app          Launch the Codex desktop app
  completion   Generate shell completion scripts
  sandbox      Run commands within a Codex-provided sandbox
  debug        Debugging tools
  apply        Apply the latest diff produced by Codex agent
  resume       Resume a previous interactive session
  fork         Fork a previous interactive session
  cloud        [EXPERIMENTAL] Browse tasks from Codex Cloud
  exec-server  [EXPERIMENTAL] Run the standalone exec-server binary
  features     Inspect feature flags
  help         Print this message
```

→ image / draw / generate 系のサブコマンドは **存在しない**。Codex CLI は code agent 専用。

### B. Inbox Preparation

```text
assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/
  prompt.md   ← paste-ready ChatGPT prompt + asset metadata + safety constraints
  review.md   ← candidate v00X 用レビューメモ template
  (v001.png は人間が ChatGPT 生成後に保存する)
```

### C. Final Path Untouched (verified)

```bash
$ test -e assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png
FINAL PATH DOES NOT EXIST   ← 望ましい状態
```

### D. Validation Results

- `npm run local:check` → `ok: true`（全 15 チェック green、後述）
- `npm run build`（sanity build）→ 成功（後述）
- direct Sanity write の grep → 0 hits（不変）
- paid API integration の grep → 0 hits（不変）
- `assets/visuals/.../x-hook-main-v1.png` → 未作成（確認済み）
- candidate image 0 件（fake placeholder なし）
- Visual Register approval → **pending**

## 5. Important Decisions

- **Codex CLI に image generation サブコマンドがない事実を発見した時点で stop**。`exec` を経由して LLM に画像を作らせる迂回手段を取らず、honest path（依頼書 Task 4）に従った。
- candidate を fake placeholder image で埋めない（Inbox Review の判断ノイズになるため）。
- inbox path だけは整える（人間が ChatGPT 生成後に迷わず保存できるよう）。
- prompt と review template は別ファイル（生成 prompt の改善ループと採用判断ループを混ぜない）。
- 既存 `campaign-hero-v1.png` は tone reference として参照しただけで一切編集していない。

## 6. Human Review Questions

- ChatGPT で paste-ready prompt を実行するタイミングはいつか？
- 生成結果 1 枚目が note hero とトーン一致していなかった場合、prompt をどこから調整するか（accent color の指定をより厳密にするか、ノード形状を強調するかなど）？
- v001 採用 / v002 以降に進む基準（X タイムライン inline crop で文字が完全に読めるか）を Visual Register Inbox Review のレビューメモにどう書くか？
- Codex 側で image generation MCP server を追加して将来的にローカル化する選択肢を残すか、ChatGPT 手動運用を当面維持するか？

## 7. Risks or Uncertainties

- **Codex の将来バージョンで image generation が追加された場合**、本 handoff の "Codex CLI does not support image generation" は古くなる。発見次第 update する想定。
- **ChatGPT 生成画像のトーン揺れ**: paste-ready prompt は厳密に指定しているが、生成は確率的なので 1 回で note hero と完全一致しないことが多い。3〜5 回試して並べ比較する運用を推奨。
- **Visual Register の Plan auto-suggest が外れるリスク**: candidate filename を `v001.png`（subfolder = `x-hook-main-v1`）にしている限り、`tools/visual-register/server.mjs` の suggestion ロジックは visualAssetSlug を `x-hook-main-v1` として推定するはず。動かなければ手動で Plan を選択する。
- **paste-ready prompt の中央 70% 制約**: X の inline preview crop は media 構成によって 1.91:1 / 1:1 / 4:5 など可変。1 枚で全 crop を満たそうとすると装飾が更に減る可能性。生成後の preview crop 確認は人間判断。
- **既存 inbox `note-hero-v1-attempt-1.png` の扱い**: 前バッチで残置を許容したが、`x-hook-main-v1/` フォルダとの混在は無いため Inbox Review への影響はない（candidate は subfolder 単位で取り扱われる）。

## 8. Recommended Next Step

### Immediate Human Actions（順序厳守）

1. **ChatGPT を開いて paste-ready prompt を実行**:
   - source: [assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/prompt.md](../../assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/prompt.md)
   - tone reference として `campaign-hero-v1.png` を ChatGPT にもアップロード（並べて比較指示）
2. **生成画像を download → inbox に保存**:
   ```text
   assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png
   ```
   既存 v001.png があれば `v002.png`（上書き禁止）。
3. **Visual Register 起動 / 再起動**:
   ```bash
   lsof -ti :3334 | xargs kill 2>/dev/null
   npm run visual:register
   ```
4. **Inbox Review で確認**:
   - `building-hitori-media-os` フィルタ
   - `x-hook-main-v1/v001.png`（or v00X）が表示される
   - Plan auto-suggest = `visualAssetPlan.building-hitori-media-os.x-hook-main-v1` を確認
5. **review.md のレビューメモを Inbox Review のレビューメモ欄にコピペ → `approve & register`**:
   - final path `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` への copy 確認
   - `patches/visual-assets/building-hitori-media-os/x-hook-main-v1.json` 生成確認
6. **Sanity Studio 手動反映**:
   - `visualAssetPlan.building-hitori-media-os.x-hook-main-v1.localAssetPath` = `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png`
   - `status: saved`
   - `reviewNotes`（review.md の Notes をコピペ）
7. **publish-package 配布**:
   ```bash
   npm run publish:package -- building-hitori-media-os --dry-run    # 先に確認
   npm run publish:package -- building-hitori-media-os               # 実配布
   ```
8. **次の visual** に進む判断（`threads-support-diagram-v1` / `note-inline-content-os-flow-v1` / `note-inline-human-judgment-v1`）。

### Mid-term

- `threads-support-diagram-v1`（P2）
- `note-inline-content-os-flow-v1`（P2）
- `note-inline-human-judgment-v1`（P2）
- `substack-inline-reader-system-v1`（P3、任意）

### Deferred

- Codex 側に image generation MCP server を追加する選択肢
- Instagram carousel slides
- 顔写真ワークフロー（YouTube サムネ / Shorts cover / Podcast cover）
- 動画 / 音声ファイル本体生成
- subscriber milestone / paid readiness 活性化

## 9. Exact Prompt to Give Codex Next

```text
Confirm whether x-hook-main-v1 candidate has been generated and inbox-saved by the human.

Do not generate the image yourself.
Do not save anything to assets/visuals/...
Do not write to Sanity from code.
Do not call paid APIs.
Do not auto-post.

Use:
- assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/prompt.md
- assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/review.md
- docs/handoff/latest.md (= 0100-x-hook-main-v1-codex-candidate-generation.md)

Steps:
1. Check whether assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png (or v002.png, etc) exists.
2. If yes: report file size, suggest the human run "npm run visual:register" if not already running, and remind the approval / Sanity / publish-package flow.
3. If no: the human has not yet generated the candidate via ChatGPT. Do not nag, just confirm inbox is ready and the prompt is paste-ready.
4. Never copy candidate images to assets/visuals/... yourself.
5. Never call approve-and-register API yourself.

Do not pretend a candidate exists if it does not.
Do not bypass Visual Register Inbox Review.
```

---

## 10. 追加調査 (2nd batch, 2026-05-14)

「Codex を更新 / Claude Code plugin / image bridge 経由で image generation を有効化できるか」という再依頼を受けて以下を audit。**追加で repo にコードを書いていない**（ドキュメントのみ更新）。

### A. Codex CLI version audit

| 項目 | 結果 |
| --- | --- |
| 現在 | `codex-cli 0.120.0`（`/usr/local/bin/codex`） |
| npm 最新 | `@openai/codex@0.130.0` |
| `npm i -g @openai/codex@latest` | **EACCES**（`/usr/local/lib/node_modules` への書き込み権限なし）、sudo 必要 |
| 人間判断 | **sudo update スキップ**（password を渡さない、0.130.0 でも image gen subcommand 追加保証なし） |
| 0.120.0 `codex --help` | image / draw / generate 系 subcommand **なし**、`-i, --image <FILE>...` は入力 attach 専用 |

### B. Official Claude Code Codex plugin

```text
claude plugin list
  ❯ codex@openai-codex
    Version: 1.0.3
    Scope: user
    Status: ✔ enabled
```

→ **既にインストール済み**。slash commands は `adversarial-review` / `cancel` / `rescue` / `result` / `review` / `setup` / `status`、agent は `codex-rescue` のみ。**image generation 用は無い**（依頼書通り）。

### C. Community plugin `KingGyuSuh/codex-image-in-cc`

- third-party、内部実装は paid OpenAI Images API を呼ぶ可能性が高い
- CLAUDE.md 制約「paid LLM / image generation API integration を追加していない」と衝突する余地
- 人間判断: **インストールしない**

### D. MCP image generation server

- `codex mcp` で MCP server を attach 可能だが、trusted な image gen MCP server は未設定
- 設定すると paid API key または local 画像生成モデル（Stable Diffusion 等）が必要
- 本バッチでは **MCP image server を追加しない**

### E. 確定した運用方針

| Path | Status |
| --- | --- |
| Codex CLI sudo update | **skipped**（権限要・効果不明） |
| Official `codex@openai-codex` plugin | **既設**、本目的（image gen）には貢献しない |
| Community `codex-image-in-cc` | **skipped**（paid API 依存、repo 方針衝突） |
| MCP image server | **skipped**（このバッチでは設計しない） |
| **ChatGPT manual generation → inbox 保存** | **active fallback、唯一の安全 path** |

### F. 本バッチで触ったもの / 触らなかったもの

| 触ったもの | 内容 |
| --- | --- |
| `docs/devlog/0089-x-hook-main-v1-codex-candidate-generation.md` | "追加調査" セクションを append |
| `docs/handoff/0100-x-hook-main-v1-codex-candidate-generation.md` | 本セクション append |
| `docs/handoff/latest.md` | 0100 と同内容に再上書き |

| 触らなかったもの | 確認手段 |
| --- | --- |
| `package.json` / `package-lock.json` | `git status` で diff 0 |
| `tools/` / `schemas/` / `structure/` / `sanity.config.ts` | 同上 |
| `assets/visuals/` 配下すべて | `campaign-hero-v1.png` 1,331,047 bytes 不変、`x/hook/x-hook-main-v1.png` 未作成 |
| `assets/inbox/.../x-hook-main-v1/` | `prompt.md` / `review.md` のみ、candidate image 0 件 |
| codex CLI install | EACCES でロールバック不要（update 失敗で 0.120.0 のまま） |
| Claude Code plugins | 既存 `codex@openai-codex@1.0.3` のまま、新規 install 0 |

### G. 再確認した Recommended Next Step

依頼書 Part 6 / 本 handoff の §8 を維持。**人間が ChatGPT で生成 → inbox 保存** の手動 path を進める。`approve & register` 以降は §8 と完全同一。

---

## 11. Locked Decisions (2026-05-14, 3rd batch)

以下を **standing policy** として確定。次に明示的な再評価依頼があるまで、本リポジトリ内でこれらの代替手段の検証を再度走らせない。

| 項目 | 決定 | 理由 |
| --- | --- | --- |
| Codex CLI sudo upgrade（0.120.0 → 0.130.0） | **見送り** | system-wide 変更を Claude Code 経由で実行しない方針。0.130.0 でも image generation subcommand 追加保証なし。 |
| community plugin `KingGyuSuh/codex-image-in-cc` | **インストールしない** | third-party、内部実装が paid OpenAI Images API を呼ぶ可能性。CLAUDE.md の「paid LLM / image generation API integration を追加しない」と方針衝突。 |
| Codex 経由の image generation を repo に依存させる | **しない** | Codex は code review / task delegation 専用として運用。 |
| MCP image generation server を追加 | **しない**（本バッチでは） | trusted な無料ローカル画像生成 MCP が現環境にない。Stable Diffusion local 等を導入するかは別バッチでの design 判断。 |
| paid OpenAI Images API / その他 paid image generation API の repo 統合 | **しない** | local-first 制約維持。 |
| fake placeholder image | **作らない** | Visual Register Inbox Review の判断ノイズになる。 |

### Confirmed workflow (locked)

```text
1. 人間が ChatGPT を開く
2. assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/prompt.md の
   paste-ready prompt + tone reference (campaign-hero-v1.png) を貼り付け
3. 生成画像を download
4. assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png に保存
   （上書き禁止、再生成は v002.png 以降）
5. npm run visual:register（既存プロセスは lsof -ti :3334 | xargs kill）
6. Inbox Review で approve & register
7. Sanity Studio で localAssetPath / status: saved / reviewNotes を手動更新
8. npm run publish:package -- building-hitori-media-os で配布
```

### Triggers for re-evaluation

以下のいずれかが発生したら本 locked decision を見直す:

- OpenAI Codex CLI が公式に **無料** image generation subcommand を提供する
- Anthropic Claude Code が公式に image generation tool を提供する
- ローカル動作する trusted な image generation MCP server を選定する design batch を行う
- 人間判断で「paid image API を Hitori Media OS に導入する」運用方針転換を明示する

再評価まで、本 handoff / devlog 0089 / handoff latest.md の workflow を **唯一の安全 path** として扱う。
