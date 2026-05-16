# Devlog 0089 — x-hook-main-v1 Codex Candidate Generation (attempt)

Date: 2026-05-14
Status: blocked-by-codex-image-gen-unavailability / inbox-ready
Re-investigation: 2026-05-14 (2nd batch) — confirmed even after Codex CLI / Claude Code plugin audit, image generation is still not safely available locally; ChatGPT manual fallback maintained.
Lock-in: 2026-05-14 (3rd batch) — Codex sudo upgrade と community image plugin `KingGyuSuh/codex-image-in-cc` の見送りを **standing policy** として確定。再評価 trigger は handoff 0100 §11 参照。

## 今日の判断

Claude Code 内から Codex を使って `x-hook-main-v1` の最初の production candidate 画像を生成する依頼を受けた。**Codex CLI（`/usr/local/bin/codex`）には image generation サブコマンドが存在しない**ため、honest path（依頼書の Task 4）に沿って、画像生成は実施せず、ChatGPT 用の paste-ready prompt と inbox 環境を整えるところまでに留めた。

Codex CLI が提供する subcommand:

```text
exec   review   login   logout   mcp   mcp-server   app-server   app
completion   sandbox   debug   apply   resume   fork   cloud   exec-server
features   help
```

image / draw / generate 系のコマンドはない。Codex は code agent。

placeholder image を作って "生成済み" のフリをするのは Constraint 違反（"Do not fake the result. Do not create placeholder image files."）なので、画像ファイルは1枚も作っていない。

## なぜその設計にしたか

- candidate 画像を **嘘で埋めない**: Visual Register Inbox Review は人間の最終判断機構なので、入口に fake image が積まれると判断ノイズになる。
- inbox path だけは **先に整えておく**: 人間が ChatGPT で画像生成した直後、迷わず `v001.png` として保存できるよう、フォルダと prompt.md / review.md を準備した。
- prompt は brief から **そのままコピー可能な形** にした: `tasks/visuals/.../x-hook-main-v1.md` の Generation Prompt をベースに、X preview crop の中央 70% 制約を1段だけ強化した。

## Codex と Claude Code の役割分担

| 役割 | 担当 |
| --- | --- |
| 画像 candidate 生成 | **人間 + ChatGPT**（Codex CLI / Claude Code は不可） |
| inbox path / prompt / review.md 整備 | **Claude Code**（このバッチで実施済み） |
| inbox から approve & register | **人間 + Visual Register UI** |
| final path への copy / patch JSON 生成 | **Visual Register（コード経由、人間トリガー）** |
| Sanity Studio 反映 | **人間**（CLI 不可、direct write 禁止） |
| publish-package 配布 | **`npm run publish:package` + 人間トリガー** |

このバッチで Claude Code は **画像を1枚も生成・保存していない**。`assets/visuals/...` も無変更。

## API なしで済ませた理由

- paid image generation API（OpenAI Images、Midjourney API、Stable Diffusion paid 系）を導入していない。
- ChatGPT UI に貼り付けて生成 → ダウンロード → inbox 保存、の **手動ワークフロー**を維持。
- 結果として candidate の生成主体は人間のままで、Visual Register Inbox Review の人間承認ゲートも崩れない。

## このバッチで作ったもの

- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/`（空フォルダ）
- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/prompt.md`（paste-ready prompt + asset metadata + tone reference + safety 制約）
- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/review.md`（candidate v00X ごとのレビューメモ template）
- `docs/devlog/0089-x-hook-main-v1-codex-candidate-generation.md`（本ファイル）
- `docs/handoff/0100-x-hook-main-v1-codex-candidate-generation.md`
- `docs/handoff/latest.md`（0100 と同内容に更新）

## 連番について

- devlog: 0087（Sanity structure）/ 0088（x-hook-main-v1 prep）が既に埋まっていたため、**0089** を使用。
- handoff: 0098（Sanity structure）/ 0099（x-hook-main-v1 prep）が既に埋まっていたため、**0100** を使用。

## 発信ネタになりそうな切り口

1. **「Codex は code agent、画像 agent ではない」**: AI を雑に「全部やってくれる」と扱わず、各 agent の能力境界を運用ドキュメントに書く。Hitori Media OS の運営者にとって "どの工程を誰が担うか" を明示するのは差別化要素。
2. **「Inbox を空のまま整える」という設計**: 画像生成が不可能とわかった瞬間、placeholder で埋めるのではなく **空のままにする**。後続の人間ワークフローを fake で汚さない判断。
3. **paste-ready prompt + review template** の二段構え: 生成と評価を別ファイルに分けることで、「prompt 改善ループ」と「採用判断ループ」が混ざらない。

## 次の人間アクション

1. ChatGPT で `prompt.md` の paste-ready prompt を実行 → 画像 download → `v001.png` として inbox に保存
2. `npm run visual:register` 起動（既存プロセスは `lsof -ti :3334 | xargs kill`）
3. Inbox Review カードで `building-hitori-media-os` フィルタ → `x-hook-main-v1/v001.png` 表示 → Plan auto-suggest 確認
4. 採用なら `approve & register` → final path `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` に copy + patch JSON
5. Sanity Studio で `visualAssetPlan.building-hitori-media-os.x-hook-main-v1` 手動更新
6. `npm run publish:package -- building-hitori-media-os` で配布

## Safety Verified

- direct Sanity write の grep → 0 hits（不変）
- paid API integration の grep → 0 hits（不変）
- `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` 未作成（final path 不可侵）
- candidate image 0 件（inbox には prompt.md / review.md のみ）
- `npm run local:check`: `ok: true`
- `npm run build`: 成功

---

## 追加調査 (2nd batch, 2026-05-14)

「Codex の更新 / Claude Code plugin / image bridge を経由すれば image generation が可能か」という再依頼を受けて、以下を確認。

### Codex CLI

| 項目 | 結果 |
| --- | --- |
| 現在のバージョン | `codex-cli 0.120.0` (`/usr/local/bin/codex`) |
| npm registry 最新 | `@openai/codex@0.130.0` |
| `npm i -g @openai/codex@latest` | **EACCES で失敗**（`/usr/local/lib/node_modules` への書き込み権限なし、sudo が必要） |
| 0.120.0 の `codex --help` subcommands | `exec` / `review` / `login` / `logout` / `mcp` / `mcp-server` / `app-server` / `app` / `completion` / `sandbox` / `debug` / `apply` / `resume` / `fork` / `cloud` / `exec-server` / `features` / `help` |
| image generation 系 subcommand | **存在しない** |
| `codex exec --image <FILE>...` | **入力**として画像を attach するオプションであり、**出力**ではない |

人間判断: sudo での global update は **スキップ**（passwords を Claude Code に渡さない方針、かつ 0.130.0 でも image generation subcommand 追加の保証なし）。

### Official Claude Code Codex plugin

```
claude plugin list
  ❯ codex@openai-codex
    Version: 1.0.3
    Scope: user
    Status: ✔ enabled
```

**既にインストール済み**。提供 slash commands:

```
~/.claude/plugins/cache/openai-codex/codex/1.0.3/commands/
  adversarial-review.md
  cancel.md
  rescue.md
  result.md
  review.md
  setup.md
  status.md
```

agents:

```
~/.claude/plugins/cache/openai-codex/codex/1.0.3/agents/
  codex-rescue.md
```

→ **review / delegation 専用**。image generation 用 slash command / agent は無い。

### Community plugin `KingGyuSuh/codex-image-in-cc`

- third-party（OpenAI 公式ではない）
- 内部実装が paid OpenAI Images API を呼ぶ可能性が高い
- 本プロジェクトの CLAUDE.md 制約「paid LLM / image generation API integration を追加しない」と方針衝突

人間判断: **インストールしない**。ChatGPT 手動運用を維持。

### MCP server 経由の image generation

`codex mcp` で MCP server を attach できるが:

- image generation を提供する trusted MCP server は本プロジェクトでは未設定
- 設定するには別途 paid API キー or local 画像生成モデル（Stable Diffusion 等）が必要
- 「Hitori Media OS の運用判断としてローカル画像モデル / paid API を導入するか」は別バッチでの設計判断

このバッチでは **MCP image server も追加しない**。

### 結論（再投資後）

- Codex CLI（0.120.0 / 0.130.0 どちらも）からの image generation は不可。
- Official Codex plugin は review/delegation 専用で image gen は提供しない。
- Community image bridge は paid API 依存で repo 方針と衝突するためスキップ。
- 本環境で **安全に**（paid API なし / repo 不汚染で）image generation できる手段は無い。
- **人間が ChatGPT で生成 → inbox 保存** の手動運用が当面唯一の安全 path。

### このバッチで追加 / 変更したもの

| ファイル | 変更内容 |
| --- | --- |
| `docs/devlog/0089-x-hook-main-v1-codex-candidate-generation.md` | 本節「追加調査」を append |
| `docs/handoff/0100-x-hook-main-v1-codex-candidate-generation.md` | 同等の追加調査セクションを append |
| `docs/handoff/latest.md` | 0100 と同内容に再上書き |
| `npm`, `assets/`, `tools/`, `schemas/`, `package.json` | **無変更**（plugin/CLI install は user-scope のみで repo に痕跡なし） |

### 発信ネタになりそうな切り口（追加）

- 「Codex / OpenAI plugin / Claude Code plugin」と、似た名前の異なる役割を整理する記事は1本書ける（読者の混乱を解消する効用）
- 「community plugin を入れる前に、repo の方針と衝突しないか問う」のが Hitori Media OS の運用原則になっていることを軽く明文化できる
- paid API を **使わない判断** を毎バッチ繰り返し再確認するパターン自体が、building-in-public ネタになる
