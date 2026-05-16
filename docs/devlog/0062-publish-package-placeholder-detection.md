# Devlog 0062: Publish Package Placeholder Detection + Dry Run

Date: 2026-05-14

## 今日の判断

Publish Package Builderに、下書きがplaceholder（雛形のみで本文未記入）かどうかを自動判定する機構と、ファイル書き込みを行わずに判定だけ確認できる `--dry-run` モードを追加しました。

最近、`building-hitori-media-os` のplaceholder draftを生成した結果、Builderから見れば「下書きが存在する」状態になりました。これはcheckリストを通り抜けて誤って公開される潜在リスクなので、まずここを安全側に倒すバッチとして進めました。

## 変更したこと

- `tools/publish-package-builder/build.mjs`
  - `isPlaceholderDraft(content)` と `extractDraftStatus(content)` ヘルパーを追加。
    - `status: draft-placeholder` の行、または `# ... draft placeholder` の見出しが先頭付近にある場合のみplaceholderと判定。
    - 真のdraftにTODOが1〜2個混ざっていても誤判定しない保守的なマッチング。
  - 結果JSONに `draftIsPlaceholder`、`draftStatus`、`warnings` を追加。
  - placeholderと判定された下書きには、`todos` に `Replace placeholder draft before publishing. Source: <draftSource>` を積み、checklistに `## Draft Status` バナーと `Draft is a real draft (not a placeholder)` 未チェック項目を追加。
  - draft不在時、`draftSourceDir` 未設定時にも対応する `warnings` を出力。
  - `--dry-run` 引数を追加。指定時はディレクトリ作成・ファイル書き込み・画像コピーを一切行わず、判定結果だけ返す。
  - 結果JSON先頭に `dryRun` と `behavior: "dry-run-no-writes"` または `"safe-skip-existing-files"` を出すよう変更。
- `README.md` に placeholder detection と `--dry-run` の概要を追記。
- `docs/32-publish-package-builder.md` に「Placeholder Draft Detection」「Why Placeholder Drafts Are Safer Than Missing Drafts」「How To Replace a Placeholder Draft Safely」「Dry Run」の節を追加。

## 理由

Hitori Media OSは「1つのContent Idea → 複数媒体」を繰り返すため、新しいキャンペーンを増やすたびにplaceholder draftが残ります。これをsafe-skip-existing-files挙動だけに任せると、見た目では下書きが揃っているのに本文が空という状態が公開直前まで気づかれにくくなります。

draft不在は人間が気づきやすい（checklistに`Draft file exists` が未チェックで出る）一方、placeholderは「存在する」扱いになるため、明示的に検出して別物として扱う必要があります。

`--dry-run` は、新しいslugを足したときの影響範囲確認と、placeholder検出のスモークテストに役立ちます。書き込みを伴わないため、ai-blog-dbのfirst public releaseと並走しても副作用なしで何度でも回せます。

## CodexとClaude Codeの役割分担

今回はClaude Codeが単独で実装しました。Codexにはこの後の人間レビューや、building-hitori-media-osのplaceholderを実下書きに差し替える作業を渡す想定です。

## APIなしで済ませた理由

placeholder検出はファイル内容のパターンマッチングだけで実現できるため、LLM APIや外部サービスは不要でした。`--dry-run` も同様にローカルのみで完結します。

dry-runで `npm run build` などの外部副作用も発生させていません。

## 発信コンテンツにできる切り口

- 「draft不在」より「placeholder draft」のほうが危ない、という運用上の発見。
- 自動化は最後、まず判定とwarningから入る。
- Hitori Media OSの「人間レビューを残す余白」設計に合うチェック層の追加。
- dry-runを「副作用ゼロのレビュー手段」として位置付ける考え方。

## 検証

通常実行とdry-runの両方で、以下を確認しました。

- `node --check tools/publish-package-builder/build.mjs` → 成功
- `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → ok: true、全13チェック green
- `npm run publish:package -- ai-blog-db` → 既存packageは全件 `skipped`、`draftIsPlaceholder: false`、`warnings: []`（platformごとに）
- `npm run publish:package -- building-hitori-media-os` → 既存packageは `skipped`、placeholder slug側で `draftIsPlaceholder: true`、`todos`にplaceholder置換タスク、`warnings` にplaceholder警告
- `npm run publish:package -- ai-blog-db --dry-run` → `dryRun: true`、`written: []`、判定だけ返る
- `npm run publish:package -- building-hitori-media-os --dry-run` → `dryRun: true`、placeholder判定・warnings出力を確認
- `npm run build` → 成功

既存のpublish package fileは破壊的に上書きしていません。`safe-skip-existing-files` のまま、新しいchecklist内容はnewに作るpackage（または該当ファイルを手動で削除して再生成した場合）から反映されます。

## 次にテストすること

1. placeholderを実下書きに差し替えた後、`--dry-run` で `draftIsPlaceholder: false` に変わることを確認する。
2. 該当の `publish-packages/<platform>/building-hitori-media-os/<draftTarget>.md` を人間が削除してから再生成し、新しいchecklistに `Draft is a real draft (not a placeholder)` がチェック済みで入ることを確認する。
3. checklist再生成時に古い `draftSource` の置換ができているか確認する。
