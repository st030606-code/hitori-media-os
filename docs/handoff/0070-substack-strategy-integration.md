# Handoff: Substack Strategy Integration

Date: 2026-05-14

## 1. Task Goal

購入済みSubstack教材のインサイトを、Hitori Media Lab Content OSの戦略、パイプライン、schema設計案、prompt、publish packageへ統合する。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- image generation API callsは実装していない。
- auto-posting to Substackは実装していない。
- Sanity direct writeは実装していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- PDF本文の長文引用はしていない。

## 3. Changed Files

- `README.md`
- `tools/publish-package-builder/build.mjs`
- `docs/30-next-phase-plan.md`
- `docs/32-publish-package-builder.md`
- `docs/35-substack-strategy-integration.md`
- `docs/36-substack-content-os-pipeline.md`
- `docs/37-substack-schema-extension-plan.md`
- `docs/devlog/0058-substack-strategy-integration.md`
- `docs/handoff/latest.md`
- `docs/handoff/0070-substack-strategy-integration.md`
- `prompts/substack-positioning.md`
- `prompts/substack-about-page.md`
- `prompts/substack-welcome-email.md`
- `prompts/substack-post.md`
- `prompts/substack-notes.md`
- `prompts/substack-growth-actions.md`
- `publish-packages/substack/ai-blog-db/`

## 4. Summary of Changes

Substackを単なる媒体別下書きではなく、publication / email / Notes / archive / subscriber assetの戦略レイヤーとして定義しました。Substack専用prompt群とSubstack publish packageも追加しました。

Validationとして、`node --check tools/publish-package-builder/build.mjs`、`npm run publish:package`、`npm run build` は成功しました。

## 5. Key Decisions

- Substack subscribersをContent OSの主要資産として扱う。
- X/Threadsはdiscovery、noteは日本語search/archive、Substack Notesはinteraction、Substack Postはtrust/email/archiveとして分ける。
- paid contentは急がず、backstage pass / later-stage offerとして扱う。
- schema実装はまだ行わず、まず設計案に留める。
- Substack publish packageはPostだけでなくNotes、CTA、title options、repurpose mapを含める。

## 6. Human Review Questions

- Substackをsubscriber asset layerとして扱う方針は、Hitori Media Labの方向性に合っているか。
- 最初に実装すべきschemaは `substackPublicationStrategy` でよいか。
- About Page / Welcome Emailは先にseed/prompt運用で検証するべきか。
- Substack packageのfolder構成は十分か。

## 7. Risks or Uncertainties

- PDF本体はリポジトリ内で確認できなかったため、今回の統合はユーザー指示に含まれる教材インサイトと一般化したSubstack運用設計に基づく。
- Substackの具体的なUIや仕様は変わる可能性があるため、自動投稿やAPI前提にはしていない。
- paid strategyは早すぎると信頼形成を損なうため、readiness管理へ後回しにした。

## 8. Recommended Next Step

`substackPublicationStrategy` schemaを実装する前に、追加した6つのSubstack promptでHitori Media Labのpositioning、About Page、Welcome Emailを作り、ボスがレビューする。

## 9. Exact Prompt to Give Codex Next

```text
Use the new Substack prompts to create draft strategy artifacts for Hitori Media Lab.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not auto-post to Substack.
Do not write directly to Sanity.
Do not run seed --replace.
Do not commit secrets.

Use:
- prompts/substack-positioning.md
- prompts/substack-about-page.md
- prompts/substack-welcome-email.md
- docs/35-substack-strategy-integration.md
- docs/36-substack-content-os-pipeline.md

Create local draft files under outputs/substack-strategy/ for:
- positioning
- about page
- welcome email
- first 30-day growth action plan

Keep them as drafts for human review.
```
