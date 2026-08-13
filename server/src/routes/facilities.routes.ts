import { Router } from "express";
import {
  listFacilities,
  createFacility,
  getFacility,
} from "../controllers/facilities.controllers.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const facilitiesRouter = Router();

facilitiesRouter.post("/", requireAdmin, createFacility);
facilitiesRouter.get("/", listFacilities);
facilitiesRouter.get("/:id", getFacility);

export { facilitiesRouter };
