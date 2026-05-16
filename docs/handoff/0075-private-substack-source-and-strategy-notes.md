# Handoff: Private Substack Source + Abstracted Strategy Notes

Date: 2026-05-14

## 1. Task Goal

ローカルに配置された有料Substack教科書PDFを公開しないまま、Hitori Media OSの内部資産として抽象化する。具体的には、`private/` をgitignoreし、strategy-sources / strategy-modules の2層構造を作り、ingestion workflow / README / local diagnostics を整える。

## 2. Constraints Followed

- 有料PDFをcommitしていない。
- 有料PDFの本文を直接公開していない。
- 長文の逐語引用、スクリーンショット、購入リンクをdocsに含めていない。
- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- 外部APIは呼んでいない。
- auto-postingは実装していない。
- Sanity direct writeは実装していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 新規media fileは生成していない。
- 既存ファイルを破壊的に上書きしていない。

## 3. Changed Files

### Added

- `docs/strategy-sources/substack-textbook-notes.md`
- `docs/strategy-modules/substack-strategy-module.md`
- `docs/devlog/0063-private-substack-source-and-strategy-notes.md`
- `docs/handoff/0075-private-substack-source-and-strategy-notes.md`

### Modified

- `.gitignore`
- `README.md`
- `docs/39-strategy-module-ingestion-workflow.md`
- `tools/local-check.mjs`
- `docs/handoff/latest.md`

### Confirmed (not committed)

- `private/sources/substack/substack-textbook-brain-2026-04-30.pdf`（local-only、`.gitignore` で除外、commitしていない）

## 4. Summary of Changes

### Private source path

- 期待パス `private/sources/substack/substack-textbook-brain-2026-04-30.pdf` の存在を確認。約71MBの有料PDFが配置されている。
- `git check-ignore` でignore状態を確認済み。

### .gitignore

- `private/` をコメント付きで追加。

```text
# Private paid/reference materials. Do not commit.
private/
```

### Strategy notes

- `docs/strategy-sources/substack-textbook-notes.md`：抽象化メモ。Executive Summary、Core Principles（15項目）、Hitori Media OS Implications、Pipeline Changes、Prompt Inputs Needed、Implementation Backlog、What This Notes File Is Not の節で構成。教材本文の長文引用、購入リンク、スクリーンショットなし。

### Strategy module

- `docs/strategy-modules/substack-strategy-module.md`：Substack Reader-List Engineの実装向けStrategy Module。Inputs、Outputs、Workflow（9ステップ）、Rules、Current System Touchpoints、Future Schema Candidates、Open Questions、Status を含む。既存のdocs / prompts / publish-packages へのリンクで運用接点を明示。

### Ingestion workflow

- `docs/39-strategy-module-ingestion-workflow.md` に「Private paid source handling」節を追加。private/に置く、commitしない、抽象化先（strategy-sources / strategy-modules / prompts / checklist / schema / devlog）を列挙。

### README

- 「Private strategy sources」節を追加。`private/`、`docs/strategy-sources/`、`docs/strategy-modules/` の役割、commitしない方針、最初の事例（Substack教科書）へのリンクを記載。

### Local diagnostics

- `tools/local-check.mjs` にinformationalチェックを2つ追加。
  - `private/ is gitignored if it exists`
  - `private/ contents are not tracked`（`git ls-files private/` を使用、gitが無ければスキップ）
- `informationalChecks` Setに含めたので、これらの結果は ok を落とさない。失敗してもexit 1にしないinformationalとして動く。

## 5. Important Decisions

- 抽象化先を「strategy-sources（メモ）」と「strategy-modules（実装向け）」の2層に分けた。教材引用とプロダクト設計を混ぜないため。
- Substack教科書のメモは、Brain素材であることだけ書き、ファイル名と保存先以外は教材固有の数字や表現を出さない。
- `tools/local-check.mjs` のprivateチェックはinformationalに留めた。privateを置いていない開発者でも `npm run local:check` が落ちないようにするため。
- handoff / devlogはprivate sourceそのものではなく、抽象化された成果物を参照する。

## 6. Human Review Questions

- `docs/strategy-sources/substack-textbook-notes.md` の Core Principles の表現が自分の運営と乖離していないか確認したい。
- Substack教科書のメモを他の媒体（X / note / YouTube）にも展開する場合、`strategy-modules/` 側に複数モジュールを並べる方針でよいか。
- `substackPublicationStrategy` などの Sanity schema候補を、次バッチで `schemas/proposed/` 配下に下書きしてよいか（Studioに読み込ませない前提）。
- private/に他の教材を追加する際、ファイル命名規則（`<source-name>-<date>.pdf`）を強制したいか。

## 7. Risks or Uncertainties

- private/ は `.gitignore` で除外されているが、開発者が `git add -f` を意図せず使うと取り込めてしまう。local-check はinformationalなので、最終的な歯止めは開発者の手元の運用ルール。
- 教材内容を再構成しているうちに、知らずに著作権で保護された表現を取り込む可能性。抽象化レベルを意識し続ける必要がある。
- 既存docs (`docs/35-substack-strategy-integration.md`, `docs/36-substack-strategy-module.md`, `docs/37-substack-schema-extension-plan.md`) と今回の strategy-modules の関係を、近いうちに整理し直す価値がある。

## 8. Recommended Next Step

- building-hitori-media-os の Substack draft（placeholder）を、本Strategy Moduleを参照しながら実下書きへ差し替える。
- ai-blog-db の Substack Post をfirst public releaseで公開する際、Welcome Email / About Page / Notes follow-up planのアラインを確認する。
- 次バッチで `schemas/proposed/substackPublicationStrategy.ts` を Studioに読み込ませない形で下書きする可否を判断する。
- 他の教材（X運用 / YouTube台本 / sales）が手に入った段階で、同じ2層構造に流し込む。

## 9. Exact Prompt to Give Codex Next

```text
Draft schemas/proposed/ Sanity schema sketches for the Substack strategy layer, based on the abstracted notes and module already added.

Do not register the proposed schemas in sanity.config.ts.
Do not commit the original paid PDF or any verbatim long passages from it.
Do not call external APIs.
Do not auto-post.
Do not write directly to Sanity.

Use:
- docs/strategy-sources/substack-textbook-notes.md
- docs/strategy-modules/substack-strategy-module.md
- docs/37-substack-schema-extension-plan.md (existing draft)
- schemas/contentIdea.ts as the structural reference

Produce:
- schemas/proposed/substackPublicationStrategy.ts
- schemas/proposed/substackPostPlan.ts
- schemas/proposed/substackNotesPlan.ts
- schemas/proposed/substackGrowthAction.ts
- schemas/proposed/substackSubscriberMilestone.ts
- schemas/proposed/substackPaidReadiness.ts

These are read-only proposals. They must NOT be exported from schemas/index.ts and must not be wired into Studio yet.

Update devlog and handoff with:
- which schemas were proposed
- why each schema is needed
- a clear note that none of these are active yet
- a checklist of what a human must approve before they get activated
```
