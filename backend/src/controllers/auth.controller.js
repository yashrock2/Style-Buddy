import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
} from "../services/auth.services.js";
import { verifyEmailOtp } from "../services/otp.service.js";
import { prisma } from "../config/prisma.js";

export async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email and password must be text values.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const result = await registerUser(email, password);

    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }

}
export async function verifyEmail(req, res, next) {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP are required.",
      });
    }

    if (typeof userId !== "string" || typeof otp !== "string") {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP must be text values.",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit code.",
      });
    }

    const result = await verifyEmailOtp(userId, otp);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email and password must be text values.",
      });
    }

    const result = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (
      error.message === "Invalid email or password." ||
      error.message === "Please verify your email before logging in."
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}
export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}
export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== "string") {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    const result = await refreshUserSession(refreshToken);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (
      error.message === "Invalid or expired refresh token." ||
      error.message === "Invalid refresh token." ||
      error.message === "Refresh token has expired." ||
      error.message === "User account is not available."
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}
export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken && typeof refreshToken === "string") {
      await logoutUser(refreshToken);
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
}