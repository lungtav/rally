import { Router } from "express";
import { changePassword, getMe } from "../controllers/users.controllers.js";

const usersRouter = Router();

usersRouter.get("/me", getMe)
usersRouter.patch("/change-password", changePassword);

export { usersRouter };
