import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* =========================================================
   STYLEBUDDY PRODUCT CSV PROVIDER

   PURPOSE:

   Gemini decides:
       WHAT item is missing

   This provider decides:
       WHICH products from products.csv match that item

   IMPORTANT:
   - This provider NEVER decides what the user needs.
   - It only searches the supplied product catalog.
   - It does NOT invent prices, images, or URLs.
   ========================================================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, "products.csv");

let cachedProducts = null;

/* =========================================================
   CSV PARSER
   ========================================================= */

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (char === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());

  return values.map((value) => {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }

    return value;
  });
}

/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

function loadProducts() {
  if (cachedProducts) {
    return cachedProducts;
  }

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(
      `products.csv was not found at: ${CSV_PATH}`
    );
  }

  const csv = fs.readFileSync(CSV_PATH, "utf8");

  const lines = csv
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error(
      "products.csv does not contain enough data."
    );
  }

  const headers = parseCsvLine(lines[0]);

  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);

    const product = {};

    headers.forEach((header, index) => {
      product[header] = values[index] || "";
    });

    products.push(product);
  }

  cachedProducts = products;

  console.log(
    `🛍️ Product CSV Provider loaded ${products.length} products.`
  );

  return cachedProducts;
}

/* =========================================================
   TEXT HELPERS
   ========================================================= */

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function containsValue(productValue, requestedValue) {
  const productText = normalizeText(productValue);
  const requestedText = normalizeText(requestedValue);

  if (!productText || !requestedText) {
    return false;
  }

  return (
    productText.includes(requestedText) ||
    requestedText.includes(productText)
  );
}

/* =========================================================
   SEARCH TOKEN EXTRACTION
   ========================================================= */

function getSearchTokens(missingItem) {
  const query = missingItem?.searchQuery || "";

  return tokenize(query);
}

/* =========================================================
   PRODUCT SCORING

   Gemini has already determined the missing item.

   This function ONLY ranks catalog products according
   to how closely they match Gemini's decision.
   ========================================================= */

function scoreProduct(product, missingItem) {
  let score = 0;

  const productName = normalizeText(product?.name);
  const productCategory = normalizeText(product?.category);
  const productSubcategory = normalizeText(product?.subcategory);
  const productArticleType = normalizeText(product?.article_type);
  const productColor = normalizeText(product?.color);
  const productOccasion = normalizeText(product?.occasion);
  const productSeason = normalizeText(product?.season);
  const productFit = normalizeText(product?.fit);
  const productFabric = normalizeText(product?.fabric);
  const productFormality = normalizeText(product?.formality);
  const productTone = normalizeText(product?.tone);

  /* ---------------------------------------------
     ARTICLE TYPE
     --------------------------------------------- */

  if (
    missingItem?.articleType &&
    containsValue(
      productArticleType,
      missingItem.articleType
    )
  ) {
    score += 50;
  }

  /* ---------------------------------------------
     CATEGORY
     --------------------------------------------- */

  if (
    missingItem?.category &&
    (
      containsValue(
        productCategory,
        missingItem.category
      ) ||
      containsValue(
        productSubcategory,
        missingItem.category
      )
    )
  ) {
    score += 25;
  }

  /* ---------------------------------------------
     COLOR
     --------------------------------------------- */

  if (
    missingItem?.color &&
    containsValue(
      productColor,
      missingItem.color
    )
  ) {
    score += 30;
  }

  /* ---------------------------------------------
     SEARCH QUERY TOKENS
     --------------------------------------------- */

  const searchTokens = getSearchTokens(missingItem);

  for (const token of searchTokens) {
    if (productName.includes(token)) {
      score += 8;
    }

    if (productArticleType.includes(token)) {
      score += 7;
    }

    if (productColor.includes(token)) {
      score += 5;
    }

    if (productCategory.includes(token)) {
      score += 4;
    }

    if (productSubcategory.includes(token)) {
      score += 4;
    }

    if (productFit.includes(token)) {
      score += 4;
    }
  }

  /* ---------------------------------------------
     OCCASION
     --------------------------------------------- */

  if (
    missingItem?.occasion &&
    containsValue(
      productOccasion,
      missingItem.occasion
    )
  ) {
    score += 8;
  }

  /* ---------------------------------------------
     STYLE / FORMALITY / TONE
     --------------------------------------------- */

  if (
    missingItem?.style &&
    (
      containsValue(
        productFormality,
        missingItem.style
      ) ||
      containsValue(
        productTone,
        missingItem.style
      )
    )
  ) {
    score += 6;
  }

  /* ---------------------------------------------
     SEASON
     --------------------------------------------- */

  if (
    missingItem?.season &&
    containsValue(
      productSeason,
      missingItem.season
    )
  ) {
    score += 5;
  }

  /* ---------------------------------------------
     FIT
     --------------------------------------------- */

  if (
    missingItem?.fit &&
    containsValue(
      productFit,
      missingItem.fit
    )
  ) {
    score += 10;
  }

  /* ---------------------------------------------
     FABRIC
     --------------------------------------------- */

  if (
    missingItem?.fabric &&
    containsValue(
      productFabric,
      missingItem.fabric
    )
  ) {
    score += 7;
  }

  return score;
}

/* =========================================================
   NORMALIZE PRODUCT

   Your CSV does not currently provide:
   - price
   - image URL
   - product URL

   Therefore we intentionally return null for these fields.
   ========================================================= */

function normalizeProduct(product, score) {
  return {
    provider: "csv",

    store: "StyleBuddy Catalog",

    id: product?.id || null,

    name:
      product?.name ||
      product?.article_type ||
      "Catalog product",

    price: null,

    currency: "INR",

    image: null,

    url: null,

    available: true,

    score,

    metadata: {
      gender: product?.gender || null,
      category: product?.category || null,
      subcategory: product?.subcategory || null,
      articleType: product?.article_type || null,
      color: product?.color || null,
      season: product?.season || null,
      occasion: product?.occasion || null,
      pattern: product?.pattern || null,
      fabric: product?.fabric || null,
      fit: product?.fit || null,
      length: product?.length || null,
      formality: product?.formality || null,
      tone: product?.tone || null,
    },
  };
}

function normalizeProfileGender(gender) {
  const value = normalizeText(gender);

  if (
    value === "male" ||
    value === "man" ||
    value === "men"
  ) {
    return "men";
  }

  if (
    value === "female" ||
    value === "woman" ||
    value === "women"
  ) {
    return "women";
  }

  return null;
}

/* =========================================================
   MAIN SEARCH FUNCTION
   ========================================================= */

export async function searchProducts(missingItem = {}) {
  const products = loadProducts();
  const profileGender =
  normalizeProfileGender(
    missingItem?.profile?.gender
  );

  const searchQuery =
    missingItem?.searchQuery ||
    missingItem?.name ||
    "";

  if (!searchQuery) {
    return {
      success: false,
      enabled: true,
      products: [],
      query: "",
      message: "Product search query is empty.",
    };
  }

 const scoredProducts = products
  .filter((product) => {
    if (!profileGender) {
      return true;
    }

    const productGender =
      normalizeText(product?.gender);

    if (!productGender) {
      return true;
    }

    return productGender === profileGender;
  })
  .map((product) => ({
    product,
    score: scoreProduct(
      product,
      missingItem
    ),
  }))
  .filter(
    (entry) => entry.score > 0
  );

  scoredProducts.sort(
    (a, b) => b.score - a.score
  );

  const topProducts = scoredProducts
    .slice(0, 12)
    .map((entry) =>
      normalizeProduct(
        entry.product,
        entry.score
      )
    );

  return {
    success: topProducts.length > 0,

    enabled: true,

    query: searchQuery,

    products: topProducts,

    message:
      topProducts.length > 0
        ? `Found ${topProducts.length} matching catalog products.`
        : "No matching catalog products were found.",
  };
}

/* =========================================================
   COMPATIBILITY ALIAS

   This allows shopping.service.js to use either:

       searchProducts()

   or:

       searchCsvProducts()

   without breaking the provider.
   ========================================================= */

export const searchCsvProducts = searchProducts;

/* =========================================================
   CACHE RESET

   Useful during development if products.csv changes.
   ========================================================= */

export function clearProductCache() {
  cachedProducts = null;
}

/* Compatibility alias */
export const clearCsvProductCache = clearProductCache;