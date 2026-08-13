import type { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors/ForbiddenError.js";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const role = req.user?.role;

  if (role !== "admin") {
    throw new ForbiddenError("access denied");
  }

  next();
};
