import Router from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authRouter } from "./auth.routes.js";
import { usersRouter } from "./users.routes.js";
import { facilitiesRouter } from "./facilities.routes.js";
import { bookingsRouter } from "./bookings.routes.js";

const appRouter = Router();

appRouter.use("/auth", authRouter);
appRouter.use("/users", authenticate, usersRouter);
appRouter.use("/facilities", authenticate, facilitiesRouter);
appRouter.use("/bookings", authenticate, bookingsRouter);

export { appRouter };
