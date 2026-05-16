# 0030: Local Visual Register UIの実装計画を設計

日付: 2026-05-12

## 背景

Mac launcherにより、ユーザーは `npm run dev` を手入力せずSanity Studioを開けるようになりました。

次に必要なのは、手動生成した画像を正しいローカルパスへ保存し、`visualAssetPlan` と接続するUIです。

画像保存やSanity更新を手作業だけにすると、保存先ミス、status更新漏れ、patch作成ミスが起きやすくなります。

## 決定・変更

`docs/18-local-visual-register-ui-design.md` を追加しました。

この文書では、Next.js導入前の最小Local Node helper server / browser UIを設計しました。

想定構成:

```text
tools/visual-register/
  server.mjs
  public/
    index.html
    app.js
    styles.css
```

推奨script:

```json
{
  "visual:register": "node tools/visual-register/server.mjs"
}
```

## Visual Registerが行うこと

- ローカル画像ファイルを選択する。
- `visualAssetPlan` を選択する。
- 画像をプレビューする。
- expected `localAssetPath` を表示する。
- 画像を正しい `assets/visuals/...` pathへコピーする。
- Sanity patch/update JSONを作る。
- Sanityへ直接writeしない。

## まだ手動のまま残すこと

- ChatGPT画像生成やデザインツールでの画像生成
- 生成画像のダウンロード
- patch JSONの確認
- Sanity StudioまたはCLIでの反映
- SNSやnoteへの投稿

## Next.jsをまだ待つ理由

Visual Registerは将来Next.js dashboardへ移せます。

ただし、まずは軽量Node helper serverで、ローカル保存、path計算、patch JSON生成の使い勝手を検証する方が早いです。

Next.jsは、Sanity direct write、認証、dashboard全体設計まで含める段階で追加します。

## no-API MVPの維持

今回の変更は設計ドキュメントのみです。

Next.js、フロントエンドダッシュボード、有料LLM API連携、OpenAI API / Anthropic API クライアント、画像生成API呼び出し、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

新しい画像ファイルも作成していません。

## 次の一手

次は、Local Visual Register UIを最小実装します。

最初は `visualAssetPlan.ai-blog-db.note-hero-v1` を対象に、画像選択、プレビュー、保存、patch JSON生成までを通します。
