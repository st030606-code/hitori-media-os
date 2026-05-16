# ai-blog-db v0.2 Demo Campaign

日付: 2026-05-14

## 背景

Hitori Media OS v0.2の方向性を確認するため、`ai-blog-db` のContent Ideaを使って、最初のcross-platform demo campaign packageを作成しました。

Core message:

```text
記事を増やすより、AIが使えるDBを作る
```

## 作成したもの

```text
publish-packages/campaigns/ai-blog-db-v0-2-demo/
```

含まれるファイル:

- `README.md`
- `campaign-plan.md`
- `platform-role-map.md`
- `production-mode-plan.md`
- `publish-sequence.md`
- `repurpose-map.md`
- `substack-package.md`
- `video-package.md`
- `audio-package.md`
- `visual-package.md`
- `final-review-checklist.md`

## 意義

このpackageにより、1つのContent Ideaから、note、Substack、X、Threads、Instagram、YouTube、Shorts、Podcastへ展開するcampaign全体を人間が確認できるようになりました。

単なるplatformOutputではなく、campaign、productionMode、assets、Substack subscriber layer、video/audio planningまで含めて整理しています。

## Ready

- note draft
- Substack draft
- X draft
- Threads draft
- YouTube script draft
- Shorts script draft
- Podcast script draft
- note hero image
- X hook image
- Instagram carousel cover
- publish packages

## TODO

- YouTube thumbnail
- GitHub architecture diagram
- Instagram carousel remaining slides
- YouTube recording/export
- Shorts edit/export
- Podcast recording/export
- Substack CTA final review

## Safety

- auto-postingなし
- direct Sanity writeなし
- image generation APIなし
- 新規media生成なし
- seed replaceなし

## 検証

- `node --check tools/publish-package-builder/build.mjs`: 成功
- `node --check tools/local-check.mjs`: 成功
- `npm run local:check`: 成功
- `npm run publish:package`: 成功
- `npm run build`: 成功

`npm run publish:package` は既存publish package fileを上書きせず、`skipped` として扱いました。

## 次の一手

人間が `publish-packages/campaigns/ai-blog-db-v0-2-demo/final-review-checklist.md` を確認し、最初に公開する媒体と不足assetの優先順位を決めます。
