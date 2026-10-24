import { Router } from "express";
import {
  getSavedOutfits,
  saveOutfit,
  deleteSavedOutfit,
} from "../controllers/outfits.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getSavedOutfits);

router.post("/", requireAuth, saveOutfit);

router.delete("/:id", requireAuth, deleteSavedOutfit);

export default router;