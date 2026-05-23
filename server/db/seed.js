// Seeds catalog with brand products: node db/seed.js
// All image_urls are verified Unsplash CDN URLs
require('../config')
const pool = require('./client')

const CATALOG = [
  // ── Dresses ────────────────────────────────────────────────────────────────
  { brand: 'Zara',            name: 'Floral Long Sleeve Dress',   category: 'Dress',   color: '#2C2C2C', price: 79,  store_url: 'https://zara.com',            image_url: 'https://images.unsplash.com/photo-1616313253719-c46514cddee1?w=400&h=500&fit=crop', style_tags: ['feminine','classic','party'] },
  { brand: 'H&M',             name: 'Floral Wrap Dress',          category: 'Dress',   color: '#E8C4A0', price: 45,  store_url: 'https://hm.com',              image_url: 'https://images.unsplash.com/photo-1502868354157-ec2edd2a1651?w=400&h=500&fit=crop', style_tags: ['romantic','summer','feminine'] },
  { brand: 'Mango',           name: 'Blue Floral Midi Dress',     category: 'Dress',   color: '#4A7FA5', price: 89,  store_url: 'https://mango.com',           image_url: 'https://images.unsplash.com/photo-1517970640957-23d07d5ed08c?w=400&h=500&fit=crop', style_tags: ['bohemian','summer','feminine'] },
  { brand: 'ASOS',            name: 'Floral Spaghetti Strap',     category: 'Dress',   color: '#1A1612', price: 55,  store_url: 'https://asos.com',            image_url: 'https://images.unsplash.com/photo-1600102427329-d5b2cde7e162?w=400&h=500&fit=crop', style_tags: ['evening','feminine','party'] },
  { brand: 'Reformation',     name: 'Yellow Floral Sundress',     category: 'Dress',   color: '#F0C040', price: 148, store_url: 'https://thereformation.com',  image_url: 'https://images.unsplash.com/photo-1602303894456-398ce544d90b?w=400&h=500&fit=crop', style_tags: ['bohemian','summer','feminine'] },
  { brand: 'Free People',     name: 'Blue Floral Maxi Dress',     category: 'Dress',   color: '#4A6FA5', price: 128, store_url: 'https://freepeople.com',      image_url: 'https://images.unsplash.com/photo-1601182282494-fba0fa905e9d?w=400&h=500&fit=crop', style_tags: ['bohemian','festival','romantic'] },
  { brand: 'Massimo Dutti',   name: 'Linen Street Dress',         category: 'Dress',   color: '#D4CBB8', price: 119, store_url: 'https://massimodutti.com',    image_url: 'https://images.unsplash.com/photo-1646296142225-28436a93863a?w=400&h=500&fit=crop', style_tags: ['minimalist','smart-casual','summer'] },
  { brand: 'COS',             name: 'White Sleeveless Dress',     category: 'Dress',   color: '#FFFFFF', price: 99,  store_url: 'https://cosstores.com',       image_url: 'https://images.unsplash.com/photo-1520026582657-4daf5bb60adb?w=400&h=500&fit=crop', style_tags: ['minimalist','elegant','summer'] },
  { brand: 'Anthropologie',   name: 'Colorful Wrap Maxi',         category: 'Dress',   color: '#C4A882', price: 138, store_url: 'https://anthropologie.com',   image_url: 'https://images.unsplash.com/photo-1671848633245-79cc98b0dbe8?w=400&h=500&fit=crop', style_tags: ['romantic','bohemian','feminine'] },
  { brand: '& Other Stories', name: 'Green Midi Dress',           category: 'Dress',   color: '#4A7A4A', price: 95,  store_url: 'https://stories.com',         image_url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400&h=500&fit=crop', style_tags: ['minimalist','smart-casual','summer'] },
  { brand: 'Zara',            name: 'Floral Step-Hem Dress',      category: 'Dress',   color: '#E8C4A0', price: 75,  store_url: 'https://zara.com',            image_url: 'https://images.unsplash.com/photo-1776479454537-a15b5c145b1f?w=400&h=500&fit=crop', style_tags: ['feminine','summer','casual'] },
  { brand: 'H&M',             name: 'Red Chiffon Maxi Dress',     category: 'Dress',   color: '#C0392B', price: 49,  store_url: 'https://hm.com',              image_url: 'https://images.unsplash.com/photo-1759726995161-8bcd3d1aacba?w=400&h=500&fit=crop', style_tags: ['evening','feminine','romantic'] },
  { brand: 'Reformation',     name: 'White Linen Dress',          category: 'Dress',   color: '#FFFFFF', price: 158, store_url: 'https://thereformation.com',  image_url: 'https://images.unsplash.com/photo-1775498315557-3c96ff626ec3?w=400&h=500&fit=crop', style_tags: ['minimalist','summer','elegant'] },

  // ── Tops ───────────────────────────────────────────────────────────────────
  { brand: 'Zara',            name: 'Green Satin Blouse',         category: 'Top',     color: '#4A7A4A', price: 49,  store_url: 'https://zara.com',            image_url: 'https://images.unsplash.com/photo-1649140336105-a4452db77649?w=400&h=500&fit=crop', style_tags: ['elegant','work','minimalist'] },
  { brand: 'Mango',           name: 'Teal Off-Shoulder Blouse',   category: 'Top',     color: '#2A7A8A', price: 59,  store_url: 'https://mango.com',           image_url: 'https://images.unsplash.com/photo-1704775983224-43dae05da876?w=400&h=500&fit=crop', style_tags: ['feminine','summer','romantic'] },
  { brand: 'H&M',             name: 'Pink Ruffle Blouse',         category: 'Top',     color: '#F4A5B4', price: 29,  store_url: 'https://hm.com',              image_url: 'https://images.unsplash.com/photo-1711188053972-670fee62032f?w=400&h=500&fit=crop', style_tags: ['feminine','casual','everyday'] },
  { brand: 'Zara',            name: 'Pink Silk Shirt',            category: 'Top',     color: '#F4A5B4', price: 55,  store_url: 'https://zara.com',            image_url: 'https://images.unsplash.com/photo-1730513007475-40fefb93f23b?w=400&h=500&fit=crop', style_tags: ['elegant','work','feminine'] },
  { brand: 'Uniqlo',          name: 'Striped Relaxed Shirt',      category: 'Top',     color: '#1D3557', price: 39,  store_url: 'https://uniqlo.com',          image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop', style_tags: ['casual','classic','everyday'] },
  { brand: 'COS',             name: 'Black Long Sleeve Top',      category: 'Top',     color: '#1A1612', price: 79,  store_url: 'https://cosstores.com',       image_url: 'https://images.unsplash.com/photo-1608033247410-817c68700611?w=400&h=500&fit=crop', style_tags: ['minimalist','classic','everyday'] },
  { brand: 'Mango',           name: 'Red Button-Down Shirt',      category: 'Top',     color: '#C0392B', price: 45,  store_url: 'https://mango.com',           image_url: 'https://images.unsplash.com/photo-1622782045724-5c7cddda7e70?w=400&h=500&fit=crop', style_tags: ['casual','classic','everyday'] },

  // ── Jeans ──────────────────────────────────────────────────────────────────
  { brand: "Levi's",          name: 'High-Rise Wide Leg Jeans',   category: 'Jeans',   color: '#4A6FA5', price: 98,  store_url: 'https://levi.com',            image_url: 'https://images.unsplash.com/photo-1714143136372-ddaf8b606da7?w=400&h=500&fit=crop', style_tags: ['casual','classic','everyday'] },
  { brand: 'H&M',             name: 'Straight Leg Denim',         category: 'Jeans',   color: '#2E4A7A', price: 39,  store_url: 'https://hm.com',              image_url: 'https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=400&h=500&fit=crop', style_tags: ['casual','classic','minimalist'] },
  { brand: 'AGOLDE',          name: 'Relaxed 90s Jeans',          category: 'Jeans',   color: '#5B7FA6', price: 198, store_url: 'https://agolde.com',          image_url: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=500&fit=crop', style_tags: ['vintage','casual','everyday'] },
  { brand: 'Madewell',        name: 'The Perfect Vintage Jean',   category: 'Jeans',   color: '#4A6FA5', price: 135, store_url: 'https://madewell.com',        image_url: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=400&h=500&fit=crop', style_tags: ['classic','casual','everyday'] },
  { brand: 'Zara',            name: 'Beach Straight Jeans',       category: 'Jeans',   color: '#87A9C9', price: 69,  store_url: 'https://zara.com',            image_url: 'https://images.unsplash.com/photo-1616956455145-7c40e34a1c2a?w=400&h=500&fit=crop', style_tags: ['casual','summer','everyday'] },
  { brand: 'Topshop',         name: 'Mom Jeans',                  category: 'Jeans',   color: '#87A9C9', price: 55,  store_url: 'https://topshop.com',         image_url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&h=500&fit=crop', style_tags: ['vintage','casual','trendy'] },

  // ── Shorts ─────────────────────────────────────────────────────────────────
  { brand: "Levi's",          name: 'Classic Denim Cut-Offs',     category: 'Shorts',  color: '#4A6FA5', price: 68,  store_url: 'https://levi.com',            image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop', style_tags: ['casual','summer','classic'] },
  { brand: 'Zara',            name: 'Blue Denim Shorts',          category: 'Shorts',  color: '#4A6FA5', price: 45,  store_url: 'https://zara.com',            image_url: 'https://images.unsplash.com/photo-1585145197082-dba095ba01ab?w=400&h=500&fit=crop', style_tags: ['casual','summer','everyday'] },
  { brand: 'H&M',             name: 'Casual Denim Shorts',        category: 'Shorts',  color: '#5B7FA6', price: 25,  store_url: 'https://hm.com',              image_url: 'https://images.unsplash.com/photo-1760551600460-018b52b28045?w=400&h=500&fit=crop', style_tags: ['casual','summer','everyday'] },

  // ── Skirts ─────────────────────────────────────────────────────────────────
  { brand: 'COS',             name: 'Black Midi Pencil Skirt',    category: 'Skirt',   color: '#1A1612', price: 89,  store_url: 'https://cosstores.com',       image_url: 'https://images.unsplash.com/photo-1708363390847-b4af54f45273?w=400&h=500&fit=crop', style_tags: ['minimalist','work','classic'] },
  { brand: 'Mango',           name: 'Tan Linen A-Line Skirt',     category: 'Skirt',   color: '#C4A882', price: 65,  store_url: 'https://mango.com',           image_url: 'https://images.unsplash.com/photo-1618244942912-7351be026e8b?w=400&h=500&fit=crop', style_tags: ['casual','summer','feminine'] },
  { brand: 'Zara',            name: 'Yellow Checked Mini Skirt',  category: 'Skirt',   color: '#F0C040', price: 49,  store_url: 'https://zara.com',            image_url: 'https://images.unsplash.com/photo-1509182469511-7f0b50bfa63e?w=400&h=500&fit=crop', style_tags: ['trendy','casual','summer'] },

  // ── Sandals ────────────────────────────────────────────────────────────────
  { brand: 'Mango',           name: 'Brown Leather Sandals',      category: 'Sandals', color: '#8B6343', price: 59,  store_url: 'https://mango.com',           image_url: 'https://images.unsplash.com/photo-1613662632164-7f2b081a5b46?w=400&h=500&fit=crop', style_tags: ['casual','summer','everyday'] },
  { brand: 'Ancient Greek Sandals', name: 'White Strappy Flats',  category: 'Sandals', color: '#FFFFFF', price: 195, store_url: 'https://ancient-greek-sandals.com', image_url: 'https://images.unsplash.com/photo-1756907901119-bcaea01f9168?w=400&h=500&fit=crop', style_tags: ['classic','mediterranean','summer'] },

  // ── Other accessories & staples ────────────────────────────────────────────
  { brand: 'Zara',            name: 'Wide Leg Linen Trousers',    category: 'Bottom',  color: '#D4CBB8', price: 89,  store_url: 'https://zara.com',            image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop', style_tags: ['minimalist','casual','summer'] },
  { brand: 'H&M',             name: 'Leather Ankle Boots',        category: 'Shoes',   color: '#1A1612', price: 59,  store_url: 'https://hm.com',              image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop', style_tags: ['classic','casual','autumn'] },
  { brand: 'Adidas',          name: 'White Minimalist Sneakers',  category: 'Shoes',   color: '#FFFFFF', price: 95,  store_url: 'https://adidas.com',          image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=500&fit=crop', style_tags: ['sporty','minimalist','casual'] },
  { brand: 'COS',             name: 'Structured Canvas Tote',     category: 'Bag',     color: '#8C8273', price: 49,  store_url: 'https://cosstores.com',       image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop', style_tags: ['minimalist','everyday','neutral'] },
  { brand: 'Mango',           name: 'Oversized Linen Blazer',     category: 'Outerwear', color: '#C9A961', price: 119, store_url: 'https://mango.com',         image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop', style_tags: ['smart-casual','minimalist','work'] },
  { brand: 'Mejuri',          name: 'Gold Hoop Earrings',         category: 'Accessory', color: '#C9A961', price: 68, store_url: 'https://mejuri.com',         image_url: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&h=500&fit=crop', style_tags: ['classic','minimalist','everyday'] },
]

async function seed() {
  let inserted = 0, skipped = 0
  for (const item of CATALOG) {
    const { rowCount } = await pool.query(
      `INSERT INTO catalog_items (brand, name, category, color, price, store_url, image_url, style_tags, sponsored)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)
       ON CONFLICT DO NOTHING`,
      [item.brand, item.name, item.category, item.color, item.price, item.store_url, item.image_url, item.style_tags]
    )
    rowCount ? inserted++ : skipped++
  }
  console.log(`✓ Seeded ${inserted} new catalog items (${skipped} already existed)`)
  await pool.end()
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1) })
