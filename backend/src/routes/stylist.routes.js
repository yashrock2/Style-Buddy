import express from "express";

import {
  recommendOutfit,
  chatWithStylist,
} from "../controllers/stylist.controller.js";

import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/recommend",
  requireAuth,
  recommendOutfit
);

router.post(
  "/chat",
  requireAuth,
  chatWithStylist
);

export default router;