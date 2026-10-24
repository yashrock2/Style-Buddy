import { Router } from "express";

import {
  getProductsController,
  getProductController,
  getWardrobeMatchedProductsController
} from "../controllers/products.controller.js";

import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  getProductsController
);

/*
 * Find products that match a specific
 * outfit from the user's wardrobe.
 */
router.post(
  "/wardrobe-match",
  requireAuth,
  getWardrobeMatchedProductsController
);

router.get(
  "/:id",
  requireAuth,
  getProductController
);

export default router;