import express from "express";

import {
  register,
  verifyEmail,
  login,
  getMe,
  refresh,
  logout,
} from "../controllers/auth.controller.js";

import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);

router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", requireAuth, getMe);
export default router;