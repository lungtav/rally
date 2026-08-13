import { Router } from "express";
import {
  listFacilities,
  createFacility,
} from "../controllers/facilities.controllers.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const facilitiesRouter = Router();

facilitiesRouter.post("/", requireAdmin, createFacility);
facilitiesRouter.get("/", listFacilities);

export { facilitiesRouter };
