import { Router } from "express";
import { createBooking, listMyBookings } from "../controllers/bookings.controllers.js";

const bookingsRouter = Router();

bookingsRouter.post("/", createBooking);
bookingsRouter.get("/me", listMyBookings);

export { bookingsRouter };
