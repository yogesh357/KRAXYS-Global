import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { db } from '../db/index.js';
import { users, roles } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { Env } from './env.config.js';

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: Env.JWT_ACCESS_SECRET,
};

passport.use(
    new JwtStrategy(options, async (payload, done) => {
        try {
            const [result] = await db
                .select({
                    user: users,
                    role: roles,
                })
                .from(users)
                .innerJoin(roles, eq(users.roleId, roles.id))
                .where(eq(users.id, payload.userId))
                .limit(1);

            if (result) {
                return done(null, {
                    ...result.user,
                    role: result.role.key,
                });
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

export default passport;
