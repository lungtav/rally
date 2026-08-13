import type { Request, Response } from "express";
import {
  signUpRequestSchema,
  verifyOtpSchema,
  LoginRequestSchema,
  type SignUpRequestBody,
  type LoginRequestInput,
  type VerifyOtpRequestBody,
} from "../types/auth.types.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ValidationError } from "../errors/ValidationError.js";
import * as authService from "../services/auth.services.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

const signup = asyncHandler(
  async (req: Request<{}, {}, SignUpRequestBody, {}>, res) => {
    const parsed = signUpRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.message);
    }

    const { username, email, password } = parsed.data;

    const user = await authService.signup({ username, email, password });

    res.status(201).json({
      message: "user created succefully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  },
);

const verifyOtp = asyncHandler(
  async (req: Request<{}, {}, VerifyOtpRequestBody, {}>, res: Response) => {
    const parsed = verifyOtpSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.message);
    }

    const { email, otp } = parsed.data;
    const sessionInformation = req.get("user-agent") ?? "unknown";


    const { user, accessToken, refreshTokenExpiresAt, refreshToken } =
      await authService.verifyOtp({
        email,
        otp,
        sessionInformation,
      });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: refreshTokenExpiresAt,
    });

    res.status(200).json({
      message: "otp verified",
      accessToken,
      user,
    });
  },
);

const login = asyncHandler(
  async (req: Request<{}, {}, LoginRequestInput, {}>, res: Response) => {
    const parsed = LoginRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join(", ");
      throw new ValidationError(message);
    }

    const sessionInformation = req.get("user-agent") ?? "unknown";

    const { email, password } = parsed.data;

    const { user, accessToken, refreshTokenExpiresAt, refreshToken } =
      await authService.login({ email, password, sessionInformation });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: refreshTokenExpiresAt,
    });

    res.status(200).json({
      message: "login successful",
      accessToken,
      user,
    });
  },
);

const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new UnauthorizedError("refresh token required");
  }

  const { accessToken, newRefreshToken, refreshTokenExpiresAt } =
    await authService.refresh(refreshToken);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: refreshTokenExpiresAt,
  });

  res.status(201).json({
    message: "token refreshed successfully",
    accessToken,
  });
});

const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  await authService.logout(refreshToken);

  res.clearCookie("refreshToken");
  res.status(200).json({
    message: "logout successful",
  });
});

export { signup, verifyOtp, login, refresh, logout };
