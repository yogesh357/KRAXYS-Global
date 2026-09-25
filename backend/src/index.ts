import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import helmet from 'helmet';
import "dotenv/config";
import { ZodError } from 'zod';
import { HTTPSTATUS } from './config/http.config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        // Allow any localhost origin or standard dev origins
        if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
}));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Support both /api and /api/v1 prefixes
app.use("/api/v1", routes);
app.use("/api", routes);

app.use("/uploads", express.static(path.join(__dirname, '..', 'uploads')));

// Root endpoint
app.get("/", (_req, res) => {
    res.json({
        name: "Atlas Industrial Services Backend API",
        version: "1.0.0",
        status: "ONLINE",
        endpoints: {
            health: "/api/health",
            requests: "/api/requests",
            technicians: "/api/technicians",
            coordinatorDashboard: "/api/dashboard/coordinator",
            managerDashboard: "/api/dashboard/manager",
            seedReset: "POST /api/seed/reset",
        },
    });
});

// Global error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
        const message = err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') || "Validation error";
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            success: false,
            message,
            errorCode: "VALIDATION_ERROR",
            errors: err.issues,
        });
    }

    const statusCode = err.statusCode ?? HTTPSTATUS.INTERNAL_SERVER_ERROR;
    const errorCode = err.errorCode ?? "INTERNAL_SERVER_ERROR";

    console.error("API Error:", err);

    res.status(statusCode).json({
        success: false,
        message: err.message ?? "Internal Server Error",
        errorCode,
    });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Atlas Industrial Services API is running on http://localhost:${port}`);
});
