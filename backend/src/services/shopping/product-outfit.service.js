import axios from "axios";
import { searchProducts } from "./product.provider.js";

/*
 * STYLEBUDDY PRODUCT OUTFIT ENGINE
 *
 * Column 2 only:
 * Selected wardrobe item
 *        ↓
 * products.csv candidates
 *        ↓
 * complete outfit combinations
 *        ↓
 * V13 scoring
 *        ↓
 * ranked product outfits
 *
 * IMPORTANT:
 * This service does NOT perform missing-item detection.
 * It is completely independent from searchMissingItem().
 */

const V13_SCORE_URL =
  process.env.AI_V13_SCORE_URL ||
  "http://127.0.0.1:8000/v13/score-outfit";

const MAX_PRODUCTS_PER_ROLE = 12;
const MAX_DIVERSE_PRODUCTS_PER_ROLE = 8;
const MAX_OUTFIT_COMBINATIONS = 150;
const MAX_V13_RESULTS = 3;
const MIN_CORE_DIFFERENCE = 1;


/* =========================================================
   NORMALIZATION
   ========================================================= */

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ");
}


/* =========================================================
   PRODUCT ATTRIBUTE HELPERS
   ========================================================= */

function getProductMetadata(product = {}) {
  return product?.metadata || {};
}

function getArticleType(product = {}) {
  const metadata = getProductMetadata(product);

  return normalize(
    product.articleType ||
    product.article_type ||
    metadata.articleType ||
    metadata.article_type
  );
}

function getCategory(product = {}) {
  const metadata = getProductMetadata(product);

  return normalize(
    product.category ||
    metadata.category
  );
}

function getSubcategory(product = {}) {
  const metadata = getProductMetadata(product);

  return normalize(
    product.subcategory ||
    metadata.subcategory
  );
}


/* =========================================================
   ROLE DETECTION
   ========================================================= */

function detectProductRole(product = {}) {
  const article = getArticleType(product);
  const category = getCategory(product);
  const subcategory = getSubcategory(product);

  /*
   * IMPORTANT:
   * Use the catalog's actual structural category first.
   * This prevents shoes from becoming accessories simply
   * because their name contains a generic fashion term.
   */

  if (
    category === "footwear" ||
    subcategory === "footwear" ||
    subcategory.includes("shoe") ||
    subcategory.includes("footwear")
  ) {
    return "footwear";
  }

  if (
    category.includes("accessor") ||
    subcategory.includes("accessor") ||
    article.includes("handbag") ||
    article.includes("backpack") ||
    article.includes("bag") ||
    article.includes("belt") ||
    article.includes("watch")
  ) {
    return "accessory";
  }

  if (
    category.includes("dress") ||
    subcategory.includes("dress") ||
    article.includes("dress")
  ) {
    return "dress";
  }

  if (
    subcategory.includes("bottom") ||
    category.includes("bottom") ||
    article.includes("jean") ||
    article.includes("trouser") ||
    article.includes("pant") ||
    article.includes("short") ||
    article.includes("legging") ||
    article.includes("skirt")
  ) {
    return "bottom";
  }

  if (
    category.includes("top") ||
    category === "apparel" ||
    article.includes("shirt") ||
    article.includes("t shirt") ||
    article.includes("tshirt") ||
    article.includes("kurta") ||
    article.includes("blouse") ||
    article.includes("sweater") ||
    article.includes("hoodie") ||
    article.includes("jacket")
  ) {
    return "top";
  }

  return null;
}


/* =========================================================
   FLATTEN CATALOG PRODUCT
   ========================================================= */

/*
 * The CSV provider stores many fashion attributes under
 * product.metadata.
 *
 * V13 needs the attributes directly on the outfit item.
 *
 * Example:
 *
 * metadata.color
 *        ↓
 * color
 *
 * metadata.articleType
 *        ↓
 * articleType
 */

function normalizeCatalogProduct(product = {}) {
  const metadata = getProductMetadata(product);

  return {
    provider: product.provider || "csv",
    store: product.store || "StyleBuddy Catalog",

    id: product.id,
    name: product.name,

    price:
      product.price !== undefined
        ? product.price
        : null,

    currency:
      product.currency || "INR",

    image:
      product.image || null,

    url:
      product.url || null,

    available:
      product.available !== false,

    score:
      Number(product.score || 0),

    category:
      product.category ||
      metadata.category ||
      null,

    subcategory:
      product.subcategory ||
      metadata.subcategory ||
      null,

    articleType:
      product.articleType ||
      product.article_type ||
      metadata.articleType ||
      metadata.article_type ||
      null,

    color:
      product.color ||
      metadata.color ||
      null,

    season:
      product.season ||
      metadata.season ||
      null,

    occasion:
      product.occasion ||
      metadata.occasion ||
      null,

    pattern:
      product.pattern ||
      metadata.pattern ||
      null,

    fabric:
      product.fabric ||
      metadata.fabric ||
      null,

    fit:
      product.fit ||
      metadata.fit ||
      null,

    length:
      product.length ||
      metadata.length ||
      null,

    formality:
      product.formality ||
      metadata.formality ||
      null,

    tone:
      product.tone ||
      metadata.tone ||
      null,
  };
}


/* =========================================================
   ANCHOR ROLE STRUCTURE
   ========================================================= */

function getProductStructures(anchor) {
  const anchorRole =
    detectProductRole(anchor);

  /*
   * The structure describes the complete outfit shape.
   *
   * It does NOT decide that something is missing from
   * the user's wardrobe.
   */

  if (anchorRole === "dress") {
    return {
      anchorRole,
      structures: [
        ["footwear"],
        ["footwear", "accessory"],
      ],
    };
  }

  if (anchorRole === "bottom") {
    return {
      anchorRole,
      structures: [
        ["top", "footwear"],
        ["top", "footwear", "accessory"],
      ],
    };
  }

  if (anchorRole === "footwear") {
    return {
      anchorRole,
      structures: [
        ["top", "bottom"],
        ["dress"],
        ["top", "bottom", "accessory"],
        ["dress", "accessory"],
      ],
    };
  }

  if (anchorRole === "accessory") {
    return {
      anchorRole,
      structures: [
        ["top", "bottom", "footwear"],
        ["dress", "footwear"],
      ],
    };
  }

  /*
   * Default anchor is a top.
   *
   * Core outfit:
   * top + bottom + footwear
   *
   * Optional variant:
   * top + bottom + footwear + accessory
   */

  return {
    anchorRole: "top",
    structures: [
      ["bottom", "footwear"],
      ["bottom", "footwear", "accessory"],
    ],
  };
}


/* =========================================================
   PRODUCT SEARCH REQUEST
   ========================================================= */

function buildRoleRequest({
  role,
  occasion,
  style,
  profile,
}) {
  const categoryByRole = {
    top: "Tops",
    bottom: "Bottomwear",
    footwear: "Footwear",
    accessory: "Accessories",
    dress: "Dresses",
  };

  const requestedCategory =
    categoryByRole[role] || role;

  /*
   * IMPORTANT:
   *
   * Do not inject the anchor color here.
   *
   * The catalog search should find a broad,
   * relevant candidate pool.
   *
   * V13 is responsible for determining whether
   * the candidate actually works with the anchor.
   */

  return {
    name: requestedCategory,

    category: requestedCategory,

    articleType: "",

    color: "",

    style,

    occasion,

    profile,

    season: "",

    fabric: "",

    fit: "",

    searchQuery: [
      requestedCategory,
      style,
      occasion,
    ]
      .filter(Boolean)
      .join(" "),
  };
}


/* =========================================================
   FETCH ROLE CANDIDATES
   ========================================================= */

async function getCandidatesForRole({
  anchor,
  role,
  occasion,
  style,
  profile,
}) {
  const request =
    buildRoleRequest({
      role,
      occasion,
      style,
      profile,
    });

  const result =
    await searchProducts(request);

  if (
    !Array.isArray(
      result?.products
    )
  ) {
    return [];
  }

  const normalized =
    result.products
      .map(
        normalizeCatalogProduct
      )
      .filter((product) => {
        const detectedRole =
          detectProductRole(
            product
          );

        return (
          detectedRole === role
        );
      });

  if (!normalized.length) {
    return [];
  }

  /*
   * ---------------------------------------------------------
   * CONTEXT-AWARE CANDIDATE RELEVANCE
   * ---------------------------------------------------------
   *
   * This does NOT decide what garment the outfit needs.
   *
   * The role has already been determined by the product-outfit
   * structure. This layer only evaluates how well each catalog
   * product fits the requested context.
   *
   * No hardcoded:
   *   casual -> jeans
   *   sports -> track pants
   *   formal -> trousers
   *
   * Product metadata remains the source of truth.
   */

  const contextual =
    normalized.map((product) => {
      const metadata =
        product?.metadata || {};

      const productOccasion =
        String(
          metadata.occasion ||
            product.occasion ||
            ""
        )
          .trim()
          .toLowerCase();

      const requestedOccasion =
        String(
          occasion || ""
        )
          .trim()
          .toLowerCase();

      const productFormality =
        String(
          metadata.formality ||
            product.formality ||
            ""
        )
          .trim()
          .toLowerCase();

      const productTone =
        String(
          metadata.tone ||
            product.tone ||
            ""
        )
          .trim()
          .toLowerCase();

      const requestedStyle =
        String(
          style || ""
        )
          .trim()
          .toLowerCase();

      let contextScore = 0;

      /*
       * Exact occasion match.
       */
      if (
        requestedOccasion &&
        productOccasion ===
          requestedOccasion
      ) {
        contextScore += 20;
      }

      /*
       * Occasion conflict.
       *
       * We penalize rather than immediately reject because
       * some catalog products may legitimately work across
       * multiple contexts.
       */
      if (
        requestedOccasion &&
        productOccasion &&
        productOccasion !==
          requestedOccasion
      ) {
        contextScore -= 8;
      }

      /*
       * Formality compatibility.
       *
       * This uses catalog metadata instead of mapping a style
       * directly to a clothing category.
       */
      if (
        requestedStyle &&
        productFormality &&
        requestedStyle ===
          productFormality
      ) {
        contextScore += 10;
      }

      /*
       * Tone compatibility.
       *
       * Tone is treated as an additional contextual signal,
       * never as a hard requirement.
       */
      if (
        requestedStyle &&
        productTone &&
        (
          productTone.includes(
            requestedStyle
          ) ||
          requestedStyle.includes(
            productTone
          )
        )
      ) {
        contextScore += 6;
      }

      return {
        ...product,

        contextScore,

        _candidateScore:
          Number(
            product.score || 0
          ) + contextScore,
      };
    });

  /*
   * ---------------------------------------------------------
   * CONTEXT-AWARE FILTER WITH SAFE FALLBACK
   * ---------------------------------------------------------
   *
   * First prefer products that have no meaningful contextual
   * conflict.
   *
   * If enough compatible products exist, use them.
   *
   * If the catalog does not provide enough compatible products,
   * fall back to the strongest available candidates rather
   * than returning an empty outfit.
   */

  const compatible =
    contextual.filter(
      (product) =>
        product.contextScore >= 0
    );

  const pool =
    compatible.length >=
    MAX_DIVERSE_PRODUCTS_PER_ROLE
      ? compatible
      : contextual;

  /*
   * Highest contextual relevance first.
   *
   * V13 will still perform the final whole-outfit ranking.
   */
  pool.sort(
    (a, b) =>
      b._candidateScore -
      a._candidateScore
  );

  return diversifyCandidates(
    pool,
    MAX_DIVERSE_PRODUCTS_PER_ROLE
  );
}
/* =========================================================
   CANDIDATE DIVERSITY
   ========================================================= */

function diversifyCandidates(
  products = [],
  maxProducts = MAX_DIVERSE_PRODUCTS_PER_ROLE
) {
  const uniqueProducts = [];
  const seenIds = new Set();

  /*
   * First remove exact duplicate catalog products.
   */

  for (const product of products) {
    const id = String(
      product?.id ||
      `${product?.name}-${product?.color}`
    );

    if (seenIds.has(id)) {
      continue;
    }

    seenIds.add(id);
    uniqueProducts.push(product);
  }

  /*
   * We want V13 to see different article types
   * and different colors.
   *
   * We therefore select candidates in rounds:
   *
   * Round 1:
   * different article types
   *
   * Round 2:
   * different colors
   *
   * Round 3:
   * remaining high-scoring products
   */

  const selected = [];
  const selectedIds = new Set();

  const articleTypes =
    new Set();

  const colors =
    new Set();

  function addCandidate(product) {
    const id = String(
      product?.id ||
      `${product?.name}-${product?.color}`
    );

    if (
      selectedIds.has(id)
    ) {
      return false;
    }

    selectedIds.add(id);
    selected.push(product);

    return true;
  }

  /*
   * ROUND 1
   *
   * Prefer different article types.
   */

  for (
    const product of uniqueProducts
  ) {
    const articleType =
      normalize(
        product?.articleType
      );

    if (
      articleType &&
      !articleTypes.has(
        articleType
      )
    ) {
      if (
        addCandidate(product)
      ) {
        articleTypes.add(
          articleType
        );
      }
    }

    if (
      selected.length >=
      maxProducts
    ) {
      return selected;
    }
  }

  /*
   * ROUND 2
   *
   * Prefer different colors.
   */

  for (
    const product of uniqueProducts
  ) {
    if (
      selected.length >=
      maxProducts
    ) {
      break;
    }

    const color =
      normalize(
        product?.color
      );

    if (
      color &&
      !colors.has(color)
    ) {
      if (
        addCandidate(product)
      ) {
        colors.add(color);
      }
    }
  }

  /*
   * ROUND 3
   *
   * Fill remaining slots using the
   * provider-ranked products.
   */

  for (
    const product of uniqueProducts
  ) {
    if (
      selected.length >=
      maxProducts
    ) {
      break;
    }

    addCandidate(product);
  }

  return selected;
}


/* =========================================================
   COMBINATION GENERATOR
   ========================================================= */

function buildCombinations({
  selectedItem,
  structure,
  candidatesByRole,
}) {
  const combinations = [];

  function walk(index, current) {
    if (
      combinations.length >=
      MAX_OUTFIT_COMBINATIONS
    ) {
      return;
    }

    if (index >= structure.length) {
      combinations.push({
        ...current,
      });

      return;
    }

    const role =
      structure[index];

    const candidates =
      candidatesByRole[role] || [];

    if (!candidates.length) {
      return;
    }

    for (const candidate of candidates) {
      walk(index + 1, {
        ...current,
        [role]: candidate,
      });

      if (
        combinations.length >=
        MAX_OUTFIT_COMBINATIONS
      ) {
        break;
      }
    }
  }

  walk(0, {
    top: null,
    bottom: null,
    dress: null,
    footwear: null,
    accessory: null,

    /*
     * Keep the selected wardrobe item explicitly
     * represented inside the outfit.
     */
    anchor: selectedItem,
  });

  return combinations;
}


/* =========================================================
   PREPARE OUTFIT FOR V13
   ========================================================= */

function prepareOutfitForV13({
  selectedItem,
  anchorRole,
  combination,
}) {
  const outfit = {
    top: null,
    bottom: null,
    dress: null,
    footwear: null,
    accessory: null,
  };

  /*
   * The selected wardrobe item is ALWAYS fixed.
   */

  outfit[anchorRole] =
    selectedItem;

  for (const role of [
    "top",
    "bottom",
    "dress",
    "footwear",
    "accessory",
  ]) {
    if (
      role === anchorRole
    ) {
      continue;
    }

    if (
      combination[role]
    ) {
      outfit[role] =
        combination[role];
    }
  }

  return outfit;
}


/* =========================================================
   DUPLICATE ROLE PROTECTION
   ========================================================= */

function hasDuplicateCatalogItem(
  outfit
) {
  const ids = [];

  for (const role of [
    "top",
    "bottom",
    "dress",
    "footwear",
    "accessory",
  ]) {
    const item =
      outfit[role];

    if (!item) {
      continue;
    }

    if (!item.id) {
      continue;
    }

    ids.push(
      String(item.id)
    );
  }

  return (
    new Set(ids).size !== ids.length
  );
}


/* =========================================================
   V13 SCORE
   ========================================================= */

async function scoreWithV13({
  outfit,
  selectedItem,
  bodyType,
  undertone,
  style,
  occasion,
}) {
  const response =
    await axios.post(
      V13_SCORE_URL,
      {
        outfit,

        bodyType,

        undertone,

        style,

        occasion,

        requestedItem:
          "Full Outfit",

        selectedItem,
      },
      {
        timeout: 30000,
      }
    );

  return (
    response?.data?.outfit ||
    null
  );
}


/* =========================================================
   SCORE EXTRACTION
   ========================================================= */

function getV13Score(
  scoredOutfit
) {
  return Number(
    scoredOutfit?.v13_score ??
    scoredOutfit?.v13Score ??
    scoredOutfit?.score ??
    scoredOutfit?.v13_breakdown?.final ??
    0
  );
}


/* =========================================================
   PUBLIC FUNCTION
   ========================================================= */

export async function generateProductOutfits({
  selectedItem,

  profile = null,

  occasion = "casual",

  style = "casual",

  temperatureC = null,

  weatherCondition = "clear",

  bodyType = null,

  undertone = null,

  limit = MAX_V13_RESULTS,
}) {
  if (
    !selectedItem ||
    typeof selectedItem !== "object"
  ) {
    return {
      success: false,

      message:
        "A selected wardrobe item is required.",

      outfits: [],
    };
  }

  const {
    anchorRole,
    structures,
  } =
    getProductStructures(
      selectedItem
    );

  /*
   * Collect every role needed by the
   * possible structures.
   */

  const requiredRoles =
    [
      ...new Set(
        structures.flat()
      ),
    ];

  const candidatesByRole =
    {};

  /*
   * Fetch product candidates independently
   * for each required role.
   */

  for (
    const role of requiredRoles
  ) {
    candidatesByRole[role] =
      await getCandidatesForRole({
        anchor:
          selectedItem,

        role,

        occasion,

        style,

        profile,
      });
  }

  /*
   * Build combinations for each valid
   * outfit structure.
   *
   * Example for Blue T-shirt:
   *
   * Structure A:
   * T-shirt + Bottom + Footwear
   *
   * Structure B:
   * T-shirt + Bottom + Footwear + Accessory
   */

  const allCombinations = [];

  for (
    const structure of structures
  ) {
    const structureRolesAvailable =
      structure.every(
        (role) =>
          candidatesByRole[role]
            ?.length > 0
      );

    if (
      !structureRolesAvailable
    ) {
      continue;
    }

    const combinations =
      buildCombinations({
        selectedItem,

        structure,

        candidatesByRole,
      });

    for (
      const combination
      of combinations
    ) {
      const outfit =
        prepareOutfitForV13({
          selectedItem,

          anchorRole,

          combination,
        });

      /*
       * Never allow the same catalog item
       * to occupy two different roles.
       */

      if (
        hasDuplicateCatalogItem(
          outfit
        )
      ) {
        continue;
      }

      allCombinations.push({
        outfit,
        structure,
      });
    }
  }

  if (
    !allCombinations.length
  ) {
    return {
      success: false,

      message:
        "No complete product outfit combinations were found.",

      anchor:
        selectedItem,

      anchorRole,

      structures,

      candidateCounts:
        Object.fromEntries(
          requiredRoles.map(
            (role) => [
              role,
              candidatesByRole[
                role
              ]?.length || 0,
            ]
          )
        ),

      outfits: [],
    };
  }

  /*
   * Remove exact duplicate outfits.
   */

  const uniqueCombinations =
    [];

  const combinationKeys =
    new Set();

  for (
    const entry of
    allCombinations
  ) {
    const key =
      [
        entry.outfit.top?.id ||
          "none",

        entry.outfit.bottom?.id ||
          "none",

        entry.outfit.dress?.id ||
          "none",

        entry.outfit.footwear?.id ||
          "none",

        entry.outfit.accessory?.id ||
          "none",

        selectedItem?.id ||
          "anchor",
      ].join("|");

    if (
      combinationKeys.has(key)
    ) {
      continue;
    }

    combinationKeys.add(key);

    uniqueCombinations.push(
      entry
    );
  }

  /*
   * V13 is the final ranking authority.
   *
   * We deliberately do not use the CSV
   * product score as the final outfit score.
   */

  const scored = [];

  for (
    const entry of
    uniqueCombinations
  ) {
    try {
      const scoredOutfit =
        await scoreWithV13({
          outfit:
            entry.outfit,

          selectedItem,

          bodyType,

          undertone,

          style,

          occasion,
        });

      if (
        !scoredOutfit
      ) {
        continue;
      }

      const v13Score =
        getV13Score(
          scoredOutfit
        );

      scored.push({
        outfit:
          scoredOutfit,

        productOutfit:
          entry.outfit,

        structure:
          entry.structure,

        v13Score,
      });

    } catch (error) {
      console.error(
        "Product outfit V13 scoring failed:",

        error?.response?.data ||
          error?.message ||
          error
      );
    }
  }

  /*
   * Highest V13 score first.
   */

    /* =========================================================
   FINAL OUTFIT DIVERSITY
   ========================================================= */

/*
 * Two outfits are considered the same core outfit when
 * they use the same top, bottom and footwear.
 *
 * Accessories do NOT create a new outfit by themselves.
 *
 * Example:
 *
 * Blue T-shirt
 * + Grey Capri
 * + Red Shoes
 * + Belt
 *
 * and
 *
 * Blue T-shirt
 * + Grey Capri
 * + Red Shoes
 * + Backpack
 *
 * are the SAME core outfit.
 */

function getCoreOutfitKey(entry = {}) {
  const outfit =
    entry?.productOutfit ||
    entry?.outfit ||
    {};

  return [
    outfit?.top?.id || "none",
    outfit?.bottom?.id || "none",
    outfit?.dress?.id || "none",
    outfit?.footwear?.id || "none",
  ].join("|");
}


/*
 * Select the highest-scoring outfits while preventing
 * the result list from being filled by accessory-only
 * variations.
 */
function selectDiverseOutfits(
  scoredOutfits,
  requestedLimit
) {
  const limit =
    Math.max(
      1,
      Number(requestedLimit) ||
        MAX_V13_RESULTS
    );

  const selected = [];

  const usedCoreKeys =
    new Set();

  const usedPrimaryKeys =
    new Set();

  /*
   * Select the primary complementary role
   * dynamically from the actual outfit structure.
   *
   * For a top anchor:
   *   bottom is the primary variation.
   *
   * For a bottom anchor:
   *   top is the primary variation.
   *
   * For a footwear anchor:
   *   the clothing combination becomes primary.
   *
   * For a dress:
   *   footwear becomes primary.
   *
   * This does NOT decide what item is required.
   * It only controls diversity among already-generated
   * complete product outfits.
   */
  function getPrimaryDiversityKey(
    entry
  ) {
    const outfit =
      entry?.productOutfit ||
      entry?.outfit ||
      {};

    if (
      outfit?.top?.id &&
      !outfit?.dress?.id
    ) {
      return `bottom:${outfit?.bottom?.id || "none"}`;
    }

    if (
      outfit?.bottom?.id &&
      !outfit?.top?.id &&
      !outfit?.dress?.id
    ) {
      return `top:${outfit?.top?.id || "none"}`;
    }

    if (outfit?.dress?.id) {
      return `dress:${outfit.dress.id}`;
    }

    if (outfit?.footwear?.id) {
      return `footwear:${outfit.footwear.id}`;
    }

    return "primary:none";
  }

  /*
   * Pass 1:
   * Prefer completely different primary outfit bases.
   *
   * This gives us:
   *
   * Bottom A + Shoes X
   * Bottom B + Shoes Y
   * Bottom C + Shoes Z
   *
   * instead of consuming all three slots with
   * Bottom A + different shoes.
   */
  for (
    const entry of scoredOutfits
  ) {
    if (
      selected.length >= limit
    ) {
      break;
    }

    const coreKey =
      getCoreOutfitKey(entry);

    const primaryKey =
      getPrimaryDiversityKey(entry);

    if (
      usedCoreKeys.has(coreKey)
    ) {
      continue;
    }

    if (
      usedPrimaryKeys.has(primaryKey)
    ) {
      continue;
    }

    usedCoreKeys.add(coreKey);
    usedPrimaryKeys.add(primaryKey);

    selected.push(entry);
  }

  /*
   * Pass 2:
   * If there are not enough unique primary
   * combinations, fill remaining slots with
   * unique complete core outfits.
   *
   * V13 score order is preserved.
   */
  if (
    selected.length < limit
  ) {
    for (
      const entry of scoredOutfits
    ) {
      if (
        selected.length >= limit
      ) {
        break;
      }

      const coreKey =
        getCoreOutfitKey(entry);

      if (
        usedCoreKeys.has(coreKey)
      ) {
        continue;
      }

      usedCoreKeys.add(coreKey);

      selected.push(entry);
    }
  }

  return selected;
}


/*
 * V13 remains the ranking authority.
 *
 * We only apply diversity AFTER V13 ranking.
 */
scored.sort(
  (a, b) =>
    b.v13Score -
    a.v13Score
);

const diverseOutfits =
  selectDiverseOutfits(
    scored,
    limit
  );

const finalOutfits =
  diverseOutfits.map(
    (entry, index) => ({
      rank:
        index + 1,

      source:
        "products.csv",

      anchor:
        selectedItem,

      anchorRole,

      structure:
        entry.structure,

      v13Score:
        entry.v13Score,

      v13Breakdown:
        entry.outfit
          ?.v13_breakdown ||
        entry.outfit
          ?.v13Breakdown ||
        null,

      outfit:
        entry.outfit,

      productOutfit:
        entry.productOutfit,
    })
  )
      .map(
        (entry, index) => ({
          rank:
            index + 1,

          source:
            "products.csv",

          anchor:
            selectedItem,

          anchorRole,

          structure:
            entry.structure,

          v13Score:
            entry.v13Score,

          v13Breakdown:
            entry.outfit
              ?.v13_breakdown ||
            entry.outfit
              ?.v13Breakdown ||
            null,

          outfit:
            entry.outfit,

          productOutfit:
            entry.productOutfit,
        })
      );

  return {
    success:
      finalOutfits.length > 0,

    message:
      finalOutfits.length > 0
        ? `Generated ${finalOutfits.length} complete product outfit(s).`
        : "No complete product outfits could be scored.",

    anchor:
      selectedItem,

    anchorRole,

    candidateCounts:
      Object.fromEntries(
        requiredRoles.map(
          (role) => [
            role,
            candidatesByRole[
              role
            ]?.length || 0,
          ]
        )
      ),

    combinationsGenerated:
      uniqueCombinations.length,

    outfits:
      finalOutfits,
  };
}