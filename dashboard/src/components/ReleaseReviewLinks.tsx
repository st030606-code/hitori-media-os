// Read-only listing of the release-review markdown files for the current
// boss-facing pre-publish phase. We never try to open the file — the dashboard
// just shows the path so the boss can find it locally.

const RELEASE_REVIEW_DIR = 'publish-packages/campaigns/building-hitori-media-os-release-review'

const LINKS: Array<{label: string; file: string; note?: string}> = [
  {label: '最終チェックリスト', file: 'final-human-checklist.md', note: 'ボスが最後に1度通すリスト'},
  {label: 'X 最終レビュー', file: 'x-final-review.md'},
  {label: 'Threads 最終レビュー', file: 'threads-final-review.md'},
  {label: 'note 最終レビュー', file: 'note-final-review.md'},
  {label: 'Substack 最終レビュー', file: 'substack-final-review.md'},
]

export function ReleaseReviewLinks() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">公開前レビュー資料</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          ローカルのファイルパスを表示します。クリックしてもファイルは開かないので、エディタで開いて読んでください。
        </p>
      </header>
      <ul className="space-y-2 text-sm">
        {LINKS.map((l) => (
          <li
            key={l.file}
            className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-baseline sm:justify-between"
          >
            <div>
              <span className="font-medium text-slate-900">{l.label}</span>
              {l.note && <span className="ml-2 text-xs text-slate-500">{l.note}</span>}
            </div>
            <code className="break-all rounded bg-white px-1.5 py-0.5 text-xs text-slate-700">
              {RELEASE_REVIEW_DIR}/{l.file}
            </code>
          </li>
        ))}
      </ul>
    </section>
  )
}
