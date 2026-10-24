import { prisma } from "../config/prisma.js";

export async function getSavedOutfits(req, res) {
  try {
    const outfits = await prisma.savedOutfit.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      outfits,
    });
  } catch (error) {
    console.error("Get saved outfits error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load saved outfits.",
    });
  }
}

export async function saveOutfit(req, res) {
  try {
    const data = req.body;

    if (!data || typeof data !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid outfit data.",
      });
    }

    const savedOutfit = await prisma.savedOutfit.create({
      data: {
        userId: req.userId,
        data,
      },
    });

    return res.status(201).json({
      success: true,
      outfit: savedOutfit,
    });
  } catch (error) {
    console.error("Save outfit error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save outfit.",
    });
  }
}

export async function deleteSavedOutfit(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.savedOutfit.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Saved outfit not found.",
      });
    }

    await prisma.savedOutfit.delete({
      where: {
        id: existing.id,
      },
    });

    return res.json({
      success: true,
      message: "Outfit deleted successfully.",
    });
  } catch (error) {
    console.error("Delete saved outfit error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete outfit.",
    });
  }
}