export const ProductCategory = {
  Vegetables: "vegetables",
  Fruits: "fruits",
  Dairy: "dairy",
} as const;

export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory];
// → "vegetables" | "fruits" | "dairy"

export const QuantityType = {
  // Weight
  Kilogram: "kg",
  Gram: "g",
  Pound: "lb",

  // Volume
  Liter: "l",
  Milliliter: "ml",

  // Count
  Piece: "piece",
  Dozen: "dozen",
  Pack: "pack",
} as const;

export type QuantityType = (typeof QuantityType)[keyof typeof QuantityType];
// → "kg" | "g" | "lb" | "l" | "ml" | "piece" | "dozen" | "pack"