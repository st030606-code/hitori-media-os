# Substack Content OS Pipeline

日付: 2026-05-14

このドキュメントは、SubstackをContent OSのreader-list / publication strategy layerとして扱うためのパイプライン設計です。

## Core Principle

Substackは単なる出力先ではありません。

Content OSでは、Substackを次の3つの中心として扱います。

- trust archive
- email delivery
- subscriber asset

## Pipeline Overview

```text
raw idea
  -> contentIdea
  -> X / Threads discovery
  -> note search/archive
  -> Substack Notes interaction
  -> Substack Post trust/email
  -> subscriber relationship
  -> paid readiness later
```

## X / Threads As Discovery

XとThreadsは、Substackの前段です。

役割:

- 短い主張を出す
- 反応を見る
- 図解と組み合わせる
- Postのテーマ候補を発見する

Content OS上では、X / Threadsの出力は、Substack Postへの入口にもなります。

## note As Japanese Search / Archive

noteは日本語圏の検索、長文理解、思想の保存に向いています。

役割:

- 論考
- 日本語アーカイブ
- 検索経由の発見
- Substackより広い読者への説明

noteはSubstackと競合させず、検索/論考レイヤーとして扱います。

## Substack Notes As Interaction / Discovery

Substack Notesは、Substack内の短文発見と会話の入口です。

役割:

- Post前の問い
- Post後の補足
- 読者との軽い会話
- 他のSubstack読者への発見

NotesはXのコピーではなく、Substack内の関係性を作る短文として扱います。

## Substack Post As Trust / Archive / Email

Substack Postは、信頼形成とemail配信の中心です。

役割:

- 読者へ直接届く
- archiveとして残る
- 制作ログや編集後記を含められる
- subscriber relationshipを育てる

Postは、毎回売り込む場所ではなく、信頼を積み上げる場所です。

## Subscribers As Main Asset

Content OSでは、Substack subscribersを主要資産として扱います。

理由:

- platformのタイムラインより関係が強い
- emailで届く
- feedback loopを作れる
- paid化の前提になる

将来のdashboardでは、subscriber milestoneやgrowth actionを可視化します。

## Paid Content As Backstage Pass

paid contentは、Phase 1/2では急ぎません。

位置づけ:

- backstage pass
- 深い制作ログ
- 実験の裏側
- templates
- playbook
- community-facing update

paidは、free publicationの信頼と読者数が一定以上になってから検討します。

## Content OS Implementation Implications

必要になるもの:

- Substack publication strategy
- About Page
- Welcome Email
- Post plan
- Notes plan
- subscribe CTA
- repurpose map
- growth action log
- subscriber milestone
- paid readiness

## Publish Package Implications

`publish-packages/substack/<content-slug>/` は、Post本文だけでなく、Notes、title options、CTA、repurpose map、checklistを含めます。

これにより、Substackを単なる記事出力ではなく、publication運用単位として扱えます。
