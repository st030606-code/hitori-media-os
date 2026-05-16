# Handoff: substackGrowthAction Studio UI Check (manual, passed)

Date: 2026-05-14

## 1. Task Goal

前バッチで活性化した `substackGrowthAction` を、人間がローカル Sanity Studio でブラウザ確認した結果を記録する。残り2本（`substackSubscriberMilestone` / `substackPaidReadiness`）を引き続き proposed-only に据え置く判断も明示し、次は building-hitori-media-os の public release review package に進む方針を残す。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- 外部APIは呼んでいない。
- Sanity direct writeは実装していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 有料PDF本文の引用は含めていない。
- 新規media fileは生成していない。
- 既存ファイルを破壊的に上書きしていない。

## 3. Changed Files

### Added

- `docs/devlog/0076-substack-growth-action-studio-check.md`
- `docs/handoff/0088-substack-growth-action-studio-check.md`

### Confirmed unchanged (Part 1)

- `schemas/substackGrowthAction.ts`
- `schemas/index.ts`
- `seed/substack-growth-action-building-hitori-media-os.json`
- `schemas/proposed/README.md`
- `sanity.config.ts`

## 4. Summary of Changes

Studio 手動確認の結果:

- 「Substack成長施策（Substack Growth Action）」が document type 一覧に表示。
- `actionType` select、`targetPlatform` select、`dueDate` / `completedDate` date picker、`safetyNotes` text、`status` radio が想定通り動作。
- 参照UI（`sourceContentIdea` / `publicationStrategy`）も解決。
- ブロッキング問題なし。

判断:

- `substackGrowthAction` は active 維持。
- `substackSubscriberMilestone` は subscriber が動き始めるまで proposed-only。
- `substackPaidReadiness` は paid化を真剣に検討する段階まで proposed-only。
- 次の主作業は building-hitori-media-os の public release review package 作成。

## 5. Important Decisions

- 残り2本（SubscriberMilestone / PaidReadiness）を急がない。「急がない判断を仕組みに残す」という Hitori Media OS の方針と一致。
- スキーマ活性化を一旦止め、public release review package へ進む。
- safetyNotes 入力欄は「やらないことを毎レコードで明示できる」運用ルールに役立ちそう。docs か README で明文化する候補。

## 6. Human Review Questions

- subscriber 数や反応がどの段階に達したら SubscriberMilestone を活性化するか（10 / 50 / 100 / その他）。
- paid化を検討するトリガー（特定の質問が3回以上届く / 同テーマ Post の再読率が高い、など）を docs にも書くか。
- `substackGrowthAction` のリスト表示で subtitle を `actionType` に変えるか、現状の `status` のままにするか。

## 7. Risks or Uncertainties

- 残り2本を proposed-only に残すこと自体は安全（Studio に影響なし）だが、半年後などに「使うつもりだった」と忘れないように、Activation Status を docs に明示しておくことが重要。
- `substackGrowthAction` を実運用に通す前に、`safetyNotes` を必ず埋めるかどうかの運用合意がまだ非公式。

## 8. Recommended Next Step

- 続けて Part 2 以降で、building-hitori-media-os の public release review package を作成する。
- 残り2本（SubscriberMilestone / PaidReadiness）は proposed-only のまま据え置き、subscribers / paid 判断のシグナルが出たら別バッチで活性化する。

## 9. Exact Prompt to Give Codex Next

このhandoff は本セッション内の中間記録。次セッションでは `docs/handoff/latest.md`（release review package 作成後）を参照。
