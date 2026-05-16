# Devlog 0105 — Git repo setup investigation before Vercel deploy (no commits made)

Date: 2026-05-16
Status: **investigation only / no git init / no commit / no push / no deploy**

## 今日の判断

[docs/61 §A](../61-admin-phase-1-batch-d2-vercel-setup.md) の deploy 手順を踏もうとして、人間が `dashboard/` から git コマンドを叩いたら、`git status` が `00_POTA_AI/` `01_POTA_Core_Theme/` 等の **無関係な兄弟ディレクトリ**を untracked として列挙してきた。これは「git の root が高すぎる」サイン。読み取り専用で原因を特定し、安全な経路を確定するためのバッチ。**`git init` も `git add` も `git commit` も `git push` も実行していない**。

## なぜその設計にしたか

- **deploy 前に git の事実関係を全部見る**: 後で `git add .` などやってからでは取り消し cost が高い。今は読み取り専用で潰しきる。
- **outer `.git/` を勝手に削除しない**: 「dead repo」と判断はできるが、人間が意図して残しているかもしれない。削除提案は出すが実行しない。
- **`.env.local` の中身を覗かない**: ハードルールに従って secret 値は確認しない。`.gitignore` ルールがそれを cover しているかだけ確認。
- **docs を書くが commit しない**: 投入は人間判断後の別バッチ。

## 観察された事実

### A. 現在の git root と状態

- **outer `.git/` は `/Users/sugawaratakuya/Documents/POTA_Empire/10_Development/`**（sanity-ai-content-os の **2 階層上**）
- HEAD: `ref: refs/heads/main`
- `refs/heads/` 配下: 空（**commit 一度もなし**）
- `refs/remotes/` ディレクトリ: 存在しない（**remote 未設定**）
- `git ls-files`: **0 entries**（index に何もステージされていない）
- `git remote -v`: 出力ゼロ
- `git log`: `fatal: your current branch 'main' does not have any commits yet`
- `.git/objects/` に 260 entries あり: 過去の `git add` 試行で生成された dangling blob、commit されていないので harmless
- `.git/config`: `user.email=st030606@gmail.com` / `user.name=st030606-code` のみ
- **→ 事実上「dead git init」**。harm はゼロ、削除しても commit history が失われない

### B. 兄弟ディレクトリの状態

`10_Development/` 直下:

```
00_POTA_AI/                       ← outer git の untracked として見える
01_POTA_Core_Theme/               ← 同上
02_POTA_Card_Pro/                 ← 同上
03_POTA_Manager/                  ← 同上
05_Video_Automation/              ← 同上
06_POTA_Sanity_DB/                ← 同上
07_POTA_Chrome_Extension/         ← 同上
pota-factory-core/                ← 中に独自の .git/ (別 repo)
potablen/                         ← 中に独自の .git/ (別 repo)
sanity-ai-content-os/             ← 中に .git/ なし
```

- `10_Development/` レベルに `.gitignore` **無し**
- → outer から見ると、すべての兄弟が untracked
- もし outer で `git add .` / `git add -A` を実行すれば、**全 POTA プロジェクトが outer repo に混入**するリスク

### C. sanity-ai-content-os の git 状態

- `.git/` ディレクトリ **不在**（独立 repo になっていない）
- `.gitignore` あり、内容:
  ```
  node_modules/
  dist/
  .sanity/
  *.log
  .DS_Store

  .env
  .env.local

  # Private paid/reference materials. Do not commit.
  private/
  ```
- `.env.local` 存在（gitignore でカバー済 ✓）
- `.env.example` 存在（gitignore でカバー **されない**、別途判断）
- `private/` 存在（gitignore でカバー済 ✓、4 ファイル / 2 ディレクトリ）
- `node_modules/` 存在（gitignore でカバー済 ✓）
- `dist/` 存在（gitignore でカバー済 ✓）
- `.sanity/` 存在（gitignore でカバー済 ✓）
- `.claude/` 存在（gitignore で **未カバー**、`settings.local.json` ＋ `worktrees/`）

### D. dashboard の git 状態

- `dashboard/.gitignore` あり、scaffold default:
  - `/node_modules`
  - `.env*` ← 強い、`.env.local` `.env.example` 等すべて cover
  - `.next/` / `out/` / `build`
  - `.DS_Store` / `*.pem`
  - `.vercel`
  - `*.tsbuildinfo` / `next-env.d.ts`
  - npm-debug.log* / yarn-debug.log* / `.pnpm-debug.log*`
- `dashboard/.env.local` 存在（dashboard/.gitignore の `.env*` で cover ✓）
- `dashboard/public/activity-snapshot.json` 存在（25,863 B、gitignore に **無し → 追跡される ✓**、Batch D2 の意図通り）

### E. 「git add dashboard/... が失敗した」の真相

- 失敗ではなく **scope の混乱**: `dashboard/` から git を叩くと、git は parent を遡って `10_Development/.git/` を見つける → そこを repo root と認識
- `git status` が `../../00_POTA_AI/` を列挙したのは git 的には**正しい挙動**（outer repo の untracked tree の表現）
- 人間が「sanity-ai-content-os を deploy する」と意図したのに対し、outer git root はその scope を反映していない

### F. 何が production に漏れる可能性があったか（**漏れていない**）

もし誤って outer から `git add -A && git commit && git push <repo>` を実行していたら、**全 POTA プロジェクトの内容**（`private/` を含む可能性のある）が GitHub に push されていた。

- 現状: 0 commits / 0 remote / 0 push
- harm: **発生していない**
- 兆候: outer .git の `objects/` に 260 個の dangling blob があるが、commit されていないので push しても何も飛ばない

## 推奨する safe setup

**Option A（推奨、minimal change）**: `sanity-ai-content-os/` を独立 repo にする（nested git）

- outer `.git/` には触らない（消さない / 残す）
- `sanity-ai-content-os/` で `git init` → 新しい `.git/` が作られる
- 以降、`sanity-ai-content-os/` 内で git を叩くと **inner .git/ が優先**される
- outer git は `sanity-ai-content-os/` を「embedded git repository」として認識し、内容を recursively は見ない
- 副作用: outer から見ると `sanity-ai-content-os/` が gitlink 風に扱われる可能性。**outer に commit されない限り無害**

**Option B（cleaner、削除を伴う）**: outer `.git/` を消してから Option A

- outer に commit がないので **データ損失ゼロ**
- `rm -rf /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/.git`
- その後 Option A と同じ

**選択基準**: 人間が outer git を将来使いたい可能性があるなら A、混乱を避けたいなら B。**Claude Code はどちらも実行しない**（人間判断）。

## 提案する `.gitignore` 追加（任意）

現状の `sanity-ai-content-os/.gitignore` は基本的に十分。以下を追加すると更に安全:

```text
# Claude Code per-project local settings (personal preferences, not portable)
.claude/

# Vercel CLI metadata (created on local `vercel link`, not for the repo)
.vercel/
```

`.env.example` は通常 commit するテンプレート（プレースホルダだけのはず）。中身を確認してから:
- 中身が空 / プレースホルダのみ → そのまま commit OK
- 実値が混入していたら → `.gitignore` に追加 or 中身を sanitize

`.claude/settings.local.json` を見ずに判断するなら、`.claude/` 全体を gitignore に追加するのが保守的。

## 安全 commands（Option A 想定、**人間が実行する**）

### Pre-flight: outer の影響を局所化

```bash
# 自分が sanity-ai-content-os/ にいることを確認
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os
pwd
# /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os
```

### 1. .gitignore 補強（任意）

```bash
# 推奨追加分（必要なら）
cat >> .gitignore <<'EOF'

# Claude Code per-project local settings
.claude/

# Vercel CLI metadata
.vercel/
EOF
```

### 2. `git init` で sanity-ai-content-os を独立 repo に

```bash
git init
# 確認:
git rev-parse --show-toplevel
# /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os
```

inner .git が作られ、以降この directory から叩く git は inner を使う。outer の影響なし。

### 3. user 情報を確認（global で良ければスキップ）

```bash
git config user.name  # global の値が返るか確認
git config user.email
# 必要ならローカルで上書き（普段は global で十分）
# git config user.email "st030606@gmail.com"
# git config user.name "st030606-code"
```

### 4. 状態確認（add する前に必ず）

```bash
git status --short
# untracked files が表示される。.env.local / private/ / node_modules/ / dist/ などが **出ない** ことを確認
git check-ignore -v .env.local private node_modules dist .claude
# それぞれ「.gitignore:行番号: パターン」が出れば ignored OK
```

`.env.local` が ignored になっていない、または `private/` が untracked として出てきたら **add しないで停止**、`.gitignore` を見直す。

### 5. add は明示的に（**`git add .` / `git add -A` は使わない**）

```bash
# safer: 1 ファイル / ディレクトリずつ
git add .gitignore
git add README.md AGENTS.md CLAUDE.md
git add package.json package-lock.json tsconfig.json
git add sanity.config.ts sanity.cli.ts
git add schemas/ structure/ tools/
git add docs/ seed/ outputs/ publish-packages/
git add assets/ patches/ prompts/ launchers/
git add dashboard/   # dashboard 配下は dashboard/.gitignore が node_modules / .env* を除外する
git add inputs/ examples/ tasks/   # 中身を見て判断、必要なら個別 add

# 任意: .env.example を template として残したいなら
# 事前に中身を `head -50 .env.example` で確認、placeholder のみであることを確認してから:
# git add .env.example
```

### 6. add 結果を確認

```bash
git status --short
# 全部 A (added) になっていること、private/ や .env.local や node_modules が含まれていないことを確認
git ls-files | grep -E "(\.env\.local|^private/|node_modules)" || echo "(no leak — safe)"
git ls-files | wc -l   # 合計 file 数の sanity check
```

### 7. 初回 commit

```bash
git commit -m "Initial Hitori Media OS local-first MVP and admin dashboard"
```

### 8. リモート設定は GitHub repo 作成後

```bash
# 人間が github.com で新規 repo 作成（例: hitori-media-os / sanity-ai-content-os）
# その後:
git branch -M main
git remote add origin git@github.com:<username>/<repo>.git
git push -u origin main
```

## やってはいけないこと（再列挙）

- ❌ `git add .` / `git add -A` （outer から叩くと全 POTA 兄弟を巻き込む、inner から叩いても node_modules / build artifacts の事故リスク）
- ❌ 10_Development/.git/ を流用しての commit
- ❌ `.env.local` を明示的に `git add`
- ❌ `private/` を明示的に `git add`
- ❌ outer .git を削除する前に、それが本当に dead であることを確認しないで `rm -rf`
- ❌ GitHub repo を作る前に `git push`

## Claude Code が本バッチで触らなかったもの

- `.git/` 関連は **一切変更していない**（outer も inner も）
- `.env.local` / `.env.example` / `private/` 中身は確認していない
- `.gitignore` を変更していない
- 既存 schemas / tools / dashboard / docs（本ファイルと 0116 / latest.md 除く）/ assets / patches / publish-packages / seed: 不変
- Vercel project / DNS / Sanity dataset / Auth secrets: 触れていない

## 連番について

- devlog: 0104 → **0105**
- handoff: 0115 → **0116**

## 発信ネタになりそうな切り口

1. **「`git status` の untracked リストで scope ズレに気づく」**: deploy 前に必ず `git rev-parse --show-toplevel` で root を確認する習慣。
2. **「dead `.git` を残すか消すかの判断」**: 0 commits / 0 remote なら harm はゼロ、でも放置すると次の人が同じ罠を踏む。
3. **「`git add .` の禁止と explicit add の運用」**: monorepo / 兄弟プロジェクト同居の environment では `.` が事故の温床。1 ディレクトリずつ add する習慣。
4. **「`.gitignore` を見ずに `.env*` を信用しない」**: dashboard 側は `.env*` (glob)、project 側は `.env` と `.env.local` (literal) で、ルール強度が違う。`git check-ignore -v` で逐次確認。
5. **「Vercel の Root Directory 設定があるから monorepo は単独 push でいい」**: sub-repo 化しなくても、Vercel project 側で `dashboard/` を Root Directory に指定すれば deploy 単位は分離できる。
