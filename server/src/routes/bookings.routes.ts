import { Router } from "express";
import {
  createBooking,
  listMyBookings,
  getBooking,
  listAllBookings,
} from "../controllers/bookings.controllers.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const bookingsRouter = Router();

bookingsRouter.post("/", createBooking);
bookingsRouter.get("/me", listMyBookings);
bookingsRouter.get("/:id", getBooking);
bookingsRouter.get("/", requireAdmin, listAllBookings);

export { bookingsRouter };
