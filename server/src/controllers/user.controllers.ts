import type { Request, Response } from "express";
import {
  ChangePasswordSchema,
  type ChangePasswordBody,
} from "../types/user.types.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ValidationError } from "../errors/ValidationError.js";
import * as userService from "../services/user.services.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

const changePassword = asyncHandler(
  async (req: Request<{}, {}, ChangePasswordBody>, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError("unauthorized");
    }
    const userId = req.user.id;
    const parsed = ChangePasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join(", ");
      throw new ValidationError(message);
    }

    const { currentPassword, newPassword } = parsed.data;

    await userService.changePassword({ userId, currentPassword, newPassword });

    res.status(200).json({ message: "password changed successfully" });
  },
);

export { changePassword };
