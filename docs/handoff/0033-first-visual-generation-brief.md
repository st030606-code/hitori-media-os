# Handoff: First Visual Generation Brief

Date: 2026-05-12

## 1. Task Goal

実画像生成に入る前に、最初のnote hero / eye-catch画像の生成ブリーフを作成する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- 実画像ファイルは作成していません。
- `publishedOutput` seed documentsは作成していません。

## 3. Changed Files

- `docs/13-first-visual-generation-brief.md`
- `docs/devlog/0026-first-visual-generation-brief.md`
- `docs/handoff/latest.md`
- `docs/handoff/0033-first-visual-generation-brief.md`

## 4. Summary of Changes

Before / After図解をベースにした、note hero / eye-catch用の生成ブリーフを作成しました。

採用した `diagramPlan` は `diagramPlan.ai-blog-db.before-after` です。

## 5. Key Decisions

- 最初の画像はnote hero / eye-catchにする。
- 方向性はBefore / After図解にする。
- 最初は `16:9` で作る。
- 画像生成はまだ行わない。
- 良ければX hook画像、Instagramカルーセル表紙、YouTube動画内スライドに再利用する。

## 6. Human Review Questions

- main messageは `記事を増やすより、AIが使えるDBを作る。` でよいか。
- note heroとして、Before / Afterの図解感が強すぎないか。
- 図内テキストはもっと少なくするべきか。
- 最初の生成は `16:9` でよいか、note向けに別比率も試すべきか。

## 7. Risks or Uncertainties

- 画像生成時に日本語テキストが崩れる可能性があります。
- 図内テキストが多いと、note heroとして読みにくくなる可能性があります。
- XやInstagramに転用するには、別比率で再構成が必要です。

## 8. Recommended Next Step

ユーザーが明示的に依頼したら、`docs/13-first-visual-generation-brief.md` をもとに最初のnote hero / eye-catch画像を1枚生成する。

生成後は、使える方向性か確認し、必要ならX hook画像やInstagramカルーセル表紙へ展開する。

## 9. Exact Prompt to Give Codex Next

```text
Generate the first note hero / eye-catch image based on docs/13-first-visual-generation-brief.md.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.

Use:
- docs/13-first-visual-generation-brief.md

Requirements:
- Create one 16:9 note hero / eye-catch image.
- Theme: Before / After, from article pile to AI-usable database.
- Keep Japanese text short and readable.
- Avoid API automation or auto-posting imagery.
- Do not imply fully automated publishing.
- Save or place the generated image in an appropriate local assets directory if the workflow supports it.
- Create or update a devlog and handoff after generation.

After editing, summarize:
1. What image was generated
2. Where it was saved
3. What should be reviewed visually
4. Whether variants for X and Instagram should come next
```
