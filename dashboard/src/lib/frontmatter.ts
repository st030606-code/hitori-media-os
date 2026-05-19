// Minimal YAML frontmatter parser for inbox prompt.md / review.md.
//
// Contract: docs/65-inbox-candidate-frontmatter-contract.md
//
// Supported subset:
//   - top-level block mapping
//   - scalar values: string / number / null / true / false / quoted string
//   - nested block mapping (indented children)
//   - block sequence of scalars
//   - block sequence of mappings (- key: value\n  key: value)
//
// Intentionally NOT supported:
//   - flow style ({a: b}, [a, b])
//   - multiline / folded strings (|, >)
//   - anchors / aliases / tags
//   - explicit document markers (--- inside content is treated as the closing
//     fence by `splitFrontmatter`)
//
// Graceful degrade per contract §5: parser never throws to callers — invalid
// input yields { ok: false, value: {}, warnings: [...] }.

export type YamlValue =
  | string
  | number
  | boolean
  | null
  | YamlValue[]
  | {[key: string]: YamlValue}

export interface ParseResult {
  ok: boolean
  value: Record<string, YamlValue>
  warnings: string[]
}

export interface FrontmatterSplit {
  frontmatter: string | null
  body: string
}

// Split a file that may begin with `---\n...\n---\n` into frontmatter and body.
// Returns frontmatter: null if no leading fence is present.
export function splitFrontmatter(raw: string): FrontmatterSplit {
  if (!raw.startsWith('---\n')) return {frontmatter: null, body: raw}
  const end = raw.indexOf('\n---\n', 4)
  if (end < 0) return {frontmatter: null, body: raw}
  return {
    frontmatter: raw.slice(4, end),
    body: raw.slice(end + 5),
  }
}

interface Cursor {
  raw: string[]
  i: number
  warnings: string[]
}

function isBlank(line: string): boolean {
  const t = line.trim()
  return t === '' || t.startsWith('#')
}

function indentOf(line: string): number {
  let n = 0
  while (n < line.length && line[n] === ' ') n++
  return n
}

function skipBlank(c: Cursor): void {
  while (c.i < c.raw.length && isBlank(c.raw[c.i])) c.i++
}

const KEY_RE = /^([A-Za-z_$][\w\-$]*)\s*:\s*(.*)$/

function parseScalar(input: string): YamlValue {
  const s = input.trim()
  if (s === '' || s === 'null' || s === '~') return null
  if (s === 'true') return true
  if (s === 'false') return false
  if (/^-?\d+$/.test(s)) return parseInt(s, 10)
  if (/^-?\d*\.\d+$/.test(s)) return parseFloat(s)
  if (s.length >= 2) {
    if ((s[0] === '"' && s[s.length - 1] === '"') || (s[0] === "'" && s[s.length - 1] === "'")) {
      return s.slice(1, -1)
    }
  }
  return s
}

// Parse a block mapping whose entries all begin at exactly `indent` spaces.
// Stops when a line at lower indent, EOF, or a sequence marker appears.
function parseMappingAt(c: Cursor, indent: number): Record<string, YamlValue> {
  const out: Record<string, YamlValue> = {}
  while (true) {
    skipBlank(c)
    if (c.i >= c.raw.length) break
    const line = c.raw[c.i]
    const lIndent = indentOf(line)
    if (lIndent < indent) break
    if (lIndent > indent) {
      c.warnings.push(`unexpected over-indent at line ${c.i + 1}`)
      // best-effort: skip this line
      c.i++
      continue
    }
    const body = line.slice(indent)
    if (body.startsWith('- ') || body === '-') {
      // sequence at this level — caller should be using parseSequenceAt
      break
    }
    const m = body.match(KEY_RE)
    if (!m) {
      c.warnings.push(`expected mapping key at line ${c.i + 1}: ${line}`)
      break
    }
    const key = m[1]
    const rest = m[2]
    c.i++
    if (rest === '') {
      out[key] = parseValueAfterColon(c, indent)
    } else {
      out[key] = parseScalar(rest)
    }
  }
  return out
}

// After a "key:" line with empty value, peek ahead to decide whether the
// continuation is a deeper mapping, a sequence, or just a null.
function parseValueAfterColon(c: Cursor, parentIndent: number): YamlValue {
  skipBlank(c)
  if (c.i >= c.raw.length) return null
  const next = c.raw[c.i]
  const ind = indentOf(next)
  if (ind <= parentIndent) return null
  const body = next.slice(ind)
  if (body.startsWith('- ') || body === '-') {
    return parseSequenceAt(c, ind)
  }
  return parseMappingAt(c, ind)
}

// Parse a sequence whose `-` markers all begin at exactly `indent` spaces.
function parseSequenceAt(c: Cursor, indent: number): YamlValue[] {
  const out: YamlValue[] = []
  while (true) {
    skipBlank(c)
    if (c.i >= c.raw.length) break
    const line = c.raw[c.i]
    const lIndent = indentOf(line)
    if (lIndent < indent) break
    if (lIndent > indent) {
      c.warnings.push(`unexpected over-indent in sequence at line ${c.i + 1}`)
      c.i++
      continue
    }
    const body = line.slice(indent)
    if (!(body.startsWith('- ') || body === '-')) break
    const after = body === '-' ? '' : body.slice(2)
    c.i++
    if (after === '') {
      // The item is a block whose content begins on the next line, more
      // indented than `indent`.
      out.push(parseValueAfterColon(c, indent))
      continue
    }
    const km = after.match(KEY_RE)
    if (km) {
      // Inline-start mapping: "- key: value", with more keys continuing on
      // subsequent lines at (indent + 2).
      const obj: Record<string, YamlValue> = {}
      const firstKey = km[1]
      const firstRest = km[2]
      if (firstRest === '') {
        obj[firstKey] = parseValueAfterColon(c, indent + 2)
      } else {
        obj[firstKey] = parseScalar(firstRest)
      }
      const more = parseMappingAt(c, indent + 2)
      for (const k of Object.keys(more)) obj[k] = more[k]
      out.push(obj)
      continue
    }
    // Scalar item.
    out.push(parseScalar(after))
  }
  return out
}

export function parseYamlFrontmatter(text: string): ParseResult {
  const c: Cursor = {raw: text.split('\n'), i: 0, warnings: []}
  try {
    const value = parseMappingAt(c, 0)
    return {ok: true, value, warnings: c.warnings}
  } catch (err) {
    return {
      ok: false,
      value: {},
      warnings: [...c.warnings, err instanceof Error ? err.message : String(err)],
    }
  }
}

// Convenience helper used by inboxReader: split + parse in one pass.
export function readFrontmatter(raw: string): {
  meta: Record<string, YamlValue>
  body: string
  hasFrontmatter: boolean
  warnings: string[]
} {
  const {frontmatter, body} = splitFrontmatter(raw)
  if (frontmatter === null) {
    return {meta: {}, body, hasFrontmatter: false, warnings: []}
  }
  const parsed = parseYamlFrontmatter(frontmatter)
  return {
    meta: parsed.value,
    body,
    hasFrontmatter: true,
    warnings: parsed.warnings,
  }
}
