import { apiRequest } from "./client";

export const productApi = {
  /*
   * Load the normal product catalogue.
   */
  getProducts: (query = "") =>
    apiRequest(
      `/products${query ? `?${query}` : ""}`
    ),

  /*
   * Load one product by ID.
   */
  getProduct: (id) =>
    apiRequest(
      `/products/${id}`
    ),

  /*
   * Find products from products.csv
   * that match a specific outfit from
   * the user's wardrobe.
   *
   * Example:
   *
   * Purple T-shirt
   * +
   * White Shorts
   * +
   * missingRole = footwear
   *
   * → returns matching footwear.
   */
  getWardrobeMatchedProducts: (
    outfitItems = [],
    missingRole,
    limit = 12
  ) =>
    apiRequest(
      "/products/wardrobe-match",
      {
        method: "POST",

        body: JSON.stringify({
          outfitItems,
          missingRole,
          limit
        })
      }
    )
};