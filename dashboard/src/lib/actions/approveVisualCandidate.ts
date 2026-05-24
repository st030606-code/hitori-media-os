'use server'

// Phase 2B-3 — controlled bridge to the Visual Register CLI.
//
// What this server action does:
//   - mode='preview':   validates input, computes preview paths from
//                        existing plan metadata, returns the preview.
//                        Does NOT touch the filesystem. Does NOT call
//                        the Visual Register HTTP endpoint.
//   - mode='execute':   validates input again, checks the two env
//                        flags, then POSTs to the running Visual
//                        Register CLI at
//                        http://localhost:3334/api/inbox/approve-and-register.
//                        Visual Register owns the file copy / patch JSON
//                        write / manifest update. This action only
//                        relays the response to the UI.
//
// Boundaries (boss-confirmed via handoff/0188):
//   - Option D (HTTP bridge) only — no subprocess spawn, no shared module
//     extraction, no command preparation.
//   - The dashboard never writes to assets/visuals, assets/inbox, or
//     patches/visual-assets directly.
//   - The dashboard never calls Sanity from this action (Q-2B3-2 deferred
//     Sanity reflect to Phase 2B-3.1).
//   - The endpoint URL is hardcoded; env override is not supported.
//   - Server logs are metadata-only. No token, no review body, no prompt
//     body, no image bytes.

import {enableLocalFsRoutes, enableWriteActions} from '@/lib/featureFlags'
import {
  VISUAL_REGISTER_APPROVE_ENDPOINT,
  VISUAL_REGISTER_HEALTH_ENDPOINT,
  buildBridgePreview,
  validateApproveInput,
  type BridgePreview,
} from '@/lib/visualAssets/bridgePaths'

export type ApproveVisualCandidateError =
  | 'validation'
  | 'write-disabled'
  | 'localfs-disabled'
  | 'visual-register-not-running'
  | 'candidate-not-found'
  | 'plan-not-found'
  | 'overwrite-required'
  | 'permission'
  | 'unknown'

export interface ApproveVisualCandidateInput {
  assetId: string
  campaignSlug: string
  assetSlug: string
  candidateFile: string             // e.g. 'v003.png'
  candidateRelativePath: string     // 'assets/inbox/generated/<slug>/<asset>/v003.png'
  /** Set from the plan's `expectedLocalAssetPath`. Used only by the
   *  preview helper for the "planned final path" hint. */
  expectedLocalAssetPath?: string | null
  /** Set from the plan's current `localAssetPath` (if a previous
   *  registration wrote something). Used for the overwrite-likely
   *  hint in preview. */
  currentLocalAssetPath?: string | null
  /** Only used when `mode === 'execute'`. Defaults to false. */
  overwriteConfirmed?: boolean
  mode: 'preview' | 'execute'
}

export type ApproveVisualCandidateResult =
  | {
      ok: true
      mode: 'preview'
      preview: BridgePreview
    }
  | {
      ok: true
      mode: 'execute'
      assetId: string
      candidateRelativePath: string
      finalAssetPath: string
      patchPath: string
      manifestUpdated: boolean
      committedAtIso: string
      visualRegisterPatchEcho: unknown   // pass-through of server.mjs's "patch" field
      nextStepsHint: {
        sanityReflectCommand: string
        publishPackageCommand: string
      }
    }
  | {
      ok: false
      error: ApproveVisualCandidateError
      message: string
      /** Only present for `overwrite-required`. */
      existingLocalAssetPath?: string
    }

function logEvent(stage: string, detail: Record<string, unknown>): void {
  // Q-2B3 + Phase 2B-1/2 logging contract: metadata only, never log
  // token / prompt body / review body / image bytes / response payloads
  // beyond status code + boolean flags.
  // eslint-disable-next-line no-console
  console.log(`[approveVisualCandidate:${stage}]`, detail)
}

const HEALTH_TIMEOUT_MS = 3000
const EXECUTE_TIMEOUT_MS = 20000

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {...init, signal: controller.signal})
  } finally {
    clearTimeout(timer)
  }
}

async function checkVisualRegisterUp(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(
      VISUAL_REGISTER_HEALTH_ENDPOINT,
      {method: 'GET'},
      HEALTH_TIMEOUT_MS,
    )
    return res.ok
  } catch {
    return false
  }
}

export async function approveVisualCandidate(
  input: ApproveVisualCandidateInput,
): Promise<ApproveVisualCandidateResult> {
  const startedAt = Date.now()
  logEvent('start', {
    mode: input?.mode,
    assetId: input?.assetId,
    candidateFile: input?.candidateFile,
  })

  // ---- 1. Input validation (cheap, mode-independent) -------------------
  const validated = validateApproveInput({
    assetId: input?.assetId,
    campaignSlug: input?.campaignSlug,
    assetSlug: input?.assetSlug,
    candidateFile: input?.candidateFile,
    candidateRelativePath: input?.candidateRelativePath,
  })
  if (!validated.ok) {
    logEvent('rejected', {reason: 'validation', detail: validated.error})
    return {ok: false, error: 'validation', message: validated.message}
  }

  // ---- 2. Build preview (mode-independent; reused for execute) ---------
  const preview = buildBridgePreview({
    validated,
    expectedLocalAssetPath: input?.expectedLocalAssetPath,
    currentLocalAssetPath: input?.currentLocalAssetPath,
  })

  if (input?.mode === 'preview') {
    logEvent('preview-ok', {
      assetId: validated.assetId,
      candidateFile: validated.candidateFile,
      overwriteLikely: preview.overwriteLikely,
      elapsedMs: Date.now() - startedAt,
    })
    return {ok: true, mode: 'preview', preview}
  }

  if (input?.mode !== 'execute') {
    logEvent('rejected', {reason: 'validation', detail: 'mode must be preview or execute'})
    return {ok: false, error: 'validation', message: 'mode must be "preview" or "execute"'}
  }

  // ---- 3. Execute-only gates ------------------------------------------
  if (!enableWriteActions) {
    logEvent('rejected', {reason: 'write-disabled'})
    return {ok: false, error: 'write-disabled', message: 'ENABLE_WRITE_ACTIONS is off'}
  }
  if (!enableLocalFsRoutes) {
    logEvent('rejected', {reason: 'localfs-disabled'})
    return {ok: false, error: 'localfs-disabled', message: 'ENABLE_LOCAL_FS_ROUTES is off'}
  }

  // ---- 4. Health check -------------------------------------------------
  const healthy = await checkVisualRegisterUp()
  if (!healthy) {
    logEvent('rejected', {reason: 'visual-register-not-running'})
    return {
      ok: false,
      error: 'visual-register-not-running',
      message:
        'Visual Register が起動していません。`npm run visual:register` で起動してから再実行してください。',
    }
  }

  // ---- 5. Bridge to Visual Register ----------------------------------
  const requestBody = {
    relativePath: validated.candidateRelativePath,
    visualAssetPlanId: validated.assetId,
    overwriteConfirmed: input?.overwriteConfirmed === true,
  }

  let res: Response
  try {
    res = await fetchWithTimeout(
      VISUAL_REGISTER_APPROVE_ENDPOINT,
      {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(requestBody),
      },
      EXECUTE_TIMEOUT_MS,
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    logEvent('error', {stage: 'fetch', message})
    return {
      ok: false,
      error: 'visual-register-not-running',
      message:
        'Visual Register への接続に失敗しました。サーバーが起動しているか確認してください。',
    }
  }

  // ---- 6. Map response -----------------------------------------------
  let parsed: unknown
  try {
    parsed = await res.json()
  } catch {
    logEvent('error', {stage: 'parse', httpStatus: res.status})
    return {ok: false, error: 'unknown', message: 'Visual Register response was not JSON'}
  }
  const payload = (typeof parsed === 'object' && parsed !== null ? parsed : {}) as {
    ok?: boolean
    error?: string
    code?: string
    overwriteRequired?: boolean
    localAssetPath?: string
    visualAssetPlanId?: string
    inboxSource?: string
    patchPath?: string
    patch?: unknown
  }

  if (res.status === 409 && payload.code === 'asset_exists' && payload.overwriteRequired) {
    logEvent('overwrite-required', {
      httpStatus: 409,
      existingLocalAssetPath: payload.localAssetPath ?? null,
    })
    return {
      ok: false,
      error: 'overwrite-required',
      message:
        'すでに同名の最終アセットが存在します。「上書きする」チェックを ON にして再実行してください。',
      existingLocalAssetPath: typeof payload.localAssetPath === 'string' ? payload.localAssetPath : undefined,
    }
  }

  if (res.status === 404) {
    const isPlan = typeof payload.error === 'string' && /plan/i.test(payload.error)
    logEvent('rejected', {
      reason: isPlan ? 'plan-not-found' : 'candidate-not-found',
      httpStatus: 404,
    })
    return {
      ok: false,
      error: isPlan ? 'plan-not-found' : 'candidate-not-found',
      message:
        typeof payload.error === 'string' ? payload.error : 'Visual Register returned 404',
    }
  }

  if (res.status === 401 || res.status === 403) {
    logEvent('permission', {httpStatus: res.status})
    return {
      ok: false,
      error: 'permission',
      message:
        typeof payload.error === 'string'
          ? payload.error
          : 'Visual Register への書き込みが拒否されました',
    }
  }

  if (!res.ok || payload.ok !== true) {
    logEvent('error', {
      stage: 'response',
      httpStatus: res.status,
      hasErrorField: typeof payload.error === 'string',
    })
    return {
      ok: false,
      error: 'unknown',
      message:
        typeof payload.error === 'string'
          ? payload.error
          : `Visual Register returned ${res.status}`,
    }
  }

  const finalAssetPath = typeof payload.localAssetPath === 'string' ? payload.localAssetPath : ''
  const patchPath = typeof payload.patchPath === 'string' ? payload.patchPath : ''
  const manifestUpdated = typeof payload.inboxSource === 'string' && payload.inboxSource.length > 0

  logEvent('execute-ok', {
    assetId: validated.assetId,
    candidateFile: validated.candidateFile,
    httpStatus: res.status,
    finalAssetSet: finalAssetPath.length > 0,
    patchPathSet: patchPath.length > 0,
    manifestUpdated,
    elapsedMs: Date.now() - startedAt,
  })

  return {
    ok: true,
    mode: 'execute',
    assetId: validated.assetId,
    candidateRelativePath: validated.candidateRelativePath,
    finalAssetPath,
    patchPath,
    manifestUpdated,
    committedAtIso: new Date().toISOString(),
    visualRegisterPatchEcho: payload.patch,
    nextStepsHint: {
      // Phase 2B-3.1 will replace these with a real action; for now they
      // are command strings the boss can copy and run.
      sanityReflectCommand: 'node tools/sanity/reflect-working-pipeline-visual-assets.mjs --dry-run',
      publishPackageCommand: 'npm run publish:package',
    },
  }
}
