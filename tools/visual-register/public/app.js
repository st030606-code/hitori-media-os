const serverStatus = document.querySelector('#serverStatus')
const imageInput = document.querySelector('#imageInput')
const testSeedNotice = document.querySelector('#testSeedNotice')
const contentIdeaFilter = document.querySelector('#contentIdeaFilter')
const platformFilter = document.querySelector('#platformFilter')
const assetTypeFilter = document.querySelector('#assetTypeFilter')
const contentIdeaSummary = document.querySelector('#contentIdeaSummary')
const registerAllButton = document.querySelector('#registerAllButton')
const queueEmpty = document.querySelector('#queueEmpty')
const queueTable = document.querySelector('#queueTable')
const queueBody = document.querySelector('#queueBody')
const preview = document.querySelector('#preview')
const previewEmpty = document.querySelector('#previewEmpty')
const planDetails = document.querySelector('#planDetails')
const patchPath = document.querySelector('#patchPath')
const toast = document.querySelector('#toast')
const reloadPatchesButton = document.querySelector('#reloadPatchesButton')
const patchEmpty = document.querySelector('#patchEmpty')
const patchReviewGrid = document.querySelector('#patchReviewGrid')
const patchBody = document.querySelector('#patchBody')
const patchDetails = document.querySelector('#patchDetails')

let plans = []
let queue = []
let patches = []
let activeRowId = ''
let activePatchPath = ''
let patchLoadError = ''
let activeContentIdeaFilter = 'all'
let toastTimer = 0
let includeTestSeeds = false
let loadedSeedFiles = []
let failedSeedFiles = []
let testSeedFiles = []
let contentIdeaIds = []
let seedDebugWarnings = []
let activePlatformFilter = 'all'
let activeAssetTypeFilter = 'all'

const statusLabels = {
  ready: '未登録',
  registering: '登録中',
  saved: '登録完了',
  skipped: '確認待ち',
  error: 'エラー',
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function showToast(message, tone = 'success') {
  window.clearTimeout(toastTimer)
  toast.textContent = message
  toast.className = `toast isVisible ${tone}`
  toastTimer = window.setTimeout(() => {
    toast.className = 'toast'
  }, 3600)
}

async function fetchJson(url, options) {
  const response = await fetch(url, options)
  const raw = await response.text()
  let data = {}

  if (raw) {
    try {
      data = JSON.parse(raw)
    } catch {
      const message = raw.length > 120 ? `${raw.slice(0, 120)}...` : raw
      throw new Error(`APIレスポンスをJSONとして読めませんでした: ${message}`)
    }
  }

  if (!response.ok) {
    throw new Error(data.error || `APIエラー: ${response.status}`)
  }

  return data
}

function selectedPlanFor(row) {
  return plans.find((plan) => plan._id === row.planId)
}

function pathForRow(row) {
  return selectedPlanFor(row)?.expectedLocalAssetPath || '-'
}

function patchForRow(row) {
  return selectedPlanFor(row)?.expectedPatchPath || '-'
}

function contentIdeaIdForPlan(plan) {
  return plan?.sourceContentIdeaId || plan?.sourceContentIdea?._ref || '-'
}

function contentSlugForPlan(plan) {
  return plan?.contentSlug || contentIdeaIdForPlan(plan).replace(/^contentIdea\./, '') || '-'
}

function contentIdeaLabelForPlan(plan) {
  const slug = contentSlugForPlan(plan)
  const id = contentIdeaIdForPlan(plan)
  if (slug && slug !== '-' && id && id !== '-') return `${slug} / ${id}`
  return id || slug || '-'
}

function contentIdeaKeyForPlan(plan) {
  return contentIdeaIdForPlan(plan)
}

function contentIdeaOptions() {
  const map = new Map()
  for (const plan of plans) {
    const key = contentIdeaKeyForPlan(plan)
    if (!map.has(key)) {
      map.set(key, {
        key,
        slug: contentSlugForPlan(plan),
        label: contentIdeaLabelForPlan(plan),
        count: 0,
      })
    }
    map.get(key).count += 1
  }
  return [...map.values()].sort((a, b) => a.slug.localeCompare(b.slug))
}

function plansForActiveContentIdeaOnly() {
  if (activeContentIdeaFilter === 'all') return plans
  return plans.filter((plan) => contentIdeaKeyForPlan(plan) === activeContentIdeaFilter)
}

function matchesPlatformFilter(plan) {
  return activePlatformFilter === 'all' || plan?.targetPlatform === activePlatformFilter
}

function matchesAssetTypeFilter(plan) {
  return activeAssetTypeFilter === 'all' || plan?.assetType === activeAssetTypeFilter
}

function plansForActiveFilters() {
  return plansForActiveContentIdeaOnly().filter(
    (plan) => matchesPlatformFilter(plan) && matchesAssetTypeFilter(plan),
  )
}

function planMatchesActiveContentIdea(plan) {
  return activeContentIdeaFilter === 'all' || contentIdeaKeyForPlan(plan) === activeContentIdeaFilter
}

function planMatchesActiveFilters(plan) {
  return planMatchesActiveContentIdea(plan) && matchesPlatformFilter(plan) && matchesAssetTypeFilter(plan)
}

function plansForRow(row) {
  const filtered = plansForActiveFilters()
  const selected = selectedPlanFor(row)
  if (!selected || filtered.some((plan) => plan._id === selected._id)) return filtered
  return [selected, ...filtered]
}

function uniqueSortedValues(items, fieldName) {
  return [...new Set(items.map((item) => item?.[fieldName]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  )
}

function renderSelectOptions(selectElement, values, activeValue, allLabel) {
  const selectedStillExists = activeValue === 'all' || values.includes(activeValue)
  const nextActiveValue = selectedStillExists ? activeValue : 'all'
  selectElement.innerHTML = [
    `<option value="all" ${nextActiveValue === 'all' ? 'selected' : ''}>${escapeHtml(allLabel)}</option>`,
    ...values.map(
      (value) => `<option value="${escapeHtml(value)}" ${value === nextActiveValue ? 'selected' : ''}>${escapeHtml(value)}</option>`,
    ),
  ].join('')
  selectElement.disabled = values.length <= 1
  return nextActiveValue
}

function duplicatePathSet() {
  const counts = new Map()
  for (const row of queue) {
    const path = pathForRow(row)
    if (path === '-') continue
    counts.set(path, (counts.get(path) || 0) + 1)
  }
  return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([path]) => path))
}

function hasDuplicatePath(row) {
  return duplicatePathSet().has(pathForRow(row))
}

function canRegisterRow(row) {
  const plan = selectedPlanFor(row)
  const registered = row.status === 'saved'
  const overwriteBlocked =
    !registered && Boolean(plan?.expectedLocalAssetExists) && row.overwriteConfirmed !== true
  return (
    row.planId &&
    row.dataUrl &&
    !registered &&
    row.status !== 'registering' &&
    !hasDuplicatePath(row) &&
    !overwriteBlocked
  )
}

function canRegisterAll() {
  return queue.some((row) => canRegisterRow(row) && row.status !== 'saved')
}

function renderContentIdeaFilter() {
  const options = contentIdeaOptions()
  const total = plans.length
  const selectedStillExists =
    activeContentIdeaFilter === 'all' || options.some((option) => option.key === activeContentIdeaFilter)

  if (!selectedStillExists) activeContentIdeaFilter = 'all'

  contentIdeaFilter.innerHTML = [
    `<option value="all" ${activeContentIdeaFilter === 'all' ? 'selected' : ''}>すべて / All Content Ideas (${total})</option>`,
    ...options.map(
      (option) =>
        `<option value="${escapeHtml(option.key)}" ${option.key === activeContentIdeaFilter ? 'selected' : ''}>${escapeHtml(option.slug)} / ${escapeHtml(option.key)} (${option.count})</option>`,
    ),
  ].join('')

  contentIdeaFilter.disabled = options.length <= 1

  const contentScopedPlans = plansForActiveContentIdeaOnly()
  activePlatformFilter = renderSelectOptions(
    platformFilter,
    uniqueSortedValues(contentScopedPlans, 'targetPlatform'),
    activePlatformFilter,
    'すべて / All Platforms',
  )
  const platformScopedPlans = contentScopedPlans.filter((plan) => matchesPlatformFilter(plan))
  activeAssetTypeFilter = renderSelectOptions(
    assetTypeFilter,
    uniqueSortedValues(platformScopedPlans, 'assetType'),
    activeAssetTypeFilter,
    'すべて / All Asset Types',
  )

  const activeOption = options.find((option) => option.key === activeContentIdeaFilter)
  const visibleCount = plansForActiveFilters().length
  contentIdeaSummary.textContent =
    activeContentIdeaFilter === 'all'
      ? `全Content IdeaのvisualAssetPlanを表示中: ${visibleCount} / ${total}件`
      : `${activeOption?.label || activeContentIdeaFilter} のvisualAssetPlanを表示中: ${visibleCount} / ${total}件`

  if (visibleCount === 0 && total > 0) {
    contentIdeaSummary.textContent += ' / 条件に合う登録先プランがありません。filterを戻してください。'
  }

  if (includeTestSeeds) {
    contentIdeaSummary.textContent += ` / test seed込み: ${loadedSeedFiles.length} files / Content Ideas: ${contentIdeaIds.length}`
    if (testSeedFiles.length === 0 || plans.length <= 5 || seedDebugWarnings.length > 0 || failedSeedFiles.length > 0) {
      const issueParts = []
      if (testSeedFiles.length === 0) issueParts.push('test seed file未検出')
      if (plans.length <= 5) issueParts.push(`plan count ${plans.length}`)
      if (failedSeedFiles.length > 0) issueParts.push(`failed ${failedSeedFiles.length}`)
      if (seedDebugWarnings.length > 0) issueParts.push(seedDebugWarnings[0])
      contentIdeaSummary.textContent += ` / 要確認: ${issueParts.join(' / ')}`
    }
  }
}

function planOptions(row) {
  const groups = new Map()
  for (const plan of plansForRow(row)) {
    const key = contentIdeaKeyForPlan(plan)
    if (!groups.has(key)) {
      groups.set(key, {
        label: contentIdeaLabelForPlan(plan),
        plans: [],
      })
    }
    groups.get(key).plans.push(plan)
  }

  return [...groups.values()]
    .map((group) => {
      const options = group.plans
        .map((plan) => {
          const selected = plan._id === row.planId ? 'selected' : ''
          const outsideFilter = !planMatchesActiveFilters(plan) ? ' / 現在選択中' : ''
          const label = `${plan.title || plan._id} / ${plan.targetPlatform || '-'} / ${plan.assetType || '-'}${outsideFilter}`
          return `<option value="${escapeHtml(plan._id)}" ${selected}>${escapeHtml(label)}</option>`
        })
        .join('')
      return `<optgroup label="${escapeHtml(group.label)}">${options}</optgroup>`
    })
    .join('')
}

function renderQueue() {
  renderContentIdeaFilter()
  queueEmpty.hidden = queue.length > 0
  queueTable.hidden = queue.length === 0
  registerAllButton.disabled = !canRegisterAll()

  const duplicatePaths = duplicatePathSet()
  queueBody.innerHTML = queue
    .map((row) => {
      const plan = selectedPlanFor(row)
      const expectedPath = pathForRow(row)
      const isActive = row.id === activeRowId
      const duplicate = duplicatePaths.has(expectedPath)
      const existingFile = Boolean(plan?.expectedLocalAssetExists)
      const registered = row.status === 'saved'
      const overwriteBlocked = !registered && existingFile && row.overwriteConfirmed !== true
      const warning = duplicate
        ? '<p class="warningText">同じ保存予定パスが重複しています。別のplanを選んでください。</p>'
        : ''
      const existingWarning = existingFile && !registered
        ? `<p class="warningText">既存ファイルがあります。上書きする場合のみ確認してください。</p>
          <label class="overwriteCheck">
            <input type="checkbox" data-action="overwrite" data-row-id="${escapeHtml(row.id)}" ${row.overwriteConfirmed ? 'checked' : ''} />
            <span>この画像で上書きする</span>
          </label>`
        : ''
      const savedMessage = registered
        ? `<p class="successText">保存済み / Patch作成済み</p>
          <p class="rowMessage">${escapeHtml(row.patchPath ? `Patch: ${row.patchPath}` : '')}</p>`
        : ''
      const statusTone =
        row.status === 'saved' ? 'saved' : row.status === 'error' || overwriteBlocked ? 'error' : 'ready'
      return `
        <tr class="${isActive ? 'isActive' : ''}" data-row-id="${escapeHtml(row.id)}">
          <td>
            <button class="imageCell" type="button" data-action="select" data-row-id="${escapeHtml(row.id)}">
              <img src="${escapeHtml(row.dataUrl)}" alt="" />
              <span>
                <strong>${escapeHtml(row.file.name)}</strong>
                <small>${formatBytes(row.file.size)}</small>
              </span>
            </button>
          </td>
          <td>
            <label class="srOnly" for="plan-${escapeHtml(row.id)}">登録先プラン</label>
            <select id="plan-${escapeHtml(row.id)}" data-action="plan" data-row-id="${escapeHtml(row.id)}">
              ${planOptions(row)}
            </select>
            <div class="chipRow">
              <span class="chip">${escapeHtml(plan?.targetPlatform || '-')}</span>
              <span class="chip">${escapeHtml(plan?.assetType || '-')}</span>
            </div>
          </td>
          <td>
            <code class="pathText">${escapeHtml(expectedPath)}</code>
            ${warning}
            ${existingWarning}
          </td>
          <td>
            <span class="statusPill ${statusTone}">${escapeHtml(statusLabels[row.status] || row.status)}</span>
            ${existingFile && !registered ? '<span class="fileExistsChip">既存ファイルあり</span>' : ''}
            ${registered ? '<span class="fileExistsChip saved">保存済み</span>' : ''}
            ${savedMessage}
            ${row.message ? `<p class="rowMessage">${escapeHtml(row.message)}</p>` : ''}
          </td>
          <td>
            <div class="rowActions">
              <button class="secondaryButton" type="button" data-action="register" data-row-id="${escapeHtml(row.id)}" ${canRegisterRow(row) ? '' : 'disabled'}>${registered ? '登録済み' : '登録'}</button>
              <button class="iconButton" type="button" data-action="remove" data-row-id="${escapeHtml(row.id)}" aria-label="行を削除">削除</button>
            </div>
          </td>
        </tr>
      `
    })
    .join('')

  renderDetails()
}

function renderDetails() {
  const row = queue.find((item) => item.id === activeRowId) || queue[0]
  if (!row) {
    preview.removeAttribute('src')
    preview.classList.remove('isVisible')
    previewEmpty.hidden = false
    planDetails.innerHTML = ''
    patchPath.textContent = '-'
    return
  }

  activeRowId = row.id
  const plan = selectedPlanFor(row)
  preview.src = row.dataUrl
  preview.classList.add('isVisible')
  previewEmpty.hidden = true
  patchPath.textContent = patchForRow(row)
  planDetails.innerHTML = `
    <div class="detailTitle">${escapeHtml(plan?.title || '未選択')}</div>
    <div class="chipRow">
      <span class="chip strong">ステータス: ${escapeHtml(plan?.status || '-')}</span>
      <span class="chip strong">コンテンツアイデア: ${escapeHtml(contentIdeaLabelForPlan(plan))}</span>
      <span class="chip">媒体: ${escapeHtml(plan?.targetPlatform || '-')}</span>
      <span class="chip">種別: ${escapeHtml(plan?.assetType || '-')}</span>
    </div>
    <dl>
      <dt>保存予定パス</dt><dd>${escapeHtml(pathForRow(row))}</dd>
      <dt>コンテンツアイデア（Content Idea）</dt><dd>${escapeHtml(contentIdeaLabelForPlan(plan))}</dd>
      <dt>配置（Placement）</dt><dd>${escapeHtml(plan?.placement || '-')}</dd>
      <dt>比率（Aspect Ratio）</dt><dd>${escapeHtml(plan?.aspectRatio || '-')}</dd>
      <dt>目的（Purpose）</dt><dd>${escapeHtml(plan?.purpose || '-')}</dd>
    </dl>
  `
}

function validationChip(label, ok) {
  return `<span class="validationChip ${ok ? 'ok' : 'issue'}">${escapeHtml(label)}</span>`
}

function renderPatchReview() {
  if (patchLoadError) {
    patchEmpty.hidden = false
    patchEmpty.textContent = patchLoadError
    patchReviewGrid.hidden = true
    patchBody.innerHTML = ''
    patchDetails.textContent = 'Patch Reviewの読み込みに失敗しました。'
    return
  }

  patchEmpty.hidden = patches.length > 0
  patchEmpty.textContent = 'patch JSONがまだありません。'
  patchReviewGrid.hidden = patches.length === 0

  if (patches.length > 0 && !patches.some((patch) => patch.filePath === activePatchPath)) {
    activePatchPath = patches[0].filePath
  }

  patchBody.innerHTML = patches
    .map((patch) => {
      const isActive = patch.filePath === activePatchPath
      const imageExists = Boolean(patch.validation?.localAssetPathExists)
      const ok = Boolean(patch.validation?.ok)
      return `
        <tr class="${isActive ? 'isActive' : ''}">
          <td>
            <button class="patchSelectButton" type="button" data-action="select-patch" data-patch-path="${escapeHtml(patch.filePath)}">
              ${escapeHtml(patch.filePath)}
            </button>
          </td>
          <td><code class="pathText">${escapeHtml(patch._id || '-')}</code></td>
          <td>${validationChip(ok ? '確認OK' : '要確認', ok)}</td>
          <td>${validationChip(imageExists ? '画像あり' : '画像なし', imageExists)}</td>
        </tr>
      `
    })
    .join('')

  renderPatchDetails()
}

function renderPatchDetails() {
  const patch = patches.find((item) => item.filePath === activePatchPath)
  if (!patch) {
    patchDetails.textContent = 'patchを選択してください。'
    return
  }

  const set = patch.set || {}
  const meta = patch.meta || {}
  const validation = patch.validation || {}
  const compactBlock = [
    `target: ${patch._id || '-'}`,
    `localAssetPath: ${set.localAssetPath || '-'}`,
    `status: ${set.status || '-'}`,
    `updatedAt: ${set.updatedAt || '-'}`,
    `reviewNotes: ${set.reviewNotes || '-'}`,
  ].join('\n')
  patchDetails.innerHTML = `
    <div class="chipRow">
      ${validationChip(validation.validJson ? 'JSON OK' : 'JSON NG', validation.validJson)}
      ${validationChip(validation.localAssetPathExists ? '画像あり' : '画像なし', validation.localAssetPathExists)}
      ${validationChip(validation.safeLocalAssetPath ? '安全なパス' : 'パス要確認', validation.safeLocalAssetPath)}
      ${validationChip(validation.directSanityWrite ? 'direct writeあり' : 'direct writeなし', !validation.directSanityWrite)}
      ${validationChip(validation.hasSecretLikeValue ? 'secret要確認' : 'secretなし', !validation.hasSecretLikeValue)}
    </div>
    <div class="copyGrid" aria-label="Patch copy actions">
      <button class="copyButton" type="button" data-action="copy-patch" data-copy-kind="localAssetPath">localAssetPathをコピー</button>
      <button class="copyButton" type="button" data-action="copy-patch" data-copy-kind="status">statusをコピー</button>
      <button class="copyButton" type="button" data-action="copy-patch" data-copy-kind="reviewNotes">reviewNotesをコピー</button>
      <button class="copyButton" type="button" data-action="copy-patch" data-copy-kind="updatedAt">updatedAtをコピー</button>
      <button class="copyButton wide" type="button" data-action="copy-patch" data-copy-kind="compact">patch fieldsをまとめてコピー</button>
    </div>
    <section class="studioMemo">
      <h4>Studio反映メモ</h4>
      <ol>
        <li>Sanity Studioで対象visualAssetPlanを開く。</li>
        <li>localAssetPathをコピーして貼り付ける。</li>
        <li>statusを確認して更新する。</li>
        <li>reviewNotesを確認する。</li>
        <li>保存する。</li>
      </ol>
      <pre>${escapeHtml(compactBlock)}</pre>
    </section>
    <dl>
      <dt>対象ID</dt><dd><code>${escapeHtml(patch._id || '-')}</code></dd>
      <dt>Patch file</dt><dd><code>${escapeHtml(patch.filePath)}</code></dd>
      <dt>localAssetPath</dt><dd><code>${escapeHtml(set.localAssetPath || '-')}</code></dd>
      <dt>status</dt><dd>${escapeHtml(set.status || '-')}</dd>
      <dt>updatedAt</dt><dd>${escapeHtml(set.updatedAt || '-')}</dd>
      <dt>reviewNotes</dt><dd>${escapeHtml(set.reviewNotes || '-')}</dd>
      <dt>generatedBy</dt><dd>${escapeHtml(meta.generatedBy || '-')}</dd>
      <dt>originalFileName</dt><dd>${escapeHtml(meta.originalFileName || '-')}</dd>
      <dt>mimeType</dt><dd>${escapeHtml(meta.mimeType || '-')}</dd>
    </dl>
  `
}

function patchCopyValue(patch, kind) {
  const set = patch?.set || {}
  if (kind === 'localAssetPath') return set.localAssetPath || ''
  if (kind === 'status') return set.status || ''
  if (kind === 'reviewNotes') return set.reviewNotes || ''
  if (kind === 'updatedAt') return set.updatedAt || ''
  if (kind === 'compact') {
    return [
      `target: ${patch._id || '-'}`,
      `localAssetPath: ${set.localAssetPath || '-'}`,
      `status: ${set.status || '-'}`,
      `updatedAt: ${set.updatedAt || '-'}`,
      `reviewNotes: ${set.reviewNotes || '-'}`,
    ].join('\n')
  }
  return ''
}

async function copyTextToClipboard(value) {
  if (!value) {
    showToast('コピーする値がありません。', 'error')
    return
  }
  if (!navigator.clipboard?.writeText) {
    showToast('Clipboard APIが使えません。画面上の値を手動でコピーしてください。', 'error')
    return
  }
  try {
    await navigator.clipboard.writeText(value)
    showToast('コピーしました。')
  } catch {
    showToast('コピーできませんでした。画面上の値を手動でコピーしてください。', 'error')
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function loadPlans() {
  const health = await fetchJson('/api/health')
  serverStatus.textContent = health.ok ? '準備完了（Ready）' : '確認が必要（Issue）'
  serverStatus.classList.toggle('ready', Boolean(health.ok))
  includeTestSeeds = Boolean(health.includeTestSeeds)
  failedSeedFiles = health.failedSeedFiles || []
  testSeedFiles = health.testSeedFiles || []
  contentIdeaIds = health.contentIdeaIds || []
  seedDebugWarnings = health.debugWarnings || []
  testSeedNotice.hidden = !includeTestSeeds

  const data = await fetchJson('/api/visual-asset-plans')
  includeTestSeeds = Boolean(data.includeTestSeeds)
  loadedSeedFiles = data.seedFiles || []
  failedSeedFiles = data.failedSeedFiles || []
  testSeedFiles = data.testSeedFiles || []
  contentIdeaIds = data.contentIdeaIds || []
  seedDebugWarnings = data.debugWarnings || []
  testSeedNotice.hidden = !includeTestSeeds
  if (includeTestSeeds) {
    const failedText = failedSeedFiles.length > 0 ? ` / failed: ${failedSeedFiles.length}` : ''
    const warningText = seedDebugWarnings.length > 0 ? ` / ${seedDebugWarnings[0]}` : ''
    testSeedNotice.textContent = `Test seed mode: ${data.count || 0} plans / ${contentIdeaIds.length} Content Ideas / ${loadedSeedFiles.length} seed files${failedText}${warningText}`
  }
  plans = data.plans || []
  renderQueue()
}

async function loadPatches() {
  try {
    const data = await fetchJson('/api/visual-patches')
    patchLoadError = ''
    patches = data.patches || []
    renderPatchReview()
    return true
  } catch (error) {
    patchLoadError = `Patch Reviewを読み込めませんでした: ${
      error instanceof Error ? error.message : String(error)
    }`
    patches = []
    renderPatchReview()
    return false
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result || '')))
    reader.addEventListener('error', () => reject(reader.error))
    reader.readAsDataURL(file)
  })
}

async function addFiles(files) {
  const imageFiles = [...files].filter((file) => file.type.startsWith('image/'))
  if (imageFiles.length === 0) {
    showToast('画像ファイルを選択してください。', 'error')
    return
  }

  const candidatePlans = plansForActiveFilters()
  const firstUnusedPlans = plans.filter((plan) => !queue.some((row) => row.planId === plan._id))
  const firstUnusedFilteredPlans = candidatePlans.filter((plan) => !queue.some((row) => row.planId === plan._id))
  for (const [index, file] of imageFiles.entries()) {
    const dataUrl = await readFileAsDataUrl(file)
    const plan = firstUnusedFilteredPlans[index] || firstUnusedPlans[index] || candidatePlans[0] || plans[0]
    const row = {
      id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
      file,
      dataUrl,
      planId: plan?._id || '',
      status: 'ready',
      message: '',
      overwriteConfirmed: false,
      localAssetPath: '',
      patchPath: '',
    }
    queue.push(row)
    activeRowId = row.id
  }

  imageInput.value = ''
  renderQueue()
  showToast(`${imageFiles.length}件の画像をキューに追加しました。`)
}

async function registerRow(rowId) {
  const row = queue.find((item) => item.id === rowId)
  if (!row || !canRegisterRow(row)) return

  row.status = 'registering'
  row.message = ''
  renderQueue()

  try {
    const data = await fetchJson('/api/register-visual', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        visualAssetPlanId: row.planId,
        fileName: row.file.name,
        dataUrl: row.dataUrl,
        overwriteConfirmed: row.overwriteConfirmed === true,
      }),
    })
    row.status = 'saved'
    row.localAssetPath = data.localAssetPath || pathForRow(row)
    row.patchPath = data.patchPath || patchForRow(row)
    row.message = `保存: ${row.localAssetPath}`
    row.overwriteConfirmed = false
    const plan = selectedPlanFor(row)
    if (plan) plan.expectedLocalAssetExists = true
    const patchesLoaded = await loadPatches()
    showToast('登録完了')
    if (!patchesLoaded) {
      showToast('登録は完了しました。Patch Reviewの更新だけ失敗しました。', 'error')
    }
  } catch (error) {
    row.status = 'error'
    row.message = error instanceof Error ? error.message : String(error)
    showToast('登録に失敗しました。', 'error')
  } finally {
    renderQueue()
  }
}

async function registerAll() {
  const targets = queue.filter((row) => canRegisterRow(row) && row.status !== 'saved')
  const overwriteBlocked = queue.filter((row) => {
    const plan = selectedPlanFor(row)
    return (
      row.status !== 'saved' &&
      Boolean(plan?.expectedLocalAssetExists) &&
      row.overwriteConfirmed !== true
    )
  })
  if (targets.length === 0) {
    if (overwriteBlocked.length > 0) {
      showToast('既存ファイルがある行は、上書き確認が必要です。', 'error')
    }
    return
  }
  if (overwriteBlocked.length > 0) {
    showToast(`${overwriteBlocked.length}件は上書き確認がないためスキップします。`, 'error')
  }

  registerAllButton.disabled = true
  for (const row of targets) {
    await registerRow(row.id)
  }
}

imageInput.addEventListener('change', () => {
  addFiles(imageInput.files || []).catch((error) => {
    showToast(error instanceof Error ? error.message : String(error), 'error')
  })
})

queueBody.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return
  const target = event.target.closest('[data-action]')
  if (!target) return
  const rowId = target.dataset.rowId
  const action = target.dataset.action

  if (action === 'select') {
    activeRowId = rowId
    renderQueue()
    return
  }

  if (action === 'remove') {
    queue = queue.filter((row) => row.id !== rowId)
    if (activeRowId === rowId) activeRowId = queue[0]?.id || ''
    renderQueue()
    return
  }

  if (action === 'register') {
    registerRow(rowId)
  }
})

queueBody.addEventListener('change', (event) => {
  if (!(event.target instanceof Element)) return
  const overwriteTarget = event.target.closest('[data-action="overwrite"]')
  if (overwriteTarget) {
    const row = queue.find((item) => item.id === overwriteTarget.dataset.rowId)
    if (!row) return
    row.overwriteConfirmed = Boolean(overwriteTarget.checked)
    row.message = row.overwriteConfirmed ? '上書き確認済み' : ''
    activeRowId = row.id
    renderQueue()
    return
  }

  const target = event.target.closest('[data-action="plan"]')
  if (!target) return
  const row = queue.find((item) => item.id === target.dataset.rowId)
  if (!row) return
  row.planId = target.value
  row.status = row.status === 'saved' ? 'ready' : row.status
  row.message = ''
  row.overwriteConfirmed = false
  activeRowId = row.id
  renderQueue()
})

registerAllButton.addEventListener('click', () => {
  registerAll()
})

contentIdeaFilter.addEventListener('change', () => {
  activeContentIdeaFilter = contentIdeaFilter.value || 'all'
  activePlatformFilter = 'all'
  activeAssetTypeFilter = 'all'
  renderQueue()
  showToast('Content Idea filterを更新しました。')
})

platformFilter.addEventListener('change', () => {
  activePlatformFilter = platformFilter.value || 'all'
  activeAssetTypeFilter = 'all'
  renderQueue()
  showToast('Platform filterを更新しました。')
})

assetTypeFilter.addEventListener('change', () => {
  activeAssetTypeFilter = assetTypeFilter.value || 'all'
  renderQueue()
  showToast('Asset Type filterを更新しました。')
})

reloadPatchesButton.addEventListener('click', () => {
  loadPatches()
    .then((ok) => {
      showToast(ok ? 'Patch Reviewを更新しました。' : 'Patch Reviewを読み込めませんでした。', ok ? 'success' : 'error')
    })
})

patchBody.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return
  const target = event.target.closest('[data-action="select-patch"]')
  if (!target) return
  activePatchPath = target.dataset.patchPath || ''
  renderPatchReview()
})

patchDetails.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return
  const target = event.target.closest('[data-action="copy-patch"]')
  if (!target) return
  const patch = patches.find((item) => item.filePath === activePatchPath)
  const kind = target.dataset.copyKind || ''
  copyTextToClipboard(patchCopyValue(patch, kind))
})

// ===== Inbox Review =====

const reloadInboxButton = document.querySelector('#reloadInboxButton')
const inboxStatusFilter = document.querySelector('#inboxStatusFilter')
const inboxSlugFilter = document.querySelector('#inboxSlugFilter')
const inboxEmpty = document.querySelector('#inboxEmpty')
const inboxList = document.querySelector('#inboxList')
const inboxSummary = document.querySelector('#inboxSummary')

let inboxCandidates = []
let inboxSummaryData = {}
let activeInboxStatusFilter = 'all'
let activeInboxSlugFilter = 'all'

async function loadInbox() {
  try {
    const data = await fetchJson('/api/inbox/candidates')
    inboxCandidates = Array.isArray(data.candidates) ? data.candidates : []
    inboxSummaryData = data.summary || {}

    const slugs = [...new Set(inboxCandidates.map((c) => c.contentSlug))].sort()
    const slugOptions = ['<option value="all">すべて</option>'].concat(
      slugs.map((slug) => `<option value="${escapeHtml(slug)}">${escapeHtml(slug)}</option>`),
    )
    inboxSlugFilter.innerHTML = slugOptions.join('')
    if (!slugs.includes(activeInboxSlugFilter) && activeInboxSlugFilter !== 'all') {
      activeInboxSlugFilter = 'all'
    }
    inboxSlugFilter.value = activeInboxSlugFilter

    renderInbox()
    return true
  } catch (error) {
    inboxCandidates = []
    inboxSummaryData = {}
    renderInbox()
    showToast(error instanceof Error ? error.message : String(error), 'error')
    return false
  }
}

function renderInbox() {
  const total = inboxCandidates.length
  const filtered = inboxCandidates.filter((c) => {
    if (activeInboxStatusFilter !== 'all' && c.reviewStatus !== activeInboxStatusFilter) return false
    if (activeInboxSlugFilter !== 'all' && c.contentSlug !== activeInboxSlugFilter) return false
    return true
  })

  const summaryParts = [
    `total: ${total}`,
    `candidate: ${inboxSummaryData.candidate || 0}`,
    `approved: ${inboxSummaryData.approved || 0}`,
    `rejected: ${inboxSummaryData.rejected || 0}`,
    `needs-regen: ${inboxSummaryData['needs-regeneration'] || 0}`,
    `registered: ${inboxSummaryData.registered || 0}`,
  ]
  inboxSummary.textContent = summaryParts.join(' / ')

  if (filtered.length === 0) {
    inboxEmpty.hidden = false
    inboxList.hidden = true
    inboxEmpty.textContent =
      total === 0
        ? 'まだ候補画像がありません。assets/inbox/generated/<content-slug>/ に画像を置いてから「再読み込み」を押してください。'
        : '現在のフィルタ条件に該当する候補がありません。'
    return
  }

  inboxEmpty.hidden = true
  inboxList.hidden = false
  inboxList.innerHTML = filtered.map(renderInboxItem).join('')
}

function plansForInboxSlug(slug) {
  if (!slug) return plans
  return plans.filter((plan) => contentSlugForPlan(plan) === slug)
}

function renderInboxItem(candidate) {
  const slugPlans = plansForInboxSlug(candidate.contentSlug)
  const planOptions = ['<option value="">プランを選択してください</option>']
    .concat(
      slugPlans.map((plan) => {
        const selected = plan._id === candidate.suggestedAssetPlanId ? ' selected' : ''
        const label = plan.title ? `${plan.title} （${plan._id}）` : plan._id
        return `<option value="${escapeHtml(plan._id)}"${selected}>${escapeHtml(label)}</option>`
      }),
    )
    .join('')

  const statusClass = `inboxStatus inboxStatus--${escapeHtml(candidate.reviewStatus)}`
  const overwriteWarn =
    candidate.expectedFinalExists && candidate.reviewStatus !== 'registered'
      ? '<p class="inboxWarn">最終パスにすでにファイルがあります。承認するときに上書き確認が必要です。</p>'
      : ''
  const finalLine = candidate.finalAssetPath
    ? `<dt>Saved</dt><dd class="monoText">${escapeHtml(candidate.finalAssetPath)}</dd>`
    : ''
  const patchLine = candidate.patchPath
    ? `<dt>Patch</dt><dd class="monoText">${escapeHtml(candidate.patchPath)}</dd>`
    : ''

  return `<article class="inboxItem" data-relative-path="${escapeHtml(candidate.relativePath)}">
    <div class="inboxItemImage">
      <img src="/inbox-image?path=${encodeURIComponent(candidate.relativePath)}" alt="${escapeHtml(candidate.fileName)}" loading="lazy" />
    </div>
    <div class="inboxItemBody">
      <header class="inboxItemHeader">
        <h3>${escapeHtml(candidate.fileName)}</h3>
        <span class="${statusClass}">${escapeHtml(candidate.reviewStatus)}</span>
      </header>
      <dl class="inboxItemMeta">
        <dt>Slug</dt><dd>${escapeHtml(candidate.contentSlug)}</dd>
        <dt>Inbox</dt><dd class="monoText">${escapeHtml(candidate.relativePath)}</dd>
        <dt>Plan</dt><dd>
          <select class="inboxPlanSelect" data-action="set-plan">${planOptions}</select>
        </dd>
        <dt>Final</dt><dd class="monoText">${escapeHtml(candidate.expectedFinalPath || '-')}</dd>
        ${finalLine}
        ${patchLine}
      </dl>
      ${overwriteWarn}
      <label class="inboxNotes">
        <span>レビューメモ（Review Notes）</span>
        <textarea data-action="set-notes" rows="2">${escapeHtml(candidate.reviewNotes)}</textarea>
      </label>
      <div class="inboxActions">
        <button type="button" class="primaryButton" data-action="approve-register">approve &amp; register</button>
        <button type="button" class="secondaryButton" data-action="mark-approved">approved</button>
        <button type="button" class="secondaryButton" data-action="mark-needs-regen">needs-regeneration</button>
        <button type="button" class="ghostButton" data-action="mark-rejected">reject</button>
        <button type="button" class="ghostButton" data-action="mark-candidate">candidate に戻す</button>
      </div>
    </div>
  </article>`
}

async function postInboxReview(relativePath, reviewStatus, reviewNotes, suggestedAssetPlanId) {
  await fetchJson('/api/inbox/review', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({relativePath, reviewStatus, reviewNotes, suggestedAssetPlanId}),
  })
}

async function approveAndRegisterCandidate(candidate, planId, reviewNotes, overwriteConfirmed) {
  try {
    const data = await fetchJson('/api/inbox/approve-and-register', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        relativePath: candidate.relativePath,
        visualAssetPlanId: planId,
        reviewNotes,
        overwriteConfirmed: Boolean(overwriteConfirmed),
      }),
    })
    showToast(`最終パスへ保存しました: ${data.localAssetPath}`)
    await loadInbox()
    await loadPatches()
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('already exists') && !overwriteConfirmed) {
      if (window.confirm('最終パスにファイルがすでにあります。上書きしますか？')) {
        return approveAndRegisterCandidate(candidate, planId, reviewNotes, true)
      }
      return false
    }
    showToast(message, 'error')
    return false
  }
}

inboxList.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return
  const button = event.target.closest('[data-action]')
  if (!button || button.tagName !== 'BUTTON') return
  const article = event.target.closest('.inboxItem')
  if (!article) return
  const relativePath = article.dataset.relativePath
  const candidate = inboxCandidates.find((c) => c.relativePath === relativePath)
  if (!candidate) return
  const planSelect = article.querySelector('[data-action="set-plan"]')
  const notesField = article.querySelector('[data-action="set-notes"]')
  const planId = planSelect?.value || candidate.suggestedAssetPlanId || ''
  const notes = notesField?.value || ''
  const action = button.dataset.action

  try {
    if (action === 'approve-register') {
      if (!planId) {
        showToast('プランを選択してください。', 'error')
        return
      }
      await approveAndRegisterCandidate(candidate, planId, notes, false)
    } else if (action === 'mark-approved') {
      await postInboxReview(relativePath, 'approved', notes, planId)
      showToast('approved に更新しました。')
      await loadInbox()
    } else if (action === 'mark-needs-regen') {
      await postInboxReview(relativePath, 'needs-regeneration', notes, planId)
      showToast('needs-regeneration に更新しました。')
      await loadInbox()
    } else if (action === 'mark-rejected') {
      await postInboxReview(relativePath, 'rejected', notes, planId)
      showToast('rejected に更新しました。')
      await loadInbox()
    } else if (action === 'mark-candidate') {
      await postInboxReview(relativePath, 'candidate', notes, planId)
      showToast('candidate に戻しました。')
      await loadInbox()
    }
  } catch (error) {
    showToast(error instanceof Error ? error.message : String(error), 'error')
  }
})

inboxList.addEventListener('change', (event) => {
  if (!(event.target instanceof Element)) return
  if (!event.target.matches('[data-action="set-plan"]')) return
  const article = event.target.closest('.inboxItem')
  if (!article) return
  const relativePath = article.dataset.relativePath
  const candidate = inboxCandidates.find((c) => c.relativePath === relativePath)
  if (!candidate) return
  candidate.suggestedAssetPlanId = event.target.value
  const plan = plans.find((p) => p._id === candidate.suggestedAssetPlanId)
  candidate.expectedFinalPath = plan?.expectedLocalAssetPath || ''
  candidate.expectedFinalExists = Boolean(plan?.expectedLocalAssetExists)
  article.outerHTML = renderInboxItem(candidate)
})

reloadInboxButton.addEventListener('click', async () => {
  const ok = await loadInbox()
  showToast(ok ? 'Inbox を再読み込みしました。' : 'Inbox を読み込めませんでした。', ok ? 'success' : 'error')
})

inboxStatusFilter.addEventListener('change', () => {
  activeInboxStatusFilter = inboxStatusFilter.value || 'all'
  renderInbox()
})

inboxSlugFilter.addEventListener('change', () => {
  activeInboxSlugFilter = inboxSlugFilter.value || 'all'
  renderInbox()
})

Promise.all([loadPlans(), loadPatches()])
  .then(() => loadInbox())
  .catch((error) => {
    serverStatus.textContent = 'エラー（Error）'
    showToast(error instanceof Error ? error.message : String(error), 'error')
  })
