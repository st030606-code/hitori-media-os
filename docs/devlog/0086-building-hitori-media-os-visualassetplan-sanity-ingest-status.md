# Devlog 0086: building-hitori-media-os visualAssetPlan Sanity Ingest Status

Date: 2026-05-14
Status: **completed** (human-confirmed in Sanity Studio, 2026-05-14)

## Purpose

`seed/visual-asset-plan-records-building-hitori-media-os.json` の Sanity dataset への投入状態を公式記録する。CLI から dataset を直接観測する手段は無いが、人間が Sanity Studio で確認した結果、building-hitori-media-os の visualAssetPlan 9 件がまだ Studio に出てこない（ai-blog-db の 5 件のみ表示）状態。

## Observed State (2026-05-14)

### Seed file

- パス: `seed/visual-asset-plan-records-building-hitori-media-os.json`
- 状態: ✓ 存在
- サイズ: 26,176 bytes
- 形式: 有効な JSON array
- レコード数: **9**

### 9 Expected `_id` values

```text
visualAssetPlan.building-hitori-media-os.note-hero-v1                              ★ P1 production hero
visualAssetPlan.building-hitori-media-os.substack-header-v1                        ★ P1 shared master with note hero
visualAssetPlan.building-hitori-media-os.x-hook-main-v1                            ★ P1 X main hook
visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1
visualAssetPlan.building-hitori-media-os.note-inline-content-os-flow-v1
visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1
visualAssetPlan.building-hitori-media-os.note-inline-manual-vs-automation-v1
visualAssetPlan.building-hitori-media-os.note-inline-publish-package-folder-v1
visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1
```

### Sanity Studio (human-observed)

人間が Studio で `visualAssetPlan` を開いて確認:

- ai-blog-db の visualAssetPlan は 5 件表示される（既存）。
- building-hitori-media-os の visualAssetPlan は **表示されない**。
- → seed は **まだ Sanity dataset に投入されていない**。

### Documented status across prior devlogs / handoffs

- 「Sanity CLI 未実行」「seed はローカル保存のみ」「Sanity Studio への投入は人間判断」が複数バッチで明示。
- ローカル登録（Visual Register Inbox Review）と Sanity 反映を意図的に分離する方針を維持。

## Safe Create Command (human runs manually)

人間が次を **コピペで1回だけ** 実行:

```bash
npx sanity documents create seed/visual-asset-plan-records-building-hitori-media-os.json
```

### Important Warnings

🚫 **`--replace` を絶対に付けない**。  
理由: 既存 contentIdea / 他 schema document の意図しない上書きや、既に手動入力した `localAssetPath` 等の喪失リスク。

🚫 **`npx sanity dataset import` 系も使わない**（既存 ai-blog-db 関連を上書きする可能性）。`documents create` のみで十分。

### Prerequisite

- `contentIdea.building-hitori-media-os` が dataset に **既に存在** する必要がある（reference validation のため）。
- もし無ければ先に:
  ```bash
  npx sanity documents create seed/contentIdea-building-hitori-media-os.json
  ```

## After Insert: Studio Search Targets

`npm run dev` で Studio を再読込し、左ナビ `Content Ideas → By Content Idea → building-hitori-media-os` か、`By Type (flat) → Visual Asset Plans` で次を検索:

- `building-hitori-media-os` → 9 件 hit するはず
- `note-hero-v1` → `visualAssetPlan.building-hitori-media-os.note-hero-v1`
- `substack-header-v1` → `visualAssetPlan.building-hitori-media-os.substack-header-v1`

## Manual Updates (after insert)

Visual Register Inbox Review で `note-hero-v1` の v001 を既に approve & register 済み（`docs/devlog/0085`）。対応する2件の visualAssetPlan を Studio で次のように更新:

### `visualAssetPlan.building-hitori-media-os.note-hero-v1`

| Field | Value |
| --- | --- |
| `localAssetPath` | `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` |
| `status` | `saved` |
| `reviewNotes` | `Production hero image selected and registered through Visual Register Inbox Review. Shared master asset for note hero and Substack header.` |

### `visualAssetPlan.building-hitori-media-os.substack-header-v1`

| Field | Value |
| --- | --- |
| `localAssetPath` | `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`（**note-hero-v1 と同パス**） |
| `status` | `saved` |
| `reviewNotes` | `Production hero image selected and registered through Visual Register Inbox Review. Shared master asset for note hero and Substack header.` |

両方の `localAssetPath` を完全一致させることで、Publish Package Builder が `publish-packages/{note,substack}/building-hitori-media-os/images/` に同じ master file を配布する。

## Status Field (updated 2026-05-14)

- [x] Seed inserted via `npx sanity documents create`（human-confirmed）
- [x] 9 visualAssetPlan が Studio で `building-hitori-media-os` 検索でヒット（human-confirmed）
- [x] `note-hero-v1` の `localAssetPath` / `status: saved` / `reviewNotes` 手動更新済み
- [x] `substack-header-v1` の `localAssetPath` / `status: saved` / `reviewNotes` 手動更新済み（master 共有）
- [x] `npm run publish:package -- building-hitori-media-os`（flag なし）で publish-package 実配布

note-hero-v1 / substack-header-v1 両方の `localAssetPath` は同じ `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` を指す（master 共有設計が Sanity 上で成立）。

`seed --replace` 不使用。Sanity direct write from code 不使用。Sanity CLI は人間が `documents create` を1回だけ手動実行。

## Safety

- 本バッチでは Sanity dataset / dataset 上の document を一切触っていない。
- direct Sanity write code path 追加なし。
- paid API integration 追加なし。
- `seed --replace` 不使用。
- Sanity CLI 自動実行なし。

## Why Not Auto-Run Sanity CLI

- 既存 ai-blog-db の document を誤って上書きするリスクを避ける（特に `--replace` 系）。
- Sanity dataset の状態は project ID / 認証情報依存で、Claude Code 側からは観測できない。
- `npx sanity documents create` は人間の手で1回だけ実行する運用が安全。
- 失敗時のロールバックも人間判断（CLI による create は idempotent ではない）。

## Related Files

- [seed/visual-asset-plan-records-building-hitori-media-os.json](../seed/visual-asset-plan-records-building-hitori-media-os.json)
- [seed/contentIdea-building-hitori-media-os.json](../seed/contentIdea-building-hitori-media-os.json)
- [docs/handoff/latest.md](handoff/latest.md)
- [docs/devlog/0085-note-hero-v1-production-visual-registration.md](devlog/0085-note-hero-v1-production-visual-registration.md)
- [docs/46-sanity-content-idea-centered-structure.md](46-sanity-content-idea-centered-structure.md)
