# Substack Strategy Integration

日付: 2026-05-14

このドキュメントは、購入済みのSubstack教材から抽出した戦略要素を、Hitori Media Lab Content OSへ統合するための設計メモです。

PDF本文の長文引用は行わず、Content OSに使える戦略、ワークフロー、スキーマ、プロンプト設計へ抽象化します。

## Why Substack Matters Now

Substackは、単なるブログ投稿先ではなく、publication、email、Notes、archive、subscriber listがまとまった場所として扱います。

Content OSにおいて、Substackは「1つのplatformOutput」では弱すぎます。

理由:

- 読者リストが資産になる。
- Postがemailとして届く。
- NotesでSubstack内の発見と交流が起きる。
- Archiveが信頼の蓄積になる。
- freeとpaidを分けて、長期的な関係設計ができる。

## Substack As Publication + Email + Notes + Archive

Substackは4つの機能を持つレイヤーとして扱います。

- Publication: 継続的な編集方針を持つメディア
- Email: 読者へ直接届く配信路
- Notes: Substack内での短文発見・会話
- Archive: 過去記事が信頼を蓄積する場所

このため、Substack出力は `substack-post` だけでなく、positioning、About、Welcome Email、Notes、growth actionsまで含めて設計します。

## Follow vs Subscribe

Content OSでは、followとsubscribeを分けて扱います。

follow:

- 発見・軽い関心
- Notesやプロフィール経由で起きやすい
- まだ強い関係ではない

subscribe:

- email配信を受け取る関係
- より強い関心
- publicationの主要資産

設計上は、XやThreadsで発見され、noteで検索/検討され、Substack Notesで交流し、Substack Postでsubscribeへ進む流れを想定します。

## X / note / Substack Role Split

X:

- 発見
- 短い主張
- 図解ペア投稿
- Substack Postへの入口

Threads:

- 会話調の発見
- 思考の分解
- 軽い反応の確認

note:

- 日本語検索/アーカイブ
- 思想や論考
- 比較的長い説明

Substack Notes:

- Substack内の発見
- 読者との交流
- Postへの前振り

Substack Post:

- 信頼形成
- email配信
- 制作ログ/編集後記
- subscriber listの中核

## Target / Positioning / Core Topics

Substackには、個別記事より先にpublicationの設計が必要です。

Content OSでは、次を構造化して保存します。

- target reader
- positioning statement
- core topics
- not-for list
- reader promise
- publication cadence
- free / paid boundary

## Voice / Content / Format

Substack出力では、次の3要素を分けて扱います。

Voice:

- 書き手の視点
- 語り口
- 距離感
- 率直さと専門性のバランス

Content:

- 扱うテーマ
- 主張
- 根拠
- 事例
- 読者の悩み

Format:

- Post
- Notes
- About Page
- Welcome Email
- Series
- Paid essay

## Free vs Paid Role

MVPではpaid化を急ぎません。

free:

- 信頼形成
- 発見
- 読者との関係づくり
- publicationの価値を伝える

paid:

- backstage pass
- 深い制作ログ
- 実験の裏側
- テンプレート/運用メモ
- 読者が十分に集まった後のoffer

paidは最初の収益化装置ではなく、信頼が溜まった後の拡張として扱います。

## Notes + Posts Growth Loop

Substackでは、NotesとPostsを分けて使います。

Growth loop:

1. X / Threads / noteで発見される。
2. Substack Notesで短い主張や問いを出す。
3. NotesからPostへ誘導する。
4. Postで信頼形成する。
5. subscribeへ進む。
6. 次のPostやNotesへの反応が増える。

Content OSでは、1つの `contentIdea` からPostだけでなくNotes案も作る必要があります。

## 30-Day / 100-Subscriber Roadmap Concepts

30-day:

- positioningを決める
- About Pageを書く
- Welcome Emailを書く
- 3-5本のfree Postを作る
- Notes投稿を習慣化する
- X/noteからSubstackへの導線を試す

100-subscriber:

- どの流入経路が効いたか確認する
- 反応が良いcore topicを整理する
- Welcome EmailとAbout Pageを改善する
- free/paid boundaryを見直す
- paid readinessを判断する

## What Should Be Built Into Content OS

MVP:

- Substack positioning prompt
- About Page prompt
- Welcome Email prompt
- Substack Post prompt
- Substack Notes prompt
- Substack publish package

Phase 2:

- substackPublicationStrategy schema
- substackPostPlan schema
- substackNotesPlan schema
- growth action checklist
- subscriber milestone tracking

Phase 3:

- paid readiness tracking
- direct Substack workflow export
- dashboard-side Substack planning view
- scheduling support

## Current Constraint

現時点では、Substackへ自動投稿しません。

Substack APIや外部自動化も追加しません。

すべて、local-first / manual-review workflowとして扱います。
