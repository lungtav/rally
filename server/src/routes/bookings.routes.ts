import { Router } from "express";
import {
  createBooking,
  listMyBookings,
  getBooking,
} from "../controllers/bookings.controllers.js";

const bookingsRouter = Router();

bookingsRouter.post("/", createBooking);
bookingsRouter.get("/me", listMyBookings);
bookingsRouter.get("/:id", getBooking);

export { bookingsRouter };
