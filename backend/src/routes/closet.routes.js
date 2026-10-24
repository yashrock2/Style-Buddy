import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";

import {
  getClosetItems,
  getClosetItem,
  uploadClosetItem,
  updateClosetItem,
  deleteClosetItem,
} from "../controllers/closet.controller.js";

import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const filename = `${req.userId}-${Date.now()}-${crypto.randomUUID()}${extension}`;

    cb(null, filename);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG and WEBP images are allowed.")
      );
    }

    cb(null, true);
  },
});

router.get("/", requireAuth, getClosetItems);

router.get("/:id", requireAuth, getClosetItem);

router.post(
  "/",
  requireAuth,
  upload.single("image"),
  uploadClosetItem
);

router.put("/:id", requireAuth, updateClosetItem);

router.delete("/:id", requireAuth, deleteClosetItem);

export default router;