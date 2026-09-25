import { Router } from "express";
import { TechnicianController } from "../controllers/technician.controller.js";

const router = Router();

router.get("/", TechnicianController.getAll);
router.get("/:id", TechnicianController.getById);
router.get("/:id/jobs", TechnicianController.getJobs);

export default router;
