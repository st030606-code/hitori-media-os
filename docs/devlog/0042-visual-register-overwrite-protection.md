# 0042: Visual Register overwrite protection

日付: 2026-05-13

## 背景

note hero画像はすでにローカルに存在しています。

そのため、Visual Registerで同じ `visualAssetPlan` を再登録すると、既存画像を意図せず上書きする可能性がありました。

Batch UIでは複数画像を扱うため、上書き事故を防ぐ仕組みが必要です。

## 実装

### Server

`tools/visual-register/server.mjs` を更新しました。

- `GET /api/visual-asset-plans` が `expectedLocalAssetExists` を返すようにしました。
- `POST /api/register-visual` が保存予定パスの既存ファイルを確認します。
- 既存ファイルがあり、`overwriteConfirmed: true` がない場合は保存せず `409` を返します。
- Sanityへ直接writeはしません。

### UI

`tools/visual-register/public/app.js` と `styles.css` を更新しました。

- 既存ファイルがある行に `既存ファイルあり` chipを表示。
- 保存予定パスの下に警告を表示。
- `この画像で上書きする` checkboxを追加。
- checkboxが未確認の行は `登録` ボタンをdisabled。
- `まとめて登録` では、上書き確認がない行をスキップまたはブロック。
- toastで上書き確認が必要なことを知らせる。

## 安全性

上書き保護はUIだけでなくserver側でも行います。

そのため、UIの状態が古い場合や直接APIを呼んだ場合でも、`overwriteConfirmed: true` がない限り既存ファイルは上書きされません。

## Mac launcher

`launchers/start-mac.command` はすでにSanity StudioとLocal Visual Registerの両方を開く構成になっていました。

今回の作業では、launcherは変更していません。

## まだ必要なテスト

- note heroの既存ファイルありwarningが表示されるか。
- `この画像で上書きする` 未チェック時に登録できないか。
- checkbox確認後に意図通り登録できるか。
- batch registrationで未確認行がスキップされるか。
- 新規ファイルの行は従来通り登録できるか。

## Validation

実行した安全チェック:

- `node --check tools/visual-register/server.mjs`: pass
- `node --check tools/visual-register/public/app.js`: pass
- `npm run build`: pass
- `zsh -n launchers/start-mac.command`: exit code 0

`zsh -n` では、既存のbackground起動行に対して `nice(5) failed: operation not permitted` warningが表示されましたが、構文チェック自体は成功しています。

一時的に `VISUAL_REGISTER_PORT=3335 npm run visual:register` で起動し、API挙動を確認しました。

- `visualAssetPlan.ai-blog-db.note-hero-v1` の `expectedLocalAssetExists`: `true`
- `overwriteConfirmed` なしの `POST /api/register-visual`: `409`
- response: `overwriteRequired: true`

この検証では新しい画像ファイルは作成していません。

検証用サーバーは停止済みです。

## Manual test result

手動テスト結果:

- Visual Register opened: yes
- note hero existing file warning displayed: yes
- Register button blocked before overwrite confirmation: yes
- Server refused overwrite without confirmation: yes
- Overwrite confirmation checkbox worked: yes
- Batch registration skipped unconfirmed overwrite rows: not tested yet
- No direct Sanity write occurred: yes
- No unexpected image files were created: yes
- Overall result: Visual Register overwrite protection works well enough for MVP

Server側では、`overwriteConfirmed` なしの登録が `409` で拒否されることを確認済みです。

UI側でも、既存ファイルwarning、登録ボタンのblocking、checkbox confirmationが期待通り動くことを確認しました。

Confirm dialogは現時点では不要です。

MVPではcheckbox confirmationで十分です。

ただし、ユーザーがcheckboxを見落とす場合は、将来confirm dialogを追加します。

Multi-image batch registrationは、複数の生成画像がまだないため未テストです。

複数画像が用意できた段階で、未確認の上書き行がbatch登録から適切に除外されるか確認します。

## 次の一手

複数画像が用意できた段階で、multi-image batch registrationをテストします。

次の実装候補は、patch JSONをSanityへ反映する手作業を減らすための安全なpatch preview / apply補助です。
