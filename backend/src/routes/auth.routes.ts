import { Router } from "express";
import {
    getProfileController,
    getAllUsersController,
} from "../controllers/auth.controller.js";

const router = Router();

router.get("/users", getAllUsersController);
router.get("/profile", getProfileController);

export default router;
