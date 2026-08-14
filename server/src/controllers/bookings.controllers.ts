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

const getBooking = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;

    const booking = await bookingsServices.getBooking(id);
    res.status(200).json({ message: "booking fetched successfully", booking });
  },
);

const listAllBookings = asyncHandler(
  async (
    req: Request<{}, {}, {}, { status?: string; page?: string; limit?: string }>,
    res: Response,
  ) => {
    const status = req.query.status;

    if (status !== undefined && status !== "upcoming" && status !== "history") {
      throw new ValidationError("invalid status filter");
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const { bookings, total } = await bookingsServices.listAllBookings({
      status,
      page,
      limit,
    });

    res.status(200).json({
      message: status ? `${status} bookings fetched` : "bookings fetched",
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  },
);

export { createBooking, listMyBookings, getBooking , listAllBookings};
