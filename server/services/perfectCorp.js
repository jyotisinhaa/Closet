// Perfect Corp / YouCam virtual clothes try-on. Starts a render task, polls for
// completion, and chains items onto a base photo.
const { PERFECT_CORP_API_KEY } = require('../config')

const PERFECT_CORP_BASE = 'https://yce-api-01.makeupar.com/s2s/v2.0'

const CATEGORY_MAP = {
  'top': 'upper_body', 'shirt': 'upper_body', 'blouse': 'upper_body', 'tshirt': 'upper_body', 't-shirt': 'upper_body',
  'jeans': 'lower_body', 'pants': 'lower_body', 'skirt': 'lower_body', 'shorts': 'lower_body', 'bottom': 'lower_body', 'trousers': 'lower_body',
  'dress': 'full_body',
  'outerwear': 'upper_body', 'jacket': 'upper_body', 'coat': 'upper_body', 'blazer': 'upper_body',
  'shoes': 'shoes', 'sneakers': 'shoes', 'boots': 'shoes', 'heels': 'shoes',
}

function toPerfectCorpCategory(category) {
  if (!category) return 'auto'
  const key = category.toLowerCase().trim()
  return CATEGORY_MAP[key] || 'auto'
}

async function startPerfectCorpRender({ srcFileUrl, refFileUrl, garmentCategory = 'auto', changeShoes = false }) {
  const body = {
    garment_category: garmentCategory,
    change_shoes: changeShoes,
    ref_file_url: refFileUrl,
    src_file_url: srcFileUrl,
  }

  const res = await fetch(`${PERFECT_CORP_BASE}/task/cloth`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PERFECT_CORP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.data?.task_id) throw new Error(`Perfect Corp start failed: ${JSON.stringify(json)}`)
  return json.data.task_id
}

async function pollPerfectCorpTask(taskId) {
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const res = await fetch(`${PERFECT_CORP_BASE}/task/cloth/${taskId}`, {
      headers: { Authorization: `Bearer ${PERFECT_CORP_API_KEY}` },
    })
    const json = await res.json()
    const { task_status, results, error } = json.data || {}
    if (task_status === 'success') return { url: results.url, dst_id: results.dst_id }
    if (task_status === 'error') throw new Error(`Perfect Corp error: ${error}`)
  }
  throw new Error('Perfect Corp render timed out after 60s')
}

async function perfectCorpRender(params) {
  const taskId = await startPerfectCorpRender(params)
  return pollPerfectCorpTask(taskId)
}

// Chain: apply the new item to the profile photo, then layer each additional
// wardrobe item by feeding the previous render's URL back in as the source.
async function renderOutfitChain(profilePhotoUrl, newItemUrl, additionalItems = [], garmentCategory = 'auto') {
  let output = await perfectCorpRender({ srcFileUrl: profilePhotoUrl, refFileUrl: newItemUrl, garmentCategory })
  for (const item of additionalItems) {
    const itemCategory = toPerfectCorpCategory(item.category)
    output = await perfectCorpRender({ srcFileUrl: output.url, refFileUrl: item.image_url, garmentCategory: itemCategory })
  }
  return output.url
}

module.exports = { toPerfectCorpCategory, perfectCorpRender, renderOutfitChain }
