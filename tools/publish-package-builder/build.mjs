import {copyFile, mkdir, readFile, readdir, writeFile} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')

const rawArgs = process.argv.slice(2)
const dryRun = rawArgs.includes('--dry-run')
const replacePlaceholderPackage = rawArgs.includes('--replace-placeholder-package')
const positionalArgs = rawArgs.filter((arg) => !arg.startsWith('--'))
const contentSlug = positionalArgs[0] || 'ai-blog-db'
const now = new Date().toISOString()

const replaceableTargetsByPlatform = {
  note: new Set(['article.md', 'checklist.md']),
  x: new Set(['posts.md', 'checklist.md']),
  substack: new Set(['post.md', 'checklist.md']),
  threads: new Set(['posts.md', 'checklist.md']),
  youtube: new Set(['script.md', 'checklist.md']),
  shorts: new Set(['script.md', 'checklist.md']),
  podcast: new Set(['script.md', 'checklist.md', 'show-notes.md']),
  instagram: new Set(),
  github: new Set(),
}

const packageConfigs = [
  {
    platform: 'note',
    draftSourceDir: 'outputs/note',
    draftTarget: 'article.md',
    imageDir: 'images',
    extraFiles: ['insert-map.md', 'checklist.md'],
  },
  {
    platform: 'x',
    draftSourceDir: 'outputs/x',
    draftTarget: 'posts.md',
    imageDir: 'images',
    extraFiles: ['checklist.md'],
  },
  {
    platform: 'substack',
    draftSourceDir: 'outputs/substack',
    draftTarget: 'post.md',
    imageDir: 'images',
    extraFiles: [
      'notes.md',
      'about-page.md',
      'welcome-email.md',
      'title-options.md',
      'social-preview-image.md',
      'subscribe-cta.md',
      'repurpose-map.md',
      'checklist.md',
    ],
  },
  {
    platform: 'threads',
    draftSourceDir: 'outputs/threads',
    draftTarget: 'posts.md',
    imageDir: 'images',
    extraFiles: ['checklist.md'],
  },
  {
    platform: 'instagram',
    draftSourceDir: null,
    draftTarget: 'caption.md',
    imageDir: 'slides',
    extraFiles: ['checklist.md'],
  },
  {
    platform: 'github',
    draftSourceDir: null,
    draftTarget: 'README-assets.md',
    imageDir: 'images',
    extraFiles: ['checklist.md'],
  },
  {
    platform: 'shorts',
    draftSourceDir: 'outputs/shorts',
    draftTarget: 'script.md',
    imageDir: 'clips',
    extraFiles: ['caption.md', 'checklist.md'],
  },
  {
    platform: 'podcast',
    draftSourceDir: 'outputs/podcast',
    draftTarget: 'script.md',
    imageDir: 'audio',
    extraFiles: ['show-notes.md', 'audio-todo.md', 'checklist.md'],
  },
  {
    platform: 'youtube',
    draftSourceDir: 'outputs/youtube',
    draftTarget: 'script.md',
    imageDir: 'thumbnail',
    extraFiles: ['slides/checklist.md', 'checklist.md'],
  },
]

function normalizeRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '')
}

function safeProjectPath(relativePath) {
  const normalized = normalizeRelativePath(relativePath)
  const absolute = path.resolve(projectRoot, normalized)
  const rootWithSeparator = projectRoot.endsWith(path.sep) ? projectRoot : `${projectRoot}${path.sep}`
  if (absolute !== projectRoot && !absolute.startsWith(rootWithSeparator)) {
    throw new Error(`Refusing to access outside project root: ${relativePath}`)
  }
  return {absolute, relative: path.relative(projectRoot, absolute).replace(/\\/g, '/')}
}

function contentSlugFromId(id) {
  return String(id || '').replace(/^contentIdea\./, '')
}

function visualPlanContentSlug(plan) {
  return contentSlugFromId(plan.sourceContentIdea?._ref || '')
}

async function readJsonIfExists(relativePath, fallback) {
  const target = safeProjectPath(relativePath)
  if (!existsSync(target.absolute)) return fallback
  return JSON.parse(await readFile(target.absolute, 'utf8'))
}

async function listJsonFiles(directory) {
  const target = safeProjectPath(directory)
  if (!existsSync(target.absolute)) return []
  const entries = await readdir(target.absolute, {withFileTypes: true})
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(target.absolute, entry.name)
      const relative = path.relative(projectRoot, absolute).replace(/\\/g, '/')
      if (entry.isDirectory()) return listJsonFiles(relative)
      if (entry.isFile() && entry.name.endsWith('.json')) return [relative]
      return []
    }),
  )
  return nested.flat().sort()
}

async function loadPatchMap() {
  const files = await listJsonFiles('patches/visual-assets')
  const patchMap = new Map()
  for (const file of files) {
    try {
      const patch = await readJsonIfExists(file, null)
      if (patch?._id) patchMap.set(patch._id, patch)
    } catch {
      // Invalid patch files are reported in the checklist instead of failing package creation.
    }
  }
  return patchMap
}

function imageTargetName(sourcePath, fallbackName) {
  const extension = path.extname(sourcePath) || '.png'
  const base = path.basename(sourcePath, extension) || fallbackName
  return `${base}${extension}`
}

function extractDraftStatus(content) {
  if (!content) return null
  const match = content.match(/^[ \t]*status[ \t]*:[ \t]*([\w-]+)/im)
  return match ? match[1].toLowerCase() : null
}

function isPlaceholderDraft(content) {
  if (!content) return false
  if (/(^|\n)[ \t]*status[ \t]*:[ \t]*draft-placeholder/i.test(content)) return true
  if (/(^|\n)#[^\n]*draft[ \t]*placeholder/i.test(content)) return true
  return false
}

async function resolveDraftPath(sourceDir, platform, slug) {
  if (!sourceDir) return null
  const target = safeProjectPath(sourceDir)
  if (!existsSync(target.absolute)) return null
  const entries = await readdir(target.absolute, {withFileTypes: true})
  const suffix = `--${slug}--${platform}.md`
  const matches = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
    .map((entry) => entry.name)
    .sort()
  if (matches.length === 0) return null
  const newest = matches[matches.length - 1]
  return path.posix.join(target.relative, newest)
}

async function writeIfAbsent(relativePath, content, written, skipped, options = {}) {
  const {allowReplace = false, replaced = null} = options
  const target = safeProjectPath(relativePath)
  const exists = existsSync(target.absolute)
  if (exists && !allowReplace) {
    skipped.push(target.relative)
    return false
  }
  if (!dryRun) {
    await mkdir(path.dirname(target.absolute), {recursive: true})
    await writeFile(target.absolute, content)
  }
  if (exists && allowReplace) {
    if (replaced) {
      replaced.push(target.relative)
    } else {
      written.push(target.relative)
    }
  } else {
    written.push(target.relative)
  }
  return true
}

async function copyIfAbsent(sourceRelativePath, targetRelativePath, copied, skipped, todos) {
  const source = safeProjectPath(sourceRelativePath)
  const target = safeProjectPath(targetRelativePath)
  if (!existsSync(source.absolute)) {
    todos.push(`TODO: source image missing: ${source.relative}`)
    return false
  }
  if (existsSync(target.absolute)) {
    skipped.push(target.relative)
    return false
  }
  if (!dryRun) {
    await mkdir(path.dirname(target.absolute), {recursive: true})
    await copyFile(source.absolute, target.absolute)
  }
  copied.push(target.relative)
  return true
}

function checklistFor(config, draftExists, visualItems, todos, placeholderInfo) {
  const substackItems = config.platform === 'substack'
    ? [
        '- [ ] title options reviewed',
        '- [ ] social preview image selected or TODO recorded',
        '- [ ] subscribe CTA placement checked',
        '- [ ] tags selected',
        '- [ ] comment setting checked',
        '- [ ] email/app delivery setting checked',
        '- [ ] scheduled time checked',
        '- [ ] cross-post promotion plan checked',
      ]
    : []
  const isPlaceholder = Boolean(placeholderInfo && placeholderInfo.isPlaceholder)
  const placeholderBanner = isPlaceholder
    ? [
        '## Draft Status',
        '',
        '- DRAFT STATUS: placeholder',
        `- Source: ${placeholderInfo.source || '(unknown)'}`,
        '- Do not publish until the placeholder draft is replaced with real text.',
        '',
      ]
    : []
  const lines = [
    `# ${config.platform} Publish Checklist`,
    '',
    `Content slug: ${contentSlug}`,
    `Generated at: ${now}`,
    '',
    ...placeholderBanner,
    '## Source Check',
    '',
    `- [${draftExists ? 'x' : ' '}] Draft file exists`,
    `- [${draftExists && !isPlaceholder ? 'x' : ' '}] Draft is a real draft (not a placeholder)`,
    `- [${visualItems.length > 0 ? 'x' : ' '}] Visual assets mapped`,
    ...substackItems,
    '- [ ] Human reviewed final wording',
    '- [ ] Human reviewed visual placement',
    '- [ ] Manual publish/post only',
    '',
    '## TODO',
    '',
    ...(todos.length > 0 ? todos.map((todo) => `- [ ] ${todo.replace(/^TODO: /, '')}`) : ['- [ ] Final human review before publishing']),
    '',
    '## Safety',
    '',
    '- No direct Sanity write',
    '- No platform API call',
    '- No auto-posting',
  ]
  return `${lines.join('\n')}\n`
}

function packageExtraContent(config, extraFile, draftExists, visualItems, todos, placeholderInfo) {
  if (extraFile === 'insert-map.md') return insertMapFor(config, visualItems)
  if (extraFile === 'checklist.md' || extraFile.endsWith('/checklist.md')) {
    return checklistFor(config, draftExists, visualItems, todos, placeholderInfo)
  }
  if (config.platform === 'substack' && extraFile === 'notes.md') {
    return [
      '# Substack Notes Drafts',
      '',
      'Substack内の発見・交流用に使う短文案です。Post本文をそのまま貼るのではなく、読者との会話が始まる形へ短くします。',
      '',
      '## TODO',
      '',
      '- [ ] Postの中心主張を1文にする',
      '- [ ] 読者に聞きたい問いを1つ作る',
      '- [ ] X/noteへの誘導ではなく、Substack内の会話を優先する',
    ].join('\n') + '\n'
  }
  if (config.platform === 'substack' && extraFile === 'title-options.md') {
    return [
      '# Substack Title Options',
      '',
      '- TODO: 信頼形成寄りのタイトル',
      '- TODO: 制作ログ寄りのタイトル',
      '- TODO: 読者の悩み寄りのタイトル',
      '',
      'Avoid:',
      '',
      '- 過度な煽り',
      '- 根拠のない数字',
      '- 元レコードにない約束',
    ].join('\n') + '\n'
  }
  if (config.platform === 'substack' && extraFile === 'about-page.md') {
    return [
      '# Substack About Page',
      '',
      'TODO: publicationのtarget reader、core topics、subscribeする理由を短くまとめる。',
      '',
      '## Checklist',
      '',
      '- [ ] 誰のためのpublicationか分かる',
      '- [ ] 何が届くか分かる',
      '- [ ] X/note/Substackの役割が混ざっていない',
      '- [ ] paidへの誘導を急いでいない',
    ].join('\n') + '\n'
  }
  if (config.platform === 'substack' && extraFile === 'welcome-email.md') {
    return [
      '# Substack Welcome Email',
      '',
      'TODO: 新規subscriberへ送る短いwelcome emailを書く。',
      '',
      '## Checklist',
      '',
      '- [ ] 登録へのお礼がある',
      '- [ ] 今後届く内容が分かる',
      '- [ ] 返信したくなる問いがある',
      '- [ ] 過度な販売感がない',
    ].join('\n') + '\n'
  }
  if (config.platform === 'substack' && extraFile === 'social-preview-image.md') {
    return [
      '# Social Preview Image',
      '',
      'TODO: Substack Postのsocial preview imageを選ぶ。',
      '',
      '## Candidate Sources',
      '',
      '- Visual Registerで保存済みの画像',
      '- note hero / eye-catchの派生',
      '- Substack専用の簡潔なアイキャッチ',
      '',
      '## Checklist',
      '',
      '- [ ] 文字が小さすぎない',
      '- [ ] Postタイトルと矛盾しない',
      '- [ ] 過度な煽りがない',
    ].join('\n') + '\n'
  }
  if (config.platform === 'substack' && extraFile === 'subscribe-cta.md') {
    return [
      '# Subscribe CTA',
      '',
      '## Soft CTA',
      '',
      'TODO: このテーマの続きや制作過程を読みたい人に向けた、自然な購読案内を書く。',
      '',
      '## Placement',
      '',
      '- [ ] Post冒頭には置きすぎない',
      '- [ ] 本文末尾に自然に置く',
      '- [ ] 必要ならAbout/Welcome Emailへの導線を確認する',
    ].join('\n') + '\n'
  }
  if (config.platform === 'substack' && extraFile === 'repurpose-map.md') {
    return [
      '# Substack Repurpose Map',
      '',
      '- X: discovery用の短い主張へ分解する',
      '- Threads: 会話調の連投へ変換する',
      '- note: 日本語検索/アーカイブ向けに論考化する',
      '- Substack Notes: 読者との対話の入口にする',
      '- Substack Post: 信頼形成とemail配信の中心にする',
    ].join('\n') + '\n'
  }
  if (config.platform === 'shorts' && extraFile === 'caption.md') {
    return [
      '# Shorts Caption',
      '',
      'TODO: Shorts用の短いcaptionを書く。',
      '',
      '- [ ] 冒頭1行で内容が分かる',
      '- [ ] 元レコードにない断言を足していない',
      '- [ ] 関連するlong-form / Substack / noteへの導線を確認する',
    ].join('\n') + '\n'
  }
  if (config.platform === 'podcast' && extraFile === 'show-notes.md') {
    return [
      '# Podcast Show Notes',
      '',
      'TODO: Podcast公開前のshow notesを書く。',
      '',
      '- [ ] 今回のテーマ',
      '- [ ] 話した主張',
      '- [ ] 関連リンク',
      '- [ ] 次に聞いてほしい回',
    ].join('\n') + '\n'
  }
  if (config.platform === 'podcast' && extraFile === 'audio-todo.md') {
    return [
      '# Audio TODO',
      '',
      '- [ ] human-recorded / ai-clone / tts / podcast-import のどれで作るか決める',
      '- [ ] 音声ファイルの保存先を決める',
      '- [ ] ノイズ確認',
      '- [ ] 公開前の人間レビュー',
      '',
      'No audio file is generated by this builder.',
    ].join('\n') + '\n'
  }
  return `# TODO: ${extraFile}\n\nManual review required before publishing.\n`
}

function insertMapFor(config, visualItems) {
  const lines = [
    `# ${config.platform} Insert Map`,
    '',
    'どの画像をどこに置くかを、人間が公開前に確認します。',
    '',
  ]
  if (visualItems.length === 0) {
    lines.push('- TODO: このplatform向けの画像がまだありません。')
  } else {
    for (const item of visualItems) {
      lines.push(`- ${item.title || item._id}`)
      lines.push(`  - placement: ${item.placement || '-'}`)
      lines.push(`  - package path: ${item.packageImagePath || 'TODO'}`)
      lines.push(`  - source path: ${item.localAssetPath || item.expectedLocalAssetPath || 'TODO'}`)
    }
  }
  return `${lines.join('\n')}\n`
}

async function buildPackage(config, visualPlans, patchMap) {
  const baseDir = `publish-packages/${config.platform}/${contentSlug}`
  const written = []
  const skipped = []
  const copied = []
  const todos = []
  const warnings = []
  const replaced = []
  const replacementCandidates = []
  const replacementSkipped = []
  const replacementWarnings = []
  const draftRelativePath = await resolveDraftPath(config.draftSourceDir, config.platform, contentSlug)
  const draft = draftRelativePath ? safeProjectPath(draftRelativePath) : null
  const draftExists = Boolean(draft && existsSync(draft.absolute))
  let draftContent = null
  let draftIsPlaceholder = false
  let draftStatus = null
  if (draftExists) {
    draftContent = await readFile(draft.absolute, 'utf8')
    draftIsPlaceholder = isPlaceholderDraft(draftContent)
    draftStatus = extractDraftStatus(draftContent)
  }
  const placeholderInfo = {
    isPlaceholder: draftIsPlaceholder,
    status: draftStatus,
    source: draftRelativePath,
  }
  if (!config.draftSourceDir) {
    warnings.push(`No draft source dir configured for platform=${config.platform}. Drafts are not pulled from outputs/.`)
  } else if (!draftExists) {
    warnings.push(`No draft matched ${config.draftSourceDir}/*--${contentSlug}--${config.platform}.md`)
  } else if (draftIsPlaceholder) {
    warnings.push(`Placeholder draft detected at ${draftRelativePath}. Do not publish until replaced.`)
    todos.push(`TODO: Replace placeholder draft before publishing. Source: ${draftRelativePath}`)
  }
  const allowlist = replaceableTargetsByPlatform[config.platform] || new Set()
  const canReplaceAny = replacePlaceholderPackage && draftExists && !draftIsPlaceholder
  if (replacePlaceholderPackage) {
    if (!draftExists) {
      replacementWarnings.push(`Skipped replacement for ${config.platform}: no draft source.`)
    } else if (draftIsPlaceholder) {
      replacementWarnings.push(`Skipped replacement for ${config.platform}: source draft is still placeholder.`)
    } else if (allowlist.size === 0) {
      replacementWarnings.push(`Skipped replacement for ${config.platform}: no replaceable target files configured.`)
    }
  }
  const visualItems = []

  const platformPlans = visualPlans.filter(
    (plan) => visualPlanContentSlug(plan) === contentSlug && plan.targetPlatform === config.platform,
  )

  for (const plan of platformPlans) {
    const patch = patchMap.get(plan._id)
    const localAssetPath = patch?.set?.localAssetPath || plan.localAssetPath || ''
    const sourcePath = localAssetPath || plan.expectedLocalAssetPath || ''
    const imageName = imageTargetName(sourcePath, plan._id)
    const targetPath = `${baseDir}/${config.imageDir}/${imageName}`
    const item = {
      ...plan,
      localAssetPath,
      packageImagePath: targetPath,
    }
    visualItems.push(item)
    if (sourcePath) {
      await copyIfAbsent(sourcePath, targetPath, copied, skipped, todos)
    } else {
      todos.push(`TODO: ${plan._id} has no localAssetPath yet.`)
    }
  }

  await writeIfAbsent(
    `${baseDir}/README.md`,
    [
      `# ${config.platform} publish package: ${contentSlug}`,
      '',
      'このfolderは、手動公開前に必要な下書き、画像、確認項目をまとめるためのローカルpublish packageです。',
      '',
      `Generated at: ${now}`,
      '',
      '## Contents',
      '',
      `- ${config.draftTarget}`,
      `- ${config.imageDir}/`,
      '- checklist.md',
      '',
      '## Safety',
      '',
      '- No auto-posting',
      '- No platform API calls',
      '- Human review required before publishing',
    ].join('\n') + '\n',
    written,
    skipped,
  )

  const draftTargetAllowsReplace = canReplaceAny && allowlist.has(config.draftTarget)
  if (draftTargetAllowsReplace) {
    replacementCandidates.push(`${baseDir}/${config.draftTarget}`)
  } else if (replacePlaceholderPackage && allowlist.has(config.draftTarget)) {
    replacementSkipped.push(`${baseDir}/${config.draftTarget}`)
  }
  if (draftExists) {
    await writeIfAbsent(`${baseDir}/${config.draftTarget}`, draftContent, written, skipped, {
      allowReplace: draftTargetAllowsReplace,
      replaced,
    })
  } else {
    const missingDescription = config.draftSourceDir
      ? `no file matched ${config.draftSourceDir}/*--${contentSlug}--${config.platform}.md`
      : `no draft source dir configured for ${config.platform}`
    todos.push(`TODO: draft missing for slug=${contentSlug} platform=${config.platform} (${missingDescription})`)
    await writeIfAbsent(
      `${baseDir}/${config.draftTarget}`,
      `# TODO: ${config.platform} draft\n\nSource draft is not available yet for slug "${contentSlug}".\n`,
      written,
      skipped,
    )
  }

  for (const extraFile of config.extraFiles) {
    const target = `${baseDir}/${extraFile}`
    const content = packageExtraContent(config, extraFile, draftExists, visualItems, todos, placeholderInfo)
    const extraAllowsReplace = canReplaceAny && allowlist.has(extraFile)
    if (extraAllowsReplace) {
      replacementCandidates.push(target)
    } else if (replacePlaceholderPackage && allowlist.has(extraFile)) {
      replacementSkipped.push(target)
    }
    await writeIfAbsent(target, content, written, skipped, {
      allowReplace: extraAllowsReplace,
      replaced,
    })
  }

  return {
    platform: config.platform,
    packageDir: baseDir,
    draftSource: draftRelativePath,
    draftExists,
    draftIsPlaceholder,
    draftStatus,
    visualCount: visualItems.length,
    copied,
    written,
    skipped,
    replaced,
    replacementCandidates,
    replacementSkipped,
    replacementWarnings,
    todos,
    warnings,
  }
}

async function main() {
  const baseVisualPlans = await readJsonIfExists('seed/visual-asset-plan-records.json', [])
  const campaignVisualPlans = await readJsonIfExists(
    `seed/visual-asset-plan-records-${contentSlug}.json`,
    [],
  )
  const visualPlans = [...baseVisualPlans, ...campaignVisualPlans]
  const patchMap = await loadPatchMap()
  const results = []
  for (const config of packageConfigs) {
    results.push(await buildPackage(config, visualPlans, patchMap))
  }

  const behavior = dryRun
    ? 'dry-run-no-writes'
    : replacePlaceholderPackage
    ? 'replace-placeholder-package-opt-in'
    : 'safe-skip-existing-files'

  console.log(JSON.stringify({
    ok: true,
    contentSlug,
    generatedAt: now,
    dryRun,
    replacePlaceholderPackage,
    behavior,
    results,
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
