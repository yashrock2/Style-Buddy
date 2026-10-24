import {
  getAiRecommendation,
  scoreV13Outfit,
} from "./ai-recommendation.service.js";
import {
  generateGeminiStylistResponse,
} from "./gemini-stylist.service.js";
import {
  searchMissingItems,
} from "./shopping/shopping.service.js";

/* =========================================================
   STYLEBUDDY AI STYLIST SERVICE

   This service is the orchestration layer between:

   User request
        ↓
   User wardrobe
        ↓
   Gemini AI Stylist
        ↓
   Validated wardrobe items
        ↓
   Dynamic missing-item detection

   IMPORTANT:
   Gemini is the reasoning authority for:
   - understanding the user's request
   - selecting wardrobe items
   - respecting the selected wardrobe item
   - deciding whether the outfit is complete
   - deciding what is genuinely missing

   Existing Python AI remains available in the project for
   compatibility/ranking and other recommendation workflows,
   but it is NOT allowed to decide missing items here.

   We do NOT start with a predefined list such as:
   "shoes + bottom + accessory".

   Missing items come ONLY from Gemini's reasoning.
   ========================================================= */


/* =========================================================
   NORMALIZATION
   ========================================================= */

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\btshirts?\b/g, "t shirt")
    .replace(/\btee shirts?\b/g, "t shirt")
    .replace(/\btees?\b/g, "t shirt")
    .replace(/\bshirts\b/g, "shirt")
    .replace(/\bjeans\b/g, "jean")
    .replace(/\btrousers\b/g, "trouser")
    .replace(/\bpants\b/g, "pant")
    .replace(/\bshorts\b/g, "short")
    .replace(/\bshoes\b/g, "shoe")
    .replace(/\bsneakers\b/g, "sneaker")
    .replace(/\bslippers\b/g, "slipper")
    .replace(/\bsandals\b/g, "sandal")
    .replace(/\bboots\b/g, "boot")
    .replace(/\bheels\b/g, "heel")
    .replace(/\bdresses\b/g, "dress")
    .replace(/\bhoodies\b/g, "hoodie")
    .replace(/\bsweatshirts\b/g, "sweatshirt")
    .replace(/\bpolos\b/g, "polo")
    .replace(/\bjackets\b/g, "jacket")
    .replace(/\bcoats\b/g, "coat")
    .replace(/\baccessories\b/g, "accessory")
    .replace(/\bwatches\b/g, "watch")
    .replace(/\bbags\b/g, "bag")
    .replace(/\bbelts\b/g, "belt")
    .replace(/\bcaps\b/g, "cap")
    .replace(/\bhats\b/g, "hat")
    .replace(/\s+/g, " ")
    .trim();
}


/* =========================================================
   ITEM TEXT
   ========================================================= */

function getItemText(item = {}) {
  return [
    item.category,
    item.articleType,
    item.article_type,
    item.color,
    item.pattern,
    item.fabric,
    item.sleeve,
    item.neckline,
    item.fit,
    item.length,
    item.formality,
    item.style,
    item.occasion,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}


/* =========================================================
   COLOR NORMALIZATION
   ========================================================= */

function getItemColor(item = {}) {
  return normalize(
    item.color ||
      item.details?.ai?.color?.value ||
      item.details?.color?.value ||
      ""
  );
}


/* =========================================================
   ARTICLE TYPE
   ========================================================= */

function getArticleType(item = {}) {
  return normalize(
    item.articleType ||
      item.article_type ||
      item.details?.ai?.articleType?.value ||
      item.details?.articleType ||
      ""
  );
}


/* =========================================================
   ROLE DETECTION

   This tells us what a wardrobe item IS.

   It does NOT decide whether it is suitable.
   Suitability is handled separately.
   ========================================================= */

export function getWardrobeRole(item = {}) {
  const category = normalize(item.category);
  const article = getArticleType(item);
  const text = getItemText(item);

  /* -------------------------
     DRESS
     ------------------------- */

  if (
    category.includes("dress") ||
    article.includes("dress") ||
    text.includes("gown")
  ) {
    return "dress";
  }


  /* -------------------------
     FOOTWEAR
     ------------------------- */

  if (
    category.includes("footwear") ||
    category.includes("shoe") ||
    category.includes("shoes") ||
    article.includes("shoe") ||
    article.includes("sneaker") ||
    article.includes("flat") ||
    article.includes("heel") ||
    article.includes("loafer") ||
    article.includes("boot") ||
    article.includes("sandal") ||
    article.includes("slipper") ||
    text.includes("footwear")
  ) {
    return "footwear";
  }


  /* -------------------------
     BOTTOM
     ------------------------- */

  if (
    category.includes("bottom") ||
    article.includes("jean") ||
    article.includes("trouser") ||
    article.includes("pant") ||
    article.includes("short") ||
    article.includes("skirt") ||
    article.includes("lower")
  ) {
    return "bottom";
  }


  /* -------------------------
     ACCESSORY
     ------------------------- */

  if (
    category.includes("accessor") ||
    article.includes("watch") ||
    article.includes("bag") ||
    article.includes("backpack") ||
    article.includes("handbag") ||
    article.includes("belt") ||
    article.includes("wallet") ||
    article.includes("bracelet") ||
    article.includes("necklace") ||
    article.includes("cap") ||
    article.includes("hat")
  ) {
    return "accessory";
  }


  /* -------------------------
     TOP
     ------------------------- */

  if (
    category.includes("top") ||
    category.includes("shirt") ||
    article.includes("shirt") ||
    article.includes("tshirt") ||
    article.includes("t-shirt") ||
    article.includes("kurta") ||
    article.includes("hoodie") ||
    article.includes("sweatshirt") ||
    article.includes("polo") ||
    article.includes("top")
  ) {
    return "top";
  }


  return null;
}


/* =========================================================
   PREPARE WARDROBE

   We add a temporary wardrobeRole field.

   The database is NOT modified.
   ========================================================= */

export function prepareWardrobe(closetItems = []) {
  return closetItems.map((item) => ({
    ...item,
    wardrobeRole: getWardrobeRole(item),
  }));
}


/* =========================================================
   OCCASION NORMALIZATION
   ========================================================= */

function detectOccasion(message = "", fallback = "casual") {
  const text = normalize(message);

  const occasionMap = [
    {
      words: ["college", "campus", "class"],
      value: "college",
    },
    {
      words: ["office", "work", "business"],
      value: "office",
    },
    {
      words: ["wedding", "shaadi", "marriage"],
      value: "wedding",
    },
    {
      words: ["party", "club", "night out"],
      value: "party",
    },
    {
      words: ["date", "date night"],
      value: "date",
    },
    {
      words: ["travel", "trip", "vacation"],
      value: "travel",
    },
    {
      words: ["gym", "workout"],
      value: "gym",
    },
    {
      words: ["festival", "festive"],
      value: "festival",
    },
    {
      words: ["traditional", "ethnic"],
      value: "traditional",
    },
    {
      words: ["formal"],
      value: "formal",
    },
    {
      words: ["casual"],
      value: "casual",
    },
  ];

  for (const entry of occasionMap) {
    if (
      entry.words.some((word) =>
        text.includes(word)
      )
    ) {
      return entry.value;
    }
  }

  return normalize(fallback) || "casual";
}


/* =========================================================
   STYLE NORMALIZATION
   ========================================================= */

function detectStyle(message = "", fallback = "casual") {
  const text = normalize(message);

  const styleMap = [
    {
      words: ["smart casual", "smart-casual"],
      value: "smart casual",
    },
    {
      words: ["streetwear", "street style"],
      value: "streetwear",
    },
    {
      words: ["minimal", "minimalist"],
      value: "minimal",
    },
    {
      words: ["traditional", "ethnic"],
      value: "traditional",
    },
    {
      words: ["formal", "professional"],
      value: "formal",
    },
    {
      words: ["party"],
      value: "party",
    },
    {
      words: ["casual"],
      value: "casual",
    },
  ];

  for (const entry of styleMap) {
    if (
      entry.words.some((word) =>
        text.includes(word)
      )
    ) {
      return entry.value;
    }
  }

  return normalize(fallback) || "casual";
}


/* =========================================================
   BUDGET DETECTION
   ========================================================= */

export function extractBudget(message = "") {
  const text = String(message || "");

  const patterns = [
    /(?:under|below|within|max(?:imum)?|budget(?:\s+of)?|upto|up\s*to)\s*₹?\s*(\d[\d,]*)/i,
    /₹\s*(\d[\d,]*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      const amount = Number(
        match[1].replace(/,/g, "")
      );

      if (
        Number.isFinite(amount) &&
        amount > 0
      ) {
        return amount;
      }
    }
  }

  return null;
}


/* =========================================================
   WARDROBE-ONLY DETECTION
   ========================================================= */

export function isWardrobeOnlyRequest(message = "") {
  const text = normalize(message);

  return (
    text.includes("only my wardrobe") ||
    text.includes("only my closet") ||
    text.includes("use only what i have") ||
    text.includes("use only what i own") ||
    text.includes("don't shop") ||
    text.includes("do not shop") ||
    text.includes("no shopping")
  );
}


/* =========================================================
   SHOPPING REQUEST DETECTION
   ========================================================= */

export function isShoppingRequest(message = "") {
  const text = normalize(message);

  return (
    text.includes("buy") ||
    text.includes("shop") ||
    text.includes("shopping") ||
    text.includes("purchase") ||
    text.includes("find me") ||
    text.includes("show me products") ||
    text.includes("myntra") ||
    text.includes("amazon") ||
    text.includes("flipkart")
  );
}


/* =========================================================
   SELECTED ITEM DETECTION

   This attempts to identify the actual saved wardrobe item
   mentioned by the user.
   ========================================================= */

export function findSelectedWardrobeItem(
  closetItems = [],
  message = ""
) {
  const query = normalize(message);

  if (!query || !Array.isArray(closetItems)) {
    return null;
  }

  const queryWords = new Set(
    query
      .split(/\s+/)
      .filter((word) => word.length >= 3)
  );


  /* =======================================================
     COLOR MATCH
     ======================================================= */

  const colorMatchesQuery = (item) => {
    const color = getItemColor(item);

    if (!color) {
      return false;
    }

    if (query.includes(color)) {
      return true;
    }

    const colorWords = color
      .split(/\s+/)
      .filter(
        (word) => word.length >= 3
      );

    return colorWords.some(
      (word) =>
        queryWords.has(word)
    );
  };


  /* =======================================================
     ARTICLE TYPE MATCH
     ======================================================= */

  const articleMatchesQuery = (item) => {
    const article =
      getArticleType(item);

    if (!article) {
      return false;
    }

    const articleWords = article
      .split(/\s+/)
      .filter(
        (word) => word.length >= 3
      );

    if (!articleWords.length) {
      return false;
    }

    return articleWords.some(
      (word) =>
        query.includes(word) ||
        queryWords.has(word)
    );
  };


  /* =======================================================
     1. COLOR + ARTICLE TYPE
     ======================================================= */

  const strongMatches =
    closetItems.filter(
      (item) =>
        colorMatchesQuery(item) &&
        articleMatchesQuery(item)
    );

  if (strongMatches.length > 0) {
    return strongMatches[0];
  }


  /* =======================================================
     2. FULL ITEM TEXT MATCH
     ======================================================= */

  const exactTextMatches =
    closetItems.filter(
      (item) => {
        const itemText =
          normalize(
            getItemText(item)
          );

        if (!itemText) {
          return false;
        }

        const meaningfulWords =
          query
            .split(/\s+/)
            .filter(
              (word) =>
                word.length >= 3
            );

        if (!meaningfulWords.length) {
          return false;
        }

        const matchingWords =
          meaningfulWords.filter(
            (word) =>
              itemText.includes(word)
          );

        return (
          matchingWords.length >=
          Math.min(
            2,
            meaningfulWords.length
          )
        );
      }
    );

  if (exactTextMatches.length > 0) {
    return exactTextMatches[0];
  }


  /* =======================================================
     3. ARTICLE TYPE ONLY
     ======================================================= */

  const articleMatches =
    closetItems.filter(
      (item) =>
        articleMatchesQuery(item)
    );

  if (articleMatches.length === 1) {
    return articleMatches[0];
  }

  return null;
}


/* =========================================================
   EXPLICIT ITEM REQUEST DETECTION

   This does NOT decide what category is missing.

   It simply extracts the item phrase that the USER
   explicitly mentioned.

   No predefined missing-item category is used here.
   ========================================================= */

function extractExplicitWardrobeItemRequest(
  message = ""
) {
  const text = String(message || "")
    .trim()
    .replace(/[?!.,]+$/g, "")
    .replace(/\s+/g, " ");

  if (!text) {
    return null;
  }

  const normalizedText =
    text.toLowerCase();

  const negativePatterns = [
    /\bi\s+(?:don't|do not)\s+have\b/i,
    /\bi\s+(?:do not|don't)\s+own\b/i,
    /\bthere\s+is\s+no\b/i,
    /\bthere\s+are\s+no\b/i,
    /\bwithout\b/i,
  ];

  if (
    negativePatterns.some(
      (pattern) =>
        pattern.test(normalizedText)
    )
  ) {
    return null;
  }

  const patterns = [
    /\bwith\s+(?:my|the)\s+(.+?)(?:\s+for\b|\s+to\b|\s+and\b|$)/i,
    /\busing\s+(?:my|the)\s+(.+?)(?:\s+for\b|\s+to\b|\s+and\b|$)/i,
    /\bstyle\s+(?:my|the)\s+(.+?)(?:\s+for\b|\s+to\b|\s+and\b|$)/i,
    /\bstyling\s+(?:my|the)\s+(.+?)(?:\s+for\b|\s+to\b|\s+and\b|$)/i,
    /\bwear\s+(?:my|the)\s+(.+?)(?:\s+for\b|\s+to\b|\s+and\b|$)/i,
    /\bwearing\s+(?:my|the)\s+(.+?)(?:\s+for\b|\s+to\b|\s+and\b|$)/i,
    /\bpair\s+(?:my|the)\s+(.+?)(?:\s+with\b|\s+for\b|$)/i,
    /\bmatch\s+(?:my|the)\s+(.+?)(?:\s+with\b|\s+for\b|$)/i,
  ];

  for (const pattern of patterns) {
    const match =
      text.match(pattern);

    if (
      match?.[1]
    ) {
      const requested =
        match[1]
          .trim()
          .replace(/[?!.,]+$/g, "")
          .replace(/\s+/g, " ");

      if (
        requested.length >= 2
      ) {
        return requested;
      }
    }
  }

  const myItemMatch =
    text.match(
      /\bmy\s+(.+?)(?:\s+for\b|\s+to\b|$)/i
    );

  if (
    myItemMatch?.[1]
  ) {
    const requested =
      myItemMatch[1]
        .trim()
        .replace(/[?!.,]+$/g, "")
        .replace(/\s+/g, " ");

    if (
      requested.length >= 2
    ) {
      return requested;
    }
  }

  return null;
}


/* =========================================================
   REQUEST CONTEXT
   ========================================================= */

export function buildStylistContext({
  message = "",
  occasion = "casual",
  style = "casual",
  budget = null,
  selectedItem = null,
  wardrobeOnly = false,
}) {
  return {
    message,

    occasion: detectOccasion(
      message,
      occasion
    ),

    style: detectStyle(
      message,
      style
    ),

    budget:
      budget ??
      extractBudget(message),

    selectedItem,

    wardrobeOnly:
      wardrobeOnly ||
      isWardrobeOnlyRequest(message),

    shoppingRequested:
      isShoppingRequest(message),
  };
}


/* =========================================================
   ROLE HELPERS

   Kept for compatibility with the rest of the service.

   IMPORTANT:
   These helpers are NOT used by the Gemini missing-item
   authority in the main recommendation flow.
   ========================================================= */

function getRoleFromOutfitItem(item = {}) {
  if (item.role) {
    return normalize(item.role);
  }

  return getWardrobeRole(item);
}


/* =========================================================
   FIND CORRESPONDING WARDROBE ITEM
   ========================================================= */

function findMatchingWardrobeItem(
  outfitItem,
  wardrobe = []
) {
  if (!outfitItem) {
    return null;
  }

  if (outfitItem.id) {
    const exact = wardrobe.find(
      (item) =>
        String(item.id) ===
        String(outfitItem.id)
    );

    if (exact) {
      return exact;
    }
  }

  const targetRole =
    getRoleFromOutfitItem(outfitItem);

  const targetColor =
    getItemColor(outfitItem);

  const targetArticle =
    getArticleType(outfitItem);

  const candidates =
    wardrobe.filter((item) => {
      const itemRole =
        item.wardrobeRole ||
        getWardrobeRole(item);

      if (
        targetRole &&
        itemRole !== targetRole
      ) {
        return false;
      }

      return true;
    });

  if (!candidates.length) {
    return null;
  }

  let best = null;
  let bestScore = -Infinity;

  for (const item of candidates) {
    let score = 0;

    const itemColor =
      getItemColor(item);

    const itemArticle =
      getArticleType(item);

    if (
      targetColor &&
      itemColor === targetColor
    ) {
      score += 20;
    }

    if (
      targetArticle &&
      itemArticle === targetArticle
    ) {
      score += 25;
    }

    if (
      targetArticle &&
      itemArticle &&
      (
        itemArticle.includes(targetArticle) ||
        targetArticle.includes(itemArticle)
      )
    ) {
      score += 10;
    }

    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return best;
}


/* =========================================================
   COLOR COMPATIBILITY

   Kept for compatibility/reference.

   This is NOT used to decide whether something is missing.
   ========================================================= */

const COLOR_RULES = {
  white: [
    "black",
    "blue",
    "brown",
    "beige",
    "grey",
    "cream",
    "red",
    "green",
  ],

  black: [
    "white",
    "grey",
    "blue",
    "red",
    "brown",
    "beige",
    "green",
  ],

  blue: [
    "white",
    "cream",
    "beige",
    "grey",
    "brown",
    "black",
  ],

  brown: [
    "cream",
    "beige",
    "blue",
    "white",
    "black",
  ],

  cream: [
    "brown",
    "blue",
    "white",
    "beige",
    "gold",
  ],

  beige: [
    "white",
    "brown",
    "blue",
    "cream",
    "black",
  ],

  grey: [
    "white",
    "black",
    "blue",
    "pink",
  ],

  red: [
    "black",
    "white",
    "blue",
    "beige",
  ],

  pink: [
    "white",
    "cream",
    "grey",
    "blue",
  ],

  green: [
    "beige",
    "cream",
    "white",
    "brown",
    "black",
  ],

  purple: [
    "white",
    "black",
    "grey",
    "beige",
  ],

  yellow: [
    "black",
    "white",
    "blue",
    "brown",
  ],

  orange: [
    "white",
    "black",
    "blue",
    "beige",
  ],
};


function colorCompatibility(
  colorA,
  colorB
) {
  const a = normalize(colorA);
  const b = normalize(colorB);

  if (!a || !b) {
    return 5;
  }

  if (a === b) {
    return -5;
  }

  if (
    COLOR_RULES[a]?.includes(b) ||
    COLOR_RULES[b]?.includes(a)
  ) {
    return 20;
  }

  return 0;
}


/* =========================================================
   OCCASION / FORMALITY SUITABILITY
   ========================================================= */

function suitabilityScore(
  candidate,
  outfitItems = [],
  context = {}
) {
  let score = 0;

  const candidateText =
    getItemText(candidate);

  const occasion =
    normalize(context.occasion);

  const style =
    normalize(context.style);

  if (occasion) {
    if (
      candidateText.includes(occasion)
    ) {
      score += 20;
    }

    if (
      occasion === "college" &&
      (
        candidateText.includes("casual") ||
        candidateText.includes("everyday") ||
        candidateText.includes("daily")
      )
    ) {
      score += 12;
    }

    if (
      occasion === "office" &&
      (
        candidateText.includes("formal") ||
        candidateText.includes("office") ||
        candidateText.includes("business")
      )
    ) {
      score += 15;
    }

    if (
      occasion === "wedding" &&
      (
        candidateText.includes("formal") ||
        candidateText.includes("wedding") ||
        candidateText.includes("party") ||
        candidateText.includes("ethnic") ||
        candidateText.includes("traditional")
      )
    ) {
      score += 15;
    }

    if (
      occasion === "party" &&
      (
        candidateText.includes("party") ||
        candidateText.includes("casual") ||
        candidateText.includes("smart")
      )
    ) {
      score += 10;
    }
  }


  /* -------------------------------------------------------
     Style signals
     ------------------------------------------------------- */

  if (style) {
    if (
      candidateText.includes(style)
    ) {
      score += 15;
    }

    if (
      style === "casual" &&
      (
        candidateText.includes("casual") ||
        candidateText.includes("everyday")
      )
    ) {
      score += 10;
    }

    if (
      style === "formal" &&
      (
        candidateText.includes("formal") ||
        candidateText.includes("business")
      )
    ) {
      score += 10;
    }

    if (
      style === "streetwear" &&
      (
        candidateText.includes("street") ||
        candidateText.includes("oversized") ||
        candidateText.includes("sneaker")
      )
    ) {
      score += 10;
    }
  }


  /* -------------------------------------------------------
     Color compatibility with already selected items.
     ------------------------------------------------------- */

  const candidateColor =
    getItemColor(candidate);

  for (const outfitItem of outfitItems) {
    const outfitColor =
      getItemColor(outfitItem);

    score += colorCompatibility(
      candidateColor,
      outfitColor
    );
  }

  return score;
}


/* =========================================================
   CHECK WHETHER A WARDROBE ITEM IS ACTUALLY SUITABLE
   ========================================================= */

function isSuitableWardrobeItem(
  candidate,
  outfitItems = [],
  context = {}
) {
  if (!candidate) {
    return false;
  }

  const score =
    suitabilityScore(
      candidate,
      outfitItems,
      context
    );

  const hasContextData =
    Boolean(
      candidate.style ||
      candidate.occasion ||
      candidate.formality ||
      candidate.details?.occasion ||
      candidate.details?.style
    );

  if (!hasContextData) {
    return true;
  }

  return score >= 0;
}


/* =========================================================
   OLD OUTFIT REQUIREMENT ANALYSIS

   These functions are retained so other existing code does
   not break.

   IMPORTANT:
   THEY ARE NOT USED BY generateStylistRecommendation()
   TO DETERMINE MISSING ITEMS ANYMORE.

   Gemini is now the missing-item authority.
   ========================================================= */

function determineRequiredRoles(
  outfitItems = [],
  context = {}
) {
  const roles = new Set();

  for (const item of outfitItems) {
    const role =
      getRoleFromOutfitItem(item);

    if (role) {
      roles.add(role);
    }
  }

  const hasDress =
    roles.has("dress");

  const hasTop =
    roles.has("top");

  const hasBottom =
    roles.has("bottom");

  const hasFootwear =
    roles.has("footwear");

  if (hasDress) {
    roles.delete("top");
    roles.delete("bottom");

    if (
      !context.message ||
      !normalize(context.message).includes(
        "dress only"
      )
    ) {
      roles.add("footwear");
    }
  }

  if (
    hasTop &&
    hasBottom
  ) {
    roles.add("footwear");
  }

  if (
    context.selectedItem &&
    roles.size <= 1
  ) {
    const selectedRole =
      getWardrobeRole(
        context.selectedItem
      );

    if (selectedRole === "top") {
      roles.add("bottom");
      roles.add("footwear");
    }

    if (selectedRole === "bottom") {
      roles.add("top");
      roles.add("footwear");
    }

    if (selectedRole === "dress") {
      roles.add("footwear");
    }
  }

  return Array.from(roles);
}


export function analyzeMissingItems({
  outfitItems = [],
  wardrobe = [],
  context = {},
}) {
  const requiredRoles =
    determineRequiredRoles(
      outfitItems,
      context
    );

  const selectedItems = [
    ...outfitItems,
  ];

  const missingItems = [];

  for (const role of requiredRoles) {
    const outfitItem =
      outfitItems.find(
        (item) =>
          getRoleFromOutfitItem(item) ===
          role
      );

    if (outfitItem) {
      continue;
    }

    const candidates =
      wardrobe.filter(
        (item) =>
          (
            item.wardrobeRole ||
            getWardrobeRole(item)
          ) === role
      );

    let bestCandidate = null;
    let bestScore = -Infinity;

    for (const candidate of candidates) {
      if (
        !isSuitableWardrobeItem(
          candidate,
          selectedItems,
          context
        )
      ) {
        continue;
      }

      const score =
        suitabilityScore(
          candidate,
          selectedItems,
          context
        );

      if (
        score > bestScore
      ) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      selectedItems.push(
        bestCandidate
      );

      continue;
    }

    missingItems.push({
      role,

      title: getMissingItemTitle(
        role
      ),

      reason:
        `No suitable ${getRoleLabel(
          role
        )} was found in your wardrobe for this outfit.`,

      shoppingRequired:
        !context.wardrobeOnly,

      query: buildMissingItemQuery(
        role,
        selectedItems,
        context
      ),
    });
  }

  return {
    requiredRoles,
    missingItems,
    completedItems: selectedItems,
  };
}


/* =========================================================
   FRIENDLY ROLE LABEL
   ========================================================= */

function getRoleLabel(role) {
  const labels = {
    top: "top",
    bottom: "bottom",
    footwear: "footwear",
    dress: "dress",
    accessory: "accessory",
  };

  return labels[role] || "item";
}


/* =========================================================
   MISSING ITEM TITLE
   ========================================================= */

function getMissingItemTitle(role) {
  const titles = {
    top: "A suitable top",
    bottom: "A suitable bottom",
    footwear: "Suitable footwear",
    dress: "A suitable dress",
    accessory: "A suitable accessory",
  };

  return (
    titles[role] ||
    "A suitable item"
  );
}


/* =========================================================
   SHOPPING QUERY
   ========================================================= */

function buildMissingItemQuery(
  role,
  outfitItems = [],
  context = {}
) {
  const colors = outfitItems
    .map(getItemColor)
    .filter(Boolean);

  const color =
    colors.length > 0
      ? colors[0]
      : "";

  const occasion =
    normalize(context.occasion);

  const style =
    normalize(context.style);

  const roleNames = {
    top: "top",
    bottom: "bottom",
    footwear: "shoes",
    dress: "dress",
    accessory: "accessory",
  };

  return [
    color,
    roleNames[role] || "fashion item",
    style,
    occasion,
  ]
    .filter(Boolean)
    .join(" ");
}


/* =========================================================
   NORMALIZE AI OUTFIT
   ========================================================= */

function normalizeAiOutfit(
  aiRecommendation
) {
  const outfit =
    aiRecommendation?.outfit ||
    aiRecommendation;

  if (!outfit) {
    return null;
  }

  return {
    ...outfit,

    items: Array.isArray(
      outfit.items
    )
      ? outfit.items
      : [],

    missingItems: Array.isArray(
      outfit.missingItems
    )
      ? outfit.missingItems
      : [],
  };
}


/* =========================================================
   PRESERVE SELECTED ITEM

   If the user specifically selected a closet item,
   make sure it remains part of the final outfit.
   ========================================================= */

function ensureSelectedItem(
  outfitItems = [],
  selectedItem
) {
  if (!selectedItem) {
    return outfitItems;
  }

  const alreadyIncluded =
    outfitItems.some(
      (item) =>
        String(item?.id) ===
        String(selectedItem.id)
    );

  if (alreadyIncluded) {
    return outfitItems;
  }

  return [
    selectedItem,
    ...outfitItems,
  ];
}


/* =========================================================
   MAIN STYLIST FUNCTION
   ========================================================= */

export async function generateStylistRecommendation({
  closetItems = [],
  profile = null,
  message = "",
  conversation = [],
  occasion = "casual",
  style = "casual",
  role = "Full Outfit",
  temperatureC = null,
  weatherCondition = "clear",
  budget = null,
  selectedItemId = null,
  wardrobeOnly = false,
}) {
  if (!Array.isArray(closetItems)) {
    throw new Error(
      "Invalid wardrobe data."
    );
  }

  if (!closetItems.length) {
    throw new Error(
      "Your closet is empty. Upload some clothes first."
    );
  }


  /* -------------------------------------------------------
     Prepare the user's CURRENT dynamic wardrobe.

     The database is never modified here.
     ------------------------------------------------------- */

  const wardrobe =
    prepareWardrobe(
      closetItems
    );


  /* -------------------------------------------------------
     Resolve the exact selected wardrobe item.

     Priority:

     1. Explicit selectedItemId from frontend
     2. Item identified from natural-language message
     ------------------------------------------------------- */

  let selectedItem = null;

  if (selectedItemId) {
    selectedItem =
      closetItems.find(
        (item) =>
          String(item.id) ===
          String(selectedItemId)
      ) || null;
  }

  if (!selectedItem && message) {
    selectedItem =
      findSelectedWardrobeItem(
        closetItems,
        message
      );
  }


  /* -------------------------------------------------------
     Build request context.

     Gemini receives this context together with the actual
     wardrobe.
     ------------------------------------------------------- */

  const context =
    buildStylistContext({
      message,
      occasion,
      style,
      budget,
      selectedItem,
      wardrobeOnly,
    });


  /* -------------------------------------------------------
     GEMINI IS NOW THE STYLIST REASONING AUTHORITY

     Gemini decides:

     - what the user wants
     - which actual wardrobe item IDs should be used
     - whether the selected item belongs in the outfit
     - whether the outfit is complete
     - whether something is genuinely missing
     - what missing item should be searched for later

     IMPORTANT:

     We DO NOT run determineRequiredRoles()
     or analyzeMissingItems() here.

     Those old functions remain above for compatibility,
     but they are NOT allowed to decide missing items.
     ------------------------------------------------------- */

  let geminiResult;

  try {
    geminiResult =
  await generateGeminiStylistResponse({
    message:
      context.message,

    closet:
      wardrobe,

    selectedItem:
      context.selectedItem,

    profile:
      profile,

    conversation:
      conversation,

    occasion:
      context.occasion,

    style:
      context.style,

    temperatureC,

    weatherCondition,
  });
  } catch (error) {
    console.error(
      "\n===== GEMINI STYLIST ERROR ====="
    );

    console.error(
      error?.response?.data ||
        error?.message ||
        error
    );

    throw new Error(
      "The AI stylist is temporarily unavailable. Please try again."
    );
  }


  console.log(
    "\n===== GEMINI STYLIST RESULT ====="
  );

  console.log(
    JSON.stringify(
      geminiResult,
      null,
      2
    )
  );


  /* -------------------------------------------------------
     Validate Gemini's response.

     Gemini may reason about the wardrobe, but it must NEVER
     be allowed to invent database items.

     Only IDs that exist in the CURRENT user's closet are
     accepted into the final outfit.
     ------------------------------------------------------- */

  const geminiOutfit =
    geminiResult?.outfit || {};

  let requestedItemIds = [];

  if (
    Array.isArray(
      geminiOutfit.itemIds
    )
  ) {
    requestedItemIds =
      geminiOutfit.itemIds;
  } else if (
    Array.isArray(
      geminiOutfit.items
    )
  ) {
    requestedItemIds =
      geminiOutfit.items
        .map(
          (item) =>
            item?.id
        )
        .filter(Boolean);
  }


  const validOutfitItems =
    requestedItemIds
      .map((itemId) =>
        closetItems.find(
          (item) =>
            String(item.id) ===
            String(itemId)
        )
      )
      .filter(Boolean);


  /* -------------------------------------------------------
     Preserve the exact selected item.

     Even though Gemini receives the selected item, this final
     validation guarantees that a frontend-selected wardrobe
     item cannot silently disappear.
     ------------------------------------------------------- */

  let outfitItems =
    ensureSelectedItem(
      validOutfitItems,
      selectedItem
    );


      if (!outfitItems.length) {
    throw new Error(
      "The AI stylist could not select valid items from your wardrobe."
    );
  }


  /* -------------------------------------------------------
     V13 OUTFIT SCORING

     IMPORTANT:
     - Gemini remains responsible for selecting the outfit.
     - V13 does NOT select wardrobe items.
     - V13 does NOT determine missing items.
     - V13 does NOT trigger shopping.
     - V13 only scores the exact outfit Gemini selected.
     ------------------------------------------------------- */

  let v13Result = null;

  try {
    const v13Outfit = {
      dress: null,
      top: null,
      bottom: null,
      footwear: null,
      accessory: null,
    };

    for (const item of outfitItems) {
      const wardrobeRole =
        getWardrobeRole(item);

      if (
        Object.prototype.hasOwnProperty.call(
          v13Outfit,
          wardrobeRole
        )
      ) {
        v13Outfit[wardrobeRole] = item;
      }
    }

    const hasScorableItem =
      Object.values(v13Outfit)
        .some(Boolean);

    if (hasScorableItem) {
      v13Result =
        await scoreV13Outfit({
          outfit: v13Outfit,
          bodyType:
            profile?.bodyType || null,
          undertone:
            profile?.undertone || null,
          style,
          occasion,
          requestedItem: role,
          selectedItem,
        });
    }
  } catch (error) {
    console.error(
      "V13 outfit scoring failed:",
      error?.message || error
    );

    /*
     * V13 is an enrichment layer.
     * If it fails, the existing Gemini
     * recommendation continues normally.
     */
    v13Result = null;
  }


  /* -------------------------------------------------------
     GEMINI MISSING-ITEM NORMALIZATION

  

     Gemini is the SOURCE OF TRUTH for missing-item detection.

     We do NOT generate a missing category here.

     We simply normalize the information Gemini already
     decided so the existing frontend can display it.
     ------------------------------------------------------- */

  const rawGeminiMissingItems =
    Array.isArray(
      geminiResult?.missingItems
    )
      ? geminiResult.missingItems
      : Array.isArray(
          geminiOutfit.missingItems
        )
        ? geminiOutfit.missingItems
        : [];


  const missingItems =
    rawGeminiMissingItems
      .filter(Boolean)
      .map((item) => {
        const name =
          item.name ||
          item.title ||
          item.articleType ||
          item.category ||
          "Requested item";

const query =
  item.searchQuery ||
  [
    item.name,
    item.articleType,
    item.category,
    item.color,
    item.style,
    item.occasion,
  ]
    .filter(Boolean)
    .join(" ");

        return {
          ...item,

          title:
            name,

          reason:
            item.reason ||
            `This item was identified by the AI stylist as needed for the requested outfit.`,

          query:
            query ||
            name,

          shoppingRequired:
            !context.wardrobeOnly,
        };
      });


  /* -------------------------------------------------------
     Shopping is downstream of Gemini.

     If Gemini says nothing is missing:
        shoppingRequired = false

     If Gemini identifies one or more missing items:
        shoppingRequired = true unless the user explicitly
        requested wardrobe-only styling.
     ------------------------------------------------------- */

  const shoppingRequired =
    missingItems.length > 0 &&
    !context.wardrobeOnly;
    let shoppingResults = [];

if (
  shoppingRequired &&
  missingItems.length > 0
) {
shoppingResults = await searchMissingItems({
  missingItems: missingItems.map(
    (item) => ({
      ...item,

      budget:
        context.budget,

      occasion:
        context.occasion,

      style:
        context.style,

      profile,
    })
  ),
});
}


  /* -------------------------------------------------------
     Final explanation.

     Prefer Gemini's own explanation because it reflects the
     reasoning that produced the outfit.
     ------------------------------------------------------- */

  const explanation =
    geminiOutfit.explanation ||
    geminiResult?.message ||
    (
      missingItems.length === 0
        ? "I created an outfit using suitable pieces from your wardrobe."
        : "I created the outfit from your wardrobe and identified the items the AI stylist considers missing."
    );


  /* -------------------------------------------------------
     FINAL RESPONSE

     IMPORTANT:

     outfit.items
       = ONLY real closet records

     missingItems
       = ONLY Gemini's missing-item decisions

     shoppingRequired
       = derived from Gemini's missingItems

     No fixed clothing category is introduced here.
     ------------------------------------------------------- */

  return {
    success: true,

    message:
      geminiResult?.message ||
      (
        missingItems.length > 0
          ? "I've created your outfit and identified what the AI stylist considers missing."
          : "I've created a complete outfit from your wardrobe."
      ),

    intent:
      geminiResult?.intent || {
        type: "style_outfit",
      },

    context: {
      ...context,

      selectedItemId:
        selectedItem?.id ||
        null,
    },

        outfit: {
      ...geminiOutfit,

      items:
        outfitItems,

      v13Score:
        v13Result?.outfit?.v13_score ??
        null,

      v13Breakdown:
        v13Result?.outfit?.v13_breakdown ??
        null,
        
      itemIds:
        outfitItems.map(
          (item) =>
            item.id
        ),

      missingItems,

      shoppingRequired,

      shoppingResults,

      explanation,
    },
  };
}


/* =========================================================
   CHAT-FRIENDLY ALIAS

   The controller can use either name.
   ========================================================= */

export const buildStylistRecommendation =
  generateStylistRecommendation;