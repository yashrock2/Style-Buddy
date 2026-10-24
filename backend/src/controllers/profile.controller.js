import { prisma } from "../config/prisma.js";

export async function getProfile(req, res, next) {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        userId: req.userId,
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const {
      name,
      gender,
      bodyType,
      undertone,
      styles,
      occasions,
      onboardingCompleted,
    } = req.body;

    const profile = await prisma.profile.upsert({
      where: {
        userId: req.userId,
      },

      create: {
        userId: req.userId,
        name: name ?? null,
        gender: gender ?? null,
        bodyType: bodyType ?? null,
        undertone: undertone ?? null,
        styles: styles ?? null,
        occasions: occasions ?? null,
        onboardingCompleted: onboardingCompleted ?? false,
      },

      update: {
        ...(name !== undefined && { name }),
        ...(gender !== undefined && { gender }),
        ...(bodyType !== undefined && { bodyType }),
        ...(undertone !== undefined && { undertone }),
        ...(styles !== undefined && { styles }),
        ...(occasions !== undefined && { occasions }),
        ...(onboardingCompleted !== undefined && {
          onboardingCompleted,
        }),
      },
    });

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
}