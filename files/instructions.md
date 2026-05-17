# Closet — Developer Handoff

**Hackathon:** DevNetwork [AI + ML] Hackathon 2026
**Sponsor track:** Perfect Corp — _Building the Next Generation of AI-Driven Consumer Experiences_
**Timeline:** ~10 days · Submission deadline: **May 28, 2026**
**Companion file:** `closet-ui-mockup.html` (open in a browser to see all 6 screens)

---

## 1 · What we're building

**Closet** is a mobile-first web app that helps shoppers make better in-store buying decisions by combining two things judges have never seen in the same app:

1. **AI virtual try-on** — see how a new item looks on you before buying.
2. **Wardrobe awareness** — see how that new item pairs with clothes you already own, plus an honest assessment of whether the purchase fills a real gap or duplicates what you have.

### The user story (use this for the demo video)

> Priya is shopping at Target. She finds a $58 olive utility jacket she likes. Instead of guessing, she opens Closet, snaps a photo, types the price. In 15 seconds, the app shows her wearing the jacket — paired with three outfits built from clothes already in her closet. Below each look: a styling note ("works because olive echoes your existing denim palette") and a budget line ("Total outfit: $58, everything else is from your wardrobe"). At the bottom, a candid take: _"You already own two similar field jackets. Skip unless you need a lighter weight option."_ Priya saves it to Wishlist, leaves the store, and later — when she actually buys it online — taps **Bought it** and the jacket auto-moves into her wardrobe.

### Why this wins

- **Real consumer problem** — impulse buying, redundant purchases, decision fatigue in-store
- **Clear retail/consumer value** — exactly what Perfect Corp's brief asks for
- **Sustainability + budget angle** — the "honest take" is novel; no one else will have it
- **Demos beautifully** — visual, fast, has a clear "aha" moment in the first 20 seconds
- **Uses Perfect Corp as the engine**, not a bolt-on feature

---

## 2 · Scope

### In scope (must build)

- One-time profile photo upload (used for every try-on)
- Wardrobe: add, auto-tag, list, delete items
- Try-On capture: photo + manual price + category
- Try-On result: Perfect Corp render + 2–3 AI-paired outfit combos + honest assessment
- Wishlist: save looks
- **"Bought it"** flow — moves wishlist item into wardrobe

### Out of scope (mention as roadmap on Devpost — don't build)

- OCR for price tags
- Makeup try-on
- Auth / multi-user (single hardcoded demo user is fine)
- Social sharing
- Retailer integrations (Walmart, Target, etc.)
- Native mobile app
- Payment processing

---

## 3 · Tech stack

| Layer               | Choice                                                           | Why                                                                      |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Frontend            | React + Vite + Tailwind + React Router                           | Fast dev, mobile web is enough for the demo                              |
| Backend             | Node + Express                                                   | Keeps Perfect Corp API key server-side                                   |
| Image hosting       | Cloudinary (free tier)                                           | **Perfect Corp requires public image URLs** — solves this in one library |
| Database            | SQLite + Prisma (or `db.json` with lowdb for speed)              | Zero-setup persistence                                                   |
| Vision / pairing AI | Claude API (Sonnet 4 or newer)                                   | Best vision reasoning for outfit pairing                                 |
| Try-on              | Perfect Corp YouCam Online Editor API (Clothes endpoint minimum) | **Sponsor requirement**                                                  |
| Deploy              | Vercel (frontend) + Railway/Render (backend)                     | Free, fast, no DevOps                                                    |

> **Only one Perfect Corp API is required** for the sponsor track. We'll use the **AI Clothes Try-On** endpoint as the primary call.

---

## 4 · The six screens

Open `closet-ui-mockup.html` in a browser. The mockup shows every screen at 360×740 (mobile portrait). Build screens in this order:

| #   | Screen                | Purpose                                              |
| --- | --------------------- | ---------------------------------------------------- |
| 01  | **Onboarding**        | Capture user's full-body profile photo (one-time)    |
| 02  | **Wardrobe**          | Home screen — grid of owned items, stats, FAB to add |
| 03  | **Try-On Capture**    | Photo + price + category for a new item              |
| 04  | **Try-On Result**     | Perfect Corp render + AI pairings + honest take      |
| 05  | **Wishlist**          | Saved looks; "Bought it" moves into wardrobe         |
| 06  | **Add Wardrobe Item** | Photo + AI auto-tag + save                           |

### Design language

- **Palette:** cream `#F4EFE6`, ink `#1A1612`, terracotta accent `#C2563A`, olive `#5B6A3F`
- **Fonts:** Fraunces (display), Instrument Serif (italic accents), Inter Tight (body), JetBrains Mono (labels)
- **Aesthetic:** editorial fashion magazine, refined, confident — _not_ generic e-commerce
- All values are in the mockup CSS; do not redesign

---

## 5 · Data model

```
User {
  id: "demo-user-1"  // hardcoded
  profile_photo_url: string  // Cloudinary URL
}

WardrobeItem {
  id: uuid
  image_url: string         // Cloudinary URL
  category: "top" | "bottom" | "outerwear" | "shoes" | "dress" | "accessory"
  color: string             // primary color, free-text
  description: string       // Claude-generated, e.g. "olive cotton field jacket"
  created_at: timestamp
}

WishlistItem {
  id: uuid
  new_item_image_url: string
  category: string
  price: number
  solo_render_url: string         // Perfect Corp: user wearing JUST the new item
  combinations: JSON              // each combo includes its own composite render URL
                                  // (see Section 7 for shape)
  honest_assessment: string
  created_at: timestamp
  // when "Bought it" is tapped → create a WardrobeItem, delete this row
}
```

---

## 6 · Backend routes

```
POST   /api/profile/photo          → upload to Cloudinary, save URL
GET    /api/wardrobe               → list items
POST   /api/wardrobe               → upload image, Claude auto-tag, save
DELETE /api/wardrobe/:id

POST   /api/tryon                  → main flow (see Section 7)
       body: { new_item_image, price, category }
       returns: { render_url, combinations, honest_assessment }

GET    /api/wishlist               → list
POST   /api/wishlist               → save a try-on result
POST   /api/wishlist/:id/purchase  → move to wardrobe, delete from wishlist
DELETE /api/wishlist/:id
```

---

## 7 · The core try-on flow

This is the heart of the app. When the user taps **See How It Looks**, the backend runs this sequence. The result screen shows **the user actually wearing the new item combined with their existing wardrobe pieces** — not just thumbnails. That's the whole demo.

### Step 1 — Upload images to Cloudinary

- User's new item photo → public URL
- Profile photo is already a public URL from onboarding
- All wardrobe item images are already on Cloudinary from when they were added

### Step 2 — Call Claude for pairing analysis

```
Prompt to Claude (vision):

You are a personal stylist. The user is considering buying this new item:
[image: new_item_image_url]
Category: <category>
Price: $<price>

Here is their existing wardrobe (each item has id, category, color, image):
- id=abc1, top, cream, [image]
- id=abc2, bottom, dark indigo, [image]
- id=abc3, shoes, black leather, [image]
- ...

Return ONLY valid JSON, no markdown:

{
  "combinations": [
    {
      "name": "short occasion name (e.g. 'Weekend errands')",
      "wardrobe_item_ids": ["abc1", "abc2", "abc3"],
      "styling_note": "one sentence on why it works"
    }
  ],
  "honest_assessment": "ONE sentence. Be candid: does this fill a real gap, or do they already own similar items? If similar items exist, say so directly."
}

Pick 2–3 combinations. Each combination must reference real wardrobe_item_ids
from the list above. Be honest in the assessment — that's the whole point.
```

### Step 3 — Render each look via Perfect Corp

**This section uses verified, tested endpoints and field names** — confirmed working on Postman with real Cloudinary URLs (May 2026). Do not change field names without testing.

#### The two endpoints you need

Only two Perfect Corp endpoints are used in this entire app:

| #   | Method | URL                                                             | Purpose                                                                   |
| --- | ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | POST   | `https://yce-api-01.makeupar.com/s2s/v2.0/task/cloth`           | Start a try-on render — returns a `task_id`                               |
| 2   | GET    | `https://yce-api-01.makeupar.com/s2s/v2.0/task/cloth/{task_id}` | Poll for the result every ~3s until `task_status` is `success` or `error` |

Auth on both: `Authorization: Bearer YOUR_API_KEY`

#### Verified working curl — solo render

This is the actual working request, tested end-to-end:

```bash
curl --location 'https://yce-api-01.makeupar.com/s2s/v2.0/task/cloth' \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "src_file_url": "https://res.cloudinary.com/.../user_photo.jpg",
    "ref_file_url": "https://res.cloudinary.com/.../garment.jpg",
    "garment_category": "auto",
    "change_shoes": false
  }'
```

**Returns:**

```json
{ "status": 200, "data": { "task_id": "jgn9H2SNMMJueqvhHUDZdQ..." } }
```

#### Verified working curl — poll for result

```bash
curl --location 'https://yce-api-01.makeupar.com/s2s/v2.0/task/cloth/PASTE_TASK_ID_HERE' \
  --header 'Authorization: Bearer YOUR_API_KEY'
```

**While running:**

```json
{ "status": 200, "data": { "task_status": "running" } }
```

**On success (typically ~15–25s later):**

```json
{
  "status": 200,
  "data": {
    "task_status": "success",
    "results": {
      "output": [
        {
          "url": "https://yce-us.s3-accelerate.amazonaws.com/.../result.jpg",
          "dst_id": "xyz789..."
        }
      ]
    }
  }
}
```

The `url` field is the rendered try-on image. The `dst_id` is needed for chaining (see below).

**On failure:**

```json
{
  "status": 200,
  "data": { "task_status": "error", "error": "error_download_image" }
}
```

Common errors: `error_download_image` (the URL wasn't publicly fetchable), `error_no_face`, `error_pose`, `error_multiple_people`.

#### Field reference (verified)

| Field              | Type    | Notes                                                                                                                                             |
| ------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src_file_url`     | string  | Public URL of the user's photo. **Must be a direct image URL** (ends in `.jpg`/`.png`), not a gallery/viewer page. Cloudinary URLs work natively. |
| `ref_file_url`     | string  | Public URL of the garment image. Same requirements.                                                                                               |
| `src_id`           | string  | Use **instead of** `src_file_url` when chaining from a previous render. Set this to the `dst_id` returned by the previous call.                   |
| `ref_file_id`      | string  | Use **instead of** `ref_file_url` if you uploaded via the File API. We don't — we use Cloudinary URLs.                                            |
| `garment_category` | string  | `"auto"` (let Perfect Corp detect) \| `"upper_body"` \| `"lower_body"` \| `"full_body"` \| `"shoes"`. Use `auto` unless you have a reason not to. |
| `change_shoes`     | boolean | Whether to swap out shoes in the render. Default `false`. Set `true` when the ref item itself is shoes.                                           |

#### Chained renders for outfit composites

To render the user wearing multiple items together (the new jacket + their existing tee + their existing jeans), chain calls using `dst_id`:

```
Call 1: src_file_url = profile photo,  ref_file_url = new jacket   → returns dst_id_1
Call 2: src_id      = dst_id_1,        ref_file_url = existing tee → returns dst_id_2
Call 3: src_id      = dst_id_2,        ref_file_url = existing jeans → returns dst_id_3
```

The final `url` from Call 3 is the composite outfit render.

```bash
# Example: chained call (the second/third call in a combo)
curl --location 'https://yce-api-01.makeupar.com/s2s/v2.0/task/cloth' \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "src_id": "DST_ID_FROM_PREVIOUS_CALL",
    "ref_file_url": "https://res.cloudinary.com/.../existing_tee.jpg",
    "garment_category": "auto",
    "change_shoes": false
  }'
```

> **Note on parallelism:** the solo render and each combo's chain can run **in parallel** (use `Promise.all` at the top level). **Within a single combo's chain**, calls must be sequential — you can't start Call 2 until Call 1 returns the `dst_id` it needs. Plan ~20s per chained render, multiplied by chain depth.

#### Account setup checklist (Day 1, before any code)

- [ ] Sign up at https://yce.perfectcorp.com/ai-api
- [ ] Redeem hackathon code `Pegasus1000` at https://yce.perfectcorp.com/api-console/en/redeem-code/ → adds 1000 units
- [ ] Generate API key at https://yce.perfectcorp.com/api-console/en/api-keys/ — **save the secret key immediately, it's only shown once**
- [ ] Validate auth: `curl --request GET 'https://yce-api-01.makeupar.com/s2s/v1.0/client/credit' --header 'Authorization: Bearer YOUR_API_KEY'` should return your unit balance
- [ ] Run the solo render curl above with two Cloudinary URLs and confirm you get a result
- [ ] Bookmark: docs at https://docs.perfectcorp.com/develop/introduction (has an "Ask AI" assistant for live questions)

#### Unit budget (~1000 units total)

Each cloth try-on call consumes some units (Perfect Corp doesn't publish exact per-call cost — check the `/credit` endpoint after each call to see the drop).

Rough planning estimate:

- Solo render: 1 call
- Each outfit combo with 3 garments: 3 chained calls
- Two combos per try-on session: 6 calls
- Total per try-on session: ~7 calls

To preserve budget during development:

- Cache aggressively — never re-render the same combination twice
- Use 2 combos in v1, not 3
- For demo rehearsals, replay cached results instead of new renders
- Reserve at least 100 units for demo day

### Step 4 — Return the assembled response

```json
{
  "solo_render_url": "https://...",
  "honest_assessment": "You already own two field jackets in similar tones. Skip unless you need a lighter weight option.",
  "combinations": [
    {
      "name": "Weekend errands",
      "wardrobe_item_ids": ["abc1", "abc2", "abc3"],
      "wardrobe_item_details": [
        { "id": "abc1", "description": "cream cotton tee", "image_url": "..." },
        { "id": "abc2", "description": "dark indigo denim", "image_url": "..." },
        { "id": "abc3", "description": "rust chelsea boots", "image_url": "..." }
      ],
      "styling_note": "Olive plays well against the cream tee — adds a layer without competing.",
      "composite_render_url": "https://..."
    },
    {
      "name": "Office casual",
      "wardrobe_item_ids": ["abc4", "abc5"],
      "wardrobe_item_details": [...],
      "styling_note": "Layer over the rust blouse for a slightly bolder take.",
      "composite_render_url": "https://..."
    }
  ]
}
```

The frontend renders Screen 04: solo render at top, the honest take, then one outfit card per combination — each showing the **composite render** (the user wearing everything together) plus the itemized piece list with the new item marked in terracotta and owned items marked plain.

> **Cost note:** every result screen triggers 1 (solo) + N (per combo chain length) Perfect Corp calls. With 2 outfit combos averaging 3 garments each, that's ~7 calls per try-on. The 1000 unit hackathon credit is enough — cache aggressively and don't re-render unchanged combinations. Verify actual unit cost per call by checking `/credit` after each test render.

---

## 8 · The Add Wardrobe Item AI flow

When user uploads a wardrobe item photo:

```
Prompt to Claude (vision):

Look at this clothing item. Return ONLY JSON:
{
  "category": "top" | "bottom" | "outerwear" | "shoes" | "dress" | "accessory",
  "color": "single-word primary color, lowercase",
  "description": "short phrase, e.g. 'olive cotton field jacket'"
}
```

Pre-fill the form chips with the result. User can override before tapping Save.

---

## 9 · Build plan (10 days, ~2 hrs/day)

| Day    | Task                                                                                                                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | Project setup. Vite + React + Tailwind frontend. Express backend. Cloudinary account + upload helper. **Perfect Corp curl is already validated** (see Section 7) — just port the working request into Node code on Day 6. |
| **2**  | Onboarding screen. Profile photo upload to Cloudinary. Persist user.                                                                                                                                                      |
| **3**  | Wardrobe data model + backend CRUD. Wardrobe grid UI (Screen 02).                                                                                                                                                         |
| **4**  | Add Wardrobe Item screen (Screen 06). Claude vision auto-tag.                                                                                                                                                             |
| **5**  | Try-On Capture screen (Screen 03). Camera + upload + form.                                                                                                                                                                |
| **6**  | **Perfect Corp integration in code.** Port the verified curl (Section 7) into a Node helper. Build polling logic (every 3s, ~25s timeout). Test chained renders with `dst_id` for multi-garment composites.               |
| **7**  | **Claude pairing prompt + parallel rendering.** Wire `/api/tryon`: Claude picks combos → fire renders in parallel (1 solo + N chained composites). Cache aggressively.                                                    |
| **8**  | Try-On Result screen (Screen 04). Render hero image, assessment, combos.                                                                                                                                                  |
| **9**  | Wishlist screen (Screen 05) + "Bought it" flow. Polish, error states, loading states.                                                                                                                                     |
| **10** | Deploy. Record demo video. Write Devpost submission. **Submit by noon, not midnight.**                                                                                                                                    |

---

## 10 · Demo video script (1–3 minutes)

The Perfect Corp prize **requires** a 1–3 minute demo video. Outline:

1. **00:00 – 00:15 — Hook.** "Every year, Americans spend $400 billion on clothes — and return $100 billion of them. Closet is the app that helps you decide _before_ you buy."
2. **00:15 – 00:30 — In-store moment.** Film someone in an actual Target/Zara/etc. snapping a real garment.
3. **00:30 – 01:00 — The magic.** Cut to phone screen: capture flow, the try-on render appearing, the three pairings, the honest assessment line.
4. **01:00 – 01:30 — Wardrobe pairing.** Show how the existing closet is referenced. Highlight one styling note ("works because…").
5. **01:30 – 02:00 — The "Bought it" loop.** Tap it; show the item moving into wardrobe.
6. **02:00 – 02:30 — Close.** "One Perfect Corp API call, one Claude call, one wardrobe that thinks back. That's Closet."

**Film the in-store moment in an actual store.** Sponsor judges and Perfect Corp's marketing team (who'll write the blog post about the winner) will love it.

---

## 11 · Devpost submission checklist

- [ ] Project title: **Closet**
- [ ] Tagline: "A wardrobe that thinks back. AI try-on meets your existing closet."
- [ ] Hero screenshot: Screen 04 from the mockup (the result screen)
- [ ] 3–5 additional screenshots: onboarding, wardrobe, capture, result, wishlist
- [ ] Demo video link (YouTube unlisted is fine)
- [ ] Built With: React, Node, Express, Cloudinary, Perfect Corp API, Claude API, Tailwind, SQLite
- [ ] Try It Out: deployed Vercel URL
- [ ] GitHub repo link (public)
- [ ] Submit to **Perfect Corp challenge** specifically (not just overall)

### Write-up structure

- **Inspiration** — closet bloat, returns, impulse buying
- **What it does** — bullet list of the 4 user actions
- **How we built it** — call out Perfect Corp Clothes API as the engine + Claude for pairing
- **Challenges** — Perfect Corp's async polling, public URL requirement, prompt tuning for honest assessments
- **What's next** — OCR for price tags, makeup try-on, retailer integrations, social sharing of looks, sustainability score

---

## 12 · Gotchas

1. **Perfect Corp needs public, direct image URLs — not gallery pages, not raw bytes.** Cloudinary URLs work natively. The URL must end in `.jpg`/`.png` and load as a raw image when pasted into a browser tab (no website wrapping the image). Gallery URLs like imgur's `/a/abc123` will return `error_download_image` even though they look valid in a browser.
2. **Perfect Corp is async.** POST returns a `task_id`; you poll until done. Build a loading screen with a shimmer effect; do not block the request thread. Polling interval ~3s; total wait ~15–25s per render.
3. **Try-on quality depends on photo quality.** For the demo, curate clean garment photos with plain backgrounds and full-body user photos with the person centered and facing forward. Hackathon demos are theater — control the inputs.
4. **Test with real photos early.** Have everyone on the team take a clean full-body photo on Day 1 and use those throughout. The verified curl in Section 7 has already been run with real photos and confirmed to produce a usable render — replicate that setup.
5. **The "honest assessment" matters more than you think.** Tune the Claude prompt until it actually says "skip this" sometimes. An AI that always says yes is a sycophant. An AI that pushes back is novel.
6. **Submit early.** Devpost servers get hammered in the final hour. Aim to submit Sunday morning, not Sunday night.
7. **Multi-garment rendering uses `dst_id` chaining, not one mega-call.** Perfect Corp's `/task/cloth` endpoint handles one garment per call but returns a `dst_id` that you pass as `src_id` (NOT `src_file_id`) for the next call — layering items without re-uploading. A 3-garment look = 3 sequential API round-trips ≈ ~45–75 seconds total. Show progress in the UI ("Trying on jacket... adding jeans... adding boots...").
8. **Render fewer combinations if needed.** The result screen looks great with 2 combos. If 3 combos blow your API budget or feel slow, ship 2 and call it a feature ("two thoughtful pairings, not ten lazy ones").
9. **Use Perfect Corp's "Ask AI" docs assistant.** At `docs.perfectcorp.com/develop/introduction` you can ask the docs in plain English ("show me how to call cloth try-on with chained garments"). Saves debugging time on field-name questions.
10. **Field names are exact.** It's `src_file_url` / `ref_file_url` (not `src_image_url`/`ref_image_url` — that was wrong in earlier drafts). For chaining, it's `src_id` (not `src_file_id`). The Section 7 curl has the correct names; don't deviate without testing.
11. **Rotate your API key if it ever leaks.** Don't commit it to git, don't paste it in screenshots, don't share it in chat. At https://yce.perfectcorp.com/api-console/en/api-keys/ you can revoke and regenerate in 30 seconds. Lost units are gone — there's no refund.

---

## 13 · Diagrams

The five diagrams below are saved as SVG files in the `diagrams/` folder. They render in any markdown viewer (VS Code, GitHub, Notion, web browsers — anywhere). If you want to edit them, the source SVG is plain XML; or recreate from the Mermaid sources also kept in `diagrams/` if you prefer.

### 13.1 — High-level system architecture

How the pieces fit together. **Claude does the thinking, Perfect Corp does the rendering, Cloudinary does the hosting.**

![System architecture](diagrams/d1-architecture.svg)

### 13.2 — The core try-on flow (sequence)

The most important diagram. This is what happens when the user taps **"See How It Looks"** on Screen 03. Hand this to your dev — it's the spec for the `/api/tryon` endpoint.

![Core try-on flow](diagrams/d2-tryon-flow.svg)

**Key timing notes:**

- Steps 5–6 (Claude call) typically completes in 2–5 seconds
- Steps 7–10 (solo render) typically ~15–25 seconds
- Each combo chain (steps 11–13) ~45–75 seconds (3 sequential calls)
- Run combo chains **in parallel with each other** to keep total wait ~75s, not 75 × N

### 13.3 — Adding a wardrobe item (sequence)

Simpler flow for Screen 06. Used every time a user adds something to their closet.

![Adding a wardrobe item](diagrams/d3-add-wardrobe.svg)

### 13.4 — The "Bought it" flow (state diagram)

What happens when a user purchases an item from their wishlist. This is the loop that makes the wardrobe-aware feature compound over time.

![Bought it loop](diagrams/d4-bought-it.svg)

The arrow from **In Wardrobe → Browsing** is the magic. Every purchased item becomes a pairing option for future try-ons — the app gets smarter the more you use it.

### 13.5 — Perfect Corp task lifecycle (state diagram)

What happens to a single Perfect Corp render task. Your dev's polling logic needs to handle all these states.

![Perfect Corp task lifecycle](diagrams/d5-task-lifecycle.svg)

---

## 14 · Files in this handoff

- `instructions.md` — this document
- `closet-ui-mockup.html` — open in any browser to view all 6 screens with annotations
- `diagrams/` — five SVG diagrams referenced in Section 13. Open any `.svg` file in a browser to view.

Questions or stuck somewhere? The mockup is the source of truth for UI; this doc is the source of truth for flow, architecture, and Perfect Corp specifics. If they conflict, the mockup wins for visual decisions and this doc wins for behavior.

Good luck. Win this thing.
