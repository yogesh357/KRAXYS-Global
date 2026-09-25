import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/coordinator", DashboardController.getCoordinator);
router.get("/manager", DashboardController.getManager);

export default router;
