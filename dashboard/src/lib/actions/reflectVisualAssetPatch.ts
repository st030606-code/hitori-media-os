'use server'

// Phase 2B-3.1 — Sanity reflect server action for visual assets.
//
// What this server action does:
//   - mode='preview':  validate input, read+validate patch JSON, fetch
//                       Sanity visualAssetPlan doc, compute 4-field diff,
//                       compute alreadyReflected flag. NO Sanity write.
//                       NO filesystem write.
//   - mode='execute':  same validation pass + env gates + token + _rev
//                       match → patch the 4 allowed fields in a single
//                       transaction with `ifRevisionID`. Post-write
//                       refetch verifies the 4 fields match the patch JSON.
//
// Boundaries (boss-confirmed via handoff/0192):
//   - Field allow-list is exactly 4 fields (Q-2B3.1-1)
//   - One asset per transaction (Q-2B3.1-5)
//   - Dashboard server action, separate from reflect-*.mjs CLI (Q-2B3.1-6)
//   - Missing target doc → not-found reject, no auto-create (Q-2B3.1-7)
//   - No undo: preview + confirm is the only guard (Q-2B3.1-3)
//   - Mirror reflect-*.mjs safety philosophy:
//       allow-list / preview-before-execute / expectedRevision /
//       post-write verification / no-create-missing-docs / no token in log
//
// Logging policy:
//   - Metadata only: stage, visualAssetPlanId, patchJsonPath, mode,
//                    diffFieldCount, elapsedMs, _rev prefix
//   - NEVER log: token, full patch JSON, reviewNotes body, any field values

import {enableLocalFsRoutes, enableWriteActions} from '@/lib/featureFlags'
import {getSanityWriteClient} from './sanityWriteClient'
import {
  PATCH_JSON_FIELDS,
  type FieldDiff,
  type PatchJsonField,
  buildPatchJsonPath,
  computePatchDiff,
  readAndValidatePatchJson,
  validatePatchJsonPath,
} from '@/lib/visualAssets/patchJson'

export type ReflectVisualAssetPatchError =
  | 'validation'
  | 'write-disabled'
  | 'missing-token'
  | 'localfs-disabled'
  | 'permission'
  | 'not-found'
  | 'conflict'
  | 'patch-not-found'
  | 'patch-malformed'
  | 'patch-target-mismatch'
  | 'unknown'

export interface ReflectVisualAssetPatchInput {
  visualAssetPlanId: string
  /** Pass `patchJsonPath` directly OR pass `campaignSlug` + `assetSlug` to
   *  derive it. If both are supplied, `patchJsonPath` wins. */
  patchJsonPath?: string
  campaignSlug?: string
  assetSlug?: string
  /** Required for `mode === 'execute'`. Preview can run without it. */
  expectedRevision?: string
  mode: 'preview' | 'execute'
}

interface PreviewSuccess {
  ok: true
  mode: 'preview'
  visualAssetPlanId: string
  patchJsonPath: string
  currentRevision: string
  diffs: FieldDiff[]
  alreadyReflected: boolean
}

interface ExecuteSuccess {
  ok: true
  mode: 'execute'
  visualAssetPlanId: string
  patchJsonPath: string
  previousRevision: string
  newRevision: string
  committedAtIso: string
  appliedFields: PatchJsonField[]
  verified: boolean
}

interface ActionError {
  ok: false
  error: ReflectVisualAssetPatchError
  message: string
}

export type ReflectVisualAssetPatchResult = PreviewSuccess | ExecuteSuccess | ActionError

const VISUAL_ASSET_PLAN_ID_RE = /^visualAssetPlan\.[a-z0-9][a-z0-9._-]{0,200}$/i
const REVISION_RE = /^[a-zA-Z0-9_-]{4,64}$/

function logEvent(stage: string, detail: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.log(`[reflectVisualAssetPatch:${stage}]`, detail)
}

interface FetchedDoc {
  _id: string
  _rev: string
  _type: string
  localAssetPath?: string | null
  status?: string | null
  updatedAt?: string | null
  reviewNotes?: string | null
}

function deriveJsonPath(input: ReflectVisualAssetPatchInput): string | null {
  if (typeof input.patchJsonPath === 'string' && input.patchJsonPath.length > 0) {
    return input.patchJsonPath
  }
  return buildPatchJsonPath(input.campaignSlug, input.assetSlug)
}

export async function reflectVisualAssetPatch(
  input: ReflectVisualAssetPatchInput,
): Promise<ReflectVisualAssetPatchResult> {
  const startedAt = Date.now()
  logEvent('start', {
    mode: input?.mode,
    visualAssetPlanId: input?.visualAssetPlanId,
  })

  // ---- 1. Input regex validation ----------------------------------------
  if (typeof input?.visualAssetPlanId !== 'string' || !VISUAL_ASSET_PLAN_ID_RE.test(input.visualAssetPlanId)) {
    logEvent('rejected', {reason: 'validation', detail: 'visualAssetPlanId format'})
    return {ok: false, error: 'validation', message: 'visualAssetPlanId is required and must match visualAssetPlan.<slug>.<asset>'}
  }
  if (input.mode !== 'preview' && input.mode !== 'execute') {
    return {ok: false, error: 'validation', message: 'mode must be "preview" or "execute"'}
  }
  const patchJsonPath = deriveJsonPath(input)
  if (!patchJsonPath) {
    return {ok: false, error: 'validation', message: 'patchJsonPath or campaignSlug+assetSlug is required'}
  }
  const validatedPath = validatePatchJsonPath(patchJsonPath)
  if (!validatedPath.ok) {
    logEvent('rejected', {reason: 'validation', detail: validatedPath.error})
    return {ok: false, error: 'validation', message: validatedPath.message}
  }

  // ---- 2. enableLocalFsRoutes (we need to read the patch JSON) ----------
  // Even in preview mode we read the filesystem, so this flag gates both
  // modes. Production deploys keep this off.
  if (!enableLocalFsRoutes) {
    logEvent('rejected', {reason: 'localfs-disabled'})
    return {ok: false, error: 'localfs-disabled', message: 'ENABLE_LOCAL_FS_ROUTES is off'}
  }

  // ---- 3. Read + validate patch JSON ------------------------------------
  const read = await readAndValidatePatchJson(patchJsonPath, input.visualAssetPlanId)
  if (!read.ok) {
    let mappedError: ReflectVisualAssetPatchError = 'patch-malformed'
    if (read.error === 'patch-not-found') mappedError = 'patch-not-found'
    else if (read.error === 'id-mismatch') mappedError = 'patch-target-mismatch'
    logEvent('rejected', {reason: read.error, detail: read.error})
    return {ok: false, error: mappedError, message: read.message}
  }
  const patch = read.patch

  // ---- 4. Build write client (token-bearing) ----------------------------
  // Preview mode also needs to read Sanity. We use the write client for
  // both modes so token-presence reflects the same env state the boss
  // would see at execute time. If only SANITY_READ_TOKEN exists, preview
  // still falls back through the public client; but for consistency with
  // Phase 2B-1 / 2B-2, we require SANITY_WRITE_TOKEN for both modes.
  const handle = getSanityWriteClient()
  if (!handle) {
    logEvent('rejected', {reason: 'missing-token'})
    return {ok: false, error: 'missing-token', message: 'SANITY_WRITE_TOKEN is not set'}
  }
  const client = handle.client

  // ---- 5. Fetch Sanity target doc ---------------------------------------
  let doc: FetchedDoc | null
  try {
    doc = await client.fetch<FetchedDoc | null>(
      `*[_id == $id && _type == "visualAssetPlan"][0]{
        _id, _rev, _type, localAssetPath, status, updatedAt, reviewNotes
      }`,
      {id: input.visualAssetPlanId},
    )
  } catch (e) {
    logEvent('error', {stage: 'fetch', message: e instanceof Error ? e.message : String(e)})
    return {ok: false, error: 'unknown', message: 'Failed to fetch target document'}
  }
  if (!doc) {
    // Q-2B3.1-7: do not create the doc. Surface a clear hint that the
    // boss must seed it in Sanity Studio first.
    logEvent('rejected', {reason: 'not-found'})
    return {
      ok: false,
      error: 'not-found',
      message: `Sanity に visualAssetPlan ドキュメント (\`${input.visualAssetPlanId}\`) が存在しません。 Sanity Studio で先に作成してください。 dashboard は自動で新規作成しません。`,
    }
  }

  const current = {
    localAssetPath: doc.localAssetPath ?? null,
    status: doc.status ?? null,
    updatedAt: doc.updatedAt ?? null,
    reviewNotes: doc.reviewNotes ?? null,
  }
  const {diffs, alreadyReflected} = computePatchDiff(patch, current)
  const changedCount = diffs.filter((d) => d.changed).length

  // ---- 6. mode='preview' short-circuit ----------------------------------
  if (input.mode === 'preview') {
    logEvent('preview-ok', {
      visualAssetPlanId: input.visualAssetPlanId,
      patchJsonPath: validatedPath.relativePath,
      currentRevisionPrefix: doc._rev.slice(0, 6),
      diffFieldCount: changedCount,
      alreadyReflected,
      elapsedMs: Date.now() - startedAt,
    })
    return {
      ok: true,
      mode: 'preview',
      visualAssetPlanId: doc._id,
      patchJsonPath: validatedPath.relativePath,
      currentRevision: doc._rev,
      diffs,
      alreadyReflected,
    }
  }

  // ---- 7. Execute-only env gate -----------------------------------------
  if (!enableWriteActions) {
    logEvent('rejected', {reason: 'write-disabled'})
    return {ok: false, error: 'write-disabled', message: 'ENABLE_WRITE_ACTIONS is off'}
  }

  // ---- 8. expectedRevision -----------------------------------------------
  if (typeof input.expectedRevision !== 'string' || !REVISION_RE.test(input.expectedRevision)) {
    logEvent('rejected', {reason: 'validation', detail: 'expectedRevision missing or malformed'})
    return {ok: false, error: 'validation', message: 'expectedRevision is required for execute and must match Sanity _rev format'}
  }
  if (doc._rev !== input.expectedRevision) {
    logEvent('rejected', {
      reason: 'conflict',
      currentRevPrefix: doc._rev.slice(0, 6),
    })
    return {ok: false, error: 'conflict', message: 'Revision mismatch — reload and retry'}
  }

  // ---- 9. already-reflected short-circuit (idempotent, return success) --
  // boss may explicitly re-execute (server log will note `already-applied`),
  // but if nothing changed we still want to be clear about the no-op. We
  // commit a patch anyway so the boss has a uniform "executed" feedback —
  // server side already-applied detection is the source of truth.
  if (alreadyReflected) {
    logEvent('already-applied', {
      visualAssetPlanId: input.visualAssetPlanId,
      patchJsonPath: validatedPath.relativePath,
    })
  }

  // ---- 10. Patch construction (4 fields only) ---------------------------
  // Construct the `set` object explicitly so we cannot accidentally include
  // any field outside the allow-list, even if patch.set somehow gains extra
  // keys in the future. (validatePatchShape already rejects that, but
  // belt-and-suspenders.)
  const setPayload: Record<PatchJsonField, string> = {
    localAssetPath: patch.set.localAssetPath,
    status: patch.set.status,
    updatedAt: patch.set.updatedAt,
    reviewNotes: patch.set.reviewNotes,
  }

  try {
    const docPatch = client
      .patch(input.visualAssetPlanId, {ifRevisionID: input.expectedRevision})
      .set(setPayload)

    const committed = await client.transaction().patch(docPatch).commit({
      autoGenerateArrayKeys: false,
      returnDocuments: true,
    })

    // Defensive narrowing — Sanity client returns either an array of docs or
    // `{results: [...]}` depending on options + version. Go through `unknown`
    // to avoid TypeScript's "insufficient overlap" complaint on the typed
    // SanityDocument shape.
    const extractRev = (first: unknown): string | null => {
      if (!first || typeof first !== 'object') return null
      const r = first as Record<string, unknown>
      if (typeof r._rev === 'string') return r._rev
      const doc = r.document
      if (doc && typeof doc === 'object') {
        const inner = doc as Record<string, unknown>
        if (typeof inner._rev === 'string') return inner._rev
      }
      return null
    }
    let newRevision = '(unknown)'
    if (Array.isArray(committed) && committed.length > 0) {
      const rev = extractRev(committed[0])
      if (rev) newRevision = rev
    } else if (committed && typeof committed === 'object') {
      const results = (committed as {results?: unknown}).results
      if (Array.isArray(results) && results.length > 0) {
        const rev = extractRev(results[0])
        if (rev) newRevision = rev
      }
    }

    // ---- 11. Post-write verification -----------------------------------
    let verified = false
    try {
      const reread = await client.fetch<FetchedDoc | null>(
        `*[_id == $id && _type == "visualAssetPlan"][0]{
          _id, _rev, _type, localAssetPath, status, updatedAt, reviewNotes
        }`,
        {id: input.visualAssetPlanId},
      )
      if (reread && reread._id === input.visualAssetPlanId) {
        verified =
          reread.localAssetPath === patch.set.localAssetPath &&
          reread.status === patch.set.status &&
          reread.updatedAt === patch.set.updatedAt &&
          reread.reviewNotes === patch.set.reviewNotes
        if (verified && reread._rev !== '(unknown)' && newRevision === '(unknown)') {
          newRevision = reread._rev
        }
      }
    } catch (e) {
      // Verification failed — record the partial success but flag verified=false.
      logEvent('verify-error', {message: e instanceof Error ? e.message : String(e)})
    }

    logEvent('execute-ok', {
      visualAssetPlanId: input.visualAssetPlanId,
      patchJsonPath: validatedPath.relativePath,
      previousRevisionPrefix: input.expectedRevision.slice(0, 6),
      newRevisionPrefix: newRevision.slice(0, 6),
      diffFieldCount: changedCount,
      alreadyReflected,
      verified,
      elapsedMs: Date.now() - startedAt,
    })

    return {
      ok: true,
      mode: 'execute',
      visualAssetPlanId: input.visualAssetPlanId,
      patchJsonPath: validatedPath.relativePath,
      previousRevision: input.expectedRevision,
      newRevision,
      committedAtIso: new Date().toISOString(),
      appliedFields: PATCH_JSON_FIELDS.slice(),
      verified,
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    const status =
      typeof e === 'object' && e !== null && 'statusCode' in e
        ? (e as {statusCode?: unknown}).statusCode
        : undefined
    const isConflict =
      status === 409 ||
      /revision/i.test(message) ||
      (/mutation(s)? failed/i.test(message) && /Document has been modified|conflict/i.test(message))
    if (isConflict) {
      logEvent('conflict', {message})
      return {ok: false, error: 'conflict', message: 'Revision mismatch — reload and retry'}
    }
    const isPermission =
      status === 401 ||
      status === 403 ||
      /unauthor|forbidden|insufficient/i.test(message)
    if (isPermission) {
      logEvent('permission', {message})
      return {ok: false, error: 'permission', message: 'Sanity token lacks write permission'}
    }
    logEvent('error', {stage: 'commit', message})
    return {ok: false, error: 'unknown', message: 'Patch commit failed'}
  }
}
