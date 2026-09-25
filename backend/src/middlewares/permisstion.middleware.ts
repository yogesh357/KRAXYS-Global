import { Request, Response, NextFunction } from 'express';
import { eq, and } from 'drizzle-orm';
import { ForbiddenException, UnauthorizedException } from '../utils/app-error.js';
import { asyncHandler } from '../config/asyncHandler.js';
import { ErrorCodeEnum } from '../utils/error-code.enum.js';
import { db } from '../db/index.js';
import { rolePermissions, users } from '../db/schema.js';

const STATIC_ROLES = {
    SUPER_ADMIN: 'super_admin',
    EMPLOYEE: 'employee',
    FARMER: 'farmer',
    PROVIDER: 'provider',
    DRIVER: 'driver',
} as const;

// requireAdmin — allows any authenticated user who holds the super_admin role.
export const requireAdmin = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedException('User not found', ErrorCodeEnum.ACCESS_UNAUTHORIZED);
        }

        if (req.user.role !== STATIC_ROLES.SUPER_ADMIN) {
            throw new ForbiddenException('Access denied', ErrorCodeEnum.ACCESS_DENIED);
        }

        return next();
    },
);

export const requireFarmer = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedException('User not found', ErrorCodeEnum.ACCESS_UNAUTHORIZED);
        }

        if (req.user.role !== STATIC_ROLES.FARMER) {
            throw new ForbiddenException('Access denied: Farmer role required', ErrorCodeEnum.ACCESS_DENIED);
        }

        return next();
    },
);

const MEMBER_ROLE_KEYS: string[] = [STATIC_ROLES.FARMER, STATIC_ROLES.PROVIDER, STATIC_ROLES.DRIVER];

// requireStaff — allows super_admin, employee, or any custom staff role created via 
export const requireStaff = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedException('User not found', ErrorCodeEnum.ACCESS_UNAUTHORIZED);
        }

        if (MEMBER_ROLE_KEYS.includes(req.user.role)) {
            throw new ForbiddenException('Access denied: Staff role required', ErrorCodeEnum.ACCESS_DENIED);
        }

        return next();
    },
);

// until provider auth is implemented.
export const requireProvider = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedException('User not found', ErrorCodeEnum.ACCESS_UNAUTHORIZED);
        }

        if (req.user.role !== STATIC_ROLES.PROVIDER) {
            throw new ForbiddenException('Access denied: Provider role required', ErrorCodeEnum.ACCESS_DENIED);
        }

        return next();
    },
);

export const requireDriver = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedException('User not found', ErrorCodeEnum.ACCESS_UNAUTHORIZED);
        }

        if (req.user.role !== STATIC_ROLES.DRIVER) {
            throw new ForbiddenException('Access denied: Driver role required', ErrorCodeEnum.ACCESS_DENIED);
        }

        return next();
    },
);

export const requireSuperAdmin = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedException('User not found', ErrorCodeEnum.ACCESS_UNAUTHORIZED);
        }

        if (req.user.role !== STATIC_ROLES.SUPER_ADMIN) {
            throw new ForbiddenException(
                'Access denied: SuperAdmin role required',
                ErrorCodeEnum.ACCESS_DENIED,
            );
        }

        return next();
    },
);

// checkPermission — granular module-level access control for employees.
// Usage: router.get('/', checkPermission('Bookings', 'view'), controller)
export const checkPermission = (module: string, action: 'view' | 'edit' | 'delete') =>
    asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedException('User not found', ErrorCodeEnum.ACCESS_UNAUTHORIZED);
        }

        // super_admin bypasses all permission checks
        if (req.user.role === STATIC_ROLES.SUPER_ADMIN) return next();

        const [userRow] = await db
            .select({ roleId: users.roleId })
            .from(users)
            .where(eq(users.id, req.user.id))
            .limit(1);

        if (!userRow) {
            throw new UnauthorizedException('User not found', ErrorCodeEnum.ACCESS_UNAUTHORIZED);
        }

        const [perm] = await db
            .select({ granted: rolePermissions.granted })
            .from(rolePermissions)
            .where(
                and(
                    eq(rolePermissions.roleId, userRow.roleId!),
                    eq(rolePermissions.module, module),
                    eq(rolePermissions.action, action),
                ),
            )
            .limit(1);

        if (!perm || !perm.granted) {
            throw new ForbiddenException(
                `Access denied: '${action}' permission on '${module}' is not granted`,
                ErrorCodeEnum.ACCESS_DENIED,
            );
        }

        return next();
    });
