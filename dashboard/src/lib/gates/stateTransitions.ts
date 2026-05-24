// Phase 2B-2 humanReviewGate state transition rules.
//
// All values mirror the controlled vocabulary in
// schemas/campaignPlan.ts:546-588 — never extend this set without first
// migrating the schema (Q-2B2-1 CONFIRMED 2026-05-20: schema is unchanged
// in 2B-2, `approved` is operationally `done`, `rejected` is operationally
// `blocked` or `skipped`).
//
// The same allow-list is enforced both in the UI (filters dropdown options)
// and in the server action (`transition-not-allowed` error), per Q-2B2-6.

import type {StatusTone} from '@/lib/statusJa'

export const GATE_STATES = [
  'not-started',
  'in-progress',
  'pending-review',
  'done',
  'blocked',
  'skipped',
] as const

export type HumanReviewGateState = (typeof GATE_STATES)[number]

const TERMINAL_STATES: ReadonlySet<HumanReviewGateState> = new Set(['done', 'skipped'])

// Allow-list per Phase 2B-2 spec §3-2 (boss-confirmed 2026-05-20).
// `done` and `skipped` have no outbound transitions — terminal.
const ALLOWED: Record<HumanReviewGateState, readonly HumanReviewGateState[]> = {
  'not-started': ['in-progress', 'pending-review', 'skipped'],
  'in-progress': ['pending-review', 'blocked', 'done', 'skipped'],
  'pending-review': ['in-progress', 'done', 'blocked', 'skipped'],
  blocked: ['in-progress', 'skipped'],
  done: [],
  skipped: [],
}

// Gate-control-specific Japanese labels. We intentionally do NOT mutate
// statusJa.ts because the canonical labels there ("確認待ち" / "要対応" /
// "今回は保留") are used by many non-gate surfaces (visualAssetPlan,
// platformOutput, etc.) and changing them would ripple. The gate control
// presents its own labels matching the boss-facing terminology for gates.
const GATE_LABELS: Record<HumanReviewGateState, string> = {
  'not-started': '未着手',
  'in-progress': '作業中',
  'pending-review': 'レビュー待ち',
  done: '完了',
  blocked: 'ブロック',
  skipped: 'スキップ',
}

// Tone choices align with statusJa.ts TONE_MAP so badges look consistent.
const GATE_TONES: Record<HumanReviewGateState, StatusTone> = {
  'not-started': 'pending',
  'in-progress': 'progress',
  'pending-review': 'progress',
  done: 'done',
  blocked: 'blocked',
  skipped: 'idle',
}

export function isGateState(value: unknown): value is HumanReviewGateState {
  return typeof value === 'string' && (GATE_STATES as readonly string[]).includes(value)
}

export function isTerminalGateState(state: HumanReviewGateState): boolean {
  return TERMINAL_STATES.has(state)
}

export function getAllowedGateTransitions(
  currentState: HumanReviewGateState,
): readonly HumanReviewGateState[] {
  return ALLOWED[currentState]
}

export function isAllowedGateTransition(
  currentState: HumanReviewGateState,
  nextState: HumanReviewGateState,
): boolean {
  if (currentState === nextState) return false
  return ALLOWED[currentState].includes(nextState)
}

export function gateStateLabel(state: HumanReviewGateState | string | null | undefined): string {
  if (!state) return '未設定'
  if (isGateState(state)) return GATE_LABELS[state]
  return state
}

export function gateStateTone(state: HumanReviewGateState | string | null | undefined): StatusTone {
  if (!state || !isGateState(state)) return 'idle'
  return GATE_TONES[state]
}

/** UI verb for transitioning to a given next state (used in dropdown
 *  option text). Example: 「完了にする」 instead of just the label. */
export function gateTransitionVerb(nextState: HumanReviewGateState): string {
  switch (nextState) {
    case 'not-started':
      return '未着手に戻す'
    case 'in-progress':
      return '作業中にする'
    case 'pending-review':
      return 'レビュー待ちにする'
    case 'done':
      return '完了にする'
    case 'blocked':
      return 'ブロックにする'
    case 'skipped':
      return 'スキップする'
  }
}
