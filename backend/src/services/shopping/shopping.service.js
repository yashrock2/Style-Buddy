import { searchProducts } from "./product.provider.js";
import { searchAmazonProducts } from "./amazon.provider.js";
import { searchFlipkartProducts } from "./flipkart.provider.js";
import { searchMyntraProducts } from "./myntra.provider.js";
/* =========================================================
   STYLEBUDDY SHOPPING SERVICE

   IMPORTANT ARCHITECTURE:

   Gemini decides:
       WHAT is missing

   Product CSV provider decides:
       WHICH catalog products match that missing item

   This service NEVER decides what the user needs.

   It only searches for an item already identified by
   the AI stylist.
   ========================================================= */


/* =========================================================
   NORMALIZE MISSING ITEM
   ========================================================= */

function normalizeMissingItem(item = {}) {
  const name =
    item.name ||
    item.title ||
    item.articleType ||
    item.category ||
    "";

  const category =
    item.category ||
    "";

  const articleType =
    item.articleType ||
    "";

  const color =
    item.color ||
    "";

  const style =
    item.style ||
    "";

  const occasion =
    item.occasion ||
    "";
    const profile =
  item.profile || null;

  const budget =
    Number.isFinite(Number(item.budget))
      ? Number(item.budget)
      : null;

  const searchQuery =
    item.searchQuery ||
    item.query ||
    [
      color,
      articleType,
      name,
      style,
      occasion,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

      return {
  name,
  category,
  articleType,
  color,
  style,
  occasion,
  budget,
  profile,
  searchQuery,
};
}


/* =========================================================
   SEARCH ONE MISSING ITEM
   ========================================================= */

export async function searchMissingItem({
  missingItem,
}) {
  const item =
    normalizeMissingItem(
      missingItem
    );

  /* -------------------------------------------------------
     No search query = no product search
     ------------------------------------------------------- */

  if (!item.searchQuery) {
    return {
      success: false,

      query: "",

      missingItem: item,

      products: [],

      providers: {
        csv: {
          success: false,
          enabled: true,
          products: [],
          message:
            "No valid product search query was provided.",
        },
      },

      message:
        "No valid shopping search query was provided.",
    };
  }


  /* -------------------------------------------------------
     Search the StyleBuddy product catalog.

     IMPORTANT:

     The CSV provider does NOT decide what is missing.

     Gemini has already determined the missing item.

     The CSV provider only finds matching catalog products.
     ------------------------------------------------------- */

  let csvResult;

  try {
    csvResult =
      await searchProducts(item);
  } catch (error) {
    console.error(
      "CSV product search failed:",
      error?.message || error
    );

    csvResult = {
      success: false,
      enabled: true,
      products: [],
      query: item.searchQuery,
      error:
        error?.message ||
        "Product catalog search failed.",
      message:
        "Unable to search the StyleBuddy product catalog.",
    };
  }


  /* -------------------------------------------------------
     Products returned by product.provider.js are already
     ranked using their matching score.

     We preserve that ranking here.
     ------------------------------------------------------- */

  const products =
    Array.isArray(csvResult?.products)
      ? [...csvResult.products]
      : [];

        /* -------------------------------------------------------
     SEARCH LIVE SHOPPING PROVIDERS

     Gemini has already determined what is missing.

     These providers only search for products matching
     that AI-determined missing item.
     ------------------------------------------------------- */

  const [
    amazonResult,
    flipkartResult,
    myntraResult,
  ] = await Promise.all([
    searchAmazonProducts(item).catch((error) => ({
      success: false,
      enabled: false,
      products: [],
      message:
        error?.message ||
        "Amazon product search failed.",
    })),

    searchFlipkartProducts(item).catch((error) => ({
      success: false,
      enabled: false,
      products: [],
      message:
        error?.message ||
        "Flipkart product search failed.",
    })),

    searchMyntraProducts(item).catch((error) => ({
      success: false,
      enabled: false,
      products: [],
      message:
        error?.message ||
        "Myntra product search failed.",
    })),
  ]);

  const liveProducts = [
    ...(amazonResult?.products || []),
    ...(flipkartResult?.products || []),
    ...(myntraResult?.products || []),
  ];


  products.sort((a, b) => {
    const scoreA =
      Number.isFinite(Number(a?.score))
        ? Number(a.score)
        : 0;

    const scoreB =
      Number.isFinite(Number(b?.score))
        ? Number(b.score)
        : 0;

    return scoreB - scoreA;
  });


  /* -------------------------------------------------------
     Return normalized shopping result
     ------------------------------------------------------- */

   return {
    success:
      products.length > 0 ||
      liveProducts.length > 0,

    query:
      item.searchQuery,

    missingItem:
      item,

    // StyleBuddy catalog matches from products.csv
    products,

    // Real shopping-provider products
    shoppingProducts:
      liveProducts,

    providers: {
      csv: csvResult,
      amazon: amazonResult,
      flipkart: flipkartResult,
      myntra: myntraResult,
    },

    message:
      liveProducts.length > 0
        ? `Found ${liveProducts.length} shopping products.`
        : products.length > 0
          ? `Found ${products.length} matching catalog products.`
          : "No matching products were found.",
  };
}


/* =========================================================
   SEARCH MULTIPLE MISSING ITEMS
   ========================================================= */

export async function searchMissingItems({
  missingItems = [],
}) {
  if (!Array.isArray(missingItems)) {
    return [];
  }

  const validItems =
    missingItems.filter(Boolean);

  const results =
    await Promise.all(
      validItems.map(
        (missingItem) =>
          searchMissingItem({
            missingItem,
          })
      )
    );

  return results;
}