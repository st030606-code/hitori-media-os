# Local Diagnostics

日付: 2026-05-14

Local diagnosticsは、ローカルMVPが安全に動く状態かを確認するための軽量チェックです。

## Usage

```bash
npm run local:check
```

## Checks

現在のcheck項目:

- `package.json` が存在する
- `.env.local` が存在する
- `seed/contentIdea-ai-blog-db.json` が存在する
- `seed/visual-asset-plan-records.json` が存在する
- `assets/visuals` が存在する
- `patches/visual-assets` が存在する
- `publish-packages` が存在する
- main visualAssetPlan seed count が5件
- test visualAssetPlan seed count が3件
- visual patch JSON files が存在する
- committed filesに明らかなsecretがない
- local toolsに直接Sanity writeらしきcode pathがない

## Notes

`.env.local` はローカル起動には必要ですが、コミットしてはいけません。

このcheckは完全なセキュリティ監査ではありません。Phase 2Aの安全確認用です。

## What It Does Not Do

- Sanityへwriteしない
- seedをreplaceしない
- image generation APIを呼ばない
- auto-postingしない
- 外部サービスに接続しない

## When To Run

- 大きめの実装バッチ後
- demo前
- seedやpatch JSONを増やしたあと
- publish packageを作ったあと
