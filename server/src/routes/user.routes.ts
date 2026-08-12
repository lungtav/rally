import { Router } from "express";
import { changePassword } from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.patch("/change-password", changePassword);

export { userRouter };
