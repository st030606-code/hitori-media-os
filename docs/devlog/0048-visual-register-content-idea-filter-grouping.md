# Devlog 0048: Visual Register Content Idea filter / grouping

Date: 2026-05-13

## 今日の判断

Local Visual Registerに、Content Idea filter / groupingを追加しました。

目的は、Content Ideaが増えたときに、別テーマの `visualAssetPlan` へ画像を誤登録するリスクを減らすことです。

## 変更内容

`tools/visual-register/public/index.html`:

- 登録キューの上に `コンテンツアイデア（Content Idea）` filterを追加しました。
- filter summaryを表示する領域を追加しました。

`tools/visual-register/public/app.js`:

- `visualAssetPlan.sourceContentIdea` / `sourceContentIdeaId` / `contentSlug` からContent Idea一覧を作るようにしました。
- active Content Idea filterを追加しました。
- 画像追加時は、選択中Content Ideaの `visualAssetPlan` を優先して割り当てます。
- plan selectはContent Ideaごとの `optgroup` で表示します。
- filter外のplanを既に選んでいる行は、選択を壊さず `現在選択中` として残します。

`tools/visual-register/public/styles.css`:

- filter barのレイアウトとsummary表示を追加しました。

## なぜこの設計にしたか

Visual Registerは、画像ファイルを `visualAssetPlan` に登録するツールです。

Content Ideaが1つだけなら、plan selectだけでも運用できます。

しかし、Content Ideaが増えると、note hero、X hook、Instagram coverなど似た名前のplanが増え、別テーマへ誤登録しやすくなります。

そのため、最初にContent Ideaで絞り込み、その中からplanを選ぶ流れにしました。

## APIなしMVPとの関係

schema変更はしていません。

Sanity direct writeもしていません。

既存の `visualAssetPlan.sourceContentIdea` referenceと、Local Visual Register APIが返す `sourceContentIdeaId` / `contentSlug` を使っています。

## Patch Reviewへの影響

Patch Reviewの挙動は変更していません。

今回の変更は、登録キューのplan選択UIだけに閉じています。

## 次に確認すること

- Content Ideaが1つだけの状態でfilterがdisabledになり、現在の操作感を壊していないか確認する。
- 画像追加時に、選択中Content Ideaのplanが優先されるか確認する。
- 将来、2つ目のContent Idea seedを追加したときにfilter / groupingが自然に動くか確認する。

## ブラウザ確認結果

Content Idea filter追加後に、ブラウザで確認しました。

- Visual Register opened after Content Idea filter update: yes
- Content Idea filter appears above registration queue: yes
- Filter is shown with only one Content Idea currently available
- Summary count is displayed: yes
- Plan select grouping by Content Idea is not fully testable yet because only one Content Idea exists
- Existing image registration flow still works: yes
- Patch Review stayed unchanged/stable: yes
- No direct Sanity write occurred: yes
- No unexpected image files were created: yes

## 次の推奨

次は、2つ目のContent Idea test seedを作るのがよいです。

理由:

- Content Idea filter自体は表示できている。
- ただし、実際に複数Content Idea間で切り替える動作はまだ確認できていない。
- plan selectの `optgroup` が複数groupで自然に見えるか確認する必要がある。
- platform / assetType filterは、その後で追加した方が判断しやすい。

## 発信ネタになりそうな切り口

- 「AIコンテンツ運用では、生成物よりも親テーマの取り違えを防ぐUIが大事」
- 「Content Idea単位で画像planを絞ると、ローカル運用でも迷子になりにくい」
- 「schemaを増やさず、既存referenceだけで運用UIを改善する」
