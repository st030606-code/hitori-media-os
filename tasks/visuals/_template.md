# Visual Task Template

## Source

- sourceContentIdea:
- sourceDiagramPlan:
- visualAssetPlan:
- pairedPlatformOutput:

## Target

- targetPlatform:
- placement:
- aspectRatio:
- assetType:
- outputPath:

## Generation

- generationMode:
- generationProvider:
- apiEnabled:
- generationJobId:

## Image Prompt

```text
Paste the image prompt here.
```

## Text To Include

- 

## Text To Avoid

- 

## Review Checklist

- 元の `contentIdea` にない主張を足していないか。
- 図内テキストが短く読みやすいか。
- 対象媒体と配置に合った比率か。
- API自動化や自動投稿が中心に見えないか。
- ロゴや商標に依存していないか。
- 保存先パスが正しいか。

## Save Instructions

1. 人間がChatGPT画像生成、Canva、その他の制作ツールで画像を作る。
2. 生成した画像を `outputPath` に保存する。
3. 保存後、Sanityの `visualAssetPlan.localAssetPath` を更新する。
4. `status` を `saved` または `reviewed` に進める。
5. 必要に応じて `publishPackagePath` に公開用素材をまとめる。

## Sanity Update Notes

- localAssetPath:
- status:
- reviewNotes:
- updatedAt:
