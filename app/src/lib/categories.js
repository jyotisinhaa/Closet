// Garment categories and tag colors, shared by the wardrobe and try-on feature
export const CATEGORIES_FEMALE = [
  "Top",
  "Skirt",
  "Jeans",
  "Shorts",
  "Bottom",
  "Dress",
  "Outerwear",
  "Shoes",
  "Bag",
  "Hat",
  "Accessory",
];
export const CATEGORIES_MALE = [
  "T-Shirt",
  "Shirt",
  "Jeans",
  "Bottom",
  "Outerwear",
  "Shoes",
  "Bag",
  "Accessory",
];
export const CATEGORIES_ALL = [
  "Top",
  "Shirt",
  "Jeans",
  "Shorts",
  "Bottom",
  "Dress",
  "Skirt",
  "Outerwear",
  "Shoes",
  "Bag",
  "Hat",
  "Accessory",
];

export const CATEGORIES_FEMALE = ['Top', 'Jeans', 'Bottom', 'Dress', 'Skirt', 'Outerwear', 'Shoes', 'Bag', 'Hat', 'Scarf', 'Accessory']
export const CATEGORIES_MALE   = ['Top', 'Shirt', 'Jeans', 'Bottom', 'Outerwear', 'Shoes', 'Bag', 'Hat', 'Scarf', 'Accessory']
export const CATEGORIES_ALL    = ['Top', 'Shirt', 'Jeans', 'Bottom', 'Dress', 'Skirt', 'Outerwear', 'Shoes', 'Bag', 'Hat', 'Scarf', 'Accessory']


export function getCategoriesForGender(gender) {
  if (gender === "Female") return CATEGORIES_FEMALE;
  if (gender === "Male") return CATEGORIES_MALE;
  return CATEGORIES_ALL;
}

// Per-accessory try-on style presets (Perfect Corp). `value` is sent to the API;
// `label` is shown in the UI. Categories not listed here have no style options —
// leaving the style unset lets the API pick one at random.
export const ACCESSORY_STYLES = {
  Hat: [
    { value: 'style_sporty_casual',   label: 'Sporty Casual' },
    { value: 'style_urban_fashion',   label: 'Urban Fashion' },
    { value: 'style_vacation_casual', label: 'Vacation Casual' },
    { value: 'style_warm_cozy',       label: 'Warm Cozy' },
    { value: 'style_bohemian',        label: 'Bohemian' },
  ],
  Scarf: [
    { value: 'style_french_elegance', label: 'French Elegance' },
    { value: 'style_light_luxury',    label: 'Light Luxury' },
    { value: 'style_cottagecore',     label: 'Cottagecore' },
    { value: 'style_modern_chic',     label: 'Modern Chic' },
    { value: 'style_bohemian',        label: 'Bohemian' },
  ],
  Bag: [
    { value: 'style_parisian_chic',      label: 'Parisian Chic' },
    { value: 'style_urban_chic',         label: 'Urban Chic' },
    { value: 'style_mediterranean_chic', label: 'Mediterranean Chic' },
    { value: 'style_art_deco_style',     label: 'Art Deco' },
  ],
  Shoes: [
    { value: 'style_minimalist',      label: 'Minimalist' },
    { value: 'style_bohemian',        label: 'Bohemian' },
    { value: 'style_cottagecore',     label: 'Cottagecore' },
    { value: 'style_french_elegance', label: 'French Elegance' },
    { value: 'style_retro_fashion',   label: 'Retro Fashion' },
  ],
}

export function getStylesForCategory(category) {
  return ACCESSORY_STYLES[category] || []
}

export const TAG_COLORS = {
  Top: { bg: "#EBE3D4", fg: "#3A322A" },
  Shirt: { bg: "#D4CBB8", fg: "#3A322A" },
  Jeans: { bg: "#4A6B8A", fg: "#FBF8F1" },
  Bottom: { bg: "#1A1612", fg: "#FBF8F1" },
  Dress: { bg: "#C2563A", fg: "#FBF8F1" },
  Skirt: { bg: "#9A3E26", fg: "#FBF8F1" },
  Shorts: { bg: "#D4875A", fg: "#FBF8F1" },
  Hat: { bg: "#7A6E5F", fg: "#FBF8F1" },
  Outerwear: { bg: "#5B6A3F", fg: "#FBF8F1" },
  Shoes: { bg: "#C9A961", fg: "#1A1612" },
  Bag: { bg: "#8C8273", fg: "#FBF8F1" },
  Accessory: { bg: "#3A322A", fg: "#FBF8F1" },
};
