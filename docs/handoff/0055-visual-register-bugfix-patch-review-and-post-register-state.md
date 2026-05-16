# Handoff: Visual Register bugfix - Patch Review and post-register state

Date: 2026-05-13

## 1. Task Goal

Local Visual Registerで確認された2つの問題を修正する。

- 登録成功直後に既存ファイル警告が出る状態管理の混乱
- Patch Review reload時にplain text `Not found` をJSONとして読んで失敗する問題

## 2. Constraints Followed

- Next.jsは追加していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- Sanityへ直接writeしていません。
- `seed --replace` は実行していません。
- シークレットは追加していません。

## 3. Changed Files

- `tools/visual-register/server.mjs`
- `tools/visual-register/public/app.js`
- `tools/visual-register/public/styles.css`
- `docs/19-local-visual-register-ui.md`
- `docs/devlog/0045-visual-register-bugfix-patch-review-and-post-register-state.md`
- `docs/handoff/latest.md`
- `docs/handoff/0055-visual-register-bugfix-patch-review-and-post-register-state.md`

## 4. Summary of Changes

Server側では未知の `/api/*` routeがJSON errorを返すようにしました。

Frontend側ではAPI responseを安全に読む `fetchJson` helperを追加し、`response.ok` とJSON parse failureを扱うようにしました。

登録成功後の行は `saved` stateとして扱い、既存ファイル警告ではなく `登録完了 / 保存済み / Patch作成済み` の状態を表示します。

## 5. Important Decisions

- Patch Review endpointは `/api/visual-patches` に統一。
- 未知API routeもJSONを返す。
- 登録済み行では、ファイル存在をoverwrite riskではなく正常な保存済み状態として表示する。
- 未登録行と再登録時のserver-side overwrite protectionは維持する。

## 6. Human Review Questions

- 登録後の `登録済み` 表示は十分に分かりやすいか。
- Patch Reviewのエラー文言は日本語として自然か。
- 保存済み行に「再登録」導線を後で追加する必要があるか。
- 複数画像batch登録でも同じ状態管理で混乱がないか。

## 7. Risks or Uncertainties

- ブラウザでの実UI再確認が必要です。
- 古いVisual Register server processが残っている場合、修正前のJS/APIが見える可能性があります。
- batch登録の複数画像ケースは、複数の生成画像が揃ってから確認が必要です。

## Validation

- `node --check tools/visual-register/server.mjs`: pass
- `node --check tools/visual-register/public/app.js`: pass
- `npm run build`: pass
- 一時ポート `3335` で `GET /api/visual-patches` を確認し、3件のpatchがJSONで返りました。
- `patches/visual-assets/ai-blog-db/note-hero-v1.json` がPatch Review API結果に含まれることを確認しました。
- 未知の `/api/not-found-test` がplain textではなくJSON errorを返すことを確認しました。

## 8. Recommended Next Step

Visual Registerを再起動し、次を確認します。

- Patch Reviewに `patches/visual-assets/ai-blog-db/note-hero-v1.json` が表示される。
- reloadしてもJSON parse errorが出ない。
- 既存ファイルがある未登録行は上書き確認でブロックされる。
- 登録成功後は、同じ行が警告ではなく保存済み状態になる。

## 9. Exact Prompt to Give Codex Next

```text
Record the Visual Register bugfix manual test result.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity.
Do not run seed --replace.
Do not commit secrets.

Current result:
- Visual Register restarted after bugfix: [yes/no + notes]
- Patch Review listed note-hero-v1 patch: [yes/no + notes]
- Patch Review reload no longer shows JSON parse error: [yes/no + notes]
- Existing file warning appears before registration when target path exists: [yes/no + notes]
- Register button is blocked until overwrite confirmation before registration: [yes/no + notes]
- After successful registration, row shows saved/registered state instead of warning: [yes/no + notes]
- Patch JSON path is shown after registration: [yes/no + notes]
- No direct Sanity write occurred: [yes/no]
- No unexpected image files were created: [yes/no + notes]

Tasks:
1. Record the manual test result.
2. Update docs/devlog and handoff.
3. Recommend whether multi-image batch registration should be tested next.

After editing, summarize:
1. Whether the bugfix worked
2. Whether Patch Review is stable
3. Whether post-registration state is clear
4. What should be tested next
```
