// Japanese status label helper for the boss-facing review UI.
// Use this in visible UI where practical; English status values remain available
// in dev-detail sections so the underlying schema enums stay traceable.

export type StatusTone = 'done' | 'progress' | 'pending' | 'blocked' | 'idle' | 'info'

const JA_LABELS: Record<string, string> = {
  saved: '保存済み',
  skipped: '今回は保留',
  'brief-ready': '生成前',
  'pending-review': '確認待ち',
  'in-progress': '作業中',
  done: '完了',
  blocked: '要対応',
  draft: '下書き',
  active: '有効',
  unknown: '不明',
  reviewed: '確認済み',
  approved: '承認済み',
  packaged: '配布準備済み',
  published: '公開済み',
  'generated-needs-save': '保存待ち',
  'prompt-ready': 'プロンプト準備済み',
  planned: '計画中',
  'not-started': '未着手',
  planning: '計画中',
  generating: '生成中',
  reviewing: '確認中',
  registered: '登録済み',
  completed: '完了',
  idea: 'アイデア',
  'needs-regeneration': '再生成が必要',
  rejected: '却下',
  deprecated: '廃止',
  archived: 'アーカイブ',
  paused: '一時停止',
}

const TONE_MAP: Record<string, StatusTone> = {
  saved: 'done',
  done: 'done',
  approved: 'done',
  reviewed: 'done',
  packaged: 'done',
  published: 'done',
  completed: 'done',
  registered: 'done',
  active: 'done',
  'in-progress': 'progress',
  generating: 'progress',
  reviewing: 'progress',
  'pending-review': 'progress',
  'generated-needs-save': 'progress',
  'prompt-ready': 'progress',
  'brief-ready': 'pending',
  planned: 'pending',
  planning: 'pending',
  'not-started': 'pending',
  draft: 'pending',
  idea: 'pending',
  blocked: 'blocked',
  'needs-regeneration': 'blocked',
  rejected: 'blocked',
  deprecated: 'blocked',
  skipped: 'idle',
  archived: 'idle',
  paused: 'idle',
  unknown: 'idle',
}

export function statusLabelJa(status?: string | null): string {
  if (!status) return '不明'
  return JA_LABELS[status] ?? status
}

export function statusTone(status?: string | null): StatusTone {
  if (!status) return 'idle'
  return TONE_MAP[status] ?? 'info'
}
