import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { createEmailVerification } from "./otp.service.js";
import { sendVerificationEmail } from "./email.service.js";

import {
  createAccessToken,
  createRefreshToken,
} from "../utils/jwt.js";

export async function registerUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    if (existingUser.emailVerified) {
      throw new Error("An account with this email already exists.");
    }

    // If the user exists but hasn't verified their email,
    // allow them to receive a fresh OTP.
    const otp = await createEmailVerification(existingUser.id);

    await sendVerificationEmail(existingUser.email, otp);

    return {
      userId: existingUser.id,
      email: existingUser.email,
      emailVerified: false,
      message: "A new verification code has been sent to your email.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      emailVerified: false,
    },
    
  });

  const otp = await createEmailVerification(user.id);

  await sendVerificationEmail(user.email, otp);

  return {
    userId: user.id,
    email: user.email,
    emailVerified: false,
    message: "Account created. A verification code has been sent to your email.",
  };
}
export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (!user.emailVerified) {
    throw new Error("Please verify your email before logging in.");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password.");
  }

  const accessToken = createAccessToken(user.id);
 const {
  token: refreshToken,
  tokenId: refreshTokenId,
} = createRefreshToken(user.id);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const refreshTokenExpiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );

  await prisma.refreshToken.create({
  data: {
    userId: user.id,
    tokenId: refreshTokenId,
    tokenHash: refreshTokenHash,
    expiresAt: refreshTokenExpiresAt,
  },
});

  return {
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    },
    accessToken,
    refreshToken,
  };
}
export async function refreshUserSession(refreshToken) {
  const { verifyRefreshToken, createAccessToken, createRefreshToken } =
    await import("../utils/jwt.js");

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new Error("Invalid or expired refresh token.");
  }

  if (payload.type !== "refresh" || !payload.userId) {
    throw new Error("Invalid refresh token.");
  }

  const storedTokens = await prisma.refreshToken.findMany({
    where: {
      userId: payload.userId,
      revokedAt: null,
    },
  });

  let matchingToken = null;

  for (const storedToken of storedTokens) {
    const matches = await bcrypt.compare(
      refreshToken,
      storedToken.tokenHash
    );

    if (matches) {
      matchingToken = storedToken;
      break;
    }
  }

  if (!matchingToken) {
    throw new Error("Invalid refresh token.");
  }

  if (matchingToken.expiresAt < new Date()) {
    await prisma.refreshToken.update({
      where: {
        id: matchingToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    throw new Error("Refresh token has expired.");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
    },
  });

  if (!user || !user.emailVerified) {
    throw new Error("User account is not available.");
  }

  // Rotate the refresh token.
  await prisma.refreshToken.update({
    where: {
      id: matchingToken.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  const accessToken = createAccessToken(user.id);
  const {
  token: newRefreshToken,
  tokenId: newRefreshTokenId,
} = createRefreshToken(user.id);

  const refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

  const refreshTokenExpiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );

  await prisma.refreshToken.create({
  data: {
    userId: user.id,
    tokenId: newRefreshTokenId,
    tokenHash: refreshTokenHash,
    expiresAt: refreshTokenExpiresAt,
  },
});

  return {
    user,
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logoutUser(refreshToken) {
  const { verifyRefreshToken } = await import("../utils/jwt.js");

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return;
  }

  if (payload.type !== "refresh" || !payload.userId) {
    return;
  }

  const storedTokens = await prisma.refreshToken.findMany({
    where: {
      userId: payload.userId,
      revokedAt: null,
    },
  });

  for (const storedToken of storedTokens) {
    const matches = await bcrypt.compare(
      refreshToken,
      storedToken.tokenHash
    );

    if (matches) {
      await prisma.refreshToken.update({
        where: {
          id: storedToken.id,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      break;
    }
  }
}