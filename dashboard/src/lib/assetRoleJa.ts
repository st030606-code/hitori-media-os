// Human-readable Japanese role labels for each known visualAssetPlan slug.
// Used by /visual-assets and the campaign detail page so the boss sees
// "Substack本文図解：読者リスト" instead of the developer slug
// `substack-inline-reader-system-v1`.

const ASSET_ROLE_JA: Record<string, string> = {
  'note-hero-v1': 'note / Substack 共通ヒーロー',
  'substack-header-v1': 'Substackヘッダー',
  'x-hook-main-v1': 'Xフック画像',
  'threads-support-diagram-v1': 'Threads補助図解',
  'note-inline-content-os-flow-v1': 'note本文図解：Content OSの流れ',
  'note-inline-human-judgment-v1': 'note本文図解：人間判断',
  'substack-inline-reader-system-v1': 'Substack本文図解：読者リスト',
  'note-inline-manual-vs-automation-v1': 'note補助図解：手動と自動化',
  'note-inline-publish-package-folder-v1': 'note補助図解：公開パッケージ',
}

export function assetRoleJa(slug?: string | null): string | null {
  if (!slug) return null
  return ASSET_ROLE_JA[slug] ?? null
}

// Extract the asset slug from a Sanity _id like
// "visualAssetPlan.building-hitori-media-os.note-hero-v1" by taking the
// last dot-segment.
export function assetSlugFromId(id?: string | null): string | null {
  if (!id) return null
  const parts = id.split('.')
  return parts[parts.length - 1] ?? null
}
