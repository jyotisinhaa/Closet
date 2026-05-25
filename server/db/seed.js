// Seeds catalog with brand products: node db/seed.js
// All image_urls are Unsplash CDN URLs — spot-check any that look off after seeding
require("../config");
const pool = require("./client");

const REMOVE_CATEGORIES = ["Outerwear", "Jacket", "Coat", "Blazer"];

const CATALOG = [
  // ── Dresses (20) ───────────────────────────────────────────────────────────
  {
    brand: "Zara",
    name: "Floral Long Sleeve Dress",
    category: "Dress",
    color: "#2C2C2C",
    price: 79,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1616313253719-c46514cddee1?w=400&h=500&fit=crop",
    style_tags: ["feminine", "classic", "party"],
  },
  {
    brand: "H&M",
    name: "Floral Wrap Dress",
    category: "Dress",
    color: "#E8C4A0",
    price: 45,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1502868354157-ec2edd2a1651?w=400&h=500&fit=crop",
    style_tags: ["romantic", "summer", "feminine"],
  },
  {
    brand: "Mango",
    name: "Blue Floral Midi Dress",
    category: "Dress",
    color: "#4A7FA5",
    price: 89,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1517970640957-23d07d5ed08c?w=400&h=500&fit=crop",
    style_tags: ["bohemian", "summer", "feminine"],
  },
  {
    brand: "ASOS",
    name: "Floral Spaghetti Strap",
    category: "Dress",
    color: "#1A1612",
    price: 55,
    store_url: "https://asos.com",
    image_url:
      "https://images.unsplash.com/photo-1600102427329-d5b2cde7e162?w=400&h=500&fit=crop",
    style_tags: ["evening", "feminine", "party"],
  },
  {
    brand: "Reformation",
    name: "Yellow Floral Sundress",
    category: "Dress",
    color: "#F0C040",
    price: 148,
    store_url: "https://thereformation.com",
    image_url:
      "https://images.unsplash.com/photo-1602303894456-398ce544d90b?w=400&h=500&fit=crop",
    style_tags: ["bohemian", "summer", "feminine"],
  },
  {
    brand: "Free People",
    name: "Blue Floral Maxi Dress",
    category: "Dress",
    color: "#4A6FA5",
    price: 128,
    store_url: "https://freepeople.com",
    image_url:
      "https://images.unsplash.com/photo-1601182282494-fba0fa905e9d?w=400&h=500&fit=crop",
    style_tags: ["bohemian", "festival", "romantic"],
  },
  {
    brand: "Massimo Dutti",
    name: "Linen Street Dress",
    category: "Dress",
    color: "#D4CBB8",
    price: 119,
    store_url: "https://massimodutti.com",
    image_url:
      "https://images.unsplash.com/photo-1646296142225-28436a93863a?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "smart-casual", "summer"],
  },
  {
    brand: "COS",
    name: "White Sleeveless Dress",
    category: "Dress",
    color: "#FFFFFF",
    price: 99,
    store_url: "https://cosstores.com",
    image_url:
      "https://images.unsplash.com/photo-1520026582657-4daf5bb60adb?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "elegant", "summer"],
  },
  {
    brand: "Anthropologie",
    name: "Colorful Wrap Maxi",
    category: "Dress",
    color: "#C4A882",
    price: 138,
    store_url: "https://anthropologie.com",
    image_url:
      "https://images.unsplash.com/photo-1671848633245-79cc98b0dbe8?w=400&h=500&fit=crop",
    style_tags: ["romantic", "bohemian", "feminine"],
  },
  {
    brand: "& Other Stories",
    name: "Green Midi Dress",
    category: "Dress",
    color: "#4A7A4A",
    price: 95,
    store_url: "https://stories.com",
    image_url:
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "smart-casual", "summer"],
  },
  {
    brand: "Zara",
    name: "Floral Step-Hem Dress",
    category: "Dress",
    color: "#E8C4A0",
    price: 75,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1776479454537-a15b5c145b1f?w=400&h=500&fit=crop",
    style_tags: ["feminine", "summer", "casual"],
  },
  {
    brand: "H&M",
    name: "Red Chiffon Maxi Dress",
    category: "Dress",
    color: "#C0392B",
    price: 49,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1759726995161-8bcd3d1aacba?w=400&h=500&fit=crop",
    style_tags: ["evening", "feminine", "romantic"],
  },
  {
    brand: "Reformation",
    name: "White Linen Dress",
    category: "Dress",
    color: "#FFFFFF",
    price: 158,
    store_url: "https://thereformation.com",
    image_url:
      "https://images.unsplash.com/photo-1775498315557-3c96ff626ec3?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "summer", "elegant"],
  },
  {
    brand: "Mango",
    name: "Black Bodycon Dress",
    category: "Dress",
    color: "#1A1612",
    price: 79,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop",
    style_tags: ["evening", "classic", "party"],
  },
  {
    brand: "ASOS",
    name: "Lilac Smock Midi Dress",
    category: "Dress",
    color: "#C3A8C8",
    price: 55,
    store_url: "https://asos.com",
    image_url:
      "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&h=500&fit=crop",
    style_tags: ["feminine", "romantic", "casual"],
  },
  {
    brand: "COS",
    name: "Navy Shift Dress",
    category: "Dress",
    color: "#1D3557",
    price: 129,
    store_url: "https://cosstores.com",
    image_url:
      "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "work", "classic"],
  },
  {
    brand: "Anthropologie",
    name: "Burgundy Velvet Midi",
    category: "Dress",
    color: "#800020",
    price: 148,
    store_url: "https://anthropologie.com",
    image_url:
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=400&h=500&fit=crop",
    style_tags: ["elegant", "evening", "romantic"],
  },
  {
    brand: "Zara",
    name: "Emerald Satin Mini Dress",
    category: "Dress",
    color: "#2E7D32",
    price: 85,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=400&h=500&fit=crop",
    style_tags: ["party", "trendy", "evening"],
  },
  {
    brand: "Free People",
    name: "Rust Boho Sundress",
    category: "Dress",
    color: "#C0392B",
    price: 118,
    store_url: "https://freepeople.com",
    image_url:
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=500&fit=crop",
    style_tags: ["bohemian", "festival", "summer"],
  },
  {
    brand: "Reformation",
    name: "Sage Slip Dress",
    category: "Dress",
    color: "#8FAF8F",
    price: 168,
    store_url: "https://thereformation.com",
    image_url:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "elegant", "feminine"],
  },

  // ── Tops (20) ──────────────────────────────────────────────────────────────
  {
    brand: "Zara",
    name: "Green Satin Blouse",
    category: "Top",
    color: "#4A7A4A",
    price: 49,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1649140336105-a4452db77649?w=400&h=500&fit=crop",
    style_tags: ["elegant", "work", "minimalist"],
  },
  {
    brand: "Mango",
    name: "Teal Off-Shoulder Blouse",
    category: "Top",
    color: "#2A7A8A",
    price: 59,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1704775983224-43dae05da876?w=400&h=500&fit=crop",
    style_tags: ["feminine", "summer", "romantic"],
  },
  {
    brand: "H&M",
    name: "Pink Ruffle Blouse",
    category: "Top",
    color: "#F4A5B4",
    price: 29,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1711188053972-670fee62032f?w=400&h=500&fit=crop",
    style_tags: ["feminine", "casual", "everyday"],
  },
  {
    brand: "Zara",
    name: "Pink Silk Shirt",
    category: "Top",
    color: "#F4A5B4",
    price: 55,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1730513007475-40fefb93f23b?w=400&h=500&fit=crop",
    style_tags: ["elegant", "work", "feminine"],
  },
  {
    brand: "Uniqlo",
    name: "Striped Relaxed Shirt",
    category: "Top",
    color: "#1D3557",
    price: 39,
    store_url: "https://uniqlo.com",
    image_url:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop",
    style_tags: ["casual", "classic", "everyday"],
  },
  {
    brand: "COS",
    name: "Black Long Sleeve Top",
    category: "Top",
    color: "#1A1612",
    price: 79,
    store_url: "https://cosstores.com",
    image_url:
      "https://images.unsplash.com/photo-1608033247410-817c68700611?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "classic", "everyday"],
  },
  {
    brand: "Mango",
    name: "Red Button-Down Shirt",
    category: "Top",
    color: "#C0392B",
    price: 45,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1622782045724-5c7cddda7e70?w=400&h=500&fit=crop",
    style_tags: ["casual", "classic", "everyday"],
  },
  {
    brand: "Zara",
    name: "White Linen Blouse",
    category: "Top",
    color: "#FFFFFF",
    price: 55,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "summer", "elegant"],
  },
  {
    brand: "Uniqlo",
    name: "Navy Crew Neck Tee",
    category: "Top",
    color: "#1D3557",
    price: 25,
    store_url: "https://uniqlo.com",
    image_url:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop",
    style_tags: ["casual", "minimalist", "everyday"],
  },
  {
    brand: "COS",
    name: "Cream Ribbed Knit Top",
    category: "Top",
    color: "#F5F0E8",
    price: 85,
    store_url: "https://cosstores.com",
    image_url:
      "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "cozy", "everyday"],
  },
  {
    brand: "ASOS",
    name: "Black Spaghetti Strap Top",
    category: "Top",
    color: "#1A1612",
    price: 22,
    store_url: "https://asos.com",
    image_url:
      "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=400&h=500&fit=crop",
    style_tags: ["casual", "summer", "minimalist"],
  },
  {
    brand: "H&M",
    name: "Floral Wrap Blouse",
    category: "Top",
    color: "#C4A882",
    price: 35,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=400&h=500&fit=crop",
    style_tags: ["feminine", "romantic", "casual"],
  },
  {
    brand: "Reformation",
    name: "White Cropped Tee",
    category: "Top",
    color: "#FFFFFF",
    price: 58,
    store_url: "https://thereformation.com",
    image_url:
      "https://images.unsplash.com/photo-1562137369-1a1a0bc66744?w=400&h=500&fit=crop",
    style_tags: ["casual", "minimalist", "everyday"],
  },
  {
    brand: "Zara",
    name: "Yellow Linen Blouse",
    category: "Top",
    color: "#F0C040",
    price: 35,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&h=500&fit=crop",
    style_tags: ["casual", "summer", "feminine"],
  },
  {
    brand: "Mango",
    name: "Beige Ruched Blouse",
    category: "Top",
    color: "#C4A882",
    price: 49,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop",
    style_tags: ["feminine", "elegant", "work"],
  },
  {
    brand: "ASOS",
    name: "Forest Green Puff Sleeve Top",
    category: "Top",
    color: "#0E2920",
    price: 35,
    store_url: "https://asos.com",
    image_url:
      "https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?w=400&h=500&fit=crop",
    style_tags: ["feminine", "trendy", "casual"],
  },
  {
    brand: "& Other Stories",
    name: "Terracotta Linen Tee",
    category: "Top",
    color: "#C07050",
    price: 45,
    store_url: "https://stories.com",
    image_url:
      "https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=400&h=500&fit=crop",
    style_tags: ["casual", "minimalist", "everyday"],
  },
  {
    brand: "Topshop",
    name: "Sage Ribbed Tank",
    category: "Top",
    color: "#8FAF8F",
    price: 28,
    store_url: "https://topshop.com",
    image_url:
      "https://images.unsplash.com/photo-1515664069236-68a74c369d97?w=400&h=500&fit=crop",
    style_tags: ["casual", "minimalist", "summer"],
  },
  {
    brand: "Free People",
    name: "Ivory Lace Camisole",
    category: "Top",
    color: "#F5F0E8",
    price: 68,
    store_url: "https://freepeople.com",
    image_url:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=500&fit=crop",
    style_tags: ["feminine", "romantic", "summer"],
  },

  // ── Jeans (20) ─────────────────────────────────────────────────────────────
  {
    brand: "Levi's",
    name: "High-Rise Wide Leg Jeans",
    category: "Jeans",
    color: "#4A6FA5",
    price: 98,
    store_url: "https://levi.com",
    image_url:
      "https://images.unsplash.com/photo-1714143136372-ddaf8b606da7?w=400&h=500&fit=crop",
    style_tags: ["casual", "classic", "everyday"],
  },
  {
    brand: "H&M",
    name: "Straight Leg Denim",
    category: "Jeans",
    color: "#2E4A7A",
    price: 39,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=400&h=500&fit=crop",
    style_tags: ["casual", "classic", "minimalist"],
  },
  {
    brand: "AGOLDE",
    name: "Relaxed 90s Jeans",
    category: "Jeans",
    color: "#5B7FA6",
    price: 198,
    store_url: "https://agolde.com",
    image_url:
      "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=500&fit=crop",
    style_tags: ["vintage", "casual", "everyday"],
  },
  {
    brand: "Madewell",
    name: "The Perfect Vintage Jean",
    category: "Jeans",
    color: "#4A6FA5",
    price: 135,
    store_url: "https://madewell.com",
    image_url:
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=400&h=500&fit=crop",
    style_tags: ["classic", "casual", "everyday"],
  },
  {
    brand: "Zara",
    name: "Beach Straight Jeans",
    category: "Jeans",
    color: "#87A9C9",
    price: 69,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1616956455145-7c40e34a1c2a?w=400&h=500&fit=crop",
    style_tags: ["casual", "summer", "everyday"],
  },
  {
    brand: "Topshop",
    name: "Mom Jeans",
    category: "Jeans",
    color: "#87A9C9",
    price: 55,
    store_url: "https://topshop.com",
    image_url:
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&h=500&fit=crop",
    style_tags: ["vintage", "casual", "trendy"],
  },
  {
    brand: "Levi's",
    name: "501 Original Fit",
    category: "Jeans",
    color: "#2E4A7A",
    price: 108,
    store_url: "https://levi.com",
    image_url:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop",
    style_tags: ["classic", "casual", "everyday"],
  },
  {
    brand: "Zara",
    name: "Wide Leg White Jeans",
    category: "Jeans",
    color: "#FFFFFF",
    price: 79,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1600369671236-a17b66a93ac2?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "trendy", "summer"],
  },
  {
    brand: "Mango",
    name: "Straight Dark Wash Jeans",
    category: "Jeans",
    color: "#1D3557",
    price: 69,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1604025702551-16e91e04a4da?w=400&h=500&fit=crop",
    style_tags: ["classic", "smart-casual", "everyday"],
  },
  {
    brand: "AGOLDE",
    name: "Pinch Waist Jeans",
    category: "Jeans",
    color: "#5B7FA6",
    price: 228,
    store_url: "https://agolde.com",
    image_url:
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "trendy", "everyday"],
  },
  {
    brand: "H&M",
    name: "Flare Leg Jeans",
    category: "Jeans",
    color: "#4A6FA5",
    price: 45,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400&h=500&fit=crop",
    style_tags: ["vintage", "trendy", "casual"],
  },
  {
    brand: "COS",
    name: "Cropped Tapered Jeans",
    category: "Jeans",
    color: "#2E4A7A",
    price: 115,
    store_url: "https://cosstores.com",
    image_url:
      "https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "smart-casual", "everyday"],
  },
  {
    brand: "Madewell",
    name: "Curvy High Waist Jeans",
    category: "Jeans",
    color: "#4A6FA5",
    price: 148,
    store_url: "https://madewell.com",
    image_url:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
    style_tags: ["classic", "casual", "everyday"],
  },
  {
    brand: "Levi's",
    name: "Wedgie Straight Jeans",
    category: "Jeans",
    color: "#87A9C9",
    price: 98,
    store_url: "https://levi.com",
    image_url:
      "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400&h=500&fit=crop",
    style_tags: ["vintage", "casual", "classic"],
  },
  {
    brand: "Topshop",
    name: "Black Skinny Jeans",
    category: "Jeans",
    color: "#1A1612",
    price: 55,
    store_url: "https://topshop.com",
    image_url:
      "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=400&h=500&fit=crop",
    style_tags: ["classic", "minimalist", "everyday"],
  },
  {
    brand: "Reformation",
    name: "Vintage Straight Cut Jeans",
    category: "Jeans",
    color: "#5B7FA6",
    price: 178,
    store_url: "https://thereformation.com",
    image_url:
      "https://images.unsplash.com/photo-1565084888279-aca607bb7cd0?w=400&h=500&fit=crop",
    style_tags: ["vintage", "casual", "everyday"],
  },
  {
    brand: "ASOS",
    name: "Distressed Boyfriend Jeans",
    category: "Jeans",
    color: "#87A9C9",
    price: 48,
    store_url: "https://asos.com",
    image_url:
      "https://images.unsplash.com/photo-1578932750355-5eb30ece487a?w=400&h=500&fit=crop",
    style_tags: ["casual", "vintage", "everyday"],
  },
  {
    brand: "Zara",
    name: "Z1975 Straight Jeans",
    category: "Jeans",
    color: "#4A6FA5",
    price: 59,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=500&fit=crop",
    style_tags: ["casual", "classic", "everyday"],
  },
  {
    brand: "Free People",
    name: "Ultra High Rise Skinny",
    category: "Jeans",
    color: "#2E4A7A",
    price: 128,
    store_url: "https://freepeople.com",
    image_url:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop",
    style_tags: ["casual", "classic", "everyday"],
  },
  {
    brand: "Uniqlo",
    name: "Slim Straight Jeans",
    category: "Jeans",
    color: "#1D3557",
    price: 49,
    store_url: "https://uniqlo.com",
    image_url:
      "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "casual", "everyday"],
  },

  // ── Shorts (20) ────────────────────────────────────────────────────────────
  {
    brand: "Levi's",
    name: "Classic Denim Cut-Offs",
    category: "Shorts",
    color: "#4A6FA5",
    price: 68,
    store_url: "https://levi.com",
    image_url:
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop",
    style_tags: ["casual", "summer", "classic"],
  },
  {
    brand: "Zara",
    name: "Blue Denim Shorts",
    category: "Shorts",
    color: "#4A6FA5",
    price: 45,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1585145197082-dba095ba01ab?w=400&h=500&fit=crop",
    style_tags: ["casual", "summer", "everyday"],
  },
  {
    brand: "H&M",
    name: "Casual Denim Shorts",
    category: "Shorts",
    color: "#5B7FA6",
    price: 25,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1760551600460-018b52b28045?w=400&h=500&fit=crop",
    style_tags: ["casual", "summer", "everyday"],
  },
  {
    brand: "Zara",
    name: "Beige Linen Shorts",
    category: "Shorts",
    color: "#C4A882",
    price: 49,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1613754444310-22b02a55b4b7?w=400&h=500&fit=crop",
    style_tags: ["casual", "summer", "minimalist"],
  },
  {
    brand: "H&M",
    name: "Black High-Waist Shorts",
    category: "Shorts",
    color: "#1A1612",
    price: 29,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=400&h=500&fit=crop",
    style_tags: ["casual", "classic", "everyday"],
  },
  {
    brand: "Mango",
    name: "White Tailored Shorts",
    category: "Shorts",
    color: "#FFFFFF",
    price: 55,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1581044777550-4cfa9179d65d?w=400&h=500&fit=crop",
    style_tags: ["smart-casual", "summer", "minimalist"],
  },
  {
    brand: "ASOS",
    name: "Khaki Cargo Shorts",
    category: "Shorts",
    color: "#7A7A55",
    price: 38,
    store_url: "https://asos.com",
    image_url:
      "https://images.unsplash.com/photo-1562184552-997c461abbe6?w=400&h=500&fit=crop",
    style_tags: ["casual", "utility", "summer"],
  },
  {
    brand: "Mango",
    name: "Terracotta Linen Shorts",
    category: "Shorts",
    color: "#C07050",
    price: 49,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=500&fit=crop",
    style_tags: ["casual", "summer", "minimalist"],
  },
  {
    brand: "H&M",
    name: "White Athletic Shorts",
    category: "Shorts",
    color: "#FFFFFF",
    price: 22,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1565693413579-8a73ffa9787c?w=400&h=500&fit=crop",
    style_tags: ["sporty", "casual", "summer"],
  },
  {
    brand: "ASOS",
    name: "Floral Print Shorts",
    category: "Shorts",
    color: "#C4A882",
    price: 38,
    store_url: "https://asos.com",
    image_url:
      "https://images.unsplash.com/photo-1617296538902-887900d9b592?w=400&h=500&fit=crop",
    style_tags: ["feminine", "summer", "casual"],
  },
  {
    brand: "Zara",
    name: "Striped Bermuda Shorts",
    category: "Shorts",
    color: "#1D3557",
    price: 45,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1622445272461-c6580d707f6a?w=400&h=500&fit=crop",
    style_tags: ["casual", "classic", "summer"],
  },
  {
    brand: "H&M",
    name: "Dark Wash Denim Shorts",
    category: "Shorts",
    color: "#2E4A7A",
    price: 29,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1529810313688-44ea1c2d81d3?w=400&h=500&fit=crop",
    style_tags: ["casual", "classic", "everyday"],
  },
  {
    brand: "Mango",
    name: "Olive Linen Shorts",
    category: "Shorts",
    color: "#7A7A55",
    price: 55,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=500&fit=crop",
    style_tags: ["casual", "utility", "summer"],
  },
  {
    brand: "COS",
    name: "Wide Linen Shorts",
    category: "Shorts",
    color: "#D4CBB8",
    price: 89,
    store_url: "https://cosstores.com",
    image_url:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "smart-casual", "summer"],
  },
  {
    brand: "Topshop",
    name: "High Waist Paperbag Shorts",
    category: "Shorts",
    color: "#C4A882",
    price: 42,
    store_url: "https://topshop.com",
    image_url:
      "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=400&h=500&fit=crop",
    style_tags: ["trendy", "casual", "summer"],
  },
  {
    brand: "ASOS",
    name: "Satin Mini Shorts",
    category: "Shorts",
    color: "#F4A5B4",
    price: 32,
    store_url: "https://asos.com",
    image_url:
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=400&h=500&fit=crop",
    style_tags: ["feminine", "trendy", "evening"],
  },
  {
    brand: "Free People",
    name: "Embroidered Shorts",
    category: "Shorts",
    color: "#F0C040",
    price: 78,
    store_url: "https://freepeople.com",
    image_url:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop",
    style_tags: ["bohemian", "summer", "feminine"],
  },
  {
    brand: "Zara",
    name: "Printed Linen Shorts",
    category: "Shorts",
    color: "#4A7A4A",
    price: 39,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1524654458049-e36be0721fa6?w=400&h=500&fit=crop",
    style_tags: ["casual", "summer", "feminine"],
  },
  {
    brand: "Reformation",
    name: "Tencel Utility Shorts",
    category: "Shorts",
    color: "#87A9C9",
    price: 88,
    store_url: "https://thereformation.com",
    image_url:
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=500&fit=crop",
    style_tags: ["casual", "minimalist", "summer"],
  },
  {
    brand: "Uniqlo",
    name: "Chino Shorts",
    category: "Shorts",
    color: "#C4A882",
    price: 35,
    store_url: "https://uniqlo.com",
    image_url:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=500&fit=crop",
    style_tags: ["casual", "classic", "everyday"],
  },

  // ── Skirts (20) ────────────────────────────────────────────────────────────
  {
    brand: "COS",
    name: "Black Midi Pencil Skirt",
    category: "Skirt",
    color: "#1A1612",
    price: 89,
    store_url: "https://cosstores.com",
    image_url:
      "https://images.unsplash.com/photo-1708363390847-b4af54f45273?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "work", "classic"],
  },
  {
    brand: "Mango",
    name: "Tan Linen A-Line Skirt",
    category: "Skirt",
    color: "#C4A882",
    price: 65,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1618244942912-7351be026e8b?w=400&h=500&fit=crop",
    style_tags: ["casual", "summer", "feminine"],
  },
  {
    brand: "Zara",
    name: "Yellow Checked Mini Skirt",
    category: "Skirt",
    color: "#F0C040",
    price: 49,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1509182469511-7f0b50bfa63e?w=400&h=500&fit=crop",
    style_tags: ["trendy", "casual", "summer"],
  },
  {
    brand: "H&M",
    name: "Floral Midi Skirt",
    category: "Skirt",
    color: "#C4A882",
    price: 35,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1583846783214-7229a7bd651f?w=400&h=500&fit=crop",
    style_tags: ["feminine", "romantic", "summer"],
  },
  {
    brand: "Zara",
    name: "White Pleated Mini Skirt",
    category: "Skirt",
    color: "#FFFFFF",
    price: 45,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1619785413536-a34a28394aa1?w=400&h=500&fit=crop",
    style_tags: ["trendy", "feminine", "summer"],
  },
  {
    brand: "Mango",
    name: "Beige Satin Slip Skirt",
    category: "Skirt",
    color: "#C4A882",
    price: 65,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=400&h=500&fit=crop",
    style_tags: ["elegant", "feminine", "evening"],
  },
  {
    brand: "& Other Stories",
    name: "Navy Wrap Midi Skirt",
    category: "Skirt",
    color: "#1D3557",
    price: 79,
    store_url: "https://stories.com",
    image_url:
      "https://images.unsplash.com/photo-1594938298603-c8148c4b984e?w=400&h=500&fit=crop",
    style_tags: ["smart-casual", "classic", "feminine"],
  },
  {
    brand: "Reformation",
    name: "Sage Wrap Mini Skirt",
    category: "Skirt",
    color: "#8FAF8F",
    price: 108,
    store_url: "https://thereformation.com",
    image_url:
      "https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "casual", "feminine"],
  },
  {
    brand: "ASOS",
    name: "Hot Pink Micro Mini Skirt",
    category: "Skirt",
    color: "#F4A5B4",
    price: 32,
    store_url: "https://asos.com",
    image_url:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
    style_tags: ["trendy", "party", "feminine"],
  },
  {
    brand: "Free People",
    name: "Flowy Boho Maxi Skirt",
    category: "Skirt",
    color: "#C07050",
    price: 128,
    store_url: "https://freepeople.com",
    image_url:
      "https://images.unsplash.com/photo-1603792907191-89e55f70099a?w=400&h=500&fit=crop",
    style_tags: ["bohemian", "romantic", "summer"],
  },
  {
    brand: "Zara",
    name: "Black Leather Mini Skirt",
    category: "Skirt",
    color: "#1A1612",
    price: 69,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1589810264340-0ce7b9d7d1e1?w=400&h=500&fit=crop",
    style_tags: ["edgy", "trendy", "party"],
  },
  {
    brand: "H&M",
    name: "Sage Pleated Midi Skirt",
    category: "Skirt",
    color: "#8FAF8F",
    price: 35,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=400&h=500&fit=crop",
    style_tags: ["feminine", "casual", "everyday"],
  },
  {
    brand: "COS",
    name: "Cream Asymmetric Skirt",
    category: "Skirt",
    color: "#F5F0E8",
    price: 99,
    store_url: "https://cosstores.com",
    image_url:
      "https://images.unsplash.com/photo-1583846712662-a15f6dbc5cca?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "elegant", "work"],
  },
  {
    brand: "Mango",
    name: "Red Wrap Mini Skirt",
    category: "Skirt",
    color: "#C0392B",
    price: 55,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1611042553365-9b101441c135?w=400&h=500&fit=crop",
    style_tags: ["trendy", "feminine", "casual"],
  },
  {
    brand: "Anthropologie",
    name: "Floral Print Midi Skirt",
    category: "Skirt",
    color: "#4A7FA5",
    price: 119,
    store_url: "https://anthropologie.com",
    image_url:
      "https://images.unsplash.com/photo-1619784822868-8b5e3d2a8ddf?w=400&h=500&fit=crop",
    style_tags: ["romantic", "bohemian", "summer"],
  },
  {
    brand: "Topshop",
    name: "Denim Midi Skirt",
    category: "Skirt",
    color: "#4A6FA5",
    price: 55,
    store_url: "https://topshop.com",
    image_url:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop",
    style_tags: ["casual", "classic", "everyday"],
  },
  {
    brand: "ASOS",
    name: "Emerald Satin Bias Skirt",
    category: "Skirt",
    color: "#2E7D32",
    price: 45,
    store_url: "https://asos.com",
    image_url:
      "https://images.unsplash.com/photo-1616765685989-e2c14e4d5e41?w=400&h=500&fit=crop",
    style_tags: ["elegant", "evening", "feminine"],
  },
  {
    brand: "Free People",
    name: "Crochet Mini Skirt",
    category: "Skirt",
    color: "#F5F0E8",
    price: 98,
    store_url: "https://freepeople.com",
    image_url:
      "https://images.unsplash.com/photo-1624626397218-f2f7c5b9c94e?w=400&h=500&fit=crop",
    style_tags: ["bohemian", "feminine", "summer"],
  },
  {
    brand: "Reformation",
    name: "Printed Wrap Midi Skirt",
    category: "Skirt",
    color: "#C4A882",
    price: 128,
    store_url: "https://thereformation.com",
    image_url:
      "https://images.unsplash.com/photo-1515664069236-68a74c369d97?w=400&h=500&fit=crop",
    style_tags: ["feminine", "romantic", "casual"],
  },
  {
    brand: "& Other Stories",
    name: "Rust Corduroy Midi Skirt",
    category: "Skirt",
    color: "#C07050",
    price: 89,
    store_url: "https://stories.com",
    image_url:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop",
    style_tags: ["casual", "cozy", "autumn"],
  },

  // ── Shoes & Sandals ────────────────────────────────────────────────────────
  {
    brand: "Mango",
    name: "Brown Leather Sandals",
    category: "Sandals",
    color: "#8B6343",
    price: 59,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1613662632164-7f2b081a5b46?w=400&h=500&fit=crop",
    style_tags: ["casual", "summer", "everyday"],
  },
  {
    brand: "Ancient Greek Sandals",
    name: "White Strappy Flats",
    category: "Sandals",
    color: "#FFFFFF",
    price: 195,
    store_url: "https://ancient-greek-sandals.com",
    image_url:
      "https://images.unsplash.com/photo-1756907901119-bcaea01f9168?w=400&h=500&fit=crop",
    style_tags: ["classic", "mediterranean", "summer"],
  },
  {
    brand: "H&M",
    name: "Leather Ankle Boots",
    category: "Shoes",
    color: "#1A1612",
    price: 59,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop",
    style_tags: ["classic", "casual", "autumn"],
  },
  {
    brand: "Adidas",
    name: "White Minimalist Sneakers",
    category: "Shoes",
    color: "#FFFFFF",
    price: 95,
    store_url: "https://adidas.com",
    image_url:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=500&fit=crop",
    style_tags: ["sporty", "minimalist", "casual"],
  },

  // ── Hats ───────────────────────────────────────────────────────────────────
  {
    brand: "Lack of Color",
    name: "Camel Wide Brim Hat",
    category: "Hat",
    color: "#C4A882",
    price: 89,
    store_url: "https://lackofcolor.com",
    image_url:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=500&fit=crop",
    style_tags: ["bohemian", "summer", "minimalist"],
  },
  {
    brand: "Lack of Color",
    name: "Black Felt Fedora",
    category: "Hat",
    color: "#1A1612",
    price: 99,
    store_url: "https://lackofcolor.com",
    image_url:
      "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=400&h=500&fit=crop",
    style_tags: ["classic", "autumn", "chic"],
  },
  {
    brand: "Zara",
    name: "Cream Woven Bucket Hat",
    category: "Hat",
    color: "#F5F0E8",
    price: 35,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=500&fit=crop",
    style_tags: ["casual", "summer", "minimalist"],
  },
  {
    brand: "H&M",
    name: "Navy Baseball Cap",
    category: "Hat",
    color: "#1C3A5E",
    price: 18,
    store_url: "https://hm.com",
    image_url:
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400&h=500&fit=crop",
    style_tags: ["sporty", "casual", "everyday"],
  },
  {
    brand: "Mango",
    name: "Natural Straw Sun Hat",
    category: "Hat",
    color: "#C4A860",
    price: 45,
    store_url: "https://mango.com",
    image_url:
      "https://images.unsplash.com/photo-1531551136323-a42c8d48f1cf?w=400&h=500&fit=crop",
    style_tags: ["summer", "bohemian", "beach"],
  },

  // ── Accessories ────────────────────────────────────────────────────────────
  {
    brand: "Zara",
    name: "Wide Leg Linen Trousers",
    category: "Bottom",
    color: "#D4CBB8",
    price: 89,
    store_url: "https://zara.com",
    image_url:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "casual", "summer"],
  },
  {
    brand: "COS",
    name: "Structured Canvas Tote",
    category: "Bag",
    color: "#8C8273",
    price: 49,
    store_url: "https://cosstores.com",
    image_url:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop",
    style_tags: ["minimalist", "everyday", "neutral"],
  },
  {
    brand: "Mejuri",
    name: "Gold Hoop Earrings",
    category: "Accessory",
    color: "#C9A961",
    price: 68,
    store_url: "https://mejuri.com",
    image_url:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&h=500&fit=crop",
    style_tags: ["classic", "minimalist", "everyday"],
  },
];

async function seed() {
  const { rowCount: deleted } = await pool.query(
    `DELETE FROM catalog_items WHERE category = ANY($1)`,
    [REMOVE_CATEGORIES],
  );
  if (deleted) console.log(`✓ Removed ${deleted} jacket/outerwear items`);

  let inserted = 0,
    skipped = 0;
  for (const item of CATALOG) {
    const { rowCount } = await pool.query(
      `INSERT INTO catalog_items (brand, name, category, color, price, store_url, image_url, style_tags, sponsored)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)
       ON CONFLICT DO NOTHING`,
      [
        item.brand,
        item.name,
        item.category,
        item.color,
        item.price,
        item.store_url,
        item.image_url,
        item.style_tags,
      ],
    );
    rowCount ? inserted++ : skipped++;
  }
  console.log(
    `✓ Seeded ${inserted} new catalog items (${skipped} already existed)`,
  );
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
