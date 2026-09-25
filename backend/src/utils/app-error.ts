import { HTTPSTATUS, HttpStatusCode } from "../config/http.config.js";
import { ErrorCode } from "./error-code.enum.js";

export class AppError extends Error {
    public statusCode: HttpStatusCode;
    public errorCode?: string;

    constructor(message: string, statusCode: HttpStatusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode?: string) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundException extends AppError {
    constructor(message: string = "Resource not found", errorCode?: string) {
        super(message, HTTPSTATUS.NOT_FOUND, errorCode || ErrorCode.RESOURCE_NOT_FOUND);
    }
}

export class BadRequestException extends AppError {
    constructor(message: string = "Bad request", errorCode?: string) {
        super(message, HTTPSTATUS.BAD_REQUEST, errorCode || ErrorCode.VALIDATION_ERROR);
    }
}

export class UnauthorizedException extends AppError {
    constructor(message: string = "Unauthorized", errorCode?: string) {
        super(message, HTTPSTATUS.UNAUTHORIZED, errorCode || ErrorCode.AUTH_UNAUTHORIZED_ACCESS);
    }
}

export class ForbiddenException extends AppError {
    constructor(message: string = "Forbidden", errorCode?: string) {
        super(message, HTTPSTATUS.FORBIDDEN, errorCode || ErrorCode.AUTH_NOT_FOUND);
    }
}

export class InternalServerException extends AppError {
    constructor(message: string = "Internal server error", errorCode?: string) {
        super(message, HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode || ErrorCode.INTERNAL_SERVER_ERROR);
    }
}
