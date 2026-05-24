// promptBuilder — pure function that turns the Output Configurator form
// state into a copy-pastable AI prompt. No external calls; deterministic.
//
// Used by the "プロンプトをコピー" feature (Phase UI-fidelity-5 prompt
// copy preview mode). Phase UI-4 P2 will reuse the same builder when actual
// AI generation is wired.

import type {ContentIdeaOption, PromptTemplateOption} from '@/lib/groq/configurator'
import {
  CTA_OPTIONS,
  LENGTH_OPTIONS,
  OUTPUT_TYPE_OPTIONS,
  PLATFORM_OPTIONS,
  PURPOSE_OPTIONS,
  REVIEW_LEVEL_OPTIONS,
  TONE_OPTIONS,
  type FormValue,
  type Option,
} from './options'

function labelOf(opts: Option[], value: string): string {
  if (!value) return '—'
  const match = opts.find((o) => o.value === value)
  return match?.label ?? value
}

function platformLabels(values: string[]): string {
  if (values.length === 0) return '—'
  return values
    .map((v) => labelOf(PLATFORM_OPTIONS, v))
    .join(' / ')
}

// Sanity-tolerant text-list normalizer.
//
// contentIdea fields can arrive as:
//   - string[] (e.g. audience)
//   - single string (e.g. audiencePain — schema is `type: text`)
//   - object[] with title/text/value/name/_key (e.g. examples / objections)
//   - Portable Text-like blocks {_type: 'block', children: [{text}]}
//   - null / undefined
//   - mixed arrays
//
// Output: trimmed non-empty string[]. Empty if nothing usable.
export function normalizeTextList(value: unknown): string[] {
  if (value == null) return []
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? [trimmed] : []
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)]
  }
  if (Array.isArray(value)) {
    const out: string[] = []
    for (const item of value) {
      out.push(...normalizeTextList(item))
    }
    return out
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    // Portable Text-like blocks: collect children[].text
    if (Array.isArray(obj.children)) {
      const parts: string[] = []
      for (const child of obj.children) {
        if (child && typeof child === 'object') {
          const t = (child as {text?: unknown}).text
          if (typeof t === 'string' && t.trim()) parts.push(t.trim())
        }
      }
      if (parts.length > 0) return [parts.join('')]
    }
    // Common text-bearing fields, in priority order
    for (const key of ['title', 'text', 'value', 'name', 'label', 'claim', 'objection', 'description', '_key']) {
      const v = obj[key]
      if (typeof v === 'string' && v.trim()) return [v.trim()]
    }
    return []
  }
  return []
}

function bulletList(items: unknown): string {
  const list = normalizeTextList(items)
  if (list.length === 0) return '  (未設定)'
  return list.map((i) => `  - ${i}`).join('\n')
}

export interface PromptBuilderArgs {
  form: FormValue
  contentIdea?: ContentIdeaOption | null
  promptTemplate?: PromptTemplateOption | null
}

// Title-candidate heuristic: derive 3-5 candidate titles from coreThesis +
// platform + tone hints. Deterministic, no AI call.
export function buildTitleCandidates(
  thesis?: string,
  outputType?: string,
  tone?: string,
): string[] {
  if (!thesis) return []
  const trimmed = thesis.replace(/[。、]\s*$/, '').trim()
  const candidates: string[] = []

  // 1. coreThesis をそのまま採用
  candidates.push(trimmed)

  // 2. platform / outputType を冠にする
  if (outputType) {
    const outLabel = labelOf(OUTPUT_TYPE_OPTIONS, outputType)
    candidates.push(`【${outLabel}】${trimmed}`)
  } else {
    candidates.push(`【発信ログ】${trimmed}`)
  }

  // 3. 実践 / 教材ベース
  if (tone === 'educational') {
    candidates.push(`実践で分かった: ${trimmed}`)
  } else {
    candidates.push(`実践記: ${trimmed}`)
  }

  // 4. 疑問形 (簡易変換)
  const question = trimmed.includes('?')
    ? trimmed
    : `${trimmed} のは、どうしてだろう？`
  candidates.push(question)

  // 5. 逆張り
  candidates.push(`なぜ ${trimmed} なのか — ひとり運営の視点で`)

  return candidates.slice(0, 5)
}

export function buildPrompt({form, contentIdea, promptTemplate}: PromptBuilderArgs): string {
  const lines: string[] = []

  lines.push('# Hitori Media OS — 下書き生成プロンプト')
  lines.push('')
  lines.push('あなたは Hitori Media OS のコンテンツ生成アシスタントです。')
  lines.push('以下の条件で **手動レビュー前提の下書き** を作成してください。')
  lines.push('')

  // --- Source Content Idea ---
  lines.push('## 元アイデア (Source Content Idea)')
  if (contentIdea) {
    lines.push(`- タイトル: ${contentIdea.title ?? '(無題)'}`)
    if (contentIdea.slug) lines.push(`- slug: \`${contentIdea.slug}\``)
    if (contentIdea.coreThesis) lines.push(`- 中心主張 (coreThesis): ${contentIdea.coreThesis}`)
    const audienceList = normalizeTextList(contentIdea.audience)
    if (audienceList.length > 0) {
      lines.push(`- 想定読者 (audience):`)
      lines.push(bulletList(audienceList))
    }
    const audiencePainList = normalizeTextList(contentIdea.audiencePain)
    if (audiencePainList.length > 0) {
      lines.push(`- 想定読者の悩み (audiencePain):`)
      lines.push(bulletList(audiencePainList))
    }
    if (contentIdea.claimsCount != null) {
      lines.push(`- 主張の件数: ${contentIdea.claimsCount}`)
    }
    if (contentIdea.examplesCount != null) {
      lines.push(`- 具体例の件数: ${contentIdea.examplesCount}`)
    }
    if (contentIdea.objectionsCount != null) {
      lines.push(`- 反論の件数: ${contentIdea.objectionsCount}`)
    }
  } else {
    lines.push('- (未選択。Sanity Studio で対象の contentIdea を選んでから再生成してください)')
  }
  lines.push('')

  // --- Output conditions ---
  lines.push('## 出力条件')
  lines.push(`- 出力先 (platforms): ${platformLabels(form.platforms)}`)
  lines.push(`- 出力形式 (outputType): ${labelOf(OUTPUT_TYPE_OPTIONS, form.outputType)}`)
  lines.push(`- 目的 (purpose): ${labelOf(PURPOSE_OPTIONS, form.purpose)}`)
  lines.push(`- トーン (tone): ${labelOf(TONE_OPTIONS, form.tone)}`)
  lines.push(`- CTA: ${labelOf(CTA_OPTIONS, form.cta)}`)
  lines.push(`- 出力長さ (length): ${labelOf(LENGTH_OPTIONS, form.length)}`)
  lines.push(`- 図解の同時生成: ${form.diagramEnabled ? 'あり (visual-brief も別途出力)' : 'なし'}`)
  lines.push(`- ビジュアル方針: ${form.visualPreference}`)
  lines.push(`- レビュー要求度: ${labelOf(REVIEW_LEVEL_OPTIONS, form.reviewLevel)}`)
  if (form.keywords.length > 0) {
    lines.push(`- 含めるキーワード: ${form.keywords.join(' / ')}`)
  }
  if (form.additionalInstructions.trim()) {
    lines.push(`- 追加指示: ${form.additionalInstructions.trim()}`)
  }
  if (promptTemplate) {
    lines.push(
      `- 参照プロンプトテンプレ: ${promptTemplate.title ?? promptTemplate._id} (category: ${promptTemplate.category ?? '—'})`,
    )
  }
  lines.push('')

  // --- Constraints (CLAUDE.md derived) ---
  lines.push('## 制約 (Hitori Media OS の content quality 基準)')
  lines.push('- 発信者の視点を残す (AI 礼賛ではない)')
  lines.push('- 元レコードの主張・反論から逸脱しない')
  lines.push('- プラットフォームごとの形式に合わせる')
  lines.push('- 読者に合った言葉で書く')
  lines.push('- 実用的な次の行動を示す')
  lines.push('- ありがちな AI っぽい水増し / 曖昧な励まし / 根拠のない主張は避ける')
  lines.push('- 完成済みツールの宣伝にしない、building-in-public な実験ログとして書く')
  lines.push('')

  // --- Output instructions ---
  lines.push('## 出力')
  lines.push('1. タイトル候補を 3-5 件 (採用は人間判断)')
  lines.push('2. リード段落 (冒頭 100-200 字)')
  lines.push('3. 本文 (条件の "出力長さ" を尊重)')
  lines.push('4. CTA 案 (条件で指定したもの)')
  lines.push('5. 図解の説明 (図解オプション ON のときのみ)')
  lines.push('')
  lines.push('出力は markdown 形式で、各セクションを `##` 見出しで分けてください。')
  lines.push('最終的には人間がレビュー / 編集する前提です。')

  return lines.join('\n')
}
