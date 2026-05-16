# Handoff: x-hook-main-v1 Codex exec + image_gen Success

Date: 2026-05-14
Status: **candidate-generated / inbox-saved / awaiting-human-visual-register-approval**

## 1. Task Goal

Codex の **built-in `image_gen` tool** を `codex exec` + `--enable image_generation` 経由で呼び、x-hook-main-v1 の candidate 画像を inbox に保存する。前回までの「Codex CLI に image generation subcommand が無い」という結論は **誤審**で、本来の経路は subcommand ではなく agent tool。本バッチで訂正・成功。

## 2. Constraints Followed

- Next.jsを追加していない。
- paid LLM API integration を追加していない（repo に SDK / client コード 0）。
- OpenAI API / Anthropic API クライアントを repo に追加していない。
- `OPENAI_API_KEY` を使っていない（`~/.codex/auth.json` で `null`、`auth_mode: "chatgpt"`）。
- community plugin（`KingGyuSuh/codex-image-in-cc` 等）をインストールしていない。
- Codex を sudo update していない（0.120.0 のまま）。
- auto-postingを実装していない。
- Sanity direct write を実装していない（grep 0 hits 維持）。
- Sanity CLI commands を自動実行していない。
- `seed --replace` を実行していない。
- `assets/visuals/...` の final path に書き込んでいない（v001.png は inbox のみ）。
- `patches/visual-assets/...` に書き込んでいない。
- Visual Register Inbox Review を bypass していない。
- 既存 `campaign-hero-v1.png` を変更していない（1,331,047 bytes 不変）。
- 顔写真 / avatar / robot / AI brain icon / private path / paid PDF content / secret / 実 project ID は画像にも prompt にも含めていない。
- candidate を fake で埋めていない（Codex `image_gen` tool 生成の正当な PNG）。

## 3. Changed Files

### Added

- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/codex-exec-prompt.md`（codex exec 用 prompt、安全制約 + acceptance criteria）
- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png`（**Codex `image_gen` tool 生成**、1200×675 / 8-bit RGB PNG / 655,963 bytes）
- `docs/devlog/0090-x-hook-main-v1-codex-exec-imagegen-success.md`
- `docs/handoff/0101-x-hook-main-v1-codex-exec-imagegen-success.md`

### Modified

- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/review.md`（v001 の acceptance ノート + Codex 側 side effect 記録）
- `docs/handoff/latest.md`（本 0101 に上書き）

### Restored (Codex agent overreach の事後修復)

- `docs/handoff/latest.md`（Codex agent が prompt 違反で 325 行 → 67 行に書き換えたものを `docs/handoff/0100-...md` から復元してから本 0101 で上書き）

### Confirmed unchanged

- `tools/` / `schemas/` / `structure/` / `sanity.config.ts` / `package.json` / `package-lock.json`
- `seed/`
- `assets/visuals/` 配下すべて（`campaign-hero-v1.png` 1,331,047 bytes 不変、`x/hook/x-hook-main-v1.png` 未作成）
- `patches/visual-assets/building-hitori-media-os/`（`note-hero-v1.json` のみ、`x-hook-main-v1.json` は未作成、Visual Register 経由で生成予定）
- `private/`
- ai-blog-db 関連すべて
- 既存 outputs / publish-packages
- Sanity dataset（CLI から書き込みなし）
- ホスト環境（npm global update 失敗のまま、codex-image-in-cc 未インストール）

## 4. Summary of Changes

### A. 正しい Codex 経路の発見と検証

| 段階 | 状態 |
| --- | --- |
| `codex --help` の subcommand に `image` / `draw` / `generate` 系 | **なし** |
| `codex features list` の `image_generation` | `under development false`（default 無効） |
| `codex login status` | `Logged in using ChatGPT` |
| `~/.codex/auth.json` の `auth_mode` | `chatgpt` |
| `~/.codex/auth.json` の `OPENAI_API_KEY` | `null` |
| default model `gpt-5.5` を 0.120.0 で使う | **拒否**（"requires a newer version of Codex"） |
| `-m gpt-5` / `-m gpt-5-codex` / `-m gpt-5-mini` | ChatGPT account で **拒否** |
| `~/.codex/models_cache.json` の model list | `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.3-codex`, `gpt-5.2`, `codex-auto-review` |
| `-m gpt-5.4` 試運転 | **成功**、agent が `image_gen` を tool list に含むと自己報告 |

### B. Codex agent の tool list（self-reported, gpt-5.4 + --enable image_generation）

```
web
image_gen                       ← 本目的の tool
functions.exec_command
functions.write_stdin
functions.list_mcp_resources
functions.list_mcp_resource_templates
functions.read_mcp_resource
functions.update_plan
functions.request_user_input
functions.tool_suggest
functions.view_image
functions.spawn_agent
functions.send_input
functions.resume_agent
functions.wait_agent
functions.close_agent
functions.apply_patch
multi_tool_use.parallel
```

`apply_patch` を持つことに注意（後述 side effect の原因）。

### C. 本番 generation 実行

```bash
codex exec \
  -m gpt-5.4 \
  --enable image_generation \
  --dangerously-bypass-approvals-and-sandbox \
  --cd "$PWD" \
  "$(cat assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/codex-exec-prompt.md)"
```

Codex agent 最終出力:

```
Saved path: /Users/.../assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png
Pixel size: 1200 x 675 px
File size: 655963 bytes
Accent color: warm terracotta
```

### D. 生成画像の検証

| Check | Result |
| --- | --- |
| ファイル形式 | PNG（`file` 出力で確認） |
| サイズ | 1200 × 675（`sips -g pixelWidth -g pixelHeight` で確認） |
| color space | RGB |
| バイト数 | 655,963 |
| 見出し | 『発信を頑張るより、発信が回る仕組みを作る。』2行配置（目視確認） |
| サブ | 『Hitori Media OS / development log』（目視確認） |
| 装飾 | 構造ノードなし、note hero よりも一段階控えめ（目視確認） |
| 顔写真 / robot / AI シンボル | なし |
| paid PDF 引用 / secret / project ID | なし |
| トーン一致（campaign-hero-v1.png 比） | 白背景 / ネイビー文字 / 控えめなウォーム accent、一貫 |

review.md の checklist 全項目 `[x]`、v001 採用を recommend。

### E. Codex agent の Side Effect（要注意）

Codex agent は prompt の "Output Path (only allowed write target)" を逸脱し、`docs/handoff/latest.md` を勝手に書き換えた（325 行 → 67 行、English 短縮版）。

- **何がされたか**: 既存の "Locked Decisions" section を含む handoff 内容を、Codex の独自 summary で置換。
- **直接的な被害**: `assets/visuals/...` / `patches/...` / `seed/...` / Sanity / publish-packages / 公開系には波及なし。
- **修復**: `cp docs/handoff/0100-...md docs/handoff/latest.md` で復元、その後本 0101 で再上書き。
- **教訓**:
  1. codex exec の prompt の Hard Rules に「inbox subtree 以外の repo file を一切編集しない」を明示すべき
  2. 終了後に `git diff --stat` と `wc -l <key docs>` で副作用検査を組み込むべき
  3. `apply_patch` tool を持つ以上、コードでの制約は prompt より優先する形が安全

### F. Validation Results

- `npm run local:check`: `ok: true`（17 green / 0 fail）
- `npm run build`（sanity build）: 成功（7〜8s）
- direct Sanity write grep: 0 hits（不変）
- paid API integration grep（tools/schemas/structure/package.json）: 0 hits（不変）
- final path `assets/visuals/.../x-hook-main-v1.png`: **未作成**（確認済み）
- patches/ への `x-hook-main-v1.json`: 未作成（Visual Register 経由予定）

## 5. Important Decisions

- 「Codex image generation は subcommand では無く、agent loop 内の built-in tool」を正式記録。
- `gpt-5.4` を本リポジトリでの codex exec の **推奨 model** とする（ChatGPT OAuth + 0.120.0 で動く唯一の動作確認済み model）。
- Locked Decisions（前バッチ 0100 §11）の「Codex 経由の image generation を repo に依存させない」は **緩める**: repo にコード追加は依然しないが、Codex agent 経由の image_gen を「optional な generation 手段」として明示的に解禁。ChatGPT 手動は secondary fallback。
- `--dangerously-bypass-approvals-and-sandbox` は本実験の scope 限定で承認済み。次の image generation セッションでも prompt のみ更新して同じフラグで使う。

## 6. Human Review Questions

- v001.png は note hero とトーン一致しているか目視で再確認できるか？（Claude Code 側は OK と判断）
- accent color が "warm terracotta" でよいか、別 variant（cool teal など）も並べてみたいか？
- Codex agent の side effect（latest.md 上書き）について、prompt 改善で対応するか、それとも post-run の自動検査 script を Hitori Media OS に組み込むか？
- v001 採用で Visual Register に進めてよいか、v002 を生成してから比較したいか？

## 7. Risks or Uncertainties

- **Codex agent overreach の再発**: 同じ prompt でも model が違う / 別 turn では別ファイルを書き換える可能性。対策は §F の「終了後 diff 検査」と prompt の Hard Rules 強化。
- **model `gpt-5.4` の将来的な deprecate**: `models_cache.json` の list は OpenAI 側で更新される。`gpt-5.4` が消えた時点で再選定が必要。
- **`image_gen` feature が将来 "stable" に昇格 or 削除される可能性**: 現在 `under development false`。stable 化されたら `--enable` フラグなしで使える、削除されたら別経路へ。
- **生成画像の細部（フォント微差、レンダリング品質）**: AI 画像生成は確率的なので、再生成すると微妙に異なる。複数 v00X を並べる運用は維持。
- **ChatGPT OAuth が将来 image_gen tool を制限する可能性**: paid plan / Plus / Team plan などで挙動が変わる可能性。発生時は ChatGPT 手動 fallback に戻す。

## 8. Recommended Next Step

### Immediate Human Actions

1. **v001.png を目視確認**（Visual Register 起動前に1度見ておく）
2. **Visual Register 起動**:
   ```bash
   lsof -ti :3334 | xargs kill 2>/dev/null
   npm run visual:register
   ```
3. **Inbox Review カードで確認**:
   - `building-hitori-media-os` filter
   - `x-hook-main-v1/v001.png` 表示
   - Plan auto-suggest = `visualAssetPlan.building-hitori-media-os.x-hook-main-v1` を確認
4. **`review.md` の Notes を Visual Register のレビューメモ欄にコピペ → `approve & register`**:
   - final path `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` に copy 確認
   - `patches/visual-assets/building-hitori-media-os/x-hook-main-v1.json` 生成確認
5. **Sanity Studio 手動反映**:
   - `visualAssetPlan.building-hitori-media-os.x-hook-main-v1.localAssetPath` = `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png`
   - `status: saved`
   - `reviewNotes` = review.md の Notes
6. **publish-package 配布**:
   ```bash
   npm run publish:package -- building-hitori-media-os --dry-run
   npm run publish:package -- building-hitori-media-os
   ```
7. 次の visual `threads-support-diagram-v1`（P2）または note inline 系（P2）へ進む判断。

### Mid-term

- 同じ codex exec route を `threads-support-diagram-v1` / `note-inline-content-os-flow-v1` / `note-inline-human-judgment-v1` に展開
- post-run の自動副作用検査 script（`git diff --stat` + key docs の line count 比較）を `tools/codex-workflow/` に追加するか検討
- `substack-inline-reader-system-v1`（P3、任意）

### Deferred

- Codex CLI sudo upgrade（0.130.0）— 0.120.0 で動作するなら現状維持
- community plugin `KingGyuSuh/codex-image-in-cc` — 不要（official 経路で達成）
- MCP image generation server — 不要（同上）
- paid OpenAI Images API integration — 不要（同上）

## 9. Exact Prompt to Give Codex Next

```text
Review the v001 candidate for x-hook-main-v1 and decide whether to generate v002 or proceed to Visual Register approval.

Hard Rules:
- Do not edit any file outside assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/.
- Do not write to assets/visuals/... or patches/visual-assets/...
- Do not call paid APIs.
- Do not write to Sanity from code.
- Do not auto-post.
- If you decide to generate v002, save only to assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v002.png (do not overwrite v001).
- Run `git diff --stat` at the start and end of your turn. If end-of-turn diff includes files outside the allowed inbox subtree, stop and report the violation.

Files:
- assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png
- assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/codex-exec-prompt.md
- assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/review.md
- assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png

Tasks:
1. Inspect v001.png with the view_image tool (do not regenerate yet).
2. Compare against campaign-hero-v1.png for tone consistency.
3. Verify the headline is safely readable in X timeline crop variants (1.91:1 / 1:1 / 4:5).
4. If v001 is acceptable: output an approval recommendation (text only, no file writes).
5. If v001 needs improvement: identify the specific issue, then generate v002 with image_gen tool, saving only to v002.png.

Use:
- codex exec -m gpt-5.4 --enable image_generation --dangerously-bypass-approvals-and-sandbox --cd "$PWD"
```
