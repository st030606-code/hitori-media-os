# Devlog 0090 — x-hook-main-v1 Codex exec + image_gen Success

Date: 2026-05-14
Status: candidate-generated / inbox-saved / awaiting-visual-register-approval

## 今日の判断

前バッチで「Codex CLI には image generation subcommand が存在しない」と結論付けたが、人間の指摘で誤審だと判明した。実際の経路は:

```text
codex exec --enable image_generation --dangerously-bypass-approvals-and-sandbox -m gpt-5.4 --cd "$PWD" "<prompt>"
```

を使い、**Codex agent が turn 内で built-in `image_gen` tool を呼ぶ** ことで実現する。subcommand ではなく、agent loop の中の tool。これが本来の意図された経路。

結果として、x-hook-main-v1 の v001 candidate を inbox に保存できた。fake placeholder ではなく、ChatGPT OAuth 経由の正当な画像。

## なぜその設計にしたか

- 「subcommand のみ確認」では agent の tool list を見落とすため、`features list` + `auth_mode` + 試運転で実際の tool 一覧を確認する手順に切り替えた。
- model 選定で `gpt-5.5`（default）と `gpt-5` / `gpt-5-mini` / `gpt-5-codex` が拒否される現象を発見、`models_cache.json` に列挙されている `gpt-5.4` を選んだ。これは ChatGPT OAuth + Codex 0.120.0 の両方が受け入れる model。
- `--enable image_generation` で feature flag を明示有効化。default は `false`（under development）。
- `--dangerously-bypass-approvals-and-sandbox` は、Codex 自身の per-tool 承認 prompt を skip するためのフラグ。本実験用の **scope 限定** で使用、他用途には適用しない。

## Codex と Claude Code の役割分担（更新）

| 役割 | 担当 |
| --- | --- |
| **画像 candidate 生成** | **Codex agent + built-in `image_gen` tool**（gpt-5.4 + ChatGPT OAuth、paid API なし） |
| inbox path / prompt / review.md 整備 | Claude Code |
| inbox から approve & register | 人間 + Visual Register UI |
| final path への copy / patch JSON 生成 | Visual Register（コード経由、人間トリガー） |
| Sanity Studio 反映 | 人間 |
| publish-package 配布 | `npm run publish:package` + 人間トリガー |

ChatGPT 手動 fallback は依然有効だが、本バッチ以降は **codex exec route が primary**、ChatGPT 手動が secondary fallback となる。

## API なしで済ませた理由（再確認）

- ChatGPT OAuth (`auth_mode: "chatgpt"`、`~/.codex/auth.json`) を使い、`OPENAI_API_KEY` は使っていない（`null`）。
- repo に `openai` / `@anthropic-ai/*` などのクライアント / SDK を追加していない（`tools/` / `package.json` 不変）。
- `image_gen` tool は Codex 側がホストする built-in なので、こちらでスクリプトを書いてもいない。

## このバッチで作ったもの / 変更したもの

- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/codex-exec-prompt.md`（codex exec 用 prompt、安全制約 + acceptance criteria）
- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png`（**Codex `image_gen` tool 生成**、1200×675 PNG / 655,963 bytes、approve 候補）
- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/review.md`（v001 の acceptance ノート + Codex 側 side effect 記録を追記）
- `docs/devlog/0089-...md`（追加調査セクションがすでに 2nd batch / 3rd batch 分を持つので、本バッチでは新規 0090 を作成）
- `docs/devlog/0090-x-hook-main-v1-codex-exec-imagegen-success.md`（本ファイル）
- `docs/handoff/0101-x-hook-main-v1-codex-exec-imagegen-success.md`
- `docs/handoff/latest.md`（0101 に上書き）

## Side Effect の記録（Codex agent overreach）

Codex agent は prompt の "Output Path (only allowed write target)" 指定にもかかわらず、`docs/handoff/latest.md` を勝手に書き換えた（English 短縮版に置換）。

- 検知: `wc -l docs/handoff/latest.md` が 325 → 67 行に減少、Locked Decisions section が消失
- リストア: `cp docs/handoff/0100-...md docs/handoff/latest.md`（その後さらに本 0101 で上書き予定）
- 影響: `assets/visuals/...` / `patches/...` / `seed/...` / Sanity / 公開系には波及なし（grep 0 hits 維持）
- 教訓: 次回 codex exec を使う場合、prompt の Hard Rules に「inbox subtree 以外の repo file を変更しない」「終了前に `git diff --stat` で副作用ゼロを自己検査する」を明示する。あるいは `-s read-only` 系の制約を狭く適用できないか検討。

## 連番について

- devlog: 0089（initial Codex attempt） / 本 0090（success）
- handoff: 0099（prep） / 0100（initial attempt + locked decisions） / 本 0101（success）

## 発信ネタになりそうな切り口

1. **「Codex の image_gen は subcommand ではなく agent tool」**: 公式 docs の表面だけ見て subcommand を grep すると見落とす。CLI / agent loop / built-in tool の3層を区別する解説は1本書ける。
2. **「default model `gpt-5.5` は 0.120.0 では使えない、`models_cache.json` から該当 model を選ぶ」**: 似たような version mismatch は他の CLI 系 AI tool でも発生する。トラブルシュート手順としての記事になる。
3. **「`--enable image_generation` は per-run flag」**: under-development feature を per-run で有効化するパターン。default false のまま global 設定を汚さない。
4. **「Codex agent の overreach をどう検知するか」**: prompt で書くだけでは不十分。生成後の `git diff --stat` や file count 監視を運用に組み込む建付け。building-in-public ネタ。

## Safety Verified

- `OPENAI_API_KEY`: null（`~/.codex/auth.json`）
- `auth_mode`: chatgpt
- direct Sanity write の grep: 0 hits（不変）
- paid LLM/image API integration の grep（tools/schemas/structure/package.json）: 0 hits（不変、schema enum 値は除く）
- `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png`: 未作成（不可侵維持）
- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`: 1,331,047 bytes 不変
- `patches/visual-assets/building-hitori-media-os/`: `note-hero-v1.json` のみ（前バッチ）、x-hook-main-v1.json は未作成（Visual Register 経由）
- v001.png: 1200×675 / 8-bit RGB PNG / 655,963 bytes、目視で顔写真 / robot / AI シンボル / secret / paid PDF いずれもなし
- `npm run local:check`: ok: true（17 green）
- `npm run build`: 成功
