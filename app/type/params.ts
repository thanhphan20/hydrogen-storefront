import { ProductFilter } from "@shopify/hydrogen/storefront-api-types";

export type SortParam =
  | 'price-low-high'
  | 'price-high-low'
  | 'best-selling'
  | 'newest'
  | 'featured';

export type AppliedFilter = {
  label: string;
  filter: ProductFilter;
};
