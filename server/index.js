require('dotenv').config()

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { v2: cloudinary } = require('cloudinary')
const { Readable } = require('stream')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const app = express()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } })

app.use(cors())
app.use(express.json())

// Cloudinary config — reads from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Simple JSON file for persisting user data without a DB setup
const DATA_FILE = path.join(__dirname, 'data.json')
function readData() {
  if (!fs.existsSync(DATA_FILE)) return { user: {}, wardrobe: [], wishlist: [], users: [] }
  const d = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  if (!d.users) d.users = []
  return d
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

// Auth helpers
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}
function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

// Upload buffer to Cloudinary and return the secure URL
function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
    Readable.from(buffer).pipe(stream)
  })
}

// ── Auth ─────────────────────────────────────────────────────────────────────

app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const data = readData()
  if (data.users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered' })
  }

  const salt = crypto.randomBytes(16).toString('hex')
  const passwordHash = hashPassword(password, salt)
  const token = generateToken()

  const user = {
    id: crypto.randomUUID(),
    email,
    name: name || '',
    passwordHash,
    salt,
    token,
    createdAt: new Date().toISOString(),
  }

  data.users.push(user)
  writeData(data)

  res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
})

app.post('/api/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const data = readData()
  const user = data.users.find(u => u.email === email)
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })

  const hash = hashPassword(password, user.salt)
  if (hash !== user.passwordHash) return res.status(401).json({ error: 'Invalid email or password' })

  user.token = generateToken()
  writeData(data)

  res.json({ token: user.token, user: { id: user.id, email: user.email, name: user.name } })
})

app.get('/api/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token provided' })

  const data = readData()
  const user = data.users.find(u => u.token === token)
  if (!user) return res.status(401).json({ error: 'Invalid token' })

  res.json({ id: user.id, email: user.email, name: user.name })
})

// ── Profile ──────────────────────────────────────────────────────────────────

app.post('/api/profile/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'closet/profile',
      public_id: 'demo-user-1',
      overwrite: true,
      resource_type: 'image',
    })

    const data = readData()
    data.user = { id: 'demo-user-1', profile_photo_url: result.secure_url }
    writeData(data)

    res.json({ profile_photo_url: result.secure_url })
  } catch (err) {
    console.error('Profile upload error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/profile', (req, res) => {
  const data = readData()
  res.json(data.user || {})
})

// ── Wardrobe ──────────────────────────────────────────────────────────────────

app.get('/api/wardrobe', (req, res) => {
  const data = readData()
  res.json(data.wardrobe || [])
})

app.post('/api/wardrobe', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'closet/wardrobe',
      resource_type: 'image',
    })

    const item = {
      id: crypto.randomUUID(),
      image_url: result.secure_url,
      cloudinary_public_id: result.public_id,
      category: req.body.category || 'top',
      color: req.body.color || '',
      description: req.body.description || '',
      created_at: new Date().toISOString(),
    }

    const data = readData()
    data.wardrobe.push(item)
    writeData(data)

    res.json(item)
  } catch (err) {
    console.error('Wardrobe upload error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/wardrobe/:id', async (req, res) => {
  const data = readData()
  const item = data.wardrobe.find(i => i.id === req.params.id)

  if (item?.cloudinary_public_id) {
    try {
      await cloudinary.uploader.destroy(item.cloudinary_public_id, { invalidate: true })
    } catch (err) {
      console.error('Cloudinary delete error:', err)
    }
  }

  data.wardrobe = data.wardrobe.filter(i => i.id !== req.params.id)
  writeData(data)
  res.json({ ok: true })
})

// ── Wishlist ──────────────────────────────────────────────────────────────────

app.get('/api/wishlist', (req, res) => {
  const data = readData()
  res.json(data.wishlist || [])
})

app.post('/api/wishlist', (req, res) => {
  const item = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...req.body }
  const data = readData()
  data.wishlist.push(item)
  writeData(data)
  res.json(item)
})

app.post('/api/wishlist/:id/purchase', (req, res) => {
  const data = readData()
  const wish = data.wishlist.find(i => i.id === req.params.id)
  if (!wish) return res.status(404).json({ error: 'Not found' })

  const wardrobeItem = {
    id: crypto.randomUUID(),
    image_url: wish.new_item_image_url,
    category: wish.category,
    color: '',
    description: wish.description || '',
    created_at: new Date().toISOString(),
  }
  data.wardrobe.push(wardrobeItem)
  data.wishlist = data.wishlist.filter(i => i.id !== req.params.id)
  writeData(data)

  res.json(wardrobeItem)
})

app.delete('/api/wishlist/:id', (req, res) => {
  const data = readData()
  data.wishlist = data.wishlist.filter(i => i.id !== req.params.id)
  writeData(data)
  res.json({ ok: true })
})

// ── Perfect Corp helpers ──────────────────────────────────────────────────────

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

async function startPerfectCorpRender({ srcFileUrl, srcId, refFileUrl, garmentCategory = 'auto', changeShoes = false }) {
  const body = { garment_category: garmentCategory, change_shoes: changeShoes, ref_file_url: refFileUrl }
  if (srcId) body.src_id = srcId
  else body.src_file_url = srcFileUrl

  const res = await fetch(`${PERFECT_CORP_BASE}/task/cloth`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PERFECT_CORP_API_KEY}`,
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
      headers: { Authorization: `Bearer ${process.env.PERFECT_CORP_API_KEY}` },
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

// Chain: first apply new item to profile photo, then layer additional wardrobe items
async function renderOutfitChain(profilePhotoUrl, newItemUrl, additionalItems = [], garmentCategory = 'auto') {
  let output = await perfectCorpRender({ srcFileUrl: profilePhotoUrl, refFileUrl: newItemUrl, garmentCategory })
  for (const item of additionalItems) {
    const itemCategory = toPerfectCorpCategory(item.category)
    output = await perfectCorpRender({ srcId: output.dst_id, refFileUrl: item.image_url, garmentCategory: itemCategory })
  }
  return output.url
}

// ── Groq pairing ──────────────────────────────────────────────────────────────

const Groq = require('groq-sdk')
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function buildPairingWithGroq(newItemUrl, profilePhotoUrl, category, price, color, store, wardrobe) {
  if (wardrobe.length === 0) {
    return { combinations: [], honest_assessment: 'Add items to your wardrobe to get outfit pairing suggestions.' }
  }

  const wardrobeList = wardrobe.map(item =>
    `- id=${item.id}, category=${item.category}, color=${item.color || 'unknown'}, description=${item.description || item.category}`
  ).join('\n')

  const prompt = `You are a personal stylist with sharp visual analysis skills.

Image 1 (above) is the person — this is who will be wearing the item.
Image 2 (above) is the new garment they are considering buying.

Price: $${price}
${color ? `Color: ${color}` : ''}
${store ? `Store: ${store}` : ''}

Their existing wardrobe:
${wardrobeList}

Your job:
1. Visually identify the garment — give it a short descriptive name (e.g. "Olive utility jacket", "Floral midi dress").
2. Identify the correct category from the image (e.g. "Dress", "Jacket", "Top", "Pants", "Skirt", "Outerwear"). Trust the image, not any label provided.
3. Identify the style tags for the garment (e.g. ["Utility", "Casual"] or ["Formal", "Minimalist"]).
4. Look at the person and the garment — assess honestly how this item would look on them. Address the user directly as "you". Be specific and kind but truthful.
5. Check the wardrobe list — count how many similar items they already own (same type/category). Describe it briefly (e.g. "2 jackets", "1 similar dress", "none").
6. Pick 2 outfit combinations from their wardrobe that would work well with this new item.

Return ONLY valid JSON, no markdown, no code blocks:
{
  "item_name": "short descriptive name for the garment",
  "detected_category": "correct category detected from image",
  "style_tags": ["tag1", "tag2"],
  "similar_owned": "e.g. '2 jackets' or 'none'",
  "combinations": [
    {
      "name": "short occasion name",
      "wardrobe_item_ids": ["id1", "id2"],
      "styling_note": "one sentence on why it works visually"
    }
  ],
  "honest_assessment": "2-3 sentences: how it looks on you (address the user directly as 'you'), and whether it fills a real gap or duplicates something you already own."
}`

  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: profilePhotoUrl } },
        { type: 'image_url', image_url: { url: newItemUrl } },
        { type: 'text', text: prompt },
      ],
    }],
    max_tokens: 1024,
    temperature: 0.7,
  })

  const text = response.choices[0].message.content.trim()
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(cleaned)
}

// ── Try-on ────────────────────────────────────────────────────────────────────

app.post('/api/tryon', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' })

    // 1. Upload new item image to Cloudinary
    const cloudResult = await uploadToCloudinary(req.file.buffer, {
      folder: 'closet/tryon',
      resource_type: 'image',
    })
    const newItemUrl = cloudResult.secure_url

    // 2. Profile photo + wardrobe
    const data = readData()
    const profilePhotoUrl = data.user?.profile_photo_url
    if (!profilePhotoUrl) {
      return res.status(400).json({ error: 'No profile photo found. Please complete onboarding first.' })
    }
    const wardrobe = data.wardrobe || []

    const { price = '0', category = 'auto', store = '', color = '' } = req.body

    // 3. Pairing analysis via Groq
    let combinations = [], honest_assessment = '', item_name = '', detected_category = '', style_tags = [], similar_owned = ''
    try {
      const pairing = await buildPairingWithGroq(newItemUrl, profilePhotoUrl, category, price, color, store, wardrobe)
      combinations       = pairing.combinations || []
      honest_assessment  = pairing.honest_assessment || ''
      item_name          = pairing.item_name || ''
      detected_category  = pairing.detected_category || ''
      style_tags         = pairing.style_tags || []
      similar_owned      = pairing.similar_owned || ''
    } catch (err) {
      console.error('Groq pairing failed:', err.message)
      honest_assessment = 'Style analysis unavailable — check your GROQ_API_KEY.'
    }

    // 4. Solo render (profile + new item only)
    const pcCategory = toPerfectCorpCategory(detected_category || category)
    let soloRenderUrl = null
    try {
      soloRenderUrl = await renderOutfitChain(profilePhotoUrl, newItemUrl, [], pcCategory)
    } catch (err) {
      console.error('Solo render failed:', err.message)
    }

    // 5. Combo renders (run in parallel — each combo's chain is sequential internally)
    const enrichedCombos = await Promise.all(
      combinations.slice(0, 2).map(async (combo) => {
        const comboItems = (combo.wardrobe_item_ids || [])
          .map(id => wardrobe.find(w => w.id === id))
          .filter(Boolean)
          .slice(0, 3)

        let compositeUrl = soloRenderUrl
        try {
          compositeUrl = await renderOutfitChain(profilePhotoUrl, newItemUrl, comboItems, pcCategory)
        } catch (err) {
          console.error(`Combo render failed for "${combo.name}":`, err.message)
        }

        return {
          name: combo.name,
          styling_note: combo.styling_note,
          wardrobe_item_ids: combo.wardrobe_item_ids,
          wardrobe_item_details: comboItems.map(w => ({
            id: w.id,
            category: w.category,
            description: w.description || w.category,
            color: w.color || '',
            image_url: w.image_url,
          })),
          composite_render_url: compositeUrl,
        }
      })
    )

    res.json({
      new_item_image_url: newItemUrl,
      price: parseFloat(price) || 0,
      category,
      store,
      color,
      item_name,
      detected_category,
      style_tags,
      similar_owned,
      solo_render_url: soloRenderUrl,
      honest_assessment,
      combinations: enrichedCombos,
    })
  } catch (err) {
    console.error('Try-on error:', err)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Closet API running on http://localhost:${PORT}`))
