# Devlog 0204 — Phase 2C-4 Platform Output Studio URL Fix

Date: 2026-05-22

## Summary

Implemented the Phase 2C-4 smoke fix for `platformOutput` Studio links.

Boss smoke confirmed `platformOutput` creation works, duplicate blocking works, and no publish/campaign side effects were observed. The remaining issue was that the success / duplicate link opened Studio root instead of the exact created `platformOutput` document.

## Root Cause

Phase 2C-4 intentionally used Studio root because the `platformOutput` structure path had not been verified. That was safe, but not product-like enough after boss confirmed creation works.

## Structure Path Confirmed

`structure/index.ts` defines the flat type browser as:

- root list item id: `by-type`
- `platformOutput` list item id: `by-type-platformOutput`

Therefore the document deep link is:

```text
/structure/by-type;by-type-platformOutput;<documentId>
```

Example:

```text
http://localhost:3333/structure/by-type;by-type-platformOutput;platformOutput.obsidian-ai-sanity.note.20260522-114149
```

## Changes

- Added `studioPlatformOutputsListUrl()`.
- Added `studioPlatformOutputUrl(documentId)`.
- Updated `createPlatformOutputFromDraft` to return the platformOutput-specific URL for:
  - preview planned doc link
  - execute success link
  - duplicate existing doc link
- Updated `PlatformOutputCreateCard` to show direct duplicate links.

## Validation

- `cd dashboard && npm run build`: passed.
- `npm run build`: passed.

Known unrelated warning:

- Existing Turbopack NFT warning for `publishPackageReader.ts` trace remains.

## Status

Studio URL fix implemented. Phase 2C-4 is still awaiting boss re-smoke and is not marked smoke PASS yet.
