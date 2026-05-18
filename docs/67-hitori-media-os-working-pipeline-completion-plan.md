# 67 — Hitori Media OS Working Pipeline Completion Plan (design / plan only)

Date: 2026-05-18
Status: **plan-only / 0 image generation / 0 schema change / 0 sanity write / 0 deploy / 0 candidate PNG modified**
Scope: visual 品質完成より前に、**candidate generation → review → approve/register → Sanity 反映 → publish-package → manual publish 準備** の full pipeline を 1 周 通すための完成計画。

本 doc は [docs/48](48-campaign-generation-flow.md)（13 段フロー）と [docs/66](66-japanese-visual-generation-quality-upgrade.md)（Japanese editorial v1）を入力に、**working pipeline 1 周を最短経路で閉じる** ための具体タスクを記述する。

---

## 1. なぜこの計画があるか

直近で visual の品質改善ループ（v001 → v002 → v003 → v004）を回した結果、`note-inline-content-os-flow-v1 v004` が **35/35 self-rubric** を達成した。だが boss 観察:

- 「**プロ品質ではないが、note inline に貼って意味は伝わる**」段階
- visual 品質をさらに追求すると、**other 6+ assets が手付かずのまま 1 ヶ月過ぎる** リスクが高い
- それより **pipeline を 1 周通して**「実際に publish できる」状態を作る方が、Hitori Media OS の価値証明として重い

→ 本 doc の中心方針:

- visual 品質を **"good enough for working pipeline"** に固定（§3）
- 残り visual を **1 candidate / 1 asset の最小スコープ** で揃える（§5）
- approve → Sanity 反映 → publish package → release review 完走 までの **チェックリスト化**（§7-9）
- pipeline 1 周後に **改めて visual quality 改善 phase に戻れる** ように deferred list を明示（§11）

---

## 2. "Working" の定義

「Hitori Media OS が **動く** とはどういう状態か」を以下に固定:

### 2.1 必須 7 条件

1. `building-hitori-media-os` campaign の **全 9 visualAssetPlan** が `status: saved` か `status: reviewed`（Sanity）
2. 各 visualAssetPlan の `localAssetPath` が `assets/visuals/.../*.png` を指し、ファイルが実在
3. `patches/visual-assets/building-hitori-media-os/*.json` が全件揃う（Visual Register `approve & register` 経由で生成済）
4. `npm run publish:package -- building-hitori-media-os` が **dry-run と actual 両方** で成功
5. `publish-packages/<platform>/building-hitori-media-os/` 配下に X / note / Substack / Threads の 4 platform 分の text + image が揃う
6. `publish-packages/campaigns/building-hitori-media-os-release-review/` の 4 platform `*-final-review.md` が全 unchecked → reviewed に更新
7. `final-human-checklist.md` が full pass、ready-to-publish 状態

### 2.2 "Working" ≠ "完璧"

| Working | 完璧 |
| --- | --- |
| visual が読者に意味を伝える | プロ illustrator 品質 |
| 全 visualAssetPlan に saved な final asset | 全 candidate が rubric 30+ |
| publish-package が assemble できる | layout selector が UI 化されている |
| manual publish 用 markdown が並ぶ | 半自動 publish が動く |
| 1 brand profile / 1 campaign で完走 | multi-tenant SaaS-ready |

Working は **「次に売るための土台が完成した」** 状態。完璧は別 phase。

---

## 3. "Good enough for working pipeline" 視覚品質基準

### 3.1 採用ライン（このフェーズ限定）

| 観点 | 採用 OK | 採用 NG |
| --- | --- | --- |
| Japanese-first | 主要ラベルの過半が日本語 | 主要ラベルが英語のみ |
| title-card 化 | 図 / 構造が画面の 30%+ | 大ヘッドラインだけ |
| secret / private 漏洩 | なし | あり = 即 NG |
| note / Threads / Substack に貼れるか | 媒体トーンに著しく外れない | 顔写真 / sci-fi 風 / ロゴ風 |
| 視認性 | 媒体 default size で日本語が読める | 文字潰れ |
| brand consistency | warm amber 1 色アクセント、navy text、白背景 | accent 多色、ネオン |
| 完成度 | "プロ品質ではないが意味は伝わる" | "概念図にすらなっていない" |

→ 35/35 satisfy 必須ではない。**24/35（採用候補ライン）でこのフェーズは進める**。

### 3.2 採用基準を **下げない** 部分

- secret / project ID / private path 漏洩: **ゼロ許容**
- 顔写真 / 人物 / AI generated avatar: **ゼロ**
- ロボット / 脳 icon / 完全自動化メッセージ: **ゼロ**
- 商標・実在ロゴ流用: **ゼロ**
- 既存採用済 visual（campaign-hero-v1 / x-hook-main-v1）の上書き: **禁止**

### 3.3 Deferred to "Visual Engine Improvement Phase"（将来 phase）

このフェーズで **追わない** 改善項目:

- プロ illustrator 品質（icon の手描き感、photo-realistic 要素）
- **Design Profile** schema 化 + dashboard UI 選択肢化（[docs/63 §7.1](63-cross-platform-content-visual-generation-core.md)）
- **Layout Pattern Preset** schema 化（19 種を record として持つ、[docs/62 §8](62-admin-phase-2-visual-generation-admin-design.md)）
- **advanced layout selector**（boss が dashboard で layout を pick → preview）
- **image model / provider の最適化**（Codex `image_gen` 以外の比較評価）
- **SaaS-grade visual generation engine**（queue worker / multi-tenant storage / billing）
- **automatic rubric scoring**（Codex に self-score させる workflow）
- **prompt A/B test framework**

これらは Phase 2D（productization）以降、または **boss が 1 ヶ月以上 working pipeline を運用した後** に再評価。

---

## 4. Candidate Policy（凍結）

### 4.1 既存 candidate の扱い

| Asset | 既存 candidate | 採用 | 履歴扱い |
| --- | --- | --- | --- |
| `note-hero-v1` | v001（採用済、`campaign-hero-v1.png`） | **採用済**（filesystem に final 有、patch 有） | 上書き禁止 |
| `substack-header-v1` | （master sharing で `campaign-hero-v1.png` を共有） | **共有採用**（patch まだ未生成） | — |
| `x-hook-main-v1` | v001（採用済、`x-hook-main-v1.png`） | **採用済**（filesystem に final 有、patch 有） | 上書き禁止 |
| `threads-support-diagram-v1` | v001 / v002 / v003（旧プロンプト系、Japanese-first 不足） | **新規 v004（Japanese-first）を生成して採用候補に** | v001-v003 は historical reference |
| `note-inline-content-os-flow-v1` | v001 / v002 / v003 / v004（japanese-editorial-v1） | **v004 を採用候補に**（35/35 self-rubric） | v001-v003 は historical |
| `note-inline-human-judgment-v1` | （未生成） | **v001（Japanese-first）を 1 件生成、採用候補に** | — |
| `note-inline-manual-vs-automation-v1` | （未生成） | **本フェーズでは保留**（§5.3） | — |
| `note-inline-publish-package-folder-v1` | （未生成） | **本フェーズでは保留**（§5.3） | — |
| `substack-inline-reader-system-v1` | （未生成） | **v001（Japanese-first）を 1 件生成、採用候補に** | — |

### 4.2 ループ禁止条件

- 1 asset に **5 candidates 以上** を作らない（無限改善ループ防止）
- 既存 v001-v003 がある asset でも、Japanese-first 系を **1 件追加で打ち止め**
- 採用後の visual に対する再生成は **このフェーズでは禁止**（次の Visual Engine Improvement Phase に持ち越し）
- 候補 PNG を **削除しない**（history 保持、build-in-public の素材として残す）

---

## 5. 残り visual asset plan

### 5.1 優先 3 件（生成する）

3 件すべて [docs/66 §7 Japanese Editorial Diagram Prompt Block v1](66-japanese-visual-generation-quality-upgrade.md#7-japanese-editorial-diagram-prompt-block-v1) を骨格に、各 asset の brief を入れる。

#### A. `threads-support-diagram-v1` v004（Japanese-first）

| 項目 | 値 |
| --- | --- |
| visualAssetPlan._id | `visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1` |
| platform | threads |
| aspectRatio | 4:5 portrait |
| pixelSize | 1080 × 1350 |
| recommended layout | **Problem-to-system** or **Editorial explainer**（Threads main 縦長、上部に主張、下部に小さな構造図） |
| Japanese-first labels | 発信のタネ / 仕組み / 自動化は最後 / 「発信を頑張るより、仕組みを作る。」 / 媒体名（X / note / Substack / Threads） |
| English support tags | brand mark のみ |
| 出力 path | `assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/v004.png` |
| final expected path | `assets/visuals/building-hitori-media-os/threads/support/threads-support-diagram-v1.png` |
| dashboard candidate page | `/visual-assets/visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1/candidates` |
| Visual Register approval | `http://localhost:3334/?slug=building-hitori-media-os&asset=threads-support-diagram-v1` |
| 既存 candidate 上書き禁止 | v001 / v002 / v003 を保存（履歴） |

#### B. `note-inline-human-judgment-v1` v001（Japanese-first）

| 項目 | 値 |
| --- | --- |
| visualAssetPlan._id | `visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1` |
| platform | note |
| aspectRatio | 16:9 |
| pixelSize | 1600 × 900 |
| placement | note 記事 Chapter 3〜4 付近、AI/人間判断の話題 |
| recommended layout | **Human review journey** or **Before/After**（AI ↔ 人間 の対比 / 人間 gate の図示） |
| Japanese-first labels | AI下書き / 人間が整える / 図解を選ぶ / 最後は手動公開 / 「人間が選ぶ」 / 自動化は最後 |
| Japanese reader outcome | 「AI に任せきりにせず、人間判断を残す。」 など |
| English support tags | brand mark のみ |
| 出力 path | `assets/inbox/generated/building-hitori-media-os/note-inline-human-judgment-v1/v001.png` |
| final expected path | `assets/visuals/building-hitori-media-os/note/inline/note-inline-human-judgment-v1.png` |
| dashboard candidate page | `/visual-assets/visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1/candidates` |
| Visual Register approval | `http://localhost:3334/?slug=building-hitori-media-os&asset=note-inline-human-judgment-v1` |
| 既存 candidate | なし、本フェーズ初回 |
| prompt.md / review.md | **まだ存在しない** → 生成前にまず frontmatter scaffold mini-batch、または初回生成で作成 |

#### C. `substack-inline-reader-system-v1` v001（Japanese-first）

| 項目 | 値 |
| --- | --- |
| visualAssetPlan._id | `visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1` |
| platform | substack |
| aspectRatio | 16:9 |
| pixelSize | 1600 × 900 |
| placement | Substack post 内 "Reader-List Connection" section |
| recommended layout | **Reader-list funnel** or **Media distribution map**（discovery → Substack → archive の 3 段役割分担） |
| Japanese-first labels | 発見の場 / 購読のリスト / 蓄積のアーカイブ / X・Threads / Substack / note / 「読者を捕まえる導線」 |
| Japanese reader outcome | 「発信先を役割で分けると、購読が積み上がる。」 など |
| English support tags | brand mark のみ |
| 出力 path | `assets/inbox/generated/building-hitori-media-os/substack-inline-reader-system-v1/v001.png` |
| final expected path | `assets/visuals/building-hitori-media-os/substack/inline/substack-inline-reader-system-v1.png` |
| dashboard candidate page | `/visual-assets/visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1/candidates` |
| Visual Register approval | `http://localhost:3334/?slug=building-hitori-media-os&asset=substack-inline-reader-system-v1` |
| 既存 candidate | なし、本フェーズ初回 |

### 5.2 すでに採用済（生成不要）

| Asset | 現状 | 次の action |
| --- | --- | --- |
| `note-hero-v1` | filesystem 有、patch 有、**Sanity 未反映** | §7 で Sanity 反映のみ |
| `substack-header-v1` | shared master `campaign-hero-v1.png` を共有、**patch 未生成 / Sanity 未反映** | Visual Register で master sharing として approve → patch 生成 → Sanity 反映 |
| `x-hook-main-v1` | filesystem 有、patch 有、**Sanity 未反映** | §7 で Sanity 反映のみ |
| `note-inline-content-os-flow-v1` | **v004 が採用候補**（japanese-editorial-v1, 35/35 self-rubric） | Visual Register `approve & register` → patch 生成 → Sanity 反映 |

### 5.3 本フェーズで **保留** する 2 件

| Asset | 理由 | 次の対応 |
| --- | --- | --- |
| `note-inline-manual-vs-automation-v1` | Chapter 4 末尾の補助図、note 記事の主要訴求ではない | 本フェーズでは visualAssetPlan.status を `skipped` に手動更新（Sanity Studio）、もしくは「未生成のまま defer」を campaignPlan.requiredVisualAssets で許容 |
| `note-inline-publish-package-folder-v1` | Chapter 5 末尾の補助図、folder 構造はテキストで説明可能 | 同上 |

→ 本フェーズの note 記事公開時はこの 2 inline を **欠落させて発行**。記事末尾に「補助図は今後追加」と書く運用で OK。後の Visual Engine Improvement Phase で補完。

### 5.4 全 9 record の **本フェーズ後ターゲット状態** table

| _id | 期待 status | 期待 localAssetPath | patch | 公開可？ |
| --- | --- | --- | --- | --- |
| note-hero-v1 | `saved` | `assets/visuals/.../shared/campaign-hero-v1.png` | ✓（既存） | **yes** |
| substack-header-v1 | `saved` | `assets/visuals/.../shared/campaign-hero-v1.png`（共有） | **要生成** | **yes**（generation 不要、patch のみ） |
| x-hook-main-v1 | `saved` | `assets/visuals/.../x/hook/x-hook-main-v1.png` | ✓（既存） | **yes** |
| threads-support-diagram-v1 | `saved` | `assets/visuals/.../threads/support/threads-support-diagram-v1.png` | **要生成** | **yes** |
| note-inline-content-os-flow-v1 | `saved` | `assets/visuals/.../note/inline/note-inline-content-os-flow-v1.png` | **要生成** | **yes** |
| note-inline-human-judgment-v1 | `saved` | `assets/visuals/.../note/inline/note-inline-human-judgment-v1.png` | **要生成** | **yes** |
| note-inline-manual-vs-automation-v1 | `skipped` or `planned` | （無し） | （無し） | **no, 保留** |
| note-inline-publish-package-folder-v1 | `skipped` or `planned` | （無し） | （無し） | **no, 保留** |
| substack-inline-reader-system-v1 | `saved` | `assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png` | **要生成** | **yes** |

→ **7 record saved + 2 record skipped/planned = pipeline working state**。

---

## 6. 次の生成シーケンス（A → B → C）

各シーケンスは **1 candidate / 1 batch / 5 min cap / dashboard 確認** で進む:

```
[A] threads-support-diagram-v1 v004 only
       ↓
   human review in dashboard /visual-assets/<id>/candidates
       ↓
   adopt OR ask for v005 (※ループ 5 件まで)
       ↓
[B] note-inline-human-judgment-v1 v001 only
       ↓
   human review
       ↓
   adopt OR ask for v002
       ↓
[C] substack-inline-reader-system-v1 v001 only
       ↓
   human review
       ↓
   adopt OR ask for v002
       ↓
[D] approve / register / Sanity reflect 一括（§7 chain）
       ↓
[E] publish-package dry-run + actual（§8 chain）
       ↓
[F] release review 4 platform 更新（§9 chain）
       ↓
   ready-to-publish 状態
```

### 6.1 各 candidate 生成の共通 hard rules（再掲）

- 1 candidate のみ
- 5 分上限
- 既存 PNG 上書き禁止
- `assets/visuals/` 書き込み禁止
- `patches/` 書き込み禁止
- Sanity write 禁止
- deploy / auto-post / paid API 禁止
- 失敗 → fake placeholder image 作らず停止して報告
- 生成後 dashboard candidate API + page で見える事を確認
- 生成後 `git diff --stat` で `assets/inbox/...` 以外が変化していないことを確認

### 6.2 各 candidate の Visual Rough 必須

[docs/66 §5.1](66-japanese-visual-generation-quality-upgrade.md#5-pre-generation-visual-rough-step) の 11-field rough を 1 度書き、7-point self-check を pass してから image_gen を発射。fail なら rough をやり直し。

### 6.3 prompt.md / review.md scaffold（B / C は新規）

B `note-inline-human-judgment-v1` と C `substack-inline-reader-system-v1` には prompt.md / review.md が **まだ存在しない**。生成 batch の前に scaffold を作るか、生成と同時に作るか:

- **推奨**: B / C それぞれ初回 generation batch の中で、Codex に prompt.md / review.md を frontmatter 付きで先に書かせる（[docs/65](65-inbox-candidate-frontmatter-contract.md) contract に従う）→ そのまま image_gen → dashboard 反映

---

## 7. Approve / Register シーケンス

全 candidate が揃った後、**Visual Register** で 1 件ずつ approve。各 step は Visual Register UI でクリック、本 doc は **チェックリスト**:

### 7.1 共通フロー（per asset）

```
1. localhost:3334 で Visual Register 起動: `npm run visual:register`
2. Inbox Review カードで campaign=building-hitori-media-os に絞る
3. 該当 asset の採用候補 candidate を click
4. レビューノート記入（Codex self-review score + 採用理由）
5. "approve & register" 押下
   → assets/visuals/<expected path> に PNG コピー
   → patches/visual-assets/<slug>/<asset>.json 生成
   → review-manifest.json 更新
6. dashboard `/visual-assets/<id>` で final asset thumb 表示確認
```

### 7.2 各 asset の checklist

| Asset | 採用候補 | 期待 patch path | 期待 final path |
| --- | --- | --- | --- |
| **note-inline-content-os-flow-v1** | v004 (japanese-editorial-v1) | `patches/visual-assets/building-hitori-media-os/note-inline-content-os-flow-v1.json` | `assets/visuals/.../note/inline/note-inline-content-os-flow-v1.png` |
| **threads-support-diagram-v1** | v004 (japanese-editorial-v1) ※生成後判定 | `patches/visual-assets/.../threads-support-diagram-v1.json` | `assets/visuals/.../threads/support/threads-support-diagram-v1.png` |
| **note-inline-human-judgment-v1** | v001 ※生成後判定 | `patches/visual-assets/.../note-inline-human-judgment-v1.json` | `assets/visuals/.../note/inline/note-inline-human-judgment-v1.png` |
| **substack-inline-reader-system-v1** | v001 ※生成後判定 | `patches/visual-assets/.../substack-inline-reader-system-v1.json` | `assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png` |
| **substack-header-v1**（master sharing） | shared `campaign-hero-v1.png` | `patches/visual-assets/.../substack-header-v1.json` | `assets/visuals/.../shared/campaign-hero-v1.png`（共有、新規コピーなし） |

### 7.3 各 step の検証

| 検証項目 | 通る条件 |
| --- | --- |
| final PNG 存在 | `ls -l <final path>` で見える、byte size > 0 |
| patch JSON 妥当 | `cat <patch> | jq .set.localAssetPath` で path が一致 |
| review-manifest 更新 | `assets/inbox/generated/<slug>/review-manifest.json` の該当 candidate に `reviewStatus: registered` |
| dashboard `/visual-assets/<id>` で saved 表示 | "current final path" が表示される |
| `/api/asset-thumb?path=<final path>` が 200 image/png | localhost で確認 |

---

## 8. Sanity reflection checklist

**本 doc では Sanity を書かない**。boss が Sanity Studio で手動更新するための exact field list を提供:

### 8.1 各 visualAssetPlan で更新する fields

```yaml
# Sanity Studio → Content → Visual Asset Plan → <_id> を開いて以下を編集
localAssetPath: <final path 文字列>  # 例: assets/visuals/building-hitori-media-os/threads/support/threads-support-diagram-v1.png
status: saved
reviewNotes: |
  <human review note text>
  <例: "Codex self-review 24/35。Japanese-first OK。note inline に貼れる品質。
  Visual Engine Improvement Phase で再生成候補。">
updatedAt: <ISO 8601 timestamp at the moment of Sanity update>
```

### 8.2 更新対象 5 records

1. `visualAssetPlan.building-hitori-media-os.note-hero-v1` → status: `saved`、localAssetPath: shared/campaign-hero-v1.png
2. `visualAssetPlan.building-hitori-media-os.substack-header-v1` → status: `saved`、localAssetPath: shared/campaign-hero-v1.png（master sharing）
3. `visualAssetPlan.building-hitori-media-os.x-hook-main-v1` → status: `saved`、localAssetPath: x/hook/x-hook-main-v1.png
4. `visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1` → status: `saved`、localAssetPath: threads/support/threads-support-diagram-v1.png（v004 採用後）
5. `visualAssetPlan.building-hitori-media-os.note-inline-content-os-flow-v1` → status: `saved`、localAssetPath: note/inline/note-inline-content-os-flow-v1.png（v004 採用後）
6. `visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1` → status: `saved`、localAssetPath: note/inline/note-inline-human-judgment-v1.png（v001 採用後）
7. `visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1` → status: `saved`、localAssetPath: substack/inline/substack-inline-reader-system-v1.png（v001 採用後）

### 8.3 保留 2 records

8. `visualAssetPlan.building-hitori-media-os.note-inline-manual-vs-automation-v1` → status: `skipped`、reviewNotes: "本フェーズでは保留、Visual Engine Improvement Phase で再評価"
9. `visualAssetPlan.building-hitori-media-os.note-inline-publish-package-folder-v1` → status: `skipped`、reviewNotes: 同上

### 8.4 update 後の確認

- Sanity Studio で全 9 record を listing 表示し、status / localAssetPath が反映されているか目視
- dashboard `/visual-assets` listing が `Done` バケット 7 件 + `Skipped` 2 件で表示される

---

## 9. Publish-package checklist

### 9.1 dry-run

```bash
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os
npm run publish:package -- building-hitori-media-os --dry-run
```

期待 output:

- 「次の copy が行われる」リスト表示
- 5 asset の image copy 計画（note-hero / substack-header / x-hook-main / threads-support / note-inline-content-os-flow-v1 / note-inline-human-judgment-v1 / substack-inline-reader-system-v1 = 7 件 saved、`status: skipped` の 2 件は除外）
- text draft markdown の copy 計画

### 9.2 actual

```bash
npm run publish:package -- building-hitori-media-os
```

期待 output:

- `publish-packages/note/building-hitori-media-os/images/` に hero + 2 inline（content-os-flow-v1 + human-judgment-v1）
- `publish-packages/substack/building-hitori-media-os/images/` に header (shared) + 1 inline (reader-system-v1)
- `publish-packages/x/building-hitori-media-os/images/` に x-hook-main-v1
- `publish-packages/threads/building-hitori-media-os/images/` に threads-support-diagram-v1
- 各 platform に text draft markdown が copy された
- exit code 0、エラーなし

### 9.3 verify per platform

| Platform | 期待 image | 期待 text |
| --- | --- | --- |
| note | hero + 2 inline | article body markdown |
| substack | header (shared) + 1 inline | essay markdown |
| x | hook image | main tweet + thread markdown |
| threads | support diagram | main + replies markdown |

不足があれば Sanity の `status` / `localAssetPath` 反映ミスを疑う、再 publish-package 実行。

---

## 10. Release review checklist 更新

publish-package 完了後、release-review markdown を更新:

### 10.1 更新対象 5 files

| File | 更新内容 |
| --- | --- |
| `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md` | 全 visualAssetPlan 採用済を反映、publish-package 配布済を check、最終公開 readiness を check |
| `x-final-review.md` | x-hook-main-v1 採用済、hook copy 最終確認、X main + thread post 最終確認 |
| `threads-final-review.md` | threads-support-diagram-v1 採用済（v004 採用 + reason）、Threads main + replies 最終確認 |
| `note-final-review.md` | note-hero + 2 inline 採用済（manual-vs-automation / publish-package-folder は保留と明記）、本文最終確認 |
| `substack-final-review.md` | substack-header（master sharing） + 1 inline 採用済、essay 最終確認 |

### 10.2 各 file への記録項目（チェックボックス形式）

```markdown
## Visual assets

- [x] hero / header / inline X 個 すべて採用済
- [x] localAssetPath が assets/visuals/.../*.png を指す
- [x] publish-packages/<platform>/building-hitori-media-os/images/ にコピー済
- [x] Codex self-review score ≥ 24/35

## Text draft

- [x] outputs/<platform>/...md が確定
- [x] redact 必要なし（secret / 実 project ID / private path なし）
- [x] reader 視点で読み返した

## Manual publish readiness

- [x] 公開先 (X / note / Substack / Threads) アカウントが open
- [x] 公開日時の予定（boss memo）
- [x] post-publication-log-template.md を埋める準備済
```

### 10.3 final-human-checklist の最終 OK

`final-human-checklist.md` に boss が **手書き署名 + 公開予定日** を残す、その時点で 1 campaign の "working pipeline complete"。

---

## 11. Out of scope（本フェーズで **やらない**）

| 項目 | 理由 / 次の phase |
| --- | --- |
| visual の再生成（v004 → v005）の無限ループ | 採用済 visual の上書きはこのフェーズでは禁止、Visual Engine Improvement Phase で再評価 |
| 保留 2 件（note-inline-manual-vs-automation, note-inline-publish-package-folder）の生成 | 補助図、欠落でも公開可。次 phase |
| Design Profile / Layout Pattern Preset / Visual Candidate schema 化 | Phase 2C / 2D / Visual Engine Improvement Phase |
| dashboard write 解禁（approve & register を dashboard から） | Phase 2B（[docs/62](62-admin-phase-2-visual-generation-admin-design.md)） |
| Auth migration（Basic Auth → real Auth） | Phase 2C 着手前、別 doc |
| Sanity write を dashboard から | Phase 2C |
| 半自動 publish / auto-post | 永続 deferred |
| paid LLM / image API integration | 永続 deferred |
| AI auto-approval / AI auto-review | 永続 deferred |
| multi-tenant / SaaS | Phase 2D |
| billing / paid tier | 永続 deferred |
| public site `hitorimedia.com` 構築 | 別 doc / 別 phase |

---

## 12. 完了基準（本 working pipeline batch）

下記すべて `true` で **working pipeline 1 周 complete**:

- [ ] threads-support-diagram-v1 v004 生成済、dashboard で 4 candidates 表示
- [ ] note-inline-human-judgment-v1 v001 生成済、dashboard で 1 candidate 表示
- [ ] substack-inline-reader-system-v1 v001 生成済、dashboard で 1 candidate 表示
- [ ] 各 candidate の Visual Register approve & register 完了（5 件 + 共有 1 件 = 6 件 patch 生成）
- [ ] Sanity Studio で 7 record `status: saved` + 2 record `status: skipped` 反映済
- [ ] `npm run publish:package -- building-hitori-media-os --dry-run` 成功
- [ ] `npm run publish:package -- building-hitori-media-os` 成功
- [ ] publish-packages/<platform>/building-hitori-media-os/ に X / note / Substack / Threads 4 platform 分の image + text 揃う
- [ ] release-review 5 markdown 更新済
- [ ] final-human-checklist.md に boss 署名 + 公開予定日

→ 達成時に「**初の Hitori Media OS campaign が ready-to-publish**」を `docs/devlog/` に記録、Visual Engine Improvement Phase の trigger を別 batch で議論。

---

## 13. Next exact prompt

次に生成する candidate は **threads-support-diagram-v1 v004** から。日本語第一・1 candidate のみ・5 分上限・既存 v001-v003 上書き禁止。

`docs/handoff/0126` §15（exact next prompt）を参照。

---

## 14. 連番について

- docs: 66 → **67**（Auth migration design は docs/68 候補へ繰り下げ）
- devlog: 0114 → **0115**
- handoff: 0125 → **0126**

---

## 15. Safety（本 batch）

- 画像生成: **0**
- schema 変更 / activate / proposed sketch: **0**
- code 変更（dashboard / tools / sanity.config / proxy.ts）: **0**
- assets/visuals / patches 変更: **0**
- Sanity mutation: **0**
- Codex CLI 起動 / paid LLM/image API SDK 追加: **0**
- 新規 npm package: **0**
- production env vars / Vercel UI / deploy: **0**
- 候補 PNG 編集 / 削除 / 上書き: **0**（既存 7 candidates すべて byte-identical）
- prompt.md / review.md 編集: **0**（本 batch では非編集）
- review-manifest.json 編集: **0**

→ validation 結果は handoff §11 に記録。
