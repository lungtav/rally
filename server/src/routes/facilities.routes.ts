import { Router } from "express";
import {
  listFacilities,
  getFacility,
  createFacility,
  deleteFacility,
  updateFacility,
} from "../controllers/facilities.controllers.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const facilitiesRouter = Router();

facilitiesRouter.post("/", requireAdmin, createFacility);
facilitiesRouter.delete("/:id", requireAdmin, deleteFacility);
facilitiesRouter.put("/:id", requireAdmin, updateFacility);
facilitiesRouter.get("/", listFacilities);
facilitiesRouter.get("/:id", getFacility);

export { facilitiesRouter };
