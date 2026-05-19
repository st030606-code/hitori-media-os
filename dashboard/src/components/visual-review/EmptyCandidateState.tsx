// EmptyCandidateState — shown when no candidate v00N.png files were found for
// an asset. Three reasons can produce this state; we want to communicate which
// one so the boss knows whether the next action is "generate" or "check the
// flag" or "double-check the asset ID".

type Reason = 'no-candidates' | 'local-only' | 'asset-not-found'

const reasonText: Record<Reason, {title: string; body: string}> = {
  'no-candidates': {
    title: 'No candidate images yet.',
    body:
      'Run `codex exec -m gpt-5.4 --enable image_generation ...` per docs/64 §14 or use the existing tasks/visuals/<slug>/<asset>.md brief to produce v001/v002/v003.',
  },
  'local-only': {
    title: 'Candidate previews are localhost-only.',
    body:
      'Production mode hides filesystem candidate listings. Run `ENABLE_LOCAL_FS_ROUTES=true npm run dev` to inspect candidates locally.',
  },
  'asset-not-found': {
    title: 'Asset folder not found in inbox.',
    body:
      'The dashboard expected `assets/inbox/generated/<campaignSlug>/<assetSlug>/` to exist. Confirm the assetId path segment matches a folder, or generate the first candidate to bootstrap it.',
  },
}

export function EmptyCandidateState({reason}: {reason: Reason}) {
  const {title, body} = reasonText[reason]
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-slate-600">{body}</p>
    </div>
  )
}
