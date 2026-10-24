import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Footprints,
  Shirt,
  ExternalLink,
  AlertCircle
} from "lucide-react";

import { services } from "../api";

export default function Shop() {
  const [data, setData] = useState(null);
  const [outfitRecommendations, setOutfitRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     FRIENDLY ROLE NAME
  ===================================================== */

  const roleName = (role) => {
    const names = {
      tops: "Tops",
      bottoms: "Bottoms",
      footwear: "Footwear",
      dresses: "Dresses",
      accessories: "Accessories"
    };

    return (
      names[role] ||
      String(role || "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  /* =====================================================
     ROLE ICON
  ===================================================== */

  const roleIcon = (role) => {
    if (role === "footwear") {
      return <Footprints size={21} />;
    }

    if (
      role === "tops" ||
      role === "bottoms" ||
      role === "dresses"
    ) {
      return <Shirt size={21} />;
    }

    return <ShoppingBag size={21} />;
  };

  /* =====================================================
     IMAGE URL
  ===================================================== */

  const getImageUrl = (item) => {
    const image =
      item?.imageUrl ||
      item?.image ||
      "";

    if (!image) {
      return "";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `http://localhost:5000${image}`;
  };

  /* =====================================================
     ITEM NAME
  ===================================================== */

  const getItemName = (item) => {
    return (
      item?.articleType ||
      item?.article_type ||
      item?.subcategory ||
      item?.category ||
      "Clothing"
    );
  };

  /* =====================================================
     ITEM COLOR
  ===================================================== */

  const getItemColor = (item) => {
    return (
      item?.color ||
      item?.details?.ai?.color?.value ||
      "Unknown color"
    );
  };

  /* =====================================================
     AMAZON SEARCH
  ===================================================== */

  const getAmazonUrl = (product) => {
    const query = [
      product?.color,
      product?.article_type,
      product?.subcategory,
      product?.name
    ]
      .filter(Boolean)
      .join(" ");

    return `https://www.amazon.in/s?k=${encodeURIComponent(
      query || "fashion"
    )}`;
  };

  /* =====================================================
     FLIPKART SEARCH
  ===================================================== */

  const getFlipkartUrl = (product) => {
    const query = [
      product?.color,
      product?.article_type,
      product?.subcategory,
      product?.name
    ]
      .filter(Boolean)
      .join(" ");

    return `https://www.flipkart.com/search?q=${encodeURIComponent(
      query || "fashion"
    )}`;
  };

  /* =====================================================
     CHECK IF ITEM IS FOOTWEAR
  ===================================================== */

  const isFootwear = (item) => {
    const values = [
      item?.category,
      item?.articleType,
      item?.article_type,
      item?.subcategory,
      item?.details?.ai?.category?.value,
      item?.details?.ai?.articleType?.value
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      values.includes("footwear") ||
      values.includes("shoe") ||
      values.includes("sneaker") ||
      values.includes("loafer") ||
      values.includes("boot") ||
      values.includes("sandal") ||
      values.includes("flats") ||
      values.includes("heels")
    );
  };

  /* =====================================================
     PRODUCT UNIQUE KEY

     Used so the same exact product is not displayed
     for every outfit when alternatives are available.
  ===================================================== */

  const getProductKey = (product) => {
    return String(
      product?.id ||
      product?.name ||
      `${product?.color}-${product?.article_type}-${product?.subcategory}`
    ).toLowerCase();
  };

  /* =====================================================
     LOAD RECOMMENDATIONS
  ===================================================== */

  async function loadRecommendations() {
    try {
      setLoading(true);
      setProductsLoading(true);
      setError("");

      /*
       * First get the AI wardrobe analysis.
       */
      const response =
        await services.shopping.getRecommendations();

      console.log(
        "Shop the Look recommendations:",
        response
      );

      setData(response);

      /*
       * Get ALL outfit candidates generated from
       * the user's own wardrobe.
       */
      const candidates =
        response?.outfitCandidates || [];

      /*
       * Keep multiple looks.
       *
       * Maximum 10 looks.
       */
      const looks =
        candidates.slice(0, 10);

      /*
       * Keep track of products already used.
       *
       * This prevents:
       *
       * LOOK 1 → same shoe
       * LOOK 2 → same shoe
       * LOOK 3 → same shoe
       *
       * when other suitable products are available.
       */
      const usedProducts = new Set();

      /*
       * Generate shopping recommendation
       * independently for every outfit.
       */
      const generatedLooks =
        await Promise.all(
          looks.map(
            async (candidate, index) => {
              const items =
                Array.isArray(candidate?.items)
                  ? candidate.items
                  : [];

              /*
               * Determine missing category.
               *
               * Footwear is intentionally handled
               * INSIDE the outfit card.
               */
              const hasFootwear =
                items.some(isFootwear);

              let missingRole = null;

              if (!hasFootwear) {
                missingRole = "footwear";
              } else {
                missingRole =
                  response?.recommendationFocus ||
                  response?.missingRoles?.[0] ||
                  null;
              }

              /*
               * Get products specifically for
               * THIS outfit.
               */
              let products = [];

              if (missingRole) {
                try {
                  const productResponse =
                    await services.product.getWardrobeMatchedProducts(
                      items,
                      missingRole,
                      12
                    );

                  products =
                    Array.isArray(
                      productResponse?.products
                    )
                      ? productResponse.products
                      : [];

                  console.log(
                    `LOOK ${index + 1} PRODUCTS:`,
                    productResponse
                  );
                } catch (productError) {
                  console.error(
                    `Product matching failed for Look ${
                      index + 1
                    }:`,
                    productError
                  );
                }
              }

              /*
               * Find the best product that has not
               * already been used by another look.
               *
               * The backend has already ranked these
               * products by outfit compatibility.
               */
              let bestProduct = null;

              for (const product of products) {
                const productKey =
                  getProductKey(product);

                if (
                  !usedProducts.has(
                    productKey
                  )
                ) {
                  bestProduct = product;
                  usedProducts.add(
                    productKey
                  );
                  break;
                }
              }

              /*
               * If every returned product was already
               * used, fall back to the backend's best
               * product rather than showing nothing.
               */
              if (
                !bestProduct &&
                products.length
              ) {
                bestProduct = products[0];
              }

              return {
                ...candidate,

                lookNumber:
                  index + 1,

                items,

                missingRole,

                missingLabel:
                  missingRole
                    ? roleName(
                        missingRole
                      )
                    : null,

                products,

                bestProduct
              };
            }
          )
        );

      setOutfitRecommendations(
        generatedLooks
      );
    } catch (err) {
      console.error(
        "Shop the Look error:",
        err
      );

      setError(
        err?.message ||
          "Unable to generate shopping recommendations."
      );
    } finally {
      setLoading(false);
      setProductsLoading(false);
    }
  }

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadRecommendations();
  }, []);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="page">
        <div className="state">
          <RefreshCw
            size={25}
            className="spin"
          />

          <span>
            StyleBuddy is analyzing your wardrobe...
          </span>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <div className="eyebrow">
              AI SHOPPING ASSISTANT
            </div>

            <h1>
              Shop the Look.
            </h1>

            <p>
              We couldn't generate your
              wardrobe recommendations.
            </p>
          </div>

          <button
            className="btn btn-outline"
            onClick={loadRecommendations}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>

        <div className="state error">
          <AlertCircle size={24} />

          <strong>
            {error}
          </strong>
        </div>
      </div>
    );
  }

  const wardrobe =
    data?.wardrobe || {};

  const missingRoles =
    data?.missingRoles || [];

  const limitedRoles =
    data?.limitedRoles || [];

  /* =====================================================
     WARDROBE GAP CARDS
  ===================================================== */

  const gapCards = [
    ...missingRoles.map((role) => ({
      role,
      status: "MISSING",
      priority: 100
    })),

    ...limitedRoles.map((item) => ({
      role: item.role,
      status: "LIMITED",
      priority: item.priority
    }))
  ];

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="page">

      {/* ================================================
          HEADER
      ================================================= */}

      <div className="page-header">
        <div>
          <div className="eyebrow">
            AI SHOPPING ASSISTANT
          </div>

          <h1>
            Shop the Look.
          </h1>

          <p>
            StyleBuddy looks at what you already
            own and identifies pieces that can
            complete your wardrobe.
          </p>
        </div>

        <button
          className="btn btn-outline"
          onClick={loadRecommendations}
          disabled={productsLoading}
        >
          <RefreshCw
            size={16}
            className={
              productsLoading
                ? "spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ================================================
          WARDROBE COUNTS
      ================================================= */}

      <div className="shop-stats">

        <div className="shop-stat">
          <strong>
            {wardrobe.totalItems || 0}
          </strong>

          <span>
            Total Items
          </span>
        </div>

        <div className="shop-stat">
          <strong>
            {wardrobe.tops || 0}
          </strong>

          <span>
            Tops
          </span>
        </div>

        <div className="shop-stat">
          <strong>
            {wardrobe.bottoms || 0}
          </strong>

          <span>
            Bottoms
          </span>
        </div>

        <div className="shop-stat">
          <strong>
            {wardrobe.footwear || 0}
          </strong>

          <span>
            Footwear
          </span>
        </div>

        <div className="shop-stat">
          <strong>
            {wardrobe.dresses || 0}
          </strong>

          <span>
            Dresses
          </span>
        </div>

        <div className="shop-stat">
          <strong>
            {wardrobe.accessories || 0}
          </strong>

          <span>
            Accessories
          </span>
        </div>

      </div>

      {/* ================================================
          WARDROBE GAPS
      ================================================= */}

      {gapCards.length > 0 && (
        <section className="shop-gap-section">

          <div className="eyebrow">
            COMPLETE YOUR WARDROBE
          </div>

          <h2>
            Pieces you may be missing
          </h2>

          <p className="muted">
            These categories can help StyleBuddy
            create more complete outfit combinations
            from your wardrobe.
          </p>

          <div className="shop-gap-grid">

            {gapCards.map(
              (item, index) => (
                <article
                  className="shop-gap-card"
                  key={`${item.role}-${index}`}
                >

                  <div className="shop-gap-top">

                    <div className="shop-gap-icon">
                      {roleIcon(
                        item.role
                      )}
                    </div>

                    <span className="shop-gap-status">
                      {item.status}
                    </span>

                  </div>

                  <h3>
                    {roleName(
                      item.role
                    )}
                  </h3>

                  <p>
                    {item.status ===
                    "MISSING"
                      ? `You don't currently have ${roleName(
                          item.role
                        ).toLowerCase()} stored in your wardrobe.`
                      : `Your wardrobe has limited ${roleName(
                          item.role
                        ).toLowerCase()} variety.`}
                  </p>

                  {item.priority && (
                    <small className="muted">
                      Recommendation priority{" "}
                      {item.priority}
                    </small>
                  )}

                </article>
              )
            )}

          </div>
        </section>
      )}

      {/* ================================================
          OUTFIT RECOMMENDATIONS
      ================================================= */}

      <section className="shop-looks-section">

        <div className="eyebrow">
          YOUR WARDROBE
        </div>

        <h2>
          Looks StyleBuddy found
        </h2>

        <p className="muted">
          These combinations use clothes you
          already own. For each look, StyleBuddy
          identifies what is missing and finds the
          best matching product.
        </p>

        {outfitRecommendations.length === 0 ? (

          <div className="empty-state">

            <ShoppingBag
              size={28}
            />

            <h3>
              No complete combinations yet
            </h3>

            <p>
              Add more clothing items to your
              wardrobe so StyleBuddy can create
              more looks.
            </p>

          </div>

        ) : (

          <div className="shop-look-grid">

            {outfitRecommendations.map(
              (look) => {

                const bestProduct =
                  look.bestProduct;

                return (
                  <article
                    className="shop-look-card"
                    key={
                      `look-${look.lookNumber}`
                    }
                  >

                    {/* =================================
                        LOOK HEADER
                    ================================== */}

                    <div className="shop-look-header">

                      <span>
                        LOOK{" "}
                        {look.lookNumber}
                      </span>

                      <strong>
                        {look.score || 0}/20
                      </strong>

                    </div>

                    {/* =================================
                        YOUR EXISTING CLOTHES
                    ================================== */}

                    <div className="shop-look-items">

                      {look.items.map(
                        (item, itemIndex) => {

                          const image =
                            getImageUrl(
                              item
                            );

                          return (
                            <div
                              className="shop-look-item"
                              key={
                                item?.id ||
                                itemIndex
                              }
                            >

                              {image ? (
                                <img
                                  src={image}
                                  alt={getItemName(
                                    item
                                  )}
                                />
                              ) : (
                                <div className="shop-look-placeholder">
                                  <Shirt
                                    size={20}
                                  />
                                </div>
                              )}

                              <div>

                                <strong>
                                  {getItemName(
                                    item
                                  )}
                                </strong>

                                <span>
                                  {getItemColor(
                                    item
                                  )}
                                </span>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                    {/* =================================
                        MISSING ITEM
                    ================================== */}

                    {look.missingRole && (
                      <div className="shop-look-missing">

                        <div className="shop-look-missing-icon">
                          <AlertCircle
                            size={17}
                          />
                        </div>

                        <div>

                          <strong>
                            Missing{" "}
                            {look.missingLabel}
                          </strong>

                          <span>
                            This look can be completed
                            with matching{" "}
                            {look.missingLabel?.toLowerCase()}.
                          </span>

                        </div>

                      </div>
                    )}

                    {/* =================================
                        BEST MATCHED PRODUCT
                    ================================== */}

                    {bestProduct && (
                      <div className="shop-look-product">

                        <div className="shop-look-product-heading">

                          <div>

                            <div className="eyebrow">
                              BEST MATCH
                            </div>

                            <strong>
                              Complete this look
                            </strong>

                          </div>

                          <Sparkles
                            size={19}
                          />

                        </div>

                        <div className="shop-look-product-info">

                          <div className="shop-product-placeholder">
                            <ShoppingBag
                              size={25}
                            />
                          </div>

                          <div className="shop-product-details">

                            <strong>
                              {bestProduct.name ||
                                "Matching Fashion Product"}
                            </strong>

                            <span>
                              {bestProduct.color ||
                                "Fashion"}{" "}
                              ·{" "}
                              {bestProduct.article_type ||
                                bestProduct.subcategory ||
                                "Fashion"}
                            </span>

                            {bestProduct.fabric && (
                              <small>
                                {bestProduct.fabric}
                              </small>
                            )}

                          </div>

                        </div>

                        {/* ============================
                            SHOPPING BUTTONS
                        ============================= */}

                        <div className="shop-product-buttons">

                          <a
                            href={getAmazonUrl(
                              bestProduct
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline"
                          >
                            Amazon

                            <ExternalLink
                              size={14}
                            />
                          </a>

                          <a
                            href={getFlipkartUrl(
                              bestProduct
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline"
                          >
                            Flipkart

                            <ExternalLink
                              size={14}
                            />
                          </a>

                        </div>

                      </div>
                    )}

                    {/* =================================
                        NO PRODUCT
                    ================================== */}

                    {!bestProduct &&
                      look.missingRole && (
                        <div className="shop-look-no-product">

                          <ShoppingBag
                            size={17}
                          />

                          <span>
                            No matching shopping
                            product was found for
                            this look yet.
                          </span>

                        </div>
                      )}

                  </article>
                );
              }
            )}

          </div>
        )}

      </section>

    </div>
  );
}