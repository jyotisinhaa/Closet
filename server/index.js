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
const upload = multer({ storage: multer.memoryStorage() })

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
    if (task_status === 'success') return results.output[0]
    if (task_status === 'error') throw new Error(`Perfect Corp error: ${error}`)
  }
  throw new Error('Perfect Corp render timed out after 60s')
}

async function perfectCorpRender(params) {
  const taskId = await startPerfectCorpRender(params)
  return pollPerfectCorpTask(taskId)
}

// Chain: first apply new item to profile photo, then layer additional wardrobe items
async function renderOutfitChain(profilePhotoUrl, newItemUrl, additionalItems = []) {
  let output = await perfectCorpRender({ srcFileUrl: profilePhotoUrl, refFileUrl: newItemUrl })
  for (const item of additionalItems) {
    output = await perfectCorpRender({ srcId: output.dst_id, refFileUrl: item.image_url })
  }
  return output.url
}

// ── Pairing (placeholder — swap in Claude when API key is available) ──────────

function buildPlaceholderPairing(wardrobe) {
  if (wardrobe.length === 0) {
    return { combinations: [], honest_assessment: 'Add items to your wardrobe to get outfit pairing suggestions.' }
  }
  const shuffled = [...wardrobe].sort(() => Math.random() - 0.5)
  const group1 = shuffled.slice(0, Math.min(3, shuffled.length))
  const group2 = shuffled.slice(Math.min(3, shuffled.length), Math.min(6, shuffled.length))

  const combinations = [
    {
      name: 'Weekend casual',
      wardrobe_item_ids: group1.map(i => i.id),
      styling_note: 'A relaxed pairing that works well with your existing pieces.',
    },
  ]
  if (group2.length > 0) {
    combinations.push({
      name: 'Polished everyday',
      wardrobe_item_ids: group2.map(i => i.id),
      styling_note: 'Elevated yet comfortable — great for day-to-day wear.',
    })
  }
  return {
    combinations,
    honest_assessment: 'This piece complements several items already in your wardrobe.',
  }
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

    // 3. Pairing analysis
    const { combinations, honest_assessment } = buildPlaceholderPairing(wardrobe)

    // 4. Solo render (profile + new item only)
    let soloRenderUrl = null
    try {
      soloRenderUrl = await renderOutfitChain(profilePhotoUrl, newItemUrl, [])
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
          compositeUrl = await renderOutfitChain(profilePhotoUrl, newItemUrl, comboItems)
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
