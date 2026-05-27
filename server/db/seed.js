// Seeds catalog with real product data: node db/seed.js
// After seeding, generate embeddings: curl -X POST http://localhost:3001/api/catalog/embed-all
require("../config");
const pool = require("./client");

const CATALOG = [
  // ── Dresses ────────────────────────────────────────────────────────────────
  {
    brand: "Uniqlo", name: "Womens Linen Blend Camisole Dress | UNIQLO US", category: "Dress", gender: "female",
    color: "Brown", price: 49.90,
    store_url: "https://www.uniqlo.com/us/en/products/E485446-000/00?colorDisplayCode=09&sizeDisplayCode=003",
    image_url: "https://res.cloudinary.com/dojtqzsyu/image/upload/v1779841491/closet/catalog/womens-linen-blend-camisole-dress-uniqlo-1779841491282.jpg",
    style_tags: ["Casual"],
  },
  {
    brand: "H&M", name: "Strappy Dress", category: "Dress", gender: "female",
    color: "Dark Brown", price: 24.99,
    store_url: "https://www2.hm.com/en_us/productpage.1283256008.html",
    image_url: "https://image.hm.com/assets/hm/46/da/46da94aef22da4a71485ee51a216147efdb67468.jpg?imwidth=820",
    style_tags: ["Casual"],
  },
  {
    brand: "Amazon", name: "Acelitt Summer Off the Shoulder Dresses", category: "Dress", gender: "female",
    color: "Green", price: 15.99,
    store_url: "https://www.amazon.com/Acelitt-Shoulder-Dresses-Bodycon-Cocktail/dp/B0G31WSK2D/",
    image_url: "https://m.media-amazon.com/images/I/61gw+VQaHnL._AC_UY1000_DpWeblab_.jpg",
    style_tags: ["Party"],
  },
  {
    brand: "Amazon", name: "Women's 2026 Summer Ruched Bodycon Dress", category: "Dress", gender: "female",
    color: "Sky Blue", price: 62.99,
    store_url: "https://www.amazon.com/ZESICA-Bodycon-Sleeveless-Backless-Cocktail/dp/B0D4VNQRNC/",
    image_url: "https://m.media-amazon.com/images/I/91seZktlblL._AC_UY350_DpWeblab_.jpg",
    style_tags: ["Wedding Party Dresses"],
  },
  {
    brand: "Amazon", name: "Bridal Tulle Sweetheart Ball Gown with Detachable Sleeves", category: "Dress", gender: "female",
    color: "", price: 299.95,
    store_url: "https://www.amazon.com/Davids-Bridal-Sweetheart-Detachable-Sleeves/dp/B0F6RGL7T5/",
    image_url: "https://images-na.ssl-images-amazon.com/images/I/61au-c0pU1L._AC_UL210_SR210,210_.jpg",
    style_tags: [],
  },
  {
    brand: "Amazon", name: "Short Sleeve Bodycon Mini Dresses for Women Collared V-Neck Short Summer Dress Casual Shirt Dress with Pockets", category: "Dress", gender: "female",
    color: "Burgundy", price: 49.99,
    store_url: "https://www.amazon.com/Selagira-Burgundy-Dresses-Business-X-Large/dp/B0GL7N1FZW/",
    image_url: "https://m.media-amazon.com/images/I/51CCv-58V1L._AC_SX569_.jpg",
    style_tags: ["Summer Dress"],
  },
  {
    brand: "Amazon", name: "Sundresses for Women Teens 2026 Summer Flowy Ruffle Mini Dress", category: "Dress", gender: "female",
    color: "Black Apricot Floral", price: 41.99,
    store_url: "https://www.amazon.com/dp/B0GSDQ2JP3/",
    image_url: "https://m.media-amazon.com/images/I/81UiysT3trL._AC_UF480,600_SR480,600_.jpg",
    style_tags: ["Summer Dress"],
  },
  {
    brand: "Walmart", name: "Idoravan Womens Evening Dresses Women's V-Neck Retro Print Polka-Dot Long-Sleeved Casual Bow Tie Stitching Large Swing Dress", category: "Dress", gender: "female",
    color: "Black", price: 14.05,
    store_url: "https://www.walmart.com/ip/Idoravan-Womens-Evening-Dresses/1342609211",
    image_url: "https://i5.walmartimages.com/asr/cf2361d5-ace2-4c31-aaa7-0cd916c80134.22e1949a78584c847dc7a6aa2b3eeff2.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    style_tags: ["Casual Dress"],
  },
  {
    brand: "Amazon", name: "OWIN Women's Sexy Summer Casual Mock Neck Dresses Sleeveless Ruched Bodycon Cocktail Party Mini Dress", category: "Dress", gender: "female",
    color: "Light Blue", price: 29.98,
    store_url: "https://www.amazon.com/OWIN-Bodycon-Sleeveles-Elegant-Cocktail/dp/B0F4XLMJH3/",
    image_url: "https://m.media-amazon.com/images/I/6107LysixKL._AC_SY606_.jpg",
    style_tags: ["Party Dress"],
  },
  {
    brand: "Amazon", name: "Allegra K Button Down Denim Dress for Women Summer 2026 Sleeveless Sweetheart Neck Jean Dress", category: "Dress", gender: "female",
    color: "Black", price: 46.88,
    store_url: "https://www.amazon.com/Allegra-Button-Sleeveless-Sweetheart-Dresses/dp/B0C4CZW1SR/",
    image_url: "https://m.media-amazon.com/images/I/61HiZSpjYeL._AC_SY606_.jpg",
    style_tags: ["Casual Dress"],
  },

  // ── Tops ───────────────────────────────────────────────────────────────────
  {
    brand: "H&M", name: "Textured Halterneck Top", category: "Top", gender: "female",
    color: "Dark khaki green", price: 19.99,
    store_url: "https://www2.hm.com/en_us/productpage.1326379004.html",
    image_url: "https://image.hm.com/assets/hm/47/06/47061b099454d75e616dab16c6816276cf9e828b.jpg?imwidth=1260",
    style_tags: ["Casual Top"],
  },
  {
    brand: "H&M", name: "Cowl-Neck Halterneck Top", category: "Top", gender: "female",
    color: "Black", price: 39.99,
    store_url: "https://www2.hm.com/en_us/productpage.1345966001.html",
    image_url: "https://image.hm.com/assets/hm/ee/ff/eeff84943660b9edfe12fd6ab3d35ad956968c88.jpg?imwidth=1260",
    style_tags: ["Summer Top"],
  },
  {
    brand: "H&M", name: "Twist-Detail Halterneck Top", category: "Top", gender: "female",
    color: "Olive green", price: 14.99,
    store_url: "https://www2.hm.com/en_us/productpage.1334509002.html",
    image_url: "https://image.hm.com/assets/hm/bc/3e/bc3eff528597fb4fd058ab3f712b8a1c2bcb8de3.jpg?imwidth=1260",
    style_tags: ["Casual Top"],
  },
  {
    brand: "H&M", name: "Boat-Neck Top", category: "Top", gender: "female",
    color: "Dark Brown", price: 19.99,
    store_url: "https://www2.hm.com/en_us/productpage.1333671001.html",
    image_url: "https://image.hm.com/assets/hm/d8/08/d808b75ceff10ca43404c87c728abfccb08be3bf.jpg?imwidth=1260",
    style_tags: ["Casual Top"],
  },
  {
    brand: "Tommy Hilfiger", name: "Classic Fit Stretch Cotton Polo", category: "Top", gender: "female",
    color: "Red", price: 34.99,
    store_url: "https://usa.tommy.com/en/women/clothing/tops/classic-fit-stretch-cotton-polo/76J5198-XLG.html",
    image_url: "https://shoptommy.scene7.com/is/image/ShopTommy/76J5198_XLG_main?wid=1728&qlt=80%2C0&resMode=sharp2&op_usm=0.9%2C1.0%2C8%2C0&iccEmbed=0&fmt=webp",
    style_tags: ["Casual Top"],
  },
  {
    brand: "Tommy Hilfiger", name: "Slim Fit Rugby Stripe Zip Polo", category: "Top", gender: "female",
    color: "Navy Stripe", price: 34.99,
    store_url: "https://usa.tommy.com/en/women/clothing/tops/slim-fit-rugby-stripe-zip-polo/XW04844-DW5.html",
    image_url: "https://shoptommy.scene7.com/is/image/ShopTommy/XW04844_DW5_main",
    style_tags: ["Casual Top"],
  },
  {
    brand: "Ralph Lauren", name: "Classic Fit Striped Jersey T-Shirt", category: "Top", gender: "male",
    color: "White", price: 55,
    store_url: "https://www.ralphlauren.com/men-clothing-t-shirts/classic-fit-striped-jersey-t-shirt/100040535.html",
    image_url: "https://dtcralphlauren.scene7.com/is/image/PoloGSI/s7-AI710960660500_alternate10?$rl_4x5_pdp$",
    style_tags: ["Casual T-Shirt"],
  },

  // ── Skirts ─────────────────────────────────────────────────────────────────
  {
    brand: "Uniqlo", name: "Womens Shirring Volume Frill Mini Skirt | UNIQLO US", category: "Skirt", gender: "female",
    color: "", price: 29.90,
    store_url: "https://www.uniqlo.com/us/en/products/E484707-000/00?colorDisplayCode=38&sizeDisplayCode=003",
    image_url: "https://res.cloudinary.com/dojtqzsyu/image/upload/v1779841529/closet/catalog/womens-shirring-volume-frill-mini-skirt--1779841530176.jpg",
    style_tags: [],
  },
  {
    brand: "Amazon", name: "Sidefeel Women's Jean Skirt High Waist Summer Stretch Denim Skirt Button Knee Length Skirt with Pockets", category: "Skirt", gender: "female",
    color: "Black", price: 29.99,
    store_url: "https://www.amazon.com/Sidefeel-Womens-Stretch-Zimbaplatinum-Pockets/dp/B0DKSMVR4M/",
    image_url: "https://m.media-amazon.com/images/I/71pDMsKbsvL._AC_SY606_.jpg",
    style_tags: ["Casual Skirt"],
  },
  {
    brand: "adidas", name: "adidas Women's Ultimate365 Gingham Skirt", category: "Skirt", gender: "female",
    color: "Wonder Taupe", price: 61.86,
    store_url: "https://www.amazon.com/adidas-Womens-Ultimate365-Gingham-Wonder/dp/B0D659JJWY/",
    image_url: "https://m.media-amazon.com/images/I/81dnoTwqByL._AC_SY535_.jpg",
    style_tags: ["Casual Skirt"],
  },
  {
    brand: "Calvin Klein", name: "Calvin Klein Womens Petites Mini Wrap Skirt", category: "Skirt", gender: "female",
    color: "Grey", price: 37.99,
    store_url: "https://www.walmart.com/ip/CALVIN-KLEIN-Womens-Brown-Belted-Zippered-Knee-Length-Peplum-Skirt-Size-14/560353402",
    image_url: "https://i5.walmartimages.com/seo/CALVIN-KLEIN-Womens-Brown-Belted-Zippered-Knee-Length-Peplum-Skirt-Size-14_ec160ccc-f1fb-4e46-a607-699c9198dba4.3b6a3b70d6ae852560281c7dda99415d.jpeg?odnHeight=1067&odnWidth=800&odnBg=FFFFFF",
    style_tags: ["Casual Skirt"],
  },
  {
    brand: "Walmart", name: "Mgmyaa Women's Floral Midi Skirts Loose Casual A-line Skirts Front Slit Mid Length Flowing Skirt", category: "Skirt", gender: "female",
    color: "Green", price: 6.02,
    store_url: "https://www.walmart.com/ip/Mgmyaa-Women-s-Floral-Midi-Skirts-Loose-Casual-A-line-Skirts-Front-Slit-Mid-Length-Flowing-Skirt/17023724116",
    image_url: "https://i5.walmartimages.com/seo/Mgmyaa-Women-s-Floral-Midi-Skirts-Loose-Casual-A-line-Skirts-Front-Slit-Mid-Length-Flowing-Skirt_01ca7454-dcab-4e98-8571-32335fa87ba9.e8588535fdaf658588a05c8e59aaf810.jpeg?odnHeight=160&odnWidth=160&odnBg=FFFFFF",
    style_tags: ["Casual Skirt"],
  },
  {
    brand: "H&M", name: "A-Line Skirt", category: "Skirt", gender: "female",
    color: "Navy blue", price: 18.99,
    store_url: "https://www2.hm.com/en_us/productpage.1265873001.html",
    image_url: "https://image.hm.com/assets/hm/8e/43/8e43ae48eb881b7159c0514ecaf604adcdbd5dbd.jpg?imwidth=768",
    style_tags: ["Casual Skirt"],
  },
  {
    brand: "H&M", name: "Tiered Cotton Skirt", category: "Skirt", gender: "female",
    color: "Black/patterned", price: 24.99,
    store_url: "https://www2.hm.com/en_us/productpage.1276926001.html",
    image_url: "https://image.hm.com/assets/hm/86/1c/861cec06335a6be79cea66c8017d1477b3dcae24.jpg?imwidth=1260",
    style_tags: ["Casual Skirt"],
  },
  {
    brand: "Macy's", name: "Women's Voile Eyelet Maxi Skirt", category: "Skirt", gender: "female",
    color: "Radiant navy", price: 79.95,
    store_url: "https://www.macys.com/shop/product/lands-end-womens-voile-eyelet-maxi-skirt?ID=26693695",
    image_url: "https://slimages.macysassets.com/is/image/MCY/products/6/optimized/36693636_fpx.tif?op_sharpen=1&wid=600&fit=fit,1&fmt=jpeg",
    style_tags: ["Casual Skirt"],
  },

  // ── Jeans ──────────────────────────────────────────────────────────────────
  {
    brand: "American Eagle", name: "AE Stretch Ripped Super High-Waisted Straight Jean", category: "Jeans", gender: "female",
    color: "Dreamy Indigo", price: 24.99,
    store_url: "https://www.ae.com/us/en/p/women/jeans/high-waisted-jeans/ae-stretch-ripped-super-high-waisted-straight-jean/0435_5858_905",
    image_url: "https://s7d2.scene7.com/is/image/aeo/0435_5858_905_f?$pdp-md-opt$&fmt=webp",
    style_tags: ["Casual Jeans"],
  },
  {
    brand: "American Eagle", name: "AE Stretch High-Waisted Flare Jean", category: "Jeans", gender: "female",
    color: "Light Blue", price: 24.99,
    store_url: "https://www.ae.com/us/en/p/women/bottoms/jeans/flare-bootcut-jeans/ae-stretch-high-waisted-flare-jean/1436_5716_915",
    image_url: "https://s7d2.scene7.com/is/image/aeo/1436_5716_915_f?$pdp-md-opt$&fmt=webp",
    style_tags: ["Casual Jeans"],
  },
  {
    brand: "American Eagle", name: "AE Next Level High-Waisted Jegging", category: "Jeans", gender: "female",
    color: "Indigo", price: 31.46,
    store_url: "https://www.ae.com/us/en/p/women/jeans/jeggings-skinny-jeans/ae-next-level-high-waisted-jegging/0433_5418_950",
    image_url: "https://s7d2.scene7.com/is/image/aeo/0433_5418_950_f?$pdp-md-opt$&fmt=webp",
    style_tags: ["Casual Jeans"],
  },
  {
    brand: "American Eagle", name: "AE Stretch High-Waisted Flare Jean (Blue)", category: "Jeans", gender: "female",
    color: "Blue", price: 24.99,
    store_url: "https://www.ae.com/us/en/p/women/bottoms/jeans/flare-bootcut-jeans/ae-stretch-high-waisted-flare-jean/1436_6009_068",
    image_url: "https://s7d2.scene7.com/is/image/aeo/1436_6009_068_f?$pdp-md-opt$&fmt=webp",
    style_tags: ["Casual Jeans"],
  },
  {
    brand: "American Eagle", name: "AE Next Level High-Waisted Jegging (Black)", category: "Jeans", gender: "female",
    color: "Black", price: 24.99,
    store_url: "https://www.ae.com/us/en/p/women/jeans/high-waisted-jeans/ae-next-level-high-waisted-jegging/0433_5420_085",
    image_url: "https://s7d2.scene7.com/is/image/aeo/0433_5420_085_f?$pdp-md-opt$&fmt=webp",
    style_tags: ["Casual Jeans"],
  },
  {
    brand: "American Eagle", name: "AE Strigid Mom Jean", category: "Jeans", gender: "female",
    color: "Black", price: 48.96,
    store_url: "https://www.ae.com/us/en/p/women/jeans/mom-jeans/ae-strigid-mom-jean/0436_5794_022",
    image_url: "https://s7d2.scene7.com/is/image/aeo/0436_5794_022_of?$pdp-md-opt$&fmt=webp",
    style_tags: ["Casual Jeans"],
  },
  {
    brand: "American Eagle", name: "AE Stretch High-Waisted Stovepipe Jean", category: "Jeans", gender: "female",
    color: "Brown", price: 24.99,
    store_url: "https://www.ae.com/us/en/p/women/bottoms/jeans/stovepipe-straight-leg-jeans/ae-stretch-high-waisted-stovepipe-jean/4435_5738_200",
    image_url: "https://s7d2.scene7.com/is/image/aeo/4435_5738_200_f?$pdp-mz-opt$&fmt=webp",
    style_tags: ["Casual Jeans"],
  },

  // ── Hats ───────────────────────────────────────────────────────────────────
  {
    brand: "Nordstrom Rack", name: "Faux Suede Trim Knit Fedora", category: "Hat", gender: "female",
    color: "Chocolate", price: 29.97,
    store_url: "https://www.nordstromrack.com/s/san-diego-hat-faux-suede-trim-knit-fedora/8526110",
    image_url: "https://n.nordstrommedia.com/it/cdbcec7b-0381-4210-b577-0f1b675eeb19.jpeg?crop=pad&w=780&h=1196&dpr=2",
    style_tags: ["Casual Hat"],
  },
  {
    brand: "Nordstrom Rack", name: "El Campo Wide Brim Hat", category: "Hat", gender: "female",
    color: "Black", price: 29.97,
    store_url: "https://www.nordstromrack.com/s/san-diego-hat-el-campo-wide-brim-hat/8252808",
    image_url: "https://n.nordstrommedia.com/it/5fe30c9c-15eb-4470-bd6f-c81d632d9787.jpeg?crop=pad&w=780&h=1196&dpr=2",
    style_tags: ["Casual Hat"],
  },
  {
    brand: "Amazon", name: "Women Wide Brim Straw Panama Roll up Hat Fedora Beach Sun Hat", category: "Hat", gender: "female",
    color: "Brown/Black", price: 25.99,
    store_url: "https://www.amazon.com/Lanzom-Women-Straw-Panama-Fedora/dp/B06XYZ46Q3/",
    image_url: "https://m.media-amazon.com/images/I/71BxTHqX2ML._AC_SX679_.jpg",
    style_tags: ["Casual Hat"],
  },
  {
    brand: "Columbia", name: "Columbia Bora Bora™ Booney", category: "Hat", gender: "unisex",
    color: "Fossil", price: 24,
    store_url: "https://www.amazon.com/Columbia-Unisex-Bora-Booney-Fossil/dp/B0CLPZ53XB/",
    image_url: "https://m.media-amazon.com/images/I/31UKwtYzTSL._AC_.jpg",
    style_tags: ["Casual Hat"],
  },
  {
    brand: "GADIEMKENSD", name: "GADIEMKENSD Mens Folding Outdoor Hat Long Brim UPF 50+ Sun Protection", category: "Hat", gender: "male",
    color: "Army Green", price: 13.99,
    store_url: "https://www.amazon.com/dp/B0CGTYRGYG/",
    image_url: "https://images-na.ssl-images-amazon.com/images/I/71p5NE3lncL._AC_UL116_SR116,116_.jpg",
    style_tags: ["Casual Hat"],
  },
  {
    brand: "Amazon", name: "Cowboy Hat for Women and Men with Shapeable Wide Brim", category: "Hat", gender: "unisex",
    color: "Rose Pink", price: 32.99,
    store_url: "https://www.amazon.com/dp/B0C48XFXK2/",
    image_url: "https://m.media-amazon.com/images/I/81VecuiiZ+L._AC_SX679_.jpg",
    style_tags: ["Casual Hat"],
  },
  {
    brand: "adidas", name: "adidas Superlite Hat – Lightweight Moisture-Wicking Cap", category: "Hat", gender: "unisex",
    color: "Ray Blue", price: 18.48,
    store_url: "https://www.amazon.com/dp/B0F3RYRF45/",
    image_url: "https://images-na.ssl-images-amazon.com/images/I/81-BmEIQN6L._AC_UL165_SR165,165_.jpg",
    style_tags: ["Casual Hat"],
  },
  {
    brand: "Flexfit", name: "Flexfit Men's Athletic Baseball Fitted Cap", category: "Hat", gender: "male",
    color: "Navy", price: 12.81,
    store_url: "https://www.amazon.com/Flexfit-Athletic-Baseball-Fitted-Large/dp/B073DWQGTX/",
    image_url: "https://m.media-amazon.com/images/I/71zz6lXTHbL._AC_UY1000_DpWeblab_.jpg",
    style_tags: ["Casual Cap"],
  },
  {
    brand: "Macy's", name: "Men's Horizon Breeze Brimmer Hat", category: "Hat", gender: "male",
    color: "Black", price: 50,
    store_url: "https://www.macys.com/shop/product/the-north-face-mens-horizon-breeze-brimmer-hat?ID=18678277",
    image_url: "https://slimages.macysassets.com/is/image/MCY/products/7/optimized/31424837_fpx.tif?op_sharpen=1&wid=44&fit=fit,1&fmt=webp",
    style_tags: [],
  },

  // ── Shoes ──────────────────────────────────────────────────────────────────
  {
    brand: "Amazon", name: "Aomigoct Dressy Womens Sandals Summer Comfortable Strappy Flats Sandals", category: "Shoes", gender: "female",
    color: "Apricot", price: 32.99,
    store_url: "https://www.amazon.com/Aomigoct-Dressy-Womens-Sandals-Summer/dp/B0F59XYFPP/",
    image_url: "https://images-na.ssl-images-amazon.com/images/I/81+8g3PFJLL._AC_UL210_SR210,210_.jpg",
    style_tags: ["Casual Shoe"],
  },
  {
    brand: "Amazon", name: "Rilista Women's Slingback Kitten Heels Closed Pointed Toe Backless Wedding Party Dress Pumps Shoes", category: "Shoes", gender: "female",
    color: "Navy Blue", price: 37.99,
    store_url: "https://www.amazon.com/dp/B0DB5PC15K/",
    image_url: "https://m.media-amazon.com/images/I/61xGue4F2UL._AC_UY900_DpWeblab_.jpg",
    style_tags: ["Casual Shoe"],
  },
  {
    brand: "NEWBELLA", name: "NEWBELLA Women's Knit Ankle Strap Block Heel Sandals Open Toe Chunky Heels", category: "Shoes", gender: "female",
    color: "Burgundy", price: 37.99,
    store_url: "https://www.amazon.com/NEWBELLA-Womens-Ankle-Strap-Sandals/dp/B0FD9KBQY9/",
    image_url: "https://m.media-amazon.com/images/I/51nfs1gB6PL.jpg",
    style_tags: ["Casual Shoes"],
  },
  {
    brand: "Amazon Essentials", name: "Amazon Essentials Women's Stiletto Heel Dress Ankle Boots", category: "Shoes", gender: "female",
    color: "Black", price: 38.57,
    store_url: "https://www.amazon.com/Amazon-Essentials-Womens-Stiletto-Leather/dp/B0F7M3JXSY/",
    image_url: "https://m.media-amazon.com/images/I/71jkqMUkOAL._AC_SX679_.jpg",
    style_tags: ["Casual shoes"],
  },

  // ── Bags ───────────────────────────────────────────────────────────────────
  {
    brand: "COACH", name: "COACH Juliet Shoulder Bag 25", category: "Bag", gender: "female",
    color: "Amber Brown", price: 450,
    store_url: "https://www.amazon.com/COACH-Quilted-Leather-Juliet-Shoulder/dp/B0GD8DNSYG/",
    image_url: "https://m.media-amazon.com/images/I/714CVUIFQML._AC_SY500_.jpg",
    style_tags: ["Casual Bag"],
  },
  {
    brand: "Michael Kors", name: "Michael Kors Quinn Large Tote", category: "Bag", gender: "female",
    color: "Vanilla", price: 181.65,
    store_url: "https://www.amazon.com/Michael-Kors-Gold-Tone-Hardware-Vanilla/dp/B0F22TLQCB/",
    image_url: "https://m.media-amazon.com/images/I/31oAcWM-jDL.jpg",
    style_tags: ["Casual Tote bag"],
  },
  {
    brand: "Michael Kors", name: "Michael Kors Women's Laila Extra Small Crossbody Bag", category: "Bag", gender: "female",
    color: "Brown", price: 179.50,
    store_url: "https://www.amazon.com/dp/B0FCJZBBWH/",
    image_url: "https://images-na.ssl-images-amazon.com/images/I/71ZfHGco1PL._AC_UL232_SR232,232_.jpg",
    style_tags: ["Casual Crossbody bag"],
  },
  {
    brand: "Calvin Klein", name: "Calvin Klein Statement Series Lock Daytonna Leather Top Zip Tote", category: "Bag", gender: "female",
    color: "Black", price: 180,
    store_url: "https://www.amazon.com/Calvin-Klein-Statement-Daytonna-Leather/dp/B07YBR3CGK/",
    image_url: "https://m.media-amazon.com/images/I/81sPGFkcfGL._AC_UY1000_DpWeblab_.jpg",
    style_tags: ["Casual Tote Bag"],
  },
  {
    brand: "Prada", name: "Pre-Loved Esplanade Crossbody Bag", category: "Bag", gender: "female",
    color: "Blue", price: 990,
    store_url: "https://www.amazon.com/Prada-Pre-Loved-Esplanade-Crossbody-Saffiano/dp/B0FQPK3DZR/",
    image_url: "https://m.media-amazon.com/images/I/71xKl90GYeL._AC_SX679_.jpg",
    style_tags: ["Crossbody Bag"],
  },
  {
    brand: "Amazon", name: "Faux Leather Messenger Bag for Men", category: "Bag", gender: "male",
    color: "Brown", price: 33.99,
    store_url: "https://www.amazon.com/Messenger-Backpack-Convertible-Crossbody-Briefcase/dp/B0CS6N17RM/",
    image_url: "https://images-na.ssl-images-amazon.com/images/I/81EbXRaZqmL._AC_UL210_SR210,210_.jpg",
    style_tags: ["Casual Bag"],
  },
  {
    brand: "Samsonite", name: "Samsonite Classic Leather Slim Backpack", category: "Bag", gender: "male",
    color: "Cognac", price: 139.99,
    store_url: "https://www.amazon.com/Samsonite-Classic-Leather-Backpack-Brown/dp/B07XW14CLQ/",
    image_url: "https://m.media-amazon.com/images/I/91yWDlPnDYL._AC_SY500_.jpg",
    style_tags: ["Casual Bag"],
  },
  {
    brand: "Michael Kors", name: "Michael Kors Men's City Buckle Backpack", category: "Bag", gender: "male",
    color: "Silver", price: 240.97,
    store_url: "https://www.amazon.com/Michael-Kors-Backpack-Gunmetal-Hardware-Signature/dp/B0F22S3GGT/",
    image_url: "https://m.media-amazon.com/images/I/81RBbSNu23L._AC_SL1500_.jpg",
    style_tags: ["Casual Bag"],
  },
  {
    brand: "Taygeer", name: "Taygeer Travel Laptop Backpack for Men Women", category: "Bag", gender: "unisex",
    color: "Black", price: 27.99,
    store_url: "https://www.amazon.com/Taygeer-Backpack-Airplane-Approved-Lightweight/dp/B0CR9JFD7S/",
    image_url: "https://m.media-amazon.com/images/I/61mBPzS4IeL._AC_SX679_.jpg",
    style_tags: ["Casual Bag"],
  },
];

async function seed() {
  const { rowCount: deleted } = await pool.query(`DELETE FROM catalog_items`);
  console.log(`✓ Cleared ${deleted} existing catalog items`);

  let inserted = 0;
  for (const item of CATALOG) {
    await pool.query(
      `INSERT INTO catalog_items (brand, name, category, color, price, store_url, image_url, style_tags, sponsored, gender)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9)`,
      [
        item.brand,
        item.name,
        item.category,
        item.color || '',
        item.price,
        item.store_url || '',
        item.image_url,
        item.style_tags || [],
        item.gender,
      ],
    );
    inserted++;
  }
  console.log(`✓ Seeded ${inserted} catalog items`);
  console.log(`\nNext step: generate embeddings by running:`);
  console.log(`  curl -X POST http://localhost:3001/api/catalog/embed-all`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
