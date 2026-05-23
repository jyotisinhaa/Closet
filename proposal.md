# Curated Wishlist — Feature Proposal

## What It Is

A "Styled for You" recommendations page that pairs items from the user's wardrobe with sponsored brand products using image-based visual similarity. Think of it as native ads that feel like personal styling — not banners, but actual outfit suggestions.

**Core pitch to brands:** *"Your product, shown on a real person's wardrobe photo, recommended at the exact moment they're thinking about style."*

---

## User Experience

```
STYLED FOR YOU

Your wardrobe item          Pairs beautifully with        Brand
┌──────────────┐            ┌──────────────────┐
│              │            │                  │   Sponsored by Zara
│ [olive top]  │     +      │ [wide-leg pants] │   $89
│              │            │                  │   ★ 94% style match
└──────────────┘            └──────────────────┘
                            [Try On]  [Shop Now]

┌──────────────┐            ┌──────────────────┐
│              │            │                  │   Sponsored by H&M
│ [floral      │     +      │ [nude heels]     │   $45
│  dress]      │            │                  │   ★ 91% style match
└──────────────┘            └──────────────────┘
                            [Try On]  [Shop Now]
```

The user sees their own clothes on the left — immediately personal. The brand product on the right completes the outfit. One click tries it on virtually.

---

## How It Works

### Step 1 — Brand uploads product to catalog
Brands submit: product image, name, category, price, store URL. Stored in `data.json` under `catalog[]`.

### Step 2 — Embed catalog images (done once)
When a product is added to the catalog, its image is passed through **FashionCLIP** (a CLIP model fine-tuned on 700k+ fashion images). The resulting 512-dimensional vector is stored alongside the product. This is a one-time cost per product.

### Step 3 — Embed wardrobe images (on request)
When the user opens the recommendations page, each wardrobe item image is passed through the same FashionCLIP model to get its embedding.

### Step 4 — Cosine similarity matching
For each wardrobe item, compute cosine similarity against all catalog embeddings. Filter out same-category items (don't recommend a dress to pair with a dress). Return top match per wardrobe item.

### Step 5 — Display as curated pairings
Show wardrobe item + matched catalog product side by side. Similarity score shown as "% style match". Try On button passes the catalog product image directly into the existing try-on flow.

---

## Why FashionCLIP

| Model | Fashion-specific | Free | Quality |
|---|---|---|---|
| **FashionCLIP** (`patrickjohncyh/fashion-clip`) | ✅ trained on 700k fashion pairs | ✅ HF Inference API | ⭐⭐⭐⭐⭐ |
| CLIP base | ❌ general purpose | ✅ | ⭐⭐⭐ |
| OpenAI embeddings | ❌ text only | ❌ paid | — |

FashionCLIP understands that an olive utility jacket and khaki trousers are complementary — not because of color math, but because it has seen 700k outfit pairings during training.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Embedding model | `patrickjohncyh/fashion-clip` via Hugging Face Inference API |
| Embedding storage | `data.json` → `catalog[].embedding` (512-dim float array) |
| Similarity | Cosine similarity computed in Node.js (no vector DB needed at demo scale) |
| Catalog storage | `data.json` → `catalog[]` array |
| API | New route `GET /api/recommendations` |
| Frontend | New page `/recommendations` in React |

No vector database needed for demo scale (< 100 catalog items).

---

## Data Models

### Catalog Item (brand product)
```json
{
  "id": "cat-uuid",
  "brand": "Zara",
  "name": "Wide Leg Linen Trousers",
  "category": "Bottom",
  "color": "#D4CBB8",
  "price": 89,
  "store_url": "https://zara.com/...",
  "image_url": "https://cloudinary.com/...",
  "style_tags": ["minimalist", "casual", "summer"],
  "embedding": [0.12, -0.34, ...],
  "sponsored": true,
  "added_at": "2026-05-23T00:00:00Z"
}
```

### Recommendation (returned by API)
```json
{
  "wardrobe_item": { "id": "...", "image_url": "...", "category": "Top" },
  "catalog_item": { "id": "...", "name": "Wide Leg Linen Trousers", "brand": "Zara", "price": 89, "image_url": "..." },
  "similarity_score": 0.91,
  "reason": "Complements your casual top"
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/recommendations` | Returns top catalog match per wardrobe item |
| `POST` | `/api/catalog` | Brand uploads a new product (embeds image automatically) |
| `GET` | `/api/catalog` | List all catalog products |

---

## Implementation Steps

1. **Seed catalog** — add 6–8 sample brand products to `data.json` with real image URLs
2. **Embed catalog** — write a one-time script that calls FashionCLIP for each catalog image and stores the embedding
3. **Build `/api/recommendations`** — fetches wardrobe, embeds each item, computes cosine similarity against catalog, returns top pairs
4. **Build `/recommendations` page** — shows wardrobe + catalog pairings with Sponsored badge, style match score, Try On button
5. **Wire Try On** — "Try On" button pre-fills the try-on screen with the catalog product image

---

## Connection to Crusoe / Nemotron Challenge

The recommendation matching (Step 4) can be orchestrated as a **Nemotron agent on Crusoe Cloud**:

```
Agent receives: wardrobe embeddings + catalog embeddings
Tool 1: compute_similarity(wardrobe_item, catalog_items)
Tool 2: filter_incompatible(same_category, same_color_family)
Tool 3: rank_by_occasion(morning_casual vs evening_formal)
Tool 4: generate_styling_note(wardrobe_item, catalog_item)
```

This makes the recommendation explainable ("pairs because both are minimalist casual") rather than just a similarity number — which is a much stronger demo for judges.

---

## Business Model

| Tier | What brands pay for |
|---|---|
| **Free** | Product listed in catalog, appears in recommendations |
| **Sponsored** | Priority placement, "Sponsored" badge, higher visibility |
| **Premium** | Exclusive Try On placement, analytics on how many users tried the item |

The Try On integration is the key differentiator — brands don't just get impressions, they get virtual fitting room placement.

---

## Demo Script for Judges

1. Open My Wardrobe — show 5–6 items
2. Navigate to "Styled for You"
3. Show wardrobe item + matched brand product side by side
4. Click "Try On" — jumps to try-on screen with catalog product pre-loaded
5. Result shows the brand item on the user's photo
6. Explain: *"Every recommendation is image-similarity matched to the user's actual wardrobe. Brands pay to be in the catalog. Users try before they buy."*

Total demo time: ~90 seconds. One clear loop.
