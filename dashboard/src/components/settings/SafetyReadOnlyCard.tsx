// SafetyReadOnlyCard — explains that the dashboard is read-only and lists
// which surfaces are responsible for writes today.

import {ShieldCheck} from 'lucide-react'

interface WriteSurface {
  name: string
  role: string
}

const SURFACES: WriteSurface[] = [
  {name: 'Sanity Studio', role: 'contentIdea / brandProfile / visualStyleProfile / promptTemplate / campaignPlan / platformOutput / visualAssetPlan の編集'},
  {name: 'Visual Register (npm run visual:register)', role: 'inbox 候補の approve & register、assets/visuals/ へ copy + patches JSON 生成'},
  {name: 'Codex CLI / ChatGPT 等', role: 'inbox 候補画像 / 出力下書きの生成'},
  {name: 'リポジトリ手動編集', role: 'tasks/visuals/ ブリーフ、CLAUDE.md ルール、docs/devlog / docs/handoff の記録'},
]

export function SafetyReadOnlyCard() {
  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          aria-hidden="true"
        >
          <ShieldCheck size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-emerald-900">読み取り専用</h2>
          <p className="text-[11px] text-emerald-800/80">
            dashboard は Sanity / FS / 外部に書き込みません
          </p>
        </div>
      </header>

      <p className="text-sm text-emerald-900">
        現フェーズ (Phase Admin 1) の dashboard は完全に read-only。書き込みは下記の専用ツールで行います。Phase 2B で承認系の write actions を dashboard 内に統合する予定。
      </p>

      <ul className="mt-3 flex flex-col gap-1.5">
        {SURFACES.map((s) => (
          <li key={s.name} className="rounded-md bg-white/60 px-3 py-2 text-xs text-emerald-900 ring-1 ring-inset ring-emerald-200">
            <div className="font-medium">{s.name}</div>
            <div className="mt-0.5 text-emerald-800/90">{s.role}</div>
          </li>
        ))}
      </ul>
    </section>
  )
}
