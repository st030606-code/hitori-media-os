// Shared option constants for the Output Configurator (Phase UI-fidelity-5).
// Values are stable enum strings; labels are Japanese display strings.
// These exist in one place so that PlatformAndOutputTypeCard / ToneAndCtaCard
// / AdvancedOptionsCard / promptBuilder all agree on key + label.

export interface Option<V extends string = string> {
  value: V
  label: string
  hint?: string
}

// ---------- Form value shape ----------

export interface FormValue {
  contentIdeaId: string
  platforms: string[]
  outputType: string
  purpose: string
  tone: string
  cta: string
  length: string
  visualPreference: string
  additionalInstructions: string
  diagramEnabled: boolean
  reviewLevel: string
  promptTemplateId: string
  keywords: string[]
}

export const DEFAULT_FORM_VALUE: FormValue = {
  contentIdeaId: '',
  platforms: [],
  outputType: '',
  purpose: '',
  tone: '',
  cta: '',
  length: 'medium',
  visualPreference: 'no-visual',
  additionalInstructions: '',
  diagramEnabled: false,
  reviewLevel: 'standard',
  promptTemplateId: '',
  keywords: [],
}

// ---------- Platform ----------

export const PLATFORM_OPTIONS: Option[] = [
  {value: 'x', label: 'X'},
  {value: 'threads', label: 'Threads'},
  {value: 'note', label: 'note'},
  {value: 'substack', label: 'Substack'},
  {value: 'youtube', label: 'YouTube'},
  {value: 'shorts', label: 'Shorts'},
  {value: 'podcast', label: 'Podcast'},
  {value: 'instagram', label: 'Instagram'},
  {value: 'newsletter', label: 'ニュースレター'},
  {value: 'github', label: 'GitHub'},
  {value: 'diagram', label: '図解'},
]

// ---------- Output type ----------

export const OUTPUT_TYPE_OPTIONS: Option[] = [
  {value: 'post', label: '投稿', hint: 'X / Threads / Substack Notes'},
  {value: 'thread', label: 'スレッド', hint: 'X / Threads の連投'},
  {value: 'article', label: '記事', hint: 'note / blog'},
  {value: 'newsletter', label: 'ニュースレター', hint: 'Substack Post / Email'},
  {value: 'script', label: '台本', hint: 'YouTube / Podcast'},
  {value: 'short-script', label: 'ショート台本', hint: 'YouTube Shorts / Reels'},
  {value: 'visual-brief', label: 'ビジュアル brief', hint: '図解 / 画像方向性'},
  {value: 'custom', label: 'カスタム'},
]

// 媒体 → 出力形式 推奨マッピング (UI 制約ではなく、推奨表示用)
export const RECOMMENDED_OUTPUT_TYPE_BY_PLATFORM: Record<string, string[]> = {
  x: ['post', 'thread'],
  threads: ['post', 'thread'],
  note: ['article'],
  substack: ['newsletter'],
  youtube: ['script'],
  shorts: ['short-script'],
  podcast: ['script'],
  instagram: ['post', 'short-script', 'visual-brief'],
  newsletter: ['newsletter'],
  github: ['article'],
  diagram: ['visual-brief'],
}

// ---------- Purpose ----------

export const PURPOSE_OPTIONS: Option[] = [
  {value: 'trust-building', label: '信頼形成', hint: '読者の理解と期待値を整える'},
  {value: 'list-growth', label: 'リスト獲得', hint: '購読 / フォロー増分'},
  {value: 'paid-conversion', label: '有料転換', hint: '購入 / 申込'},
  {value: 'search-traffic', label: '検索流入', hint: 'SEO / note 検索'},
  {value: 'product-education', label: '製品教育', hint: '使い方 / 価値訴求'},
  {value: 'community-conversation', label: 'コミュニティ会話', hint: '返信 / 引用'},
]

// ---------- Tone ----------

export const TONE_OPTIONS: Option[] = [
  {value: 'practical', label: '実践的', hint: '具体例ベース / 手順'},
  {value: 'energetic', label: 'エネルギッシュ', hint: 'テンポ感 / 短文'},
  {value: 'calm-research', label: '落ち着き・調査', hint: '根拠ベース / 静か'},
  {value: 'story', label: 'ストーリー', hint: '体験 / 物語'},
  {value: 'educational', label: '教材', hint: '学習者向けの順序'},
]

// ---------- CTA ----------

export const CTA_OPTIONS: Option[] = [
  {value: 'none', label: 'CTA なし', hint: '本文だけで完結'},
  {value: 'follow', label: 'フォロー', hint: 'X / Threads アカウント'},
  {value: 'subscribe', label: '購読', hint: 'Substack 等'},
  {value: 'read-note', label: 'note へ誘導'},
  {value: 'open-publish-package', label: '公開パッケージへ', hint: '内部リンク'},
  {value: 'reply', label: '返信 / コメント募集'},
]

// ---------- Length ----------

export const LENGTH_OPTIONS: Option[] = [
  {value: 'short', label: '短文', hint: '〜800 字'},
  {value: 'medium', label: '標準', hint: '2,000-4,000 字'},
  {value: 'long', label: '長文', hint: '4,000-7,000 字'},
]

// ---------- Visual preference ----------

export const VISUAL_PREFERENCE_OPTIONS: Option[] = [
  {value: 'no-visual', label: 'ビジュアルなし'},
  {value: 'visual-direction-only', label: '方向性だけ', hint: '画像生成はしない'},
  {value: 'visual-later', label: '後で検討', hint: '可能性だけ残す'},
]

// ---------- Review level ----------

export const REVIEW_LEVEL_OPTIONS: Option[] = [
  {value: 'standard', label: '標準', hint: 'boss が公開前に音読 1 度'},
  {value: 'strict', label: '厳格', hint: '逐次 review + 修正記録'},
  {value: 'light', label: '軽量', hint: 'タイポチェックのみ'},
]
