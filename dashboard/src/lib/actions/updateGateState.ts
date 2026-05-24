'use server'

// Phase 2B-2 — controlled write surface for humanReviewGate state.
//
// Patches a single `campaignPlan.humanReviewGates[]._key === gateKey`
// `state` field. All other gate fields (`gateName`, `reviewer`,
// `completedAt`, `notes`) are out of scope per Q-2B2-3 (CONFIRMED
// 2026-05-20) and intentionally rejected by the field allow-list.
//
// Safety layers (in order; matches Phase 2B-1 with one extra layer for
// the transition allow-list):
//   1. enableWriteActions feature flag
//   2. SANITY_WRITE_TOKEN env var
//   3. Hard input validation (campaignId / gateKey / _rev format,
//      nextState enum, isUndo boolean)
//   4. expectedRevision REQUIRED (Q-8: no last-write-wins)
//   5. Document + gate existence verified via fresh fetch
//   6. Transition allow-list (Q-2B2-6 defense-in-depth; bypassed only
//      when isUndo === true, where the reverse patch is intentional)
//   7. Field allow-list — patch is scoped to
//      `humanReviewGates[_key == "<key>"].state` only

import {enableWriteActions} from '@/lib/featureFlags'
import {getSanityWriteClient} from './sanityWriteClient'
import {
  isAllowedGateTransition,
  isGateState,
  type HumanReviewGateState,
} from '@/lib/gates/stateTransitions'

export type UpdateGateStateError =
  | 'validation'
  | 'missing-token'
  | 'write-disabled'
  | 'permission'
  | 'not-found'
  | 'conflict'
  | 'transition-not-allowed'
  | 'unknown'

export interface UpdateGateStateInput {
  campaignId: string
  gateKey: string
  currentState: HumanReviewGateState
  nextState: HumanReviewGateState
  expectedRevision: string
  /** Set to true when invoked from the host's undo path. Bypasses the
   *  forward-only transition allow-list so the boss can roll back to the
   *  previous value within the 10-second window. The expectedRevision and
   *  document/gate existence checks still run. */
  isUndo?: boolean
}

export type UpdateGateStateResult =
  | {
      ok: true
      campaignId: string
      gateKey: string
      previousState: HumanReviewGateState
      nextState: HumanReviewGateState
      newRevision: string
      committedAt: string
    }
  | {
      ok: false
      error: UpdateGateStateError
      message: string
    }

const CAMPAIGN_ID_RE = /^[a-zA-Z0-9_.-]{4,200}$/
const GATE_KEY_RE = /^[a-zA-Z0-9_-]{4,64}$/
const REVISION_RE = /^[a-zA-Z0-9_-]{4,64}$/

interface FetchedGate {
  _key?: string
  state?: string
}

interface FetchedDoc {
  _id: string
  _rev: string
  humanReviewGates?: FetchedGate[]
}

function validateInput(input: UpdateGateStateInput):
  | {ok: true}
  | {ok: false; message: string} {
  if (typeof input !== 'object' || input === null) {
    return {ok: false, message: 'input is not an object'}
  }
  if (typeof input.campaignId !== 'string' || !CAMPAIGN_ID_RE.test(input.campaignId)) {
    return {ok: false, message: 'campaignId format invalid'}
  }
  if (typeof input.gateKey !== 'string' || !GATE_KEY_RE.test(input.gateKey)) {
    return {ok: false, message: 'gateKey format invalid'}
  }
  if (!isGateState(input.currentState)) {
    return {ok: false, message: 'currentState is not a valid HumanReviewGateState'}
  }
  if (!isGateState(input.nextState)) {
    return {ok: false, message: 'nextState is not a valid HumanReviewGateState'}
  }
  if (typeof input.expectedRevision !== 'string' || !REVISION_RE.test(input.expectedRevision)) {
    return {ok: false, message: 'expectedRevision required and must match Sanity _rev format'}
  }
  if (input.isUndo !== undefined && typeof input.isUndo !== 'boolean') {
    return {ok: false, message: 'isUndo must be boolean when provided'}
  }
  if (input.currentState === input.nextState) {
    return {ok: false, message: 'currentState and nextState are the same'}
  }
  return {ok: true}
}

function logServerEvent(stage: string, detail: Record<string, unknown>): void {
  // Q-10 confirmed: server console.log only for local debugging. Never log
  // the token, gate notes, reviewer name, or any other sensitive content.
  // Only metadata fields appear here.
  // eslint-disable-next-line no-console
  console.log(`[updateGateState:${stage}]`, detail)
}

export async function updateGateState(
  input: UpdateGateStateInput,
): Promise<UpdateGateStateResult> {
  const startedAt = Date.now()
  logServerEvent('start', {
    campaignId: input?.campaignId,
    gateKey: input?.gateKey,
    currentState: input?.currentState,
    nextState: input?.nextState,
    isUndo: Boolean(input?.isUndo),
  })

  // 1. enableWriteActions check (cheapest reject)
  if (!enableWriteActions) {
    logServerEvent('rejected', {reason: 'write-disabled'})
    return {ok: false, error: 'write-disabled', message: 'ENABLE_WRITE_ACTIONS is off'}
  }

  // 2. Token check
  const handle = getSanityWriteClient()
  if (!handle) {
    logServerEvent('rejected', {reason: 'missing-token'})
    return {ok: false, error: 'missing-token', message: 'SANITY_WRITE_TOKEN is not set'}
  }

  // 3. Input validation
  const valid = validateInput(input)
  if (!valid.ok) {
    logServerEvent('rejected', {reason: 'validation', detail: valid.message})
    return {ok: false, error: 'validation', message: valid.message}
  }

  const {campaignId, gateKey, currentState, nextState, expectedRevision, isUndo} = input
  const client = handle.client

  // 4. Fetch target document and verify identity + revision + gate existence
  let doc: FetchedDoc | null
  try {
    doc = await client.fetch<FetchedDoc | null>(
      `*[_id == $id && _type == "campaignPlan"][0]{
        _id,
        _rev,
        humanReviewGates[]{_key, state}
      }`,
      {id: campaignId},
    )
  } catch (e) {
    logServerEvent('error', {
      stage: 'fetch',
      message: e instanceof Error ? e.message : String(e),
    })
    return {ok: false, error: 'unknown', message: 'Failed to fetch target document'}
  }

  if (!doc) {
    logServerEvent('rejected', {reason: 'not-found-doc'})
    return {ok: false, error: 'not-found', message: 'campaignPlan not found'}
  }

  if (doc._rev !== expectedRevision) {
    logServerEvent('rejected', {
      reason: 'conflict',
      // Log only the prefixes to avoid noise; the full _rev is not sensitive
      // but unnecessary in stdout.
      currentRevPrefix: typeof doc._rev === 'string' ? doc._rev.slice(0, 6) : '(none)',
    })
    return {ok: false, error: 'conflict', message: 'Revision mismatch — reload and retry'}
  }

  const gate = (doc.humanReviewGates ?? []).find((g) => g._key === gateKey)
  if (!gate) {
    logServerEvent('rejected', {reason: 'not-found-gate'})
    return {ok: false, error: 'not-found', message: 'humanReviewGates item not found'}
  }
  if (gate.state !== currentState) {
    // Live state has drifted from what the client thought it was. Treat as
    // a conflict so the UI prompts a reload — never silently overwrite.
    logServerEvent('rejected', {
      reason: 'state-drift',
      liveState: gate.state,
      requestedCurrentState: currentState,
    })
    return {
      ok: false,
      error: 'conflict',
      message: 'Gate state has changed since the page was loaded — reload and retry',
    }
  }

  // 5. Transition allow-list (Q-2B2-6). Bypassed for undo path so the boss
  // can roll back to the prior state inside the 10s window.
  if (!isUndo && !isAllowedGateTransition(currentState, nextState)) {
    logServerEvent('rejected', {
      reason: 'transition-not-allowed',
      from: currentState,
      to: nextState,
    })
    return {
      ok: false,
      error: 'transition-not-allowed',
      message: `この state には移れません: ${currentState} → ${nextState}`,
    }
  }

  // 6. Execute — single-field, _key-scoped patch with optimistic lock.
  try {
    const setKey = `humanReviewGates[_key=="${gateKey}"].state`
    const patch = client
      .patch(campaignId, {ifRevisionID: expectedRevision})
      .set({[setKey]: nextState})

    const committed = await client.transaction().patch(patch).commit({
      autoGenerateArrayKeys: false,
      returnDocuments: true,
    })

    const docs = Array.isArray(committed)
      ? committed
      : (committed as {results?: unknown[]})?.results
    const updated = Array.isArray(docs)
      ? (docs[0] as {document?: FetchedDoc} | FetchedDoc | undefined)
      : undefined
    const updatedDoc: FetchedDoc | undefined =
      updated && 'document' in (updated as object)
        ? (updated as {document?: FetchedDoc}).document
        : (updated as FetchedDoc | undefined)
    const newRevision = updatedDoc?._rev ?? '(unknown)'

    logServerEvent('execute-ok', {
      elapsedMs: Date.now() - startedAt,
      newRevisionPrefix: newRevision.slice(0, 6),
    })

    return {
      ok: true,
      campaignId,
      gateKey,
      previousState: currentState,
      nextState,
      newRevision,
      committedAt: new Date().toISOString(),
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
      logServerEvent('conflict', {message})
      return {ok: false, error: 'conflict', message: 'Revision mismatch — reload and retry'}
    }
    const isPermission =
      status === 401 ||
      status === 403 ||
      /unauthor|forbidden|insufficient/i.test(message)
    if (isPermission) {
      logServerEvent('permission', {message})
      return {ok: false, error: 'permission', message: 'Sanity token lacks write permission'}
    }
    logServerEvent('error', {stage: 'commit', message})
    return {ok: false, error: 'unknown', message: 'Patch failed'}
  }
}
