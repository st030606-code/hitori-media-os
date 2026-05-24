'use server'

// Phase 2B-1 — first controlled Sanity write surface.
//
// Updates a single `manualPublishingStatus[].reactionNotes` field on a
// `campaignPlan` document. Anything else is intentionally rejected by the
// field allow-list. See docs/specs/phase-2b-1-reaction-notes.md.
//
// Safety layers (in order):
//   1. enableWriteActions feature flag
//   2. SANITY_WRITE_TOKEN env var
//   3. Hard input validation (campaignId format, _key format, length cap)
//   4. expectedRevision is REQUIRED (Q-8: no last-write-wins)
//   5. Document existence + manualPublishingStatus item existence verified
//      via a fresh fetch before patching
//   6. The patch touches a single array-element field, scoped by `_key`

import {enableWriteActions} from '@/lib/featureFlags'
import {getSanityWriteClient} from './sanityWriteClient'

export type UpdateReactionNotesError =
  | 'validation'
  | 'missing-token'
  | 'write-disabled'
  | 'permission'
  | 'not-found'
  | 'conflict'
  | 'unknown'

export interface UpdateReactionNotesInput {
  campaignId: string
  itemKey: string
  platform: string
  newReactionNotes: string
  expectedRevision: string
  mode: 'dry-run' | 'execute'
}

export type UpdateReactionNotesResult =
  | {
      ok: true
      mode: 'dry-run'
      campaignId: string
      itemKey: string
      previousValue: string
      newValue: string
      currentRevision: string
    }
  | {
      ok: true
      mode: 'execute'
      campaignId: string
      itemKey: string
      previousValue: string
      newValue: string
      newRevision: string
      committedAt: string
    }
  | {
      ok: false
      error: UpdateReactionNotesError
      message: string
    }

const MAX_REACTION_NOTES_LENGTH = 2000
const CAMPAIGN_ID_RE = /^[a-zA-Z0-9_.-]{4,200}$/
const ITEM_KEY_RE = /^[a-zA-Z0-9_-]{4,64}$/
const REVISION_RE = /^[a-zA-Z0-9_-]{4,64}$/
const PLATFORM_RE = /^[a-zA-Z0-9_-]{1,32}$/

interface FetchedItem {
  _key?: string
  platform?: string
  reactionNotes?: string
}

interface FetchedDoc {
  _id: string
  _rev: string
  manualPublishingStatus?: FetchedItem[]
}

function validateInput(input: UpdateReactionNotesInput):
  | {ok: true}
  | {ok: false; message: string} {
  if (typeof input !== 'object' || input === null) {
    return {ok: false, message: 'input is not an object'}
  }
  if (typeof input.campaignId !== 'string' || !CAMPAIGN_ID_RE.test(input.campaignId)) {
    return {ok: false, message: 'campaignId format invalid'}
  }
  if (typeof input.itemKey !== 'string' || !ITEM_KEY_RE.test(input.itemKey)) {
    return {ok: false, message: 'itemKey format invalid'}
  }
  if (typeof input.platform !== 'string' || !PLATFORM_RE.test(input.platform)) {
    return {ok: false, message: 'platform format invalid'}
  }
  if (typeof input.expectedRevision !== 'string' || !REVISION_RE.test(input.expectedRevision)) {
    return {ok: false, message: 'expectedRevision required and must match Sanity _rev format'}
  }
  if (typeof input.newReactionNotes !== 'string') {
    return {ok: false, message: 'newReactionNotes must be a string'}
  }
  if (input.newReactionNotes.length > MAX_REACTION_NOTES_LENGTH) {
    return {
      ok: false,
      message: `newReactionNotes exceeds ${MAX_REACTION_NOTES_LENGTH} characters`,
    }
  }
  if (input.mode !== 'dry-run' && input.mode !== 'execute') {
    return {ok: false, message: 'mode must be "dry-run" or "execute"'}
  }
  return {ok: true}
}

function logServerEvent(stage: string, detail: Record<string, unknown>): void {
  // Q-10 confirmed: server console.log only for local debugging. Never log
  // the token or the new value content. Caller passes only metadata.
  // eslint-disable-next-line no-console
  console.log(`[updateReactionNotes:${stage}]`, detail)
}

export async function updateReactionNotes(
  input: UpdateReactionNotesInput,
): Promise<UpdateReactionNotesResult> {
  const startedAt = Date.now()
  logServerEvent('start', {
    mode: input?.mode,
    campaignId: input?.campaignId,
    itemKey: input?.itemKey,
    platform: input?.platform,
    newLength: typeof input?.newReactionNotes === 'string' ? input.newReactionNotes.length : null,
  })

  // 1. enableWriteActions check (cheapest; fail fast)
  if (!enableWriteActions) {
    logServerEvent('rejected', {reason: 'write-disabled'})
    return {
      ok: false,
      error: 'write-disabled',
      message: 'ENABLE_WRITE_ACTIONS is off',
    }
  }

  // 2. Token check
  const handle = getSanityWriteClient()
  if (!handle) {
    logServerEvent('rejected', {reason: 'missing-token'})
    return {
      ok: false,
      error: 'missing-token',
      message: 'SANITY_WRITE_TOKEN is not set',
    }
  }

  // 3. Input validation
  const valid = validateInput(input)
  if (!valid.ok) {
    logServerEvent('rejected', {reason: 'validation', detail: valid.message})
    return {ok: false, error: 'validation', message: valid.message}
  }

  const {campaignId, itemKey, platform, newReactionNotes, expectedRevision, mode} = input
  const client = handle.client

  // 4. Fetch target document and verify identity + revision + item
  let doc: FetchedDoc | null
  try {
    doc = await client.fetch<FetchedDoc | null>(
      `*[_id == $id && _type == "campaignPlan"][0]{
        _id,
        _rev,
        manualPublishingStatus[]{_key, platform, reactionNotes}
      }`,
      {id: campaignId},
    )
  } catch (e) {
    logServerEvent('error', {
      stage: 'fetch',
      message: e instanceof Error ? e.message : String(e),
    })
    return {
      ok: false,
      error: 'unknown',
      message: 'Failed to fetch target document',
    }
  }

  if (!doc) {
    logServerEvent('rejected', {reason: 'not-found-doc'})
    return {ok: false, error: 'not-found', message: 'campaignPlan not found'}
  }

  if (doc._rev !== expectedRevision) {
    logServerEvent('rejected', {
      reason: 'conflict',
      currentRev: doc._rev,
      expectedRev: expectedRevision,
    })
    return {
      ok: false,
      error: 'conflict',
      message: 'Revision mismatch — reload and retry',
    }
  }

  const item = (doc.manualPublishingStatus ?? []).find((it) => it._key === itemKey)
  if (!item) {
    logServerEvent('rejected', {reason: 'not-found-item'})
    return {ok: false, error: 'not-found', message: 'manualPublishingStatus item not found'}
  }
  if (item.platform !== platform) {
    logServerEvent('rejected', {
      reason: 'platform-mismatch',
      itemPlatform: item.platform,
      requestedPlatform: platform,
    })
    return {
      ok: false,
      error: 'validation',
      message: 'platform does not match the manualPublishingStatus item',
    }
  }

  const previousValue = typeof item.reactionNotes === 'string' ? item.reactionNotes : ''

  // 5. Dry-run short-circuit
  if (mode === 'dry-run') {
    logServerEvent('dry-run-ok', {elapsedMs: Date.now() - startedAt})
    return {
      ok: true,
      mode: 'dry-run',
      campaignId,
      itemKey,
      previousValue,
      newValue: newReactionNotes,
      currentRevision: doc._rev,
    }
  }

  // 6. Execute — patch a single array-element field with optimistic lock
  try {
    const setKey = `manualPublishingStatus[_key=="${itemKey}"].reactionNotes`
    const patch = client
      .patch(campaignId, {ifRevisionID: expectedRevision})
      .set({[setKey]: newReactionNotes})

    const committed = await client.transaction().patch(patch).commit({
      autoGenerateArrayKeys: false,
      returnDocuments: true,
    })

    const docs = Array.isArray(committed) ? committed : (committed as {results?: unknown[]})?.results
    const updated = Array.isArray(docs)
      ? (docs[0] as {document?: FetchedDoc} | FetchedDoc | undefined)
      : undefined
    const updatedDoc: FetchedDoc | undefined =
      updated && 'document' in (updated as object)
        ? (updated as {document?: FetchedDoc}).document
        : (updated as FetchedDoc | undefined)
    const newRevision = updatedDoc?._rev ?? '(unknown)'

    logServerEvent('execute-ok', {elapsedMs: Date.now() - startedAt, newRevision})

    return {
      ok: true,
      mode: 'execute',
      campaignId,
      itemKey,
      previousValue,
      newValue: newReactionNotes,
      newRevision,
      committedAt: new Date().toISOString(),
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    // Sanity surfaces revision conflicts as a 409 with a specific message
    // pattern. Map both the explicit status and the textual hint to
    // `conflict` so the UI can show the reload prompt.
    const status =
      typeof e === 'object' && e !== null && 'statusCode' in e
        ? (e as {statusCode?: unknown}).statusCode
        : undefined
    const isConflict =
      status === 409 ||
      /revision/i.test(message) ||
      /mutation(s)? failed/i.test(message) && /Document has been modified|conflict/i.test(message)
    if (isConflict) {
      logServerEvent('conflict', {message})
      return {
        ok: false,
        error: 'conflict',
        message: 'Revision mismatch — reload and retry',
      }
    }
    const isPermission =
      status === 401 ||
      status === 403 ||
      /unauthor|forbidden|insufficient/i.test(message)
    if (isPermission) {
      logServerEvent('permission', {message})
      return {
        ok: false,
        error: 'permission',
        message: 'Sanity token lacks write permission',
      }
    }
    logServerEvent('error', {stage: 'commit', message})
    return {ok: false, error: 'unknown', message: 'Patch failed'}
  }
}
