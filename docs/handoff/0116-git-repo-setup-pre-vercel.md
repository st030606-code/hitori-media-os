# Handoff: Git repo setup investigation before Vercel deploy (no commits made)

Date: 2026-05-16
Status: **investigation-only / no-git-init / no-commit / no-push / no-deploy / human-decision-pending**

## 1. Task Goal

Vercel deploy（[docs/61](../61-admin-phase-1-batch-d2-vercel-setup.md)）に進む前に、人間が `dashboard/` から git コマンドを叩いた際に `00_POTA_AI/` 等の無関係な兄弟ディレクトリが untracked として列挙された問題を **読み取り専用で原因特定**し、安全な setup 経路を確定する。Claude Code は git の状態を一切変更しない。

## 2. Constraints Followed

- `git init` 実行 0
- `git add` 実行 0
- `git commit` 実行 0
- `git push` 実行 0
- 既存 `.git/`（outer / inner どちらも）を変更していない
- `.gitignore` を変更していない
- `.env.local` / `.env.example` の中身を読まない
- `private/` の中身を読まない（ファイル数だけ確認）
- secret 値を出力していない
- Vercel project / DNS / Sanity dataset / Auth secrets に触れていない
- schemas / tools / dashboard コード / assets / patches / publish-packages: 不変

## 3. Changed Files

### Added

- `docs/devlog/0105-git-repo-setup-pre-vercel.md`
- `docs/handoff/0116-git-repo-setup-pre-vercel.md`

### Modified

- `docs/handoff/latest.md`（本 0116 にミラー）

### Confirmed unchanged

- `/Users/sugawaratakuya/Documents/POTA_Empire/10_Development/.git/`（dead outer repo、触っていない）
- sanity-ai-content-os 配下すべて（schemas / tools / dashboard / docs を本 doc 以外、assets / patches / seed / publish-packages / private / inputs / examples / launchers / prompts / tasks）
- `.gitignore`（sanity-ai-content-os）/ `dashboard/.gitignore`: 不変
- `.env.local` / `.env.example` / `dashboard/.env.local`: 中身を読まない、変更しない
- Vercel project（未作成のまま）/ DNS / Auth secrets: 不変

## 4. Summary of Findings

### A. 現在の git root（重要）

| 質問 | 回答 |
| --- | --- |
| `git rev-parse --show-toplevel` from `sanity-ai-content-os/dashboard/` | **`/Users/sugawaratakuya/Documents/POTA_Empire/10_Development`** |
| sanity-ai-content-os 自身に `.git/` はあるか | **NO**（独立 repo ではない） |
| outer repo の commit history | **0 commits**（`fatal: ... does not have any commits yet`） |
| outer repo の remote | **未設定** |
| outer repo の index | **0 entries**（何もステージされていない） |
| outer repo の config | `user.name=st030606-code` / `user.email=st030606@gmail.com` のみ |

→ **outer `.git/` は dead init**。harm はゼロ、commit / push 履歴ゼロ、削除しても data 損失なし。

### B. 兄弟プロジェクトのリスク

`10_Development/` 直下に 9 兄弟ディレクトリ（00_POTA_AI / 01_POTA_Core_Theme / ... / pota-factory-core / potablen）。`pota-factory-core` と `potablen` は自前の `.git/` を持つ独立 repo。残りの 7 件は raw directory。

`10_Development/` に `.gitignore` 不在 → outer から見ると全部 untracked。

**現状で漏れているものは何もない**（commit ゼロ、push ゼロ）。ただし「outer git で `git add .` を実行」していたら 7 兄弟が混入していた。**未然防止**で発見。

### C. sanity-ai-content-os の `.gitignore` 健全性

```
node_modules/
dist/
.sanity/
*.log
.DS_Store
.env
.env.local
private/
```

- `.env.local` ✓（literal match）
- `.env` ✓
- `.env.example` **未 cover**（template として commit する場合は別途確認、しない場合は `.gitignore` に追加）
- `private/` ✓
- `node_modules/` ✓
- `dist/` ✓
- `.sanity/` ✓
- `.claude/` **未 cover**（Claude Code local settings、commit すべきでない可能性）
- `.vercel/` **未 cover**（Vercel CLI metadata、deploy 後に発生し得る）

### D. dashboard/.gitignore 健全性

scaffold default + Vercel template、`.env*` glob で `.env.local` / `.env.example` / `.env.production` を一括 cover ✓。`/node_modules`、`.next/`、`.vercel`、`*.pem`、`*.tsbuildinfo`、`next-env.d.ts`、`.DS_Store` も cover 済。

### E. 「git add dashboard/... が失敗した」の真相

**failure ではなく scope mismatch**。`dashboard/` から git を叩くと、git は `10_Development/` を repo root として認識し、`git status` で兄弟ディレクトリを untracked として列挙したのが、人間の「sanity-ai-content-os だけを扱いたい」意図と乖離した結果。

## 5. Recommended Setup

### Option A（推奨、minimal）— sanity-ai-content-os を independent repo に

- outer `.git/` には触らない
- `sanity-ai-content-os/` で `git init` → inner `.git/` 作成
- 以降この directory 内で git 操作すると inner が優先される
- outer から見ると sanity-ai-content-os は「embedded git repository」になるが、outer に commit しない限り無害

### Option B（cleanup 込み）— outer `.git/` を削除してから Option A

- outer は 0 commits / 0 remote なので削除しても data 損失ゼロ
- `rm -rf /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/.git`
- その後 Option A の手順

**選択基準**: outer git を将来使う可能性が **ある** なら A、混乱を避けたいなら B。

## 6. Safe Commands（人間が実行する）

詳細は [docs/devlog/0105 §"安全 commands"](../devlog/0105-git-repo-setup-pre-vercel.md) を参照。要点:

```bash
# 1. ディレクトリ確認
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os
pwd

# 2. (推奨) .gitignore に .claude/ と .vercel/ を追加
cat >> .gitignore <<'EOF'

# Claude Code per-project local settings
.claude/

# Vercel CLI metadata
.vercel/
EOF

# 3. git init
git init
git rev-parse --show-toplevel   # → sanity-ai-content-os であることを確認

# 4. ignore 検証
git check-ignore -v .env.local private node_modules dist .claude
# それぞれ「.gitignore:N: pattern」が出れば ignored

# 5. explicit add（git add . は使わない）
git add .gitignore README.md AGENTS.md CLAUDE.md
git add package.json package-lock.json tsconfig.json
git add sanity.config.ts sanity.cli.ts
git add schemas/ structure/ tools/
git add docs/ seed/ outputs/ publish-packages/
git add assets/ patches/ prompts/ launchers/
git add dashboard/
git add inputs/ examples/ tasks/      # 中身を確認して必要なら

# (任意) .env.example を template として残すなら、中身を確認してから:
# head -50 .env.example
# git add .env.example

# 6. ステージ確認
git ls-files | grep -E "(\.env\.local|^private/|node_modules)" || echo "(no leak — safe)"
git ls-files | wc -l

# 7. 初回 commit
git commit -m "Initial Hitori Media OS local-first MVP and admin dashboard"

# 8. リモートは GitHub repo 作成後
# git branch -M main
# git remote add origin git@github.com:<user>/<repo>.git
# git push -u origin main
```

## 7. Human Review Questions

- Option A（outer .git を残す）か Option B（outer .git を削除する）か
- `.env.example` の中身を確認した上で commit するか / `.gitignore` に追加するか
- `.claude/settings.local.json` を commit するか / gitignore するか（推奨: gitignore）
- GitHub repo 名は何にするか（候補: `hitori-media-os` / `sanity-ai-content-os` / `hitori-media-os-dashboard`）
- repo visibility は public / private どちらにするか（dashboard には campaign 下書きが見えるため、**private 推奨**）
- 初回 commit 後の Vercel project Root Directory は `dashboard/` の予定で良いか（[docs/61 §B](../61-admin-phase-1-batch-d2-vercel-setup.md) と整合）

## 8. Risks or Uncertainties

- **outer `.git/` を残した状態で sanity-ai-content-os 外から git 操作すると**、outer に対する `git status` 等が依然「dead repo」を返す。混乱の温床。長期的には outer を削除した方が clean。
- **nested git repo は GitHub UI / IDE plugin の一部で警告が出る**: 「embedded repository, not a submodule」など。実害なし。
- **`.env.example` の中身を本 batch で確認していない**: human が `head -50 .env.example` で確認後に決定。実値が混入している可能性は低いが、ゼロではない。
- **`.gitignore` 提案を本 batch で反映していない**: human が `cat >> .gitignore` するか判断後に commit。
- **`dashboard/public/activity-snapshot.json` は commit 対象**（Batch D2 決定）。`dashboard/.gitignore` で除外されていないので `git add dashboard/` で正常に取り込まれる。
- **`pota-factory-core/` / `potablen/` は自前 .git を持つ**: outer から `git add .` しても embedded repo として扱われ、内容そのものは混入しない。ただし `git add .` 自体を **そもそも使わない**ことが大原則。

## 9. Recommended Next Step

### Immediate Human Actions（順序厳守、上から踏む）

1. [docs/devlog/0105](../devlog/0105-git-repo-setup-pre-vercel.md) を読む（特に §"観察された事実" と §"安全 commands"）
2. Option A or B を選ぶ
3. （Option B を選んだ場合のみ）`rm -rf /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/.git` を実行
4. `cd sanity-ai-content-os && git init`
5. `.gitignore` 追加が必要か判断、必要なら `cat >> .gitignore <<'EOF' ... EOF` で追記
6. `git check-ignore -v` で `.env.local` / `private/` が ignored になっていることを確認
7. explicit `git add <path>` を 1 つずつ実行
8. `git ls-files | grep -E "(\.env\.local|^private/|node_modules)"` で漏れチェック
9. 初回 commit
10. GitHub 上で repo 作成（**private 推奨**）
11. `git remote add origin ...` + `git push -u origin main`
12. ここまで完了したら [docs/61 §A〜I](../61-admin-phase-1-batch-d2-vercel-setup.md) に従って Vercel project 設定

### Claude Code が次にやれること

人間が initial commit / push まで完了したら、次バッチで:

- Vercel project 設定支援（UI 操作の人間ガイドはすでに docs/61 にあり）
- 初回 deploy 後の post-deploy verification（Batch D3）

### Mid-term

- Phase Admin 2 着手前の Auth scheme design
- 残り 5 visual 生成サイクル
- public site `hitorimedia.com` 着手判断

### Deferred（永続）

- paid LLM / image API integration
- auto-posting / automated publish
- AI auto-review of drafts
- multi-user / collaboration
- billing / paid tier
- analytics fetch / charts

## 10. Is it safe to proceed to GitHub/Vercel?

**現状はまだ NOT safe**:

- sanity-ai-content-os が独立 repo になっていない
- outer git root の scope が不適切
- 初回 commit が無い

**safe にするには**: §6 の手順を人間が踏んで初回 commit を作る。その状態で初めて Vercel project に connect 可能。

`.gitignore` の健全性は既に高い（`.env.local` / `private/` / `node_modules/` / `dist/` cover 済み）ので、`git add` を explicit にやれば secret 漏れリスクは小さい。最大のリスクは「outer git root のまま `git add .` を実行する」ことなので、§6 の order を守れば回避できる。

## 11. Exact Prompt to Give Codex Next（人間が initial commit/push 完了後）

```text
Verify the sanity-ai-content-os Git repo is ready for Vercel deploy.

Hard Rules:
- Do NOT deploy to Vercel.
- Do NOT push to additional remotes.
- Do NOT modify schemas, tools, assets, patches, or Sanity data.
- Do NOT print secret env values.
- Do NOT touch .env files.

Use:
- docs/devlog/0105-git-repo-setup-pre-vercel.md
- docs/handoff/0116-git-repo-setup-pre-vercel.md
- docs/61-admin-phase-1-batch-d2-vercel-setup.md

Tasks:
1. From sanity-ai-content-os/, verify:
   - git rev-parse --show-toplevel == sanity-ai-content-os
   - git remote -v includes the GitHub repo
   - git log --oneline shows the initial commit
   - git ls-files does NOT include .env*, private/, node_modules, dist
2. Confirm `dashboard/public/activity-snapshot.json` is tracked.
3. Confirm `dashboard/.env.local` is NOT tracked.
4. Confirm `.claude/` is NOT tracked (if user chose to gitignore it).
5. Run `cd dashboard && npm run build:activity-snapshot` and verify it can be re-run safely.
6. Report whether the repo is in a state suitable for Vercel project creation
   per docs/61 §B (Root Directory: dashboard/).
7. Do NOT actually create the Vercel project; that remains the human's step.
8. Write docs/devlog/0106-* and docs/handoff/0117-* with verification results.
```
