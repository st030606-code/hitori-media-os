// AssetPreviewCard — single-asset hero preview on /visual-assets/[assetId].
// Image source priority: final asset (localAssetPath under assets/visuals/)
// when present, otherwise the inbox v001.png derived from assetSlug pair.
// Outside local mode, an empty placeholder is shown.

import {Image as ImageIcon} from 'lucide-react'

interface Props {
  finalPath?: string | null
  inboxFallbackPath?: string | null
  alt: string
  enableLocalFsRoutes: boolean
}

function buildSrc(p: string | null | undefined): string | null {
  if (!p) return null
  if (!p.startsWith('assets/visuals/') && !p.startsWith('assets/inbox/generated/')) return null
  return `/api/asset-thumb?path=${encodeURIComponent(p)}`
}

export function AssetPreviewCard({finalPath, inboxFallbackPath, alt, enableLocalFsRoutes}: Props) {
  const finalSrc = enableLocalFsRoutes ? buildSrc(finalPath) : null
  const inboxSrc = enableLocalFsRoutes && !finalSrc ? buildSrc(inboxFallbackPath) : null
  const src = finalSrc ?? inboxSrc

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h2 className="text-base font-semibold text-slate-900">プレビュー</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
          {finalSrc ? '最終配置' : inboxSrc ? '候補 v001' : '画像なし'}
        </span>
      </div>
      <div className="flex max-h-[480px] items-center justify-center overflow-hidden bg-slate-50">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="max-h-[480px] w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-slate-300">
            <ImageIcon size={48} aria-hidden="true" />
            <p className="text-xs text-slate-500">
              {enableLocalFsRoutes
                ? '保存済みの最終画像も inbox 候補もまだありません。'
                : 'ローカル候補プレビューは開発環境でのみ利用できます。'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
