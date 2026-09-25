import { Router } from "express";
import { RequestController } from "../controllers/request.controller.js";

const router = Router();

router.get("/", RequestController.getAll);
router.post("/", RequestController.create);
router.get("/:id", RequestController.getById);
router.patch("/:id", RequestController.update);
router.post("/:id/assign", RequestController.assignTechnician);
router.post("/:id/schedule", RequestController.scheduleVisit);
router.post("/:id/status", RequestController.updateStatus);
router.post("/:id/duplicate", RequestController.markDuplicate);
router.post("/:id/clarify", RequestController.requestClarification);

export default router;
