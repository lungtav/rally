import { asyncHandler } from "../middleware/asyncHandler.js";
import type { Request, Response, NextFunction } from "express";
import {
  CreateBookingSchema,
  type CreateBookingInput,
} from "../types/bookings.types.js";
import { ValidationError } from "../errors/ValidationError.js";
import * as bookingsServices from "../services/bookings.services.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

const createBooking = asyncHandler(
  async (
    req: Request<{ id: string }, {}, CreateBookingInput>,
    res: Response,
  ) => {
    const id = req.user?.id;

    if (!id) {
      throw new UnauthorizedError("denied access");
    }
    const parsed = CreateBookingSchema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join(", ");
      throw new ValidationError(message);
    }

    const { booking, facility } = await bookingsServices.createBooking(
      parsed.data,
      id,
    );

    res.status(201).json({
      message: "booking created",
      booking,
      facility,
    });
  },
);

const listMyBookings = asyncHandler(
  async (
    req: Request<{ id: string }, {}, {}, { status: string }>,
    res: Response,
  ) => {
    const id = req.user?.id;

    if (!id) {
      throw new UnauthorizedError("access denied");
    }

    const status = req.query.status;

    if (status !== "upcoming" && status !== "history") {
      throw new ValidationError("invalid or missing status");
    }

    const bookings = await bookingsServices.listMyBookings(id, status);

    res.status(200).json({
      message: ` ${status} bookings fetched`,
      bookings,
    });
  },
);

export { createBooking, listMyBookings };
