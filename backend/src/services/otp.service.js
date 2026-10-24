import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function createEmailVerification(userId) {
  const otp = generateOtp();

  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  // Remove any previous OTP for this user
  await prisma.emailVerification.deleteMany({
    where: {
      userId,
    },
  });

  await prisma.emailVerification.create({
    data: {
      userId,
      otpHash,
      expiresAt,
      attempts: 0,
    },
  });

  return otp;
}

export async function verifyEmailOtp(userId, otp) {
  const verification = await prisma.emailVerification.findFirst({
    where: {
      userId,
    },
  });

  if (!verification) {
    return {
      success: false,
      message: "No verification code found. Please request a new OTP.",
    };
  }

  if (verification.expiresAt < new Date()) {
    await prisma.emailVerification.delete({
      where: {
        id: verification.id,
      },
    });

    return {
      success: false,
      message: "OTP has expired. Please request a new one.",
    };
  }

  if (verification.attempts >= MAX_OTP_ATTEMPTS) {
    return {
      success: false,
      message: "Too many incorrect attempts. Please request a new OTP.",
    };
  }

  const isValid = await bcrypt.compare(otp, verification.otpHash);

  if (!isValid) {
    await prisma.emailVerification.update({
      where: {
        id: verification.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    return {
      success: false,
      message: "Invalid OTP.",
    };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerified: true,
      },
    }),

    prisma.emailVerification.delete({
      where: {
        id: verification.id,
      },
    }),
  ]);

  return {
    success: true,
    message: "Email verified successfully.",
  };
}