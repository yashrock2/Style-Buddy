import { prisma } from "../config/prisma.js";

import {
  analyzeWardrobe,
  buildShoppingQuery
} from "../services/wardrobe-matching.service.js";

export async function getShoppingRecommendations(req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    /*
     * Get only the currently logged-in user's wardrobe.
     */
    const closetItems = await prisma.closetItem.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    /*
     * Analyze the wardrobe using our matching engine.
     */
    const wardrobe = analyzeWardrobe(
      closetItems
    );

    /*
     * Build shopping recommendations.
     *
     * For a missing category, use the user's
     * wardrobe to create the shopping query.
     *
     * For a limited category such as footwear,
     * use the actual outfit combinations that
     * need that category.
     */
    const recommendations = [];

    /*
     * 1. Completely missing categories
     */
    for (const role of wardrobe.missingRoles) {
      recommendations.push({
        role,
        status: "missing",
        priority: 100,
        query: buildShoppingQuery(
          closetItems,
          role
        )
      });
    }

    /*
     * 2. Limited categories
     *
     * Example:
     *
     * 8 tops
     * 4 bottoms
     * 1 shoe
     *
     * The engine identifies footwear as LIMITED.
     *
     * We then build a query using the actual
     * outfit combinations from the wardrobe.
     */
    for (const target of wardrobe.shoppingTargets || []) {
      if (
        target.role === "footwear" &&
        target.outfits?.length
      ) {
        const bestOutfit =
          target.outfits[0];

        recommendations.push({
          role: target.role,

          status: target.status,

          priority: target.priority,

          reason: target.reason,

          outfitCount:
            target.outfitCount || 0,

          query: buildShoppingQuery(
            bestOutfit.items || [],
            target.role
          )
        });
      } else {
        recommendations.push({
          role: target.role,

          status: target.status,

          priority: target.priority,

          reason: target.reason,

          query: buildShoppingQuery(
            closetItems,
            target.role
          )
        });
      }
    }

    /*
     * Remove duplicate role recommendations.
     *
     * If a role is both missing/limited because
     * of future engine changes, keep the highest
     * priority recommendation.
     */
    const uniqueRecommendations = [];

    const seenRoles = new Set();

    const sortedRecommendations =
      recommendations.sort(
        (a, b) =>
          (b.priority || 0) -
          (a.priority || 0)
      );

    for (const recommendation of sortedRecommendations) {
      if (
        !seenRoles.has(
          recommendation.role
        )
      ) {
        seenRoles.add(
          recommendation.role
        );

        uniqueRecommendations.push(
          recommendation
        );
      }
    }

    /*
     * Return wardrobe information to the frontend.
     */
    return res.json({
      success: true,

      wardrobe: {
        totalItems:
          wardrobe.wardrobeSummary.totalItems,

        tops:
          wardrobe.wardrobeSummary.tops,

        bottoms:
          wardrobe.wardrobeSummary.bottoms,

        footwear:
          wardrobe.wardrobeSummary.footwear,

        dresses:
          wardrobe.wardrobeSummary.dresses,

        accessories:
          wardrobe.wardrobeSummary.accessories,

        other:
          wardrobe.wardrobeSummary.other
      },

      /*
       * Completely missing categories.
       */
      missingRoles:
        wardrobe.missingRoles,

      /*
       * Categories where the user has items,
       * but the variety is limited.
       */
      limitedRoles:
        wardrobe.limitedRoles || [],

      /*
       * Categories that could add more variety.
       */
      opportunityRoles:
        wardrobe.opportunityRoles || [],

      /*
       * Detailed AI wardrobe-gap information.
       */
      wardrobeGaps:
        wardrobe.wardrobeGaps || [],

      /*
       * Most important shopping category.
       */
      recommendationFocus:
        wardrobe.recommendationFocus,

      /*
       * Outfit combinations created from the
       * user's own wardrobe.
       */
      outfitCandidates:
        wardrobe.outfitCandidates,

      /*
       * Specific shopping targets.
       */
      shoppingTargets:
        wardrobe.shoppingTargets || [],

      /*
       * Search queries that will later be sent
       * to Amazon / Flipkart / other providers.
       */
      recommendations:
        uniqueRecommendations
    });
  } catch (error) {
    console.error(
      "Shopping recommendations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate shopping recommendations."
    });
  }
}