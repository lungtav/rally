import Router from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authRouter } from "./auth.routes.js";
import { userRouter } from "./user.routes.js";

const appRouter = Router();

appRouter.use("/v1/auth", authRouter);
appRouter.use("/v1/user", authenticate, userRouter);

export { appRouter };
