import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;

export function createAccessToken(userId) {
  return jwt.sign(
    {
      userId,
      type: "access",
    },
    env.jwtAccessSecret,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
}

export function createRefreshToken(userId) {
  const tokenId = crypto.randomUUID();

  const token = jwt.sign(
    {
      userId,
      tokenId,
      type: "refresh",
    },
    env.jwtRefreshSecret,
    {
      expiresIn: "30d",
    }
  );

  return {
    token,
    tokenId,
  };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}