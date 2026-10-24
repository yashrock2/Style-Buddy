import fs from "fs";
import path from "path";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { analyzeClothingImage } from "../services/ai.service.js";

const uploadsDirectory = path.resolve("uploads");

function toPublicItem(item) {
  return {
    ...item,

    imageUrl: item.imageUrl
      ? item.imageUrl.startsWith("http")
        ? item.imageUrl
        : `http://localhost:${env.port}${item.imageUrl}`
      : null,
  };
}

export async function getClosetItems(req, res, next) {
  try {
    const items = await prisma.closetItem.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      items: items.map(toPublicItem),
    });
  } catch (error) {
    next(error);
  }
}

export async function getClosetItem(req, res, next) {
  try {
    const item = await prisma.closetItem.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      item: toPublicItem(item),
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadClosetItem(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image.",
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    /*
     * Send the uploaded image to the Python AI service.
     *
     * The Python service runs all 7 currently integrated models:
     *
     * 1. Category
     * 2. Subcategory / Article Type
     * 3. Color
     * 4. Pattern V2
     * 5. Fabric (temporary current exported model)
     * 6. Sleeve V2
     * 7. Neckline V2
     */
    const aiResult = await analyzeClothingImage(req.file.path);

    console.log("");
    console.log("========== STYLEBUDDY AI RESULT ==========");
    console.log(JSON.stringify(aiResult, null, 2));
    console.log("===========================================");
    console.log("");

    /*
     * Save both the clothing image and the complete AI analysis
     * to the user's permanent PostgreSQL closet.
     *
     * Pattern V2, Sleeve V2 and Neckline V2 are now verified
     * and are saved directly.
     *
     * Fabric remains explicitly marked as the temporary
     * current exported model in details.ai.
     */
    const item = await prisma.closetItem.create({
      data: {
        userId: req.userId,
        imageUrl,

        category:
          aiResult?.category?.value || null,

        articleType:
          aiResult?.articleType?.value || null,

        color:
          aiResult?.color?.value || null,

        pattern:
          aiResult?.pattern?.value || null,

        fabric:
          aiResult?.fabric?.value || null,

       sleeve:
  aiResult?.sleeve?.value || null,

neckline:
  aiResult?.neckline?.value || null,

length:
  aiResult?.length?.length || null,

        confidence:
          aiResult?.category?.confidence ?? null,

        details: {
          ai: {
            category: aiResult?.category || null,
            articleType: aiResult?.articleType || null,
            color: aiResult?.color || null,
            pattern: aiResult?.pattern || null,
            fabric: aiResult?.fabric || null,
            sleeve: aiResult?.sleeve || null,
            neckline: aiResult?.neckline || null,
            length: aiResult?.length || null,
            aiStatus: aiResult?.aiStatus || null,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      item: toPublicItem(item),
    });
  } catch (error) {
    console.error("Closet upload error:", error);

    /*
     * If something fails after Multer saved the image,
     * remove the uploaded file so we don't leave orphan files.
     */
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }

    next(error);
  }
}

export async function updateClosetItem(req, res, next) {
  try {
    const existingItem = await prisma.closetItem.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found.",
      });
    }

    const {
      category,
      articleType,
      color,
      pattern,
      fabric,
      sleeve,
      neckline,
      fit,
      length,
      details,
      confidence,
    } = req.body;

    const item = await prisma.closetItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        ...(category !== undefined && { category }),
        ...(articleType !== undefined && { articleType }),
        ...(color !== undefined && { color }),
        ...(pattern !== undefined && { pattern }),
        ...(fabric !== undefined && { fabric }),
        ...(sleeve !== undefined && { sleeve }),
        ...(neckline !== undefined && { neckline }),
        ...(fit !== undefined && { fit }),
        ...(length !== undefined && { length }),
        ...(details !== undefined && { details }),
        ...(confidence !== undefined && { confidence }),
      },
    });

    return res.status(200).json({
      success: true,
      item: toPublicItem(item),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteClosetItem(req, res, next) {
  try {
    const item = await prisma.closetItem.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found.",
      });
    }

    await prisma.closetItem.delete({
      where: {
        id: item.id,
      },
    });

    if (item.imageUrl) {
      const filename = path.basename(item.imageUrl);
      const imagePath = path.join(uploadsDirectory, filename);

      fs.unlink(imagePath, () => {});
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}