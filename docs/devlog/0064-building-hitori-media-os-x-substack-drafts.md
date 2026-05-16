# Devlog 0064: building-hitori-media-os X / Substack ready-for-human-edit drafts

Date: 2026-05-14

## 今日の判断

`building-hitori-media-os` キャンペーンのうち、X と Substack のplaceholder draftを、人間が編集して公開できる ready-for-human-edit ドラフトへ差し替えました。

これは「Substack Strategy Module（信頼形成・email・archive・subscriber asset）と、Hitori Media OSのbuilding-in-publicトーンで、1キャンペーンの最初の2媒体を実下書きまで持っていく」というレビュー駆動バッチです。

他媒体（note / Threads / YouTube / Shorts / Podcast）は今回手をつけていません。Instagram / GitHubはdraftSourceDir未設定で従来通りTODO扱い。

## 変更したこと

- `outputs/x/2026-05-14--building-hitori-media-os--x.md` を実下書きに置き換え。
  - placeholder専用の `Status: draft-placeholder` 行と `# TODO / draft placeholder` 見出しを削除。
  - 状態を `Status: ready-for-human-edit` に。
  - メイン投稿候補1本、追加hook 4案、4〜7投稿のオプション短スレッド、soft CTA、Human Review Checklistを記載。
  - 「発信を頑張るより、発信が回る仕組みを作る」のcoreThesisを軸に、完成版ツールの宣伝ではなくbuilding-in-publicトーンで構成。
- `outputs/substack/2026-05-14--building-hitori-media-os--substack.md` を実下書きに置き換え。
  - 同様に placeholder用マーカーを削除し、`Status: ready-for-human-edit` に。
  - Title Options（4案）、Email Subject Options（3案）、Preview Text、Opening、Main Story（3節）、Practical Takeaway、Reader-List Connection、Reader Question、Subscribe CTA（soft）、Repurpose Notes、Human Review Checklistを記載。
  - Substack Notes Plan 節を同ファイル内に追加。Pre-Post Notes 3本（question / build-log / lesson-learned）、Post Launch Notes 2本（build-log / soft CTA）、Conversation Prompts 3案、CTA Variants 3案、Human Review Checklistを含む。
- `docs/strategy-modules/substack-strategy-module.md` の Workflow / Rules / Outputs に沿った内容になっているかをチェック。

publish-packages 配下のファイルは触っていません。

## 理由

placeholder draftがbuilder上では「draft存在」として扱われるリスクは前バッチで仕組み的に止めたので、次の自然な一歩は、その仕組みが実運用で「人間がplaceholderを実下書きに差し替えるサイクル」を回せるか試すことでした。

最初に X と Substack を選んだのは:

- X = 最も拡散の早い媒体で、building-in-publicの導線として一番反応が見える。
- Substack = subscriber assetの中心。Strategy Moduleの整備直後なので、その内容を運用に通す価値が高い。

note / Threads / YouTube / Shorts / Podcast は、X / Substackからの反応を見たあとに優先順位を決めたほうが安全と判断し、今回はplaceholderのまま残しています。

## Substack Strategy Moduleの参照ポイント

- Workflow: target reader / positioning / core topicsを意識して開きを書き、Reader Question で「ひとり運営で最初に仕組み化したい作業はどれか」を直接聞く形にした。
- Outputs: Subscribe CTA を soft 留め、paid offer はまだ含めない。
- Rules: 完成版ツールを売り込まない、`coreThesis` を守る、教材本文の引用ゼロ。
- Pipeline: X / Threadsで発見 → Substackで信頼形成 / email → noteで日本語アーカイブ、という役割分担を「Reader-List Connection」節に明記。

## CodexとClaude Codeの役割分担

今回はClaude Codeが書きました。Codex側は、X / Substackの本文に対する文体チェック、もしくは note / Threads draftの実下書き作成に回す想定です。

## APIなしで済ませた理由

下書き本文はテンプレートではなく、Hitori Media OSの実運用文脈を意識した文章なので、人間が直接書く方が早く、外部LLM APIを噛ませる必要がありませんでした。`--dry-run` だけで placeholder 解除を検証できる仕組みも前バッチで作ってあったため、副作用ゼロのまま完結しました。

## 発信コンテンツにできる切り口

- placeholderから実下書きへの差し替えサイクルそのものが、Hitori Media OSの動く証拠。
- Substack Strategy Moduleを使った1回目のSubstack Post実装例。
- 「ひとり運営は『量』ではなく『型』で詰む」という考え方を最初の Hook にした理由。

## 検証

- `node --check tools/publish-package-builder/build.mjs` → 成功
- `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → `ok: true`、informational含む全15チェック green
- `npm run publish:package -- building-hitori-media-os --dry-run` →
  - `dryRun: true`、`behavior: "dry-run-no-writes"`
  - `x`: `draftIsPlaceholder: false`
  - `substack`: `draftIsPlaceholder: false`
  - `note` / `threads` / `shorts` / `podcast` / `youtube`: `draftIsPlaceholder: true`
  - `instagram` / `github`: `draftIsPlaceholder: false`（draftSourceDir未設定で従来挙動）
- `npm run build` → 成功

publish-packages配下のファイルは生成しません（packageは前バッチで作成済みのまま、内容はplaceholder時代の表記）。

## 既存packageへの反映

publish-packagesに新しい本文を反映したい場合、人間が次のファイルを削除してから `npm run publish:package -- building-hitori-media-os` を再実行する想定です。

- `publish-packages/x/building-hitori-media-os/posts.md`
- `publish-packages/x/building-hitori-media-os/checklist.md`
- `publish-packages/substack/building-hitori-media-os/post.md`
- `publish-packages/substack/building-hitori-media-os/checklist.md`

破壊的な自動削除は今回行いません。

## 次にテストすること

1. 人間がX / Substackをそれぞれ手動公開し、`Status: ready-for-human-edit` のままで運用できるか確認する。
2. 同じ手順で note / Threads draft を実下書きへ差し替える。
3. YouTube / Shorts / Podcast は、X / Substackの反応次第で順序を再判断する。
4. 公開後、`publish-packages/<platform>/building-hitori-media-os/` を再生成する手順を人間が試して、checklistの新フォーマット（placeholder banner / `Draft is a real draft` チェック）が反映されることを確認する。
