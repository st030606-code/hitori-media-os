# Handoff: Final Visual Register Content Idea display browser check

Date: 2026-05-13

## 1. Task Goal

Visual RegisterのContent Idea表示修正後の最終ブラウザ確認を記録し、次にContent Idea filter / groupingへ進むべきか判断する。

## 2. Constraints Followed

- Next.jsは追加していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- Sanityへ直接writeしていません。
- `seed --replace` は実行していません。
- シークレットは追加していません。
- 新しい生成画像は作成していません。

## 3. Changed Files

- `docs/devlog/0047-visual-register-browser-retest-content-idea-display.md`
- `docs/handoff/latest.md`
- `docs/handoff/0058-final-visual-register-content-idea-display-check.md`

## 4. Summary of Changes

最終ブラウザ確認結果を記録しました。

確認結果:

- Visual Register restarted after Content Idea display fix: yes
- Preview detail shows `コンテンツアイデア（Content Idea）`: yes
- Displayed value is `ai-blog-db / contentIdea.ai-blog-db`: yes
- Patch Review still lists `note-hero-v1` and newly added image patches: yes
- Patch Review reload still works: yes
- No direct Sanity write occurred: yes
- No unexpected image files were created: yes

## 5. Important Decisions

- Content Idea表示は修正済みとして扱います。
- Patch Reviewは安定しているため、次はContent Idea filter / groupingへ進めます。
- schema変更はまだ不要です。

## 6. Human Review Questions

- Content Idea表示の位置と文言は十分に分かりやすいか。
- Content Idea filter / groupingを先に入れるか、別のVisual Register改善を優先するか。

## 7. Risks or Uncertainties

- 複数Content Ideaでの実運用はまだ未テストです。
- Content Ideaが増えると、現在のplan selectだけでは探しにくくなる可能性が高いです。

## 8. Recommended Next Step

Content Idea filter / groupingを実装することを推奨します。

理由:

- Visual RegisterはContent Idea単位で画像、patch、出力を扱う運用になってきた。
- 複数Content Ideaが増える前に、UIの選択ミスを減らした方がよい。
- schema変更なしで、既存の `sourceContentIdeaId` / `contentSlug` を使って実装できる。

## 9. Exact Prompt to Give Codex Next

```text
Implement Content Idea filter and grouping in Local Visual Register.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity.
Do not run seed --replace.
Do not commit secrets.
Do not create new generated image files.

Goal:
Make Visual Register easier to use when multiple Content Ideas exist.

Use:
- tools/visual-register/server.mjs
- tools/visual-register/public/index.html
- tools/visual-register/public/app.js
- tools/visual-register/public/styles.css
- seed/visual-asset-plan-records.json

Tasks:
1. Add a Content Idea filter UI above the registration queue.
2. Use visualAssetPlan.sourceContentIdea / sourceContentIdeaId / contentSlug.
3. Group or filter available visualAssetPlan options by Content Idea.
4. Keep current behavior working when only one Content Idea exists.
5. Do not change schemas unless absolutely necessary.
6. Update docs/devlog and handoff.

After editing, summarize:
1. What filter/grouping was added
2. How it reduces plan selection mistakes
3. Whether Patch Review stayed unchanged
4. What should be tested next
```
