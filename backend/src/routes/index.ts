import { Router } from "express";
import { HTTPSTATUS } from "../config/http.config.js";
import requestRoutes from "./request.routes.js";
import technicianRoutes from "./technician.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import customerRoutes from "./customer.routes.js";
import seedRoutes from "./seed.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
    res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Atlas Industrial Services API is operational",
        timestamp: new Date().toISOString(),
    });
});

router.use("/requests", requestRoutes);
router.use("/technicians", technicianRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/customers", customerRoutes);
router.use("/seed", seedRoutes);
router.use("/auth", authRoutes);

export default router;
