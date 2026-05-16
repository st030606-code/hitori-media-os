# x-hook-main-v1 — Review Notes (per-candidate)

候補ごとに「採用 / 再生成」の判断メモを残す。Visual Register Inbox Review でレビューメモ欄にコピペできるよう、candidate ごとに節を分けて書く。

## Candidate v001

- 生成日時: 2026-05-14 21:19 JST
- 生成元: Codex CLI 0.120.0 + `gpt-5.4` + `--enable image_generation` + built-in `image_gen` tool（ChatGPT OAuth, no paid API key, no openai images API direct call）
- prompt 版: `codex-exec-prompt.md`（2026-05-14 初版）
- ファイル: 1200 × 675 PNG / 8-bit RGB / 655,963 bytes
- 判断: **approve (pending human Visual Register confirmation)**

### Review Checklist

- [x] 中央70%に重要要素が収まり、X preview crop（1.91:1 / 1:1）で文字が切れない
- [x] note hero（`campaign-hero-v1.png`）と色・font が一貫している（白背景 / ネイビー〜チャコール文字 / 控えめなウォーム accent / sans-serif）
- [x] note hero よりも装飾が控えめ（構造ノードを使っていない、見出しと subtitle のみの text-centric layout）
- [x] 完成品の宣伝感がない（building-in-public トーン、subtitle に「development log」明記）
- [x] secret / 実 project ID / private/ パスが映っていない（目視確認、テキストは見出しと subtitle のみ）
- [x] 顔写真 / AI generated avatar なし
- [x] 有料PDF教材本文が映っていない
- [x] 見出し『発信を頑張るより、発信が回る仕組みを作る。』が読める（2行配置、コントラスト十分）
- [x] サブ『Hitori Media OS / development log』が読める（小さめで控えめ）

### Notes

```text
v001 採用。codex exec + built-in image_gen + gpt-5.4 で生成（ChatGPT OAuth、paid API なし）。
note hero とのトーン一貫性 OK、装飾は note hero より一段階控えめ、X preview crop で見出しが切れない構図。
Visual Register Inbox Review に進めるレベル。
```

### Side Effect Observed (記録)

Codex agent はプロンプト指定外の `docs/handoff/latest.md` も上書きした（English 短縮版に書き換え）。
人間 / Claude Code 側で元の 0100 内容に **リストア済み**（2026-05-14 21:21）。
将来の codex exec セッションでは prompt の Hard Rules に「specified output path 以外のいかなる repo file も編集しない」を加えるか、`-s read-only` 系の制約を inbox subtree のみ writable にする検討が必要。

---

## Candidate v002

(必要なら v001 を再生成したときに同じ節を追加)

- 生成日時:
- prompt 版:
- 判断:

### Notes

```text

```

---

## Hand-off to Visual Register

採用版が決まったら:

1. `npm run visual:register`
2. Inbox Review カード → `building-hitori-media-os` フィルタ
3. 採用 v00X を選択 → 上の "Notes" の文章をレビューメモにコピペ → `approve & register`
4. final path `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` に copy + patch JSON 生成を確認
5. Sanity Studio で `visualAssetPlan.building-hitori-media-os.x-hook-main-v1.localAssetPath` / `status: saved` / `reviewNotes` を手動更新
6. `npm run publish:package -- building-hitori-media-os` で publish-package に配布
