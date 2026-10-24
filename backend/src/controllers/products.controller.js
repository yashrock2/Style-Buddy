import {
  getProducts,
  getProductById,
  getWardrobeMatchedProducts
} from "../services/products.service.js";

export async function getProductsController(
  req,
  res
) {
  try {
    const {
      search = "",
      limit = "100"
    } = req.query;

    const products =
      getProducts({
        search,
        limit: Math.min(
          Number(limit) || 100,
          500
        )
      });

    return res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load products."
    });
  }
}

export async function getProductController(
  req,
  res
) {
  try {
    const product =
      getProductById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found."
      });
    }

    return res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error(
      "Get product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load product."
    });
  }
}

/* =====================================================
   WARDROBE MATCHED PRODUCTS
===================================================== */

export async function getWardrobeMatchedProductsController(
  req,
  res
) {
  try {
    const {
      outfitItems = [],
      missingRole,
      limit = 12
    } = req.body || {};

    if (
      !missingRole
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing shopping category."
      });
    }

    const products =
      getWardrobeMatchedProducts({
        outfitItems,
        missingRole,
        limit: Math.min(
          Number(limit) || 12,
          50
        )
      });

    return res.json({
      success: true,
      role: missingRole,
      count:
        products.length,
      products
    });
  } catch (error) {
    console.error(
      "Wardrobe product matching error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to find wardrobe-matched products."
    });
  }
}