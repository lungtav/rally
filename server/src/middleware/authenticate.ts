import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("invalid or missing header");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new UnauthorizedError("missing token");
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET_KEY);

    if (typeof payload === "string" || !payload.sub || !payload.role) {
      throw new UnauthorizedError("invalid token");
    }
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (error) {
    throw new UnauthorizedError("invalid or missing token");
  }
};
