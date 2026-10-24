import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  scoreShoppingItem,
  buildShoppingQuery
} from "./wardrobe-matching.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_FILE = path.join(
  __dirname,
  "../../data/products.csv"
);

let productsCache = null;

/* =====================================================
   CSV PARSER
===================================================== */

function parseCSVLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (
      char === "," &&
      !insideQuotes
    ) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return values;
}

/* =====================================================
   NORMALIZATION
===================================================== */

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

/* =====================================================
   LOAD PRODUCTS
===================================================== */

function loadProducts() {
  if (productsCache) {
    return productsCache;
  }

  if (!fs.existsSync(PRODUCTS_FILE)) {
    throw new Error(
      `Products CSV not found: ${PRODUCTS_FILE}`
    );
  }

  const csv = fs.readFileSync(
    PRODUCTS_FILE,
    "utf8"
  );

  const lines = csv
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) {
    productsCache = [];
    return productsCache;
  }

  const headers = parseCSVLine(
    lines[0]
  ).map((header) =>
    header.trim()
  );

  productsCache = lines
    .slice(1)
    .map((line, index) => {
      const values = parseCSVLine(line);
      const raw = {};

      headers.forEach(
        (header, i) => {
          raw[header] =
            values[i] ?? "";
        }
      );

      return {
        id:
          raw.id ||
          String(index + 1),

        name:
          raw.name ||
          "Fashion Product",

        gender:
          raw.gender || "",

        category:
          raw.category || "",

        subcategory:
          raw.subcategory || "",

        article_type:
          raw.article_type || "",

        color:
          raw.color || "",

        season:
          raw.season || "",

        occasion:
          raw.occasion || "",

        pattern:
          raw.pattern || "",

        fabric:
          raw.fabric || "",

        fit:
          raw.fit || "",

        length:
          raw.length || "",

        formality:
          raw.formality || "",

        tone:
          raw.tone || "",

        image: null,
        brand: null,
        price: null,
        product_url: null
      };
    });

  return productsCache;
}

/* =====================================================
   NORMAL PRODUCT SEARCH
===================================================== */

export function getProducts({
  search = "",
  limit = 100
} = {}) {
  const products = loadProducts();

  const query = String(search)
    .trim()
    .toLowerCase();

  let results = products;

  if (query) {
    results = products.filter(
      (product) =>
        [
          product.name,
          product.gender,
          product.category,
          product.subcategory,
          product.article_type,
          product.color,
          product.season,
          product.occasion,
          product.pattern,
          product.fabric,
          product.fit,
          product.length,
          product.formality,
          product.tone
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
    );
  }

  return results.slice(
    0,
    limit
  );
}

/* =====================================================
   GET SINGLE PRODUCT
===================================================== */

export function getProductById(id) {
  const products = loadProducts();

  return (
    products.find(
      (product) =>
        String(product.id) ===
        String(id)
    ) || null
  );
}

/* =====================================================
   ROLE MAP
===================================================== */

const ROLE_MAP = {
  tops: [
    "tops",
    "topwear",
    "tshirts",
    "t shirt",
    "shirts",
    "shirt",
    "kurta",
    "kurtas"
  ],

  bottoms: [
    "bottoms",
    "bottomwear",
    "jeans",
    "trousers",
    "pants",
    "shorts",
    "track pants"
  ],

  footwear: [
    "footwear",
    "footwears",
    "shoes",
    "casual shoes",
    "formal shoes",
    "sneakers",
    "flats",
    "heels",
    "boots",
    "sandals",
    "loafers",
    "sports shoes"
  ],

  dresses: [
    "dress",
    "dresses"
  ],

  accessories: [
    "accessories",
    "accessory",
    "bags",
    "handbags",
    "backpacks",
    "belts",
    "watches"
  ]
};

/* =====================================================
   PRODUCT ROLE DETECTION
===================================================== */

function productMatchesRole(
  product,
  role
) {
  const values = [
    product.category,
    product.subcategory,
    product.article_type
  ]
    .filter(Boolean)
    .map(normalize);

  const allowed =
    ROLE_MAP[role] || [];

  return values.some(
    (value) =>
      allowed.some(
        (name) => {
          const normalizedName =
            normalize(name);

          return (
            value === normalizedName ||
            value.includes(
              normalizedName
            ) ||
            normalizedName.includes(
              value
            )
          );
        }
      )
  );
}

/* =====================================================
   PRODUCT ROLE SCORE
===================================================== */

function productRoleScore(
  product,
  role
) {
  const values = [
    product.category,
    product.subcategory,
    product.article_type
  ]
    .filter(Boolean)
    .map(normalize);

  const allowed =
    ROLE_MAP[role] || [];

  let score = 0;

  for (const value of values) {
    for (const name of allowed) {
      const normalizedName =
        normalize(name);

      if (
        value === normalizedName
      ) {
        score += 15;
      } else if (
        value.includes(
          normalizedName
        ) ||
        normalizedName.includes(
          value
        )
      ) {
        score += 8;
      }
    }
  }

  return Math.min(
    score,
    30
  );
}

/* =====================================================
   ITEM HELPERS
===================================================== */

function getItemColor(item) {
  return normalize(
    item?.color ||
    item?.details?.ai?.color?.value
  );
}

function getItemArticleType(item) {
  return normalize(
    item?.articleType ||
    item?.article_type ||
    item?.details?.ai?.articleType?.value
  );
}

function getItemCategory(item) {
  return normalize(
    item?.category ||
    item?.details?.ai?.category?.value
  );
}

function getItemPattern(item) {
  return normalize(
    item?.pattern ||
    item?.details?.ai?.pattern?.value
  );
}

function getItemFabric(item) {
  return normalize(
    item?.fabric ||
    item?.details?.ai?.fabric?.value
  );
}

function getItemOccasion(item) {
  return normalize(
    item?.occasion ||
    item?.details?.occasion
  );
}

function getItemGender(item) {
  return normalize(
    item?.gender ||
    item?.details?.gender
  );
}

/* =====================================================
   COLOR GROUPS
===================================================== */

const COLOR_GROUPS = {
  black: [
    "black",
    "charcoal"
  ],

  white: [
    "white",
    "ivory",
    "off white",
    "cream"
  ],

  grey: [
    "grey",
    "gray",
    "silver"
  ],

  navy: [
    "navy",
    "dark blue"
  ],

  blue: [
    "blue",
    "sky blue",
    "light blue",
    "royal blue",
    "denim"
  ],

  green: [
    "green",
    "olive",
    "mint",
    "teal"
  ],

  red: [
    "red",
    "maroon",
    "burgundy",
    "wine"
  ],

  pink: [
    "pink",
    "rose",
    "peach"
  ],

  purple: [
    "purple",
    "violet",
    "lavender"
  ],

  yellow: [
    "yellow",
    "mustard"
  ],

  orange: [
    "orange",
    "rust"
  ],

  brown: [
    "brown",
    "tan",
    "camel",
    "khaki",
    "beige"
  ]
};

/* =====================================================
   COLOR FAMILY
===================================================== */

function getColorFamily(
  color
) {
  const normalized =
    normalize(color);

  if (!normalized) {
    return null;
  }

  for (
    const [
      family,
      values
    ] of Object.entries(
      COLOR_GROUPS
    )
  ) {
    if (
      values.some(
        (value) =>
          normalized.includes(
            normalize(value)
          )
      )
    ) {
      return family;
    }
  }

  return null;
}

/* =====================================================
   COLOR COMPATIBILITY
===================================================== */

function colorMatchScore(
  productColor,
  outfitColors = []
) {
  const productFamily =
    getColorFamily(
      productColor
    );

  if (
    !productFamily ||
    !outfitColors.length
  ) {
    return 0;
  }

  let bestScore = 0;

  for (
    const outfitColor
    of outfitColors
  ) {
    const outfitFamily =
      getColorFamily(
        outfitColor
      );

    if (!outfitFamily) {
      continue;
    }

    let score = 0;

    /* Neutral colors */
    if (
      productFamily === "black" ||
      productFamily === "white" ||
      productFamily === "grey"
    ) {
      score = 9;
    }

    /* Same family */
    if (
      productFamily ===
      outfitFamily
    ) {
      score = Math.max(
        score,
        5
      );
    }

    /* White */
    if (
      outfitFamily === "white"
    ) {
      if (
        productFamily === "black" ||
        productFamily === "brown" ||
        productFamily === "grey" ||
        productFamily === "navy"
      ) {
        score = 10;
      }

      if (
        productFamily === "blue" ||
        productFamily === "green" ||
        productFamily === "red"
      ) {
        score = 7;
      }
    }

    /* Black */
    if (
      outfitFamily === "black"
    ) {
      if (
        productFamily === "white" ||
        productFamily === "grey" ||
        productFamily === "brown"
      ) {
        score = 10;
      }
    }

    /* Blue */
    if (
      outfitFamily === "blue" ||
      outfitFamily === "navy"
    ) {
      if (
        productFamily === "white" ||
        productFamily === "brown" ||
        productFamily === "grey"
      ) {
        score = 10;
      }

      if (
        productFamily === "black"
      ) {
        score = 8;
      }
    }

    /* Purple */
    if (
      outfitFamily === "purple"
    ) {
      if (
        productFamily === "black" ||
        productFamily === "white" ||
        productFamily === "grey"
      ) {
        score = 10;
      }

      if (
        productFamily === "brown"
      ) {
        score = 6;
      }

      if (
        productFamily === "blue"
      ) {
        score = 5;
      }
    }

    /* Red */
    if (
      outfitFamily === "red"
    ) {
      if (
        productFamily === "black"
      ) {
        score = 11;
      }

      if (
        productFamily === "white" ||
        productFamily === "grey"
      ) {
        score = 8;
      }

      if (
        productFamily === "brown"
      ) {
        score = 6;
      }
    }

    /* Pink */
    if (
      outfitFamily === "pink"
    ) {
      if (
        productFamily === "white" ||
        productFamily === "grey"
      ) {
        score = 10;
      }

      if (
        productFamily === "brown"
      ) {
        score = 8;
      }

      if (
        productFamily === "black"
      ) {
        score = 7;
      }
    }

    /* Green */
    if (
      outfitFamily === "green"
    ) {
      if (
        productFamily === "brown" ||
        productFamily === "white" ||
        productFamily === "black"
      ) {
        score = 10;
      }

      if (
        productFamily === "grey"
      ) {
        score = 7;
      }
    }

    /* Yellow */
    if (
      outfitFamily === "yellow"
    ) {
      if (
        productFamily === "brown" ||
        productFamily === "white"
      ) {
        score = 10;
      }

      if (
        productFamily === "blue"
      ) {
        score = 8;
      }

      if (
        productFamily === "black"
      ) {
        score = 7;
      }
    }

    /* Orange */
    if (
      outfitFamily === "orange"
    ) {
      if (
        productFamily === "brown" ||
        productFamily === "white" ||
        productFamily === "black"
      ) {
        score = 10;
      }
    }

    /* Brown */
    if (
      outfitFamily === "brown"
    ) {
      if (
        productFamily === "white" ||
        productFamily === "black" ||
        productFamily === "grey"
      ) {
        score = 9;
      }

      if (
        productFamily === "brown"
      ) {
        score = 7;
      }
    }

    bestScore =
      Math.max(
        bestScore,
        score
      );
  }

  return bestScore;
}

/* =====================================================
   FIND TOP ITEMS
===================================================== */

function getTopItems(
  outfitItems
) {
  return outfitItems.filter(
    (item) => {
      const article =
        getItemArticleType(item);

      const category =
        getItemCategory(item);

      return (
        article.includes("tshirt") ||
        article.includes("t shirt") ||
        article.includes("shirt") ||
        article.includes("top") ||
        article.includes("kurta") ||
        category.includes("top") ||
        category.includes("topwear")
      );
    }
  );
}

/* =====================================================
   FIND BOTTOM ITEMS
===================================================== */

function getBottomItems(
  outfitItems
) {
  return outfitItems.filter(
    (item) => {
      const article =
        getItemArticleType(item);

      const category =
        getItemCategory(item);

      return (
        article.includes("short") ||
        article.includes("jean") ||
        article.includes("trouser") ||
        article.includes("pant") ||
        category.includes("bottom") ||
        category.includes("bottomwear")
      );
    }
  );
}

/* =====================================================
   FOOTWEAR STYLE MATCHING
   ONLY ONE DEFINITION
===================================================== */

function footwearStyleScore(
  product,
  outfitItems
) {
  const safeItems =
    Array.isArray(outfitItems)
      ? outfitItems
      : [];

  const article =
    normalize(
      product.article_type
    );

  const topItems =
    getTopItems(
      safeItems
    );

  const bottomItems =
    getBottomItems(
      safeItems
    );

  const topColor =
    topItems.length
      ? getItemColor(
          topItems[0]
        )
      : "";

  const bottomColor =
    bottomItems.length
      ? getItemColor(
          bottomItems[0]
        )
      : "";

  const topFamily =
    getColorFamily(
      topColor
    );

  const bottomFamily =
    getColorFamily(
      bottomColor
    );

  let score = 0;

  /* =================================================
     FOOTWEAR TYPE
  ================================================= */

  const isSneaker =
    article.includes(
      "sneaker"
    );

  const isCasual =
    article.includes(
      "casual shoes"
    );

  const isSports =
    article.includes(
      "sports"
    );

  const isFormal =
    article.includes(
      "formal shoes"
    );

  const isLoafer =
    article.includes(
      "loafer"
    );

  const isBoot =
    article.includes(
      "boot"
    );

  const isSandal =
    article.includes(
      "sandal"
    );

  /* =================================================
     OUTFIT TYPE
  ================================================= */

  const articleTypes =
    safeItems
      .map(
        getItemArticleType
      )
      .filter(Boolean);

  const occasions =
    safeItems
      .map(
        getItemOccasion
      )
      .filter(Boolean);

  const hasShorts =
    articleTypes.some(
      (value) =>
        value.includes(
          "short"
        )
    );

  const hasJeans =
    articleTypes.some(
      (value) =>
        value.includes(
          "jean"
        )
    );

  const hasTrousers =
    articleTypes.some(
      (value) =>
        value.includes(
          "trouser"
        ) ||
        value.includes(
          "pant"
        )
    );

  const isFormalOccasion =
    occasions.some(
      (value) =>
        value.includes(
          "formal"
        ) ||
        value.includes(
          "office"
        ) ||
        value.includes(
          "business"
        )
    );

  const isCasualOccasion =
    occasions.some(
      (value) =>
        value.includes(
          "casual"
        )
    );

  /* =================================================
     CASUAL OUTFIT
  ================================================= */

  if (
    isCasualOccasion ||
    hasShorts ||
    hasJeans
  ) {
    if (isSneaker) {
      score += 10;
    }

    if (isCasual) {
      score += 8;
    }

    if (isSports) {
      score += 5;
    }

    if (isLoafer) {
      score += 2;
    }

    if (isFormal) {
      score -= 5;
    }
  }

  /* =================================================
     SHORTS
  ================================================= */

  if (hasShorts) {
    if (isSneaker) {
      score += 8;
    }

    if (isCasual) {
      score += 7;
    }

    if (isSandal) {
      score += 5;
    }

    if (isFormal) {
      score -= 7;
    }
  }

  /* =================================================
     JEANS
  ================================================= */

  if (hasJeans) {
    if (isSneaker) {
      score += 8;
    }

    if (isCasual) {
      score += 6;
    }

    if (isLoafer) {
      score += 4;
    }

    if (isFormal) {
      score -= 3;
    }
  }

  /* =================================================
     TROUSERS
  ================================================= */

  if (hasTrousers) {
    if (isLoafer) {
      score += 8;
    }

    if (isFormal) {
      score += 9;
    }

    if (isCasual) {
      score += 5;
    }

    if (isSneaker) {
      score += 3;
    }
  }

  /* =================================================
     FORMAL OCCASION
  ================================================= */

  if (isFormalOccasion) {
    if (isFormal) {
      score += 12;
    }

    if (isLoafer) {
      score += 8;
    }

    if (isSneaker) {
      score -= 6;
    }

    if (isSports) {
      score -= 8;
    }
  }

  /* =================================================
     TOP COLOR SPECIFIC FOOTWEAR RULES

     TOP COLOR IS STRONGER THAN BOTTOM COLOR.
  ================================================= */

  if (topFamily === "purple") {
    if (
      getColorFamily(product.color) ===
      "black"
    ) {
      score += 9;
    }

    if (
      getColorFamily(product.color) ===
      "white"
    ) {
      score += 8;
    }

    if (
      getColorFamily(product.color) ===
      "grey"
    ) {
      score += 7;
    }

    if (
      getColorFamily(product.color) ===
      "brown"
    ) {
      score += 4;
    }
  }

  if (
    topFamily === "blue" ||
    topFamily === "navy"
  ) {
    if (
      getColorFamily(product.color) ===
      "white"
    ) {
      score += 10;
    }

    if (
      getColorFamily(product.color) ===
      "brown"
    ) {
      score += 8;
    }

    if (
      getColorFamily(product.color) ===
      "grey"
    ) {
      score += 7;
    }

    if (
      getColorFamily(product.color) ===
      "black"
    ) {
      score += 6;
    }
  }

  if (topFamily === "red") {
    if (
      getColorFamily(product.color) ===
      "black"
    ) {
      score += 11;
    }

    if (
      getColorFamily(product.color) ===
      "white"
    ) {
      score += 7;
    }

    if (
      getColorFamily(product.color) ===
      "grey"
    ) {
      score += 6;
    }

    if (
      getColorFamily(product.color) ===
      "brown"
    ) {
      score += 4;
    }
  }

  if (topFamily === "pink") {
    if (
      getColorFamily(product.color) ===
      "white"
    ) {
      score += 10;
    }

    if (
      getColorFamily(product.color) ===
      "grey"
    ) {
      score += 9;
    }

    if (
      getColorFamily(product.color) ===
      "brown"
    ) {
      score += 7;
    }

    if (
      getColorFamily(product.color) ===
      "black"
    ) {
      score += 5;
    }
  }

  if (topFamily === "green") {
    if (
      getColorFamily(product.color) ===
      "brown"
    ) {
      score += 10;
    }

    if (
      getColorFamily(product.color) ===
      "white"
    ) {
      score += 9;
    }

    if (
      getColorFamily(product.color) ===
      "black"
    ) {
      score += 8;
    }

    if (
      getColorFamily(product.color) ===
      "grey"
    ) {
      score += 6;
    }
  }

  if (topFamily === "yellow") {
    if (
      getColorFamily(product.color) ===
      "brown"
    ) {
      score += 10;
    }

    if (
      getColorFamily(product.color) ===
      "white"
    ) {
      score += 9;
    }

    if (
      getColorFamily(product.color) ===
      "blue"
    ) {
      score += 8;
    }

    if (
      getColorFamily(product.color) ===
      "black"
    ) {
      score += 6;
    }
  }

  if (topFamily === "orange") {
    if (
      getColorFamily(product.color) ===
      "brown"
    ) {
      score += 10;
    }

    if (
      getColorFamily(product.color) ===
      "white"
    ) {
      score += 9;
    }

    if (
      getColorFamily(product.color) ===
      "black"
    ) {
      score += 7;
    }
  }

  if (topFamily === "black") {
    if (
      getColorFamily(product.color) ===
      "white"
    ) {
      score += 10;
    }

    if (
      getColorFamily(product.color) ===
      "grey"
    ) {
      score += 9;
    }

    if (
      getColorFamily(product.color) ===
      "brown"
    ) {
      score += 8;
    }
  }

  if (topFamily === "white") {
    if (
      getColorFamily(product.color) ===
      "black"
    ) {
      score += 10;
    }

    if (
      getColorFamily(product.color) ===
      "brown"
    ) {
      score += 9;
    }

    if (
      getColorFamily(product.color) ===
      "grey"
    ) {
      score += 8;
    }

    if (
      getColorFamily(product.color) ===
      "white"
    ) {
      score += 6;
    }
  }

  /* =================================================
     BOTTOM COLOR AS SECONDARY SIGNAL
  ================================================= */

  if (bottomFamily) {
    const bottomScore =
      colorMatchScore(
        product.color,
        [bottomColor]
      );

    score +=
      Math.round(
        bottomScore * 0.35
      );
  }

  return score;
}

/* =====================================================
   ARTICLE TYPE MATCHING
===================================================== */

function articleCompatibilityScore(
  product,
  outfitItems,
  role
) {
  const article =
    normalize(
      product.article_type
    );

  if (!article) {
    return 0;
  }

  let score = 0;

  if (
    role === "tops" &&
    (
      article.includes("shirt") ||
      article.includes("tshirt") ||
      article.includes("top") ||
      article.includes("kurta")
    )
  ) {
    score += 6;
  }

  if (
    role === "bottoms" &&
    (
      article.includes("jean") ||
      article.includes("trouser") ||
      article.includes("pant") ||
      article.includes("short")
    )
  ) {
    score += 6;
  }

  if (
    role === "footwear"
  ) {
    if (
      article.includes("shoe") ||
      article.includes("sneaker") ||
      article.includes("loafer") ||
      article.includes("boot") ||
      article.includes("sandal") ||
      article.includes("flat") ||
      article.includes("heel")
    ) {
      score += 8;
    }
  }

  return score;
}

/* =====================================================
   PATTERN MATCHING
===================================================== */

function patternScore(
  product,
  outfitItems
) {
  const productPattern =
    normalize(
      product.pattern
    );

  if (!productPattern) {
    return 0;
  }

  const outfitPatterns =
    outfitItems
      .map(getItemPattern)
      .filter(Boolean);

  if (
    !outfitPatterns.length
  ) {
    return 0;
  }

  if (
    outfitPatterns.some(
      (pattern) =>
        pattern !== "plain"
    ) &&
    productPattern ===
      "plain"
  ) {
    return 5;
  }

  if (
    outfitPatterns.includes(
      productPattern
    )
  ) {
    return 3;
  }

  return 1;
}

/* =====================================================
   FABRIC MATCHING
===================================================== */

function fabricScore(
  product,
  outfitItems
) {
  const productFabric =
    normalize(
      product.fabric
    );

  if (!productFabric) {
    return 0;
  }

  const fabrics =
    outfitItems
      .map(getItemFabric)
      .filter(Boolean);

  if (!fabrics.length) {
    return 0;
  }

  if (
    fabrics.some(
      (fabric) =>
        fabric ===
        productFabric
    )
  ) {
    return 3;
  }

  return 0;
}

/* =====================================================
   OCCASION MATCHING
===================================================== */

function occasionScore(
  product,
  outfitItems
) {
  const productOccasion =
    normalize(
      product.occasion
    );

  if (!productOccasion) {
    return 0;
  }

  const outfitOccasions =
    outfitItems
      .map(getItemOccasion)
      .filter(Boolean);

  if (
    !outfitOccasions.length
  ) {
    return 0;
  }

  if (
    outfitOccasions.some(
      (occasion) =>
        productOccasion.includes(
          occasion
        ) ||
        occasion.includes(
          productOccasion
        )
    )
  ) {
    return 6;
  }

  return 0;
}

/* =====================================================
   GENDER MATCHING
===================================================== */

function genderScore(
  product,
  outfitItems
) {
  const productGender =
    normalize(
      product.gender
    );

  if (!productGender) {
    return 0;
  }

  const genders =
    outfitItems
      .map(getItemGender)
      .filter(Boolean);

  if (!genders.length) {
    return 0;
  }

  if (
    genders.some(
      (gender) =>
        productGender ===
          gender ||
        productGender.includes(
          gender
        ) ||
        gender.includes(
          productGender
        )
    )
  ) {
    return 5;
  }

  return 0;
}

/* =====================================================
   MAIN SHOPPING SCORE
===================================================== */

function shoppingCompatibilityScore(
  product,
  outfitItems,
  role
) {
  if (!product) {
    return 0;
  }

  const safeItems =
    Array.isArray(
      outfitItems
    )
      ? outfitItems
      : [];

  /* Required role */
  const roleScore =
    productRoleScore(
      product,
      role
    );

  /* Colors from this outfit */
  const outfitColors =
    safeItems
      .map(getItemColor)
      .filter(Boolean);

  const colorScore =
    colorMatchScore(
      product.color,
      outfitColors
    );

  /* Other matching signals */
  const articleScore =
    articleCompatibilityScore(
      product,
      safeItems,
      role
    );

  const pattern =
    patternScore(
      product,
      safeItems
    );

  const fabric =
    fabricScore(
      product,
      safeItems
    );

  const occasion =
    occasionScore(
      product,
      safeItems
    );

  const gender =
    genderScore(
      product,
      safeItems
    );

  /* Existing wardrobe engine */
  const wardrobeScore =
    scoreShoppingItem(
      product,
      safeItems
    );

  /*
   * Main score.
   *
   * Color is important.
   * Article type is important.
   * Existing wardrobe engine remains active.
   */
  let finalScore =
    roleScore +
    colorScore * 2 +
    articleScore +
    pattern +
    fabric +
    occasion +
    gender +
    Math.round(
      wardrobeScore * 0.25
    );

  /*
   * Footwear receives additional
   * outfit-specific intelligence.
   */
  if (
    role === "footwear"
  ) {
    finalScore +=
      footwearStyleScore(
        product,
        safeItems
      );
  }

  return finalScore;
}

/* =====================================================
   MATCH REASON
===================================================== */

function buildMatchReason(
  product,
  outfitItems,
  role
) {
  const colors =
    outfitItems
      .map(getItemColor)
      .filter(Boolean);

  const colorText =
    colors.length
      ? colors
          .slice(0, 2)
          .join(" + ")
      : "your wardrobe";

  if (
    role === "footwear"
  ) {
    return `Selected to complement your ${colorText} outfit.`;
  }

  if (
    role === "tops"
  ) {
    return `Selected to complement your ${colorText} outfit.`;
  }

  if (
    role === "bottoms"
  ) {
    return `Selected to complement your ${colorText} outfit.`;
  }

  if (
    role === "dresses"
  ) {
    return `Selected to fit your wardrobe and style.`;
  }

  return `Selected to complement your wardrobe.`;
}

/* =====================================================
   WARDROBE MATCHED PRODUCTS
===================================================== */

export function getWardrobeMatchedProducts({
  outfitItems = [],
  missingRole,
  limit = 12
} = {}) {
  const products =
    loadProducts();

  const safeItems =
    Array.isArray(
      outfitItems
    )
      ? outfitItems
      : [];

  if (!missingRole) {
    return [];
  }

  /*
   * First find products that actually
   * belong to the requested category.
   */
  const roleProducts =
    products.filter(
      (product) =>
        productMatchesRole(
          product,
          missingRole
        )
    );

  /*
   * Score every product against
   * THIS specific outfit.
   */
  const scored =
    roleProducts.map(
      (product) => {
        const rawScore =
          shoppingCompatibilityScore(
            product,
            safeItems,
            missingRole
          );

        return {
          ...product,

          match: Math.min(
            Math.max(
              Math.round(
                (
                  rawScore /
                  140
                ) *
                  100
              ),
              1
            ),
            99
          ),

          matchReason:
            buildMatchReason(
              product,
              safeItems,
              missingRole
            ),

          matchedWith:
            safeItems.map(
              (item) => ({
                id:
                  item.id,

                articleType:
                  item.articleType ||
                  item.article_type ||
                  null,

                category:
                  item.category ||
                  item.details?.ai
                    ?.category
                    ?.value ||
                  null,

                color:
                  item.color ||
                  item.details?.ai
                    ?.color
                    ?.value ||
                  null,

                pattern:
                  item.pattern ||
                  item.details?.ai
                    ?.pattern
                    ?.value ||
                  null,

                fabric:
                  item.fabric ||
                  item.details?.ai
                    ?.fabric
                    ?.value ||
                  null
              })
            ),

          shoppingQuery:
            buildShoppingQuery(
              safeItems,
              missingRole
            )
        };
      }
    );

  /*
   * Best match first.
   */
  scored.sort(
    (a, b) => {
      if (
        b.match !==
        a.match
      ) {
        return (
          b.match -
          a.match
        );
      }

      /*
       * If scores are equal,
       * use color family.
       */
      const aColor =
        getColorFamily(
          a.color
        ) || "";

      const bColor =
        getColorFamily(
          b.color
        ) || "";

      const colorComparison =
        aColor.localeCompare(
          bColor
        );

      if (
        colorComparison !== 0
      ) {
        return colorComparison;
      }

      /*
       * Final deterministic
       * tie breaker.
       */
      return String(
        a.name
      ).localeCompare(
        String(b.name)
      );
    }
  );

  /*
   * Remove duplicate product IDs.
   */
  const unique = [];
  const seen = new Set();

  for (
    const product
    of scored
  ) {
    const id =
      String(product.id);

    if (
      seen.has(id)
    ) {
      continue;
    }

    seen.add(id);

    unique.push(
      product
    );

    if (
      unique.length >=
      limit
    ) {
      break;
    }
  }

  return unique;
}