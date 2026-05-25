# Closet Stylist — Hermes Agent on Crusoe Nemotron

A **Hermes Agent** (Nous Research) personal-stylist agent that runs on **NVIDIA
Nemotron** served by **Crusoe Cloud Managed Inference**. It styles the user from
their real [Closet](../) wardrobe — reading their profile/wardrobe/catalog,
recommending pairings, and rendering photoreal try-ons.

> Hackathon: *"Your Harness, Our Inference — Build a Nemotron Agent."*
> Harness = Hermes. Inference = Crusoe Managed Inference. Model = Nemotron-3 Nano Omni.

## Architecture

```
Hermes Agent (harness)
   └─ provider: custom  →  https://api.inference.crusoecloud.com/v1   (Crusoe Managed Inference)
        └─ model: nvidia/Nemotron-3-Nano-Omni-Reasoning-30B-A3B       (multimodal Nemotron)
   └─ skill: closet-stylist
        └─ scripts/closet.py  →  Closet backend (http://localhost:3001/api)
             catalog · wardrobe · profile · recommendations · try-on
```

The agent reasons (color/silhouette/occasion); `closet.py` (stdlib-only) is the
tool surface over the Closet REST API; Crusoe runs the Nemotron inference.

## Prerequisites

- Hermes Agent installed (`iex (irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1)`)
- A Crusoe Managed Inference API key
- The Closet backend running: `cd ../server && npm run dev` (needs the Postgres + `.env` from the main app)

## Setup

1. **Point Hermes at Crusoe** — in `%LOCALAPPDATA%\hermes\config.yaml`:
   ```yaml
   model:
     default: "nvidia/Nemotron-3-Nano-Omni-Reasoning-30B-A3B"
     provider: "custom"
     api_key: 'YOUR_CRUSOE_KEY'      # single-quoted: the bcrypt-style key contains $
     base_url: "https://api.inference.crusoecloud.com/v1"
   ```
2. **Install the skill** into your Hermes home:
   ```powershell
   .\install-skill.ps1
   ```

## Run the demo

```powershell
.\run-demo.ps1
# or a custom request:
.\run-demo.ps1 "Style me for a summer wedding from my wardrobe and suggest one thing to buy."
```

Example output (real run, Nemotron Nano Omni on Crusoe):

> • *Mango Oversized Linen Blazer* — neutral beige layer that works with black and cream pants and brightens the blue shirt.
> • *Mango Red Button-Down Shirt* — bold red that contrasts the blue shirt and looks sharp with the black pants.

## Files

| File | Purpose |
|---|---|
| `skills/closet-stylist/SKILL.md` | The Hermes skill — teaches Nemotron how/when to operate Closet |
| `skills/closet-stylist/scripts/closet.py` | Stdlib helper wrapping the Closet API (catalog/wardrobe/profile/recommend/tryon) |
| `install-skill.ps1` | Copies the skill into `%LOCALAPPDATA%\hermes\skills\closet\` |
| `run-demo.ps1` | Sets env vars and runs the stylist prompt one-shot |

## Notes

- The Hermes installer sets `HERMES_HOME` and `HERMES_GIT_BASH_PATH` as user env
  vars — a fresh terminal has them. `run-demo.ps1` sets sane fallbacks if not.
- Try-on renders cost Perfect Corp credits and need a profile photo (onboarding);
  the demo above uses only the free, fast read/recommend path.
