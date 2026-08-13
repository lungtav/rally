import { Router } from "express";
import { changePassword, getMe } from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.get("/me", getMe)
userRouter.patch("/change-password", changePassword);

export { userRouter };
