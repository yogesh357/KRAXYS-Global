import { drizzle } from 'drizzle-orm/node-postgres';
import { Env } from '../config/env.config.js';
import { Pool } from 'pg';

const isSsl = Env.DATABASE_URL.includes('sslmode=require') || Env.DATABASE_URL.includes('neon.tech');
const pool = new Pool({
    connectionString: Env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 60000,
    keepAlive: true,
    ssl: isSsl ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool);
