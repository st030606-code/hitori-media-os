# Substack Strategy Module

日付: 2026-05-14

このドキュメントは、購入済みSubstack教材のインサイトを、Hitori Media OS v0.2のStrategy Moduleとして統合するための設計です。

長文の本文引用はせず、Content OSで使える戦略、checklist、prompt、workflowへ抽象化します。

## Substackの役割

Substackは、単なる投稿先ではありません。

Hitori Media OSでは、次の4つを持つpublication layerとして扱います。

- publication
- email
- Notes
- archive

## Follow vs Subscribe

Followは軽い関心です。

Subscribeはemailで受け取る関係であり、より強い接点です。

システム上は、followを発見、subscribeを読者資産として分けて扱います。

## Subscribers As Owned Asset

Substack subscribersは、Hitori Media OSの主要資産です。

理由:

- emailで届く
- platform timelineより関係が強い
- feedback loopを作れる
- paid offerの前提になる

## Platform Role Split

### X / Threads

- discovery
- 短い主張
- 図解ペア投稿
- Postへの入口

### note

- 日本語検索
- archive
- 論考
- public proof

### Substack Notes

- Substack内のinteraction
- 短い問い
- Post前後の会話
- 読者との関係づくり

### Substack Posts

- deep trust
- email delivery
- archive
- 制作ログ/編集後記

## Free vs Paid

free contentは、出し惜しみではなく、best public workとして扱います。

paid contentは、later-stageのbackstage passです。

例:

- 深い制作ログ
- 実験の裏側
- テンプレート
- 詳細な運用メモ
- paid reader向けの追加解説

paid化は急ぎません。

## 30-Day Launch Roadmap Concept

- positioningを決める
- About Pageを作る
- Welcome Emailを作る
- free Postを3-5本作る
- Notes投稿を習慣化する
- X/noteからSubstackへ導線を作る

## 100-Subscriber Roadmap Concept

- どの流入経路が効いたか確認する
- 反応が良いcore topicsを整理する
- Welcome Emailを改善する
- About Pageを改善する
- free / paid boundaryを見直す
- paid readinessを判断する

## System Changes

Hitori Media OS v0.2では、次を追加または設計対象にします。

- Substack-specific package type
- Substack Notes output
- Substack Post output
- Welcome Email asset
- About Page asset
- Subscriber Growth Action checklist
- Reader List goal tracking as future schema

## Current Implementation

実装済み:

- Substack prompt templates
- Substack publish package
- Substack strategy docs

未実装:

- Substack専用Sanity schema
- reader list goal tracking
- direct Substack write
- Substack API連携

## Safety Boundary

Substackへの投稿は手動です。

自動投稿、API投稿、email送信自動化はまだ行いません。
