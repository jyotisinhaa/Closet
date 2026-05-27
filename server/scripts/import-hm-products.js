/**
 * Import H&M products into the catalog.
 *
 * Usage:
 *   1. Fill in the HM_PRODUCTS array below with H&M product page URLs + metadata
 *   2. node scripts/import-hm-products.js
 *
 * For each entry the script will:
 *   - Fetch the H&M page and extract the product image URL
 *   - Upload the image to Cloudinary under closet/catalog/
 *   - Upsert the row in catalog_items (match on store_url)
 */
require('../config')
const axios = require('axios')
const pool = require('../db/client')
const { uploadToCloudinary } = require('../services/cloudinary')

// ─── ADD YOUR H&M PRODUCT URLS HERE ──────────────────────────────────────────
const HM_PRODUCTS = [
  // Dresses
  { store_url: 'https://www2.hm.com/en_us/productpage.1283256008.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1338226002.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1338263001.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1340372001.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1338242001.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1340373002.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1338400002.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1325468007.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1338762002.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1336286002.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1349165001.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1345343001.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1338564001.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1335237001.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1337365001.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1321944002.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1326143001.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1338499001.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1329635001.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1300026002.html', category: 'Dress', gender: 'female' },
  { store_url: 'https://www.uniqlo.com/us/en/products/E485446-000/00?colorDisplayCode=09&sizeDisplayCode=003', category: 'Dress', gender: 'female', brand: 'Uniqlo' },
  // Tops
  { store_url: 'https://www2.hm.com/en_us/productpage.1341503002.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1329851001.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1340830001.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1327320002.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1332445003.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1338740001.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1332445001.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1316939003.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1333719002.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1342623001.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1342638002.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1342736001.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1347847003.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1334287003.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1337512002.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1320782001.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1334837002.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1294765007.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1295275004.html', category: 'Top', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1302092003.html', category: 'Top', gender: 'female' },
  // Skirts
  { store_url: 'https://www2.hm.com/en_us/productpage.1345057001.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1343146001.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1334576003.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1246922011.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1330275002.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1340990001.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1316851006.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1337639003.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1328778002.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1314342001.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1285842001.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1301483003.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1356211001.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1315232002.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1349769001.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1340644002.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1329948001.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1310196001.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1298662003.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1327349002.html', category: 'Skirt', gender: 'female' },
  { store_url: 'https://www.uniqlo.com/us/en/products/E484707-000/00?colorDisplayCode=38&sizeDisplayCode=003', category: 'Skirt', gender: 'female', brand: 'Uniqlo' },
  // Shorts
  { store_url: 'https://www2.hm.com/en_us/productpage.1327515002.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1337742003.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1331705009.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1337336001.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1337560001.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1327496001.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1282891003.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1282891004.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1329986005.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1329986006.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1331705006.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1333198002.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1345935001.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1333862002.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1333198001.html', category: 'Shorts', gender: 'female' },
  { store_url: 'https://www2.hm.com/en_us/productpage.1283563002.html', category: 'Shorts', gender: 'female' },
]
// ─────────────────────────────────────────────────────────────────────────────

function detectGender(name, category) {
  if (/\bmen'?s\b/i.test(name)) return 'male'
  const cat = category.toLowerCase()
  if (cat === 'dress' || cat === 'skirt') return 'female'
  if (cat === 'top' && /blouse|camisole|spaghetti|ruched|ruffle|off.shoulder|puff sleeve|silk|satin|lace|floral wrap/i.test(name)) return 'female'
  if (cat === 'shorts' && /satin mini|paperbag|high.waist/i.test(name)) return 'female'
  if (cat === 'jeans' && /skinny|curvy|wedgie|flare|mom jeans|boyfriend|wide leg|high.rise|pinch waist/i.test(name)) return 'female'
  return 'unisex'
}

async function extractHMProduct(url) {
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 15000,
  })
  const html = res.data

  const get = (property) => {
    const m = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
            || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'))
    return m ? m[1].trim() : null
  }
  const getName = (property) => {
    const m = html.match(new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
            || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'))
    return m ? m[1].trim() : null
  }

  const imageUrl = get('og:image')
  const title    = get('og:title') || getName('title') || ''
  const priceStr = get('product:price:amount') || get('og:price:amount') || getName('twitter:data1') || ''
  const price    = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0

  // H&M titles are like "Product Name - H&M GB" — strip the suffix
  const name = title.replace(/\s*[-|]\s*(H&M|HM).*$/i, '').trim()

  return { name, imageUrl, price }
}

async function uploadImage(imageUrl, name) {
  const res = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 20000,
  })
  const buffer = Buffer.from(res.data)
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
  const result = await uploadToCloudinary(buffer, {
    folder: 'closet/catalog',
    public_id: slug + '-' + Date.now(),
    resource_type: 'image',
  })
  return result.secure_url
}

async function run() {
  if (HM_PRODUCTS.length === 0) {
    console.log('No products listed. Add entries to HM_PRODUCTS in this script and re-run.')
    process.exit(0)
  }

  let done = 0
  for (const item of HM_PRODUCTS) {
    console.log(`\n→ ${item.store_url}`)
    try {
      const { name: extractedName, imageUrl: hmImageUrl, price: extractedPrice } = await extractHMProduct(item.store_url)

      const name  = item.name  || extractedName  || 'Unknown Product'
      const price = item.price ?? extractedPrice
      const brand = item.brand || 'H&M'
      const color = item.color || ''
      const styleTags = item.style_tags || []
      const gender = item.gender || detectGender(name, item.category)

      if (!hmImageUrl) {
        console.error('  ✗ Could not extract image URL — skipping')
        continue
      }

      console.log(`  name:  ${name}`)
      console.log(`  image: ${hmImageUrl}`)
      console.log(`  price: ${price}  gender: ${gender}`)

      console.log('  Uploading to Cloudinary…')
      const cloudinaryUrl = await uploadImage(hmImageUrl, name)
      console.log(`  ✓ ${cloudinaryUrl}`)

      const { rows: existing } = await pool.query(
        `SELECT id FROM catalog_items WHERE store_url = $1 LIMIT 1`, [item.store_url]
      )
      if (existing.length > 0) {
        await pool.query(
          `UPDATE catalog_items SET name=$1, image_url=$2, price=$3, gender=$4, style_tags=$5 WHERE id=$6`,
          [name, cloudinaryUrl, price, gender, styleTags, existing[0].id]
        )
      } else {
        await pool.query(
          `INSERT INTO catalog_items
             (brand, name, category, color, price, store_url, image_url, style_tags, sponsored, gender)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9)`,
          [brand, name, item.category, color, price, item.store_url, cloudinaryUrl, styleTags, gender]
        )
      }
      console.log('  ✓ Saved to catalog')
      done++
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`)
    }

    // Small delay to be polite to H&M servers
    await new Promise(r => setTimeout(r, 800))
  }

  console.log(`\n✓ Done — ${done}/${HM_PRODUCTS.length} products imported`)
  await pool.end()
}

run().catch(err => {
  console.error('Script failed:', err.message)
  process.exit(1)
})
