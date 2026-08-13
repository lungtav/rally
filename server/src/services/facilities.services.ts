import { pool } from "../config/database.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidationError.js";
import type {
  PaginationQuery,
  CreateFacilityInput,
} from "../types/facilities.types.js";

const createFacility = async (input: CreateFacilityInput) => {
  const { name, type, description, opensAt, closesAt } = input;

  //add to db
  const facilityRow = await pool.query(
    `
    INSERT INTO facilities (name, type, description, opens_at, closes_at) 
    VALUES($1, $2, $3, $4, $5)
    RETURNING id, name, type, description, opens_at, closes_at`,
    [name, type, description, opensAt, closesAt],
  );

  const facility = facilityRow.rows[0];

  return { facility };
};

const listFacilities = async (input: PaginationQuery) => {
  const { page, limit } = input;

  if (!page || !limit) {
    throw new ValidationError("missing page or limit");
  }

  if (page <= 0 || limit <= 0) {
    throw new ValidationError("invalid page or limit");
  }

  const offset: number = (page - 1) * limit;

  const facilitiesRow = await pool.query(
    `
        SELECT * FROM facilities
        ORDER BY id
        LIMIT $1 OFFSET $2
        `,
    [limit, offset],
  );

  const facilities = facilitiesRow.rows[0];

  const totalFacilitiesResult = await pool.query(`
    SELECT COUNT(*) FROM facilities
    `);

  const totalFacilities = Number(totalFacilitiesResult.rows[0].count);

  if (!totalFacilities) {
    throw new NotFoundError("no facilities");
  }

  const totalPages = totalFacilities / limit;

  return { facilities, totalPages };
};

export { listFacilities, createFacility };
