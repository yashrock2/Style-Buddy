import { Router } from "express";

import {
  getShoppingRecommendations
} from "../controllers/shopping.controller.js";

import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get(
  "/recommendations",
  requireAuth,
  getShoppingRecommendations
);

export default router;