import { pool } from "../config/database.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import type { CreateBookingInput } from "../types/bookings.types.js";
import { ConflictError } from "../errors/ConflictError.js";
import { ValidationError } from "../errors/ValidationError.js";
import { type ListAllBookingsInput } from "../types/bookings.types.js";

const createBooking = async (input: CreateBookingInput, id: string) => {
  const { startTime, hours, facilityId } = input;
  const userId = id;
  //does facility exist
  const facilityRow = await pool.query(
    `
    SELECT name FROM facilities WHERE id=$1`,
    [facilityId],
  );

  const facility = facilityRow.rows[0];

  if (!facility) {
    throw new NotFoundError("facility doesn't exist");
  }

  //calculate end time
  const start = new Date(startTime);
  const endTime = new Date(start.getTime() + hours * 60 * 60 * 1000);

  if (start <= new Date()) {
    throw new ValidationError("booking start time must be in the future");
  }

  //check for conflicts
  const conflictResult = await pool.query(
    `
    SELECT start_time, end_time
    FROM bookings 
    WHERE facility_id =$1 
        AND start_time < $2
        AND end_time > $3 
    LIMIT 1
    `,
    [facilityId, endTime, start],
  );

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-NG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const conflict = conflictResult.rows[0];

  if (conflict) {
    const start = formatTime(conflict.start_time);
    const end = formatTime(conflict.end_time);

    throw new ConflictError(
      `facility is already booked from ${start} to ${end}`,
    );
  }

  //insert into db

  const bookingRow = await pool.query(
    `
    INSERT INTO bookings (start_time, end_time, facility_id, user_id) VALUES($1,$2,$3,$4)
    RETURNING *`,
    [start, endTime, facilityId, userId],
  );

  const booking = bookingRow.rows[0];

  return { booking, facility };
};

const listMyBookings = async (id: string, status: string) => {
  let query;
  if (status === "history") {
    query = `AND end_time <= NOW() ORDER BY start_time DESC;`;
  }

  if (status === "upcoming") {
    query = `AND start_time > NOW() ORDER BY start_time ASC;`;
  }

  const bookings = await pool.query(
    `SELECT f.name, b.start_time, b.end_time
    FROM bookings b
    LEFT JOIN facilities f
    ON f.id = b.facility_id
    WHERE b.user_id =$1
    ${query}
    `,
    [id],
  );

  return bookings.rows;
};

const getBooking = async (id: string) => {
  const bookingRow = await pool.query(
    `
    SELECT * FROM bookings
    WHERE id = $1`,
    [id],
  );

  const booking = bookingRow.rows[0];
  console.log(bookingRow);

  if (!booking) {
    throw new NotFoundError("booking doesn't exist ");
  }

  return booking;
};

const listAllBookings = async ({
  status,
  page,
  limit,
}: ListAllBookingsInput) => {
  const offset = (page - 1) * limit;

  const statusCondition =
    status === "upcoming"
      ? "WHERE b.start_time >= NOW()"
      : status === "history"
        ? "WHERE b.start_time < NOW()"
        : "";

  const bookingsResult = await pool.query(
    `SELECT b.id, b.start_time, b.end_time, b.created_at,
            b.facility_id, b.user_id,
            f.name AS facility_name, f.type AS facility_type,
            u.username, u.email
     FROM bookings b
     JOIN facilities f ON f.id = b.facility_id
     JOIN users u ON u.id = b.user_id
     ${statusCondition}
     ORDER BY b.start_time DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM bookings b ${statusCondition}`,
  );

  return {
    bookings: bookingsResult.rows,
    total: Number(countResult.rows[0].count),
  };
};

export { createBooking, listMyBookings, getBooking, listAllBookings };
