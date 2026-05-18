# Devlog 0115 — Hitori Media OS Working Pipeline Completion Plan (planning only)

Date: 2026-05-18
Status: **plan-only / 0 image generation / 0 schema change / 0 sanity write / 0 deploy / 0 candidate PNG modified / 0 prompt.md modified**

## 今日の判断

visual 品質改善ループ（note-inline v001 → v004）が `35/35 self-rubric` まで到達したが、**残り 6+ asset が手付かず** で 1 campaign の publish が遠い、という構造問題を boss が観察。判断: **visual quality 改善より、pipeline 1 周通すことを優先**。

これは Hitori Media OS の核心哲学 ——「**仕組み（pipeline）を作る人ほど、判断を保留できる時間が増える**」—— の運用そのものを試す batch。visual 品質を **good enough** で凍結し、approve / register / Sanity 反映 / publish package / release review までを 1 周完走させる計画を docs/67 に固定した。

最も重要な設計判断:

- **"Working" を 7 必須条件で定義**: 全 9 visualAssetPlan が `saved` か `skipped`、各 final asset 実在、patch 全件、publish-package dry-run + actual 成功、release-review 5 file 更新、`final-human-checklist.md` に boss 署名。完璧品質と分離。
- **採用ライン 24/35**（35/35 必須でない）: 「プロ品質ではないが意味は伝わる」段階で working pipeline 全 step を回し切る。35/35 を全 asset に強要すると 1 ヶ月でも終わらない。
- **保留 2 件**（`note-inline-manual-vs-automation-v1`, `note-inline-publish-package-folder-v1`）を本フェーズで `status: skipped`: note 記事の補助図 2 件。欠落しても公開できる。Visual Engine Improvement Phase で補完。
- **既存 candidate を絶対に消さない**: build-in-public の素材として残す。v001-v003 が "失敗しかけ" でも履歴として有用、boss が後で見返せる。
- **生成シーケンス 3 件のみ**: threads-support v004 / note-inline-human-judgment v001 / substack-inline-reader-system v001。**各 1 candidate / 5 min 上限**。無限改善ループ禁止（asset あたり 5 candidates まで）。
- **採用済 5 件 + 共有 1 件は再生成しない**: note-hero-v1 / x-hook-main-v1 はすでに filesystem + patch あり、上書き禁止。substack-header-v1 は master sharing で `campaign-hero-v1.png` 流用、新規 PNG 生成不要、patch だけ Visual Register で生成。
- **Sanity 反映は手動チェックリスト化**: dashboard write は Phase 2B、本フェーズは boss が Sanity Studio で 7 record 更新 + 2 record skipped に手動。完璧な automation は捨て、確実な手動完走を取る。
- **publish-package を dry-run → actual の 2 段**: image copy 計画を先に目視確認、actual で破壊的書き込みを承認後に実行。失敗時の rollback コストを下げる。
- **release-review 5 file 更新を checklist 形式に固定**: `final-human-checklist.md` / `x-final-review.md` / `threads-final-review.md` / `note-final-review.md` / `substack-final-review.md` に Visual / Text / Manual publish readiness の 3 軸 checklist。boss が署名する経路を明文化。
- **Auth migration / Phase 2B write / Design Profile schema / Layout Preset / SaaS-grade engine** すべて Visual Engine Improvement Phase に **明示的繰り下げ**。本フェーズで scope inflation を防ぐ。

## なぜその設計にしたか

- **visual 品質より pipeline 完走を優先した理由**: 「**実際に publish できる状態**」が Hitori Media OS の価値証明として最重要。visual 品質を追うと「永遠に publish しない」ループに入る。**1 campaign の完走実績**が次の意思決定（visual engine improvement に何を投資するか、SaaS 化するか）の基礎データを生む。
- **採用ラインを 24/35 にした理由**: 35/35 は note-inline v004 で達成したが、他 6 asset に同水準を要求すると 5-10 batch、数日〜数週単位かかる。24/35 は「平均 3.4 / axis、悪くない + 部分良い」のライン、note inline / Threads main / Substack inline に貼って意味が伝わる最低限。
- **保留 2 件を `skipped` にした理由**: note 記事の Chapter 4 末尾と Chapter 5 末尾、いずれもテキスト本文で補えるレベル。working pipeline では「補助図は今後追加」で公開、後で生成・差し替え。campaignPlan.requiredVisualAssets の `state` も `skipped` で扱えば、dashboard と Sanity の整合が崩れない。
- **生成 1 candidate / asset の理由**: 3-pattern-default（v001 diagram-first / v002 typography-hybrid / v003 metaphor-mix）は v001-v003 の note-inline で 1 度試した。結論は「**最初から japanese-editorial-v1 を 1 candidate** で出して、よくなければ別 variant」のほうがトークン消費・時間効率が良い。本フェーズは効率優先。
- **既存 candidate を消さない理由**: build-in-public で「失敗しかけ v001 → 改善した v004」を boss が振り返れる。**process を見せられる素材**は Hitori Media OS の主商品（仕組みを売る）と整合。
- **dashboard write を解禁しない理由**: Phase 2B 着手前に working pipeline を 1 周通す意義: 「dashboard で読みが完成しているのに、書きはどこまで必要か」を運用 1 周後に判断できる。dashboard write 解禁前に「**書きを Visual Register に残しても困らない**」境界を確かめる。
- **Sanity 反映を手動チェックリストにした理由**: 9 record × 4 field = 36 編集を boss が Studio で手動。1 ヶ月運用後に「**この 36 編集が確かに自動化されたら時短**」を実感として持てれば、Phase 2C の Sanity write design に説得力ある根拠が生まれる。
- **publish-package dry-run を必須にした理由**: builder script が `localAssetPath` を読んで image copy するので、Sanity 反映ミスがあると wrong file copy / not found error が出る。dry-run で計画を目視確認、actual で実行。
- **release-review 5 file を 3 軸 checklist 化した理由**: Visual / Text / Manual publish readiness を 1 file 内で完結。boss が `final-human-checklist.md` 1 枚を埋める経路。
- **Visual Engine Improvement Phase への defer 9 項目を明示した理由**: scope inflation を防ぐ。「あれもこれも本フェーズで」と要求が膨らむと完走しない。defer list を docs に固定することで「次の phase に持ち越し」が boss と合意済の状態に。

## Codex と Claude Code の役割分担

| 役割 | 担当 |
| --- | --- |
| 状態 inspection（seed + publish-packages + 既存 patches / assets / inbox） | **Claude Code（本バッチ）** |
| 9 visualAssetPlan record 一覧 + 期待 final path の table 化 | Claude Code |
| 採用済 / 要生成 / 保留 / shared の 4 分類 | Claude Code |
| Working 7 必須条件の definition | Claude Code |
| 採用ライン 24/35 の設定根拠 | Claude Code |
| 生成シーケンス 3 件（A/B/C）の Japanese-first label / layout 候補設定 | Claude Code |
| approve/register checklist | Claude Code |
| Sanity reflection checklist（9 record × 4 field） | Claude Code |
| publish-package dry-run + actual checklist | Claude Code |
| release-review 5 file 更新 checklist | Claude Code |
| Out of scope（defer list 9 項目）の明示 | Claude Code |
| docs/devlog/0115 + handoff/0126 起草 + latest.md ミラー | Claude Code |
| 実 candidate 生成（threads-support v004 etc.） | **将来バッチ（人間 GO 後）** |
| Visual Register approve & register | **boss 手動操作** |
| Sanity Studio で 9 record 編集 | **boss 手動操作** |
| publish-package CLI 実行 | **boss CLI** |
| release-review markdown 更新 + 署名 | **boss 手動編集** |
| Visual Engine Improvement Phase 着手 | **working pipeline 完走後の別バッチ** |
| Auth migration design | **Phase 2C 着手前の別バッチ（docs/68 候補）** |
| Codex CLI 起動 / 画像生成 | **0**（本 batch では起動していない） |

## API なしで済ませた理由

- 設計のみで code / schema / 画像生成 / Sanity write 触らず → API 連携追加 0
- Codex / OpenAI / Sanity write の呼び出し 0
- 新規 npm package 追加 0
- paid LLM / image API integration 追加 0
- 既存 Sanity read token / ChatGPT OAuth / GitHub OAuth はそのまま

## このバッチで作ったもの / 変更したもの

### Added — `docs/`

- `docs/67-hitori-media-os-working-pipeline-completion-plan.md`（15 sections、working pipeline 完成計画）
- `docs/devlog/0115-working-pipeline-completion-plan.md`（本ファイル）
- `docs/handoff/0126-working-pipeline-completion-plan.md`

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0126 のミラー）

### Confirmed unchanged

- candidate PNG bytes（既存 7 件全件 byte-identical）:

  | File | Bytes |
  | --- | --- |
  | threads-support-diagram-v1/v001.png | 1,117,386 |
  | threads-support-diagram-v1/v002.png | 1,170,769 |
  | threads-support-diagram-v1/v003.png | 1,155,943 |
  | note-inline-content-os-flow-v1/v001.png | 1,019,508 |
  | note-inline-content-os-flow-v1/v002.png | 1,234,530 |
  | note-inline-content-os-flow-v1/v003.png | 1,078,958 |
  | note-inline-content-os-flow-v1/v004.png | 1,234,240 |

- prompt.md / review.md（4 inbox folder すべて非編集）
- review-manifest.json（非編集）
- `schemas/` 全件 / `sanity.config.ts` / `structure/index.ts`
- `dashboard/src/` 全件
- `dashboard/package.json` / `package-lock.json`
- root `package.json` / `package-lock.json`
- `tools/visual-register/` / `tools/publish-package-builder/` / `tools/local-check.mjs`
- `assets/visuals/`（final asset paths: shared/campaign-hero-v1.png, x/hook/x-hook-main-v1.png のみ）
- `patches/visual-assets/` (note-hero-v1.json + x-hook-main-v1.json のみ)
- `seed/` / `outputs/` / `publish-packages/` / `private/`
- Sanity dataset（**書き込みゼロ**）
- Vercel project / DNS / production env vars
- production deployment（**未触**）

## Working pipeline 完成計画 要点

### 9 record の本フェーズ後ターゲット状態

| _id | 期待 status | 経路 |
| --- | --- | --- |
| note-hero-v1 | saved | Sanity 反映のみ（PNG + patch 既存） |
| substack-header-v1 | saved | Visual Register で master sharing patch 生成 → Sanity 反映 |
| x-hook-main-v1 | saved | Sanity 反映のみ |
| threads-support-diagram-v1 | saved | **v004 生成 → approve → Sanity 反映** |
| note-inline-content-os-flow-v1 | saved | **既存 v004 を approve → Sanity 反映** |
| note-inline-human-judgment-v1 | saved | **v001 生成 → approve → Sanity 反映** |
| note-inline-manual-vs-automation-v1 | **skipped** | Sanity Studio で status のみ手動更新 |
| note-inline-publish-package-folder-v1 | **skipped** | Sanity Studio で status のみ手動更新 |
| substack-inline-reader-system-v1 | saved | **v001 生成 → approve → Sanity 反映** |

→ 7 saved + 2 skipped = working pipeline complete。

### 生成シーケンス（A → B → C → D → E → F）

A. threads-support-diagram-v1 v004 only
B. note-inline-human-judgment-v1 v001 only
C. substack-inline-reader-system-v1 v001 only
D. approve / register / Sanity reflect 一括（5 patch + 6 record 更新）
E. publish-package dry-run + actual
F. release review 4 platform 更新 + final-human-checklist 署名

### 採用ライン（このフェーズ限定）

- self-rubric 24/35 で採用候補
- 35/35 必須でない
- Japanese-first + diagram 30%+ + secret 漏洩ゼロ + reader が意味を取れる、を最低限

### Out of scope（明示繰り下げ）

- 採用済 visual の上書き再生成
- 保留 2 件の生成
- Design Profile / Layout Preset / Visual Candidate schema 化
- dashboard write 解禁（Phase 2B）
- Auth migration（Phase 2C 前）
- Sanity write を dashboard から（Phase 2C）
- 半自動 / 自動 publish / auto-post（永続 deferred）
- paid LLM / image API integration（永続 deferred）
- multi-tenant / SaaS / billing（Phase 2D）
- public site `hitorimedia.com`（別 doc / 別 phase）

## 発信ネタになりそうな切り口

1. **「visual 品質より pipeline 完走を優先する」判断**: 完璧主義 vs 出荷の典型的トレードオフ。Hitori Media OS の哲学「仕組みを作る人ほど、判断を保留できる時間が増える」を運用そのものに当てる。
2. **「採用ライン 24/35」**: 35 点満点 self-rubric で全 asset に 35/35 を要求しない、24/35 で次に進む。完璧主義ループの離脱メカニズム。
3. **「保留 2 件を skipped で発行する」**: 補助図 2 件を欠落させてでも 1 周通す。後で補完。「不完全のまま発行することで、運用負荷を学ぶ」。
4. **「Sanity 反映を手動チェックリスト化する」**: 自動化を急がない。9 record × 4 field の手作業を 1 周やってから、次の phase で「自動化すべき箇所」が見える。
5. **「生成 candidate 上限 5 件 / asset」**: 無限改善ループの線引き。build-in-public の "process" を残すために履歴は保存。
6. **「pipeline 1 周完走後に Visual Engine Improvement に戻る」**: design / improvement の優先順位を、ユースケースから逆引きする。

## Safety Verified

- direct Sanity write を含むコード変更: **0 件**
- paid LLM / image API client 追加: **0 件**
- 環境変数変更 / Vercel UI 操作: **0 件**
- 画像生成 / Codex CLI 起動: **0 件**
- schema 変更 / activate / proposed sketch 追加: **0 件**
- assets/visuals / patches / Sanity / publish-packages / inbox candidate PNG: **不変**
- prompt.md / review.md / review-manifest.json: **不変**
- React component / API route / page route 追加: **0**
- 新規 npm package: **0**
- 既存 production dashboard (`app.hitorimedia.com`) の挙動: **不変**
- Visual Register (`tools/visual-register/`) の挙動: **不変**
- root `npm run local:check`: 後段 handoff §11 で実行・結果記録
- root `npm run build`（Sanity Studio）: 後段 handoff §11 で実行・結果記録
- `cd dashboard && npm run build`: 後段 handoff §11 で実行・結果記録
