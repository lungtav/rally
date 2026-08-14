import { Router } from "express";
import { createBooking } from "../controllers/bookings.controllers.js";

const bookingsRouter = Router();

bookingsRouter.get("/", createBooking);

export { bookingsRouter };
