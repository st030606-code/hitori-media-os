# Video / Audio Asset Planning

日付: 2026-05-14

Hitori Media OS v0.2では、videoとaudioをplatformOutputの中に押し込まず、asset planとして扱います。

## Why Separate Plans Are Needed

動画と音声は、text draftとは制作工程が違います。

必要になる情報:

- productionMode
- scriptPath
- expectedLocalAssetPath
- recording / generation / edit status
- safetyNotes
- publishPackagePath

## Video Production Modes

- human-shot
- ai-generated
- hybrid
- screen-recording
- b-roll-plus-narration

## Audio Production Modes

- human-recorded
- ai-clone
- tts
- podcast-import

## Example Seed Files

このタスクではschemaは作りません。

代わりに、設計確認用のseed例を追加します。

```text
seed/video-asset-plan-examples.json
seed/audio-asset-plan-examples.json
```

## Safety Notes

- 実際の動画ファイルは作らない。
- 実際の音声ファイルは作らない。
- AI clone voiceは将来対応であり、本人確認と権利確認が必要。
- TTS draftは内部レビュー用途として扱う。
- auto-postingはしない。

## Publish Package Integration

Publish Package Builderでは、次を扱う予定です。

- `publish-packages/youtube/<content-slug>/script.md`
- `publish-packages/youtube/<content-slug>/thumbnail/`
- `publish-packages/shorts/<content-slug>/script.md`
- `publish-packages/shorts/<content-slug>/caption.md`
- `publish-packages/podcast/<content-slug>/script.md`
- `publish-packages/podcast/<content-slug>/show-notes.md`
- `publish-packages/podcast/<content-slug>/audio-todo.md`
