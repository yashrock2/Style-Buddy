const ROLE_MAP = {
  tops: [
    "tops",
    "topwear",
    "tshirt",
    "tshirts",
    "t shirt",
    "t shirts",
    "shirt",
    "shirts",
    "kurta",
    "kurtas"
  ],

  bottoms: [
    "bottoms",
    "bottomwear",
    "jeans",
    "trousers",
    "pants",
    "shorts"
  ],

  footwear: [
    "footwear",
    "footwears",
    "shoe",
    "shoes",
    "sneaker",
    "sneakers",
    "flats",
    "heels",
    "boots",
    "sandals",
    "loafers",
    "slippers"
  ],

  dresses: [
    "dress",
    "dresses"
  ],

  accessories: [
    "accessory",
    "accessories",
    "bags",
    "handbags",
    "backpacks",
    "belts",
    "watches"
  ]
};

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function getItemType(item) {
  const values = [
    item?.category,
    item?.articleType,
    item?.article_type,
    item?.subcategory,
    item?.details?.ai?.category?.value,
    item?.details?.ai?.articleType?.value
  ]
    .filter(Boolean)
    .map(normalize);

  for (const [role, names] of Object.entries(ROLE_MAP)) {
    if (
      values.some((value) =>
        names.some((name) => {
          const normalizedName = normalize(name);

          return (
            value === normalizedName ||
            value.includes(normalizedName)
          );
        })
      )
    ) {
      return role;
    }
  }

  return "other";
}

function getColor(item) {
  return normalize(
    item?.color ||
    item?.details?.ai?.color?.value
  );
}

function getPattern(item) {
  return normalize(
    item?.pattern ||
    item?.details?.ai?.pattern?.value
  );
}

function getFabric(item) {
  return normalize(
    item?.fabric ||
    item?.details?.ai?.fabric?.value
  );
}

function getArticleType(item) {
  return normalize(
    item?.articleType ||
    item?.article_type ||
    item?.details?.ai?.articleType?.value
  );
}

/* ---------------------------------------------------
   COLOR COMPATIBILITY
--------------------------------------------------- */

function colorCompatibility(colorA, colorB) {
  if (!colorA || !colorB) {
    return 0;
  }

  if (colorA === colorB) {
    return 10;
  }

  const neutralColors = [
    "black",
    "white",
    "grey",
    "gray",
    "beige",
    "cream",
    "brown",
    "navy"
  ];

  if (
    neutralColors.some((color) =>
      colorA.includes(color)
    ) ||
    neutralColors.some((color) =>
      colorB.includes(color)
    )
  ) {
    return 9;
  }

  const combinations = [
    ["blue", "white"],
    ["blue", "beige"],
    ["blue", "grey"],
    ["blue", "gray"],
    ["blue", "brown"],
    ["blue", "black"],
    ["green", "white"],
    ["green", "beige"],
    ["green", "black"],
    ["red", "black"],
    ["red", "white"],
    ["pink", "white"],
    ["pink", "grey"],
    ["pink", "gray"],
    ["purple", "white"],
    ["purple", "black"],
    ["yellow", "blue"],
    ["orange", "blue"]
  ];

  if (
    combinations.some(
      ([a, b]) =>
        (colorA.includes(a) &&
          colorB.includes(b)) ||
        (colorA.includes(b) &&
          colorB.includes(a))
    )
  ) {
    return 8;
  }

  return 5;
}

/* ---------------------------------------------------
   PAIR SCORING
--------------------------------------------------- */

function scorePair(itemA, itemB) {
  const colorScore = colorCompatibility(
    getColor(itemA),
    getColor(itemB)
  );

  let score = colorScore;

  const patternA = getPattern(itemA);
  const patternB = getPattern(itemB);

  if (patternA && patternB) {
    if (
      patternA === "plain" ||
      patternB === "plain"
    ) {
      score += 4;
    } else {
      score += 2;
    }
  }

  const fabricA = getFabric(itemA);
  const fabricB = getFabric(itemB);

  if (
    fabricA &&
    fabricB &&
    fabricA === fabricB
  ) {
    score += 2;
  }

  return Math.min(score, 20);
}

/* ---------------------------------------------------
   WARDROBE ROLE ANALYSIS
--------------------------------------------------- */

function classifyWardrobe(items) {
  const roles = {
    tops: [],
    bottoms: [],
    footwear: [],
    dresses: [],
    accessories: []
  };

  const other = [];

  items.forEach((item) => {
    const role = getItemType(item);

    if (roles[role]) {
      roles[role].push(item);
    } else {
      other.push(item);
    }
  });

  return {
    roles,
    other
  };
}

/* ---------------------------------------------------
   DETERMINE WARDROBE GAPS
---------------------------------------------------

   Important difference:

   0 shoes
      → Missing footwear

   1 shoe with many tops/bottoms
      → Limited footwear

   5 shoes with many tops/bottoms
      → Healthy footwear variety
*/

function analyzeWardrobeGaps(roles) {
  const counts = {
    tops: roles.tops.length,
    bottoms: roles.bottoms.length,
    footwear: roles.footwear.length,
    dresses: roles.dresses.length,
    accessories: roles.accessories.length
  };

  const totalCore =
    counts.tops +
    counts.bottoms +
    counts.dresses;

  const gaps = [];

  /* ---------------- TOPS ---------------- */

  if (counts.tops === 0) {
    gaps.push({
      role: "tops",
      status: "missing",
      priority: 100,
      reason:
        "You don't currently have any tops in your wardrobe."
    });
  } else if (
    counts.tops === 1 &&
    totalCore >= 4
  ) {
    gaps.push({
      role: "tops",
      status: "limited",
      priority: 70,
      reason:
        "Your wardrobe has limited top variety."
    });
  }

  /* ---------------- BOTTOMS ---------------- */

  if (counts.bottoms === 0) {
    gaps.push({
      role: "bottoms",
      status: "missing",
      priority: 100,
      reason:
        "You don't currently have any bottoms in your wardrobe."
    });
  } else if (
    counts.bottoms === 1 &&
    totalCore >= 4
  ) {
    gaps.push({
      role: "bottoms",
      status: "limited",
      priority: 65,
      reason:
        "Your wardrobe has limited bottom variety."
    });
  }

  /* ---------------- FOOTWEAR ---------------- */

  if (counts.footwear === 0) {
    gaps.push({
      role: "footwear",
      status: "missing",
      priority: 100,
      reason:
        "You don't currently have footwear stored in your wardrobe."
    });
  } else if (
    counts.footwear === 1 &&
    totalCore >= 4
  ) {
    gaps.push({
      role: "footwear",
      status: "limited",
      priority: 95,
      reason:
        "You have only one footwear option compared with the number of outfits your wardrobe can create."
    });
  } else if (
    counts.footwear === 2 &&
    totalCore >= 8
  ) {
    gaps.push({
      role: "footwear",
      status: "limited",
      priority: 75,
      reason:
        "Your wardrobe has many clothing combinations but limited footwear variety."
    });
  }

  /* ---------------- DRESSES ---------------- */

  if (
    counts.dresses === 0 &&
    counts.tops > 0 &&
    counts.bottoms > 0
  ) {
    gaps.push({
      role: "dresses",
      status: "opportunity",
      priority: 35,
      reason:
        "A dress would add another outfit category to your wardrobe."
    });
  }

  /* ---------------- ACCESSORIES ---------------- */

  if (
    counts.accessories === 0 &&
    totalCore >= 5
  ) {
    gaps.push({
      role: "accessories",
      status: "opportunity",
      priority: 25,
      reason:
        "Accessories could add more variety to your existing outfits."
    });
  }

  return gaps.sort(
    (a, b) => b.priority - a.priority
  );
}

/* ---------------------------------------------------
   BUILD OUTFIT CANDIDATES
--------------------------------------------------- */

function buildOutfitCandidates(items) {
  const {
    roles
  } = classifyWardrobe(items);

  const candidates = [];

  /* TOP + BOTTOM */

  if (
    roles.tops.length &&
    roles.bottoms.length
  ) {
    for (const top of roles.tops) {
      for (const bottom of roles.bottoms) {
        const score = scorePair(
          top,
          bottom
        );

        candidates.push({
          type: "top-bottom",
          score,
          items: [top, bottom]
        });
      }
    }
  }

  /* DRESSES */

  if (roles.dresses.length) {
    for (const dress of roles.dresses) {
      candidates.push({
        type: "dress",
        score: 15,
        items: [dress]
      });
    }
  }

  return candidates
    .sort(
      (a, b) => b.score - a.score
    )
    .slice(0, 12);
}

/* ---------------------------------------------------
   FIND BEST FOOTWEAR FOR AN OUTFIT
--------------------------------------------------- */

function findBestExistingFootwear(
  footwear,
  outfitItems
) {
  if (!footwear.length) {
    return null;
  }

  const scored = footwear.map(
    (shoe) => {
      const total = outfitItems.reduce(
        (sum, item) =>
          sum +
          colorCompatibility(
            getColor(shoe),
            getColor(item)
          ),
        0
      );

      return {
        item: shoe,
        score: total
      };
    }
  );

  scored.sort(
    (a, b) => b.score - a.score
  );

  return scored[0] || null;
}

/* ---------------------------------------------------
   DETERMINE SHOPPING TARGETS
---------------------------------------------------

   This is the important part.

   Instead of simply saying:

   "You have shoes."

   we determine whether the existing shoes
   are sufficient for the wardrobe.
*/

function buildShoppingTargets(
  roles,
  outfitCandidates,
  gaps
) {
  const targets = [];

  const footwearGap = gaps.find(
    (gap) => gap.role === "footwear"
  );

  if (
    footwearGap &&
    outfitCandidates.length
  ) {
    const bestLooks =
      outfitCandidates.slice(0, 6);

    targets.push({
      role: "footwear",

      status: footwearGap.status,

      priority:
        footwearGap.priority,

      reason: footwearGap.reason,

      outfitCount:
        bestLooks.length,

      outfits: bestLooks.map(
        (candidate) => ({
          type: candidate.type,
          score: candidate.score,
          items: candidate.items
        })
      )
    });
  }

  const topGap = gaps.find(
    (gap) => gap.role === "tops"
  );

  if (
    topGap &&
    roles.bottoms.length
  ) {
    targets.push({
      role: "tops",
      status: topGap.status,
      priority: topGap.priority,
      reason: topGap.reason
    });
  }

  const bottomGap = gaps.find(
    (gap) => gap.role === "bottoms"
  );

  if (
    bottomGap &&
    roles.tops.length
  ) {
    targets.push({
      role: "bottoms",
      status: bottomGap.status,
      priority: bottomGap.priority,
      reason: bottomGap.reason
    });
  }

  return targets.sort(
    (a, b) =>
      b.priority - a.priority
  );
}

/* ---------------------------------------------------
   SHOPPING QUERY
--------------------------------------------------- */

export function buildShoppingQuery(
  outfitItems = [],
  missingRole
) {
  const colors = outfitItems
    .map(getColor)
    .filter(Boolean);

  const articles = outfitItems
    .map(getArticleType)
    .filter(Boolean);

  const uniqueColors = [
    ...new Set(colors)
  ];

  const uniqueArticles = [
    ...new Set(articles)
  ];

  const roleKeywords = {
    tops:
      "t shirt shirt top fashion",
    bottoms:
      "jeans trousers pants fashion",
    footwear:
      "shoes sneakers footwear fashion",
    dresses:
      "dress fashion",
    accessories:
      "fashion accessories"
  };

  const parts = [];

  if (uniqueColors.length) {
    parts.push(
      uniqueColors
        .slice(0, 2)
        .join(" ")
    );
  }

  if (uniqueArticles.length) {
    parts.push(
      uniqueArticles
        .slice(0, 2)
        .join(" ")
    );
  }

  parts.push(
    roleKeywords[missingRole] ||
    `${missingRole} fashion`
  );

  return parts.join(" ");
}

/* ---------------------------------------------------
   MAIN WARDROBE ANALYSIS
--------------------------------------------------- */

export function analyzeWardrobe(
  items = []
) {
  const safeItems =
    Array.isArray(items)
      ? items
      : [];

  const {
    roles,
    other
  } = classifyWardrobe(
    safeItems
  );

  const gaps =
    analyzeWardrobeGaps(
      roles
    );

  const outfitCandidates =
    buildOutfitCandidates(
      safeItems
    );

  const shoppingTargets =
    buildShoppingTargets(
      roles,
      outfitCandidates,
      gaps
    );

  /* -------------------------------------------------
     Add existing footwear information to each look
  ------------------------------------------------- */

  const enhancedOutfits =
    outfitCandidates.map(
      (candidate) => {
        const existingFootwear =
          findBestExistingFootwear(
            roles.footwear,
            candidate.items
          );

        return {
          ...candidate,

          existingFootwear:
            existingFootwear?.item ||
            null,

          existingFootwearScore:
            existingFootwear?.score ||
            0,

          footwearShoppingRecommended:
            gaps.some(
              (gap) =>
                gap.role ===
                "footwear"
            )
        };
      }
    );

  const recommendationFocus =
    gaps.length
      ? gaps[0].role
      : null;

  return {
    wardrobeSummary: {
      totalItems:
        safeItems.length,

      tops:
        roles.tops.length,

      bottoms:
        roles.bottoms.length,

      footwear:
        roles.footwear.length,

      dresses:
        roles.dresses.length,

      accessories:
        roles.accessories.length,

      other:
        other.length
    },

    wardrobeGaps: gaps,

    /*
      Keep missingRoles for compatibility
      with the existing controller/frontend.
    */
    missingRoles:
      gaps
        .filter(
          (gap) =>
            gap.status ===
            "missing"
        )
        .map(
          (gap) =>
            gap.role
        ),

    /*
      New field:
      categories where the user has
      something but could benefit from
      additional variety.
    */
    limitedRoles:
      gaps
        .filter(
          (gap) =>
            gap.status ===
            "limited"
        )
        .map(
          (gap) =>
            gap.role
        ),

    opportunityRoles:
      gaps
        .filter(
          (gap) =>
            gap.status ===
            "opportunity"
        )
        .map(
          (gap) =>
            gap.role
        ),

    outfitCandidates:
      enhancedOutfits,

    shoppingTargets,

    recommendationFocus
  };
}

/* ---------------------------------------------------
   SHOPPING PRODUCT SCORE
--------------------------------------------------- */

export function scoreShoppingItem(
  product,
  outfitItems = []
) {
  if (!product) {
    return 0;
  }

  const productColor =
    normalize(
      product.color
    );

  const productType =
    normalize(
      product.article_type ||
      product.articleType ||
      product.subcategory ||
      product.category
    );

  if (
    !outfitItems.length
  ) {
    return 0;
  }

  let totalColorScore = 0;

  for (const item of outfitItems) {
    const itemColor =
      getColor(item);

    if (productColor) {
      totalColorScore +=
        colorCompatibility(
          productColor,
          itemColor
        );
    }
  }

  const averageColorScore =
    totalColorScore /
    outfitItems.length;

  let typeScore = 0;

  if (productType) {
    typeScore = 5;
  }

  const rawScore =
    averageColorScore +
    typeScore;

  return Math.min(
    Math.round(
      (rawScore / 15) * 100
    ),
    99
  );
}