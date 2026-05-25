#!/usr/bin/env python3
"""Closet API helper for the Hermes closet-stylist skill.

Thin CLI over the Closet backend (Express, default http://localhost:3001/api).
Stdlib only (urllib) so it runs without any pip installs. Every command prints
compact JSON to stdout so the agent can parse the result.

Usage:
  python closet.py catalog   [--query Q] [--category C] [--limit N]
  python closet.py wardrobe
  python closet.py profile
  python closet.py recommend
  python closet.py tryon --image-url URL --category C
                         [--wardrobe-image-url URL2 --wardrobe-category C2]
                         [--gender female|male]

Base URL override:  CLOSET_API=http://host:port/api
"""
import argparse
import json
import os
import sys
import urllib.request
import urllib.error

BASE = os.environ.get("CLOSET_API", "http://localhost:3001/api").rstrip("/")
TIMEOUT = 180  # try-on renders can take a while


def _request(method, path, payload=None):
    url = f"{BASE}{path}"
    data = json.dumps(payload).encode() if payload is not None else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        raise SystemExit(f"ERROR {e.code} on {method} {path}: {body}")
    except urllib.error.URLError as e:
        raise SystemExit(
            f"ERROR connecting to {url}: {e.reason}. "
            "Is the Closet server running on port 3001? (cd Closet/server && npm run dev)"
        )


def _slim_catalog(item):
    return {
        "id": item.get("id"),
        "brand": item.get("brand"),
        "name": item.get("name"),
        "category": item.get("category"),
        "color": item.get("color"),
        "price": item.get("price"),
        "image_url": item.get("image_url"),
        "store_url": item.get("store_url"),
        "style_tags": item.get("style_tags"),
    }


def _slim_wardrobe(item):
    return {
        "id": item.get("id"),
        "category": item.get("category"),
        "color": item.get("color"),
        "description": item.get("description"),
        "image_url": item.get("image_url"),
    }


def cmd_catalog(args):
    items = _request("GET", "/catalog")
    q = (args.query or "").lower()
    cat = (args.category or "").lower()
    out = []
    for it in items:
        hay = " ".join(str(it.get(k, "")) for k in ("brand", "name", "category", "color")).lower()
        if q and q not in hay:
            continue
        if cat and cat != str(it.get("category", "")).lower():
            continue
        out.append(_slim_catalog(it))
    print(json.dumps(out[: args.limit], indent=2))


def cmd_wardrobe(args):
    items = _request("GET", "/wardrobe")
    print(json.dumps([_slim_wardrobe(i) for i in items], indent=2))


def cmd_profile(args):
    print(json.dumps(_request("GET", "/profile"), indent=2))


def cmd_recommend(args):
    recs = _request("GET", "/recommendations")
    out = []
    for r in recs:
        w, c = r.get("wardrobe_item", {}), r.get("catalog_item", {})
        out.append({
            "wardrobe": {"id": w.get("id"), "category": w.get("category"), "image_url": w.get("image_url")},
            "suggested": _slim_catalog(c),
            "similarity_score": r.get("similarity_score"),
            "style_reason": r.get("style_reason"),
        })
    print(json.dumps(out, indent=2))


def cmd_tryon(args):
    payload = {"image_url": args.image_url, "category": args.category}
    if args.wardrobe_image_url:
        payload["wardrobe_image_url"] = args.wardrobe_image_url
        payload["wardrobe_category"] = args.wardrobe_category or ""
    if args.gender:
        payload["gender"] = args.gender
    res = _request("POST", "/tryon/quick", payload)
    print(json.dumps(res, indent=2))


def main():
    p = argparse.ArgumentParser(description="Closet API helper")
    sub = p.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("catalog", help="List/search shoppable catalog items")
    c.add_argument("--query"); c.add_argument("--category"); c.add_argument("--limit", type=int, default=10)
    c.set_defaults(func=cmd_catalog)

    sub.add_parser("wardrobe", help="List the user's owned items").set_defaults(func=cmd_wardrobe)
    sub.add_parser("profile", help="Show the user's profile").set_defaults(func=cmd_profile)
    sub.add_parser("recommend", help="Wardrobe-matched catalog picks").set_defaults(func=cmd_recommend)

    t = sub.add_parser("tryon", help="Render the user wearing a catalog item")
    t.add_argument("--image-url", required=True); t.add_argument("--category", required=True)
    t.add_argument("--wardrobe-image-url"); t.add_argument("--wardrobe-category")
    t.add_argument("--gender", choices=["female", "male"])
    t.set_defaults(func=cmd_tryon)

    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
