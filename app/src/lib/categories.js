// Garment categories and tag colors, shared by the wardrobe and try-on features.
export const CATEGORIES_FEMALE = [
  "Top",
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
export const CATEGORIES_MALE = [
  "Top",
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

export function getCategoriesForGender(gender) {
  if (gender === "Female") return CATEGORIES_FEMALE;
  if (gender === "Male") return CATEGORIES_MALE;
  return CATEGORIES_ALL;
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
