'use client'

// CandidateFocusLayout — client wrapper that owns the "focused candidate"
// state for /visual-assets/[assetId]/candidates. v001 is selected by default.
//
// Layout (2-col):
//   Left:  BigPreviewCard + CandidateThumbStrip + PromptSummaryCard
//   Right: SelectedCandidateMetaCard + RubricScoresCard + NotesCard +
//          ActionsCard + warnings
//
// All right-side cards that depend on the focused candidate live inside this
// client tree so the state stays local. promptBody is read server-side by the
// page and passed as a plain string here.

import {useMemo, useState} from 'react'
import type {CandidateMeta, PromptMeta, ReviewMeta} from '@/lib/inboxReader'
import {BigPreviewCard} from './BigPreviewCard'
import {CandidateThumbStrip} from './CandidateThumbStrip'
import {SelectedCandidateMetaCard} from './SelectedCandidateMetaCard'
import {PromptSummaryCard} from './PromptSummaryCard'
import {RubricScoresCard} from './RubricScoresCard'
import {NotesCard} from './NotesCard'
import {ActionsCard} from './ActionsCard'
import {ApproveCandidateAction} from './ApproveCandidateAction'
import {ReflectVisualAssetAction} from './ReflectVisualAssetAction'

interface Props {
  candidates: CandidateMeta[]
  promptMeta: PromptMeta | null
  promptBody: string | null
  reviewMeta: ReviewMeta | null
  warnings: string[]
  enableLocalFsRoutes: boolean
  /** Phase 2B-3 bridge props. Passed down so <ApproveCandidateAction> can
   *  render here next to the existing <ActionsCard> placeholders. */
  approveBridge: {
    assetId: string
    campaignSlug: string
    assetSlug: string
    expectedLocalAssetPath: string | null
    currentLocalAssetPath: string | null
    writeReady: boolean
    localFsReady: boolean
  }
  /** Phase 2B-3.1 reflect props. The page resolves whether the patch
   *  JSON exists server-side and passes `patchJsonPath: null` when it
   *  doesn't — in which case the reflect CTA renders a disabled state
   *  explaining that Phase 2B-3 must run first. `reflectWriteReady`
   *  includes the SANITY_WRITE_TOKEN check (unlike approveBridge.writeReady
   *  which is filesystem-only). */
  reflectBridge: {
    visualAssetPlanId: string
    campaignSlug: string
    assetSlug: string
    patchJsonPath: string | null
    writeReady: boolean
    localFsReady: boolean
  }
}

export function CandidateFocusLayout({
  candidates,
  promptMeta,
  promptBody,
  reviewMeta,
  warnings,
  enableLocalFsRoutes,
  approveBridge,
  reflectBridge,
}: Props) {
  const initialId = candidates[0]?.id ?? null
  const [selectedId, setSelectedId] = useState<string | null>(initialId)

  const selected = useMemo(
    () => candidates.find((c) => c.id === selectedId) ?? null,
    [candidates, selectedId],
  )
  const recommendedId = reviewMeta?.recommendedCandidate ?? null

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-4">
        <BigPreviewCard candidate={selected} enableLocalFsRoutes={enableLocalFsRoutes} />
        <CandidateThumbStrip
          candidates={candidates}
          selectedId={selectedId}
          onSelect={setSelectedId}
          enableLocalFsRoutes={enableLocalFsRoutes}
        />
        <PromptSummaryCard
          promptMeta={promptMeta}
          promptBody={promptBody}
          enableLocalFsRoutes={enableLocalFsRoutes}
        />
      </div>

      <div className="flex flex-col gap-4">
        <SelectedCandidateMetaCard
          candidate={selected}
          rubricMaxScore={reviewMeta?.rubricMaxScore}
        />
        <RubricScoresCard
          candidate={selected}
          reviewMeta={reviewMeta}
          enableLocalFsRoutes={enableLocalFsRoutes}
        />
        <NotesCard
          candidate={selected}
          reviewMeta={reviewMeta}
          enableLocalFsRoutes={enableLocalFsRoutes}
        />
        <ApproveCandidateAction
          assetId={approveBridge.assetId}
          campaignSlug={approveBridge.campaignSlug}
          assetSlug={approveBridge.assetSlug}
          selected={
            selected
              ? {
                  id: selected.id,
                  fileName: selected.fileName,
                  relativePath: selected.relativePath,
                }
              : null
          }
          expectedLocalAssetPath={approveBridge.expectedLocalAssetPath}
          currentLocalAssetPath={approveBridge.currentLocalAssetPath}
          writeReady={approveBridge.writeReady}
          localFsReady={approveBridge.localFsReady}
        />

        <ReflectVisualAssetAction
          visualAssetPlanId={reflectBridge.visualAssetPlanId}
          campaignSlug={reflectBridge.campaignSlug}
          assetSlug={reflectBridge.assetSlug}
          patchJsonPath={reflectBridge.patchJsonPath}
          writeReady={reflectBridge.writeReady}
          localFsReady={reflectBridge.localFsReady}
          variant="compact"
        />

        <ActionsCard
          recommendedCandidateId={recommendedId}
          visualRegisterLabel="Visual Register で承認 (CLI 直接)"
          deferred={[
            {
              label: '再生成する',
              tooltip:
                'Phase 2B で imagePrompt の編集と codex exec の再実行を dashboard から開始する想定。',
            },
            {
              label: '保留する',
              tooltip: 'Phase 2B で review-manifest.json に skip フラグを書き込む想定。',
            },
          ]}
        />

        {warnings.length > 0 && (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
            <p className="font-semibold">警告</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
