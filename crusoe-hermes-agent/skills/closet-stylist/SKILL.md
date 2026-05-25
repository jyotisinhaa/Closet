---
name: closet-stylist
description: Use when the user wants outfit styling, wardrobe pairing, shopping suggestions, or a virtual try-on from their Closet wardrobe app. Operates the Closet API — catalog search, wardrobe, profile, recommendations, and try-on — through a stdlib Python helper.
version: 1.0.0
author: Closet
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [fashion, styling, wardrobe, shopping, closet, virtual-try-on, crusoe, nemotron]
    related_skills: []
---

# Closet Stylist

## Overview

Closet is a virtual wardrobe + try-on app. This skill lets you act as the user's
personal stylist: read what they own, search shoppable items, explain pairings,
and render a photoreal try-on of them wearing something. You reason about color,
silhouette, and occasion; the Closet backend does the data + image rendering.

All access goes through one helper script (stdlib only — no installs needed):

```
python "$HERMES_HOME/skills/closet/closet-stylist/scripts/closet.py" <command>
```

On this machine `$HERMES_HOME` = `C:\Users\ANURA\AppData\Local\hermes`. If
`$HERMES_HOME` is ever unset in the shell, use that absolute path directly. Run
it with the **terminal** tool.

## When to Use

- "What should I wear…", "style me for <occasion>", "build an outfit"
- "What goes with my <item>?", "what should I buy to go with my wardrobe?"
- "Show me wearing <item>" / "try this on me"

Don't use for: general web shopping unrelated to the Closet app, or anything when
the Closet server isn't reachable (see Setup).

## Setup / Preconditions

The Closet backend must be running at `http://localhost:3001` (override with the
`CLOSET_API` env var). If a command returns a connection error, tell the user to
start it: `cd Closet/server && npm run dev`. Try-on also requires the user to
have completed onboarding (a profile photo) — `profile` shows whether one exists.

## Commands

| Command | What it returns |
|---|---|
| `catalog [--query Q] [--category C] [--limit N]` | shoppable items (id, brand, name, category, color, price, image_url) |
| `wardrobe` | items the user owns (id, category, color, description, image_url) |
| `profile` | the user's profile (incl. whether a try-on photo exists) |
| `recommend` | catalog picks matched to the wardrobe, with a style_reason |
| `tryon --image-url URL --category C [--wardrobe-image-url URL2 --wardrobe-category C2] [--gender female\|male]` | `{ "render_url": ... }` — a photoreal render |

Examples:

```bash
SC="$HERMES_HOME/skills/closet/closet-stylist/scripts/closet.py"
python "$SC" wardrobe
python "$SC" catalog --category Dress --limit 5
python "$SC" recommend
python "$SC" tryon --image-url "https://…/blazer.jpg" --category Outerwear --gender female
```

Every command prints compact JSON to stdout — parse it and reason over it.

## Styling Workflow

1. **Know the user.** Run `profile` and `wardrobe` first so suggestions are
   grounded in what they actually own and who they are.
2. **Find candidates.** Use `catalog` (filter by category/query) or `recommend`
   (already wardrobe-matched) to gather options.
3. **Reason like a stylist.** Pick pieces that complement existing wardrobe colors
   (contrast, don't duplicate), match the occasion, and fill real gaps. Explain
   *why* each pairing works in one or two sentences.
4. **Try it on (optional).** When the user wants to see it, call `tryon` with the
   chosen catalog item's `image_url` + `category`. To show it paired with one of
   their own pieces, also pass `--wardrobe-image-url`/`--wardrobe-category`. Pass
   `--gender` from the profile when known. Share the returned `render_url`.

Keep the user's budget and existing items in mind — prefer 1-3 high-impact
suggestions over a long list.

## Category Vocabulary

Catalog/wardrobe categories include: Top, Shirt, Jeans, Bottom, Dress, Skirt,
Outerwear, Shoes, Bag, Hat, Scarf, Accessory. Use these exact words for
`--category` filters and try-on categories.

## Try-on Notes

- Try-on renders cost real inference credits and take ~20-60s — only call `tryon`
  when the user actually wants to see an image, not for every suggestion.
- Scarves can't be paired with tops in a composite (they get overwritten); the
  app already handles this, so don't be surprised if a scarf renders solo.
- If `tryon` fails, fall back to describing the look in words and offer to retry.

## Common Pitfalls

1. **Suggesting without reading the wardrobe.** Always `wardrobe` + `profile`
   first; styling blind looks generic and may duplicate what they own.
2. **Calling `tryon` unprompted.** It's slow and costs credits. Gate it behind a
   clear "show me / try it on" intent.
3. **Wrong category casing.** Use the exact vocabulary above (e.g. `Outerwear`,
   not `jacket`) so filters and renders route correctly.
4. **Assuming the server is up.** A connection error means the backend isn't
   running — tell the user how to start it instead of retrying blindly.
5. **Dumping raw JSON at the user.** Parse it and respond as a stylist; show
   image URLs and prices, not the whole payload.

## Verification Checklist

- [ ] `profile` and `wardrobe` were consulted before recommending
- [ ] Each suggestion has a one-line reason grounded in their wardrobe/occasion
- [ ] `tryon` only called on explicit user intent; `render_url` shared
- [ ] Categories use the exact vocabulary; prices/links surfaced cleanly
- [ ] On connection error, the user was told to start the Closet server
