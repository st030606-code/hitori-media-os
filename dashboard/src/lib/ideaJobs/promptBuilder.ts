// Phase 2C-0 — prompt builder for the AI idea-development (企画化) package.
//
// What this module does:
//   - Validates and normalises the boss-supplied raw-idea fields.
//   - Renders `prompt.md` (the body that boss pastes into ChatGPT / Claude
//     Code / Codex) and `job.json` (machine-readable metadata for the
//     idea-job directory).
//   - Returns the expected result paths so the boss UI can show "where to
//     save the AI result" instructions.
//
// Boundaries (CONFIRMED handoff/0197):
//   - Q-2C-6: dashboard does NOT call any LLM API. The output of this module
//     is plain text that boss runs manually through their AI agent of choice.
//   - Q-2C-7: caller is responsible for writing the output via the atomic
//     write helpers; this module never touches the filesystem.
//   - Default output language is Japanese; boss may override later.

import type {IdeaJobPaths} from './paths'

export const PROMPT_VERSION = 'v1'
export const PROMPT_BOUNDARY = 'no-api, manual-agent'
const MAX_ROUGH_MEMO_LEN = 4000
const MAX_FREE_FIELD_LEN = 400
const MAX_PLATFORMS = 12

export type Urgency = 'now' | 'this-week' | 'someday' | 'unknown'
export type RelatedProject = 'pota-empire-core' | 'pota-card-pro' | 'hitori-media-os' | 'external' | 'other'
export type IdeaSource =
  | 'obsidian'
  | 'chatgpt-chat'
  | 'claude-chat'
  | 'codex-chat'
  | 'voice-memo'
  | 'dream'
  | 'dialogue'
  | 'manual'

export const URGENCY_VALUES: readonly Urgency[] = ['now', 'this-week', 'someday', 'unknown']
export const RELATED_PROJECT_VALUES: readonly RelatedProject[] = [
  'pota-empire-core',
  'pota-card-pro',
  'hitori-media-os',
  'external',
  'other',
]
export const IDEA_SOURCE_VALUES: readonly IdeaSource[] = [
  'obsidian',
  'chatgpt-chat',
  'claude-chat',
  'codex-chat',
  'voice-memo',
  'dream',
  'dialogue',
  'manual',
]

// Limited to platforms we already model in contentIdea.platformAngles.
export const SUPPORTED_PLATFORMS = [
  'note',
  'substack',
  'threads',
  'x',
  'youtube',
  'shorts',
  'podcast',
  'diagram',
  'github',
  'paid',
  'instagram',
  'newsletter',
] as const

export type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number]

export interface RawIdeaInput {
  rawTitle?: string
  roughMemo: string
  sourceContext?: string
  intendedTheme?: string
  urgency?: Urgency
  relatedProject?: RelatedProject
  initialPlatforms?: SupportedPlatform[]
  ideaSource?: IdeaSource
}

export interface NormalisedRawIdea {
  rawTitle: string
  roughMemo: string
  sourceContext: string
  intendedTheme: string
  urgency: Urgency
  relatedProject: RelatedProject | ''
  initialPlatforms: SupportedPlatform[]
  ideaSource: IdeaSource | ''
}

export type PromptBuilderError =
  | 'rough-memo-required'
  | 'rough-memo-too-long'
  | 'raw-title-too-long'
  | 'free-field-too-long'
  | 'bad-urgency'
  | 'bad-related-project'
  | 'bad-idea-source'
  | 'too-many-platforms'
  | 'bad-platform'

export interface PromptBuilderErrorDetail {
  ok: false
  error: PromptBuilderError
  message: string
}

export function normaliseRawIdea(
  input: RawIdeaInput,
): {ok: true; value: NormalisedRawIdea} | PromptBuilderErrorDetail {
  if (typeof input.roughMemo !== 'string' || input.roughMemo.trim().length === 0) {
    return {ok: false, error: 'rough-memo-required', message: 'roughMemo is required'}
  }
  if (input.roughMemo.length > MAX_ROUGH_MEMO_LEN) {
    return {
      ok: false,
      error: 'rough-memo-too-long',
      message: `roughMemo exceeds ${MAX_ROUGH_MEMO_LEN} characters`,
    }
  }
  if (typeof input.rawTitle === 'string' && input.rawTitle.length > MAX_FREE_FIELD_LEN) {
    return {
      ok: false,
      error: 'raw-title-too-long',
      message: `rawTitle exceeds ${MAX_FREE_FIELD_LEN} characters`,
    }
  }
  for (const [k, v] of [
    ['sourceContext', input.sourceContext],
    ['intendedTheme', input.intendedTheme],
  ] as const) {
    if (typeof v === 'string' && v.length > MAX_FREE_FIELD_LEN) {
      return {
        ok: false,
        error: 'free-field-too-long',
        message: `${k} exceeds ${MAX_FREE_FIELD_LEN} characters`,
      }
    }
  }
  if (input.urgency !== undefined && !URGENCY_VALUES.includes(input.urgency)) {
    return {ok: false, error: 'bad-urgency', message: 'urgency must be a known enum value'}
  }
  if (
    input.relatedProject !== undefined &&
    !RELATED_PROJECT_VALUES.includes(input.relatedProject)
  ) {
    return {
      ok: false,
      error: 'bad-related-project',
      message: 'relatedProject must be a known enum value',
    }
  }
  if (input.ideaSource !== undefined && !IDEA_SOURCE_VALUES.includes(input.ideaSource)) {
    return {ok: false, error: 'bad-idea-source', message: 'ideaSource must be a known enum value'}
  }
  const platforms = input.initialPlatforms ?? []
  if (!Array.isArray(platforms) || platforms.length > MAX_PLATFORMS) {
    return {
      ok: false,
      error: 'too-many-platforms',
      message: `initialPlatforms exceeds ${MAX_PLATFORMS} entries`,
    }
  }
  const platformSet = new Set<SupportedPlatform>()
  for (const p of platforms) {
    if (!(SUPPORTED_PLATFORMS as readonly string[]).includes(p)) {
      return {
        ok: false,
        error: 'bad-platform',
        message: `unknown platform: ${String(p).slice(0, 32)}`,
      }
    }
    platformSet.add(p)
  }
  const value: NormalisedRawIdea = {
    rawTitle: (input.rawTitle ?? '').trim(),
    roughMemo: input.roughMemo.trim(),
    sourceContext: (input.sourceContext ?? '').trim(),
    intendedTheme: (input.intendedTheme ?? '').trim(),
    urgency: input.urgency ?? 'unknown',
    relatedProject: input.relatedProject ?? '',
    initialPlatforms: [...platformSet],
    ideaSource: input.ideaSource ?? '',
  }
  return {ok: true, value}
}

export interface RenderedPromptPackage {
  promptMd: string
  jobJson: string
  rawIdeaJson: string
}

export interface RenderInput {
  raw: NormalisedRawIdea
  paths: IdeaJobPaths
  /** ISO 8601 created-at, e.g. `new Date().toISOString()`. */
  createdAtIso: string
}

/**
 * Renders `prompt.md` text. The prompt asks the AI agent to perform 企画化
 * (idea development), NOT final post drafting. Q-2C-6: this is for manual
 * agents (ChatGPT / Claude Code / Codex); the dashboard never invokes them.
 */
function renderPromptMd({raw, paths, createdAtIso}: RenderInput): string {
  const lines: string[] = []
  lines.push('# AI企画化prompt — Hitori Media OS / Phase 2C-0')
  lines.push('')
  lines.push(`- ideaSlug: \`${paths.ideaSlug}\``)
  lines.push(`- jobTimestamp: \`${paths.timestamp}\``)
  lines.push(`- promptVersion: \`${PROMPT_VERSION}\``)
  lines.push(`- boundary: \`${PROMPT_BOUNDARY}\``)
  lines.push(`- createdAt: \`${createdAtIso}\``)
  lines.push('')
  lines.push('## 役割と目的')
  lines.push('')
  lines.push('あなたは Hitori Media OS の **企画化パートナー** です。')
  lines.push('')
  lines.push('boss が抱えた **rough idea (未整理の思いつき)** を、 構造化された Content Idea に育てるための分析と提案を返してください。')
  lines.push('')
  lines.push('**注意**: 本ステップでは **最終投稿文を書かない**。 最初のゴールは「企画化 / idea development」 のみ。 結果は boss が review + 編集してから contentIdea として Sanity に登録します。')
  lines.push('')
  lines.push('## Raw Idea (入力)')
  lines.push('')
  lines.push('```yaml')
  if (raw.rawTitle) lines.push(`rawTitle: ${JSON.stringify(raw.rawTitle)}`)
  lines.push('roughMemo: |')
  for (const memoLine of raw.roughMemo.split('\n')) lines.push(`  ${memoLine}`)
  if (raw.sourceContext) lines.push(`sourceContext: ${JSON.stringify(raw.sourceContext)}`)
  if (raw.intendedTheme) lines.push(`intendedTheme: ${JSON.stringify(raw.intendedTheme)}`)
  lines.push(`urgency: ${raw.urgency}`)
  if (raw.relatedProject) lines.push(`relatedProject: ${raw.relatedProject}`)
  if (raw.initialPlatforms.length > 0) {
    lines.push(`initialPlatforms: [${raw.initialPlatforms.join(', ')}]`)
  }
  if (raw.ideaSource) lines.push(`ideaSource: ${raw.ideaSource}`)
  lines.push('```')
  lines.push('')
  lines.push('## あなたが返すべき構造化された結果')
  lines.push('')
  lines.push('以下の項目を **日本語** で答えてください (boss が明示的に変更しない限り日本語)。')
  lines.push('')
  lines.push('1. **proposedTitle**: 仮タイトル (boss が後で書き換え可)')
  lines.push('2. **coreThesis**: 中心主張 (これだけは絶対に外せない、 と言える 1-2 文)')
  lines.push('3. **targetReader**: 想定読者 (1-3 名分の persona、 array)')
  lines.push('4. **audiencePain**: 読者の具体的な悩み / 不満')
  lines.push('5. **claims**: 主張リスト (3-7 件、 各 claim + confidence: low/medium/high + needsVerification: true/false)')
  lines.push('6. **objections**: 想定される反論 / 懸念 + それに対する返答 (3-5 件)')
  lines.push('7. **examples**: 具体例 / ミニケース (2-4 件、 title + description)')
  lines.push('8. **platformAngles**: 媒体ごとの切り口 (initialPlatforms をベース、 各 platform に hook / formatNotes / callToAction)')
  lines.push('9. **visualPotential**: 図解可能性 (yes/no + どんな visual が活きるか)')
  lines.push('10. **recommendedCampaign**: 推奨キャンペーン枠 (release-review / build-log / educational / paid-readiness / case-study / launch / milestone のいずれか + 理由)')
  lines.push('11. **risks** / **weakPoints**: 主張の弱点、 verify が必要な箇所')
  lines.push('12. **nextQuestions**: boss が次に深掘りすべき question (5-10 件)')
  lines.push('')
  lines.push('## 出力形式')
  lines.push('')
  lines.push('結果は **2 つの形式** で書いてください。')
  lines.push('')
  lines.push('1. **markdown** (人間の boss が review しやすい形): 各項目を h2 / h3 + 箇条書きで。')
  lines.push('2. **JSON ブロック** (contentIdea 登録用の機械可読データ): markdown の末尾に ```json ... ``` で囲んで埋めてください。')
  lines.push('')
  lines.push('JSON ブロックの shape (Sanity contentIdea schema と整合):')
  lines.push('')
  lines.push('```json')
  lines.push('{')
  lines.push('  "proposedTitle": "...",')
  lines.push('  "coreThesis": "...",')
  lines.push('  "targetReader": ["...", "..."],')
  lines.push('  "audiencePain": "...",')
  lines.push('  "claims": [')
  lines.push('    {"claim": "...", "supportingEvidence": "...", "confidence": "medium", "needsVerification": false}')
  lines.push('  ],')
  lines.push('  "objections": [{"objection": "...", "response": "..."}],')
  lines.push('  "examples": [{"title": "...", "description": "..."}],')
  lines.push('  "platformAngles": [')
  lines.push('    {"platform": "x", "targetReader": "...", "hook": "...", "formatNotes": "...", "callToAction": "..."}')
  lines.push('  ],')
  lines.push('  "visualPotential": {"usable": true, "ideas": ["...", "..."]},')
  lines.push('  "recommendedCampaign": {"type": "build-log", "reason": "..."},')
  lines.push('  "risks": ["...", "..."],')
  lines.push('  "nextQuestions": ["...", "..."]')
  lines.push('}')
  lines.push('```')
  lines.push('')
  lines.push('## レビュー観点 (boss が結果を確認するときに使う)')
  lines.push('')
  lines.push('- 中心主張が boss の roughMemo の意図と一致しているか')
  lines.push('- 想定読者が boss の発信文脈に合っているか')
  lines.push('- claims に「verify 必要」 marking が適切に付いているか')
  lines.push('- platformAngles の hook が各 platform の特性に合っているか')
  lines.push('- 弱点 / 反論を AI 側だけで処理せず boss に確認させる構造になっているか')
  lines.push('')
  lines.push('## 結果の保存先 (boss が AI agent から戻ったあと手動で保存)')
  lines.push('')
  lines.push(`- markdown 結果: \`${paths.expectedResultMdRelative}\``)
  lines.push(`- JSON 結果 (markdown の json ブロックを抜粋): \`${paths.expectedResultJsonRelative}\``)
  lines.push('')
  lines.push('保存後、 dashboard `/ideas` 画面で「結果を取り込む」 → preview して contentIdea promote に進みます。')
  return lines.join('\n') + '\n'
}

function renderJobJson({raw, paths, createdAtIso}: RenderInput): string {
  const doc = {
    ideaJobId: `${paths.ideaSlug}-${paths.timestamp}`,
    ideaSlug: paths.ideaSlug,
    timestamp: paths.timestamp,
    promptVersion: PROMPT_VERSION,
    boundary: PROMPT_BOUNDARY,
    createdAt: createdAtIso,
    rawJsonPath: paths.rawJsonRelative,
    promptPath: paths.promptMdRelative,
    expectedResultMdPath: paths.expectedResultMdRelative,
    expectedResultJsonPath: paths.expectedResultJsonRelative,
    rawIdeaSummary: {
      hasRawTitle: raw.rawTitle.length > 0,
      roughMemoLength: raw.roughMemo.length,
      hasSourceContext: raw.sourceContext.length > 0,
      hasIntendedTheme: raw.intendedTheme.length > 0,
      urgency: raw.urgency,
      relatedProject: raw.relatedProject || null,
      initialPlatforms: raw.initialPlatforms,
      ideaSource: raw.ideaSource || null,
    },
  }
  return JSON.stringify(doc, null, 2) + '\n'
}

function renderRawIdeaJson({raw, paths, createdAtIso}: RenderInput): string {
  const doc = {
    ideaSlug: paths.ideaSlug,
    createdAt: createdAtIso,
    rawTitle: raw.rawTitle || null,
    roughMemo: raw.roughMemo,
    sourceContext: raw.sourceContext || null,
    intendedTheme: raw.intendedTheme || null,
    urgency: raw.urgency,
    relatedProject: raw.relatedProject || null,
    initialPlatforms: raw.initialPlatforms,
    ideaSource: raw.ideaSource || null,
    // No Sanity ID — Q-2C-2 confirmed: raw idea stays filesystem-only.
  }
  return JSON.stringify(doc, null, 2) + '\n'
}

export function renderPromptPackage(input: RenderInput): RenderedPromptPackage {
  return {
    promptMd: renderPromptMd(input),
    jobJson: renderJobJson(input),
    rawIdeaJson: renderRawIdeaJson(input),
  }
}

/**
 * Builds a suggested local CLI command boss can run manually. The dashboard
 * NEVER executes this — it is for display + copy only (Q-2C-6). We default
 * to `codex exec --read ... --out ...` and provide a `claude` variant the
 * boss can pick from the UI if they prefer.
 */
export function buildSuggestedCommands(paths: IdeaJobPaths): {
  codex: string
  claude: string
  cat: string
} {
  const promptPath = paths.promptMdRelative
  const resultPath = paths.expectedResultMdRelative
  return {
    codex: `codex exec --read ${promptPath} --out ${resultPath}`,
    claude: `claude --print < ${promptPath} > ${resultPath}`,
    cat: `cat ${promptPath} | pbcopy   # copy to clipboard, then paste into ChatGPT / Claude / Codex`,
  }
}
