import { asyncHandler } from "../middleware/asyncHandler.js";
import type { Request, Response } from "express";
import type {
  FacilityInput,
  PaginationQuery,
} from "../types/facilities.types.js";
import * as facilitiesServices from "../services/facilities.services.js";
import { FacilitySchema } from "../types/facilities.types.js";
import { ValidationError } from "../errors/ValidationError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

const createFacility = asyncHandler(
  async (req: Request<{}, {}, FacilityInput>, res: Response) => {
    const parsed = FacilitySchema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join(", ");
      throw new ValidationError(message);
    }

    const { name, type, description, opensAt, closesAt } = parsed.data;

    const facility = await facilitiesServices.createFacility({
      name,
      type,
      description,
      opensAt,
      closesAt,
    });

    res.status(201).json({
      message: "facility created successfully",
      facility,
    });
  },
);

const deleteFacility = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    await facilitiesServices.deleteFacility(id);

    return res.status(200).json({
      message: "facility deleted successfully",
    });
  },
);

const updateFacility = asyncHandler(async (req: Request, res: Response) => {});

const getFacility = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const facility = await facilitiesServices.getFacility(id);

    return res.status(200).json({
      message: "facility fetched successfully",
      facility,
    });
  },
);

const listFacilities = asyncHandler(
  async (req: Request<{}, {}, {}, PaginationQuery>, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const { totalPages, facilities } = await facilitiesServices.listFacilities({
      page,
      limit,
    });
    res.status(200).json({
      message: "facilities fetched",
      page,
      totalPages,
      facilities,
    });
  },
);

export {
  listFacilities,
  createFacility,
  getFacility,
  deleteFacility,
  updateFacility,
};
