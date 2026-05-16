# Handoff: Frontend UI Design System

Date: 2026-05-13

## 1. Task Goal

将来のNext.js dashboardとローカルツールで共有するfrontend UI design system仕様を作成する。

## 2. Constraints Followed

- Next.jsは追加していません。
- 現在のVisual Register UIは移行していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- シークレットは追加していません。

## 3. Changed Files

- `docs/20-frontend-ui-design-system.md`
- `docs/05-future-dashboard.md`
- `docs/19-local-visual-register-ui.md`
- `docs/devlog/0036-frontend-ui-design-system.md`
- `docs/handoff/latest.md`
- `docs/handoff/0044-frontend-ui-design-system.md`

## 4. Summary of Changes

将来dashboardの推奨frontend stackを定義しました。

- Next.js
- Tailwind CSS
- shadcn/ui
- lucide-react
- Material Design 3 inspired design principles

Tailwind CSSとshadcn/uiを推奨する理由、UI principles、reusable component candidates、design tokens、現在のLocal Visual Registerの扱いを整理しました。

## 5. Important Decisions

- 現在のLocal Visual Registerは静的HTML / CSS / JavaScriptのまま維持する。
- 今すぐNext.jsへ移行しない。
- 将来dashboardへ移すときは、shared component systemで再構築する。
- UIは日本語優先、app-like dashboard、card、chip、queue、preview、toastを基本にする。

## 6. Human Review Questions

- Tailwind CSS + shadcn/ui 方針で問題ないか。
- Material Design 3 inspiredの温度感は合っているか。
- component候補に不足がないか。
- Visual Registerを今は静的UIのまま維持する判断でよいか。

## 7. Risks or Uncertainties

- 実際のNext.js導入時に、ローカルファイル保存との接続設計が必要です。
- shadcn/uiのcomponent設計は、最初に作りすぎると重くなる可能性があります。
- UI tokenは実装時に調整が必要です。

## 8. Recommended Next Step

Next.js追加はまだ待ちます。

次は、複数画像でBatch Visual Registerを手動テストするか、patch JSONをSanityへ安全に反映する手順を設計します。

## 9. Exact Prompt to Give Codex Next

```text
Design the safe patch JSON apply workflow for Visual Register.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity yet unless the design explicitly recommends it for a later phase.
Do not commit secrets.

Use:
- patches/visual-assets/
- schemas/visualAssetPlan.ts
- docs/19-local-visual-register-ui.md
- docs/20-frontend-ui-design-system.md

Tasks:
1. Design how patch JSON created by Visual Register should be reviewed.
2. Design how a human should apply patch JSON to Sanity safely.
3. Compare manual Studio update, CLI patch command, and future dashboard direct write.
4. Recommend MVP order.
5. Update docs/devlog and handoff.

After editing, summarize:
1. What patch apply workflow is recommended
2. What remains manual
3. What should be automated later
4. Whether Next.js should still wait
```
