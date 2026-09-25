import 'express';

declare global {
    namespace Express {
        interface User {
            id: string;
            email: string;
            name: string | null;
            image: string | null;
            roleId: string;
            role: string;       // role.key attached by passport strategy
            banned: boolean;
            isDeleted: boolean;
            createdAt: Date;
            updatedAt: Date;
        }
    }
}
