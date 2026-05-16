# Hitori Media OS v0.2 Architecture

日付: 2026-05-14

Hitori Media OS v0.2は、現在のContent OSを、媒体別出力ツールから統合メディア制作OSへ進化させるための設計です。

## Core Idea

ひとつのContent Ideaを、text、visual、video、audio、newsletter、social、sales / education contentへ展開する coordinated media campaign として扱います。

目的は、AIで雑に量産することではありません。

人間の主張、読者理解、制作判断を中心に置き、各媒体へ適切な形で展開することです。

## Core Entities

### Content Idea

中心となる知識レコードです。

主張、読者、悩み、根拠、具体例、反論、tone、platformAnglesを持ちます。

### Strategy Module

購入した教材、PDF、Brain記事、実験ログから抽出した戦略モジュールです。

例:

- Substackの教科書
- X運用教材
- YouTube台本教材
- sales funnel教材

### Platform Output

媒体別の下書きです。

例:

- note article
- X post
- Threads thread
- Substack Post
- YouTube script
- Shorts script
- Podcast script

### Visual Asset Plan

図解、アイキャッチ、サムネ、カルーセル、hook画像などの視覚素材計画です。

### Video Asset Plan

YouTube long-form、Shorts、Instagram Reel、screen recording、human-shot video、AI-generated videoなどの動画制作計画です。

### Audio Asset Plan

Podcast、human-recorded audio、AI clone voice、TTS draft、audio summaryなどの音声制作計画です。

### Substack Strategy

Substackをpublication、email、Notes、archive、subscriber assetとして扱う戦略レイヤーです。

### Publish Package

公開前に必要な下書き、画像、台本、チェックリスト、CTA、再利用マップを束ねるローカルfolderです。

### Campaign / Distribution Plan

複数媒体をどういう順番で出すかを管理します。

例:

1. Xで短い主張を出す。
2. Substack Notesで問いを出す。
3. Substack Postで深く書く。
4. noteに検索/アーカイブ用の論考を置く。
5. YouTubeで長尺化する。

### Learning Source / Purchased Course Insight

外部教材から抽出した学びです。

本文を長くコピーせず、principle、checklist、prompt、schema recommendation、workflow changeとして保存します。

## Production Modes

### Text

- manual
- ai-assisted
- ai-generated

### Visual

- manual-chatgpt
- local-ai
- api-ai-future
- designer-made

### Video

- human-shot
- ai-generated
- hybrid
- screen-recording
- b-roll-plus-narration

### Audio

- human-recorded
- ai-clone
- tts
- podcast-import

### Publishing

- manual
- assisted
- future-api

## Desired Pipeline

```text
Content Idea
  -> Strategy Layer
  -> Output Plans
  -> Asset Plans
  -> Publish Packages
  -> Manual / Assisted Publishing
  -> Result Tracking
```

## What v0.2 Adds

- Strategy Moduleを一級概念にする。
- Substackをreader-list / publication strategy layerにする。
- Video Asset PlanとAudio Asset Planを設計対象に入れる。
- Publish Packageを、textだけでなくvideo/audio/socialへ拡張する。
- 将来のsales / paid education contentへ接続できる余地を作る。

## What v0.2 Does Not Do Yet

- Next.js dashboard
- API投稿
- 画像生成API
- Sanity direct write
- 自動公開
- 動画/音声ファイル生成

v0.2は、local-first / no-API / manual-review のまま、制作OSとしての情報設計を広げる段階です。
