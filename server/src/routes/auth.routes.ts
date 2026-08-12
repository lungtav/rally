import { Router } from "express";
import {
  signup,
  verifyOtp,
  login,
  refresh,
  logout,
} from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);

export { authRouter };
