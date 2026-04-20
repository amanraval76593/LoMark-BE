export const ProductCategory = ["vegetables", "fruits", "dairy"] as const;

export type ProductCategory = (typeof ProductCategory)[number];
