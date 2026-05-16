# Handoff: Visual Register Content Idea filter / grouping

Date: 2026-05-13

## 1. Task Goal

Local Visual RegisterにContent Idea filter / groupingを追加し、複数Content Ideaが存在する場合のplan選択ミスを減らす。

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
- schema変更はしていません。

## 3. Changed Files

- `tools/visual-register/public/index.html`
- `tools/visual-register/public/app.js`
- `tools/visual-register/public/styles.css`
- `docs/19-local-visual-register-ui.md`
- `docs/devlog/0048-visual-register-content-idea-filter-grouping.md`
- `docs/handoff/latest.md`
- `docs/handoff/0059-visual-register-content-idea-filter-grouping.md`

## 4. Summary of Changes

登録キューの上に `コンテンツアイデア（Content Idea）` filterを追加しました。

filterは `visualAssetPlan.sourceContentIdea` / `sourceContentIdeaId` / `contentSlug` を使います。

plan selectはContent Ideaごとの `optgroup` で表示します。

画像追加時は、選択中Content Ideaの `visualAssetPlan` を優先して割り当てます。

1つのContent Ideaしかない場合はfilterをdisabledにし、現在の操作感を保ちます。

## 5. Important Decisions

- schema変更は不要。
- Patch Reviewは変更しない。
- filter外のplanを既に選んでいる行は、選択を壊さず `現在選択中` として残す。
- Content Ideaが増える前にUI側で誤登録防止を入れる。

## 6. Human Review Questions

- filterの位置は分かりやすいか。
- 1つのContent Ideaしかない状態でdisabled filterが邪魔に見えないか。
- plan selectの `optgroup` 表示は見やすいか。
- 次にplatform / assetType / status filterも必要か。

## 7. Risks or Uncertainties

- 複数Content Idea seedでの実ブラウザ確認はまだです。
- 現在はseed JSONベースなので、将来Sanityから直接読むdashboardでは再実装が必要です。

## Validation

- `node --check tools/visual-register/public/app.js`: pass
- `node --check tools/visual-register/server.mjs`: pass
- `npm run build`: pass
- `seed/visual-asset-plan-records.json` は5件、Content Ideaは `contentIdea.ai-blog-db` 1件であることを確認。
- `GET /api/visual-asset-plans` が5件を返し、`sourceContentIdeaId: contentIdea.ai-blog-db` と `contentSlug: ai-blog-db` を含むことを確認。
- `GET /api/visual-patches` が `ok: true`、`count: 3`、`hasNoteHero: true` を返すことを確認。
- 検証用Visual Register serverは停止済み。

## 8. Recommended Next Step

Visual Registerをブラウザで開き、次を確認します。

- Content Idea filterが登録キュー上に表示される。
- 1つのContent Ideaしかない場合はfilterがdisabledになる。
- summaryに表示件数が出る。
- plan selectがContent Ideaごとにgroupingされる。
- 画像追加時に既存の登録フローが壊れていない。
- Patch Reviewがこれまで通り動く。

その後、複数Content Ideaのテストseedを作るか、platform / assetType filterへ進むか判断します。

## 9. Exact Prompt to Give Codex Next

```text
Record the Visual Register Content Idea filter browser test result.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity.
Do not run seed --replace.
Do not commit secrets.
Do not create new generated image files.

Current result:
- Visual Register opened after Content Idea filter update: [yes/no + notes]
- Content Idea filter appears above registration queue: [yes/no + notes]
- Filter is disabled when only one Content Idea exists: [yes/no + notes]
- Summary count is displayed: [yes/no + notes]
- Plan select is grouped by Content Idea: [yes/no + notes]
- Existing image registration flow still works: [yes/no + notes]
- Patch Review stayed unchanged/stable: [yes/no + notes]
- No direct Sanity write occurred: [yes/no]
- No unexpected image files were created: [yes/no + notes]

Tasks:
1. Record the browser test result.
2. Update docs/devlog and handoff.
3. Recommend whether to create a second Content Idea test seed or add platform / assetType filters next.

After editing, summarize:
1. Whether Content Idea filter works
2. Whether plan grouping is clear
3. Whether Patch Review stayed stable
4. What should be implemented next
```
