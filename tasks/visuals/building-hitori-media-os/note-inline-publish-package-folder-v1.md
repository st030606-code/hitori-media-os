# Brief: note-inline-publish-package-folder-v1

Priority: P3
Status: brief-ready

## Asset Metadata

- Asset ID: `note-inline-publish-package-folder-v1`
- Visual Asset Plan ID: `visualAssetPlan.building-hitori-media-os.note-inline-publish-package-folder-v1`
- Source Content Idea: `contentIdea.building-hitori-media-os`
- Target Platform: note（inline）
- Asset Type: architecture-diagram
- Aspect Ratio: 16:9
- Pixel size: 1600 x 900
- Reuse Policy: reusable

## Objective

note 記事 **第5章「text / visual / video / audio を1つのアイデアから捌く」** の末尾に配置する inline 構造図。
Publish Package Builder が生成する `publish-packages/<platform>/<slug>/` のフォルダ構造と、それを支える 4 つの安全弁（safe-skip-existing-files / placeholder detection / dry-run / --replace-placeholder-package）を1枚で見せる。

## Message

ローカル Publish Package Builder が、公開前素材を整理しつつ「安全側に倒す」仕組みを持っている。

## Audience

第5章まで読み進めて「で、実際にどう運用してるの？」と気になっている技術寄りの読者。

## Placement

- note 記事の本文第5章末尾、または「Publish Package Builder」の本文段落直後に配置。

## Visual Style

- テクニカル寄り、ファイルツリー的な見た目
- 等幅フォントは構造ツリー部分にだけ使用、見出しは通常の sans-serif
- アクセント色は安全弁部分のみ

## Layout Guidance

- 画面を左 60% / 右 40% に分ける。
- 左 60%: 大きなフォルダツリー表示。
  ```
  publish-packages/
    <platform>/
      <slug>/
        README.md
        <draft target>      ← 例: article.md / posts.md / post.md / script.md
        checklist.md
        images/
  ```
  - `<platform>` の下に代表として `note` / `x` / `substack` / `threads` / `youtube` / `shorts` / `podcast` の7文字列を縦に小さく列挙してもよい。
  - 等幅フォントで構造ツリー感を出す。
- 右 40%: 縦に「Safe Behaviors」リスト。アイコン的な丸 + 短い英文ラベル4項目。
  - `safe-skip-existing-files`
  - `placeholder detection`
  - `dry-run`
  - `--replace-placeholder-package`
- 右側の4項目だけアクセント色1色を使う。

## Text To Include

- publish-packages / <platform> / <slug>
- README.md / draft target / checklist.md / images
- safe-skip-existing-files
- placeholder detection
- dry-run
- --replace-placeholder-package

## Text To Avoid

- auto publish / auto post
- API投稿
- 全自動

## Reuse Notes

- GitHub README architecture / YouTube screen 補足としても転用可。reusable。

## Generation Prompt (paste-ready)

```text
1600x900 で生成してください（16:9 横長）。

note 記事内の inline architecture 図です。テーマは「Publish Package Builder のフォルダ構造と安全弁」。

レイアウト:
- 画面を左 60% / 右 40% に分ける。

左 60%（フォルダ構造）:
- 大きなフォルダツリー表示。等幅フォントで構造ツリー感を出す。
- ルート: publish-packages/
- 次の階層: <platform>/
- 次の階層: <slug>/
- 末端ファイル: README.md, <draft target>, checklist.md, images/
- <platform> の下に小さく代表 platform 名を列挙: note / x / substack / threads / youtube / shorts / podcast
- 全体は実際のディレクトリツリー的にインデントで表現。

右 40%（Safe Behaviors）:
- 上に小さく節タイトル『Safe Behaviors』。
- 縦に4項目をアイコン的な丸（または小さな丸角矩形）と短い英文ラベルで並べる:
  1. safe-skip-existing-files
  2. placeholder detection
  3. dry-run
  4. --replace-placeholder-package
- これら4項目だけアクセント色を使う。

スタイル:
- 背景は白。
- 左側の構造ツリーは等幅フォント、濃いネイビー or チャコールグレー。
- 見出しや右側ラベルは通常の sans-serif。
- アクセントは1色のみ（右側の4項目）。
- 装飾なし、影なし、グラデーションなし。

避けるもの:
- auto publish / auto post / API投稿 / 全自動といった煽り。
- 顔写真、人物。
- ロボットや脳のシンボル。
- ロゴ風表現、商標。

ユースケース:
- note 記事の長文中に埋め込む技術寄りの図。
- 開発者・編集者寄りの読者が「仕組みの存在」を読み取れるように。

実際のフォルダ名や安全弁の英字スペル（safe-skip-existing-files / placeholder detection / dry-run / --replace-placeholder-package）を正確に表記してください。
```

## Review Checklist

- [ ] フォルダツリーが等幅フォントで読める
- [ ] 4つの安全弁の英字が正確（ハイフン / アンダースコアを混同しない）
- [ ] アクセント色は右側4項目だけに使われている
- [ ] 全体の情報量が note inline 並みに収まっている
- [ ] secret / 実project ID / private/ パスが映っていない
- [ ] 顔写真なし
- [ ] 有料PDF教材本文の図版が混ざっていない

## Save Path & Registration

- Save to: `assets/visuals/building-hitori-media-os/note/inline/note-inline-publish-package-folder-v1.png`
- Visual Register で登録:
  1. `npm run visual:register`
  2. Content Idea filter = `contentIdea.building-hitori-media-os`
  3. visualAssetPlan `note-inline-publish-package-folder-v1` を選択
  4. 画像 drop → 登録
- Sanity Studio で `localAssetPath` 反映 / `status: saved`。

## Safety

- No paid image generation API
- No auto-posting
- No face photo
- No paid PDF content copied
- Manual generation, manual registration, manual Sanity update
