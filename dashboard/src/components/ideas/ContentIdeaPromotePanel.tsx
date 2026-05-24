'use client'

// Phase 2C-1 — Content Idea promote helper panel.
//
// Triggers `prepareContentIdeaFromResult({mode: 'preview'})` for the
// selected idea-job, then surfaces:
//   - Controlled createContentIdea action (preview + execute)
//   - Studio fallback links
//   - Field-by-field clipboard buttons (title / coreThesis / audience /
//     audiencePain / claims / objections / examples / platformAngles /
//     rawInput / personalContext)
//   - "Content Idea 用 JSON をコピー" full blob button
//   - Per-field warnings (schema mismatch, alias remap, etc.)
//   - Reminder card: create only writes schema-aligned contentIdea fields

import {useCallback, useEffect, useState, useTransition} from 'react'
import {ExternalLink, AlertTriangle} from 'lucide-react'
import {
  prepareContentIdeaFromResult,
  type PrepareContentIdeaResult,
} from '@/lib/actions/prepareContentIdeaFromResult'
import {
  createContentIdeaFromResult,
  type CreateContentIdeaResult,
} from '@/lib/actions/createContentIdeaFromResult'
import type {
  ContentIdeaPlatformAngle,
  ContentIdeaClaim,
  ContentIdeaEvidence,
  ContentIdeaObjection,
  ContentIdeaExample,
  SchemaChecklistItem,
  StudioField,
} from '@/lib/ideaJobs/contentIdeaMapper'
import {CopyButton} from '@/components/CopyButton'
import {
  NextActionCard,
  WorkflowBadge,
} from '@/components/common/WorkflowGuide'

interface Props {
  ideaSlug: string
  timestamp: string
}

type ReadySuccess = Extract<PrepareContentIdeaResult, {ok: true; mode: 'preview'}>
type ReadyError = Extract<PrepareContentIdeaResult, {ok: false}>
type CreatePreviewSuccess = Extract<CreateContentIdeaResult, {ok: true; mode: 'preview'}>
type CreateExecuteSuccess = Extract<CreateContentIdeaResult, {ok: true; mode: 'execute'}>
type CreateError = Extract<CreateContentIdeaResult, {ok: false}>

function errorMessage(result: ReadyError): string {
  switch (result.error) {
    case 'validation':
      return `入力エラー: ${result.message}`
    case 'localfs-disabled':
      return 'ENABLE_LOCAL_FS_ROUTES が off です。 .env.local で有効化してください。'
    case 'path-rejected':
      return `path 検査で reject されました: ${result.message}`
    case 'not-found':
      return `ファイルが見つかりません: ${result.message}`
    case 'parse-error':
      return `JSON parse に失敗しました: ${result.message}`
    case 'too-large':
      return `ファイルサイズが上限を超えています: ${result.message}`
    case 'unknown':
    default:
      return `予期しないエラー: ${result.message}`
  }
}

function createErrorMessage(result: CreateError): string {
  switch (result.error) {
    case 'validation':
      return result.missingRequiredFields && result.missingRequiredFields.length > 0
        ? `必須fieldが不足しています: ${result.missingRequiredFields.join(', ')}`
        : `入力エラー: ${result.message}`
    case 'write-disabled':
      return 'ENABLE_WRITE_ACTIONS が off です。作成は無効です。'
    case 'missing-token':
      return 'SANITY_WRITE_TOKEN がありません。作成は無効です。'
    case 'localfs-disabled':
      return 'ENABLE_LOCAL_FS_ROUTES が off です。idea-jobs を読めません。'
    case 'path-rejected':
      return `path 検査で reject されました: ${result.message}`
    case 'not-found':
      return `ファイルまたは対象が見つかりません: ${result.message}`
    case 'parse-error':
      return `JSON parse に失敗しました: ${result.message}`
    case 'too-large':
      return `ファイルサイズが上限を超えています: ${result.message}`
    case 'duplicate-found':
      return '同じ slug の Content Idea が既にあります。'
    case 'permission':
      return 'Sanity token に create 権限がありません。'
    case 'unknown':
    default:
      return `予期しないエラー: ${result.message}`
  }
}

const FIELD_LABEL: Record<StudioField, string> = {
  title: 'title',
  slug: 'slug.current',
  status: 'status',
  summary: 'summary',
  rawInput: 'rawInput',
  coreThesis: 'coreThesis',
  audience: 'audience',
  audiencePain: 'audiencePain',
  contentPillars: 'contentPillars',
  claims: 'claims',
  evidence: 'evidence',
  objections: 'objections',
  examples: 'examples',
  platformAngles: 'platformAngles',
  tone: 'tone',
  voice: 'tone.voice',
  sourceLinks: 'sourceLinks',
  outputChecklist: 'outputChecklist',
  personalContext: 'personalContext',
}

const FIELD_TONE: Record<StudioField, string> = {
  title: '記事タイトル',
  slug: 'URL slug (lowercase、 ascii、 - 区切り、 max 80)',
  status: 'schema enum: idea / researched / drafted / reviewed / archived',
  summary: '要約 (240字目安、 boss が調整推奨)',
  rawInput: '元メモ (Phase 2C-0 raw + 必要なら追記)',
  coreThesis: '中心主張',
  audience: '想定読者 (改行区切り)',
  audiencePain: '読者の悩み',
  contentPillars: 'content pillars (改行区切り)',
  claims: '主張リスト (schema item JSON)',
  evidence: '根拠メモ (JSON)',
  objections: '反論 (JSON)',
  examples: '具体例 (JSON)',
  platformAngles: '媒体別の切り口 (schema item JSON)',
  tone: 'tone object (voice required)',
  voice: 'schema required。暫定値あり、Studioで編集推奨',
  sourceLinks: 'source links (JSON)',
  outputChecklist: 'output checklist (JSON)',
  personalContext: '個人的背景 / extended notes',
}

const SLUG_SOURCE_LABEL: Record<string, string> = {
  proposedTitle: 'AI 提案タイトル (proposedTitle) から生成',
  rawTitle: '元メモのタイトル (rawTitle) から生成',
  ideaSlug: 'Phase 2C-0 で生成済の ideaSlug を流用 (CJK title fallback)',
  fallback: 'sentinel (content-idea-<timestamp>) — Studio で必ず書き換えてください',
}

export function ContentIdeaPromotePanel({ideaSlug, timestamp}: Props) {
  const [result, setResult] = useState<ReadySuccess | null>(null)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const loadPreview = useCallback(() => {
    setErrorText(null)
    startTransition(async () => {
      const res = await prepareContentIdeaFromResult({
        ideaSlug,
        timestamp,
        mode: 'preview',
      })
      if (res.ok && res.mode === 'preview') {
        setResult(res)
      } else if (!res.ok) {
        setResult(null)
        setErrorText(errorMessage(res))
      }
    })
  }, [ideaSlug, timestamp])

  useEffect(() => {
    loadPreview()
  }, [loadPreview])

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-blue-900">
            Step 0-4 Content IdeaとしてSanityに作成: <code>{ideaSlug}</code> / <code>{timestamp}</code>
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            Dashboard は controlled write action で <strong>Content Idea を作成できます</strong>。
            実行前に必須fieldとプレビューを確認します。
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <WorkflowBadge label="保存先: Sanity" tone="emerald" />
            <WorkflowBadge label="AI実行: なし" tone="slate" />
            <WorkflowBadge label="プレビュー必須" tone="amber" />
          </div>
        </div>
        <button
          type="button"
          onClick={loadPreview}
          disabled={isPending}
          className="shrink-0 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          再読み込み
        </button>
      </div>

      {isPending && !result && (
        <p className="mt-3 text-xs text-slate-500">読み込み中…</p>
      )}

      {errorText && (
        <div
          role="alert"
          className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {errorText}
        </div>
      )}

      {result && <PromoteBody result={result} />}
    </div>
  )
}

function PromoteBody({result}: {result: ReadySuccess}) {
  const {mapped, studioLinks} = result
  const slugSourceText = SLUG_SOURCE_LABEL[mapped.slugSource] ?? mapped.slugSource
  return (
    <div className="mt-3 space-y-4">
      <CreateContentIdeaCard
        ideaSlug={result.ideaSlug}
        timestamp={result.timestamp}
        schemaChecklist={mapped.schemaChecklist}
      />

      <div className="rounded-md border border-blue-200 bg-white p-3 text-xs text-slate-700">
          <p className="text-sm font-semibold text-slate-900">Fallback: Sanity Studio で Content Idea を手動作成</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            下の「Studio を開く」ボタンで Studio を開きます。
          </li>
          <li>
            左ペインの <strong>Content Ideas</strong> を選びます。
          </li>
          <li>
            <strong>New / Create / ＋</strong> ボタンから新規 Content Idea を作ります。
          </li>
          <li>
            下の <strong>field別コピー</strong> ボタンで各fieldを順に貼り付けます。
          </li>
          <li>
            必要なら <strong>full JSON</strong> を参照します。Studio document form への full JSON paste は
            サポートされないため、通常は上の自動作成を使います。
          </li>
        </ol>
        <div className="mt-3 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
          <p className="font-semibold">
            <AlertTriangle size={11} aria-hidden="true" className="-mt-0.5 mr-1 inline" />
            Dashboard自動作成が使えない場合のfallbackです。
          </p>
          <p className="mt-0.5">
            Phase 2C-1B では controlled Sanity create を主動線にします。手動pasteは確認・復旧用に残します。
          </p>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold text-slate-900">Studio handoff リンク</p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          <code>/structure</code> で右ペインが空に見えることがありますが、これは正常です。
          左ペインで <strong>Content Ideas</strong> を選び、 <strong>New / Create / ＋</strong>
          から新規作成して field-by-field copy を使ってください。
        </p>
        <div className="mt-2 flex flex-col gap-1.5">
          <StudioLinkRow link={studioLinks.primary} primary />
          <StudioLinkRow link={studioLinks.byType} />
          <StudioLinkRow link={studioLinks.intentExperimental} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <CopyButton
            text={mapped.studioDraftJsonText}
            label="Studio用JSONをコピー"
            tone="primary"
          />
          <CopyButton
            text={mapped.copyableJsonText}
            label="完全JSONをコピー"
          />
          <span className="text-[11px] text-slate-500">
            {result.metrics.fieldClipboardCount} fields / {result.metrics.copyableJsonBytes} bytes
          </span>
        </div>
      </div>

      <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-900">
            slug.current
          </code>
          <code className="font-mono text-[12px] text-slate-900">
            {mapped.studioDraft.slug.current}
          </code>
          <CopyButton text={mapped.studioDraft.slug.current} label="slug.current をコピー" />
        </div>
        <p className="mt-1 text-[11px] text-slate-600">
          source: <strong>{slugSourceText}</strong>
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          この slug は将来 campaignSlug / generation paths / platform outputs / publish-package paths を
          1 本に揃えるための共通 identifier として使います。 Studio で別の slug にする場合は他の場所も
          手動で揃えてください。
        </p>
      </div>

      <SchemaChecklistCard items={mapped.schemaChecklist} />

      {mapped.warnings.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <p className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle size={12} aria-hidden="true" />
            全体の注意
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {mapped.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-md border border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold text-slate-900">field-by-field clipboard</p>
        <div className="mt-2 space-y-3">
          <FieldRow
            field="title"
            preview={mapped.studioDraft.title || '(空)'}
            warnings={mapped.fieldWarnings.title}
            clipboard={mapped.fieldClipboards.title}
          />
          <FieldRow
            field="slug"
            preview={mapped.studioDraft.slug.current}
            warnings={mapped.fieldWarnings.slug}
            clipboard={mapped.fieldClipboards.slug}
          />
          <FieldRow
            field="status"
            preview={mapped.studioDraft.status}
            warnings={mapped.fieldWarnings.status}
            clipboard={mapped.fieldClipboards.status}
          />
          <FieldRow
            field="summary"
            preview={mapped.studioDraft.summary || '(空)'}
            warnings={mapped.fieldWarnings.summary}
            clipboard={mapped.fieldClipboards.summary}
          />
          <FieldRow
            field="rawInput"
            preview={
              mapped.studioDraft.rawInput
                ? truncate(mapped.studioDraft.rawInput, 140)
                : '(空)'
            }
            warnings={mapped.fieldWarnings.rawInput}
            clipboard={mapped.fieldClipboards.rawInput}
          />
          <FieldRow
            field="coreThesis"
            preview={mapped.studioDraft.coreThesis || '(空)'}
            warnings={mapped.fieldWarnings.coreThesis}
            clipboard={mapped.fieldClipboards.coreThesis}
          />
          <FieldRow
            field="audience"
            preview={
              mapped.studioDraft.audience.length > 0
                ? mapped.studioDraft.audience.join(' / ')
                : '(空)'
            }
            warnings={mapped.fieldWarnings.audience}
            clipboard={mapped.fieldClipboards.audience}
          />
          <FieldRow
            field="audiencePain"
            preview={mapped.studioDraft.audiencePain || '(空)'}
            warnings={mapped.fieldWarnings.audiencePain}
            clipboard={mapped.fieldClipboards.audiencePain}
          />
          <FieldListRow
            field="contentPillars"
            items={mapped.studioDraft.contentPillars}
            warnings={mapped.fieldWarnings.contentPillars}
            clipboard={mapped.fieldClipboards.contentPillars}
          />
          <FieldListRow
            field="claims"
            items={mapped.studioDraft.claims.map((c: ContentIdeaClaim) => c.claim)}
            warnings={mapped.fieldWarnings.claims}
            clipboard={mapped.fieldClipboards.claims}
          />
          <FieldListRow
            field="evidence"
            items={mapped.studioDraft.evidence.map(
              (e: ContentIdeaEvidence) => e.description ?? e.notes ?? e.type ?? '(empty evidence)',
            )}
            warnings={mapped.fieldWarnings.evidence}
            clipboard={mapped.fieldClipboards.evidence}
          />
          <FieldListRow
            field="objections"
            items={mapped.studioDraft.objections.map((o: ContentIdeaObjection) => o.objection)}
            warnings={mapped.fieldWarnings.objections}
            clipboard={mapped.fieldClipboards.objections}
          />
          <FieldListRow
            field="examples"
            items={mapped.studioDraft.examples.map((e: ContentIdeaExample) => e.title)}
            warnings={mapped.fieldWarnings.examples}
            clipboard={mapped.fieldClipboards.examples}
          />
          <FieldListRow
            field="platformAngles"
            items={mapped.studioDraft.platformAngles.map(
              (p: ContentIdeaPlatformAngle) =>
                `${p.platform}${p.hook ? `: ${p.hook}` : ''}`,
            )}
            warnings={mapped.fieldWarnings.platformAngles}
            clipboard={mapped.fieldClipboards.platformAngles}
          />
          <FieldRow
            field="tone"
            preview={mapped.studioDraft.tone.voice}
            warnings={mapped.fieldWarnings.tone}
            clipboard={mapped.fieldClipboards.tone}
          />
          <FieldRow
            field="voice"
            preview={mapped.studioDraft.tone.voice}
            warnings={mapped.fieldWarnings.voice}
            clipboard={mapped.fieldClipboards.voice}
          />
          {mapped.fieldClipboards.sourceLinks && (
            <FieldListRow
              field="sourceLinks"
              items={mapped.studioDraft.sourceLinks.map((s) => s.title ?? s.reference ?? s.type ?? '(empty source)')}
              warnings={mapped.fieldWarnings.sourceLinks}
              clipboard={mapped.fieldClipboards.sourceLinks}
            />
          )}
          {mapped.fieldClipboards.outputChecklist && (
            <FieldListRow
              field="outputChecklist"
              items={mapped.studioDraft.outputChecklist.map((o) => o.outputType ?? o.status ?? '(empty output)')}
              warnings={mapped.fieldWarnings.outputChecklist}
              clipboard={mapped.fieldClipboards.outputChecklist}
            />
          )}
          <FieldRow
            field="personalContext"
            preview={
              mapped.studioDraft.personalContext
                ? truncate(mapped.studioDraft.personalContext, 140)
                : '(空)'
            }
            warnings={mapped.fieldWarnings.personalContext}
            clipboard={mapped.fieldClipboards.personalContext}
          />
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">controlled create の境界</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>
            Phase 2C-1B の create action は <code>contentIdea</code> だけを新規作成します。
            <code>campaignPlan</code> / <code>platformOutput</code> / <code>publishedOutput</code> は作りません。
          </li>
          <li>
            実行には <code>ENABLE_WRITE_ACTIONS</code> と <code>SANITY_WRITE_TOKEN</code> が必要です。
            production write は disabled のままです。
          </li>
          <li>
            <code>provenance</code> 情報 (source = idea-jobs / ideaSlug / timestamp / resultJsonPath) は
            full enriched JSON にだけ含まれます。schema field ではないため、Sanity create payload には書き込みません。
          </li>
        </ul>
      </div>

      <details className="rounded-md border border-slate-200 bg-white p-3">
        <summary className="cursor-pointer text-xs font-semibold text-slate-700">
          Source ファイル (read-only metadata)
        </summary>
        <dl className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-slate-700 md:grid-cols-2">
          <SourceRow label="result.json" value={result.resultJsonPath} />
          <SourceRow label="result.md" value={result.resultMdPath} />
          <SourceRow
            label="_raw.json"
            value={result.rawIdeaAvailable ? result.rawJsonPath : '(なし)'}
          />
          <SourceRow
            label="Studio base URL"
            value={result.studioBaseUrl}
          />
          <SourceRow
            label="result.json bytes"
            value={`${result.metrics.resultJsonBytes}`}
          />
          <SourceRow
            label="copyable JSON bytes"
            value={`${result.metrics.copyableJsonBytes}`}
          />
        </dl>
      </details>
    </div>
  )
}

function CreateContentIdeaCard({
  ideaSlug,
  timestamp,
  schemaChecklist,
}: {
  ideaSlug: string
  timestamp: string
  schemaChecklist: SchemaChecklistItem[]
}) {
  const [preview, setPreview] = useState<CreatePreviewSuccess | null>(null)
  const [created, setCreated] = useState<CreateExecuteSuccess | null>(null)
  const [error, setError] = useState<CreateError | null>(null)
  const [isPending, startTransition] = useTransition()
  const missingCount = schemaChecklist.filter((item) => item.state === 'missing').length

  const runPreview = useCallback(() => {
    setError(null)
    setCreated(null)
    startTransition(async () => {
      const res = await createContentIdeaFromResult({ideaSlug, timestamp, mode: 'preview'})
      if (res.ok && res.mode === 'preview') {
        setPreview(res)
      } else if (!res.ok) {
        setPreview(null)
        setError(res)
      }
    })
  }, [ideaSlug, timestamp])

  const runExecute = useCallback(() => {
    setError(null)
    setCreated(null)
    startTransition(async () => {
      const res = await createContentIdeaFromResult({ideaSlug, timestamp, mode: 'execute'})
      if (res.ok && res.mode === 'execute') {
        setCreated(res)
        setPreview(null)
      } else if (!res.ok) {
        setError(res)
      }
    })
  }, [ideaSlug, timestamp])

  const duplicate = preview?.duplicate
  const createDisabled =
    isPending ||
    missingCount > 0 ||
    !preview ||
    !preview.writeReady ||
    Boolean(duplicate?.found)

  return (
    <div className="rounded-md border border-emerald-300 bg-emerald-50/60 p-3 text-xs text-slate-700">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-emerald-950">Content IdeaをSanityに作成</p>
          <p className="mt-1 text-[11px] text-emerald-900">
            schema-aligned <code>studioDraft</code> だけを使い、1件の <code>contentIdea</code> を作成します。
            campaignPlan / platformOutput は作りません。
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <WorkflowBadge label="保存先: Sanity" tone="emerald" />
            <WorkflowBadge label="プレビュー後に作成" tone="amber" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runPreview}
            disabled={isPending || missingCount > 0}
            className="rounded-md border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            作成内容をプレビュー
          </button>
          <button
            type="button"
            onClick={runExecute}
            disabled={createDisabled}
            className="rounded-md bg-emerald-700 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Content Ideaを作成
          </button>
        </div>
      </div>

      {missingCount > 0 && (
        <p className="mt-2 rounded border border-rose-200 bg-rose-50 px-2 py-1.5 text-[11px] text-rose-700">
          schema checklist に missing があるため、create は実行できません。
        </p>
      )}

      {isPending && (
        <p className="mt-2 text-[11px] text-emerald-800">Sanity create action を確認中…</p>
      )}

      {preview && (
        <div className="mt-3 rounded border border-emerald-200 bg-white p-2">
          <p className="font-semibold text-slate-900">作成プレビュー</p>
          <dl className="mt-1 grid grid-cols-1 gap-1 text-[11px] md:grid-cols-2">
            <SourceRow label="planned document id" value={preview.plannedDocumentId} />
            <SourceRow label="slug.current" value={preview.slugCurrent} />
            <SourceRow
              label="required readiness"
              value={
                preview.missingRequiredFields.length === 0
                  ? `ready (${preview.manualEditFields.length} manual-edit advisory)`
                  : `missing: ${preview.missingRequiredFields.join(', ')}`
              }
            />
            <SourceRow
              label="write readiness"
              value={preview.writeReady ? 'ready' : preview.writeDisabledReason ?? 'disabled'}
            />
          </dl>
          <PreviewSchemaSummary preview={preview} />
          {preview.duplicate.found ? (
            <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
              <p className="font-semibold">同じ slug の Content Idea が既にあります。</p>
              {preview.duplicate.existingStudioUrl && (
                <a
                  href={preview.duplicate.existingStudioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 font-medium text-amber-900 underline"
                >
                  既存 doc を Studio で開く
                  <ExternalLink size={11} aria-hidden="true" />
                </a>
              )}
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-emerald-700">
              duplicate は見つかっていません。write readiness が ready なら作成できます。
            </p>
          )}
        </div>
      )}

      {created && (
        <div className="mt-3 rounded border border-emerald-300 bg-white p-2 text-[11px] text-emerald-900">
          <p className="font-semibold">Content Idea を作成しました。</p>
          <dl className="mt-1 grid grid-cols-1 gap-1 md:grid-cols-2">
            <SourceRow label="document id" value={created.documentId} />
            <SourceRow label="slug.current" value={created.slugCurrent} />
            <SourceRow label="verified" value={created.verified ? 'true' : 'false'} />
            <SourceRow label="createdAt" value={created.createdAt ?? '(unknown)'} />
          </dl>
          <a
            href={created.studioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-800"
          >
            Studio で作成済み doc を開く
            <ExternalLink size={11} aria-hidden="true" />
          </a>
          <div className="mt-3">
            <NextActionCard
              tone="emerald"
              items={[
                '/configuratorへ進む',
                '作成したContent Ideaを選ぶ',
                '生成プロンプトパッケージを作る',
              ]}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded border border-rose-200 bg-rose-50 px-2 py-1.5 text-[11px] text-rose-700">
          <p className="font-semibold">{createErrorMessage(error)}</p>
          {error.error === 'duplicate-found' && error.existingStudioUrl && (
            <a
              href={error.existingStudioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 font-medium text-rose-800 underline"
            >
              既存 doc を Studio で開く
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function PreviewSchemaSummary({preview}: {preview: CreatePreviewSuccess}) {
  const draft = preview.studioDraft
  const summaryReady = draft.summary.trim().length > 0
  const coreThesisReady = draft.coreThesis.trim().length > 0
  const requiredReady =
    preview.missingRequiredFields.length === 0
      ? 'ready'
      : `missing: ${preview.missingRequiredFields.join(', ')}`
  return (
    <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2">
      <p className="text-[11px] font-semibold text-slate-900">schema summary</p>
      <dl className="mt-1 grid grid-cols-1 gap-1 text-[11px] md:grid-cols-2">
        <SourceRow label="title" value={truncate(draft.title || '(missing)', 72)} />
        <SourceRow label="status" value={draft.status} />
        <SourceRow label="summary" value={summaryReady ? 'ready' : 'missing'} />
        <SourceRow label="coreThesis" value={coreThesisReady ? 'ready' : 'missing'} />
        <SourceRow label="claims" value={`${draft.claims.length}`} />
        <SourceRow label="platformAngles" value={`${draft.platformAngles.length}`} />
        <SourceRow label="audience" value={`${draft.audience.length}`} />
        <SourceRow label="tone.voice" value={truncate(draft.tone.voice || '(missing)', 72)} />
        <SourceRow label="required readiness" value={requiredReady} />
      </dl>
    </div>
  )
}

function SchemaChecklistCard({items}: {items: SchemaChecklistItem[]}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-900">Sanity必須fieldチェック</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            DashboardはSanity validationを直接実行しません。このチェックはschema-informedです。
            最終判定はStudio validationです。
          </p>
        </div>
        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
          {items.filter((item) => item.state === 'ready').length} / {items.length} ready
        </span>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-1.5 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.field}
            className="flex items-start justify-between gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-1.5"
          >
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px] font-semibold text-slate-800">
                {item.label}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">{item.message}</p>
            </div>
            <ChecklistStateBadge state={item.state} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ChecklistStateBadge({state}: {state: SchemaChecklistItem['state']}) {
  const classes =
    state === 'ready'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : state === 'missing'
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : 'border-amber-200 bg-amber-50 text-amber-700'
  const label =
    state === 'ready'
      ? 'ready'
      : state === 'missing'
        ? 'missing'
        : 'needs manual edit'
  return (
    <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${classes}`}>
      {label}
    </span>
  )
}

function FieldRow({
  field,
  preview,
  warnings,
  clipboard,
}: {
  field: StudioField
  preview: string
  warnings: string[] | undefined
  clipboard: string | undefined
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800">
          {FIELD_LABEL[field]}
        </code>
        <span className="text-[10px] text-slate-500">{FIELD_TONE[field]}</span>
        {clipboard !== undefined ? (
          <CopyButton text={clipboard} label="このfieldをコピー" />
        ) : (
          <span className="text-[10px] text-slate-400">(copy 不可)</span>
        )}
      </div>
      <p className="rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-800">
        {preview}
      </p>
      {warnings && warnings.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-5 text-[10px] text-amber-700">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FieldListRow({
  field,
  items,
  warnings,
  clipboard,
}: {
  field: StudioField
  items: string[]
  warnings: string[] | undefined
  clipboard: string | undefined
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800">
          {FIELD_LABEL[field]}
        </code>
        <span className="text-[10px] text-slate-500">{FIELD_TONE[field]}</span>
        <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-600">
          {items.length} 件
        </span>
        {clipboard !== undefined ? (
          <CopyButton text={clipboard} label="JSONでコピー" />
        ) : (
          <span className="text-[10px] text-slate-400">(空 — copy 不可)</span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-500">
          (空)
        </p>
      ) : (
        <ul className="space-y-0.5 rounded border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-800">
          {items.slice(0, 5).map((item, i) => (
            <li key={i} className="line-clamp-1" title={item}>
              • {truncate(item, 120)}
            </li>
          ))}
          {items.length > 5 && (
            <li className="text-[10px] text-slate-500">…他 {items.length - 5} 件</li>
          )}
        </ul>
      )}
      {warnings && warnings.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-5 text-[10px] text-amber-700">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SourceRow({label, value}: {label: string; value: string}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] font-semibold text-slate-500">{label}</dt>
      <dd className="truncate font-mono text-[11px] text-slate-800" title={value}>
        {value}
      </dd>
    </div>
  )
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return s.slice(0, n) + '…'
}

interface StudioHandoffLinkLike {
  url: string
  label: string
  experimental: boolean
}

function StudioLinkRow({link, primary}: {link: StudioHandoffLinkLike; primary?: boolean}) {
  const buttonBase =
    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm'
  const buttonClasses = primary
    ? `${buttonBase} bg-blue-600 text-white hover:bg-blue-700`
    : `${buttonBase} border border-slate-300 bg-white text-slate-800 hover:bg-slate-50`
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
      >
        {link.label}
        <ExternalLink size={11} aria-hidden="true" />
      </a>
      <code className="truncate font-mono text-[10px] text-slate-500" title={link.url}>
        {link.url}
      </code>
      {link.experimental && (
        <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
          experimental
        </span>
      )}
    </div>
  )
}
