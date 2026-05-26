// Perfect Corp / YouCam virtual try-on. Starts a render task, polls for
// completion, and chains items onto a base photo. Body garments go through the
// AI Clothes V3 endpoint (task/cloth-v3); hats, scarves, bags and shoes each
// have a dedicated endpoint (task/<feature>) that additionally requires `gender`.
const { PERFECT_CORP_API_KEY } = require('../config')

const PERFECT_CORP_BASE = 'https://yce-api-01.makeupar.com/s2s/v2.0'

// Body garments render through the AI Clothes V3 task (same request/response
// shape as the older task/cloth, just a newer, higher-quality model).
const CLOTH_FEATURE = 'cloth-v3'

// Polling cadence. The window is deliberately generous: per Perfect Corp's
// async guidance, abandoning a still-running task early lets it expire (a later
// status check returns InvalidTaskId) while the units are still charged — so we
// keep polling well past a typical render rather than give up at the first sign
// of slowness.
const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS   = 4 * 60 * 1000

// Body garments -> AI Clothes endpoint garment_category.
const CLOTH_CATEGORY_MAP = {
  'top': 'upper_body', 'shirt': 'upper_body', 'blouse': 'upper_body', 'tshirt': 'upper_body', 't-shirt': 'upper_body', 'sweater': 'upper_body', 'knit': 'upper_body',
  'jeans': 'lower_body', 'pants': 'lower_body', 'skirt': 'lower_body', 'shorts': 'lower_body', 'bottom': 'lower_body', 'trousers': 'lower_body', 'leggings': 'lower_body',
  'dress': 'auto', 'jumpsuit': 'full_body',
  'outerwear': 'upper_body', 'jacket': 'upper_body', 'coat': 'upper_body', 'blazer': 'upper_body',
}

// Accessories -> their own task endpoint (task/hat, task/scarf, task/bag, task/shoes).
const ACCESSORY_FEATURE_MAP = {
  'hat': 'hat', 'cap': 'hat', 'beanie': 'hat',
  'scarf': 'scarf',
  'bag': 'bag', 'purse': 'bag', 'handbag': 'bag', 'tote': 'bag', 'clutch': 'bag', 'backpack': 'bag',
  'shoes': 'shoes', 'shoe': 'shoes', 'sneakers': 'shoes', 'boots': 'shoes', 'heels': 'shoes', 'sandals': 'shoes', 'loafers': 'shoes', 'footwear': 'shoes',
}

// Valid `style` values per accessory feature. An unknown/empty style is dropped
// so the API falls back to selecting a style at random.
const ACCESSORY_STYLE_MAP = {
  'hat':   ['style_sporty_casual', 'style_urban_fashion', 'style_vacation_casual', 'style_warm_cozy', 'style_bohemian'],
  'scarf': ['style_french_elegance', 'style_light_luxury', 'style_cottagecore', 'style_modern_chic', 'style_bohemian'],
  'bag':   ['style_parisian_chic', 'style_urban_chic', 'style_mediterranean_chic', 'style_art_deco_style'],
  'shoes': ['style_minimalist', 'style_bohemian', 'style_cottagecore', 'style_french_elegance', 'style_retro_fashion'],
}

function toPerfectCorpCategory(category) {
  if (!category) return 'auto'
  return CLOTH_CATEGORY_MAP[category.toLowerCase().trim()] || 'auto'
}

// Returns 'hat' | 'scarf' | 'bag' | 'shoes' if the category is a dedicated
// accessory, otherwise null (meaning: render it through the clothes endpoint).
function toAccessoryFeature(category) {
  if (!category) return null
  return ACCESSORY_FEATURE_MAP[category.toLowerCase().trim()] || null
}

// The accessory endpoints only accept "female" / "male"; everything else
// (Non-binary, Prefer not to say, missing) falls back to a sensible default.
function normalizeGender(gender) {
  const g = (gender || '').toLowerCase().trim()
  return (g === 'male' || g === 'man' || g === 'men') ? 'male' : 'female'
}

// POST a task body to task/<feature>, returning the task_id.
async function startTask(feature, body) {
  const res = await fetch(`${PERFECT_CORP_BASE}/task/${feature}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PERFECT_CORP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.data?.task_id) throw new Error(`Perfect Corp ${feature} start failed: ${JSON.stringify(json)}`)
  return json.data.task_id
}

// Poll task/<feature>/<task_id> until success or error. All endpoints share the
// same { data: { task_status, results: { url }, error } } response shape. Keep
// polling through transient rate limits (429) and "still running" states rather
// than bailing out — see POLL_TIMEOUT_MS for why.
async function pollTask(feature, taskId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
    const res = await fetch(`${PERFECT_CORP_BASE}/task/${feature}/${taskId}`, {
      headers: { Authorization: `Bearer ${PERFECT_CORP_API_KEY}` },
    })
    if (res.status === 429) continue // rate-limited; keep the task alive by polling
    const json = await res.json()
    const { task_status, results, error } = json.data || {}
    if (task_status === 'success') return { url: results.url, dst_id: results.dst_id }
    if (task_status === 'error') throw new Error(`Perfect Corp ${feature} error: ${error || json.error_code || 'unknown'}`)
    if (json.error_code) throw new Error(`Perfect Corp ${feature} poll error: ${json.error_code}`)
    // any other state (queued/running) -> keep polling
  }
  throw new Error(`Perfect Corp ${feature} render did not finish within ${POLL_TIMEOUT_MS / 1000}s`)
}

// Render a single item onto a base photo, dispatching to the correct endpoint
// based on its category. `gender` is required for accessory endpoints.
async function renderSingleItem({ srcFileUrl, refFileUrl, category, gender, style }) {
  const feature = toAccessoryFeature(category)
  if (feature) {
    const body = { src_file_url: srcFileUrl, ref_file_url: refFileUrl, gender: normalizeGender(gender) }
    if (style && ACCESSORY_STYLE_MAP[feature]?.includes(style)) body.style = style
    const taskId = await startTask(feature, body)
    return pollTask(feature, taskId)
  }

  const taskId = await startTask(CLOTH_FEATURE, {
    garment_category: toPerfectCorpCategory(category),
    change_shoes: false,
    ref_file_url: refFileUrl,
    src_file_url: srcFileUrl,
  })
  return pollTask(CLOTH_FEATURE, taskId)
}

// Chain: render the new item plus the chosen wardrobe items onto the profile
// photo, feeding each render's URL in as the next source. `style` is the new
// item's chosen accessory style.
//
// Ordering: accessories FIRST, body garments LAST. The accessory endpoints
// regenerate the whole styled outfit, while the clothes endpoint is a clean swap
// that only edits its garment region — so applying clothes last lets them restore
// the user's real garments on top of the accessory render. Tradeoff: an
// upper-body clothes swap regenerates the torso, so a torso accessory (scarf, and
// to some degree a bag) may be partly altered by it. The new item renders last
// within its own group so it gets the freshest, topmost pass.
async function renderOutfitChain(profilePhotoUrl, newItemUrl, additionalItems = [], category = 'auto', gender, style) {
  const newStep       = { refUrl: newItemUrl, category, style, isNew: true }
  const wardrobeSteps = additionalItems.map(item => ({ refUrl: item.image_url, category: item.category }))
  const allSteps      = [newStep, ...wardrobeSteps]

  const isAccessory = (s) => !!toAccessoryFeature(s.category)
  const orderGroup  = (g) => [...g.filter(s => !s.isNew), ...g.filter(s => s.isNew)]
  const ordered     = [
    ...orderGroup(allSteps.filter(isAccessory)),     // accessories first
    ...orderGroup(allSteps.filter(s => !isAccessory(s))), // clothes last (clean swap)
  ]

  let srcFileUrl = profilePhotoUrl
  let output
  for (const step of ordered) {
    output = await renderSingleItem({ srcFileUrl, refFileUrl: step.refUrl, category: step.category, gender, style: step.style })
    srcFileUrl = output.url
  }
  return output.url
}

// Chain a list of items onto a base photo with no "new" item — used for the
// wardrobe-only try-on (Mix & Match). Same ordering rule as renderOutfitChain:
// accessories first (they regenerate the whole outfit), body garments last (clean
// swaps), preserving the caller's order within each group. Returns the base URL
// unchanged if there's nothing to render.
async function renderItemsChain(baseUrl, items = [], gender) {
  const steps = items
    .filter(it => it && it.image_url)
    .map(it => ({ refUrl: it.image_url, category: it.category }))
  if (steps.length === 0) return baseUrl

  const isAccessory = (s) => !!toAccessoryFeature(s.category)
  const ordered = [...steps.filter(isAccessory), ...steps.filter(s => !isAccessory(s))]

  let srcFileUrl = baseUrl
  let output
  for (const step of ordered) {
    output = await renderSingleItem({ srcFileUrl, refFileUrl: step.refUrl, category: step.category, gender })
    srcFileUrl = output.url
  }
  return output.url
}

module.exports = { toPerfectCorpCategory, toAccessoryFeature, renderSingleItem, renderOutfitChain, renderItemsChain }
