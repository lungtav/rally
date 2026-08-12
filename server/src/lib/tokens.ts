import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = 30;

const generateAccessToken = (userId: string, role: string) => {
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = () => {
  const refreshToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRY * 24 * 60 * 60 * 1000,
  );

  return { refreshToken, expiresAt };
};

export { generateAccessToken, generateRefreshToken };
